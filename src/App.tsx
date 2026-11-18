import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import CatererDetails from './pages/CatererDetails';
import OrderFlow from './pages/OrderFlow';
import JoinCaterer from './pages/JoinCaterer';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import PartnerSelection from './pages/PartnerSelection';
import Explore from './pages/Explore';
import MyBusinesses from './pages/MyBusinesses';
import RegistrationSuccess from './pages/RegistrationSuccess';
import PartnerDashboard from './pages/PartnerDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlatformSettingsProvider } from './contexts/PlatformSettingsContext';
import { CatererFilterProvider } from './contexts/CatererFilterContext';
import { initializeSupabaseSync } from './lib/supabaseSync';

import AdminEditCaterer from './pages/AdminEditCaterer';

import Profile from './pages/Profile';
import Orders from './pages/Orders';
import EditCaterer from './pages/EditCaterer';

import CatererDashboard from './pages/CatererDashboard';
import CatererLogin from './pages/CatererLogin';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  const { pathname } = useLocation();

  const isCatererDashboard = 
    pathname.startsWith('/caterer-dashboard') || 
    pathname.startsWith('/partner') || 
    pathname.startsWith('/businesses') || 
    pathname.startsWith('/edit-business');

  const isAdminDashboard = 
    pathname.startsWith('/admin-dashboard') || 
    pathname.startsWith('/admin/');

  const isDashboardRoute = isCatererDashboard || isAdminDashboard;

  return (
    <div className={`flex flex-col min-h-screen md:pb-0 ${isDashboardRoute ? 'pb-0' : 'pb-16'}`}>
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  const isAbout = title === 'About Us';
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pt-14 sm:pt-[60px] pb-20">
      <div className="bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01291D] border-b-2 border-[#D9A323]/70 py-12 sm:py-14 px-4 text-center">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#011C13]/80 border border-[#D9A323]/60 text-[#F8D76A] text-[10.5px] font-bold uppercase tracking-[0.12em] mb-3">
          PlanMyChoice
        </span>
        <h1
          className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {title}
        </h1>
        <p className="text-[#E7EFEA]/85 text-sm max-w-xl mx-auto mt-2.5">
          {isAbout
            ? 'India’s curated catering marketplace connecting celebrations with verified, master-crafted kitchens.'
            : 'Reach out to our concierge & support team for bookings, partner onboarding, or event assistance.'}
        </p>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-[#FFFDF8] rounded-[24px] border border-[#DFC78A] shadow-[0_10px_30px_rgba(140,105,32,0.09)] p-8 sm:p-10 text-center">
          <h2
            className="text-2xl font-display font-bold text-[#0F241C] mb-3"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {isAbout ? 'Crafting Memorable Celebrations' : 'We Are Here to Help'}
          </h2>
          <p className="text-[#5C5446] text-sm leading-relaxed max-w-lg mx-auto mb-6">
            {isAbout
              ? 'PlanMyChoice brings transparent menu customization, verified catering partners, and seamless event booking together under one refined platform.'
              : 'For assistance with existing bookings, custom packages, or partner registrations, please reach us at support@planmychoice.com.'}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-b from-[#065239] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/60 text-xs font-bold shadow-sm hover:brightness-110 transition-all"
          >
            Explore Verified Caterers
          </Link>
        </div>
      </div>
    </div>
  );
}

import { ToastProvider } from './components/Toast';

function RootHome() {
  return <Home />;
}

function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#01241A] via-[#033E2D] to-[#011D15] p-4">
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        <div className="mb-8">
          <img
            src="/assets/aistudio/image_6ce019e3.png"
            alt="PlanMyChoice"
            className="w-60 h-auto object-contain mx-auto brightness-105 contrast-110 drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D9A323]/25 border-t-[#F8D76A]" />

          <div className="flex flex-col gap-1">
            <p className="text-[#FFFDF8] font-medium font-poppins text-sm tracking-wide">
              Restoring your session...
            </p>
            <p className="text-[#E9DEC4]/70 text-xs font-poppins">
              Please wait while we secure your connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppInitializer() {
  const { loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RootHome />} />
          <Route path="caterer/:id" element={<CatererDetails />} />
          <Route path="join" element={<JoinCaterer />} />
          <Route path="admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/partners" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore-caterers" element={<Explore />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="about" element={<PlaceholderPage title="About Us" />} />
          <Route path="contact" element={<PlaceholderPage title="Contact Us" />} />
          <Route path="login" element={<AuthPage mode="login" />} />
          <Route path="signup" element={<AuthPage mode="signup" />} />
          <Route path="caterer-login" element={<CatererLogin />} />
          <Route path="partner-selection" element={<PartnerSelection />} />
          <Route path="businesses" element={<ProtectedRoute allowedRoles={['caterer', 'admin']}><MyBusinesses /></ProtectedRoute>} />
          <Route path="registration-success" element={<RegistrationSuccess />} />
          <Route path="partner-dashboard/:id" element={<ProtectedRoute allowedRoles={['caterer', 'admin']}><PartnerDashboard /></ProtectedRoute>} />
          <Route path="caterer-dashboard" element={<ProtectedRoute allowedRoles={['caterer', 'admin']}><CatererDashboard /></ProtectedRoute>} />
          <Route path="edit-business/:id" element={<ProtectedRoute allowedRoles={['caterer', 'admin']}><EditCaterer /></ProtectedRoute>} />
          <Route path="admin/caterers/view/:id" element={<ProtectedRoute allowedRoles={['admin']}><CatererDetails /></ProtectedRoute>} />
          <Route path="admin/caterers/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditCaterer /></ProtectedRoute>} />
          <Route path="order/:id" element={<OrderFlow />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  useEffect(() => {
    // initializeSync is imported from ./lib/supabase (or similar) or initializeSupabaseSync from supabase.ts
    // Let's call the imported initializeSupabaseSync
    initializeSupabaseSync();
  }, []);

  return (
    <AuthProvider>
      <PlatformSettingsProvider>
        <CatererFilterProvider>
          <ToastProvider />
          <AppInitializer />
        </CatererFilterProvider>
      </PlatformSettingsProvider>
    </AuthProvider>
  );
}
