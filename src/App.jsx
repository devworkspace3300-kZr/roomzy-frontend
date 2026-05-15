import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/shared/LoadingScreen';

// Lazy loaded pages
const Home = lazy(() => import('./pages/public/Home'));
const Listings = lazy(() => import('./pages/public/Listings'));
const HostelDetails = lazy(() => import('./pages/public/HostelDetails'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/public/RefundPolicy'));
const TermsConditions = lazy(() => import('./pages/public/TermsConditions'));
const ServicePolicy = lazy(() => import('./pages/public/ServicePolicy'));
const PaymentSuccess = lazy(() => import('./pages/public/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/public/PaymentCancel'));


const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const OTPVerification = lazy(() => import('./pages/auth/OTPVerification'));

const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const OwnerDashboard = lazy(() => import('./pages/dashboard/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const ListHostel = lazy(() => import('./pages/dashboard/owner/ListHostel'));
const ManageRooms = lazy(() => import('./pages/dashboard/owner/ManageRooms'));
const OwnerVerification = lazy(() => import('./pages/dashboard/owner/OwnerVerification'));
const MyBookings = lazy(() => import('./pages/dashboard/student/MyBookings'));

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Pages with Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/hostel/:id" element={<HostelDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/service-policy" element={<ServicePolicy />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />

            </Route>

            {/* Dashboard Pages (Independent of Public Layout) */}
            <Route path="/dashboard/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/owner" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/owner/verify" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerVerification />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/owner/list-hostel" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <ListHostel />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/owner/manage-rooms/:hostelId" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <ManageRooms />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student/bookings" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute allowedRoles={['student', 'owner', 'admin']}>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Auth Pages (no Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}
