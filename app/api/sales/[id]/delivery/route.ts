import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const deliveryUpdateSchema = z.object({
  deliveryStatus: z.enum(['pending', 'in-transit', 'delivered', 'failed', 'out_for_delivery']),
  riderName: z.string().optional(),
  riderPhone: z.string().optional(),
  parcelNumber: z.string().optional(),
  deliveryNotes: z.string().optional(),
  deliveredAt: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== DELIVERY UPDATE API CALLED ===');
  try {
    const { user } = await verifyAuth(request);
    console.log('Auth result:', { user: user ? { id: user.id, storeId: user.storeId } : null });
    
    if (!user) {
      console.log('Delivery update: Unauthorized access attempt');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log('Delivery update request for sale ID:', id);
    console.log('Request body:', body);
    console.log('User:', { id: user.id, storeId: user.storeId });
    
    // Validate the request body
    const validatedData = deliveryUpdateSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Find the sale and verify it belongs to the user's business
    const sale = await prisma.sale.findFirst({
      where: {
        id,
        store: {
          OR: [
            { ownerId: user.id }, // User owns the store
            { id: user.storeId }, // User is employee at the store  
          ]
        }
      },
      include: {
        store: true
      }
    });

    if (!sale) {
      console.log('Sale not found or access denied. Sale ID:', id);
      return NextResponse.json({ 
        success: false, 
        message: 'Sale not found or access denied' 
      }, { status: 404 });
    }

    console.log('Found sale:', { id: sale.id, deliveryType: sale.deliveryType });

    // Verify this is a delivery order (case-insensitive)
    const normalizedDeliveryType = sale.deliveryType?.toLowerCase();
    if (normalizedDeliveryType !== 'delivery') {
      console.log('Not a delivery order. Delivery type:', sale.deliveryType);
      return NextResponse.json({ 
        success: false, 
        message: 'This is not a delivery order' 
      }, { status: 400 });
    }

    // Calculate delivery duration if delivered
    let deliveryDuration: number | null = null;
    if (validatedData.deliveryStatus === 'delivered') {
      const createdAt = new Date(sale.createdAt);
      const deliveredAt = validatedData.deliveredAt 
        ? new Date(validatedData.deliveredAt) 
        : new Date();
      
      deliveryDuration = Math.floor((deliveredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Update the sale with delivery information
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        deliveryStatus: validatedData.deliveryStatus,
        riderName: validatedData.riderName || null,
        riderPhone: validatedData.riderPhone || null,
        parcelNumber: validatedData.parcelNumber || null,
        deliveryNotes: validatedData.deliveryNotes || null,
        deliveredAt: validatedData.deliveredAt 
          ? new Date(validatedData.deliveredAt) 
          : (validatedData.deliveryStatus === 'delivered' ? new Date() : null),
        deliveryDuration: deliveryDuration,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery information updated successfully',
      data: updatedSale
    });

  } catch (error) {
    console.error('Delivery update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid data provided',
        errors: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update delivery information'
    }, { status: 500 });
  }
}