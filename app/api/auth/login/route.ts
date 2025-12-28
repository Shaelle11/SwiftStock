import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_ENV_VALIDATION === 'true') {
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
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    
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

    const { email, password } = validationResult.data;

    // Login user
    const result = await loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
        token: result.token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}