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
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this product
    if (user.role !== 'admin' && user.storeId !== product.storeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this product' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update products
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can update products' },
        { status: 403 }
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
    const { id } = await params;

    // Check if product exists and user has access
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (user.storeId !== existingProduct.storeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this product' },
        { status: 403 }
      );
    }

    // Check if barcode conflicts with other products (if barcode is being changed)
    if (productData.barcode && productData.barcode !== existingProduct.barcode) {
      const barcodeConflict = await prisma.product.findFirst({
        where: {
          barcode: productData.barcode,
          storeId: user.storeId!,
          id: { not: id },
          isActive: true,
        },
      });

      if (barcodeConflict) {
        return NextResponse.json(
          { success: false, message: 'A product with this barcode already exists' },
          { status: 400 }
        );
      }
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: productData,
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete products
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only admins can delete products' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if product exists and user has access
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (user.storeId !== existingProduct.storeId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to this product' },
        { status: 403 }
      );
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}