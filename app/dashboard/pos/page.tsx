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

interface HeldSale {
  id: string;
  cart: CartItem[];
  customerInfo: CustomerInfo;
  timestamp: Date;
  subtotal: number;
  tax: number;
  total: number;
}

export default function POSPage() {
  const { user } = useAuth();
  const { store } = useContext(AuthContext)!;
  const brandStyles = getStoreBrandStyles(store);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [showHeldSales, setShowHeldSales] = useState(false);
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

  const holdSale = () => {
    if (cart.length === 0) {
      setError('Cannot hold empty sale');
      return;
    }

    const heldSale: HeldSale = {
      id: Date.now().toString(),
      cart: [...cart],
      customerInfo: { ...customerInfo },
      timestamp: new Date(),
      subtotal,
      tax,
      total
    };

    setHeldSales(prevHeld => [...prevHeld, heldSale]);
    clearCart();
    setCustomerInfo({ deliveryType: 'WALK_IN' });
    setError(null);
  };

  const retrieveHeldSale = (saleId: string) => {
    const heldSale = heldSales.find(sale => sale.id === saleId);
    if (heldSale) {
      setCart(heldSale.cart);
      setCustomerInfo(heldSale.customerInfo);
      setHeldSales(prevHeld => prevHeld.filter(sale => sale.id !== saleId));
      setShowHeldSales(false);
    }
  };

  const removeHeldSale = (saleId: string) => {
    setHeldSales(prevHeld => prevHeld.filter(sale => sale.id !== saleId));
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
      
      if (response.success && response.data) {
        const saleResponse = response.data as any; // Type assertion for API response
        setLastSale({
          id: saleResponse.id,
          total: saleResponse.total,
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
              {heldSales.length > 0 && (
                <button
                  onClick={() => setShowHeldSales(true)}
                  className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Held Sales: {heldSales.length}</span>
                </button>
              )}
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
            onHoldSale={holdSale}
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

      {/* Held Sales Modal */}
      {showHeldSales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Held Sales</h3>
              <button
                onClick={() => setShowHeldSales(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {heldSales.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No held sales</p>
                  <p className="text-sm mt-1 text-gray-500">Hold sales to resume them later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {heldSales.map((heldSale) => (
                    <div key={heldSale.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Sale #{heldSale.id.slice(-6)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {heldSale.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(heldSale.total)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {heldSale.cart.length} items
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {heldSale.cart.map((item, index) => (
                          <span key={item.productId}>
                            {item.quantity}× {item.product.name}
                            {index < heldSale.cart.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => retrieveHeldSale(heldSale.id)}
                          className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Resume
                        </button>
                        <button
                          onClick={() => removeHeldSale(heldSale.id)}
                          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
