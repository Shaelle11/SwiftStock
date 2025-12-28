import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    console.log('Attempting to count users...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
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
    
    // Basic validation
    const { email, password, firstName, lastName } = body;
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test completed - user would be created',
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName
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