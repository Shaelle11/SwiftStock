import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      receivedData: body,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasJWTSecret: !!process.env.JWT_SECRET,
        hasDatabaseURL: !!process.env.DATABASE_URL,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Test endpoint failed'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test GET endpoint working',
    timestamp: new Date().toISOString()
  });
}