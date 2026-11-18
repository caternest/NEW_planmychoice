import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeSaveRegistrations } from '../lib/utils';
import { Users, Menu, X, LogOut, Settings, Handshake, ShoppingBag, Building, Bell, Package, ChevronDown, Gauge, ClipboardList, UserCircle, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabase } from '../lib/supabase';
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [registrations, setRegistrations] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('registrations');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const fetchRegistrations = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('caterer_registrations')
          .select('*');
        if (!error && data) {
          setRegistrations(data);
          safeSaveRegistrations(data);
        }
      } catch (err) {
        console.error("Failed to fetch registrations in Navbar:", err);
      }
    }
  };

  const hasCatererBusinesses = React.useMemo(() => {
    if (!user) return false;
    return registrations.some((r: any) => 
      (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) 
      && r.status !== 'Deleted'
    );
  }, [user, registrations]);

  const hasApprovedCatererBusiness = React.useMemo(() => {
    if (!user) return false;
    return registrations.some((r: any) => 
      (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) 
      && r.status === 'Approved'
    );
  }, [user, registrations]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  const handleExploreCaterersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isCurrentlyExplorePage = ['/explore', '/explore-caterers'].includes(location.pathname);
    if (isCurrentlyExplorePage) {
      e.preventDefault();
      const element = document.getElementById('explore-marketplace');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const fetchNavbarNotifications = async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data) {
          let filtered = data;
          if (user.roles.includes('admin')) {
            filtered = data.filter((n: any) => n.targetRole === 'admin');
          } else if (user.role === 'caterer') {
            const myCatererIds = registrations
              .filter((r: any) => r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase()))
              .map((r: any) => r.id);
            filtered = data.filter((n: any) => n.targetRole === 'caterer' && (myCatererIds.includes(n.catererId) || !n.catererId));
          } else {
            const myOrderIds = JSON.parse(localStorage.getItem('orders') || '[]')
              .filter((o: any) => o.userId === user.id || o.customerEmail?.toLowerCase() === user.email.toLowerCase() || o.customerName === user.name)
              .map((o: any) => o.id);
            filtered = data.filter((n: any) => n.targetRole === 'customer' && (myOrderIds.includes(n.orderId) || !n.orderId));
          }
          setNotifications(filtered);
          return;
        }
      } catch(e) {
        console.error("Supabase notifications loading failed:", e);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem('notifications') || '[]';
      const parsed = JSON.parse(raw);
      let filtered = parsed;
      if (user.roles.includes('admin')) {
        filtered = parsed.filter((n: any) => n.targetRole === 'admin');
      } else if (user.role === 'caterer') {
        const myCatererIds = registrations
          .filter((r: any) => r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase()))
          .map((r: any) => r.id);
        filtered = parsed.filter((n: any) => n.targetRole === 'caterer' && (myCatererIds.includes(n.catererId) || !n.catererId));
      } else {
        const myOrderIds = JSON.parse(localStorage.getItem('orders') || '[]')
          .filter((o: any) => o.userId === user.id || o.customerEmail?.toLowerCase() === user.email.toLowerCase() || o.customerName === user.name)
          .map((o: any) => o.id);
        filtered = parsed.filter((n: any) => n.targetRole === 'customer' && (myOrderIds.includes(n.orderId) || !n.orderId));
      }
      setNotifications(filtered);
    } catch(e) {}
  };

  useEffect(() => {
    fetchNavbarNotifications();
    fetchRegistrations();

    const supabase = getSupabase();
    if (supabase && user) {
      // Setup real-time postgres changes listener
      const channel = supabase
        .channel('navbar-notifications-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          fetchNavbarNotifications();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Click outside and escaping close implementation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Profile outside close
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        if (!target.closest('[data-keep-profile-open="true"]')) {
          setIsProfileDropdownOpen(false);
        }
      }

      // Notifications outside close
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Closes open segments on navigation change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  const handleMarkNavbarNotificationRead = async (id: string, orderId?: string) => {
    // 1. Update localStorage
    try {
      const raw = localStorage.getItem('notifications') || '[]';
      const parsed = JSON.parse(raw);
      const updated = parsed.map((n: any) => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('notifications', JSON.stringify(updated));
    } catch(e) {}

    // 2. Update Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await (supabase.from('notifications') as any).update({ read: true }).eq('id', id);
      } catch(e) {}
    }

    await fetchNavbarNotifications();

    // 3. Redirect matching roles
    if (user) {
      if (user.roles.includes('admin')) {
        navigate('/admin-dashboard');
      } else if (user.roles.includes('partner')) {
        navigate('/caterer-dashboard');
      } else {
        navigate('/orders');
      }
    }
  };

  const handleClearAllNavbarNotifications = async () => {
    const raw = localStorage.getItem('notifications') || '[]';
    try {
      const parsed = JSON.parse(raw);
      const idsToRemove = notifications.map(n => n.id);
      const remaining = parsed.filter((n: any) => !idsToRemove.includes(n.id));
      localStorage.setItem('notifications', JSON.stringify(remaining));
    } catch(e) {}

    const supabase = getSupabase();
    if (supabase) {
      try {
        const idsToRemove = notifications.map(n => n.id);
        await (supabase.from('notifications') as any).delete().in('id', idsToRemove);
      } catch(e) {}
    }

    fetchNavbarNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navClass =
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center h-14 sm:h-[60px] bg-gradient-to-r from-[#01241A] via-[#03402E] to-[#01241A] border-t border-b border-[#D9A323]/80 shadow-[0_4px_18px_rgba(1,28,20,0.42)]';

  const textClass =
    'relative transition-colors font-poppins text-[13px] tracking-wide whitespace-nowrap text-[#FFFDF8]/95 hover:text-[#F5C642] font-medium';

  return (
    <nav className={navClass} id="main-navigation-navbar">
      {/* Decorative Emerald Texture & Antique-Gold Corner / Center Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          {/* Subtle Center Emerald Glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 120% at 50% 50%, rgba(16, 102, 74, 0.28) 0%, transparent 72%)',
            }}
          />

          {/* Top & Bottom Inner Hairline Gold Accent */}
          <div className="absolute inset-x-0 top-[2px] h-px bg-gradient-to-r from-transparent via-[#F8D76A]/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-[2px] h-px bg-gradient-to-r from-transparent via-[#F8D76A]/35 to-transparent" />

          {/* Left Top & Bottom Corner Gold Filigree Arcs */}
          <svg viewBox="0 0 28 28" fill="none" className="hidden sm:block absolute top-0 left-0 w-5 h-5 text-[#E5B84B]/85">
            <path d="M0 18 C7 16 14 9 18 0" stroke="currentColor" strokeWidth="1.3" />
            <path d="M0 13 C5 11 10 6 13 0" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.65" />
          </svg>
          <svg viewBox="0 0 28 28" fill="none" className="hidden sm:block absolute bottom-0 left-0 w-5 h-5 text-[#E5B84B]/85">
            <path d="M0 10 C7 12 14 19 18 28" stroke="currentColor" strokeWidth="1.3" />
            <path d="M0 15 C5 17 10 22 13 28" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.65" />
          </svg>

          {/* Right Top & Bottom Corner Gold Filigree Arcs */}
          <svg viewBox="0 0 28 28" fill="none" className="hidden sm:block absolute top-0 right-0 w-5 h-5 text-[#E5B84B]/85">
            <path d="M28 18 C21 16 14 9 10 0" stroke="currentColor" strokeWidth="1.3" />
            <path d="M28 13 C23 11 18 6 15 0" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.65" />
          </svg>
          <svg viewBox="0 0 28 28" fill="none" className="hidden sm:block absolute bottom-0 right-0 w-5 h-5 text-[#E5B84B]/85">
            <path d="M28 10 C21 12 14 19 10 28" stroke="currentColor" strokeWidth="1.3" />
            <path d="M28 15 C23 17 18 22 15 28" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.65" />
          </svg>

          {/* Top-Center Ornamental Antique-Gold Scrollwork */}
          <svg viewBox="0 0 120 18" fill="none" className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3.5 text-[#E8BC4B]">
            <path d="M10 1 H44 C49 1 52 5 55 9 C57 12 59 15 60 16 C61 15 63 12 65 9 C68 5 71 1 76 1 H110" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M46 1 C46 6 51 8 54 5 C56 3 54 1 51 2" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <path d="M74 1 C74 6 69 8 66 5 C64 3 66 1 69 2" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <circle cx="60" cy="8" r="1.7" fill="#F8D76A" />
          </svg>

          {/* Bottom-Center Ornamental Antique-Gold Scrollwork */}
          <svg viewBox="0 0 120 18" fill="none" className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-3.5 text-[#E8BC4B]">
            <path d="M10 17 H44 C49 17 52 13 55 9 C57 6 59 3 60 2 C61 3 63 6 65 9 C68 13 71 17 76 17 H110" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M46 17 C46 12 51 10 54 13 C56 15 54 17 51 16" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <path d="M74 17 C74 12 69 10 66 13 C64 15 66 17 69 16" stroke="currentColor" strokeWidth="1.1" fill="none" />
            <circle cx="60" cy="10" r="1.7" fill="#F8D76A" />
          </svg>
        </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center bg-transparent">
          {/* Logo */}
          <div className="flex items-center shrink-0 overflow-visible">
            <Link to="/" className="flex items-center group shrink-0 overflow-visible" id="navbar-logo-link">
              <img
                src="/assets/aistudio/image_6ce019e3.png"
                alt="PlanMyChoice"
                className="w-[180px] sm:w-[215px] md:w-[225px] lg:w-[245px] xl:w-[255px] h-auto object-contain translate-y-[3px] sm:translate-y-[4px] select-none transition-transform duration-200 group-hover:scale-[1.02] brightness-105 contrast-110 drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]"
              />
            </Link>
            <div
              className="hidden sm:block ml-4 lg:ml-5 h-7 w-px bg-gradient-to-b from-transparent via-[#D9A323]/65 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6" id="desktop-links-container">
            <div className="flex items-center gap-5 lg:gap-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    data-keep-profile-open="true" 
                    className={cn(
                      textClass,
                      isActive &&
                        'text-[#F5C642] font-semibold after:content-[""] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[#F5C642]'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 border-l border-[#D9A323]/40 pl-4 sm:pl-5 relative">
              {user && user.roles.includes('admin') && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] uppercase tracking-widest font-bold border whitespace-nowrap bg-[#01241A]/90 border-[#D9A323]/75 text-[#F8D76A] shadow-[0_0_10px_rgba(217,163,35,0.18)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8D76A]" aria-hidden="true" />
                      <span>Admin Mode</span>
                  </div>
              )}
              {!user ? (
                <div className="flex items-center gap-2.5" id="navbar-anonymous-actions">
                  <Link
                    to="/caterer-login"
                    className={cn(
                      'flex items-center gap-1.5 font-poppins font-medium rounded-full transition-all whitespace-nowrap',
                      location.pathname === '/caterer-login'
                        ? 'px-4 py-1.5 text-[12px] text-[#F8D76A] font-semibold bg-[#034C37] border border-[#F8D76A] shadow-[0_0_14px_rgba(217,163,35,0.4)]'
                        : 'px-4 py-1.5 text-[12px] text-[#FFFDF8] bg-[#012A1E]/75 hover:bg-[#024230] border border-[#D9A323] hover:border-[#F8D76A] hover:shadow-[0_0_12px_rgba(217,163,35,0.28)]'
                    )}
                  >
                    <Users size={14} className="text-[#F5C642] shrink-0" />
                    <span>Caterer Login</span>
                  </Link>
                  <Link
                    to="/login"
                    className={cn(
                      'font-poppins font-medium rounded-full transition-all whitespace-nowrap',
                      location.pathname === '/login'
                        ? 'px-4 py-1.5 text-[12px] text-[#F8D76A] font-semibold bg-[#034C37] border border-[#F8D76A] shadow-[0_0_14px_rgba(217,163,35,0.4)]'
                        : 'px-4 py-1.5 text-[12px] text-[#FFFDF8] bg-[#012A1E]/75 hover:bg-[#024230] border border-[#D9A323] hover:border-[#F8D76A] hover:shadow-[0_0_12px_rgba(217,163,35,0.22)]'
                    )}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className={cn(
                      'rounded-full font-poppins transition-all whitespace-nowrap',
                      location.pathname === '/signup'
                        ? 'px-5 py-1.5 text-[12px] font-bold bg-gradient-to-b from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] border border-[#FFF2B2] ring-2 ring-[#F8D76A]/65 shadow-[0_0_16px_rgba(248,215,106,0.45)]'
                        : 'px-5 py-1.5 text-[12px] font-bold bg-gradient-to-b from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] hover:brightness-105 border border-[#FFF2B2]/65 shadow-[0_2px_10px_rgba(217,163,35,0.3)]'
                    )}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4" id="navbar-signed-actions">
                  {/* Real-time sync Bell */}
                  <div className="relative" ref={notificationRef} id="bell-container">
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      aria-label="Notifications"
                      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all border cursor-pointer border-[#D9A323]/75 bg-[#012A1E]/85 hover:bg-[#024230] hover:border-[#F8D76A] text-[#FBF7EF]/90 hover:text-[#F8D76A] shadow-[0_0_10px_rgba(217,163,35,0.15)]"
                      id="navbar-notification-bell-btn"
                    >
                      <Bell size={17} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] rounded-full border-2 border-[#01241A] flex items-center justify-center font-bold font-sans">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-3 w-80 bg-gradient-to-b from-[#FFFDF7] via-[#FDF5E4] to-[#F9EED6] rounded-2xl shadow-[0_20px_48px_rgba(1,22,16,0.45)] border border-[#D9A323]/90 overflow-hidden z-50 text-[#142C24]"
                        >
                          <div className="px-4 py-3.5 border-b border-[#D9A323]/40 bg-gradient-to-br from-[#023224] via-[#012218] to-[#011610] flex justify-between items-center">
                            <h4
                              className="font-bold font-display text-sm text-[#FFFDF8] tracking-wide"
                              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                            >
                              Alerts ({unreadCount})
                            </h4>
                            {notifications.length > 0 && (
                              <button onClick={handleClearAllNavbarNotifications} className="text-[10.5px] text-[#F8D76A] hover:text-[#FFF2B2] hover:underline font-bold cursor-pointer">
                                Clear All
                              </button>
                            )}
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto divide-y divide-[#DFC78A]/50">
                            {notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => handleMarkNavbarNotificationRead(n.id, n.orderId)}
                                className={cn(
                                  "p-3.5 text-left text-xs cursor-pointer hover:bg-[#FAF0D7] transition-colors flex flex-col gap-1",
                                  n.read ? "opacity-75 bg-transparent" : "bg-[#FFFDF8] font-medium"
                                )}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-bold text-[#083A28] line-clamp-1">{n.title}</span>
                                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#D9A323] shrink-0 mt-1 shadow-[0_0_6px_rgba(217,163,35,0.6)]" />}
                                </div>
                                <p className="text-[#5C5240] font-sans leading-relaxed line-clamp-2">{n.message}</p>
                              </div>
                            ))}

                            {notifications.length === 0 && (
                              <div className="p-8 text-center text-[#8A754A]">
                                <p className="font-bold text-sm text-[#083A28]">All caught up! 🎉</p>
                                <p className="text-[11px] mt-1 text-[#7B6947]">No new alerts or booking updates.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef} id="profile-container">
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                        setIsNotificationsOpen(false);
                      }}
                      className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all border cursor-pointer border-[#D9A323]/75 bg-[#012A1E]/85 hover:bg-[#024230] hover:border-[#F8D76A] text-[#FFFDF8] shadow-[0_0_10px_rgba(217,163,35,0.15)]"
                      id="navbar-profile-toggle-btn"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs bg-gradient-to-br from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium font-poppins text-[13px] max-w-[110px] truncate text-[#FFFDF8]">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200 shrink-0 text-[#F8D76A]/85',
                          isProfileDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                          className="absolute right-0 mt-3 w-[268px] sm:w-[278px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#D9A323]/90 shadow-[0_20px_48px_rgba(1,22,16,0.52),0_0_0_1px_rgba(248,215,106,0.18)] overflow-visible z-50"
                        >
                          {/* Top Golden Pointer Arrow */}
                          <svg
                            viewBox="0 0 18 10"
                            fill="none"
                            className="absolute -top-[9px] right-7 w-[18px] h-[10px] pointer-events-none z-20 drop-shadow-[0_-1px_2px_rgba(0,0,0,0.25)]"
                            aria-hidden="true"
                          >
                            <path d="M1 10 L9 1.5 L17 10 Z" fill="#023022" />
                            <path d="M1 9.5 L9 1.5 L17 9.5" stroke="#D9A323" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>

                          {/* Inner Clipped Container */}
                          <div className="rounded-[15px] overflow-hidden bg-[#FDF5E4]">
                            {/* Dark Emerald Dropdown Header */}
                            <div className="relative bg-gradient-to-br from-[#023224] via-[#012218] to-[#011610] px-4 pt-3.5 pb-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCE07E] via-[#F2BE3B] to-[#D49617] text-[#052419] flex items-center justify-center font-bold text-base shrink-0 shadow-[0_2px_10px_rgba(245,198,66,0.35)] border border-[#FFF2B2]/60">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className="font-bold text-white text-[14px] leading-tight truncate"
                                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                                    >
                                      {user.name}
                                    </p>
                                    {user.roles.includes('admin') ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0 border border-[#F5CB5C]/85 bg-gradient-to-b from-[#8E1E14] to-[#63130D] text-[#FDE68A] shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
                                        <Crown size={9.5} className="text-[#F8D76A] fill-[#F8D76A] shrink-0" />
                                        <span>Admin</span>
                                      </span>
                                    ) : user.role === 'caterer' ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 border border-[#D9A323]/80 bg-[#023D2C] text-[#F8D76A]">
                                        Partner
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="text-[11.5px] text-[#E9DEC4]/85 truncate mt-0.5 font-sans">
                                    {user.email}
                                  </p>
                                </div>
                              </div>

                              {/* Gold Flowing Wave Separator */}
                              <svg
                                viewBox="0 0 280 18"
                                preserveAspectRatio="none"
                                className="absolute bottom-0 inset-x-0 w-full h-[14px] pointer-events-none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M0 4 Q 68 15 140 8 T 280 6 L 280 18 L 0 18 Z"
                                  fill="#FFFDF7"
                                />
                                <path
                                  d="M0 4 Q 68 15 140 8 T 280 6"
                                  fill="none"
                                  stroke="url(#dropdownGoldWave)"
                                  strokeWidth="2.2"
                                />
                                <defs>
                                  <linearGradient id="dropdownGoldWave" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#D49617" />
                                    <stop offset="48%" stopColor="#FCE48D" />
                                    <stop offset="100%" stopColor="#C98A15" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>

                            {/* Menu Body */}
                            <div className="bg-gradient-to-b from-[#FFFDF7] via-[#FDF5E4] to-[#F9EED6] px-2.5 pt-1.5 pb-2.5 flex flex-col">
                              {user.roles.includes('admin') ? (
                                <>
                                  <Link
                                    to="/admin-dashboard"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/admin-dashboard'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Gauge size={16} className="shrink-0" />
                                    <span>Admin Dashboard</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/admin/partners"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/admin/partners'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Handshake size={16} className="shrink-0" />
                                    <span>Partner Registrations</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/admin/orders"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/admin/orders'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <ClipboardList size={16} className="shrink-0" />
                                    <span>All Orders</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/profile"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/profile'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <UserCircle size={16} className="shrink-0" />
                                    <span>Admin Profile</span>
                                  </Link>
                                </>
                              ) : user.role === 'caterer' ? (
                                <>
                                  <Link
                                    to="/caterer-dashboard"
                                    onClick={() => {
                                      if (!localStorage.getItem('catererDashboardId') && user) {
                                        try {
                                          const raw = localStorage.getItem('registrations');
                                          if (raw) {
                                            const allRegs = JSON.parse(raw);
                                            const firstApproved = allRegs.find((r: any) => (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) && r.status === 'Approved');
                                            if (firstApproved) {
                                              localStorage.setItem('catererDashboardId', firstApproved.id);
                                            } else {
                                              const firstAny = allRegs.find((r: any) => (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) && r.status !== 'Deleted');
                                              if (firstAny) {
                                                localStorage.setItem('catererDashboardId', firstAny.id);
                                              }
                                            }
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }
                                      setIsProfileDropdownOpen(false);
                                    }}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/caterer-dashboard'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Gauge size={16} className="shrink-0" />
                                    <span>My Dashboard</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/orders"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/orders'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <ClipboardList size={16} className="shrink-0" />
                                    <span>My Orders</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/businesses"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/businesses'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Building size={16} className="shrink-0" />
                                    <span>My Business</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/businesses"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419] transition-all duration-150"
                                  >
                                    <Package size={16} className="shrink-0" />
                                    <span>My Packages</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/profile"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/profile'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Settings size={16} className="shrink-0" />
                                    <span>Settings</span>
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link
                                    to="/profile"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/profile'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <UserCircle size={16} className="shrink-0" />
                                    <span>My Profile</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/orders"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/orders'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <ClipboardList size={16} className="shrink-0" />
                                    <span>My Bookings</span>
                                  </Link>
                                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-[#DFC178]/55 to-transparent" />

                                  <Link
                                    to="/partner-selection"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150',
                                      location.pathname === '/partner-selection'
                                        ? 'bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]'
                                        : 'text-[#142C24] font-semibold hover:bg-gradient-to-r hover:from-[#FCE69A]/90 hover:via-[#F7D774]/90 hover:to-[#EFC44E]/90 hover:text-[#052419]'
                                    )}
                                  >
                                    <Handshake size={16} className="shrink-0" />
                                    <span>Become a Partner</span>
                                  </Link>
                                </>
                              )}

                              {/* Logout Separator & Button */}
                              <div className="h-px mx-1.5 my-1.5 bg-gradient-to-r from-[#DFC178]/20 via-[#D4A646]/70 to-[#DFC178]/20" />
                              <button
                                onClick={() => {
                                  logout();
                                  setIsProfileDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-[#C02626] hover:bg-red-50/90 hover:text-[#991B1B] transition-colors cursor-pointer"
                              >
                                <LogOut size={16} className="shrink-0" />
                                <span>Logout</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center" id="mobile-toggle-btn-container">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-colors text-[#F8D76A] hover:text-[#FFF2B2]"
              id="navbar-mobile-toggle-btn"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-out Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[290px] max-w-[85vw] bg-gradient-to-b from-[#FFFDF7] via-[#FDF5E4] to-[#F9EED6] shadow-2xl z-55 md:hidden flex flex-col border-l border-[#D9A323]/60 overflow-hidden"
              id="mobile-navigation-drawer"
            >
              {/* Drawer Header */}
              <div className="px-4 py-3 border-b border-[#D9A323]/40 flex items-center justify-between bg-[#012E22] text-white">
                <img
                  src="/assets/aistudio/image_6ce019e3.png"
                  alt="PlanMyChoice"
                  className="w-[185px] h-auto object-contain translate-y-[2px] select-none brightness-105 contrast-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#F8D76A]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* User info if logged in */}
                {user && (
                  <div className="p-3.5 bg-gradient-to-br from-[#023224] via-[#012218] to-[#011610] border border-[#D9A323]/60 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCE07E] via-[#F2BE3B] to-[#D49617] text-[#052419] flex items-center justify-center font-bold text-lg border border-[#FFF2B2]/60 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                      <p
                        className="font-bold text-[#FFFDF8] text-sm truncate"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {user.name}
                      </p>
                      <p className="text-xs text-[#E9DEC4]/85 truncate">{user.email}</p>
                      {user.roles.includes('admin') && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[8.5px] bg-gradient-to-b from-[#8E1E14] to-[#63130D] text-[#FDE68A] border border-[#F5CB5C]/80 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                          <Crown size={8.5} className="text-[#F8D76A] fill-[#F8D76A]" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Nav Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8A754A] uppercase tracking-widest px-3 block mb-1">Navigation</span>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      location.pathname === "/"
                        ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                        : "text-[#142C24] hover:bg-[#FAF0D7]"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      location.pathname === "/about"
                        ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                        : "text-[#142C24] hover:bg-[#FAF0D7]"
                    )}
                  >
                    About Us
                  </Link>

                  {user && (
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/orders"
                          ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                          : "text-[#142C24] hover:bg-[#FAF0D7]"
                      )}
                    >
                      <ShoppingBag size={16} className={location.pathname === "/orders" ? "text-[#052419]" : "text-[#B87D16]"} />
                      {user.role === 'caterer' ? 'My Orders' : 'My Bookings'}
                    </Link>
                  )}
                </div>

                {/* Role Specific/Management Links */}
                <div className="space-y-1 border-t border-[#DFC78A]/50 pt-4">
                  <span className="text-[10px] font-bold text-[#8A754A] uppercase tracking-widest px-3 block mb-1">Partner Portal</span>
                  {user ? (
                    <>
                      {user.role === 'caterer' ? (
                        <>
                          <Link
                            to="/caterer-dashboard"
                            onClick={() => {
                              if (!localStorage.getItem('catererDashboardId') && user) {
                                try {
                                  const raw = localStorage.getItem('registrations');
                                  if (raw) {
                                    const allRegs = JSON.parse(raw);
                                    const firstApproved = allRegs.find((r: any) => (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) && r.status === 'Approved');
                                    if (firstApproved) {
                                      localStorage.setItem('catererDashboardId', firstApproved.id);
                                    } else {
                                      const firstAny = allRegs.find((r: any) => (r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase())) && r.status !== 'Deleted');
                                      if (firstAny) {
                                        localStorage.setItem('catererDashboardId', firstAny.id);
                                      }
                                    }
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                              location.pathname === "/caterer-dashboard"
                                ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                                : "text-[#083A28] hover:bg-[#FAF0D7]"
                            )}
                          >
                            <Settings size={16} className="text-[#B87D16]" /> Partner Dashboard
                          </Link>
                          <Link
                            to="/businesses"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                              location.pathname === "/businesses"
                                ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                                : "text-[#142C24] hover:bg-[#FAF0D7]"
                            )}
                          >
                            <Building size={16} className="text-[#B87D16]" /> My Businesses
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/partner-selection"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                            location.pathname === "/partner-selection"
                              ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                              : "text-[#142C24] hover:bg-[#FAF0D7]"
                          )}
                        >
                          <Handshake size={16} className="text-[#B87D16]" /> Become a Partner
                        </Link>
                      )}

                      {user.roles.includes('admin') && (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D9A323]/65",
                            location.pathname.startsWith("/admin")
                              ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                              : "bg-[#01291D] text-[#F8D76A] hover:bg-[#023A28]"
                          )}
                        >
                          <Crown size={15} className={location.pathname.startsWith("/admin") ? "text-[#052419]" : "text-[#F8D76A]"} /> Admin Dashboard
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      to="/partner-selection"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        location.pathname === "/partner-selection"
                          ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                          : "text-[#142C24] hover:bg-[#FAF0D7]"
                      )}
                    >
                      <Handshake size={16} className="text-[#B87D16]" /> Join as Caterer
                    </Link>
                  )}
                </div>

                {/* Profile Settings / Auth */}
                <div className="space-y-1 border-t border-[#DFC78A]/50 pt-4">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                          location.pathname === "/profile"
                            ? "bg-gradient-to-r from-[#FCE69A] via-[#F7D774] to-[#EFC44E] text-[#052419] font-bold shadow-[0_2px_8px_rgba(217,163,35,0.22)]"
                            : "text-[#142C24] hover:bg-[#FAF0D7]"
                        )}
                      >
                        <Settings size={16} className="text-[#B87D16]" /> My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#C02626] hover:bg-red-50/90 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2.5 pt-2">
                      <Link
                        to="/caterer-login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex justify-center items-center gap-2 px-3 py-2.5 text-xs font-semibold bg-[#012A1E] text-[#FFFDF8] rounded-full border border-[#D9A323] hover:bg-[#024230] tracking-wide transition-colors"
                      >
                        <Users size={14} className="text-[#F5C642]" />
                        <span>Caterer Login</span>
                      </Link>
                      <div className="grid grid-cols-2 gap-2 mt-0.5">
                        <Link
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-center px-3 py-2.5 text-xs font-bold border border-[#D9A323]/80 rounded-full text-[#042419] bg-[#FFFDF8] hover:bg-[#FAF0D7] tracking-wide transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-center px-3 py-2.5 text-xs font-bold bg-gradient-to-b from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] rounded-full border border-[#FFF2B2]/70 shadow-sm tracking-wide transition-all"
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
