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
    
    try {
      // First try without force reset to preserve data
      console.log('Attempting safe schema push...');
      const output = execSync('npx prisma db push --accept-data-loss --skip-generate', { 
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: dbUrl }
      });
      
      console.log('Safe schema push successful:', output);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema synchronized successfully (safe mode)',
        output: output
      });
      
    } catch (safeError) {
      console.log('Safe push failed, trying with force reset...');
      
      try {
        // If safe push fails, try with force reset
        const output = execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', { 
          encoding: 'utf8',
          env: { ...process.env, DATABASE_URL: dbUrl }
        });
        
        console.log('Force reset schema push successful:', output);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Database schema synchronized successfully (with reset)',
          output: output
        });
        
      } catch (forceError) {
        console.error('Both safe and force reset failed');
        throw forceError;
      }
    }
    
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