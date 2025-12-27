import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch all categories for a store
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Add store filter if user is not admin
    if (user.storeId) {
      where.storeId = user.storeId;
    }

    // Get unique categories
    const products = await prisma.product.findMany({
      where,
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    const categories = products.map((p: any) => p.category);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}