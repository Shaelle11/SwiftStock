import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Business registration schema
const businessRegistrationSchema = z.object({
  // User details
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  
  // Business details
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().optional(),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessPhone: z.string().min(1, 'Business phone is required'),
  businessEmail: z.string().email('Valid business email is required'),
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
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
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
    const baseSlug = businessName.toLowerCase()
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
      lastName,
      role: 'admin'
    });

    if (!userResult.success || !userResult.user) {
      return NextResponse.json(userResult, { status: 400 });
    }

    // Create the store
    const store = await prisma.store.create({
      data: {
        name: businessName,
        description: businessDescription,
        address: businessAddress,
        phone: businessPhone,
        email: businessEmail,
        slug: storeSlug,
        ownerId: userResult.user.id,
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