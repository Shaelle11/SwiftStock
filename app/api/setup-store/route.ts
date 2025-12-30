import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user from auth
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: error || 'Authentication required'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, address, phone, email, primaryColor, logoUrl } = body;

    // Validate required fields
    if (!name || !address || !phone || !email) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: name, address, phone, email'
      }, { status: 400 });
    }

    // Check if user already owns a store
    const existingStore = await prisma.store.findFirst({
      where: { ownerId: user.id }
    });

    if (existingStore) {
      // Update the existing store instead of creating a new one
      const updatedStore = await prisma.store.update({
        where: { id: existingStore.id },
        data: {
          name,
          description: description || null,
          address,
          phone,
          email,
          primaryColor: primaryColor || '#3B82F6',
          logoUrl: logoUrl || null,
          slug: existingStore.slug, // Keep existing slug
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Store updated successfully',
        store: {
          id: updatedStore.id,
          name: updatedStore.name,
          slug: updatedStore.slug,
          description: updatedStore.description,
          address: updatedStore.address,
          phone: updatedStore.phone,
          email: updatedStore.email,
          primaryColor: updatedStore.primaryColor,
          logoUrl: updatedStore.logoUrl
        }
      });
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    // Create a new store
    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        address,
        phone,
        email,
        primaryColor: primaryColor || '#3B82F6',
        logoUrl: logoUrl || null,
        slug,
        ownerId: user.id,
        isActive: true
      },
    });

    // Update the user with the new store ID if they don't have one
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (currentUser && !currentUser.storeId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { storeId: store.id }
      });
    }

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
        primaryColor: store.primaryColor,
        logoUrl: store.logoUrl
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