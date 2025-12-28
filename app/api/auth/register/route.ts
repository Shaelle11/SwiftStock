import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'cashier', 'customer']).optional()
});

export async function POST(request: NextRequest) {
  // Only prevent execution during build time, not in production
  if (process.env.SKIP_ENV_VALIDATION === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.json(
      {
        success: false,
        message: 'API not available during build'
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    
    // Add debug logging for production
    console.log('Register attempt for:', body.email);
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseURL: !!process.env.DATABASE_URL
    });
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role } = validationResult.data;

    // Register user
    const result = await registerUser({
      email,
      password,
      firstName,
      lastName,
      role
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
        token: result.token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}