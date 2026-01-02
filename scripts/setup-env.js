#!/usr/bin/env node

// Environment setup script for deployment
console.log('Setting up environment for deployment...');

// Set proper DATABASE_URL for build - use in-memory SQLite for build process
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/tmp/build.db';
  console.log('Set temporary DATABASE_URL for build process');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'build-only-jwt-secret-' + Math.random();
  console.log('Set temporary JWT_SECRET for build');
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'build-only-nextauth-secret-' + Math.random();
  console.log('Set temporary NEXTAUTH_SECRET for build');
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'https://swiftstock.vercel.app';
  console.log('Set NEXTAUTH_URL for production');
}

console.log('Environment setup complete');

// Run database migration if in production environment and DATABASE_URL is PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
  const { execSync } = require('child_process');
  
  // If DATABASE_URL is set and is PostgreSQL, run migrations
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
    try {
      console.log('Running database migrations...');
      // Set the correct DATABASE_URL for migrations
      process.env.DATABASE_URL = dbUrl;
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.warn('Migration failed, attempting to push schema:', error.message);
      try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('Database schema pushed successfully');
      } catch (pushError) {
        console.error('Database setup failed:', pushError.message);
        // Don't fail the build, just warn
      }
    }
  }
}