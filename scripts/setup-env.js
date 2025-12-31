#!/usr/bin/env node

// Environment setup script for deployment
console.log('Setting up environment for deployment...');

// Set a dummy DATABASE_URL for Prisma generation during build
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
  console.log('Set dummy DATABASE_URL for Prisma generation');
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dummy-jwt-secret-for-build';
  console.log('Set dummy JWT_SECRET for build');
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'dummy-nextauth-secret-for-build';
  console.log('Set dummy NEXTAUTH_SECRET for build');
}

console.log('Environment setup complete');