import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
    const { user, error } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: error || 'Not authenticated'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}