import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartBackend } from './slices/cartSlice';
import type { AppDispatch, RootState } from './redux/store';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryList from './pages/admin/categories/CategoryList';
import AdminCourseList from './pages/admin/courses/AdminCourseList';
import CourseForm from './pages/admin/courses/CourseForm';
import AdminUserList from './pages/admin/users/AdminUserList';
import AdminOrderList from './pages/admin/orders/AdminOrderList';
import AdminOrderDetail from './pages/admin/orders/AdminOrderDetail';

import AdminLogin from './pages/admin/AdminLogin';
import NotFound from './pages/NotFound';

import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch DB cart immediately if the user is already logged in
      dispatch(fetchCartBackend());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Routes Group */}
        <Route path="/admin">
          {/* Admin Login - NOT protected */}
          <Route path="login" element={<AdminLogin />} />

          {/* Protected Admin Area */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserList />} />
              <Route path="orders" element={<AdminOrderList />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="courses" element={<AdminCourseList />} />
              <Route path="courses/new" element={<CourseForm />} />
              <Route path="courses/:slug/edit" element={<CourseForm />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<MainLayout children={<NotFound />} />} />
      </Routes>
    </>
  );
}

export default App;
