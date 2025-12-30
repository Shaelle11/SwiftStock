import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    console.log('Fetching public stores...');

    // Get public and active stores
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${stores.length} public stores`);

    return NextResponse.json({
      success: true,
      data: {
        stores
      }
    });

  } catch (error) {
    console.error('Error fetching public stores:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching stores'
      },
      { status: 500 }
    );
  }
}