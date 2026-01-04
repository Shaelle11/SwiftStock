import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// GET - Fetch abandoned carts for monitoring
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: error || 'Unauthorized'
      }, { status: 401 });
    }

    // Check if user has admin permissions (business owner or employee with admin access)
    if (user.userType !== 'business_owner' && user.userType !== 'employee') {
      return NextResponse.json({
        success: false,
        message: 'Access denied'
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');

    // Build where clause based on user type
    let storeFilter: any = {};
    
    if (user.userType === 'business_owner') {
      if (businessId) {
        // Verify the business owner owns this store
        const ownedStore = await prisma.store.findFirst({
          where: {
            id: businessId,
            ownerId: user.id
          }
        });

        if (!ownedStore) {
          return NextResponse.json({
            success: false,
            message: 'Store not found or access denied'
          }, { status: 404 });
        }

        storeFilter = { storeId: businessId };
      } else {
        // Get all stores owned by this user
        const ownedStores = await prisma.store.findMany({
          where: { ownerId: user.id },
          select: { id: true }
        });

        storeFilter = {
          storeId: {
            in: ownedStores.map(store => store.id)
          }
        };
      }
    } else if (user.userType === 'employee') {
      // For employees, only show carts from their assigned store
      if (!user.storeId) {
        return NextResponse.json({
          success: false,
          message: 'Employee not assigned to any store'
        }, { status: 403 });
      }
      storeFilter = { storeId: user.storeId };
    }

    // Get abandoned carts (carts with items that haven't been updated in the last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: {
          lt: twentyFourHoursAgo
        },
        items: {
          some: {
            product: storeFilter
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: {
          where: {
            product: storeFilter
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
                imageUrl: true,
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Calculate cart totals and filter out empty carts
    const cartsWithTotals = abandonedCarts
      .filter(cart => cart.items.length > 0)
      .map(cart => {
        const total = cart.items.reduce((sum, item) => {
          return sum + (item.product.sellingPrice * item.quantity);
        }, 0);

        return {
          ...cart,
          total,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        abandonedCarts: cartsWithTotals,
        summary: {
          totalCarts: cartsWithTotals.length,
          totalValue: cartsWithTotals.reduce((sum, cart) => sum + cart.total, 0),
          totalItems: cartsWithTotals.reduce((sum, cart) => sum + cart.itemCount, 0)
        }
      }
    });

  } catch (error) {
    console.error('Fetch abandoned carts error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch abandoned carts'
    }, { status: 500 });
  }
}