import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

// Registration schema for customers
const customerRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  storeSlug: z.string().min(1, 'Store is required'), // Store they're signing up for
});

// POST - Register a new customer for a specific store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = customerRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const { firstName, lastName, email, password, storeSlug } = validationResult.data;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true, name: true }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: 'Store not found'
      }, { status: 404 });
    }

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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'CUSTOMER',
        // Customers don't have storeId - they can shop from multiple stores
        storeId: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      store: {
        id: store.id,
        name: store.name,
        slug: storeSlug
      }
    });

  } catch (error) {
    console.error('Customer registration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create customer account'
    }, { status: 500 });
  }
}