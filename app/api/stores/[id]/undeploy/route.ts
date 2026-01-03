import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

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

    // Update store to make it inactive and not public
    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isPublic: false,
        isActive: false,
        deployedAt: null,
      },
    });

    // Remove all store-product deployment relationships
    await prisma.storeProduct.deleteMany({
      where: {
        storeId: storeId,
      },
    });

    return NextResponse.json({
      message: 'Store successfully removed from deployment',
      store: {
        id: updatedStore.id,
        isPublic: updatedStore.isPublic,
        isActive: updatedStore.isActive,
        deployedAt: updatedStore.deployedAt,
      },
    });

  } catch (error) {
    console.error('Store undeploy error:', error);
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