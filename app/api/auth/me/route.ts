import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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