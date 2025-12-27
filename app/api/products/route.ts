import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be a non-negative integer'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be a non-negative integer'),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// GET - Fetch all products for a store
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and cashiers can view products
    if (!['admin', 'cashier'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const lowStock = url.searchParams.get('lowStock') === 'true';
    const outOfStock = url.searchParams.get('outOfStock') === 'true';

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Add store filter (users can only see products from their store)
    if (user.storeId) {
      where.storeId = user.storeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock) {
      where.stockQuantity = { lte: prisma.product.fields.lowStockThreshold };
    }

    if (outOfStock) {
      where.stockQuantity = 0;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items: products,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can create products
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can create products' },
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
    const validationResult = productSchema.safeParse(body);
    
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

    const productData = validationResult.data;

    // Check if barcode already exists (if provided)
    if (productData.barcode) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          barcode: productData.barcode,
          storeId: user.storeId,
          isActive: true,
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: 'A product with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        storeId: user.storeId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}