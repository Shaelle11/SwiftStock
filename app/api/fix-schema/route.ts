import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('Checking database schema and adding missing columns...');
    
    // Try to add missing columns directly with SQL
    const missingColumns = [
      {
        table: 'stores',
        column: 'cacNumber',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "cacNumber" TEXT;'
      },
      {
        table: 'stores', 
        column: 'tin',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "tin" TEXT;'
      },
      {
        table: 'stores',
        column: 'vatRegistered', 
        type: 'BOOLEAN',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "vatRegistered" BOOLEAN DEFAULT false;'
      },
      {
        table: 'stores',
        column: 'currency',
        type: 'TEXT', 
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT \'NGN\';'
      },
      {
        table: 'stores',
        column: 'state',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "state" TEXT;'
      },
      {
        table: 'stores',
        column: 'country',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT \'Nigeria\';'
      },
      {
        table: 'stores',
        column: 'deployedAt',
        type: 'TIMESTAMP',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "deployedAt" TIMESTAMP;'
      },
      {
        table: 'stores',
        column: 'logoUrl',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;'
      },
      {
        table: 'stores',
        column: 'primaryColor',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT \'#000000\';'
      },
      {
        table: 'stores',
        column: 'secondaryColor',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT DEFAULT \'#ffffff\';'
      },
      {
        table: 'stores',
        column: 'accentColor',
        type: 'TEXT',
        query: 'ALTER TABLE stores ADD COLUMN IF NOT EXISTS "accentColor" TEXT DEFAULT \'#3b82f6\';'
      }
    ];
    
    const results = [];
    
    for (const col of missingColumns) {
      try {
        console.log(`Adding column ${col.table}.${col.column}...`);
        await prisma.$executeRawUnsafe(col.query);
        results.push({ column: `${col.table}.${col.column}`, status: 'added' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('already exists')) {
          results.push({ column: `${col.table}.${col.column}`, status: 'already exists' });
        } else {
          results.push({ column: `${col.table}.${col.column}`, status: 'error', error: errorMessage });
        }
      }
    }
    
    console.log('Column addition results:', results);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema update completed',
      results: results
    });
    
  } catch (error) {
    console.error('Database schema update failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = error instanceof Error ? error.toString() : String(error);
    return NextResponse.json({ 
      success: false, 
      message: `Database schema update failed: ${errorMessage}`,
      error: errorString
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database schema update endpoint. Use POST to add missing columns.',
    info: 'This endpoint will add missing columns to the database without destroying data.'
  });
}