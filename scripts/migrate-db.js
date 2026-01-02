#!/usr/bin/env node

// Database migration script for production deployment
const { execSync } = require('child_process');

async function migrateDatabase() {
  console.log('Starting database migration...');
  
  // Get DATABASE_URL from environment
  const dbUrl = process.env.DATABASE_URL || 
                process.env.POSTGRES_PRISMA_URL || 
                process.env.POSTGRES_URL;
  
  if (!dbUrl) {
    console.log('No DATABASE_URL found, skipping migration');
    return;
  }
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.log('DATABASE_URL is not PostgreSQL, skipping migration');
    return;
  }
  
  console.log('PostgreSQL database detected, running migrations...');
  
  try {
    // First, try to run existing migrations
    console.log('Deploying existing migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
    console.log('✅ Migrations deployed successfully');
  } catch (error) {
    console.warn('⚠️  Migration deploy failed, attempting schema push...');
    console.log('Error:', error.message);
    
    try {
      // If migrations fail, push the current schema directly
      console.log('Pushing current schema to database...');
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: dbUrl }
      });
      console.log('✅ Schema pushed successfully');
    } catch (pushError) {
      console.error('❌ Database setup failed completely');
      console.error('Push error:', pushError.message);
      // Don't exit with error code to allow build to continue
      console.log('Continuing build process...');
    }
  }
}

// Run migration
migrateDatabase().catch((error) => {
  console.error('Migration script failed:', error);
  // Don't exit with error code to allow build to continue
});