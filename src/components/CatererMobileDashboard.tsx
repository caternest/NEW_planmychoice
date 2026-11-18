import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ShoppingBag, 
  Bell, 
  CreditCard, 
  User, 
  ChefHat, 
  Menu, 
  ChevronRight, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Clock, 
  CalendarDays, 
  Image as ImageIcon, 
  Settings,
  X,
  LogOut,
  Building,
  Phone,
  MapPin,
  Mail,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  ChevronLeft,
  Star,
  Hourglass,
  Flag,
  Coins,
  ArrowRight,
  ClipboardList,
  Layers,
  Eye,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CatererMobileDashboardProps {
  user: any;
  caterer: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  partnerOrders: any[];
  localNotifications: any[];
  unreadNotificationsCount: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  revenue: number;
  eventFilter: '7' | '15' | '30' | 'custom';
  setEventFilter: (filter: '7' | '15' | '30' | 'custom') => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  getFilteredUpcomingEvents: () => any[];
  handleOpenOrderDetails: (ord: any) => void;
  getStatusColor: (status: string) => string;
  navItems: any[];
  logout: () => void;
  children?: React.ReactNode;

  // New props for Orders Redesign
  orderListFilter: 'all' | 'pending' | 'approved' | 'completed' | 'rejected' | 'revenue';
  setOrderListFilter: (filter: 'all' | 'pending' | 'approved' | 'completed' | 'rejected' | 'revenue') => void;
  filteredOrderList: any[];
  setSelectedOrder: (ord: any) => void;
  handleApprove: (id: string) => Promise<void>;
  setShowRejectModal: (show: boolean) => void;
  openModifyModal: (ord: any) => void;

  // New props for Profile Redesign
  profileFormData: any;
  setProfileFormData: (data: any) => void;
  isProfilePending: boolean;
  handleProfileSubmit: (e: React.FormEvent) => void;
  dashboardNewAreaText: string;
  setDashboardNewAreaText: (text: string) => void;

  // New props for Notifications
  handleClearAllNotifications: () => void;
  handleMarkNotificationRead: (id: string) => void;

  // New props for Gallery Management
  handleDeletePhoto: (index: number) => void;
  handleReplacePhoto: (index: number, file: File) => Promise<void>;
  handleMovePhoto: (index: number, direction: 'left' | 'right') => void;
  handleMakePrimary: (index: number) => void;
  handleMultipleFiles: (files: FileList) => Promise<void>;
}

export default function CatererMobileDashboard({
  user,
  caterer,
  activeTab,
  setActiveTab,
  partnerOrders,
  localNotifications,
  unreadNotificationsCount,
  totalOrders,
  pendingOrders,
  approvedOrders,
  completedOrders,
  rejectedOrders,
  revenue,
  eventFilter,
  setEventFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  getFilteredUpcomingEvents,
  handleOpenOrderDetails,
  getStatusColor,
  navItems,
  logout,
  children,

  // New props for Orders Redesign
  orderListFilter,
  setOrderListFilter,
  filteredOrderList,
  setSelectedOrder,
  handleApprove,
  setShowRejectModal,
  openModifyModal,

  // New props for Profile Redesign
  profileFormData,
  setProfileFormData,
  isProfilePending,
  handleProfileSubmit,
  dashboardNewAreaText,
  setDashboardNewAreaText,

  // New props for Notifications
  handleClearAllNotifications,
  handleMarkNotificationRead,

  // New props for Gallery Management
  handleDeletePhoto,
  handleReplacePhoto,
  handleMovePhoto,
  handleMakePrimary,
  handleMultipleFiles
}: CatererMobileDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileOrderSearch, setMobileOrderSearch] = useState('');

  // Bottom Nav items
  const bottomNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : null },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-[#FAF2E1] text-[#0F241C] pb-32">
      {/* Sticky Emerald & Gold Top Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#013122] via-[#044732] to-[#01281C] border-b border-[#D9A323]/45 flex items-center justify-between px-4 z-30 shadow-md select-none text-[#FDF8EC]">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-[#F5C642] hover:bg-[#084330] active:scale-95 transition-all rounded-xl"
            id="mobile-hamburger-menu-btn"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#FAE18D] to-[#D2951B] p-1.5 rounded-xl text-[#052419] shadow-xs">
              <ChefHat size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display font-bold tracking-tight text-[#FFFDF8] leading-none">PlanMyChoice</span>
              <span className="text-[7.5px] uppercase tracking-widest text-[#F5C642] font-extrabold leading-none mt-0.5">CATERER PORTAL</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="relative p-2.5 text-[#FDF8EC]/90 hover:text-[#F5C642] transition-colors rounded-xl hover:bg-[#084330]"
            id="mobile-header-bell-btn"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#01281C]" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2.5 border-l border-[#D9A323]/30 active:scale-95 transition-transform"
            id="mobile-header-profile-btn"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FAE18D] to-[#D2951B] text-[#052419] flex items-center justify-center font-black text-sm border border-[#FCEBA8] shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <span className="text-xs font-bold text-[#FFFDF8] max-w-[80px] truncate">
              {user?.name?.split(' ')[0] || 'Caterer'}
            </span>
          </button>
        </div>
      </div>

      {/* Main content body (offset by header height) */}
      <div className="pt-16 px-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Partner Brand Card */}
            <div className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#023122] via-[#044732] to-[#012217] p-5 text-white shadow-lg border border-[#D9A323]/40">
              <div className="flex justify-between items-center relative z-10 gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#F5C642] uppercase tracking-[0.16em]">
                    Caterer Portal
                  </p>
                  <h2 className="text-xl font-display font-bold text-[#FFFDF8] tracking-wide leading-tight truncate">
                    {caterer?.businessName || 'Elite Catering'}
                  </h2>
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F5C642] bg-[#0A402F] border border-[#D9A323]/45 px-2.5 py-1 rounded-full">
                      <CheckCircle size={10} className="text-[#F5C642]" /> Approved Partner
                    </span>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-[#D9A323]/60 p-1 bg-[#012217] flex items-center justify-center overflow-hidden shadow-md">
                    {caterer?.logo ? (
                      <img 
                        src={caterer.logo} 
                        alt={caterer?.businessName} 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#044732] flex items-center justify-center text-[#F5C642]">
                        <ChefHat size={28} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Overview Heading */}
            <div className="flex items-stretch gap-3 pt-1">
              <div className="w-[3px] rounded-full bg-gradient-to-b from-[#E8BA42] to-[#B77A12] shrink-0" />
              <div>
                <h1 className="text-xl font-display font-bold text-[#0F3D2E] leading-tight">
                  Dashboard Overview
                </h1>
                <p className="text-[11.5px] text-[#5C5240] font-medium mt-0.5">
                  Track your events and grow with PlanMyChoice.
                </p>
              </div>
            </div>

            {/* 6 Pastel Gradient KPI Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('all'); }}
                className="bg-gradient-to-br from-[#F2FBF3] to-[#E5F6E8] border border-[#BBE2C4] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#D9F3DF] border border-[#A7DCBA] text-[#15803D] flex items-center justify-center shrink-0">
                  <Package size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#1E3B2B] truncate">Total Orders</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">{totalOrders}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('pending'); }}
                className="bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border border-[#EAD089] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#FCE9B2] border border-[#E7C266] text-[#A16207] flex items-center justify-center shrink-0">
                  <Hourglass size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#5C3D06] truncate">Pending Orders</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">{pendingOrders}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('approved'); }}
                className="bg-gradient-to-br from-[#EEFCF4] to-[#DCF8E7] border border-[#9EE2BA] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#C8F4DA] border border-[#86DCA9] text-[#15803D] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#14532D] truncate">Approved</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">{approvedOrders}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('completed'); }}
                className="bg-gradient-to-br from-[#F1F8FF] to-[#E2F0FE] border border-[#AED4FA] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#D5E9FE] border border-[#98C8F9] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <Flag size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#1E3A8A] truncate">Completed</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">{completedOrders}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('rejected'); }}
                className="bg-gradient-to-br from-[#FFF4F5] to-[#FDE4E6] border border-[#F6B8BD] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#FAD1D5] border border-[#F19FA7] text-[#DC2626] flex items-center justify-center shrink-0">
                  <XCircle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#7F1D1D] truncate">Rejected</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">{rejectedOrders}</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => { setActiveTab('orders'); setOrderListFilter('revenue'); }}
                className="bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border border-[#CEB4FA] p-3.5 rounded-2xl shadow-xs flex items-center gap-2.5 text-left active:scale-95 transition-all w-full"
              >
                <div className="w-9 h-9 rounded-full bg-[#E5D5FE] border border-[#C19CF9] text-[#7E22CE] flex items-center justify-center shrink-0">
                  <Coins size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-bold text-[#581C87] truncate">Revenue</p>
                  <p className="text-xl font-display font-bold text-[#0F241C] tabular-nums leading-tight mt-0.5">₹{(revenue / 1000).toFixed(1)}K</p>
                </div>
              </button>
            </div>

            {/* Upcoming Scheduled Events Card */}
            <div className="bg-[#FFFDF8] rounded-2xl shadow-sm border border-[#E4C987] overflow-hidden">
              <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-[#F5C642]" />
                  <h3 className="font-display font-bold text-sm text-[#FDF8EC]">Upcoming Scheduled Events</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => { setActiveTab('orders'); setOrderListFilter('approved'); }}
                  className="text-[11px] font-bold text-[#F5C642] flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="p-3.5 space-y-3">
                <div className="bg-[#FAF0D8] p-1 rounded-full border border-[#E6CA82] flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                  {[
                    { id: '7', label: '7 Days' },
                    { id: '15', label: '15 Days' },
                    { id: '30', label: '30 Days' },
                    { id: 'custom', label: 'Custom' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEventFilter(tab.id as any)}
                      className={cn(
                        "flex-1 text-center py-1.5 px-2.5 text-[11px] font-bold rounded-full transition-all",
                        eventFilter === tab.id
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#FFFDF8] shadow-2xs"
                          : "text-[#493E2B]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {eventFilter === 'custom' && (
                  <div className="flex flex-col gap-2 p-2.5 bg-[#FCF8EE] rounded-xl border border-[#DFC689] text-xs font-bold text-[#493E2B]">
                    <div className="flex items-center justify-between gap-2">
                      <span>From</span>
                      <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)} 
                        className="bg-white border border-[#DFC689] rounded-lg px-2 py-1 text-xs outline-none w-[70%]" 
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>To</span>
                      <input 
                        type="date" 
                        value={customEndDate} 
                        onChange={(e) => setCustomEndDate(e.target.value)} 
                        className="bg-white border border-[#DFC689] rounded-lg px-2 py-1 text-xs outline-none w-[70%]" 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {getFilteredUpcomingEvents().map((ord) => (
                    <div key={'upcoming-event-' + ord.id} className="bg-[#FFFDF9] border border-[#EAE0C8] rounded-xl p-3 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#044530] to-[#01291C] border border-[#D9A323]/60 text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#F5C642]">{new Date(ord.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-base font-display font-extrabold leading-none">{new Date(ord.eventDate).getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#0F241C] text-sm truncate">{ord.customerName}</p>
                          <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mt-0.5", getStatusColor(ord.status))}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] border-t border-[#EFE3C4] pt-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <User size={11} className="text-[#C48E22] shrink-0" />
                          <span className="text-[#6B5F4B]">Guests:</span>
                          <span className="font-bold text-[#0F241C]">{ord.guests}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <Layers size={11} className="text-[#C48E22] shrink-0" />
                          <span className="font-bold text-[#0F241C] truncate">{ord.packageDetails?.packageName || 'Custom'}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <Phone size={11} className="text-[#C48E22] shrink-0" />
                          <span className="font-semibold text-[#0F241C] truncate">{ord.phone || ord.customerPhone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin size={11} className="text-[#C48E22] shrink-0" />
                          <span className="font-semibold text-[#0F241C] truncate">{ord.venue || ord.address || 'TBD'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenOrderDetails(ord)}
                        className="w-full py-2 rounded-full bg-[#FAF0D4] border border-[#DFB95B] text-[#0F241C] text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} className="text-[#9E7018]" />
                      </button>
                    </div>
                  ))}

                  {getFilteredUpcomingEvents().length === 0 && (
                    <div className="py-6 text-center text-[#6B5F4B] text-xs bg-[#FCF8EE] rounded-xl border border-dashed border-[#DFC689]">
                      <CalendarDays size={22} className="mx-auto mb-1.5 text-[#B8841E]" />
                      <p className="font-bold text-[#0F241C]">No scheduled events</p>
                      <p className="text-[11px] text-[#6B5F4B] mt-0.5">No upcoming events match this timeframe.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Notifications Card */}
            <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-[#F5C642]" />
                  <h3 className="font-display font-bold text-sm text-[#FDF8EC]">Recent Notifications</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setActiveTab('notifications')} 
                  className="text-[11px] font-bold text-[#F5C642] flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="divide-y divide-[#EFE4C8]">
                {(localNotifications.length > 0 ? localNotifications.slice(0, 3) : partnerOrders.slice(0, 3)).map((item: any) => {
                  const isNotif = localNotifications.length > 0;
                  return (
                    <div key={item.id} className="p-3.5 flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-[#E8F2FE] border border-[#BED9FA] text-[#1D4ED8] flex shrink-0 items-center justify-center">
                        <Bell size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0F241C] text-xs truncate">
                          {isNotif ? item.title : `New order received from ${item.customerName}`}
                        </p>
                        <p className="text-[11px] text-[#494032] mt-0.5 line-clamp-2">
                          {isNotif ? item.message : `Package: ${item.packageDetails?.packageName || 'Custom'} • Guests: ${item.guests}`}
                        </p>
                        <p className="text-[10px] text-[#7D6E52] mt-1 font-medium">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {localNotifications.length === 0 && partnerOrders.length === 0 && (
                  <div className="py-6 text-center text-[#6B5F4B] text-xs">No recent notifications.</div>
                )}
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ClipboardList size={15} className="text-[#F5C642]" />
                  <h3 className="font-display font-bold text-sm text-[#FDF8EC]">Recent Orders</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => { setActiveTab('orders'); setOrderListFilter('all'); }}
                  className="text-[11px] font-bold text-[#F5C642] flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-[#EFE4C8]">
                {partnerOrders.slice(0, 3).map((ord) => (
                  <div key={'mob-recent-' + ord.id} className="p-3.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-[11px] text-[#0F241C]">#{ord.id}</p>
                      <p className="text-xs font-semibold text-[#30281E] truncate">
                        {ord.packageDetails?.packageName || 'Custom'} • {ord.guests} guests
                      </p>
                      <p className="text-[10.5px] text-[#6B5F4B]">{ord.eventDate || 'TBD'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#0F241C]">₹{Number(ord.totalAmount || ord.amount || 0).toLocaleString('en-IN')}</p>
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border", getStatusColor(ord.status))}>
                          {ord.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenOrderDetails(ord)}
                        className="w-7 h-7 rounded-full bg-[#FAF0D4] border border-[#E6CA82] text-[#78530A] flex items-center justify-center"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {partnerOrders.length === 0 && (
                  <div className="py-6 text-center text-[#6B5F4B] text-xs">No recent orders found.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- ORDERS REDESIGNED FOR MOBILE --- */}
        {activeTab === 'orders' && (() => {
          const mobileFilteredOrders = filteredOrderList.filter((ord) => {
            if (!mobileOrderSearch.trim()) return true;
            const q = mobileOrderSearch.trim().toLowerCase();
            return [ord.id, ord.customerName, ord.customerPhone, ord.phone, ord.packageDetails?.packageName, ord.venue, ord.address]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(q);
          });

          return (
          <div className="space-y-4">
            
            {/* Brand Card */}
            <div className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#023122] via-[#044732] to-[#012217] p-5 text-white shadow-lg border border-[#D9A323]/40">
              <div className="flex justify-between items-center relative z-10 gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#F5C642] uppercase tracking-[0.16em]">
                    Caterer Portal
                  </p>
                  <h2 className="text-xl font-display font-bold text-[#FFFDF8] tracking-wide leading-tight truncate">
                    {caterer?.businessName || 'Elite Catering'}
                  </h2>
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F5C642] bg-[#0A402F] border border-[#D9A323]/45 px-2.5 py-1 rounded-full">
                      <CheckCircle size={10} className="text-[#F5C642]" /> Approved Partner
                    </span>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-[#D9A323]/60 p-1 bg-[#012217] flex items-center justify-center overflow-hidden shadow-md">
                    {caterer?.logo ? (
                      <img 
                        src={caterer.logo} 
                        alt={caterer?.businessName} 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#044732] flex items-center justify-center text-[#F5C642]">
                        <ChefHat size={28} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Heading Banner */}
            <div className="flex items-stretch gap-3 pt-1">
              <div className="w-[3px] rounded-full bg-gradient-to-b from-[#E8BA42] to-[#B77A12] shrink-0" />
              <div>
                <h1 className="text-xl font-display font-bold text-[#0F3D2E] leading-tight">
                  Order Management
                </h1>
                <p className="text-[11.5px] text-[#5C5240] font-medium mt-0.5">
                  Filter, review, and confirm customer booking requests.
                </p>
              </div>
            </div>

            {/* Compact KPI Strip */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderListFilter('all')}
                className={cn(
                  "rounded-2xl p-3 border text-left flex items-center gap-2.5 transition-all bg-gradient-to-br from-[#F2FBF3] to-[#E5F6E8] border-[#BBE2C4]",
                  orderListFilter === 'all' && "ring-2 ring-[#D9A323]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[#D9F3DF] text-[#15803D] flex items-center justify-center shrink-0">
                  <Package size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1E3B2B]">All Orders</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-none mt-0.5 tabular-nums">{totalOrders}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderListFilter('pending')}
                className={cn(
                  "rounded-2xl p-3 border text-left flex items-center gap-2.5 transition-all bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border-[#EAD089]",
                  orderListFilter === 'pending' && "ring-2 ring-[#D9A323]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[#FCE9B2] text-[#A16207] flex items-center justify-center shrink-0">
                  <Hourglass size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5C3D06]">Pending</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-none mt-0.5 tabular-nums">{pendingOrders}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderListFilter('approved')}
                className={cn(
                  "rounded-2xl p-3 border text-left flex items-center gap-2.5 transition-all bg-gradient-to-br from-[#EEFCF4] to-[#DCF8E7] border-[#9EE2BA]",
                  orderListFilter === 'approved' && "ring-2 ring-[#D9A323]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[#C8F4DA] text-[#15803D] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#14532D]">Approved</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-none mt-0.5 tabular-nums">{approvedOrders}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderListFilter('revenue')}
                className={cn(
                  "rounded-2xl p-3 border text-left flex items-center gap-2.5 transition-all bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border-[#CEB4FA]",
                  orderListFilter === 'revenue' && "ring-2 ring-[#D9A323]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[#E5D5FE] text-[#7E22CE] flex items-center justify-center shrink-0">
                  <Coins size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#581C87]">Revenue Base</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-none mt-0.5 tabular-nums">₹{(revenue / 1000).toFixed(1)}K</p>
                </div>
              </button>
            </div>

            {/* Search & Status Tabs */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C48E22]" />
                <input
                  type="text"
                  value={mobileOrderSearch}
                  onChange={(e) => setMobileOrderSearch(e.target.value)}
                  placeholder="Search Order ID, customer, phone..."
                  className="w-full h-10 pl-9 pr-8 bg-[#FFFDF8] border border-[#E4C987] rounded-xl text-xs font-medium text-[#0F241C] placeholder:text-[#8A7B61] focus:outline-none focus:border-[#D9A323]"
                />
                {mobileOrderSearch && (
                  <button
                    type="button"
                    onClick={() => setMobileOrderSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7D6E52]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="bg-[#FAF0D8] p-1 rounded-2xl border border-[#E6CA82]">
                <div className="flex gap-1 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'revenue', label: 'Revenue Base' }
                  ].map((tab) => {
                    const isActive = orderListFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOrderListFilter(tab.id as any)}
                        className={cn(
                          "flex-1 text-center py-2 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                          isActive
                            ? "bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#FFFDF8] shadow-xs"
                            : "text-[#4A3B22]"
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-3.5">
              {mobileFilteredOrders.map((ord) => (
                <div key={ord.id} className="bg-[#FFFDF8] rounded-2xl shadow-sm border border-[#E4C987] overflow-hidden flex flex-col">
                  {/* Dark Emerald Strip Header */}
                  <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b border-[#D9A323]/60 px-4 py-2 flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#F5C642]">#{ord.id}</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border", getStatusColor(ord.status))}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-display font-bold text-[#0F241C] text-base leading-snug">
                        {ord.customerName || 'Guest User'}
                      </h3>
                      <p className="text-[11px] text-[#6B5F4B] font-medium mt-0.5 flex items-center gap-1">
                        <CalendarDays size={12} className="text-[#C48E22] shrink-0" />
                        <span>
                          Event: {ord.eventDate ? new Date(ord.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                        </span>
                      </p>
                      {(ord.venue || ord.address) && (
                        <p className="text-[11px] text-[#6B5F4B] mt-1 flex items-start gap-1 line-clamp-1">
                          <MapPin size={12} className="text-[#C48E22] shrink-0 mt-0.5" />
                          <span className="truncate">{ord.venue || ord.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#FCF8EE] p-2.5 rounded-xl border border-[#EFE3C4]">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#7D6E52] font-bold uppercase tracking-wider">Package</span>
                        <span className="text-xs font-bold text-[#0F241C] truncate mt-0.5">
                          {ord.packageDetails?.packageName || 'Custom'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-[#7D6E52] font-bold uppercase tracking-wider">Guests</span>
                        <span className="text-xs font-bold text-[#0F241C] mt-0.5 tabular-nums">
                          {ord.guests ?? ord.guestCount ?? '—'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-[#7D6E52] font-bold uppercase tracking-wider">Amount</span>
                        <span className="text-xs font-extrabold text-[#0F3D2E] mt-0.5 tabular-nums">
                          ₹{Number(ord.totalEstimate ?? ord.totalAmount ?? ord.amount ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => handleOpenOrderDetails(ord)} 
                          className="flex-1 h-10 bg-[#FAF0D4] hover:bg-[#F3DFAB] border border-[#DFB95B] text-[#0F241C] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={14} className="text-[#9E7018]" />
                          <span>View Details</span>
                        </button>

                        {(ord.customerPhone || ord.phone) && (
                          <a 
                            href={`tel:${ord.customerPhone || ord.phone}`}
                            className="flex-1 h-10 bg-[#FCF8EE] border border-[#E4C987] text-[#78530A] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Phone size={13} /> Call
                          </a>
                        )}
                      </div>

                      {(ord.venue || ord.address) && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.venue || ord.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 bg-[#F1F8FF] border border-[#AED4FA] text-[#1D4ED8] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MapPin size={13} /> Open Maps
                        </a>
                      )}

                      {['pending', 'Submitted', 'Pending Caterer Review', 'updated_by_customer'].includes(ord.status) && (
                        <div className="flex flex-col gap-2 border-t border-[#EFE3C4] pt-2.5 mt-0.5">
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setShowRejectModal(true);
                              }}
                              className="flex-1 h-10 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                            >
                              Reject
                            </button>
                            
                            <button 
                              type="button"
                              onClick={() => handleApprove(ord.id)}
                              className="flex-1 h-10 bg-gradient-to-r from-[#023A28] to-[#044C35] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => openModifyModal(ord)}
                            className="h-10 border border-[#D9A323] text-[#78530A] bg-[#FAF0D4]/60 font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                          >
                            Edit Quotation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {mobileFilteredOrders.length === 0 && (
                <div className="bg-[#FFFDF8] rounded-2xl shadow-sm border border-[#E4C987] p-8 text-center">
                  <div className="w-14 h-14 bg-[#FAF0D4] border border-[#E4C987] rounded-full flex items-center justify-center mx-auto mb-3 text-[#B8841E]">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-display font-bold text-[#0F241C] text-base">
                    No {orderListFilter !== 'all' ? orderListFilter : ''} orders found
                  </h3>
                  <p className="text-xs text-[#6B5F4B] mt-1">
                    Try adjusting your status filter or search query.
                  </p>
                </div>
              )}
            </div>

          </div>
          );
        })()}

        {/* --- PROFILE REDESIGNED FOR MOBILE --- */}
        {activeTab === 'profile' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileSubmit(e);
            }} 
            className="space-y-6"
          >
            
            {/* Premium Emerald Hero Card */}
            <div className="relative mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F3D2E] via-[#164E3D] to-[#0A2D22] p-6 text-white shadow-xl border border-emerald-800/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-gold-500/5 rounded-full filter blur-2xl" />
              
              <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1 max-w-[65%]">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Caterer Portal
                  </p>
                  <h2 className="text-2xl font-display font-medium text-white tracking-wide leading-tight truncate">
                    {caterer?.businessName || 'Elite Catering'}
                  </h2>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#DEAA38] bg-[#DEAA38]/15 border border-[#DEAA38]/35 px-3 py-1.5 rounded-full">
                      <CheckCircle size={10} className="text-[#DEAA38]" /> Approved Partner
                    </span>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-[#DEAA38]/40 p-1.5 bg-emerald-950 flex items-center justify-center overflow-hidden shadow-lg shadow-black/30">
                    {caterer?.logo ? (
                      <img 
                        src={caterer.logo} 
                        alt={caterer?.businessName} 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-emerald-900 flex items-center justify-center text-[#DEAA38]">
                        <ChefHat size={32} />
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 bg-[#DEAA38] text-emerald-950 rounded-full p-1 border border-emerald-950 shadow">
                    <ChefHat size={8} />
                  </span>
                </div>
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-1">
              <h1 className="text-[28px] font-display font-bold text-[#0F241C] leading-tight">
                Profile Management
              </h1>
              <p className="text-sm text-[#5C5240] leading-relaxed font-medium">
                Identify your registration as approved before becoming visible.
              </p>
            </div>

            {/* Under Review State Banner */}
            {isProfilePending && (
              <div className="bg-[#FEF3C7] border border-[#DFC78A] rounded-3xl p-5 flex items-start gap-3 shadow-2xs">
                <Clock className="text-[#9A6A0F] shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#5C3D06] text-sm">Update Request Pending</h4>
                  <p className="text-xs text-[#6B4A10] leading-relaxed font-medium">
                    Your recent profile changes are currently under review by our admin team. Once approved, they will be visible to customers.
                  </p>
                </div>
              </div>
            )}

            {/* Basic Info Fields Stack (one per row) */}
            <div className="space-y-5 bg-[#FFFDF8] rounded-[20px] shadow-sm border border-[#DFC78A] p-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Owner Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                    <User size={18} />
                  </span>
                  <input 
                    type="text" 
                    value={profileFormData.owner || ''} 
                    onChange={(e) => setProfileFormData({...profileFormData, owner: e.target.value})} 
                    className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-12 pr-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                    placeholder="e.g. Mohammed Ismail"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Business Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                    <Building size={18} />
                  </span>
                  <input 
                    type="text" 
                    value={profileFormData.businessName || ''} 
                    onChange={(e) => setProfileFormData({...profileFormData, businessName: e.target.value})} 
                    className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-12 pr-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                    placeholder="e.g. Elite Catering"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                    <Phone size={18} />
                  </span>
                  <input 
                    type="tel" 
                    value={profileFormData.phone || ''} 
                    onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})} 
                    className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-12 pr-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                    placeholder="e.g. 6300255623"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                    <Mail size={18} />
                  </span>
                  <input 
                    type="email" 
                    value={profileFormData.email || ''} 
                    onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} 
                    className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-12 pr-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                    placeholder="e.g. info@catering.com"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Business Description</label>
                <textarea 
                  value={profileFormData.description || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, description: e.target.value})} 
                  className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl p-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors h-32 resize-none leading-relaxed" 
                  placeholder="Tell customers about your catering service, specialties, and vision..." 
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Full Address</label>
                <textarea 
                  value={profileFormData.address || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, address: e.target.value})} 
                  className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl p-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors h-28 resize-none leading-relaxed" 
                  placeholder="Enter full physical business or kitchen address..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Base City</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                    <MapPin size={18} />
                  </span>
                  <input 
                    type="text" 
                    value={profileFormData.city || ''} 
                    onChange={(e) => setProfileFormData({...profileFormData, city: e.target.value})} 
                    className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-12 pr-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                    placeholder="e.g. Hyderabad"
                    required 
                  />
                </div>
              </div>

            </div>

            {/* Professional & Operational Details Section */}
            <div className="space-y-5 bg-[#FFFDF8] rounded-[20px] shadow-sm border border-[#DFC78A] p-6">
              <h3 className="font-display font-bold text-[#0F241C] text-lg border-b border-[#EFE3C4] pb-3">
                Professional &amp; Operational Details
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Brand Name</label>
                <input 
                  type="text" 
                  value={profileFormData.brandName || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, brandName: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. Royal Caterers Premium" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Tagline</label>
                <input 
                  type="text" 
                  value={profileFormData.tagline || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, tagline: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. Crafting Memorable Celebrations with Exceptional Taste" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">WhatsApp Mobile Connection</label>
                <input 
                  type="tel" 
                  value={profileFormData.whatsappNumber || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, whatsappNumber: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. +91 98765 43210" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Years of Experience</label>
                <input 
                  type="number" 
                  value={profileFormData.experience || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, experience: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. 20" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Events Completed</label>
                <input 
                  type="number" 
                  value={profileFormData.eventsCompleted || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, eventsCompleted: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. 260" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">Number of Branches</label>
                <input 
                  type="number" 
                  value={profileFormData.branches || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, branches: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium text-[#0F241C] focus:border-[#D4961B] focus:bg-[#FFFDF8] outline-none transition-colors" 
                  placeholder="e.g. 2" 
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#0F241C]">Service Areas</label>
                
                {/* Serve Entire Hyderabad checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#FAF3E2]/65 border border-[#DFC78A] rounded-xl px-4 py-3.5 transition hover:bg-[#FAF0D4]">
                  <input
                    type="checkbox"
                    checked={(() => {
                      const raw = profileFormData.serviceAreas;
                      if (!raw) return false;
                      const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                      return arr.length === 1 && arr[0] === "All Hyderabad";
                    })()}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileFormData({ ...profileFormData, serviceAreas: ["All Hyderabad"] });
                      } else {
                        setProfileFormData({ ...profileFormData, serviceAreas: [] });
                      }
                    }}
                    className="w-5 h-5 text-[#01291D] focus:ring-[#01291D] border-[#DFC78A] rounded cursor-pointer accent-[#01291D]"
                  />
                  <span className="text-xs font-bold text-[#0F241C] uppercase tracking-wider">
                    Serve Entire Hyderabad
                  </span>
                </label>

                {!(() => {
                  const raw = profileFormData.serviceAreas;
                  if (!raw) return false;
                  const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                  return arr.length === 1 && arr[0] === "All Hyderabad";
                })() && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 relative">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6E52]">
                          <MapPin size={18} />
                        </span>
                        <input
                          type="text"
                          value={dashboardNewAreaText}
                          onChange={(e) => setDashboardNewAreaText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = dashboardNewAreaText.trim();
                              if (trimmed) {
                                const raw = profileFormData.serviceAreas;
                                const arr = Array.isArray(raw) ? [...raw] : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                                if (!arr.includes(trimmed)) {
                                  arr.push(trimmed);
                                  setProfileFormData({ ...profileFormData, serviceAreas: arr });
                                }
                              }
                              setDashboardNewAreaText("");
                            }
                          }}
                          placeholder="Enter area name, e.g. Jubilee Hills..."
                          className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-11 pr-4 text-sm font-medium text-[#0F241C] focus:border-[#D4961B] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = dashboardNewAreaText.trim();
                          if (trimmed) {
                            const raw = profileFormData.serviceAreas;
                            const arr = Array.isArray(raw) ? [...raw] : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                            if (!arr.includes(trimmed)) {
                              arr.push(trimmed);
                              setProfileFormData({ ...profileFormData, serviceAreas: arr });
                            }
                          }
                          setDashboardNewAreaText("");
                        }}
                        className="bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] text-xs font-black px-5 rounded-xl transition h-14 shrink-0 uppercase tracking-wider cursor-pointer"
                      >
                        + Add Area
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(() => {
                        const raw = profileFormData.serviceAreas;
                        if (!raw) return [];
                        return Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                      })().map((area: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-[#FAF0D4] border border-[#DFC78A] text-[#0F241C] px-3 py-1.5 rounded-full text-xs font-semibold select-none"
                        >
                          <span className="uppercase text-[10px] font-bold text-[#78530A] tracking-wider">
                            {area}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const raw = profileFormData.serviceAreas;
                              const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                              const filtered = arr.filter((a: string) => a !== area);
                              setProfileFormData({ ...profileFormData, serviceAreas: filtered });
                            }}
                            className="text-[#78530A] hover:text-rose-600 transition-colors focus:outline-none cursor-pointer"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                      {(() => {
                        const raw = profileFormData.serviceAreas;
                        const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                        return arr.length === 0;
                      })() && (
                        <p className="text-xs text-[#6B5F4B] italic">No specific service areas added yet. Type an area above and click Add Area.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Branding & Identity Section */}
            <div className="space-y-6 bg-[#FFFDF8] rounded-[20px] shadow-sm border border-[#DFC78A] p-6">
              <h3 className="font-display font-bold text-[#0F241C] text-lg border-b border-[#EFE3C4] pb-3">
                Branding &amp; Identity
              </h3>

              {/* Logo Upload Box */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0F241C]">Caterer Logo Upload (500x500)</label>
                <div className="border-2 border-dashed border-[#DFC78A] rounded-3xl p-5 bg-[#FAF3E2]/45 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden transition-all">
                  {profileFormData.logo ? (
                    <div className="relative w-full h-[140px] flex flex-col items-center justify-center">
                      <img 
                        src={profileFormData.logo} 
                        alt="Logo Preview" 
                        className="max-h-full max-w-[120px] object-contain rounded-full shadow border-2 border-[#FFFDF8]"
                        referrerPolicy="no-referrer"
                      />
                      <label className="mt-3 cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-105 shadow-sm transition-all select-none uppercase tracking-wider">
                        Change Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setProfileFormData({ ...profileFormData, logo: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] flex items-center justify-center mb-2">
                        <UploadCloud size={22} className="text-[#9A6A0F]" />
                      </div>
                      <p className="text-xs font-bold text-[#5C5240]">No logo uploaded yet</p>
                      <label className="mt-2 cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-105 transition-all select-none uppercase tracking-wider">
                        Upload Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setProfileFormData({ ...profileFormData, logo: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider">Or Select From Gallery / Paste URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. https://host.com/logo.jpg" 
                      value={profileFormData.logo && profileFormData.logo.startsWith('data:') ? '' : (profileFormData.logo || '')} 
                      onChange={(e) => setProfileFormData({...profileFormData, logo: e.target.value})} 
                      className="flex-1 h-12 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-xs font-medium text-[#0F241C] outline-none focus:border-[#D4961B]" 
                    />
                    <button 
                      type="button"
                      onClick={() => setProfileFormData({...profileFormData, logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=500'})}
                      className="bg-[#FAF0D4] border border-[#DFC78A] text-[#78530A] font-bold px-4 rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Gallery
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Banner Upload Box */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0F241C]">Cover Banner Upload (1600x600)</label>
                <div className="border-2 border-dashed border-[#DFC78A] rounded-3xl p-5 bg-[#FAF3E2]/45 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden transition-all">
                  {profileFormData.coverBanner ? (
                    <div className="relative w-full h-[140px] flex flex-col items-center justify-center">
                      <img 
                        src={profileFormData.coverBanner} 
                        alt="Banner Preview" 
                        className="max-h-full w-full object-cover rounded-xl shadow border border-[#DFC78A]"
                        referrerPolicy="no-referrer"
                      />
                      <label className="mt-3 cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-105 shadow-sm transition-all select-none uppercase tracking-wider">
                        Change Banner
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setProfileFormData({ ...profileFormData, coverBanner: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] flex items-center justify-center mb-2">
                        <UploadCloud size={22} className="text-[#9A6A0F]" />
                      </div>
                      <p className="text-xs font-bold text-[#5C5240]">No cover banner uploaded yet</p>
                      <label className="mt-2 cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-xs font-black px-4 py-2.5 rounded-xl hover:brightness-105 transition-all select-none uppercase tracking-wider">
                        Upload Banner
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setProfileFormData({ ...profileFormData, coverBanner: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider">Or Select From Gallery / Paste URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. https://host.com/banner.jpg" 
                      value={profileFormData.coverBanner && profileFormData.coverBanner.startsWith('data:') ? '' : (profileFormData.coverBanner || '')} 
                      onChange={(e) => setProfileFormData({...profileFormData, coverBanner: e.target.value})} 
                      className="flex-1 h-12 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-xs font-medium text-[#0F241C] outline-none focus:border-[#D4961B]" 
                    />
                    <button 
                      type="button"
                      onClick={() => setProfileFormData({...profileFormData, coverBanner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000'})}
                      className="bg-[#FAF0D4] border border-[#DFC78A] text-[#78530A] font-bold px-4 rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Gallery
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Gallery Photos Section */}
            <div className="space-y-6 bg-[#FFFDF8] rounded-[20px] shadow-sm border border-[#DFC78A] p-6">
              <h3 className="font-display font-bold text-[#0F241C] text-lg border-b border-[#EFE3C4] pb-3">
                Gallery Photos
              </h3>
              <p className="text-xs text-[#5C5240] -mt-2">
                Manage the images shown on your Explore Caterers listing.
              </p>

              {/* Mobile 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {(profileFormData.galleryPhotos || []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="bg-[#FAF3E2]/55 rounded-2xl border border-[#DFC78A] p-2.5 shadow-sm relative flex flex-col justify-between">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#FAF3E2] border border-[#DFC78A]/70 mb-2 flex items-center justify-center">
                      <img 
                        src={imgUrl} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-gradient-to-r from-[#FCE07E] to-[#D99B16] text-[#042419] text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow uppercase tracking-wider">
                          <Star size={8} fill="currentColor" /> Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {idx > 0 && (
                        <button 
                          type="button" 
                          onClick={() => handleMakePrimary(idx)}
                          className="w-full py-1 bg-[#FAF0D4] hover:bg-[#F3DFAB] text-[#78530A] font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center gap-0.5 border border-[#DFC78A] uppercase tracking-wide cursor-pointer"
                        >
                          <Star size={10} /> Primary
                        </button>
                      )}

                      <div className="flex gap-1">
                        <button 
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, 'left')}
                          className="flex-1 py-1 bg-[#FFFDF8] hover:bg-[#FAF0D4] disabled:opacity-30 border border-[#DFC78A] text-[#0F241C] rounded-lg flex items-center justify-center cursor-pointer"
                          title="Move Left"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button 
                          type="button"
                          disabled={idx === (profileFormData.galleryPhotos || []).length - 1}
                          onClick={() => handleMovePhoto(idx, 'right')}
                          className="flex-1 py-1 bg-[#FFFDF8] hover:bg-[#FAF0D4] disabled:opacity-30 border border-[#DFC78A] text-[#0F241C] rounded-lg flex items-center justify-center cursor-pointer"
                          title="Move Right"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <label className="flex-1 py-1 bg-[#FFFDF8] hover:bg-[#FAF0D4] border border-[#DFC78A] text-[#0F241C] font-bold rounded-lg text-[10px] transition-colors cursor-pointer text-center uppercase tracking-wide">
                          Replace
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleReplacePhoto(idx, file);
                              }
                            }} 
                          />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => handleDeletePhoto(idx)}
                          className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="border-2 border-dashed border-[#DFC78A] rounded-3xl p-5 bg-[#FAF3E2]/45 flex flex-col items-center justify-center min-h-[140px] text-center">
                <div className="w-10 h-10 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] flex items-center justify-center mb-2 shadow-sm">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-[#0F241C] mb-0.5">Upload new images</p>
                <p className="text-[10px] text-[#6B5F4B] mb-3">Supports JPG, PNG, WEBP</p>
                <label className="cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-[10px] font-black px-4 py-2.5 rounded-xl hover:brightness-105 shadow-sm transition-all select-none uppercase tracking-wider">
                  Upload Photos
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleFiles(e.target.files);
                      }
                    }} 
                  />
                </label>
              </div>
            </div>

            {/* Legal Details Section */}
            <div className="space-y-5 bg-[#FFFDF8] rounded-[20px] shadow-sm border border-[#DFC78A] p-6">
              <h3 className="font-display font-bold text-[#0F241C] text-lg border-b border-[#EFE3C4] pb-3">
                Legal Details
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">FSSAI Number</label>
                <input 
                  type="text" 
                  value={profileFormData.fssaiNumber || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, fssaiNumber: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium focus:border-[#D4961B] outline-none transition-colors uppercase text-[#0F241C]" 
                  placeholder="14-digit FSSAI registration" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">GSTIN</label>
                <input 
                  type="text" 
                  value={profileFormData.gstNumber || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, gstNumber: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium focus:border-[#D4961B] outline-none transition-colors uppercase text-[#0F241C]" 
                  placeholder="15-character GSTIN code" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0F241C]">PAN Number</label>
                <input 
                  type="text" 
                  value={profileFormData.panNumber || ''} 
                  onChange={(e) => setProfileFormData({...profileFormData, panNumber: e.target.value})} 
                  className="w-full h-14 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 text-base font-medium focus:border-[#D4961B] outline-none transition-colors uppercase text-[#0F241C]" 
                  placeholder="10-character business PAN" 
                />
              </div>
            </div>

            {/* Submit Button Block */}
            <div className="pt-4 pb-12">
              <button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] text-base font-black rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Submit Profile for Review
              </button>
            </div>

          </form>
        )}

        {/* --- NOTIFICATIONS ON MOBILE --- */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center border-b border-[#EFE3C4] pb-4 mb-2">
              <div>
                <h1 className="text-2xl font-display font-bold text-[#0F241C]">
                  Notifications
                </h1>
                <p className="text-xs text-[#5C5240] font-semibold">
                  Status changes, system updates, and requests.
                </p>
              </div>
              {localNotifications.length > 0 && (
                <button 
                  onClick={handleClearAllNotifications} 
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {localNotifications.map((n) => (
                <div key={n.id} className={cn("p-4 rounded-2xl border transition-all flex justify-between items-start gap-2.5", n.read ? "bg-[#FFFDF8] border-[#DFC78A]/70" : "bg-[#FAF0D4]/65 border-[#D4961B]/60 shadow-2xs")}>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", n.read ? "bg-[#DFC78A]" : "bg-[#D4961B]")} />
                      <h4 className="font-bold text-[#0F241C] text-sm truncate">{n.title}</h4>
                    </div>
                    <p className="text-xs text-[#494032] pl-4 leading-relaxed font-medium">{n.message}</p>
                    {n.orderId && <p className="text-[10px] text-[#7D6E52] font-mono pl-4">Order: #{n.orderId.substring(0, 8)}</p>}
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => handleMarkNotificationRead(n.id)} 
                      className="px-2.5 py-1.5 bg-[#FFFDF8] hover:bg-[#FAF0D4] border border-[#DFC78A] text-[#0F241C] rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
              
              {localNotifications.length === 0 && (
                <div className="bg-[#FFFDF8] rounded-2xl border border-[#DFC78A] p-10 text-center py-12">
                  <div className="w-14 h-14 bg-[#FAF0D4] border border-[#DFC78A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-[#9A6A0F]" />
                  </div>
                  <p className="font-bold text-[#0F241C]">All caught up!</p>
                  <p className="text-xs text-[#6B5F4B] mt-1">You have no new notifications.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PAYMENTS ON MOBILE --- */}
        {activeTab === 'payments' && (
          <div className="space-y-6 pt-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-[#0F241C]">
                Payment History
              </h1>
              <p className="text-xs text-[#5C5240] font-semibold">
                Manage your transaction payouts and fees.
              </p>
            </div>

            <div className="space-y-4">
              {partnerOrders.filter(o => ['Approved', 'Completed'].includes(o.status)).map((ord) => {
                const gross = (ord.pricePerPlate || 0) * (ord.guests || 0);
                const netAmount = gross * 0.9;
                return (
                  <div key={'pay-'+ord.id} className="bg-[#FFFDF8] rounded-2xl shadow-2xs border border-[#DFC78A] p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-[#7D6E52] font-bold uppercase">Order ID</span>
                        <span className="font-mono text-xs font-bold text-[#0F241C]">#{ord.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <span className="bg-[#DCF8E6] text-[#116E39] border border-[#9EE2BA] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Paid
                      </span>
                    </div>

                    <div className="border-t border-[#EFE3C4] pt-2 text-xs font-medium space-y-1 text-[#494032]">
                      <p className="flex justify-between"><span className="text-[#6B5F4B]">Customer:</span> <span className="font-bold text-[#0F241C]">{ord.customerName}</span></p>
                      <p className="flex justify-between"><span className="text-[#6B5F4B]">Gross Amount:</span> <span className="font-bold text-[#0F241C] tabular-nums">₹{gross.toLocaleString()}</span></p>
                      <p className="flex justify-between"><span className="text-[#6B5F4B]">Platform Fee (10%):</span> <span className="font-semibold text-rose-600 tabular-nums">-₹{(gross*0.1).toFixed(0)}</span></p>
                      <p className="flex justify-between border-t border-dashed border-[#DFC78A] pt-2 mt-1 text-sm font-bold"><span className="text-[#064E3B]">Net Payout:</span> <span className="text-[#064E3B] tabular-nums">₹{netAmount.toLocaleString()}</span></p>
                    </div>
                  </div>
                );
              })}

              {partnerOrders.filter(o => ['Approved', 'Completed'].includes(o.status)).length === 0 && (
                <div className="bg-[#FFFDF8] rounded-2xl border border-[#DFC78A] p-10 text-center py-12">
                  <div className="w-14 h-14 bg-[#FAF0D4] border border-[#DFC78A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={24} className="text-[#9A6A0F]" />
                  </div>
                  <p className="font-bold text-[#0F241C]">No transactions</p>
                  <p className="text-xs text-[#6B5F4B] mt-1">Confirmed payouts will be listed here.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 select-none">
        <div className="bg-gradient-to-r from-[#01291D] via-[#023A28] to-[#01291D] rounded-[2rem] p-2 px-3 flex justify-between items-center shadow-2xl border border-[#DFC78A]/45">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-300 cursor-pointer",
                  isActive 
                    ? "bg-gradient-to-r from-[#FAE18D] to-[#D99B16] text-[#042419] font-black shadow-lg" 
                    : "text-[#E8DFC5] hover:text-[#FFFDF8]"
                )}
                id={`mobile-bottom-nav-${item.id}`}
              >
                <div className="relative">
                  <item.icon size={18} className={isActive ? "scale-110" : ""} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-[#F5C642] text-[#042419] text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-[#01291D]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] mt-1 font-extrabold tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer/Sidebar triggered by Hamburger button */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            
            {/* Sidebar drawer panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-gradient-to-b from-[#013122] via-[#01281C] to-[#011A12] border-r border-[#D9A323]/30 text-[#F6EFE0] z-50 flex flex-col p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-5 border-b border-[#D9A323]/20">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-[#FAE18D] to-[#D2951B] p-1.5 rounded-xl text-[#052419]">
                    <ChefHat size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-display font-bold tracking-tight text-[#FFFDF8] leading-none">PlanMyChoice</span>
                    <span className="text-[7.5px] uppercase tracking-widest text-[#F5C642] font-black leading-none mt-0.5">CATERER PORTAL</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-[#F5C642]/80 hover:text-white rounded-lg hover:bg-[#084330] active:scale-95 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation items list */}
              <div className="flex-1 overflow-y-auto py-5 space-y-1.5 custom-sidebar-scrollbar">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-sm",
                        isActive 
                          ? "bg-gradient-to-r from-[#FAE18D] via-[#E8B839] to-[#D2951B] text-[#052419] shadow-lg" 
                          : "hover:bg-[#084330]/80 text-[#F6EFE0]/90 hover:text-[#FCE38A]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={isActive ? "text-[#052419]" : "text-[#E5BA4C]"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full",
                          isActive ? "bg-[#052419] text-[#FAE18D]" : "bg-[#F4C44E] text-[#052419]"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Log out option inside mobile drawer */}
              <div className="pt-6 border-t border-[#D9A323]/25">
                <button 
                  onClick={() => {
                    setIsSidebarOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl font-bold transition-colors text-sm"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
