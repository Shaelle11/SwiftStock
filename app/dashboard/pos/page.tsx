'use client';

import { useState, useContext } from 'react';
import ProductPicker from "@/components/features/pos/ProductPicker";
import CartSummary from "@/components/features/pos/CartSummary";
import CustomerInfoModal from "@/components/features/pos/CustomerInfoModal";
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { api, formatCurrency } from '@/lib/utils/api';
import { calculateSubtotal, calculateVAT } from '@/lib/sales';
import { getStoreBrandStyles } from '@/lib/store-branding';
import ReceiptModal from '@/components/features/pos/ReceiptModal';
import type { Product } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  deliveryType: 'WALK_IN' | 'DELIVERY' | 'PICKUP';
}

export default function POSPage() {
  const { user } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    deliveryType: 'WALK_IN'
  });
  const [lastSale, setLastSale] = useState<any>(null);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<string | null>(null);

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

    // Show customer info modal if needed
    setPendingPaymentMethod(paymentMethod);
    setShowCustomerModal(true);
  };

  const completeSale = async () => {
    if (!pendingPaymentMethod) return;

    setIsProcessing(true);
    setError(null);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod: pendingPaymentMethod,
        discount: 0,
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        customerAddress: customerInfo.address || undefined,
        deliveryType: customerInfo.deliveryType
      };

      console.log('Sending sale data:', saleData); // Debug log

      const response = await api.post('/api/sales', saleData);
      
      if (response.success) {
        setLastSale({
          id: response.data.id,
          total: response.data.total,
          items: cart.map(item => ({
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
            subtotal: item.subtotal
          })),
          paymentMethod: pendingPaymentMethod,
          customerInfo,
          createdAt: new Date().toISOString()
        });
        clearCart();
        setPendingPaymentMethod(null);
        setCustomerInfo({ deliveryType: 'WALK_IN' }); // Reset customer info
        setShowReceiptModal(true);
      } else {
        console.error('Sale error:', response); // Debug log
        setError(response.error || 'Failed to confirm sale');
      }
    } catch (error) {
      console.error('Sale processing error:', error); // Debug log
      setError('An error occurred while confirming the sale');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !['business_owner', 'employee'].includes(user.userType)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="text-teal-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="section-header mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need business owner or employee privileges to access the POS system.</p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title text-teal-800">Point of Sale</h1>
              <p className="text-gray-600 text-sm">Process customer transactions and manage sales</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-sm font-medium">
                Items: {cart.length}
              </div>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                Total: {formatCurrency(total)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full bg-gray-50">
        {/* Product Picker Section */}
        <div className="flex-1 p-6">
          <ProductPicker onAddToCart={addToCart} />
        </div>

        {/* Cart Summary Section */}
        <div className="lg:w-96 bg-white border-l border-gray-200 shadow-lg">
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
            brandStyles={brandStyles}
          />
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showReceiptModal && lastSale && (
        <ReceiptModal
          sale={lastSale}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          store={store}
          onNewSale={() => setShowReceiptModal(false)}
          brandStyles={brandStyles}
        />
      )}

      {/* Customer Info Modal */}
      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setPendingPaymentMethod(null);
        }}
        onSave={(info) => {
          setCustomerInfo(info);
          setShowCustomerModal(false);
          completeSale();
        }}
        initialData={customerInfo}
      />
    </div>
  );
}
