import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import Shell        from '@/components/layout/Shell';
import SellerShell  from '@/components/layout/SellerShell';
import RouteGuard   from './RouteGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy-load pages so each chunk is only downloaded when needed
const Home          = lazy(() => import('@/pages/buyer/Home'));
const ProductList   = lazy(() => import('@/pages/buyer/ProductList'));
const ProductDetail = lazy(() => import('@/pages/buyer/ProductDetail'));
const Cart          = lazy(() => import('@/pages/buyer/Cart'));
const Checkout      = lazy(() => import('@/pages/buyer/Checkout'));
const Orders        = lazy(() => import('@/pages/buyer/Orders'));
const Wishlist      = lazy(() => import('@/pages/buyer/Wishlist'));
const Profile       = lazy(() => import('@/pages/shared/Profile'));
const Login         = lazy(() => import('@/pages/auth/Login'));
const SellerDashboard = lazy(() => import('@/pages/seller/Dashboard'));
const SellerProducts  = lazy(() => import('@/pages/seller/Products'));
const SellerProductForm = lazy(() => import('@/pages/seller/ProductForm'));
const SellerOrders    = lazy(() => import('@/pages/seller/Orders'));
const NotFound      = lazy(() => import('@/pages/shared/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Buyer routes — wrapped in main Shell */}
        <Route element={<Shell />}>
          <Route path="/"              element={<Home />} />
          <Route path="/products"      element={<ProductList />} />
          <Route path="/products/:id"  element={<ProductDetail />} />

          {/* Authenticated buyer routes */}
          <Route element={<RouteGuard />}>
            <Route path="/cart"      element={<Cart />} />
            <Route path="/checkout"  element={<Checkout />} />
            <Route path="/orders"    element={<Orders />} />
            <Route path="/wishlist"  element={<Wishlist />} />
            <Route path="/profile"   element={<Profile />} />
          </Route>
        </Route>

        {/* Seller routes */}
        <Route element={<RouteGuard role="seller" />}>
          <Route element={<SellerShell />}>
            <Route path="/seller"                 element={<SellerDashboard />} />
            <Route path="/seller/products"        element={<SellerProducts />} />
            <Route path="/seller/products/new"    element={<SellerProductForm />} />
            <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
            <Route path="/seller/orders"          element={<SellerOrders />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
