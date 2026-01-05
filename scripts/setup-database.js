#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Determine if we're in production (Vercel) or development
const isProduction = process.env.VERCEL_ENV || process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';

// Check if DATABASE_URL indicates PostgreSQL
const isPostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log('🔧 Setting up database configuration...');
console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Database URL detected: ${databaseUrl ? (isPostgreSQL ? 'PostgreSQL' : 'SQLite/Other') : 'None'}`);

// Read the current schema
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Determine which provider to use
let provider = 'sqlite'; // default for development

if (isProduction || isPostgreSQL) {
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