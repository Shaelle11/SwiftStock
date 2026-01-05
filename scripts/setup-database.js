#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Determine if we're in production (Vercel) or development
const isProduction = process.env.VERCEL_ENV || process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_POSTGRES_URL || '';

// Check if DATABASE_URL indicates PostgreSQL
const isPostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log('🔧 Setting up database configuration...');
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Database URL detected: ${databaseUrl ? (isPostgreSQL ? 'PostgreSQL' : 'SQLite/Other') : 'None'}`);
console.log(`Database URL length: ${databaseUrl.length}`);

// Read the current schema
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Determine which provider to use
let provider = 'sqlite'; // default for development

// Force PostgreSQL for Vercel environments or when PostgreSQL URL is detected
if (isProduction || isPostgreSQL || process.env.VERCEL_ENV) {
  provider = 'postgresql';
  console.log('🐘 Using PostgreSQL for production/cloud environment');
} else {
  console.log('🗃️  Using SQLite for local development');
}

// Update the schema with the correct provider
const updatedSchema = schemaContent.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${provider}"`
);

// Write the updated schema back
fs.writeFileSync(schemaPath, updatedSchema);

console.log(`✅ Database provider set to: ${provider}`);

// Only regenerate Prisma client if not in production build (Vercel will handle this)
if (!isProduction) {
  console.log('📦 Regenerating Prisma client...');
  
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client regenerated successfully');
  } catch (error) {
    console.error('❌ Error regenerating Prisma client:', error.message);
    process.exit(1);
  }
} else {
  console.log('⏭️  Skipping Prisma generation in production (handled by build process)');
}