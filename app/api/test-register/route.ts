import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Test registration data received:', JSON.stringify(body, null, 2));
    
    // Test database connection
    const { prisma } = await import('@/lib/db/prisma');
    
    try {
      const userCount = await prisma.user.count();
      console.log('Database connection successful, user count:', userCount);
      
      return NextResponse.json({
        success: true,
        message: 'Test successful',
        data: body,
        databaseConnected: true,
        userCount,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          hasJWTSecret: !!process.env.JWT_SECRET,
          hasDatabaseURL: !!process.env.DATABASE_URL,
        }
      });
    } catch (dbError) {
      console.error('Database test error:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        data: body
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}