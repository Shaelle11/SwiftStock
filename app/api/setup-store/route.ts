import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  try {
    // Find the user without a store (should be the existing admin user)
    const userWithoutStore = await prisma.user.findFirst({
      where: {
        storeId: null,
        role: 'ADMIN'
      }
    });

    if (!userWithoutStore) {
      return NextResponse.json({
        success: false,
        message: 'No admin user without a store found'
      }, { status: 404 });
    }

    // Check if a store already exists for this user as owner
    const existingStore = await prisma.store.findFirst({
      where: { ownerId: userWithoutStore.id }
    });

    if (existingStore) {
      // Just update the user with the existing store ID
      await prisma.user.update({
        where: { id: userWithoutStore.id },
        data: { storeId: existingStore.id }
      });

      return NextResponse.json({
        success: true,
        message: 'User associated with existing store',
        store: existingStore,
        user: {
          id: userWithoutStore.id,
          email: userWithoutStore.email,
          firstName: userWithoutStore.firstName,
          lastName: userWithoutStore.lastName
        }
      });
    }

    // Create a new store for the user
    const store = await prisma.store.create({
      data: {
        name: `${userWithoutStore.firstName}'s SwiftStock Store`,
        description: 'SwiftStock inventory management store',
        address: '123 Business Avenue, City',
        phone: '+234-123-456-7890',
        email: userWithoutStore.email,
        slug: `${userWithoutStore.firstName.toLowerCase()}-store-${Date.now()}`,
        ownerId: userWithoutStore.id,
      },
    });

    // Update the user with the new store ID
    await prisma.user.update({
      where: { id: userWithoutStore.id },
      data: { storeId: store.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Store created and user associated successfully',
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        phone: store.phone,
        email: store.email,
      },
      user: {
        id: userWithoutStore.id,
        email: userWithoutStore.email,
        firstName: userWithoutStore.firstName,
        lastName: userWithoutStore.lastName
      }
    });

  } catch (error) {
    console.error('Setup store error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to setup store',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}