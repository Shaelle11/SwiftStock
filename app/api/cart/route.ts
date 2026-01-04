import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
});

const updateCartSchema = z.object({
  items: z.array(cartItemSchema)
});

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: error || 'Unauthorized'
      }, { status: 401 });
    }

    // Get or create cart for user
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                imageUrl: true,
                stockQuantity: true,
                isActive: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sellingPrice: true,
                  imageUrl: true,
                  stockQuantity: true,
                  isActive: true,
                  store: {
                    select: {
                      id: true,
                      name: true,
                      slug: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      cart
    });

  } catch (error) {
    console.error('Get cart error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cart'
    }, { status: 500 });
  }
}

// POST - Update user's cart
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: error || 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    
    const validationResult = updateCartSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid input',
        errors: validationResult.error.issues
      }, { status: 400 });
    }

    const { items } = validationResult.data;

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      });
    }

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Add new items
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity
        }))
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                imageUrl: true,
                stockQuantity: true,
                isActive: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      cart: updatedCart
    });

  } catch (error) {
    console.error('Update cart error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update cart'
    }, { status: 500 });
  }
}