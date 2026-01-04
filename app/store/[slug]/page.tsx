'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '@/lib/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import type { Store, Product, OrderItem } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface StoreData {
  store: Store & {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  products: Product[];
  categories: string[];
}

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { cart, addToCart: addToCartContext, getCartItemCount, getCartTotal, updateQuantity, removeFromCart: removeFromCartContext } = useCart();
  
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  // Guest checkout form data
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cash',
  });

  const loadStoreData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;

      const response = await publicApi.get<{store: StoreData['store'], products: Product[], categories: string[]}>(`/api/public/store/${slug}`, params);
      
      if (response.success && response.data) {
        setStoreData({
          store: response.data.store,
          products: response.data.products,
          categories: response.data.categories,
        });
      } else {
        setError('Store not found');
      }
    } catch (err) {
      setError('Failed to load store');
      console.error('Error loading store:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, searchQuery, selectedCategory]);

  useEffect(() => {
    if (slug) {
      loadStoreData();
    }
  }, [slug, loadStoreData]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user) {
      // Use persistent cart for logged-in users
      try {
        await addToCartContext(product.id, quantity);
        setShowCartDrawer(true);
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    } else {
      // For guest users, redirect to login or show guest checkout
      alert('Please log in to add items to cart for later purchase.');
    }
  };

  // Cart functions will be handled by the cart drawer component when implemented

  const cartTotal = getCartTotal();

  const handleGuestCheckout = async () => {
    if (!guestForm.firstName || !guestForm.lastName || !guestForm.email || !guestForm.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await publicApi.post<{order: {orderNumber: string, id: string, total: number, status: string, customerEmail: string, items: OrderItem[]}}>('/api/guest-checkout', {
        storeSlug: slug,
        customerInfo: {
          firstName: guestForm.firstName,
          lastName: guestForm.lastName,
          email: guestForm.email,
          phone: guestForm.phone,
          address: guestForm.address,
        },
        items: cart?.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })) || [],
        paymentMethod: guestForm.paymentMethod,
      });

      if (response.success && response.data?.order) {
        setOrderNumber(response.data.order.orderNumber);
        setOrderComplete(true);
        // Note: For logged-in users, we'd clear the cart context here
        // Reset form
        setGuestForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          paymentMethod: 'cash',
        });
      } else {
        alert(response.message || 'Failed to process order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openCheckoutModal = () => {
    if (!cart?.items || cart.items.length === 0) return;
    setShowCartDrawer(false);
    setShowCheckoutModal(true);
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setOrderComplete(false);
    setOrderNumber(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{error || 'Store not found'}</p>
          <Link href="/" className="text-blue-600 hover:underline">Return to SwiftStock</Link>
        </div>
      </div>
    );
  }

  const { store, products, categories } = storeData;

  // Transform Google Drive URL to direct image URL
  const getDirectImageUrl = (url: string) => {
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--primary-color': store.primaryColor, '--accent-color': store.accentColor } as React.CSSProperties}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: store.primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <Link 
                href="/explore" 
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
                title="Back to Explore"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              
              {store.logoUrl && (
                <Image 
                  src={getDirectImageUrl(store.logoUrl)} 
                  alt={store.name} 
                  width={48} 
                  height={48} 
                  className="rounded-lg object-cover" 
                />
              )}
              <div>
                <h1 className="text-3xl font-bold" style={{ color: store.primaryColor }}>{store.name}</h1>
                {store.description && (
                  <p className="text-gray-600">{store.description}</p>
                )}
              </div>
            </div>
            
            {/* Cart Icon */}
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H2m1 8h16m-7 4v8m0 0v-8m0 8h4m-4 0h-4" />
              </svg>
              <span>Cart</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="" className="text-gray-600">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category} className="text-gray-900">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {product.imageUrl && (
                <Image 
                  src={getDirectImageUrl(product.imageUrl)} 
                  alt={product.name}
                  width={300}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold" style={{ color: store.primaryColor }}>
                    ₦{product.sellingPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.stockQuantity} in stock
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stockQuantity === 0}
                  className="w-full py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: product.stockQuantity > 0 ? store.accentColor : undefined,
                    color: product.stockQuantity > 0 ? 'white' : undefined,
                  }}
                >
                  {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {searchQuery || selectedCategory 
                ? 'No products found matching your criteria.' 
                : 'No products available at this time.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {showCartDrawer && cart?.items && cart.items.length > 0 && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {cart?.items && cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">₦{item.product.sellingPrice.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={async () => await updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-gray-900 font-medium">{item.quantity}</span>
                      <button 
                        onClick={async () => await updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 font-bold"
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={async () => await removeFromCartContext(item.productId)}
                      className="text-red-600 hover:text-red-800 p-1 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              )}
            </div>
            
            <div className="border-t-2 pt-6 bg-gray-50 -mx-6 px-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-xl text-gray-900">Total:</span>
                <span className="font-bold text-2xl" style={{ color: store.primaryColor }}>
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>
              
              <button 
                className="w-full py-4 px-4 rounded-lg font-bold text-lg text-white transition-colors hover:opacity-90 shadow-lg"
                style={{ backgroundColor: store.accentColor }}
                onClick={openCheckoutModal}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {orderComplete ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-4">Your order has been successfully placed.</p>
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="font-semibold">Order Number:</p>
                    <p className="text-lg font-mono" style={{ color: store.primaryColor }}>{orderNumber}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    We&apos;ll send you an email confirmation at {guestForm.email}
                  </p>
                  <button
                    onClick={closeCheckoutModal}
                    className="w-full py-2 px-4 rounded-lg font-medium text-white"
                    style={{ backgroundColor: store.accentColor }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
                    <button
                      onClick={closeCheckoutModal}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      ×
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cart?.items?.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-900">{item.product.name} × {item.quantity}</span>
                          <span className="text-gray-900">₦{(item.product.sellingPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-900">Total:</span>
                        <span style={{ color: store.primaryColor }}>₦{cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Checkout Form */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Customer Information</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={guestForm.firstName}
                        onChange={(e) => setGuestForm({...guestForm, firstName: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={guestForm.lastName}
                        onChange={(e) => setGuestForm({...guestForm, lastName: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <input
                      type="email"
                      placeholder="Email *"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />

                    <textarea
                      placeholder="Address (Optional)"
                      value={guestForm.address}
                      onChange={(e) => setGuestForm({...guestForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
                      rows={2}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={guestForm.paymentMethod}
                        onChange={(e) => setGuestForm({...guestForm, paymentMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="cash" className="text-gray-900">Cash</option>
                        <option value="card" className="text-gray-900">Card</option>
                        <option value="transfer" className="text-gray-900">Bank Transfer</option>
                        <option value="other" className="text-gray-900">Other</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGuestCheckout}
                      disabled={isCheckingOut || !cart?.items || cart.items.length === 0}
                      className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: store.accentColor }}
                    >
                      {isCheckingOut ? 'Processing...' : `Place Order - ₦${cartTotal.toLocaleString()}`}
                    </button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        By placing this order, you agree to our terms and conditions.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}