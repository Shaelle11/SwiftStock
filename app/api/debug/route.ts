import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const environmentInfo = {
      NODE_ENV: process.env.NODE_ENV,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseURL: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    };

    // Test database connection
    let databaseTest = null;
    try {
      const { prisma } = await import('@/lib/db/prisma');
      const userCount = await prisma.user.count();
      databaseTest = {
        success: true,
        message: 'Database connection successful',
        userCount
      };
    } catch (dbError) {
      databaseTest = {
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      };
    }

    return NextResponse.json({
      success: true,
      environment: environmentInfo,
      database: databaseTest
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}