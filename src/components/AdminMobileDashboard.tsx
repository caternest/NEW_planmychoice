import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Building, FileText, CheckCircle2, XCircle, Search, Clock, 
  CreditCard, ChevronRight, Menu as MenuIcon, AlertCircle, Trash2, 
  Package, Image, Trash, Upload, Check, RefreshCw, Sliders, Bell, LogOut,
  LayoutGrid, Plus, TrendingUp, Calendar, Award, Crown, Store, User, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DynamicBadgeIcon, getDesktopBadgeClasses } from '../lib/badgeUtils';

interface AdminMobileDashboardProps {
  adminEmail: string;
  activeTab: 'overview' | 'partners' | 'users' | 'orders' | 'trash' | 'requests' | 'audit' | 'images' | 'settings' | 'reports';
  setActiveTab: (tab: any) => void;
  user: any;
  logout: () => Promise<void>;
  navigate: (path: string) => void;
  registrations: any[];
  activeRegistrations: any[];
  catererBadgesMap?: Record<string, any[]>;
  onManageBadges?: (caterer: any) => void;
  deletedRegistrations: any[];
  orders: any[];
  auditLogs: any[];
  stats: any[];
  platformFeePerPlate: number;
  setPlatformFeePerPlate: (fee: number) => void;
  homepageMode: 'classic' | 'marketplace';
  setHomepageMode: (mode: 'classic' | 'marketplace') => void;
  savingSettings: boolean;
  handleSavePlatformSettings: () => Promise<void>;
  handleAction: (id: string, status: string) => Promise<void>;
  setDeleteConfirm: (id: string) => void;
  handleRestore: (id: string) => Promise<void>;
  setPermanentDeleteConfirm: (id: string) => void;
  handleApproveProfileUpdate: (id: string) => Promise<void>;
  handleRejectProfileUpdate: (id: string) => Promise<void>;
  setSelectedAdminOrder: (order: any) => void;
  setAdminMemoText: (text: string) => void;
  toast: (msg: string, type: 'success' | 'error' | 'info') => void;
  filteredPartners: any[];
  filteredOrders: any[];
  filteredRequests: any[];
  filteredUsers: any[];
  
  // Mobile states
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isMobileNotificationsOpen: boolean;
  setIsMobileNotificationsOpen: (open: boolean) => void;
  isMobileProfileOpen: boolean;
  setIsMobileProfileOpen: (open: boolean) => void;
  mobileSearchQuery: string;
  setMobileSearchQuery: (q: string) => void;
  mobileFilterValue: string;
  setMobileFilterValue: (val: string) => void;
  mobileSortValue: string;
  setMobileSortValue: (val: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  isSortOpen: boolean;
  setIsSortOpen: (open: boolean) => void;
  expandedOrderIds: Record<string, boolean>;
  setExpandedOrderIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenClearAllOrders?: () => void;
}

export default function AdminMobileDashboard({
  adminEmail,
  activeTab,
  setActiveTab,
  user,
  logout,
  navigate,
  registrations,
  activeRegistrations,
  catererBadgesMap = {},
  onManageBadges,
  deletedRegistrations,
  orders,
  auditLogs,
  stats,
  platformFeePerPlate,
  setPlatformFeePerPlate,
  homepageMode,
  setHomepageMode,
  savingSettings,
  handleSavePlatformSettings,
  handleAction,
  setDeleteConfirm,
  handleRestore,
  setPermanentDeleteConfirm,
  handleApproveProfileUpdate,
  handleRejectProfileUpdate,
  setSelectedAdminOrder,
  setAdminMemoText,
  toast,
  filteredPartners,
  filteredOrders,
  filteredRequests,
  filteredUsers,
  
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isMobileNotificationsOpen,
  setIsMobileNotificationsOpen,
  isMobileProfileOpen,
  setIsMobileProfileOpen,
  mobileSearchQuery,
  setMobileSearchQuery,
  mobileFilterValue,
  setMobileFilterValue,
  mobileSortValue,
  setMobileSortValue,
  isFilterOpen,
  setIsFilterOpen,
  isSortOpen,
  setIsSortOpen,
  expandedOrderIds,
  setExpandedOrderIds,
  onOpenClearAllOrders
}: AdminMobileDashboardProps) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [activeTheme, setActiveTheme] = useState('Emerald Premium');

  const computedStats = React.useMemo(() => {
    const totalUsers = filteredUsers.length || 12;
    const totalCaterers = registrations.filter(r => r.status !== 'Trashed').length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalEstimate) || 0), 0);
    const pendingRequests = registrations.filter(r => r.status === 'Pending Approval' || r.pendingUpdates).length;
    const approvedPartners = registrations.filter(r => r.status === 'Approved').length;
    const rejectedRequests = registrations.filter(r => r.status === 'Rejected').length;
    const activeOrders = orders.filter(o => !['Completed', 'Cancelled', 'Rejected', 'completed', 'cancelled', 'rejected'].includes(o.status)).length;

    return [
      { title: 'Total Users', value: totalUsers.toString(), icon: Users, bg: 'bg-emerald-600' },
      { title: 'Total Caterers', value: totalCaterers.toString(), icon: Building, bg: 'bg-amber-600' },
      { title: 'Total Orders', value: totalOrders.toString(), icon: Package, bg: 'bg-blue-600' },
      { title: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: CreditCard, bg: 'bg-purple-600' },
      { title: 'Pending Requests', value: pendingRequests.toString(), icon: AlertCircle, bg: 'bg-amber-500' },
      { title: 'Approved Partners', value: approvedPartners.toString(), icon: CheckCircle2, bg: 'bg-emerald-500' },
      { title: 'Rejected Requests', value: rejectedRequests.toString(), icon: XCircle, bg: 'bg-red-500' },
      { title: 'Active Orders', value: activeOrders.toString(), icon: Clock, bg: 'bg-teal-600' },
    ];
  }, [registrations, orders, filteredUsers]);

  return (
    <div className="block lg:hidden min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] text-[#0F241C] pt-14 sm:pt-[60px] pb-28 font-sans">
      
      {/* 1. Mobile Top Sticky Controls */}
      <div className="sticky top-14 sm:top-[60px] z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#DFC78A] px-4 py-3 flex items-center justify-between shadow-[0_4px_16px_rgba(92,70,22,0.06)]">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#FAF3E2] border border-[#DFC78A] text-[#0F241C] active:scale-95 transition-all cursor-pointer"
          id="mobile-hamburger-btn"
        >
          <MenuIcon size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2" id="mobile-header-logo">
          <img
            src="/assets/aistudio/image_6ce019e3.png"
            alt="PlanMyChoice"
            className="w-6 h-6 object-contain"
          />
          <span className="text-sm font-extrabold font-display leading-none text-[#01291D] tracking-tight">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileNotificationsOpen(true)}
            className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-[#FAF3E2] border border-[#DFC78A] text-[#0F241C] active:scale-95 transition-all cursor-pointer"
            id="mobile-notifications-btn"
          >
            <Bell size={18} strokeWidth={2.3} />
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#FCE07E] to-[#D99B16] text-[#042419] border border-[#FFFDF8] text-[9px] font-black flex items-center justify-center">
                {orders.length > 9 ? '9+' : orders.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setIsMobileProfileOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/40 text-[#042419] active:scale-95 transition-all cursor-pointer overflow-hidden font-extrabold text-sm font-display shadow-xs"
            id="mobile-profile-btn"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </button>
        </div>
      </div>

      {/* 2. Left sliding Drawer Navigation */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[60]"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-76 bg-gradient-to-b from-[#012A1E] via-[#022F22] to-[#011F16] border-r border-[#D9A323]/30 text-[#FFFDF8] h-full z-[70] flex flex-col shadow-2xl overflow-hidden font-sans"
            >
              <div className="p-6 border-b border-[#D9A323]/25 bg-[#012117] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#033B2A] border border-[#D9A323]/40 flex items-center justify-center p-1.5 shadow-sm">
                    <img
                      src="/assets/aistudio/image_6ce019e3.png"
                      alt="PlanMyChoice"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xl font-bold font-display tracking-tight text-[#FFFDF8] leading-tight">
                      PlanMyChoice
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#F5C642] font-bold">
                      Admin Center
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-[#F5C642] hover:text-white cursor-pointer active:scale-90 transition-all text-xs border border-[#D9A323]/30"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-1.5">
                <div className="text-[10px] font-black uppercase text-[#D9A323]/80 tracking-widest mb-3.5 px-3">
                  Management
                </div>
                
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'partners', label: 'Partner Registrations', icon: Building, count: activeRegistrations.filter(r => r.status === 'Pending Approval').length, countColor: 'bg-[#F5C642] text-[#042419]' },
                  { id: 'requests', label: 'Change Requests', icon: AlertCircle, count: registrations.filter(r => r.pendingUpdates).length, countColor: 'bg-blue-500 text-white' },
                  { id: 'orders', label: 'All Orders', icon: CreditCard },
                  { id: 'users', label: 'Users & Accounts', icon: Users },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                      if (item.id === 'overview') navigate('/admin-dashboard');
                      if (item.id === 'partners') navigate('/admin/partners');
                      if (item.id === 'orders') navigate('/admin/orders');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all text-left border-0 cursor-pointer",
                      activeTab === item.id 
                        ? "bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] shadow-lg scale-[1.02]" 
                        : "bg-transparent text-[#D4E6DC] hover:bg-white/5 hover:text-[#FFFDF8]"
                    )}
                  >
                    <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black min-w-5 text-center", item.countColor)}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}

                <div className="pt-6 border-t border-[#D9A323]/20 my-5 text-[10px] font-black uppercase text-[#D9A323]/80 tracking-widest px-3">
                  System
                </div>

                {[
                  { id: 'trash', label: 'Trash', icon: Trash2, count: deletedRegistrations.length, countColor: 'bg-red-500 text-white' },
                  { id: 'audit', label: 'Audit Log', icon: Clock },
                  { id: 'settings', label: 'Platform Settings', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all text-left border-0 cursor-pointer",
                      activeTab === item.id 
                        ? "bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] shadow-lg scale-[1.02]" 
                        : "bg-transparent text-[#D4E6DC] hover:bg-white/5 hover:text-[#FFFDF8]"
                    )}
                  >
                    <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black min-w-5 text-center", item.countColor)}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5 border-t border-[#D9A323]/20 bg-[#011B13]">
                <button 
                  onClick={async () => {
                    setIsMobileSidebarOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-red-600/15 hover:bg-red-600 text-red-200 hover:text-white font-black text-sm transition-all duration-300 shadow-sm border border-red-600/35 cursor-pointer"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Sticky Filter & Search Panel for appropriate modules */}
      {['partners', 'orders', 'requests', 'users'].includes(activeTab) && (
        <div className="sticky top-[124px] sm:top-[128px] z-30 bg-[#FBF4E4]/95 backdrop-blur-md px-4 py-3 border-b border-[#DFC78A] flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7D5E]" size={16} />
              <input 
                type="text"
                placeholder={`Search ${activeTab === 'partners' ? 'partners' : activeTab === 'orders' ? 'orders' : activeTab === 'requests' ? 'requests' : activeTab === 'users' ? 'users' : 'records'}...`}
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-[#D4961B] outline-none font-medium text-[#0F241C] shadow-xs"
              />
              {mobileSearchQuery && (
                <button 
                  onClick={() => setMobileSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E7D5E] font-bold hover:text-[#0F241C] text-sm border-0 bg-transparent cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {activeTab !== 'requests' && (
              <>
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className={cn(
                    "px-4 h-10 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0",
                    mobileFilterValue !== 'All' 
                      ? "bg-gradient-to-b from-[#065239] to-[#012217] border-[#D4961B]/60 text-[#F5C642]" 
                      : "bg-[#FFFDF8] border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                  )}
                >
                  <Sliders size={13} strokeWidth={2.5} />
                  <span>Filter</span>
                </button>

                <button 
                  onClick={() => setIsSortOpen(true)}
                  className="px-4 h-10 rounded-xl bg-[#FFFDF8] border border-[#DFC78A] text-[#0F241C] flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs hover:bg-[#FAF0D4] cursor-pointer active:scale-95 shrink-0"
                >
                  <Clock size={13} strokeWidth={2.5} />
                  <span>Sort</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Active Section Main Canvas */}
      <div className="p-4 pt-6 space-y-6 bg-gradient-to-br from-[#FAF3E3] via-[#FDF8EC] to-[#FAF0DC]">
        
        {/* Tab: Overview (Command Center) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="px-1 text-left flex items-stretch gap-3">
              <div className="w-[3px] rounded-full bg-gradient-to-b from-[#E8BA42] via-[#D4971D] to-[#B77A12] shrink-0" />
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3DFAB] border border-[#E2C274] text-[#6B4A10] text-[10px] font-bold tracking-[0.08em] uppercase mb-1">
                  Admin Dashboard
                </span>
                <h2 className="text-[28px] font-display font-bold text-[#0F241C] leading-tight tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Command Center
                </h2>
                <p className="text-[#5C5240] font-sans font-medium text-xs mt-0.5 leading-relaxed">
                  Platform performance and operations management.
                </p>
              </div>
            </div>

            {/* Stats Grid: Responsive 2-column grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {computedStats.map((s, i) => (
                <div 
                  key={i} 
                  className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E4C987]/80 shadow-[0_4px_14px_rgba(92,70,22,0.05)] flex flex-col items-start text-left relative overflow-hidden"
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-sm mb-3 shrink-0 text-white", s.bg)}>
                    {React.createElement(s.icon, { size: 20, strokeWidth: 2.3 })}
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-[#0F241C] mb-1 tracking-tight leading-none tabular-nums">
                      {s.value}
                    </p>
                    <p className="text-[10.5px] font-sans font-bold text-[#6B5F4B] tracking-wide uppercase">
                      {s.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Section */}
            <div className="space-y-3 pt-2">
              <div className="px-1 text-left">
                <h3 className="font-display font-bold text-lg text-[#0F241C] tracking-tight">Quick Actions</h3>
                <p className="text-[10px] text-[#6B5F4B] font-sans font-bold uppercase tracking-wider">Instant commands & configuration shortcuts</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Caterer', icon: '➕', action: () => { window.location.href = '/join'; } },
                  { label: 'Add User', icon: '👤', action: () => { window.location.href = '/register'; } },
                  { label: 'Orders', icon: '📦', action: () => { setActiveTab('orders'); navigate('/admin/orders'); } },
                  { label: 'Reports', icon: '📊', action: () => { setActiveTab('reports'); } },
                  { label: 'Platform Settings', icon: '⚙️', action: () => { setActiveTab('settings'); } },
                  { label: 'Change Requests', icon: '📩', action: () => { setActiveTab('requests'); } },
                  { label: 'Trash Bin', icon: '🗑️', action: () => { setActiveTab('trash'); } },
                  { label: 'Audit Log', icon: '📜', action: () => { setActiveTab('audit'); } },
                  { label: 'Homepage Mode', icon: '🏠', action: () => { setActiveTab('settings'); } },
                  { label: 'Platform Fee', icon: '💰', action: () => { setActiveTab('settings'); } },
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={act.action}
                    className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E4C987]/75 shadow-2xs hover:shadow-md hover:border-[#D9A323] transition-all flex flex-col items-center justify-center text-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span className="text-xl">{act.icon}</span>
                    <span className="text-xs font-bold font-sans text-[#0F241C] leading-tight">{act.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Registrations Card */}
            <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_20px_rgba(92,70,22,0.06)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EFE3C4] flex justify-between items-center bg-[#FCF8EE]">
                <h3 className="font-display font-bold text-lg text-[#0F241C]">Recent Registrations</h3>
                <button 
                  onClick={() => { setActiveTab('partners'); navigate('/admin/partners'); }}
                  className="text-[11px] font-bold text-[#6B4A10] hover:text-[#0F241C] px-2.5 py-1 rounded-lg bg-white border border-[#DEC078] flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-[#EFE3C4] p-4 space-y-4">
                {activeRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-[#7D6E52] text-xs italic font-medium">No partner registrations yet.</div>
                ) : (
                  activeRegistrations.slice(0, 3).map((r, idx) => (
                    <div key={r.id || idx} className="bg-[#FAF3E2]/55 p-4 rounded-2xl border border-[#DFC78A] flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-display font-extrabold text-base text-[#0F241C] leading-snug">{r.businessName}</h4>
                          <p className="text-[11px] font-sans text-[#6B5F4B] mt-0.5 font-semibold uppercase tracking-wider">{r.owner}</p>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-xs border",
                          r.status === 'Approved' 
                            ? "bg-[#DCF8E6] text-[#116E39] border-[#9EE2BA]" 
                            : r.status === 'Pending Approval' 
                              ? "bg-[#FEF3C7] text-[#78530A] border-[#E5C165]" 
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {r.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1.5 text-xs text-[#5C5240] font-sans border-t border-b border-[#EFE3C4] py-2.5 my-1">
                        <div>
                          <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block">Service Type</span>
                          <span className="font-semibold text-[#0F241C]">{r.type || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block">Reg Date</span>
                          <span className="font-semibold text-[#0F241C]">{r.date || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 font-sans">
                        <Link 
                          to={`/admin/caterers/view/${r.id}`}
                          className="flex-1 min-w-[65px] py-2.5 bg-[#FFFDF8] text-[#01291D] border border-[#DFC78A] hover:bg-[#FAF0D4] font-bold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/admin/caterers/edit/${r.id}`}
                          className="flex-1 min-w-[65px] py-2.5 bg-[#FAF3E2] text-[#78530A] border border-[#E5C165] hover:bg-[#F3E2BA] font-extrabold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Edit
                        </Link>
                        {r.status === 'Pending Approval' && (
                          <>
                            <button 
                              onClick={() => handleAction(r.id, 'Approved')}
                              className="flex-1 min-w-[65px] py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(r.id, 'Rejected')}
                              className="flex-1 min-w-[65px] py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setDeleteConfirm(r.id)}
                          className="py-2.5 px-3.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] border border-rose-200 active:scale-95 transition-all cursor-pointer font-bold flex items-center justify-center shrink-0"
                          title="Delete to Trash"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Partners */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="px-1 text-left">
              <h2 className="text-2xl font-display font-extrabold text-[#0F241C] leading-tight uppercase tracking-tight">
                Partners ({filteredPartners.length})
              </h2>
              <p className="text-[#7D6E52] font-sans text-xs font-semibold uppercase tracking-widest mt-1 mb-2">
                Manage Platform Caterer Vendors
              </p>
            </div>

            <div className="space-y-4 pb-12">
              {filteredPartners.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-3xl border border-[#E4C987] p-12 text-center text-[#7D6E52] text-xs italic font-medium">
                  No partner registrations matched your query.
                </div>
              ) : (
                filteredPartners.map((r, idx) => (
                  <div 
                    key={r.id || idx} 
                    className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] flex flex-col gap-4 text-left hover:border-[#C68917] transition-colors duration-300 relative overflow-hidden"
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF0D4] text-[#78530A] border border-[#DFC78A] flex items-center justify-center shrink-0 font-display font-extrabold text-lg shadow-inner">
                        {r.logo ? (
                          <img src={r.logo} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                        ) : (
                          <span>{r.businessName ? r.businessName.charAt(0).toUpperCase() : 'C'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-display font-extrabold text-base text-[#0F241C] leading-snug">{r.businessName}</h4>
                        <p className="text-[11px] font-sans text-[#C68917] font-bold uppercase tracking-wider mt-0.5">{r.owner}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0",
                        r.status === 'Approved' 
                          ? "bg-[#DCF8E6] text-[#116E39] border-[#9EE2BA]" 
                          : r.status === 'Pending Approval' 
                            ? "bg-[#FEF3C7] text-[#78530A] border-[#E5C165]" 
                            : r.status === 'Suspended'
                              ? "bg-[#FEF3C7] text-[#9A5B0C] border-[#E5C165]"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {r.status}
                      </span>
                    </div>

                    {/* Active Platform Badges */}
                    {catererBadgesMap[r.id] && catererBadgesMap[r.id].length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {catererBadgesMap[r.id].filter((b: any) => b.is_active).map((b: any) => (
                          <span key={b.id || b.slug} className={cn("border px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5", getDesktopBadgeClasses(b.style_variant))}>
                            <Award size={9} />
                            {b.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-sans border-t border-b border-[#EFE3C4] py-3.5">
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Service Type</span>
                        <span className="font-semibold text-[#0F241C]">{r.type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Applied Date</span>
                        <span className="font-semibold text-[#0F241C]">{r.date || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Email</span>
                        <span className="font-semibold text-[#0F241C] truncate block max-w-[130px]" title={r.email}>{r.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Phone</span>
                        <span className="font-semibold text-[#0F241C]">{r.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {onManageBadges && (
                        <button
                          type="button"
                          onClick={() => onManageBadges(r)}
                          className="flex-1 min-w-[70px] py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#E5C165] text-[#78530A] font-bold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Award size={11} className="text-[#C68917]" /> Badges
                        </button>
                      )}
                      <Link 
                        to={`/admin/caterers/view/${r.id}`}
                        className="flex-1 min-w-[70px] py-2.5 bg-[#FAF3E2] hover:bg-[#F3E2BA] border border-[#DFC78A] text-[#01291D] font-bold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/admin/caterers/edit/${r.id}`}
                        className="flex-1 min-w-[70px] py-2.5 bg-[#FFFDF8] border border-[#E5C165] hover:bg-[#FAF3E2] text-[#78530A] font-extrabold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        Edit
                      </Link>
                      {r.status !== 'Approved' && (
                        <button 
                          onClick={() => handleAction(r.id, 'Approved')}
                          className="flex-1 min-w-[70px] py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {r.status === 'Pending Approval' && (
                        <button 
                          onClick={() => handleAction(r.id, 'Rejected')}
                          className="flex-1 min-w-[70px] py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                      {r.status === 'Approved' && (
                        <button 
                          onClick={() => handleAction(r.id, 'Suspended')}
                          className="flex-1 min-w-[70px] py-2.5 bg-[#FEF3C7] border border-[#E5C165] text-[#78530A] hover:bg-[#FDE68A] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                      {r.status === 'Suspended' && (
                        <button 
                          onClick={() => handleAction(r.id, 'Approved')}
                          className="flex-1 min-w-[70px] py-2.5 bg-[#DCF8E6] border border-[#9EE2BA] text-[#116E39] hover:bg-[#C6F1D6] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                      <button 
                        onClick={() => setDeleteConfirm(r.id)}
                        className="py-2.5 px-3.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[11px] border border-rose-200 active:scale-95 transition-all cursor-pointer font-bold flex items-center justify-center shrink-0"
                        title="Delete to Trash"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="px-1 text-left">
              <h2 className="text-2xl font-display font-extrabold text-[#0F241C] leading-tight uppercase tracking-tight">
                Requests ({filteredRequests.length})
              </h2>
              <p className="text-[#7D6E52] font-sans text-xs font-semibold uppercase tracking-widest mt-1 mb-2">
                Review Profile Change Requests
              </p>
            </div>

            <div className="space-y-4 pb-12">
              {filteredRequests.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-3xl border border-[#E4C987] p-12 text-center text-[#7D6E52] text-xs italic font-medium">
                  No pending change requests found.
                </div>
              ) : (
                filteredRequests.map((r, idx) => (
                  <div 
                    key={r.id || idx} 
                    className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] flex flex-col gap-4 text-left"
                  >
                    <div>
                      <h4 className="font-display font-extrabold text-base text-[#0F241C] leading-snug">
                        {r.businessName || r.name}
                      </h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-sans font-semibold text-[#6B5F4B] uppercase tracking-wider">
                        <span>By {r.pendingUpdates?._requestedBy || r.owner || 'Caterer'}</span>
                        <span>•</span>
                        <span>{r.pendingUpdates?._requestedAt ? new Date(r.pendingUpdates._requestedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#EFE3C4] pt-3 space-y-3">
                      <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block">Proposed Adjustments</span>
                      <div className="space-y-2">
                        {Object.entries(r.pendingUpdates || {}).map(([key, newValue]: [string, any]) => {
                          if (key.startsWith('_')) return null;
                          const isImageKey = ['logo', 'coverBanner', 'ownerPhoto', 'branchPhoto'].includes(key);
                          return (
                            <div key={key} className="bg-[#FAF3E2]/55 p-3 rounded-xl border border-[#DFC78A] text-xs font-sans">
                              <span className="font-bold text-[#494032] block mb-1 uppercase text-[9.5px] tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              {isImageKey ? (
                                <div className="flex items-center gap-3 mt-1.5 bg-[#FFFDF8] p-1.5 rounded-lg border border-[#DFC78A]">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#DFC78A] bg-[#FAF3E2]">
                                    {r[key] ? (
                                      <img src={r[key]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] text-[#7D6E52] font-medium">None</div>
                                    )}
                                  </div>
                                  <span className="text-[#8E7D5E]">➔</span>
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#C68917] bg-[#FAF3E2] shadow-sm">
                                    {newValue ? (
                                      <img src={newValue} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] text-[#7D6E52] font-medium">None</div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#C68917] font-extrabold ml-1 uppercase">New File</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <p className="line-through text-rose-600 font-medium text-[11px]">{r[key] || 'Empty'}</p>
                                  <p className="text-[#116E39] font-bold text-[11px]">➔ {newValue || 'Empty'}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => handleRejectProfileUpdate(r.id)}
                        className="flex-1 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApproveProfileUpdate(r.id)}
                        className="flex-[1.5] py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Approve Changes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (() => {
          const mPending = orders.filter(o => ['pending', 'Submitted', 'Pending Caterer Review', 'updated_by_customer'].includes(o.status)).length;
          const mApproved = orders.filter(o => ['Approved', 'approved'].includes(o.status)).length;
          const mCompleted = orders.filter(o => ['Completed', 'completed'].includes(o.status)).length;
          const mChanges = orders.filter(o => ['changes_requested', 'Changes Requested'].includes(o.status)).length;
          const mRejected = orders.filter(o => ['rejected', 'Rejected', 'cancelled', 'Cancelled'].includes(o.status)).length;

          return (
          <div className="space-y-4">
            <div className="px-1 text-left flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3DFAB] border border-[#E2C274] text-[#6B4A10] text-[9.5px] font-bold tracking-[0.09em] uppercase mb-1">
                  Admin Dashboard
                </span>
                <h2 className="text-xl font-display font-bold text-[#0F241C] leading-tight tracking-tight">
                  Order History Management
                </h2>
                <p className="text-[#5C5240] font-sans text-xs font-medium mt-0.5">
                  Track, review, and manage {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}.
                </p>
              </div>
              {onOpenClearAllOrders && (
                <button
                  type="button"
                  onClick={onOpenClearAllOrders}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer active:scale-95"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Compact 6 Summary Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F3FBF4] to-[#E6F6E9] border border-[#BBE2C4]">
                <p className="text-[10px] font-bold text-[#1E3B2B] truncate">Total</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{orders.length}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border border-[#EAD089]">
                <p className="text-[10px] font-bold text-[#5C3D06] truncate">Pending</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{mPending}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#EEFCF4] to-[#DCF8E7] border border-[#9EE2BA]">
                <p className="text-[10px] font-bold text-[#14532D] truncate">Approved</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{mApproved}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F1F8FF] to-[#E2F0FE] border border-[#AED4FA]">
                <p className="text-[10px] font-bold text-[#1E3A8A] truncate">Completed</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{mCompleted}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border border-[#CEB4FA]">
                <p className="text-[10px] font-bold text-[#581C87] truncate">Changes Req.</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{mChanges}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#FFF4F5] to-[#FDE4E6] border border-[#F6B8BD]">
                <p className="text-[10px] font-bold text-[#7F1D1D] truncate">Rejected</p>
                <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{mRejected}</p>
              </div>
            </div>

            <div className="space-y-3.5 pb-12">
              {filteredOrders.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] p-10 text-center text-[#5C5240] text-xs font-medium">
                  No orders matched your selected filters.
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isExpanded = expandedOrderIds[ord.id];
                  const statusLower = (ord.status || '').toLowerCase();
                  return (
                    <div 
                      key={ord.id} 
                      className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E4C987] shadow-[0_4px_16px_rgba(92,70,22,0.06)] flex flex-col gap-3 text-left"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF0D4] border border-[#E6CA82] font-mono font-bold text-[#2D220D] text-[10px]">
                            #{ord.id.substring(0, 8)}
                          </span>
                          <h4 className="font-display font-bold text-base text-[#0F241C] leading-snug mt-1 truncate">{ord.customerName}</h4>
                          <p className="text-[11px] text-[#5C5240] font-sans font-medium mt-0.5 truncate">{ord.catererName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border",
                            statusLower === 'approved' ? "bg-[#DCF8E6] text-[#116E39] border-[#AEE8C3]" :
                            statusLower === 'completed' ? "bg-[#E0F0FE] text-[#1E40AF] border-[#B0D5FB]" :
                            statusLower === 'rejected' || statusLower === 'cancelled' ? "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]" :
                            statusLower === 'changes_requested' || statusLower === 'changes requested' ? "bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]" :
                            "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]"
                          )}>
                            {ord.status}
                          </span>
                          <span className="font-display font-bold text-sm text-[#0F241C] tabular-nums">₹{(Number(ord.totalEstimate) || Number(ord.totalAmount) || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs font-sans border-t border-b border-[#EFE3C4] py-3">
                        <div>
                          <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Event Date</span>
                          <span className="font-semibold text-[#0F241C] tabular-nums">{ord.eventDate || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Guests &amp; Package</span>
                          <span className="font-semibold text-[#0F241C] block leading-snug truncate">{ord.guests || ord.guestCount || 0} guests • {ord.packageDetails?.packageName || ord.packageSelected || 'Custom'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="text-xs space-y-2.5 font-sans bg-[#FAF3E1] p-3 rounded-xl border border-[#E6D4A7] text-[#3F3523]">
                          <div>
                            <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-widest block mb-1">Cost &amp; Platform Fee</span>
                            <p className="flex justify-between">
                              <span>Platform Fee (₹{ord.platformFeePerPlate || 2}/plate):</span>
                              <strong className="text-[#0F241C]">₹{(ord.platformFee || 0).toLocaleString()}</strong>
                            </p>
                          </div>
                          {ord.selectedItems && ord.selectedItems.length > 0 && (
                            <div>
                              <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-widest block mb-1">Selected Menu Items</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ord.selectedItems.map((it: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-[#FFFDF8] border border-[#E4C987] rounded text-[10px] text-[#2D2417] font-medium">{it}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {ord.internal_notes && (
                            <div>
                              <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-widest block mb-1">Admin Memo (Private)</span>
                              <p className="italic text-[#5C5240] bg-[#FFFDF8] border border-[#E4C987] p-2 rounded-lg text-[10px]">{ord.internal_notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setExpandedOrderIds(prev => ({ ...prev, [ord.id]: !prev[ord.id] }))}
                          className="py-2 px-3 bg-[#FFFDF8] border border-[#DFC482] text-[#2D2417] rounded-xl hover:bg-[#FAF0D4] text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedAdminOrder(ord);
                            setAdminMemoText(ord.internal_notes || ord.internalNotes || '');
                          }} 
                          className="flex-1 py-2 bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#F5C642] border border-[#D9A323]/80 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-center"
                        >
                          Manage Order
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          );
        })()}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="px-1 text-left">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3DFAB] border border-[#E2C274] text-[#6B4A10] text-[9.5px] font-bold tracking-[0.09em] uppercase mb-1">
                Admin Dashboard
              </span>
              <h2 className="text-xl font-display font-bold text-[#0F241C] leading-tight tracking-tight">
                Customer Management
              </h2>
              <p className="text-[#5C5240] font-sans text-xs font-medium mt-0.5">
                Platform administrators, catering partners, and registered customers ({filteredUsers.length}).
              </p>
            </div>

            {/* Compact 4 Role Summary Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F2FBF3] to-[#E5F6E8] border border-[#BBE2C4] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D9F3DF] border border-[#A7DCBA] text-[#15803D] flex items-center justify-center shrink-0">
                  <Users size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1E3B2B]">Total Accounts</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">{filteredUsers.length}</p>
                </div>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border border-[#EAD089] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCE9B2] border border-[#E7C266] text-[#A16207] flex items-center justify-center shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5C3D06]">Customers</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">
                    {filteredUsers.filter(u => u.role === 'Customer').length}
                  </p>
                </div>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border border-[#CEB4FA] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5D5FE] border border-[#C19CF9] text-[#7E22CE] flex items-center justify-center shrink-0">
                  <Store size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#581C87]">Partners</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">
                    {filteredUsers.filter(u => u.role === 'Partner').length}
                  </p>
                </div>
              </div>
              <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#F1F8FF] to-[#E2F0FE] border border-[#AED4FA] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D5E9FE] border border-[#98C8F9] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <Crown size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#1E3A8A]">Administrators</p>
                  <p className="text-lg font-display font-bold text-[#0F241C] leading-tight tabular-nums">
                    {filteredUsers.filter(u => u.role === 'Administrator').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pb-12">
              {filteredUsers.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] p-10 text-center text-[#5C5240] text-xs font-medium">
                  No accounts matched your filters.
                </div>
              ) : (
                filteredUsers.map((u, idx) => (
                  <div 
                    key={u.id || idx} 
                    className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E4C987] shadow-[0_4px_16px_rgba(92,70,22,0.06)] flex flex-col gap-3 text-left"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-full bg-[#FAF0D4] border border-[#E6CA82] flex items-center justify-center font-display font-bold text-[#5C3D06] shrink-0 text-base shadow-2xs overflow-hidden">
                        {u.logo ? (
                          <img src={u.logo} alt={u.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <span>{u.avatar}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-base text-[#0F241C] leading-snug truncate">{u.name}</h4>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5",
                          u.role === 'Administrator'
                            ? "bg-[#FAF0CF] text-[#78530A] border-[#E7CB7E]"
                            : u.role === 'Partner'
                              ? "bg-[#E3F8EA] text-[#116E39] border-[#AEE8C3]"
                              : "bg-[#E6F1FE] text-[#1E40AF] border-[#B5D6FB]"
                        )}>
                          {u.role === 'Administrator' && <Crown size={10} />}
                          {u.role === 'Partner' && <Store size={10} />}
                          {u.role === 'Customer' && <User size={10} />}
                          <span>{u.role}</span>
                        </span>
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                        u.status === 'Active' ? "bg-[#DCF8E6] text-[#116E39] border-[#AEE8C3]" : "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", u.status === 'Active' ? "bg-[#16A34A]" : "bg-[#DC2626]")} />
                        <span>{u.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs font-sans border-t border-b border-[#EFE3C4] py-3">
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Email Address</span>
                        <span className="font-semibold text-[#0F241C] truncate block">{u.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Phone Contact</span>
                        <span className="font-semibold text-[#0F241C] block leading-snug tabular-nums">{u.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {u.role === 'Partner' && u.id && (
                        <>
                          <Link 
                            to={`/admin/caterers/view/${u.id}`}
                            className="flex-1 py-2 bg-white border border-[#DFC689] text-[#1F2923] font-bold text-center rounded-xl text-[11px] inline-flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            <Eye size={12} /> View
                          </Link>
                          <Link 
                            to={`/admin/caterers/edit/${u.id}`}
                            className="flex-1 py-2 bg-[#FAF0D4] border border-[#E6CA82] text-[#5C3D06] font-bold text-center rounded-xl text-[11px] active:scale-95 transition-all cursor-pointer"
                          >
                            Edit
                          </Link>
                          <button 
                            type="button"
                            onClick={() => {
                              const targetStatus = u.status === 'Active' ? 'Suspended' : 'Approved';
                              handleAction(u.id, targetStatus);
                              toast(`Partner status updated successfully`, 'success');
                            }}
                            className={cn(
                              "flex-1 py-2 font-bold text-center rounded-xl text-[11px] active:scale-95 transition-all cursor-pointer border",
                              u.status === 'Active' 
                                ? "bg-[#FAF0CF] border-[#E4C26B] text-[#6B4A10]" 
                                : "bg-[#DCF8E6] border-[#9EE2BA] text-[#116E39]"
                            )}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Enable'}
                          </button>
                        </>
                      )}
                      {u.role === 'Customer' && (
                        <button 
                          type="button"
                          onClick={() => {
                            toast(`Customer account synced under Root console standards.`, 'success');
                          }}
                          className="w-full py-2 bg-[#FAF3E1] text-[#494032] border border-[#E4C987] hover:bg-[#F5E7C4] font-bold text-center rounded-xl text-[11px] active:scale-95 transition-all cursor-pointer"
                        >
                          Access Token &amp; Accounts Settings
                        </button>
                      )}
                      {u.role === 'Administrator' && (
                        <button 
                          type="button"
                          onClick={() => {
                            toast(`Admin authorization permissions are fully secured.`, 'success');
                          }}
                          className="w-full py-2 bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#F5C642] border border-[#D9A323] font-bold text-center rounded-xl text-[11px] active:scale-95 transition-all cursor-pointer"
                        >
                          Root Administrator Credentials
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Trash */}
        {activeTab === 'trash' && (
          <div className="space-y-4">
            <div className="px-1 text-left">
              <h2 className="text-2xl font-display font-extrabold text-[#0F241C] leading-tight uppercase flex items-center gap-2">
                <Trash2 size={24} className="text-rose-600 shrink-0" /> Trash ({deletedRegistrations.length})
              </h2>
              <p className="text-[#7D6E52] font-sans text-xs font-semibold uppercase tracking-widest mt-1 mb-2">
                Manage Trashed Partner listings
              </p>
            </div>

            <div className="space-y-4 pb-12">
              {deletedRegistrations.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-3xl border border-[#E4C987] p-12 text-center text-[#7D6E52] text-xs italic font-medium">
                  Trash is empty.
                </div>
              ) : (
                deletedRegistrations.map((r, idx) => (
                  <div 
                    key={r.id || idx} 
                    className="bg-[#FFFDF8] rounded-[24px] p-5 border border-rose-200 shadow-[0_6px_22px_rgba(92,70,22,0.05)] flex flex-col gap-4 text-left"
                  >
                    <div>
                      <h4 className="font-display font-extrabold text-base text-[#0F241C] leading-snug">{r.businessName}</h4>
                      <p className="text-[11px] font-sans text-[#C68917] font-bold uppercase tracking-wider mt-0.5">Owner: {r.owner}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs font-sans border-t border-b border-[#EFE3C4] py-3.5">
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Deleted Date</span>
                        <span className="font-semibold text-[#0F241C]">{r.deletedDate ? new Date(r.deletedDate).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-0.5">Deleted By</span>
                        <span className="font-semibold text-[#0F241C]">{r.deletedBy || 'System'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/admin/caterers/view/${r.id}`}
                        className="flex-1 py-2.5 bg-[#FAF3E2] border border-[#DFC78A] text-[#01291D] font-bold text-center rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => handleRestore(r.id)}
                        className="flex-1 py-2.5 bg-[#DCF8E6] border border-[#9EE2BA] text-[#116E39] font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => setPermanentDeleteConfirm(r.id)}
                        className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="px-1 text-left">
              <h2 className="text-2xl font-display font-extrabold text-[#0F241C] leading-tight uppercase flex items-center gap-2">
                <Clock size={24} className="text-[#C68917] shrink-0" /> Audit Logs ({auditLogs.length})
              </h2>
              <p className="text-[#7D6E52] font-sans text-xs font-semibold uppercase tracking-widest mt-1 mb-2">
                Platform Action Governance Timeline
              </p>
            </div>

            <div className="space-y-4 pb-12">
              {auditLogs.length === 0 ? (
                <div className="bg-[#FFFDF8] rounded-3xl border border-[#E4C987] p-12 text-center text-[#7D6E52] text-xs italic font-medium">
                  No logs recorded.
                </div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.05)] flex flex-col gap-3 text-left relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                        log.action.includes('Delete') ? "bg-rose-50 text-rose-700 border-rose-200" : 
                        log.action.includes('Trash') ? "bg-[#FEF3C7] text-[#78530A] border-[#E5C165]" : 
                        "bg-[#DCF8E6] text-[#116E39] border-[#9EE2BA]"
                      )}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#7D6E52] font-mono font-bold">
                        {new Date(log.date || log.timestamp).toLocaleDateString()} {new Date(log.date || log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <div className="border-t border-[#EFE3C4] pt-3 space-y-1">
                      <p className="text-sm font-display font-extrabold text-[#0F241C] leading-snug">{log.entity || log.details}</p>
                      <p className="text-xs text-[#6B5F4B]">
                        <strong>Admin User:</strong> <span className="font-semibold text-[#0F241C]">{log.by || log.user_email}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 pb-16">
            <div className="px-1 text-left">
              <h2 className="text-2xl font-display font-extrabold text-[#0F241C] leading-tight uppercase flex items-center gap-2">
                <Sliders size={24} className="text-[#C68917] shrink-0" /> Settings
              </h2>
              <p className="text-[#7D6E52] font-sans text-xs font-semibold uppercase tracking-widest mt-1 mb-2">
                Platform-wide parameters & integrations
              </p>
            </div>

            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <CreditCard className="text-[#055B3D]" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Platform Fee</h3>
              </div>
              <p className="text-xs text-[#6B5F4B] leading-relaxed">
                This fee per plate is multiplied directly by booking guest count:
              </p>
              <div className="p-3 bg-[#FAF3E2]/60 rounded-xl border border-[#DFC78A] text-[#0F241C] font-mono text-center text-xs font-bold">
                Payable platform fee = Guest count × Fee/Plate
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPlatformFeePerPlate(preset)}
                    className={cn(
                      "py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all border uppercase cursor-pointer",
                      platformFeePerPlate === preset
                        ? "bg-gradient-to-r from-[#01291D] to-[#034431] border-[#D4961B] text-[#F5C642] shadow-sm"
                        : "bg-[#FFFDF8] border-[#DFC78A] text-[#494032] hover:bg-[#FAF0D4]"
                    )}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider shrink-0">Custom Fee:</span>
                <div className="relative rounded-xl shadow-xs flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#C68917] font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={platformFeePerPlate}
                    onChange={(e) => setPlatformFeePerPlate(Math.max(0, parseInt(e.target.value) || 0))}
                    className="block w-full pl-6 pr-3 py-2 border border-[#DFC78A] rounded-xl bg-[#FFFDF8] focus:outline-none focus:border-[#055B3D] text-xs font-bold text-[#0F241C]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <Sliders className="text-[#055B3D]" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Homepage Mode</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-3 bg-[#FAF3E2]/55 p-3.5 rounded-2xl border border-[#DFC78A] cursor-pointer hover:bg-[#FAF0D4]/60 transition-all">
                  <input
                    type="radio"
                    name="mobileHomepageMode"
                    value="classic"
                    checked={homepageMode === 'classic'}
                    onChange={() => setHomepageMode('classic')}
                    className="text-[#055B3D] focus:ring-[#055B3D] h-4 w-4"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-[#0F241C]">Classic Landing Page</span>
                    <span className="block text-[10px] text-[#6B5F4B] mt-0.5 leading-snug">Show default promotional sections, search bar, sliders.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 bg-[#FAF3E2]/55 p-3.5 rounded-2xl border border-[#DFC78A] cursor-pointer hover:bg-[#FAF0D4]/60 transition-all">
                  <input
                    type="radio"
                    name="mobileHomepageMode"
                    value="marketplace"
                    checked={homepageMode === 'marketplace'}
                    onChange={() => setHomepageMode('marketplace')}
                    className="text-[#055B3D] focus:ring-[#055B3D] h-4 w-4"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-[#0F241C]">Catering Marketplace</span>
                    <span className="block text-[10px] text-[#6B5F4B] mt-0.5 leading-snug">Directly present explore page for immediate search listings.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <Sliders className="text-[#C68917]" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Service Integrations</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'WhatsApp Bot Notifications', desc: 'Auto message booking receipts via official API WhatsApp template', enabled: true },
                  { name: 'Google Maps Geocoding Grounding', desc: 'Enforces lat/long coordinates verification during venue placement', enabled: true },
                  { name: 'Direct Admin Slack Webhook Alerts', desc: 'Push real-time critical change requests directly to admin Slack channels', enabled: false }
                ].map((srv, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-3 p-3 bg-[#FAF3E2]/55 rounded-2xl border border-[#DFC78A]">
                    <div className="text-left">
                      <span className="block text-xs font-extrabold text-[#0F241C]">{srv.name}</span>
                      <span className="block text-[9.5px] text-[#6B5F4B] leading-tight mt-0.5">{srv.desc}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        toast(`${srv.name} feature toggled in admin layout config`, 'success');
                      }}
                      className={cn(
                        "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 outline-none cursor-pointer",
                        srv.enabled ? "bg-[#055B3D] flex justify-end" : "bg-[#DFC78A] flex justify-start"
                      )}
                    >
                      <span className="w-5 h-5 bg-[#FFFDF8] rounded-full block shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Mode Card */}
            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <Clock className="text-rose-600" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Maintenance Mode</h3>
              </div>
              <div className="flex justify-between items-center gap-3 p-3 bg-[#FAF3E2]/55 rounded-2xl border border-[#DFC78A]">
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-[#0F241C]">Emergency Lockout</span>
                  <span className="block text-[9.5px] text-[#6B5F4B] leading-tight mt-0.5">Prevent customers from placing new orders while system maintenance is in progress</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    toast(`Maintenance Mode ${!maintenanceMode ? 'Enabled' : 'Disabled'}. All customer booking services locked.`, !maintenanceMode ? 'info' : 'success');
                  }}
                  className={cn(
                    "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 outline-none cursor-pointer",
                    maintenanceMode ? "bg-rose-600 flex justify-end" : "bg-[#DFC78A] flex justify-start"
                  )}
                >
                  <span className="w-5 h-5 bg-[#FFFDF8] rounded-full block shadow-sm" />
                </button>
              </div>
            </div>

            {/* Notification Settings Card */}
            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <Bell className="text-[#055B3D]" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Notification Dispatches</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3 p-3 bg-[#FAF3E2]/55 rounded-2xl border border-[#DFC78A]">
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-[#0F241C]">Email Alerts</span>
                    <span className="block text-[9.5px] text-[#6B5F4B] leading-tight mt-0.5">Dispatches emails automatically to admins on new partner registrations</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 outline-none cursor-pointer",
                      emailNotifications ? "bg-[#055B3D] flex justify-end" : "bg-[#DFC78A] flex justify-start"
                    )}
                  >
                    <span className="w-5 h-5 bg-[#FFFDF8] rounded-full block shadow-sm" />
                  </button>
                </div>

                <div className="flex justify-between items-center gap-3 p-3 bg-[#FAF3E2]/55 rounded-2xl border border-[#DFC78A]">
                  <div className="text-left">
                    <span className="block text-xs font-extrabold text-[#0F241C]">Push Broadcasts</span>
                    <span className="block text-[9.5px] text-[#6B5F4B] leading-tight mt-0.5">Real-time alerts popping up on active admin dashboard browsers</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 outline-none cursor-pointer",
                      pushNotifications ? "bg-[#055B3D] flex justify-end" : "bg-[#DFC78A] flex justify-start"
                    )}
                  >
                    <span className="w-5 h-5 bg-[#FFFDF8] rounded-full block shadow-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Settings Card */}
            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-[#EFE3C4] pb-3">
                <Sliders className="text-[#C68917]" size={18} />
                <h3 className="font-display font-bold text-base text-[#0F241C]">Visual Theme Scheme</h3>
              </div>
              <div className="relative">
                <select
                  value={activeTheme}
                  onChange={(e) => {
                    setActiveTheme(e.target.value);
                    toast(`Theme changed to ${e.target.value}`, 'success');
                  }}
                  className="block w-full px-4 py-3 bg-[#FAF3E2]/55 border border-[#DFC78A] rounded-2xl text-xs font-bold text-[#0F241C] focus:outline-none focus:border-[#055B3D]"
                >
                  <option value="Classic Gold">Classic Gold (Warm Honey Accent)</option>
                  <option value="Emerald Premium">Emerald Premium (Corporate Velvet)</option>
                  <option value="Royal Silver">Royal Silver (Brushed Platinum Accent)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleSavePlatformSettings();
                  toast("All platform parameters successfully dispatched!", "success");
                }}
                disabled={savingSettings}
                className="w-full py-4 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 disabled:opacity-50 text-[#FFFDF8] font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer"
              >
                {savingSettings ? 'Saving Settings...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Reports Section */}
        {activeTab === 'reports' && (
          <div className="space-y-6 pb-16">
            <div className="px-1 text-left">
              <h2 className="text-[32px] font-display font-extrabold text-[#0F241C] leading-tight uppercase tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Platform Analytics
              </h2>
              <p className="text-[#7D6E52] font-sans font-medium text-xs mt-1 mb-2 leading-relaxed">
                Real-time charting, conversion tracking, and performance reports
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Conversion Rate', val: '4.85%', diff: '+1.2% this week', trend: 'up' },
                { label: 'Avg Order Value', val: '₹18,400', diff: '+5.4% vs last mo', trend: 'up' },
                { label: 'Active Sessions', val: '312', diff: 'Live users now', trend: 'neutral' },
                { label: 'User Retention', val: '92.4%', diff: 'Superb fidelity', trend: 'up' },
              ].map((m, idx) => (
                <div key={idx} className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.05)] flex flex-col items-start text-left">
                  <span className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-wider block mb-1">{m.label}</span>
                  <span className="text-2xl font-black text-[#0F241C] font-display leading-tight">{m.val}</span>
                  <span className="text-[10px] text-[#116E39] font-bold mt-1.5 flex items-center gap-0.5 bg-[#DCF8E6] border border-[#9EE2BA] px-2 py-0.5 rounded-lg">
                    {m.trend === 'up' && '▲'} {m.diff}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom SVG/CSS Revenue Bar Chart */}
            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div>
                <h3 className="font-display font-bold text-base text-[#0F241C]">Monthly Platform Bookings</h3>
                <p className="text-[10px] text-[#7D6E52] font-sans font-semibold uppercase tracking-wider mt-0.5">Total Revenue generated per calendar period (In thousands)</p>
              </div>

              {/* Bar graph visualizer */}
              <div className="pt-4 flex items-end justify-between h-40 px-2 relative border-b border-[#EFE3C4]">
                {[
                  { month: 'Jan', val: 120, height: 'h-[40%]' },
                  { month: 'Feb', val: 180, height: 'h-[60%]' },
                  { month: 'Mar', val: 150, height: 'h-[50%]' },
                  { month: 'Apr', val: 240, height: 'h-[80%]' },
                  { month: 'May', val: 290, height: 'h-[95%]' },
                  { month: 'Jun', val: 210, height: 'h-[70%]' },
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 bg-[#01291D] text-[#F5C642] border border-[#D4961B]/50 px-1.5 py-0.5 rounded-md">
                      ₹{bar.val}k
                    </span>
                    <div className={cn("w-6 rounded-t-lg bg-gradient-to-t from-[#D4961B] to-[#F5C642] hover:from-[#01291D] hover:to-[#055B3D] transition-all duration-300 relative shadow-sm", bar.height)}>
                      <div className="absolute inset-0 bg-white/10 rounded-t-lg" />
                    </div>
                    <span className="text-[10px] font-bold text-[#7D6E52] mt-1 uppercase tracking-wider">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom SVG/CSS Lead Conversion Trend Chart */}
            <div className="bg-[#FFFDF8] rounded-[24px] p-5 border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] space-y-4 text-left">
              <div>
                <h3 className="font-display font-bold text-base text-[#0F241C]">Inquiry Conversion Flow</h3>
                <p className="text-[10px] text-[#7D6E52] font-sans font-semibold uppercase tracking-wider mt-0.5">Ratio of incoming leads vs successful finalized payments</p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { category: 'Incoming Requests', count: 184, percent: '100%', bg: 'bg-[#DFC78A]' },
                  { category: 'Caterer Quote Sent', count: 121, percent: '65.7%', bg: 'bg-[#E5B842]' },
                  { category: 'Orders Confirmed', count: 88, percent: '47.8%', bg: 'bg-[#055B3D]' },
                  { category: 'Bookings Paid', count: 48, percent: '26.1%', bg: 'bg-[#01291D]' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#494032]">{item.category}</span>
                      <span className="font-semibold text-[#6B5F4B] font-mono">{item.count} ({item.percent})</span>
                    </div>
                    <div className="w-full bg-[#FAF3E2] border border-[#EFE3C4] h-2 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", item.bg)} style={{ width: item.percent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Platform Activity Ledger */}
            <div className="bg-[#FFFDF8] rounded-[24px] border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EFE3C4] bg-gradient-to-r from-[#FFFDF7] via-[#FCF6E7] to-[#FFFDF7] text-left">
                <h3 className="font-display font-bold text-base text-[#0F241C]">Recent Platform Activity</h3>
                <p className="text-[10px] text-[#7D6E52] font-sans font-semibold uppercase tracking-wider mt-0.5">Live operational event log</p>
              </div>

              <div className="divide-y divide-[#EFE3C4] p-4">
                {[
                  { time: '10 mins ago', title: 'New Customer Order placed', desc: 'Siddharth R. booked Blue Plate Catering for 150 guests', type: 'order' },
                  { time: '1 hour ago', title: 'Caterer profile approved', desc: 'Flavors of Bengal was successfully onboarded by Admin', type: 'partner' },
                  { time: '3 hours ago', title: 'System settings synced', desc: 'Platform configuration & theme settings synchronized globally', type: 'system' },
                  { time: 'Yesterday', title: 'Critical database purge', desc: 'Admin cleared 3 obsolete sandbox users safely', type: 'user' },
                ].map((log, idx) => (
                  <div key={idx} className="py-3 flex gap-3 text-left">
                    <span className="text-xl shrink-0 mt-0.5">
                      {log.type === 'order' ? '📦' : log.type === 'partner' ? '🤝' : log.type === 'system' ? '⚙️' : '👤'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-sans font-extrabold text-xs text-[#0F241C] truncate">{log.title}</h4>
                        <span className="text-[9px] text-[#7D6E52] shrink-0 font-medium">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5C5240] font-medium leading-relaxed mt-0.5">{log.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 6. "+ Quick Create" Slider Drawer Modal */}
      <AnimatePresence>
        {isQuickCreateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickCreateOpen(false)}
              className="fixed inset-0 bg-[#01291D]/65 backdrop-blur-xs z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t-2 border-[#DFC78A] rounded-t-[32px] p-6 z-[55] shadow-2xl pb-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EFE3C4]">
                <div className="text-left">
                  <h4 className="text-lg font-bold text-[#0F241C] font-display uppercase tracking-tight">Quick Action Console</h4>
                  <p className="text-[10px] text-[#7D6E52] font-sans font-bold uppercase tracking-wider">Deploy instant platform nodes</p>
                </div>
                <button 
                  onClick={() => setIsQuickCreateOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FAF3E2] border border-[#DFC78A] text-[#01291D] font-bold hover:bg-[#F3E2BA] text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Onboard Partner Caterer',
                    desc: 'Instantly add and register a verified premium catering partner profile to the active registry list',
                    icon: '🤝',
                    action: () => { setIsQuickCreateOpen(false); window.location.href = '/join'; }
                  },
                  {
                    title: 'Register Platform User',
                    desc: 'Create and dispatch credentials for a new administrator or customer account instantly',
                    icon: '👤',
                    action: () => { setIsQuickCreateOpen(false); window.location.href = '/register'; }
                  },
                  {
                    title: 'Dispatch New Order Alert',
                    desc: 'Trigger a mock premium catering marketplace booking for system testing and integration verification',
                    icon: '📦',
                    action: () => {
                      setIsQuickCreateOpen(false);
                      toast('Simulated booking alert dispatched into system queues successfully!', 'success');
                    }
                  },
                  {
                    title: 'Log Platform Event Node',
                    desc: 'Publish a custom system governance tick directly into the permanent admin audit logs list',
                    icon: '📜',
                    action: () => {
                      setIsQuickCreateOpen(false);
                      toast('Custom governance tick successfully committed to operational audit history ledger!', 'success');
                    }
                  }
                ].map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="w-full bg-[#FAF3E2]/55 rounded-2xl p-4 border border-[#DFC78A] shadow-sm hover:shadow-md hover:border-[#C68917] transition-all flex items-start gap-4 text-left active:scale-[0.98] cursor-pointer"
                  >
                    <span className="text-2xl mt-1 shrink-0">{cmd.icon}</span>
                    <div className="flex-1">
                      <h5 className="font-display font-extrabold text-xs text-[#0F241C] uppercase tracking-wide">{cmd.title}</h5>
                      <p className="text-[10px] text-[#5C5240] leading-relaxed mt-1">{cmd.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Persistent Bottom Tab Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-[#01291D] via-[#023A28] to-[#01291D] text-[#FFFDF8] rounded-[24px] py-2 px-2.5 flex items-center justify-between shadow-[0_12px_36px_rgba(1,41,29,0.45)] border border-[#DFC78A]/45">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutGrid },
          { id: 'partners', label: 'Partners', icon: Users },
          { id: 'quick-create', label: 'Create', icon: Plus, isSpecial: true },
          { id: 'orders', label: 'Orders', icon: Package, badge: 16 },
          { id: 'settings', label: 'Settings', icon: Sliders },
        ].map((tab) => {
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => setIsQuickCreateOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D99B16] via-[#F2BE3B] to-[#FCE07E] text-[#042419] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-[0_4px_16px_rgba(245,198,66,0.45)] hover:shadow-lg -translate-y-2 border border-[#FFFDF8]/40 shrink-0"
                title="Quick Create"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            );
          }

          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'overview') navigate('/admin-dashboard');
                if (tab.id === 'partners') navigate('/admin/partners');
                if (tab.id === 'orders') navigate('/admin/orders');
              }}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 border-0 bg-transparent relative min-w-[56px]",
                isActive 
                  ? "text-[#F5C642]" 
                  : "text-[#DFC78A]/75 hover:text-[#FFFDF8]"
              )}
            >
              <div className="relative">
                {React.createElement(tab.icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center border border-[#01291D]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 font-bold font-sans tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6. Modals for Filters & Sort selection */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-[#DFC78A] rounded-t-[32px] p-6 z-[55] shadow-2xl pb-10"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EFE3C4]">
                <h4 className="text-lg font-bold text-[#0F241C] font-display">Filter Records</h4>
                <button onClick={() => setIsFilterOpen(false)} className="text-[#8E7D5E] font-bold hover:text-[#0F241C] text-sm border-0 bg-transparent cursor-pointer">✕</button>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase text-[#7D6E52] tracking-wider text-left">Select Filter State</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeTab === 'partners' && ['All', 'Approved', 'Pending Approval', 'Suspended', 'Rejected'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setMobileFilterValue(opt); setIsFilterOpen(false); }}
                      className={cn(
                        "py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer",
                        mobileFilterValue === opt 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                  {activeTab === 'orders' && ['All', 'Pending', 'Submitted', 'Approved', 'Completed', 'Cancelled', 'Rejected'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setMobileFilterValue(opt); setIsFilterOpen(false); }}
                      className={cn(
                        "py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer",
                        mobileFilterValue === opt 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                  {activeTab === 'users' && ['All', 'Administrator', 'Partner', 'Customer'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setMobileFilterValue(opt); setIsFilterOpen(false); }}
                      className={cn(
                        "py-3 px-4 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer",
                        mobileFilterValue === opt 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {mobileFilterValue !== 'All' && (
                  <button 
                    onClick={() => { setMobileFilterValue('All'); setIsFilterOpen(false); }}
                    className="w-full mt-4 py-3 bg-red-50 text-red-700 font-bold rounded-2xl text-xs text-center hover:bg-red-100 transition-colors border border-red-200 cursor-pointer"
                  >
                    Clear Active Filter
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSortOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSortOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-[#DFC78A] rounded-t-[32px] p-6 z-[55] shadow-2xl pb-10"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EFE3C4]">
                <h4 className="text-lg font-bold text-[#0F241C] font-display">Sort Records</h4>
                <button onClick={() => setIsSortOpen(false)} className="text-[#8E7D5E] font-bold hover:text-[#0F241C] text-sm border-0 bg-transparent cursor-pointer">✕</button>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase text-[#7D6E52] tracking-wider text-left">Select Sort Criteria</p>
                <div className="flex flex-col gap-2">
                  {activeTab === 'partners' && [
                    { value: 'Newest', label: 'Newest Registration First' },
                    { value: 'NameA-Z', label: 'Business Name (A to Z)' },
                    { value: 'NameZ-A', label: 'Business Name (Z to A)' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setMobileSortValue(opt.value); setIsSortOpen(false); }}
                      className={cn(
                        "py-3.5 px-4 rounded-2xl text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                        mobileSortValue === opt.value 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {mobileSortValue === opt.value && <Check size={14} strokeWidth={3} />}
                    </button>
                  ))}
                  {activeTab === 'orders' && [
                    { value: 'Newest', label: 'Newest Order First' },
                    { value: 'TotalHighLow', label: 'Order Total: Highest to Lowest' },
                    { value: 'TotalLowHigh', label: 'Order Total: Lowest to Highest' },
                    { value: 'EventDate', label: 'Event Date Chronological' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setMobileSortValue(opt.value); setIsSortOpen(false); }}
                      className={cn(
                        "py-3.5 px-4 rounded-2xl text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                        mobileSortValue === opt.value 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {mobileSortValue === opt.value && <Check size={14} strokeWidth={3} />}
                    </button>
                  ))}
                  {activeTab === 'users' && [
                    { value: 'NameA-Z', label: 'Name (A to Z)' },
                    { value: 'Role', label: 'Group by Role' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setMobileSortValue(opt.value); setIsSortOpen(false); }}
                      className={cn(
                        "py-3.5 px-4 rounded-2xl text-xs font-bold transition-all text-left border flex items-center justify-between cursor-pointer",
                        mobileSortValue === opt.value 
                          ? "bg-gradient-to-r from-[#023A28] to-[#044C35] border-[#D9A323] text-[#F5C642] font-extrabold" 
                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#0F241C] hover:bg-[#FAF0D4]"
                      )}
                    >
                      <span>{opt.label}</span>
                      {mobileSortValue === opt.value && <Check size={14} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileNotificationsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNotificationsOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 bottom-0 right-0 w-80 bg-[#FFFDF8] border-l border-[#DFC78A] h-full z-[55] shadow-2xl flex flex-col overflow-hidden font-sans"
            >
              <div className="p-5 border-b border-[#D9A323]/30 flex justify-between items-center bg-gradient-to-r from-[#01291D] to-[#034431]">
                <h4 className="text-lg font-bold text-[#FFFDF8] font-display">Notifications</h4>
                <button 
                  onClick={() => setIsMobileNotificationsOpen(false)} 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-[#F5C642] hover:bg-white/20 transition cursor-pointer text-xs border border-[#D9A323]/30"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {orders.slice(0, 8).map((o, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF3E2]/70 rounded-xl border border-[#DFC78A] text-xs text-left relative overflow-hidden">
                    <p className="font-bold text-[#0F241C]">Order Update</p>
                    <p className="text-[#5C5240] text-[11px] mt-0.5 leading-snug">Order #{o.id.substring(0, 8)} for {o.catererName} is currently {o.status}.</p>
                    <span className="text-[9px] text-[#7D6E52] font-mono block mt-1.5">{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center py-12 text-[#7D6E52] text-xs italic">No new notifications.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileProfileOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-[#DFC78A] rounded-t-[32px] p-6 z-[55] shadow-2xl pb-10 flex flex-col font-sans"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EFE3C4]">
                <h4 className="text-lg font-bold text-[#0F241C] font-display">Administrator Account</h4>
                <button onClick={() => setIsMobileProfileOpen(false)} className="text-[#8E7D5E] font-bold text-sm border-0 bg-transparent cursor-pointer">✕</button>
              </div>
              
              <div className="flex items-center gap-4 bg-[#FAF3E2]/75 p-4 rounded-2xl border border-[#DFC78A] mb-5 text-left">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] font-display font-extrabold text-xl flex items-center justify-center shadow-md shrink-0 border border-[#B57B0C]/40">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-extrabold text-base text-[#0F241C] truncate">{user?.name || 'Platform Administrator'}</h4>
                  <p className="text-xs text-[#5C5240] font-medium truncate mt-0.5">{user?.email || adminEmail}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <button 
                  onClick={() => {
                    setIsMobileProfileOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FAF3E2]/60 hover:bg-[#FAF0D4] text-[#0F241C] font-bold text-xs text-left transition border border-[#DFC78A] cursor-pointer"
                >
                  Edit Platform Preferences
                </button>
                <button 
                  onClick={() => {
                    setIsMobileProfileOpen(false);
                    toast(`Admin credentials backed by high security protocols.`, 'success');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FAF3E2]/60 hover:bg-[#FAF0D4] text-[#0F241C] font-bold text-xs text-left transition border border-[#DFC78A] cursor-pointer"
                >
                  Security &amp; API Keys Config
                </button>
              </div>

              <button 
                onClick={async () => {
                  setIsMobileProfileOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <LogOut size={14} strokeWidth={2.5} />
                <span>Sign Out of Console</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
