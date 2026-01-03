#!/usr/bin/env node

/**
 * Production Database Reset Script with Confirmation
 * This script requires explicit confirmation before resetting the database
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmReset() {
  return new Promise((resolve) => {
    console.log('🚨 WARNING: You are about to PERMANENTLY DELETE ALL DATA!');
    console.log('💀 This action cannot be undone!');
    console.log('🔴 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not found');
    console.log('');
    
    rl.question('Type "DELETE ALL DATA" to confirm (anything else cancels): ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE ALL DATA');
    });
  });
}

async function resetWithConfirmation() {
  const confirmed = await confirmReset();
  
  if (!confirmed) {
    console.log('✅ Reset cancelled. Your data is safe.');
    process.exit(0);
  }
  
  console.log('💣 Proceeding with database reset...');
  
  // Wait 3 seconds as final warning
  for (let i = 3; i > 0; i--) {
    console.log(`⏰ Starting in ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  try {
    // Run the reset
    console.log('🔥 RESETTING DATABASE NOW...');
    execSync('node scripts/reset-database.js', { stdio: 'inherit' });
    
    console.log('');
    console.log('🎉 Database reset completed!');
    console.log('📝 You may want to run the seed script to add initial data');
    console.log('🌱 Run: npm run db:seed');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetWithConfirmation();