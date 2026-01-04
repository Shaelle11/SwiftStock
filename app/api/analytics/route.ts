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

    // Only business owners and employees can view analytics
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

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get total revenue and sales count for the period
    const salesData = await prisma.sale.aggregate({
      where: {
        storeId: user.storeId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    const totalRevenue = salesData._sum.total || 0;
    const totalSales = salesData._count.id || 0;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Get top products by quantity sold
    const topProductsData = await prisma.saleItem.groupBy({
      by: ['productName'],
      where: {
        sale: {
          storeId: user.storeId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProducts = topProductsData.map(item => ({
      name: item.productName,
      totalSold: item._sum.quantity || 0,
      revenue: item._sum.subtotal || 0
    }));

    // Get sales trend (daily breakdown)
    const salesTrendData = await prisma.$queryRaw<Array<{
      date: Date;
      sales: bigint;
      revenue: number;
    }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as sales,
        COALESCE(SUM("total"), 0) as revenue
      FROM "sales" 
      WHERE "storeId" = ${user.storeId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Convert BigInt to number and format the sales trend
    const salesTrend = salesTrendData.map(item => ({
      date: item.date.toISOString().split('T')[0],
      sales: Number(item.sales),
      revenue: Number(item.revenue)
    }));

    // Fill in missing dates with zero values
    const filledSalesTrend = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const existingData = salesTrend.find(item => item.date === dateString);
      filledSalesTrend.push({
        date: dateString,
        sales: existingData?.sales || 0,
        revenue: existingData?.revenue || 0
      });
    }

    const analyticsData = {
      totalRevenue,
      totalSales,
      averageOrderValue,
      topProducts,
      salesTrend: filledSalesTrend
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });

  } catch (error: unknown) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}