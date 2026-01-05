import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Business registration - Creates admin user and associated store
// This is the ONLY way to create admin users in the system

// Business registration schema
const businessRegistrationSchema = z.object({
  // User details
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  
  // Business details
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().optional(),
  businessDescription: z.string().optional(),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessPhone: z.string().min(1, 'Business phone is required'),
  businessEmail: z.string().email('Valid business email is required'),
  
  // Location
  country: z.string().default('Nigeria'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  
  // Registration details
  registrationStatus: z.string().optional(),
  cacNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  businessRegNumber: z.string().optional(),
  businessLicense: z.string().optional(),
  
  // Store setup
  slug: z.string().min(1, 'Store URL slug is required'),
  logoUrl: z.string().optional(),
  primaryColor: z.string().default('#3B82F6'),
  allowGuestCheckout: z.boolean().default(true),
  
  // Tax settings
  vatRegistered: z.boolean().default(false),
  chargeVat: z.boolean().default(false),
  vatRate: z.number().default(7.5),
  taxIdNumber: z.string().optional(),
  autoCalculateTax: z.boolean().default(true),
  
  // Inventory settings
  inventoryType: z.string().default('physical'),
  trackQuantities: z.boolean().default(true),
  currency: z.string().default('NGN'),
  enableLowStockAlerts: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input for business registration
    const validationResult = businessRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      businessType,
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
      country,
      state,
      city,
      registrationStatus,
      cacNumber,
      tinNumber,
      businessRegNumber,
      businessLicense,
      slug: preferredSlug,
      logoUrl,
      primaryColor,
      allowGuestCheckout,
      vatRegistered,
      chargeVat,
      vatRate,
      taxIdNumber,
      autoCalculateTax,
      inventoryType,
      trackQuantities,
      currency,
      enableLowStockAlerts,
    } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 409 });
    }

    // Generate unique store slug
    const baseSlug = preferredSlug || businessName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let storeSlug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await prisma.store.findUnique({ where: { slug: storeSlug } })) {
      storeSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Register user first without storeId
    const userResult = await registerUser({
      email,
      password,
      firstName,
      lastName
    });

    if (!userResult.success || !userResult.user) {
      return NextResponse.json(userResult, { status: 400 });
    }

    // Create the store with all new fields
    const store = await prisma.store.create({
      data: {
        name: businessName,
        description: businessDescription,
        address: businessAddress,
        phone: businessPhone,
        email: businessEmail,
        slug: storeSlug,
        ownerId: userResult.user.id,
        country,
        state,
        cacNumber,
        tin: tinNumber,
        vatRegistered,
        currency,
        logoUrl,
        primaryColor,
      },
    });

    // Create store settings with tax configuration
    await prisma.storeSettings.create({
      data: {
        storeId: store.id,
        vatEnabled: chargeVat,
        vatRate: vatRegistered ? vatRate / 100 : 0, // Convert percentage to decimal
        taxIdNumber,
        businessRegNumber,
        businessType,
      },
    });

    // Update user with store association
    await prisma.user.update({
      where: { id: userResult.user.id },
      data: { storeId: store.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Business account and store created successfully',
      user: {
        ...userResult.user,
        storeId: store.id
      },
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        phone: store.phone,
        email: store.email,
        publicUrl: `https://swiftstock.vercel.app/store/${store.slug}`,
      },
      token: userResult.token
    });

  } catch (error) {
    console.error('Business registration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create business account'
    }, { status: 500 });
  }
}