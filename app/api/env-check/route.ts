import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    // Also check for other database-related env vars
    DATABASE_POSTGRES_URL: process.env.DATABASE_POSTGRES_URL,
    DATABASE_PRISMA_DATABASE_URL: process.env.DATABASE_PRISMA_DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  };

  return NextResponse.json({
    environment: envVars,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('database') || key.toLowerCase().includes('postgres')
    ).sort()
  });
}