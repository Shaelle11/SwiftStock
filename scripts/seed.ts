import { prisma } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@swiftstock.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('👤 Admin user created:', admin.email);

    // Create cashier user
    const cashierPassword = await hashPassword('cashier123');
    const cashier = await prisma.user.create({
      data: {
        email: 'cashier@swiftstock.com',
        password: cashierPassword,
        firstName: 'Cashier',
        lastName: 'User',
        role: 'CASHIER',
        isActive: true,
      },
    });

    console.log('👤 Cashier user created:', cashier.email);

    // Create a sample store for the admin
    const store = await prisma.store.create({
      data: {
        name: 'SwiftStock Demo Store',
        description: 'A sample store for demonstration',
        address: '123 Demo Street, Demo City',
        phone: '+234-123-456-7890',
        email: 'store@swiftstock.com',
        slug: 'swiftstock-demo',
        ownerId: admin.id,
      },
    });

    console.log('🏪 Store created:', store.name);

    // Update admin user with store association
    await prisma.user.update({
      where: { id: admin.id },
      data: { storeId: store.id },
    });

    // Update cashier user with store association
    await prisma.user.update({
      where: { id: cashier.id },
      data: { storeId: store.id },
    });

    console.log('👤 Users associated with store');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Premium Rice (50kg)',
        description: 'High quality long grain rice',
        category: 'Grains',
        costPrice: 5000,
        sellingPrice: 6500,
        stockQuantity: 25,
        lowStockThreshold: 5,
        barcode: '1234567890123',
        storeId: store.id,
      },
      {
        name: 'Black Beans (25kg)',
        description: 'Fresh black beans, rich in protein',
        category: 'Grains',
        costPrice: 3000,
        sellingPrice: 4000,
        stockQuantity: 15,
        lowStockThreshold: 3,
        barcode: '1234567890124',
        storeId: store.id,
      },
      {
        name: 'Fresh Tomatoes (1 crate)',
        description: 'Farm fresh tomatoes',
        category: 'Vegetables',
        costPrice: 2500,
        sellingPrice: 3200,
        stockQuantity: 20,
        lowStockThreshold: 5,
        barcode: '1234567890125',
        storeId: store.id,
      },
    ];

    for (const productData of sampleProducts) {
      const product = await prisma.product.create({ data: productData });
      console.log('📦 Product created:', product.name);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('Admin: admin@swiftstock.com / admin123');
    console.log('Cashier: cashier@swiftstock.com / cashier123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();