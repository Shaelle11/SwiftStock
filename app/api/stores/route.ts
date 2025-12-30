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

    // Check if this is a request for owned stores
    const url = new URL(request.url);
    const isOwnerRequest = url.searchParams.get('owner') === 'true';

    if (isOwnerRequest) {
      // Get stores owned by the current user
      const stores = await prisma.store.findMany({
        where: { 
          ownerId: user.id 
        },
        include: {
          _count: {
            select: {
              products: true,
              sales: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        stores: stores
      });
    } else {
      // Get all public stores
      const stores = await prisma.store.findMany({
        where: { 
          isActive: true 
        },
        include: {
          _count: {
            select: {
              products: true,
              sales: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        stores: stores
      });
    }

  } catch (error) {
    console.error('Store fetch error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch stores',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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

    // Only admins can create stores
    if (user.userType !== 'business_owner') {
      return NextResponse.json(
        { success: false, message: 'Only admins can create stores' },
        { status: 403 }
      );
    }

    // Check if user already has a store
    if (user.storeId) {
      const existingStore = await prisma.store.findUnique({
        where: { id: user.storeId }
      });
      
      if (existingStore) {
        return NextResponse.json({
          success: false,
          message: 'User already has a store',
          store: existingStore
        }, { status: 400 });
      }
    }

    // Get store data from request
    const body = await request.json();
    const {
      name = `${user.firstName}'s Store`,
      description = 'My SwiftStock store',
      address = '123 Business Street, City',
      phone = '+234-000-000-0000',
      email = user.email,
      slug = `${user.firstName.toLowerCase()}-store-${Date.now()}`
    } = body;

    // Create the store
    const store = await prisma.store.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        slug,
        ownerId: user.id,
      },
    });

    // Update the user with the store ID
    await prisma.user.update({
      where: { id: user.id },
      data: { storeId: store.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        phone: store.phone,
        email: store.email,
      }
    });

  } catch (error) {
    console.error('Store creation error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create store',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}