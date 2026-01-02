import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

interface DeployRequest {
  productIds: string[];
  isPublic: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const { productIds, isPublic }: DeployRequest = await request.json();

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one product must be selected for deployment' },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const storeId = resolvedParams.id;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found or access denied' },
        { status: 404 }
      );
    }

    // Verify all products belong to this user
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: storeId,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: 'Some products are not valid or do not belong to this store' },
        { status: 400 }
      );
    }

    // Update store with deployment settings
    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isPublic,
        isActive: true,
        deployedAt: new Date(),
      },
    });

    // Create or update store product relationships for deployed products
    // First, remove all existing store-product relationships for deployment
    await prisma.storeProduct.deleteMany({
      where: {
        storeId: storeId,
      },
    });

    // Then add the newly selected products
    const storeProductData = productIds.map(productId => ({
      storeId: storeId,
      productId: productId,
      isDeployed: true,
    }));

    await prisma.storeProduct.createMany({
      data: storeProductData,
    });

    return NextResponse.json({
      message: 'Store deployed successfully',
      store: {
        id: updatedStore.id,
        isPublic: updatedStore.isPublic,
        isActive: updatedStore.isActive,
        deployedAt: updatedStore.deployedAt,
        deployedProducts: products.length,
      },
    });

  } catch (error) {
    console.error('Store deployment error:', error);
    const resolvedParams = await params;
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      storeId: resolvedParams.id,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}