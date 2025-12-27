const { PrismaClient } = require('@prisma/client');

async function checkPrismaModels() {
  try {
    const prisma = new PrismaClient();
    
    console.log('Available models:');
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      typeof prisma[key] === 'object' && 
      prisma[key] && 
      typeof prisma[key].findMany === 'function'
    );
    
    console.log(models);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPrismaModels();