#!/usr/bin/env node

/**
 * Test database connection for SwiftStock
 * This script verifies that the database connection works
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} users in database`);
      
      const storeCount = await prisma.store.count();
      console.log(`🏪 Found ${storeCount} stores in database`);
      
    } catch (error) {
      console.log('⚠️  Tables might not exist yet. This is normal for a new database.');
      console.log('Run the migration script to create tables.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('SSL')) {
      console.log('💡 Try adding ?sslmode=require to your DATABASE_URL');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();