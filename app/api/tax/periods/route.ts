import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

// GET - List tax periods for a store
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
    } catch (error) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

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

    // Get tax periods with summary data
    const taxPeriods = await prisma.taxPeriod.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        _count: {
          select: {
            sales: true,
            purchases: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({
      periods: taxPeriods,
    });

  } catch (error) {
    console.error('Tax periods fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new tax period
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
    } catch (error) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const { storeId, startDate, endDate } = await request.json();

    if (!storeId || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Store ID, start date, and end date are required' },
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

    // Check for overlapping periods
    const overlappingPeriod = await prisma.taxPeriod.findFirst({
      where: {
        storeId: storeId,
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } },
            ],
          },
        ],
      },
    });

    if (overlappingPeriod) {
      return NextResponse.json(
        { message: 'Tax period overlaps with existing period' },
        { status: 400 }
      );
    }

    // Create new tax period
    const taxPeriod = await prisma.taxPeriod.create({
      data: {
        storeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'OPEN',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        storeId,
        entityType: 'TaxPeriod',
        entityId: taxPeriod.id,
        action: 'CREATE',
        newValue: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
          status: 'OPEN',
        }),
        performedBy: userId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      message: 'Tax period created successfully',
      period: taxPeriod,
    });

  } catch (error) {
    console.error('Tax period creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}