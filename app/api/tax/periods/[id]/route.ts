import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

// POST - Close tax period (finalize calculations)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const periodId = params.id;

    // Get tax period and verify ownership
    const taxPeriod = await prisma.taxPeriod.findFirst({
      where: {
        id: periodId,
        store: {
          ownerId: userId,
        },
      },
      include: {
        store: true,
        sales: {
          include: {
            items: true,
          },
        },
        purchases: true,
      },
    });

    if (!taxPeriod) {
      return NextResponse.json(
        { message: 'Tax period not found or access denied' },
        { status: 404 }
      );
    }

    if (taxPeriod.status === 'CLOSED') {
      return NextResponse.json(
        { message: 'Tax period is already closed' },
        { status: 400 }
      );
    }

    // Calculate tax period summary
    let totalSales = 0;
    let vatableSales = 0;
    let outputVat = 0;

    // Process all sales in the period
    for (const sale of taxPeriod.sales) {
      totalSales += sale.grossAmount || sale.total;
      
      // Calculate VAT from sale items
      for (const item of sale.items) {
        if (item.taxCategory === 'VATABLE') {
          vatableSales += item.totalAmount || 0;
          outputVat += item.vatAmount || 0;
        }
      }
    }

    // Calculate input VAT from purchases
    let inputVat = 0;
    for (const purchase of taxPeriod.purchases) {
      inputVat += purchase.vatAmount || 0;
    }

    // Calculate VAT payable (Output VAT - Input VAT)
    const vatPayable = outputVat - inputVat;

    // Update tax period with calculated values and close it
    const updatedPeriod = await prisma.taxPeriod.update({
      where: { id: periodId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId,
        totalSales,
        vatableSales,
        outputVat,
        inputVat,
        vatPayable,
      },
    });

    // Create audit log for period closure
    await prisma.auditLog.create({
      data: {
        storeId: taxPeriod.storeId,
        entityType: 'TaxPeriod',
        entityId: periodId,
        action: 'CLOSE_PERIOD',
        oldValue: JSON.stringify({
          status: 'OPEN',
          totalSales: null,
          vatableSales: null,
          outputVat: null,
          inputVat: null,
          vatPayable: null,
        }),
        newValue: JSON.stringify({
          status: 'CLOSED',
          totalSales,
          vatableSales,
          outputVat,
          inputVat,
          vatPayable,
          closedAt: new Date(),
        }),
        performedBy: userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      message: 'Tax period closed successfully',
      period: {
        ...updatedPeriod,
        summary: {
          totalSales,
          vatableSales,
          outputVat,
          inputVat,
          vatPayable,
          salesCount: taxPeriod.sales.length,
          purchasesCount: taxPeriod.purchases.length,
        },
      },
    });

  } catch (error) {
    console.error('Tax period closure error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get specific tax period details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const periodId = params.id;

    // Get tax period with all related data
    const taxPeriod = await prisma.taxPeriod.findFirst({
      where: {
        id: periodId,
        store: {
          ownerId: userId,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            tin: true,
            cacNumber: true,
            vatRegistered: true,
            logoUrl: true,
            currency: true,
          },
        },
        sales: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        purchases: {
          orderBy: {
            date: 'asc',
          },
        },
        _count: {
          select: {
            sales: true,
            purchases: true,
          },
        },
      },
    });

    if (!taxPeriod) {
      return NextResponse.json(
        { message: 'Tax period not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      period: taxPeriod,
    });

  } catch (error) {
    console.error('Tax period fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}