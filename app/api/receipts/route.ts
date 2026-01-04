import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch receipts for a store
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.storeId) {
      return NextResponse.json(
        { success: false, message: 'User must be associated with a store' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get all sales (which include receipt information) for this store
    const sales = await prisma.sale.findMany({
      where: {
        storeId: user.storeId,
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const totalCount = await prisma.sale.count({
      where: {
        storeId: user.storeId
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        receipts: sales,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('Fetch receipts error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}