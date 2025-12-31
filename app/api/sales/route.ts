import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { calculateSubtotal, calculateVAT } from '@/lib/sales';

const saleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']),
  discount: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

// POST - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business owners and employees can make sales
    if (!['business_owner', 'employee'].includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!user.storeId) {
      return NextResponse.json(
        { success: false, message: 'User must be associated with a store' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = saleSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { items, paymentMethod, discount, notes, customerId } = validationResult.data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get all products and check availability
      const productIds = items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          storeId: user.storeId!,
          isActive: true
        }
      });

      if (products.length !== productIds.length) {
        throw new Error('Some products not found or inactive');
      }

      // Check stock availability and calculate totals
      const saleItems: Array<{
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

      // Validate stock and prepare sale items
      for (const item of items) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
        }

        saleItems.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.sellingPrice,
          quantity: item.quantity,
          subtotal: product.sellingPrice * item.quantity
        });
      }

      // Calculate totals
      const subtotal = calculateSubtotal(saleItems.map(item => ({
        price: item.unitPrice,
        quantity: item.quantity
      })));

      const discountAmount = (subtotal * discount) / 100;
      const discountedSubtotal = subtotal - discountAmount;
      const tax = calculateVAT(discountedSubtotal);
      const total = discountedSubtotal + tax;

      // Update stock quantities first
      const stockUpdates = items.map(item => 
        tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        })
      );

      // Wait for all stock updates to complete
      await Promise.all(stockUpdates);

      // Create the sale
      const sale = await tx.sale.create({
        data: {
          storeId: user.storeId!,
          cashierId: user.id,
          customerId: customerId || null,
          subtotal: discountedSubtotal,
          tax,
          discount: discountAmount,
          total,
          paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER',
          notes,
          // Tax-specific fields
          vatRate: 0.15, // 15% VAT rate
          vatAmount: tax,
          taxableAmount: discountedSubtotal,
          items: {
            create: saleItems
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

      return sale;
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 30000, // 30 seconds
    });

    return NextResponse.json({
      success: true,
      message: 'Sale completed successfully',
      data: result,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Create sale error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET - Fetch sales for a store
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business owners and employees can view sales
    if (!['business_owner', 'employee'].includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const cashierId = url.searchParams.get('cashierId');
    const paymentMethod = url.searchParams.get('paymentMethod');

    // Build where clause
    const where: Record<string, unknown> = {};

    // Add store filter
    if (user.storeId) {
      where.storeId = user.storeId;
    }

    // Date filters
    if (startDate || endDate) {
      where.createdAt = {} as Record<string, Date>;
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    if (cashierId) {
      where.cashierId = cashierId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod.toUpperCase();
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch sales with pagination
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          },
          cashier: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items: sales,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}