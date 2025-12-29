import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Public store information and products (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'Store slug is required'
      }, { status: 400 });
    }

    // Find the store
    const store = await prisma.store.findUnique({
      where: { 
        slug: slug,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
      }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: 'Store not found'
      }, { status: 404 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';

    // Build where clause for products
    const where: Record<string, unknown> = {
      storeId: store.id,
      isActive: true,
      stockQuantity: { gt: 0 }, // Only show products in stock
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch products and categories
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          sellingPrice: true,
          stockQuantity: true,
          imageUrl: true,
        },
        orderBy: { name: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          stockQuantity: { gt: 0 },
        },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    const pages = Math.ceil(total / limit);
    const uniqueCategories = categories.map(c => c.category);

    return NextResponse.json({
      success: true,
      data: {
        store,
        products,
        categories: uniqueCategories,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });

  } catch (error) {
    console.error('Public store API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load store'
    }, { status: 500 });
  }
}