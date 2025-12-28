import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Import prisma
    const { prisma } = await import('@/lib/db/prisma');
    
    // Test basic connection
    console.log('Attempting to count users...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test if we can create a user (but don't actually save)
    console.log('Testing user creation (dry run)...');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasJWTSecret: !!process.env.JWT_SECRET,
        hasDatabaseURL: !!process.env.DATABASE_URL,
        databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test registration data:', JSON.stringify(body, null, 2));
    
    // Import functions
    const { registerUser } = await import('@/lib/auth');
    
    // Try the actual registration
    console.log('Calling registerUser function...');
    const result = await registerUser(body);
    
    console.log('Registration result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Test completed',
      result,
      originalData: body
    });
    
  } catch (error) {
    console.error('Test registration failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}