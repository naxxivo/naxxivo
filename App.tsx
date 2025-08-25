import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Home from './components/Home';
import LoadingScreen from './components/LoadingScreen';
import ProfilePage from './components/profile/ProfilePage';
import AdminLayout from './components/admin/AdminLayout';
import CartPage from './components/cart/CartPage';
import OrdersPage from './components/orders/OrdersPage';
import OrderDetailPage from './components/orders/OrderDetailPage';
import WishlistPage from './components/wishlist/WishlistPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import PaymentPage from './components/payment/PaymentPage';
import ProductDetailPage from './components/products/ProductDetailPage';

export type View = 'home' | 'profile' | 'admin' | 'cart' | 'orders' | 'wishlist' | 'checkout' | 'payment' | 'orderDetail' | 'productDetail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<{ view: View; params: { orderId?: string, productId?: string } }>({ view: 'home', params: {} });

  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!session) {
      setCurrentView({ view: 'home', params: {} });
    }
  }, [session]);

  const navigate = (view: View, params: { orderId?: string, productId?: string } = {}) => {
    setCurrentView({ view, params });
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!session || !profile) {
    return <Auth />;
  }

  const renderView = () => {
      switch(currentView.view) {
          case 'admin':
              return profile.is_admin
                ? <AdminLayout onNavigateHome={() => navigate('home')} />
                : <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} onNavigateToCart={() => navigate('cart')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
          case 'profile':
              return <ProfilePage onNavigateHome={() => navigate('home')} onNavigateToOrders={() => navigate('orders')} onNavigateToWishlist={() => navigate('wishlist')} />;
          case 'cart':
              return <CartPage onNavigateHome={() => navigate('home')} onNavigateToPayment={(orderId) => navigate('payment', { orderId })} />;
          case 'orders':
              return <OrdersPage onNavigateHome={() => navigate('home')} onNavigateToOrder={(orderId) => navigate('orderDetail', { orderId })} />;
          case 'orderDetail':
              if (!currentView.params.orderId) return <OrdersPage onNavigateHome={() => navigate('home')} onNavigateToOrder={(orderId) => navigate('orderDetail', { orderId })} />;
              return <OrderDetailPage orderId={currentView.params.orderId} onNavigateBack={() => navigate('orders')} />;
          case 'wishlist':
              return <WishlistPage onNavigateHome={() => navigate('home')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
          case 'checkout':
              if (!currentView.params.productId) return <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} onNavigateToCart={() => navigate('cart')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
              return <CheckoutPage productId={currentView.params.productId} onNavigateHome={() => navigate('home')} onNavigateToPayment={(orderId) => navigate('payment', { orderId })} />;
          case 'payment':
              if (!currentView.params.orderId) return <OrdersPage onNavigateHome={() => navigate('home')} onNavigateToOrder={(orderId) => navigate('orderDetail', { orderId })} />;
              return <PaymentPage orderId={currentView.params.orderId} onNavigateToOrders={() => navigate('orders')} />;
          case 'productDetail':
              if (!currentView.params.productId) return <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} onNavigateToCart={() => navigate('cart')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
              return <ProductDetailPage productId={currentView.params.productId} onNavigateBack={() => navigate('home')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
          case 'home':
          default:
              return <Home onNavigateToProfile={() => navigate('profile')} onNavigateToAdmin={() => navigate('admin')} onNavigateToCart={() => navigate('cart')} onNavigateToCheckout={(productId) => navigate('checkout', { productId })} onNavigateToDetail={(productId) => navigate('productDetail', { productId })} />;
      }
  }

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      {renderView()}
    </div>
  );
};

export default App;