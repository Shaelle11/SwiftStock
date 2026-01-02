import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting database schema migration...');
    
    // Get the DATABASE_URL from environment
    const dbUrl = process.env.DATABASE_URL || 
                  process.env.POSTGRES_PRISMA_URL || 
                  process.env.POSTGRES_URL;
    
    if (!dbUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'No DATABASE_URL found in environment' 
      });
    }
    
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      return NextResponse.json({ 
        success: false, 
        message: 'DATABASE_URL is not PostgreSQL format' 
      });
    }
    
    console.log('PostgreSQL database detected, pushing schema...');
    
    // Force push the current schema to the database to match exactly
    const output = execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', { 
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
    
    console.log('Schema push output:', output);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema synchronized successfully',
      output: output
    });
    
  } catch (error) {
    console.error('Database migration failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = error instanceof Error ? error.toString() : String(error);
    return NextResponse.json({ 
      success: false, 
      message: `Database migration failed: ${errorMessage}`,
      error: errorString
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database migration endpoint. Use POST to trigger migration.',
    info: 'This endpoint will force push the Prisma schema to the database.'
  });
}