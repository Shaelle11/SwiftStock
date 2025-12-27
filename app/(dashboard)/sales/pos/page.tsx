'use client';

import { useState } from 'react';
import ProductPicker from "@/components/features/pos/ProductPicker";
import CartSummary from "@/components/features/pos/CartSummary";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { calculateSubtotal, calculateVAT } from '@/lib/sales';
import type { Product } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = calculateSubtotal(cart.map(item => ({
    price: item.product.sellingPrice,
    quantity: item.quantity
  })));
  const tax = calculateVAT(subtotal);
  const total = subtotal + tax;

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.sellingPrice
              }
            : item
        );
      } else {
        return [...prevCart, {
          productId: product.id,
          product,
          quantity,
          subtotal: quantity * product.sellingPrice
        }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.sellingPrice
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processSale = async (paymentMethod: string) => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        discount: 0
      };

      const response = await api.post('/api/sales', saleData);
      
      if (response.success) {
        clearCart();
        alert('Sale completed successfully!');
      } else {
        setError(response.error || 'Failed to process sale');
      }
    } catch {
      setError('An error occurred while processing the sale');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !['admin', 'cashier'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need cashier or admin privileges to access the POS system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Product Picker Section */}
      <div className="flex-1 p-6">
        <ProductPicker onAddToCart={addToCart} />
      </div>

      {/* Cart Summary Section */}
      <div className="lg:w-96 bg-white border-l border-gray-200 p-6">
        <CartSummary
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onProcessSale={processSale}
          isProcessing={isProcessing}
          error={error}
        />
      </div>
    </div>
  );
}
