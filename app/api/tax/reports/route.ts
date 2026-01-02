import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuth } from '@/lib/auth';
import { 
  getTaxRecords, 
  generateTaxCSV, 
  getTaxSummary, 
  generateMonthlySummary,
  getTaxDashboardStats,
  getStoreTaxSettings 
} from '@/lib/tax';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business owners and employees can access tax reports
    if (!['business_owner', 'employee'].includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const storeId = searchParams.get('storeId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format'); // 'json' | 'csv'

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // Verify user has access to this store
    if (user.storeId && user.storeId !== storeId) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this store' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'dashboard-stats':
        const stats = await getTaxDashboardStats(storeId);
        return NextResponse.json(stats);

      case 'summary':
        if (!period) {
          return NextResponse.json({ error: 'Period is required for summary' }, { status: 400 });
        }
        const summary = await getTaxSummary(storeId, period);
        return NextResponse.json(summary);

      case 'records':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
        }
        
        const records = await getTaxRecords(
          storeId,
          new Date(startDate),
          new Date(endDate)
        );

        if (format === 'csv') {
          // Transform records to match expected CSV format
          const csvData = records.map(record => ({
            createdAt: record.createdAt,
            transactionType: record.transactionType,
            saleId: record.saleId || undefined,
            orderId: record.orderId || undefined,
            taxableAmount: record.taxableAmount,
            vatRate: record.vatRate,
            vatCollected: record.vatCollected,
            totalAmount: record.totalAmount,
            paymentMethod: record.paymentMethod
          }));
          const csv = generateTaxCSV(csvData);
          return new NextResponse(csv, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="tax-records-${startDate}-to-${endDate}.csv"`,
            },
          });
        }

        return NextResponse.json(records);

      case 'settings':
        const settings = await getStoreTaxSettings(storeId);
        return NextResponse.json(settings);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tax reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only business owners and employees can modify tax settings
    if (!['business_owner', 'employee'].includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'generate-summary':
        const { storeId, year, month } = body;
        if (!storeId || !year || !month) {
          return NextResponse.json(
            { error: 'Store ID, year, and month are required' },
            { status: 400 }
          );
        }

        // Verify user has access to this store
        if (user.storeId && user.storeId !== storeId) {
          return NextResponse.json(
            { success: false, message: 'Access denied to this store' },
            { status: 403 }
          );
        }

        const summary = await generateMonthlySummary(storeId, year, month);
        return NextResponse.json(summary);

      case 'update-settings':
        const { storeId: settingsStoreId, ...settings } = body;
        if (!settingsStoreId) {
          return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
        }

        // Verify user has access to this store
        if (user.storeId && user.storeId !== settingsStoreId) {
          return NextResponse.json(
            { success: false, message: 'Access denied to this store' },
            { status: 403 }
          );
        }

        const updatedSettings = await prisma.storeSettings.upsert({
          where: { storeId: settingsStoreId },
          update: settings,
          create: {
            storeId: settingsStoreId,
            ...settings,
          },
        });

        return NextResponse.json(updatedSettings);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tax reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to process tax request' },
      { status: 500 }
    );
  }
}