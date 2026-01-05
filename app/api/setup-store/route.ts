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
    const { 
      name, 
      description, 
      businessType,
      address,
      country,
      state, 
      city,
      phone, 
      email, 
      primaryColor, 
      logoUrl,
      slug,
      registrationStatus,
      cacNumber,
      tinNumber,
      businessRegNumber,
      businessLicense,
      vatRegistered,
      chargeVat,
      vatRate,
      taxIdNumber,
      autoCalculateTax,
      inventoryType,
      trackQuantities,
      currency,
      enableLowStockAlerts,
      allowGuestCheckout
    } = body;

    // Validate required fields
    if (!name || !address || !phone || !email || !slug || !state || !city) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: name, address, phone, email, slug, state, city'
      }, { status: 400 });
    }

    // Check if user already owns a store
    const existingStore = await prisma.store.findFirst({
      where: { ownerId: user.id }
    });

    if (existingStore) {
      // Update the existing store with all new fields
      const updatedStore = await prisma.store.update({
        where: { id: existingStore.id },
        data: {
          name,
          description: description || null,
          address,
          country: country || 'Nigeria',
          state,
          phone,
          email,
          primaryColor: primaryColor || '#3B82F6',
          logoUrl: logoUrl || null,
          slug: slug || existingStore.slug,
          cacNumber: cacNumber || null,
          tin: tinNumber || null,
          vatRegistered: vatRegistered || false,
          currency: currency || 'NGN',
          isActive: true
        }
      });

      // Update or create store settings
      await prisma.storeSettings.upsert({
        where: { storeId: existingStore.id },
        update: {
          vatEnabled: chargeVat || false,
          vatRate: (vatRegistered && vatRate) ? vatRate / 100 : 0.075, // Convert percentage to decimal
          taxIdNumber: taxIdNumber || null,
          businessRegNumber: businessRegNumber || null,
          businessType: businessType || null,
        },
        create: {
          storeId: existingStore.id,
          vatEnabled: chargeVat || false,
          vatRate: (vatRegistered && vatRate) ? vatRate / 100 : 0.075,
          taxIdNumber: taxIdNumber || null,
          businessRegNumber: businessRegNumber || null,
          businessType: businessType || null,
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
          logoUrl: updatedStore.logoUrl,
          vatRegistered: updatedStore.vatRegistered,
          cacNumber: updatedStore.cacNumber,
          tin: updatedStore.tin,
          state: updatedStore.state,
          country: updatedStore.country
        }
      });
    }

    // Generate unique slug for new store
    let storeSlug = slug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await prisma.store.findUnique({ where: { slug: storeSlug } })) {
      storeSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create a new store with all comprehensive fields
    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        address,
        country: country || 'Nigeria',
        state,
        phone,
        email,
        primaryColor: primaryColor || '#3B82F6',
        logoUrl: logoUrl || null,
        slug: storeSlug,
        ownerId: user.id,
        cacNumber: cacNumber || null,
        tin: tinNumber || null,
        vatRegistered: vatRegistered || false,
        currency: currency || 'NGN',
        isActive: true
      },
    });

    // Create store settings for new store
    await prisma.storeSettings.create({
      data: {
        storeId: store.id,
        vatEnabled: chargeVat || false,
        vatRate: (vatRegistered && vatRate) ? vatRate / 100 : 0.075, // Convert percentage to decimal
        taxIdNumber: taxIdNumber || null,
        businessRegNumber: businessRegNumber || null,
        businessType: businessType || null,
      }
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
        logoUrl: store.logoUrl,
        vatRegistered: store.vatRegistered,
        cacNumber: store.cacNumber,
        tin: store.tin,
        state: store.state,
        country: store.country,
        currency: store.currency,
        publicUrl: `https://swiftstock.vercel.app/store/${store.slug}`
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