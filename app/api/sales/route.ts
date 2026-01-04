import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { calculateSubtotal, calculateVAT } from '@/lib/sales';

const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  deliveryType: z.enum(['WALK_IN', 'DELIVERY', 'PICKUP']).default('WALK_IN'),
  deliveryAddress: z.string().optional(),
  deliveryPrice: z.number().min(0).default(0),
  deliveryStatus: z.enum(['PENDING', 'ASSIGNED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED']).optional(),
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
    console.log('Sales API called');
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      console.log('Authentication failed:', error);
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', { 
      id: user.id, 
      userType: user.userType, 
      storeId: user.storeId 
    });

    // Only business owners and employees can make sales
    if (!['business_owner', 'employee'].includes(user.userType)) {
      console.log('Insufficient permissions for user type:', user.userType);
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!user.storeId) {
      console.log('User storeId check failed:', { 
        userId: user.id, 
        userType: user.userType, 
        storeId: user.storeId,
        ownedStores: user.ownedStores?.map(s => s.id)
      });
      return NextResponse.json(
        { success: false, message: 'User must be associated with a store' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Request body received:', body);
    
    // Validate input
    const validationResult = saleSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        },
        { status: 400 }
      );
    }

    console.log('Validation passed, processing sale...');
    const { items, paymentMethod, discount, notes, customerId, customerName, customerPhone, customerAddress, deliveryType, deliveryAddress, deliveryPrice, deliveryStatus } = validationResult.data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting transaction...');
      // Get all products and check availability
      const productIds = items.map(item => item.productId);
      console.log('Product IDs:', productIds);
      
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          storeId: user.storeId!,
          isActive: true
        }
      });

      console.log('Found products:', products.length);

      if (products.length !== productIds.length) {
        console.log('Product count mismatch:', { expected: productIds.length, found: products.length });
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
        const product = products.find((p: { id: string; sellingPrice: number; stockQuantity: number; name: string }) => p.id === item.productId);
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
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerAddress: customerAddress || null,
          deliveryType: deliveryType,
          deliveryAddress: deliveryAddress || null,
          deliveryPrice: deliveryPrice || 0,
          deliveryStatus: deliveryStatus || null,
          invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subtotal: discountedSubtotal,
          tax,
          discount: discountAmount,
          total: total + (deliveryPrice || 0), // Add delivery price to total
          paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER',
          notes,
          // Tax-specific fields - vatRate handled separately
          vatAmount: tax,
          grossAmount: total + (deliveryPrice || 0),
          netAmount: discountedSubtotal,
          items: {
            create: saleItems.map(item => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
              taxCategory: 'VATABLE' as const,
              vatRate: 7.5,
              vatAmount: (item.subtotal * 7.5) / 107.5,
              totalAmount: item.subtotal
            }))
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

      // Create tax record for compliance tracking
      const now = new Date();
      const taxPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      await tx.taxRecord.create({
        data: {
          storeId: user.storeId!,
          saleId: sale.id,
          taxableAmount: discountedSubtotal,
          vatRate: 7.5,
          vatCollected: tax,
          totalAmount: total,
          transactionType: 'SALE',
          paymentMethod: paymentMethod.toUpperCase(),
          taxPeriod,
          taxYear: now.getFullYear(),
          taxMonth: now.getMonth() + 1
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
    const businessId = url.searchParams.get('businessId');

    // Build where clause
    const where: Record<string, unknown> = {};

    // Add store filter based on user type
    if (user.userType === 'business_owner') {
      if (businessId) {
        // If businessId is provided, verify ownership
        const ownedStore = await prisma.store.findFirst({
          where: {
            id: businessId,
            ownerId: user.id
          }
        });

        if (!ownedStore) {
          return NextResponse.json(
            { success: false, message: 'Store not found or access denied' },
            { status: 404 }
          );
        }

        where.storeId = businessId;
      } else {
        // If no businessId provided, allow access to all owned stores
        const ownedStores = await prisma.store.findMany({
          where: { ownerId: user.id },
          select: { id: true }
        });

        where.storeId = {
          in: ownedStores.map(store => store.id)
        };
      }
    } else {
      // For employees, use the user's assigned store
      if (user.storeId) {
        where.storeId = user.storeId;
      }
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