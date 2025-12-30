import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

// Schema for checkout with account creation
const checkoutWithAccountSchema = z.object({
  storeSlug: z.string().min(1, 'Store is required'),
  
  // Order details
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().optional(),
  
  // Customer info (used for both order and account creation)
  customerInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().optional(),
  }),
  
  // Account creation (optional)
  createAccount: z.boolean().default(false),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// POST - Checkout with optional account creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = checkoutWithAccountSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const { storeSlug, customerInfo, items, paymentMethod, notes, createAccount, password } = validationResult.data;

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

    let customerId: string | null = null;

    // Create account if requested
    if (createAccount && password) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: customerInfo.email }
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'An account with this email already exists'
        }, { status: 409 });
      }

      // Create the customer account
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email: customerInfo.email,
          password: hashedPassword,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          storeId: null, // Global customer account
        }
      });

      customerId = user.id;
    }

    // Fetch products for validation and pricing
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
      if (!product || product.stockQuantity < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for ${product?.name || 'product'}`
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

    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        storeId: store.id,
        customerId, // Will be null for guest orders
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
      message: createAccount 
        ? 'Order placed and account created successfully!' 
        : 'Order placed successfully!',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        customerEmail: order.customerEmail,
        items: order.items
      },
      accountCreated: createAccount
    });

  } catch (error) {
    console.error('Checkout with account error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process order'
    }, { status: 500 });
  }
}