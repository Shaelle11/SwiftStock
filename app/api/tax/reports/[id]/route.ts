import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

// GET - Generate VAT report for a tax period
export async function GET(
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
    const periodId = resolvedParams.id;

    // Get tax period with all data needed for VAT report
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
            state: true,
            country: true,
          },
        },
        sales: {
          where: {
            items: {
              some: {
                taxCategory: 'VATABLE',
              },
            },
          },
          include: {
            items: {
              where: {
                taxCategory: 'VATABLE',
              },
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
          where: {
            vatAmount: {
              gt: 0,
            },
          },
          orderBy: {
            date: 'asc',
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

    if (taxPeriod.status !== 'CLOSED') {
      return NextResponse.json(
        { message: 'Tax period must be closed to generate VAT report' },
        { status: 400 }
      );
    }

    // Calculate all sales (including VAT exempt for total)
    const allSales = await prisma.sale.findMany({
      where: {
        taxPeriodId: periodId,
      },
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
    });

    let totalSalesGross = 0;
    let vatableSales = 0;
    let vatExemptSales = 0;
    let totalOutputVat = 0;

    // Process all sales for summary
    allSales.forEach(sale => {
      totalSalesGross += sale.grossAmount || sale.total;
      
      sale.items.forEach(item => {
        if (item.taxCategory === 'VATABLE') {
          vatableSales += (item.totalAmount || 0) - (item.vatAmount || 0); // Net amount
          totalOutputVat += item.vatAmount || 0;
        } else {
          vatExemptSales += item.totalAmount || 0;
        }
      });
    });

    // Calculate input VAT total
    const totalInputVat = taxPeriod.purchases.reduce((sum, purchase) => sum + (purchase.vatAmount || 0), 0);
    const vatPayable = totalOutputVat - totalInputVat;

    // Generate report reference
    const reportRef = `VAT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Format dates for Nigerian context
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    };

    // Build VAT report data
    const vatReport = {
      // Header Information
      business: {
        name: taxPeriod.store.name,
        address: taxPeriod.store.address,
        tin: taxPeriod.store.tin || 'Not Registered',
        cacNumber: taxPeriod.store.cacNumber || 'Not Registered',
        logoUrl: taxPeriod.store.logoUrl,
      },
      period: {
        startDate: formatDate(taxPeriod.startDate),
        endDate: formatDate(taxPeriod.endDate),
        status: taxPeriod.status,
      },
      reportInfo: {
        reference: reportRef,
        generatedOn: formatDate(new Date()),
        generatedAt: new Date().toLocaleTimeString('en-NG'),
      },
      
      // Sales Summary
      summary: {
        totalSalesGross: totalSalesGross,
        vatableSales: vatableSales,
        vatExemptSales: vatExemptSales,
        outputVat: totalOutputVat,
        inputVat: totalInputVat,
        vatPayable: vatPayable,
      },
      
      // Transaction Breakdown (VATable sales only)
      transactions: taxPeriod.sales.map(sale => ({
        date: formatDate(sale.createdAt),
        invoiceNumber: sale.invoiceNumber,
        vatableSales: sale.items.reduce((sum, item) => sum + ((item.totalAmount || 0) - (item.vatAmount || 0)), 0),
        vatAmount: sale.items.reduce((sum, item) => sum + (item.vatAmount || 0), 0),
        paymentMethod: sale.paymentMethod,
        items: sale.items.map(item => ({
          name: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatAmount: item.vatAmount,
        })),
      })),
      
      // Input VAT (Purchases)
      purchases: taxPeriod.purchases.map(purchase => ({
        date: formatDate(purchase.date),
        supplier: purchase.supplierName,
        supplierTin: purchase.supplierTin || 'Not Provided',
        invoiceNumber: purchase.invoiceNumber,
        netAmount: purchase.netAmount,
        vatAmount: purchase.vatAmount,
        grossAmount: purchase.grossAmount,
        description: purchase.description,
      })),
      
      // Compliance Notes
      compliance: {
        vatRate: '7.5%',
        periodLocked: true,
        disclaimer: 'This report is for tax preparation and record-keeping purposes only. It does not replace official tax filing or professional tax advice.',
      },
    };

    return NextResponse.json({
      vatReport,
      success: true,
    });

  } catch (error) {
    console.error('VAT report generation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}