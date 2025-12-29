import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const guestOrderSchema = z.object({
  storeSlug: z.string().min(1, 'Store is required'),
  customerInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
});

// POST - Create guest order (no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = guestOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const { storeSlug, customerInfo, items, paymentMethod, notes } = validationResult.data;

    // Find the store
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true, name: true }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: 'Store not found'
      }, { status: 404 });
    }

    // Fetch all products to validate and calculate totals
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
        isActive: true,
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({
        success: false,
        message: 'Some products not found or not available'
      }, { status: 400 });
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product not found: ${item.productId}`
        }, { status: 400 });
      }
      
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        }, { status: 400 });
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const itemSubtotal = product.sellingPrice * item.quantity;
      subtotal += itemSubtotal;
      
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.sellingPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    // Calculate tax (7.5% VAT for Nigeria, you can make this configurable per store)
    const tax = subtotal * 0.075;
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        storeId: store.id,
        customerId: null, // Guest order
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update product stock quantities
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customerEmail: order.customerEmail,
        items: order.items
      }
    });

  } catch (error) {
    console.error('Guest checkout error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process order'
    }, { status: 500 });
  }
}