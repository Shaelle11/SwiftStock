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
  paymentMethod: string;
  createdAt: string;
}

export default function BusinessPOS() {
  const { user, token } = useAuth();
  const { store } = useContext(AuthContext)!;
  const params = useParams();
  const businessId = params?.businessId as string;
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
  
  // Tax settings (default 7.5% VAT for Nigeria)
  const TAX_RATE = 0.075;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * TAX_RATE;
  const discount = 0; // Future feature
  const total = subtotal + tax - discount;

  // Load products on component mount
  useEffect(() => {
    if (user && token) {
      loadProducts();
    }
  }, [user, token, businessId]);

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
        limit: '50', // Show more products for POS
        storeId: businessId
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await api.get<PaginatedResponse<Product>>('/api/products', params, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
    
    setShowPaymentModal(true);
  };

  const processSale = async (paymentMethod: string, amountReceived?: number) => {
    if (cart.length === 0) return false;

    setIsProcessing(true);
    setError(null);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.sellingPrice
        })),
        paymentMethod,
        customerId: null, // Future feature
        customerName: customerName || 'Guest',
        subtotal,
        tax,
        discount,
        total,
        amountReceived: amountReceived || total,
        storeId: businessId
      };

      const response = await api.post('/api/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.success) {
        // Create sale data for receipt
        const completedSale: SaleData = {
          id: response.data.id || Date.now().toString(),
          total,
          items: [...cart],
          customerName: customerName || 'Guest',
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
    
    // Auto-focus search for next sale
    setTimeout(() => {
      const searchInput = document.querySelector('#pos-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">Store: {store?.name}</p>
            <p className="text-sm text-gray-600">Cashier: {user.firstName} {user.lastName}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main POS Interface */}
      <div className="flex-1 flex">
        {/* Products Area - 65% */}
        <div className="flex-1 p-6 overflow-hidden" style={{ width: '65%' }}>
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

        {/* Cart Area - 35% */}
        <div className="bg-white border-l border-gray-200" style={{ width: '35%', minWidth: '400px' }}>
          <POSCart
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            customerName={customerName}
            customerSearch={customerSearch}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
            onHoldSale={holdSale}
            onCustomerNameChange={setCustomerName}
            onCustomerSearchChange={setCustomerSearch}
            isProcessing={isProcessing}
            brandStyles={brandStyles}
          />
        </div>
      </div>

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
      />
    </div>
  );
}