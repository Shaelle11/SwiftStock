import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

// Simplified customer registration schema
const customerRegistrationSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  // Remove store-specific requirement - customers can shop anywhere
});

// POST - Register a new customer (global account, not store-specific)
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

    const { firstName, lastName, email, password } = validationResult.data;

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

    // Create customer user (global account - can shop from any store)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        // No storeId - customers are global
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