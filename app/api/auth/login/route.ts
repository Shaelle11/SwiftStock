import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
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
    console.log('Login attempt for:', body.email);
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseURL: !!process.env.DATABASE_URL
    });
    
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
    console.error('Login API error details:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
          error: 'JSON_PARSE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}