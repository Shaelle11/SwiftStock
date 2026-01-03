#!/usr/bin/env node

/**
 * Database Migration Script for Vercel Deployment
 * This script pushes the Prisma schema to the production database
 */

const { execSync } = require('child_process');

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema to database (creates tables if they don't exist)
    console.log('🚀 Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();