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