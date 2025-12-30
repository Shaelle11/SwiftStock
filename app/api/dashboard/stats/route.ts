import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business owners and employees can view dashboard stats
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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's sales total
    const todaysSalesResult = await prisma.sale.aggregate({
      where: {
        storeId: user.storeId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        total: true
      }
    });

    const todaysSales = todaysSalesResult._sum.total || 0;

    // Get total products count
    const totalProducts = await prisma.product.count({
      where: {
        storeId: user.storeId,
        isActive: true
      }
    });

    // Get low stock products count (products where stock is less than or equal to their low stock threshold, but greater than 0)
    const lowStockProducts = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count 
      FROM "products" 
      WHERE "storeId" = ${user.storeId} 
        AND "isActive" = true 
        AND "stockQuantity" > 0 
        AND "stockQuantity" <= "lowStockThreshold"
    `;

    const lowStockCount = Number(lowStockProducts[0].count);

    // Get out of stock products count
    const outOfStockProducts = await prisma.product.count({
      where: {
        storeId: user.storeId,
        isActive: true,
        stockQuantity: 0
      }
    });

    // Get recent sales (last 10)
    const recentSales = await prisma.sale.findMany({
      where: {
        storeId: user.storeId
      },
      include: {
        items: {
          select: {
            productName: true,
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const dashboardStats = {
      todaysSales,
      totalProducts,
      lowStockProducts: lowStockCount,
      outOfStockProducts,
      recentSales: recentSales.map(sale => ({
        id: sale.id,
        total: sale.total,
        createdAt: sale.createdAt.toISOString(),
        items: sale.items
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    });

  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}