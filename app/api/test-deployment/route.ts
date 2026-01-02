import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Check if we have stores and products for testing
    const storeCount = await prisma.store.count();
    const productCount = await prisma.product.count();
    
    console.log('Deployment test:', { storeCount, productCount });
    
    if (storeCount === 0) {
      return NextResponse.json({
        message: 'No stores available for deployment testing',
        storeCount,
        productCount
      });
    }
    
    // Get first store for testing
    const store = await prisma.store.findFirst({
      include: {
        products: {
          take: 3
        }
      }
    });
    
    if (!store) {
      return NextResponse.json({
        message: 'Could not retrieve test store',
        storeCount,
        productCount
      });
    }
    
    return NextResponse.json({
      message: 'Deployment test data available',
      store: {
        id: store.id,
        name: store.name,
        isActive: store.isActive,
        deployedAt: store.deployedAt,
        productCount: store.products.length
      },
      storeCount,
      productCount
    });
    
  } catch (error) {
    console.error('Deployment test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test deployment functionality with the first available store
    const store = await prisma.store.findFirst({
      include: {
        products: {
          take: 2
        }
      }
    });
    
    if (!store || store.products.length === 0) {
      return NextResponse.json({
        message: 'No store or products available for deployment test'
      }, { status: 400 });
    }
    
    const productIds = store.products.map(p => p.id);
    
    console.log('Testing deployment with:', {
      storeId: store.id,
      productIds,
      isPublic: true
    });
    
    // Update store with deployment settings
    const updatedStore = await prisma.store.update({
      where: {
        id: store.id,
      },
      data: {
        isPublic: true,
        isActive: true,
        deployedAt: new Date(),
      },
    });

    // Create or update store product relationships for deployed products
    // First, remove all existing store-product relationships for deployment
    await prisma.storeProduct.deleteMany({
      where: {
        storeId: store.id,
      },
    });

    // Then add the newly selected products
    const storeProductData = productIds.map(productId => ({
      storeId: store.id,
      productId: productId,
      isDeployed: true,
    }));

    const storeProducts = await prisma.storeProduct.createMany({
      data: storeProductData,
    });
    
    return NextResponse.json({
      message: 'Deployment test successful',
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        isActive: updatedStore.isActive,
        isPublic: updatedStore.isPublic,
        deployedAt: updatedStore.deployedAt
      },
      storeProducts: storeProducts.count
    });
    
  } catch (error) {
    console.error('Deployment test POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}