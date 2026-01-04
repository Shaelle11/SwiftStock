import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a specific receipt/sale
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const saleId = id;
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');

    // Build the where clause for access control
    const whereClause: { id: string; storeId?: string | { in: string[] } } = {
      id: saleId
    };

    if (user.userType === 'business_owner') {
      // For business owners, check if they own the store
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

        whereClause.storeId = businessId;
      } else {
        // If no businessId provided, allow access to all owned stores
        const ownedStores = await prisma.store.findMany({
          where: { ownerId: user.id },
          select: { id: true }
        });

        whereClause.storeId = {
          in: ownedStores.map(store => store.id)
        };
      }
    } else {
      // For employees, use the user's assigned store
      if (!user.storeId) {
        return NextResponse.json(
          { success: false, message: 'User not associated with any store' },
          { status: 403 }
        );
      }
      whereClause.storeId = user.storeId;
    }

    const sale = await prisma.sale.findFirst({
      where: whereClause,
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
        },
        store: {
          select: {
            name: true,
            address: true,
            phone: true,
            email: true,
            logoUrl: true
          }
        }
      }
    });

    if (!sale) {
      return NextResponse.json(
        { success: false, message: 'Receipt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale
    });

  } catch (error: unknown) {
    console.error('Fetch receipt error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}