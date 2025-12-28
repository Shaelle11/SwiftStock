import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

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
    if (user.role !== 'admin') {
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