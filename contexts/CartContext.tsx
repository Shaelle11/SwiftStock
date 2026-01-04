'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/utils/api';

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    imageUrl?: string;
    stockQuantity: number;
    isActive: boolean;
    store: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const response = await api.get<{ cart: Cart }>('/api/cart');
      
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Load cart when user logs in
  useEffect(() => {
    if (user && token) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, token, refreshCart]);

  const updateCart = async (items: Array<{ productId: string; quantity: number }>) => {
    if (!user || !token) return;

    try {
      const response = await api.post<{ cart: Cart }>('/api/cart', { items });
      
      if (response.success && response.data) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!cart) return;

    const existingItem = cart.items.find(item => item.productId === productId);
    const newItems = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.productId === productId ? item.quantity + quantity : item.quantity
    }));

    if (!existingItem) {
      newItems.push({ productId, quantity });
    }

    await updateCart(newItems);
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;

    const newItems = cart.items
      .filter(item => item.productId !== productId)
      .map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

    await updateCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cart) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newItems = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.productId === productId ? quantity : item.quantity
    }));

    await updateCart(newItems);
  };

  const clearCart = async () => {
    await updateCart([]);
  };

  const getCartItemCount = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => 
      total + (item.product.sellingPrice * item.quantity), 0
    );
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    getCartItemCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}