#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Verifies that all required environment variables and dependencies are properly configured
 */

const { PrismaClient } = require('@prisma/client');

async function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');

  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  let hasErrors = false;

  console.log('📋 Environment Variables:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ ${envVar}: Not set`);
      hasErrors = true;
    } else {
      console.log(`✅ ${envVar}: Set`);
    }
  });

  // Check Prisma client generation
  console.log('\n🔧 Prisma Client:');
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma client can be instantiated');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Prisma client error:', error.message);
    hasErrors = true;
  }

  // Check Node.js version
  console.log('\n🔋 Runtime:');
  console.log(`Node.js version: ${process.version}`);

  if (hasErrors) {
    console.log('\n❌ Pre-deployment checks failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed! Ready for deployment.');
  }
}

// Only run if this is the main module
if (require.main === module) {
  checkEnvironment().catch(error => {
    console.error('Check failed:', error);
    process.exit(1);
  });
}

module.exports = { checkEnvironment };