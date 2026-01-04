'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth, AuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/utils/api';
import { getStoreBrandStyles } from '@/lib/store-branding';
import POSProductGrid from '@/components/features/pos/POSProductGrid';
import POSCart from '@/components/features/pos/POSCart';
import PaymentModal from '@/components/features/pos/PaymentModal';
import ReceiptModal from '@/components/features/pos/ReceiptModal';
import type { Product, PaginatedResponse } from '@/lib/types';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface SaleData {
  id: string;
  total: number;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  deliveryType?: 'WALK_IN' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryPrice?: number;
  paymentMethod: string;
  createdAt: string;
}

export default function BusinessPOS() {
  const { user, token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const params = useParams();
  const businessSlug = params?.slug as string;
  const brandStyles = getStoreBrandStyles(store);
  
  // Cart and products state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Customer
  const [customerName, setCustomerName] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Modals and UI state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<SaleData | null>(null);
  
  // Cart drawer state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // Tax settings (default 7.5% VAT for Nigeria)
  const TAX_RATE = 0.075;

  // Calculate totals and cart summary
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * TAX_RATE;
  const discount = 0; // Future feature
  const total = subtotal + tax - discount;

  // Load products on component mount
  useEffect(() => {
    if (user && token) {
      loadProducts();
    }
  }, [user, token, businessSlug]);

  // Auto-focus search input
  useEffect(() => {
    const searchInput = document.querySelector('#pos-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const loadProducts = async (search: string = '', category: string = '') => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: '50' // Show more products for POS
      };

      // Add store ID if available from context
      if (store?.id) {
        params.storeId = store.id;
      }

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await api.get<PaginatedResponse<Product>>('/api/products', params);
      
      if (response.success && response.data) {
        setProducts(response.data.items);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response.data.items.map(product => product.category))
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const timeoutId = setTimeout(() => {
      loadProducts(query, selectedCategory);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    loadProducts(searchQuery, category);
  };

  // Cart management
  const addToCart = (product: Product, quantity: number = 1) => {
    // Check if product has enough stock
    if (product.stockQuantity < quantity) {
      setError(`Only ${product.stockQuantity} units available`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check total quantity against stock
        if (newQuantity > product.stockQuantity) {
          setError(`Only ${product.stockQuantity} units available`);
          setTimeout(() => setError(null), 3000);
          return prevCart;
        }
        
        return prevCart.map(item => 
          item.productId === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * product.sellingPrice
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

    // Auto-open cart drawer when first item is added
    if (cart.length === 0) {
      setIsCartDrawerOpen(true);
    }

    // Clear any existing errors
    setError(null);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => {
        if (item.productId === productId) {
          // Check stock availability
          if (newQuantity > item.product.stockQuantity) {
            setError(`Only ${item.product.stockQuantity} units available`);
            setTimeout(() => setError(null), 3000);
            return item;
          }
          
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.product.sellingPrice
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      setCustomerName('');
      setCustomerSearch('');
      setError(null);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Close drawer on mobile when proceeding to checkout
    setIsCartDrawerOpen(false);
    setShowPaymentModal(true);
  };

  const processSale = async (
    paymentMethod: string, 
    deliveryInfo: {
      customerName?: string;
      customerPhone?: string;
      deliveryType: 'WALK_IN' | 'DELIVERY';
      deliveryAddress?: string;
      deliveryPrice: number;
    },
    amountReceived?: number
  ) => {
    if (cart.length === 0) return false;

    setIsProcessing(true);
    setError(null);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod.toLowerCase(),
        customerId: null,
        customerName: deliveryInfo.customerName || undefined,
        customerPhone: deliveryInfo.customerPhone || undefined,
        deliveryType: deliveryInfo.deliveryType,
        deliveryAddress: deliveryInfo.deliveryAddress || undefined,
        deliveryPrice: deliveryInfo.deliveryPrice,
        deliveryStatus: deliveryInfo.deliveryType === 'DELIVERY' ? 'PENDING' : undefined,
        discount: 0,
        notes: deliveryInfo.customerName && deliveryInfo.customerName !== 'Guest' 
          ? `Customer: ${deliveryInfo.customerName}` 
          : undefined
      };

      const response = await api.post('/api/sales', saleData);
      
      if (response.success) {
        // Create sale data for receipt with delivery info
        const completedSale: SaleData = {
          id: (response.data as any)?.id || Date.now().toString(),
          total: total + deliveryInfo.deliveryPrice,
          items: [...cart],
          customerName: deliveryInfo.customerName || 'Guest',
          customerPhone: deliveryInfo.customerPhone,
          deliveryType: deliveryInfo.deliveryType,
          deliveryAddress: deliveryInfo.deliveryAddress,
          deliveryPrice: deliveryInfo.deliveryPrice,
          paymentMethod,
          createdAt: new Date().toISOString()
        };

        setLastSale(completedSale);
        setCart([]);
        setCustomerName('');
        setCustomerSearch('');
        setShowPaymentModal(false);
        setShowReceiptModal(true);

        // Reload products to update stock levels
        loadProducts(searchQuery, selectedCategory);
        
        return true;
      } else {
        setError(response.message || 'Failed to process sale');
        return false;
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      setError('An error occurred while processing the sale');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const holdSale = () => {
    // Future feature: Save current cart state
    alert('Hold Sale feature coming soon!');
  };

  const startNewSale = () => {
    setShowReceiptModal(false);
    setLastSale(null);
    setError(null);
    
    // Reset customer information
    setCustomerName('');
    setCustomerSearch('');
    
    // Auto-focus search for next sale
    setTimeout(() => {
      const searchInput = document.querySelector('#pos-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const toggleCartDrawer = () => {
    setIsCartDrawerOpen(!isCartDrawerOpen);
  };

  const closeCartDrawer = () => {
    setIsCartDrawerOpen(false);
  };

  // Access control
  if (!user || !['business_owner', 'employee'].includes(user.userType)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need business owner or employee privileges to access the POS system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Business Context Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Point of Sale</h1>
          
          {/* Cart Toggle Button - Mobile/Tablet */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCartDrawer}
              className="lg:hidden relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{ backgroundColor: brandStyles.primaryColor }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8h10l4-8H5.4m0 0L5 3H3m2 10v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
            
            <div className="text-right space-y-1">
              <p className="text-xs lg:text-sm text-gray-600">Store: {store?.name}</p>
              <p className="text-xs lg:text-sm text-gray-600">Cashier: {user.firstName} {user.lastName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 lg:mx-6 mt-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm lg:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Main POS Interface */}
      <div className="flex-1 flex relative">
        {/* Products Area - Full width when drawer closed */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          <POSProductGrid
            products={products}
            categories={categories}
            loading={loading}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            onAddToCart={addToCart}
          />
        </div>

        {/* Universal Cart Drawer - All screen sizes */}
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCartDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeCartDrawer}
          />
          
          {/* Drawer */}
          <div className={`absolute right-0 top-0 h-full w-full sm:max-w-md lg:max-w-lg bg-white transform transition-transform duration-300 ease-in-out ${
            isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Current Sale</h2>
              <button
                onClick={closeCartDrawer}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Drawer Content */}
            <div className="h-[calc(100%-64px)] lg:h-[calc(100%-80px)]">
              <POSCart
                cart={cart}
                subtotal={subtotal}
                tax={tax}
                total={total}
                customerName={customerName}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
                onCheckout={handleCheckout}
                onHoldSale={holdSale}
                onCustomerNameChange={setCustomerName}
                isProcessing={isProcessing}
                brandStyles={brandStyles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button - All screen sizes when drawer closed */}
      {!isCartDrawerOpen && cartItemCount > 0 && (
        <button
          onClick={toggleCartDrawer}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 p-3 lg:p-4 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          style={{ backgroundColor: brandStyles.primaryColor }}
        >
          <div className="relative">
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8h10l4-8H5.4m0 0L5 3H3m2 10v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
            </svg>
            <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-medium">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onProcessPayment={processSale}
        isProcessing={isProcessing}
        brandStyles={brandStyles}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={startNewSale}
        sale={lastSale}
        store={store}
        onNewSale={startNewSale}
        brandStyles={brandStyles}
        cashier={user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        } : undefined}
      />
    </div>
  );
}