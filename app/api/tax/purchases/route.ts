import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

// GET - List purchases for input VAT tracking
export async function GET(request: NextRequest) {
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
    } catch {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const taxPeriodId = searchParams.get('taxPeriodId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!storeId) {
      return NextResponse.json(
        { message: 'Store ID is required' },
        { status: 400 }
      );
    }

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

    // Build query conditions
    const whereConditions: {
      storeId: string;
      taxPeriodId?: string;
    } = {
      storeId: storeId,
    };

    if (taxPeriodId) {
      whereConditions.taxPeriodId = taxPeriodId;
    }

    // Get purchases with pagination
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: whereConditions,
        include: {
          taxPeriod: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchase.count({
        where: whereConditions,
      }),
    ]);

    // Calculate totals
    const totals = await prisma.purchase.aggregate({
      where: whereConditions,
      _sum: {
        grossAmount: true,
        vatAmount: true,
        netAmount: true,
      },
    });

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totals: {
        grossAmount: totals._sum.grossAmount || 0,
        vatAmount: totals._sum.vatAmount || 0,
        netAmount: totals._sum.netAmount || 0,
      },
    });

  } catch (error) {
    console.error('Purchases fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Record new purchase for input VAT
export async function POST(request: NextRequest) {
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
    } catch {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const {
      storeId,
      supplierName,
      supplierTin,
      invoiceNumber,
      date,
      grossAmount,
      vatAmount,
      netAmount,
      description,
      paymentMethod,
    } = await request.json();

    // Validate required fields
    if (!storeId || !supplierName || !invoiceNumber || !date || !grossAmount) {
      return NextResponse.json(
        { message: 'Missing required fields: storeId, supplierName, invoiceNumber, date, grossAmount' },
        { status: 400 }
      );
    }

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

    // Calculate VAT if not provided (assume 7.5% VAT rate if applicable)
    let calculatedVatAmount = vatAmount;
    let calculatedNetAmount = netAmount;

    if (!calculatedVatAmount && !calculatedNetAmount) {
      // If only gross amount provided, calculate VAT (assuming VAT-inclusive amount)
      calculatedVatAmount = (grossAmount * 7.5) / 107.5; // VAT portion of inclusive amount
      calculatedNetAmount = grossAmount - calculatedVatAmount;
    } else if (!calculatedNetAmount) {
      calculatedNetAmount = grossAmount - calculatedVatAmount;
    } else if (!calculatedVatAmount) {
      calculatedVatAmount = grossAmount - calculatedNetAmount;
    }

    // Find current open tax period for this purchase date
    const purchaseDate = new Date(date);
    const taxPeriod = await prisma.taxPeriod.findFirst({
      where: {
        storeId: storeId,
        status: 'OPEN',
        startDate: { lte: purchaseDate },
        endDate: { gte: purchaseDate },
      },
    });

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        storeId,
        supplierName,
        supplierTin,
        invoiceNumber,
        date: purchaseDate,
        grossAmount,
        vatAmount: calculatedVatAmount,
        netAmount: calculatedNetAmount,
        description,
        paymentMethod: paymentMethod || 'Transfer',
        taxPeriodId: taxPeriod?.id,
        recordedBy: userId,
      },
      include: {
        taxPeriod: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        storeId,
        entityType: 'Purchase',
        entityId: purchase.id,
        action: 'CREATE',
        newValue: JSON.stringify({
          supplierName,
          invoiceNumber,
          date,
          grossAmount,
          vatAmount: calculatedVatAmount,
          netAmount: calculatedNetAmount,
        }),
        performedBy: userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      message: 'Purchase recorded successfully',
      purchase,
      taxPeriodAssigned: !!taxPeriod,
    });

  } catch (err) {
    console.error('Purchase recording error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}