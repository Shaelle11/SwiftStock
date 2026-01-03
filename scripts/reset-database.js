#!/usr/bin/env node

/**
 * Complete Database Reset Script
 * WARNING: This will DELETE ALL DATA in your database!
 * Use only when you want to start completely fresh.
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function resetDatabase() {
  console.log('🚨 WARNING: This will DELETE ALL DATA in your database!');
  console.log('💀 Starting complete database reset...');
  
  const prisma = new PrismaClient();
  
  try {
    // First, connect to the database
    await prisma.$connect();
    console.log('📡 Connected to database');
    
    // Drop all data and reset the schema
    console.log('🧹 Dropping all tables...');
    
    // Use Prisma's db push with --force-reset to completely recreate the database
    console.log('🔄 Resetting database schema...');
    execSync('npx prisma db push --force-reset --accept-data-loss', { 
      stdio: 'inherit'
    });
    
    console.log('🏗️  Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Database reset completed successfully!');
    console.log('🎉 You now have a fresh, empty database with the current schema');
    
  } catch (error) {
    console.error('❌ Database reset failed:');
    console.error(error.message);
    
    // Alternative method using raw SQL if Prisma method fails
    console.log('🔧 Trying alternative reset method...');
    try {
      await resetWithRawSQL(prisma);
      
      // Push the schema after manual cleanup
      console.log('🔄 Recreating schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      
      console.log('✅ Database reset completed with alternative method!');
      
    } catch (altError) {
      console.error('❌ Alternative reset method also failed:');
      console.error(altError.message);
      console.log('🆘 You may need to manually reset the database through Vercel dashboard');
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function resetWithRawSQL(prisma) {
  console.log('🗑️  Dropping all tables manually...');
  
  // Get all table names
  const tables = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  `;
  
  console.log(`Found ${tables.length} tables to drop`);
  
  // Drop all tables
  for (const table of tables) {
    console.log(`Dropping table: ${table.tablename}`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
  }
  
  // Drop all sequences
  const sequences = await prisma.$queryRaw`
    SELECT sequencename 
    FROM pg_sequences 
    WHERE schemaname = 'public'
  `;
  
  for (const sequence of sequences) {
    console.log(`Dropping sequence: ${sequence.sequencename}`);
    await prisma.$executeRawUnsafe(`DROP SEQUENCE IF EXISTS "${sequence.sequencename}" CASCADE`);
  }
  
  console.log('🧽 Manual cleanup completed');
}

// Run the reset
resetDatabase();