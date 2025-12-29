import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { z } from 'zod';

const customerLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  storeSlug: z.string().min(1, 'Store is required'), // Which store they're shopping at
});

// POST - Login customer for a specific store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = customerLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const { email, password, storeSlug } = validationResult.data;

    // Attempt login
    const result = await loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Ensure user is a customer
    if (result.user?.role !== 'customer') {
      return NextResponse.json({
        success: false,
        message: 'Invalid account type for customer login'
      }, { status: 403 });
    }

    // Return success with store context
    return NextResponse.json({
      ...result,
      store: { slug: storeSlug }
    });

  } catch (error) {
    console.error('Customer login error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 });
  }
}