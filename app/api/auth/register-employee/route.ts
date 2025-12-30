import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const employeeRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST - Register a new employee (cashier) - Admin only
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authorization required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user || user.userType !== 'business_owner') {
      return NextResponse.json({
        success: false,
        message: 'Business owner access required'
      }, { status: 403 });
    }

    // Verify admin owns a store
    const adminStore = await prisma.store.findUnique({
      where: { ownerId: user.id }
    });

    if (!adminStore) {
      return NextResponse.json({
        success: false,
        message: 'Admin must have a store to add employees'
      }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = employeeRegistrationSchema.safeParse(body);
    
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

    // Register employee and associate with admin's store
    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      storeId: adminStore.id // Associate with store
    });

    if (!result.success || !result.user) {
      return NextResponse.json(result, { status: 400 });
    }

    // Update employee with store association
    await prisma.user.update({
      where: { id: result.user.id },
      data: { storeId: adminStore.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Employee account created successfully',
      user: {
        ...result.user,
        storeId: adminStore.id
      },
      store: {
        id: adminStore.id,
        name: adminStore.name
      }
    });

  } catch (error) {
    console.error('Employee registration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create employee account'
    }, { status: 500 });
  }
}