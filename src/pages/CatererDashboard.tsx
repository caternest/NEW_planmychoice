import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Activity, ChefHat, Bell, TrendingUp, CalendarDays, CheckCircle, CheckCircle2, XCircle, RefreshCw, Clock, Settings, ShoppingBag, CreditCard, User, Image as ImageIcon, MapPin, Search, Menu as MenuIcon, Edit, ChevronRight, X, Save, UploadCloud, ChevronLeft, Star, Trash2, Printer, Phone, Mail, Hourglass, Flag, Coins, Eye, Layers, ArrowRight, ClipboardList, Users, ChevronsLeft, ChevronsRight, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { cn, compressImageFile } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import CatererMenuBuilder from '../components/CatererMenuBuilder';
import CatererMobileDashboard from '../components/CatererMobileDashboard';
import { getSupabase, uploadToSupabaseBucket } from '../lib/supabase';
import { 
  performOrderStatusUpdate, 
  storeNotification, 
  normalizeStatus, 
  getStatusBadgeColor, 
  getStatusLabel 
} from '../lib/orderUtils';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const ImageUploaderField: React.FC<ImageUploaderProps> = ({ label, value, onChange, placeholder }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast("Please select an image file.", "error");
      return;
    }
    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const publicUrl = await uploadToSupabaseBucket('branding-images', fileName, file, file.type);
        if (publicUrl) {
          onChange(publicUrl);
          return;
        }
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload failed, fallback to local:", storageErr);
    }

    compressImageFile(file, 600, 600, 0.75)
      .then(base64 => onChange(base64))
      .catch(err => {
        console.error("Error compressing image", err);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onChange(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className="space-y-2 text-left">
      <label className="block text-sm font-semibold text-[#0F241C]">{label}</label>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-[160px] bg-[#FAF3E2]/45 relative overflow-hidden",
          dragActive ? "border-[#D4961B] bg-[#FAF0D4]/60" : "border-[#DFC78A] hover:border-[#D4961B]",
          value ? "border-[#D4961B] bg-[#FFFDF8]" : ""
        )}
      >
        {value ? (
          <div className="relative w-full h-[140px] flex items-center justify-center group rounded-xl overflow-hidden bg-[#FFFDF8]">
            <img 
              src={value} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain rounded-xl p-1"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.opacity = '0.3';
              }}
            />
            <div className="absolute inset-0 bg-[#01291D]/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer bg-[#FFFDF8] text-[#01291D] border border-[#DFC78A] text-xs font-black px-4 py-2 rounded-xl hover:bg-[#FAF0D4] transition-all select-none">
                Change Image
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              <button 
                type="button"
                onClick={() => onChange('')}
                className="bg-rose-600 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-rose-700 transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
            <span className="absolute bottom-2 left-2 bg-gradient-to-r from-[#FCE07E] to-[#D99B16] text-[#042419] font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
              {isBase64 ? 'Uploaded File' : 'URL Image'}
            </span>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center py-2 select-none">
            <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UploadCloud size={22} className="text-[#9A6A0F]" />
            </div>
            <p className="text-sm font-bold text-[#0F241C]">Drag &amp; drop your image here, or</p>
            <label className="mt-1 text-xs font-extrabold text-[#065239] hover:text-[#9A6A0F] cursor-pointer underline decoration-2 underline-offset-2">
              browse files
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
            <p className="text-[11px] text-[#6B5F4B] mt-1">Supports PNG, JPG, JPEG, WEBP, GIF</p>
          </div>
        )}
      </div>

      <div className="relative mt-2">
        <label className="block text-[11px] text-[#6B5F4B] font-bold uppercase tracking-wider mb-1">Or paste image URL</label>
        <input 
          type="text" 
          placeholder={placeholder} 
          value={isBase64 ? '' : value} 
          disabled={!!isBase64}
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-2.5 text-xs text-[#0F241C] focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] outline-none placeholder:text-[#8E7F62] disabled:opacity-50" 
        />
        {isBase64 && (
          <p className="text-[10px] text-[#9A6A0F] mt-1 font-semibold">Using uploaded file. Clear image to paste a custom URL.</p>
        )}
      </div>
    </div>
  );
};

export default function CatererDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [partnerOrders, setPartnerOrders] = useState<any[]>([]);
  const [caterer, setCaterer] = useState<any>(null);

  // New filters and date-range states
  const [orderListFilter, setOrderListFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected' | 'revenue'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'event_asc' | 'amount_desc'>('newest');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [eventFilter, setEventFilter] = useState<'7' | '15' | '30' | 'custom'>('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(() => new Date());
  const [selectedCalendarDayKey, setSelectedCalendarDayKey] = useState<string | null>(null);

  useEffect(() => {
    setOrdersPage(1);
  }, [orderListFilter, orderSearchQuery, orderDateFilter, orderSortBy, ordersPerPage]);
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyData, setModifyData] = useState<any>({ price: 0, package: '', guests: 0, notes: '' });

  // Order Management Extra States
  const [showChangesRequestModal, setShowChangesRequestModal] = useState(false);
  const [changesRequestText, setChangesRequestText] = useState('');
  const [internalNotesText, setInternalNotesText] = useState('');
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);

  // Menu Builder State
  const [draftPackages, setDraftPackages] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Profile Edit State
  const [profileFormData, setProfileFormData] = useState<any>({});
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [dashboardNewAreaText, setDashboardNewAreaText] = useState('');

  const [resolvedCatererId, setResolvedCatererId] = useState<string | null>(() => localStorage.getItem('catererDashboardId'));
  const [isResolvingCaterer, setIsResolvingCaterer] = useState(false);

  // Resolution effect for the business record
  useEffect(() => {
    async function resolveCaterer() {
      if (resolvedCatererId) return;
      if (!user) return;
      
      setIsResolvingCaterer(true);
      console.log("[CATERER RESOLVE] Attempting to resolve business registration ID for user:", user.email, "uid:", user.id);
      
      const supabase = getSupabase();
      if (!supabase) {
        setIsResolvingCaterer(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('caterer_registrations')
          .select('id')
          .or(`userId.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (error) {
          console.error("[CATERER RESOLVE] Error querying registration:", error);
        } else if (data) {
          console.log("[CATERER RESOLVE] Resolved registration successfully:", data);
          localStorage.setItem('catererDashboardId', data.id);
          setResolvedCatererId(data.id);
        } else {
          // Fallback search in local storage registration copy
          const rawRegs = localStorage.getItem('registrations');
          if (rawRegs) {
            const parsed = JSON.parse(rawRegs);
            const locallyFound = parsed.find((r: any) => 
              r.userId === user.id || 
              (r.email && r.email.toLowerCase() === user.email.toLowerCase())
            );
            if (locallyFound) {
              console.log("[CATERER RESOLVE] Resolved from local registrations cache:", locallyFound);
              localStorage.setItem('catererDashboardId', locallyFound.id);
              setResolvedCatererId(locallyFound.id);
            }
          }
        }
      } catch (err) {
        console.error("[CATERER RESOLVE] Exception during resolution:", err);
      } finally {
        setIsResolvingCaterer(false);
      }
    }

    resolveCaterer();
  }, [user, resolvedCatererId]);

  // Main data fetching and realtime subscription effect
  useEffect(() => {
    if (!resolvedCatererId) {
      console.log("[CATERER DASHBOARD] Delaying loading/subscription until registration ID is resolved.");
      return;
    }

    refreshData();

    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase
        .channel(`caterer-orders-realtime-${resolvedCatererId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `catererId=eq.${resolvedCatererId}` },
          (payload) => {
            console.log("[REALTIME] Order update received on Caterer Dashboard:", payload);
            refreshData();
            reloadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, resolvedCatererId]);

  const refreshData = async () => {
    // Fetch Caterer Details
    const cid = resolvedCatererId || localStorage.getItem('catererDashboardId');
    if (!cid) {
      console.log("[CATERER DASHBOARD] refreshData canceled: cid is missing.");
      return;
    }

    // Fetch from Supabase
    const supabase = getSupabase() as any;
    let fetchedCaterer: any = null;
    if (supabase) {
      try {
        console.log("Fetching live caterer profile from Supabase for ID:", cid);
        const { data, error } = await (supabase
          .from('caterer_registrations') as any)
          .select('*')
          .eq('id', cid)
          .maybeSingle();

        if (!error && data) {
          const cat = data as any;
          fetchedCaterer = cat;
          setCaterer(cat);
          setDraftPackages(cat.draftMenuPackages || cat.menuPackages || cat.packages || []);
          setProfileFormData({
              owner: cat.owner || '',
              businessName: cat.businessName || '',
              phone: cat.phone || '',
              alternatePhone: cat.alternatePhone || '',
              email: cat.email || '',
              address: cat.address || '',
              city: cat.city || '',
              description: cat.description || '',
              fssaiNumber: cat.fssaiNumber || '',
              gstNumber: cat.gstNumber || '',
              panNumber: cat.panNumber || '',
              logo: cat.logo || '',
              coverBanner: cat.coverBanner || '',
              ownerPhoto: cat.ownerPhoto || '',
              branchPhoto: cat.branchPhoto || '',
              experience: cat.experience || '',
              eventsCompleted: cat.eventsCompleted || '',
              brandName: cat.brandName || '',
              tagline: cat.tagline || '',
              whatsappNumber: cat.whatsappNumber || '',
              branches: cat.branches || '',
              serviceAreas: cat.serviceAreas || '',
              galleryPhotos: cat.galleryPhotos || [],
              serveEntireHyderabad: cat.serveEntireHyderabad !== undefined ? cat.serveEntireHyderabad : (cat.serviceAreas === "All Hyderabad" || (Array.isArray(cat.serviceAreas) && cat.serviceAreas.length === 1 && cat.serviceAreas[0] === "All Hyderabad"))
          });
          setIsProfilePending(!!cat.pendingUpdates);
          
          // Sync local storage registrations
          const registrationsLocal = JSON.parse(localStorage.getItem('registrations') || '[]');
          const filtered = registrationsLocal.filter((r: any) => r.id !== cid);
          localStorage.setItem('registrations', JSON.stringify([...filtered, cat]));
        }
      } catch (err) {
        console.error("Error reading live profile from Supabase:", err);
      }
    }

    if (!fetchedCaterer) {
        const rawRegistrations = localStorage.getItem('registrations');
        if (rawRegistrations) {
            const all = JSON.parse(rawRegistrations);
            const found = all.find((c: any) => c.id === cid);
            if (found) {
               setCaterer(found);
               setDraftPackages(found.draftMenuPackages || found.menuPackages || found.packages || []);
               setProfileFormData({
                   owner: found.owner || '',
                   businessName: found.businessName || '',
                   phone: found.phone || '',
                   alternatePhone: found.alternatePhone || '',
                   email: found.email || '',
                   address: found.address || '',
                   city: found.city || '',
                   description: found.description || '',
                   fssaiNumber: found.fssaiNumber || '',
                   gstNumber: found.gstNumber || '',
                   panNumber: found.panNumber || '',
                   logo: found.logo || '',
                   coverBanner: found.coverBanner || '',
                   ownerPhoto: found.ownerPhoto || '',
                   branchPhoto: found.branchPhoto || '',
                   experience: found.experience || '',
                   eventsCompleted: found.eventsCompleted || '',
                   brandName: found.brandName || '',
                   tagline: found.tagline || '',
                   whatsappNumber: found.whatsappNumber || '',
                   branches: found.branches || '',
                   serviceAreas: found.serviceAreas || '',
                   galleryPhotos: found.galleryPhotos || [],
                   serveEntireHyderabad: found.serveEntireHyderabad !== undefined ? found.serveEntireHyderabad : (found.serviceAreas === "All Hyderabad" || (Array.isArray(found.serviceAreas) && found.serviceAreas.length === 1 && found.serviceAreas[0] === "All Hyderabad"))
               });
               setIsProfilePending(!!found.pendingUpdates);
            }
        }
    }

    // Fetch Orders from Supabase first
    if (supabase) {
      try {
        console.log("Fetching live orders from Supabase for caterer ID:", cid);
        const { data: ords, error: ordsErr } = await supabase
          .from('orders')
          .select('*')
          .eq('catererId', cid)
          .order('created_at', { ascending: false });

        if (!ordsErr && ords) {
          setPartnerOrders(ords);
          // Sync local storage orders
          const rawOrders = localStorage.getItem('orders') || '[]';
          const allLocalOrders = JSON.parse(rawOrders).filter((o: any) => o.catererId !== cid);
          localStorage.setItem('orders', JSON.stringify([...allLocalOrders, ...ords]));
          return;
        }
      } catch (err) {
        console.error("Error reading live orders from Supabase:", err);
      }
    }

    // Check localStorage fallback for orders
    const rawOrders = localStorage.getItem('orders');
    if (rawOrders) {
        const allOrders = JSON.parse(rawOrders);
        const myOrders = allOrders.filter((o: any) => o.catererId === cid);
        // sort by newest
        myOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPartnerOrders(myOrders);
    }
  };

  const handleOpenOrderDetails = (ord: any) => {
    setSelectedOrder(ord);
    setInternalNotesText(ord.internalNotes || ord.internal_notes || '');
    setShowFullDetailsModal(true);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setShowFullDetailsModal(false);
  };

  const handleSaveInternalNotes = async (orderId: string) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('orders').update({
          internalNotes: internalNotesText,
          internal_notes: internalNotesText
        }).eq('id', orderId);
      }
    } catch (e) {
      console.warn("Could not save internal notes upstream:", e);
    }
    const rawOrders = localStorage.getItem('orders');
    if (rawOrders) {
      const allOrders = JSON.parse(rawOrders);
      const updated = allOrders.map((o: any) => {
        if (o.id === orderId) {
          return {
            ...o,
            internalNotes: internalNotesText,
            internal_notes: internalNotesText
          };
        }
        return o;
      });
      localStorage.setItem('orders', JSON.stringify(updated));
    }
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, internalNotes: internalNotesText, internal_notes: internalNotesText });
    }
    refreshData();
    toast("Internal notes updated successfully", "success");
  };

  const handleRequestChanges = async () => {
    if (!changesRequestText.trim()) {
      toast("Please specify what changes or details you are requesting.", "error");
      return;
    }
    
    try {
      await performOrderStatusUpdate(
        selectedOrder.id, 
        'changes_requested', 
        { 
          changesRequestedMemo: changesRequestText,
          specialNotes: changesRequestText 
        }, 
        user?.email || 'partner@caternest.com', 
        'partner'
      );
      
      storeNotification(
        selectedOrder.id,
        "Details Requested",
        `The caterer has requested updates for your order #${selectedOrder.id}: ${changesRequestText}`,
        "customer",
        caterer?.id
      );

      setShowChangesRequestModal(false);
      setSelectedOrder(null);
      setChangesRequestText('');
      await refreshData();
      toast("Requested changes successfully", "success");
    } catch (err) {
      console.error("Failed to request changes:", err);
      toast("Error requested changes", "error");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await performOrderStatusUpdate(id, 'approved', {}, user?.email || 'partner@caternest.com', 'partner');
      
      const ord = partnerOrders.find(o => o.id === id);
      storeNotification(
        id,
        "Order Approved! 🎉",
        `Your booking query for ${ord?.eventDate || 'selected date'} has been approved by the caterer.`,
        "customer",
        caterer?.id
      );
      
      storeNotification(
        id,
        "Order Approved",
        `Order #${id} has been approved by ${caterer?.businessName || 'Caterer'}.`,
        "admin"
      );

      await refreshData();
      setSelectedOrder(null);
      toast("Order approved successfully", "success");
    } catch (err) {
      console.error("Failed to approve order:", err);
      toast("Error approving order", "error");
    }
  };

  const handleReject = async () => {
    if(!rejectReason.trim()) {
      toast("Please provide a rejection reason.", "error");
      return;
    }
    try {
      await performOrderStatusUpdate(
        selectedOrder.id, 
        'rejected', 
        { rejectionReason: rejectReason }, 
        user?.email || 'partner@caternest.com', 
        'partner'
      );
      
      storeNotification(
        selectedOrder.id,
        "Order Rejected",
        `Your booking request was declined. Reason: ${rejectReason}`,
        "customer",
        caterer?.id
      );
      
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      await refreshData();
      toast("Order rejected successfully", "success");
    } catch (err) {
      console.error("Failed to reject order:", err);
      toast("Error rejecting order", "error");
    }
  };

  const handleModify = async () => {
    try {
      await performOrderStatusUpdate(
        selectedOrder.id, 
        'quotation_updated', 
        {
          pricePerPlate: modifyData.price,
          guests: modifyData.guests,
          specialNotes: modifyData.notes,
          totalEstimate: modifyData.price * modifyData.guests + (selectedOrder.platformFee || 0)
        }, 
        user?.email || 'partner@caternest.com', 
        'partner'
      );
      
      storeNotification(
        selectedOrder.id,
        "Quote Proposal Adjusted",
        `The caterer has sent an adjusted quotation of ₹${(modifyData.price * modifyData.guests + (selectedOrder.platformFee || 0)).toLocaleString()}`,
        "customer",
        caterer?.id
      );

      setShowModifyModal(false);
      setSelectedOrder(null);
      await refreshData();
      toast("Adjusted quotation sent to customer", "success");
    } catch (err) {
      console.error("Failed to modify quote:", err);
      toast("Error modifying quote", "error");
    }
  };

  const openModifyModal = (ord: any) => {
    setSelectedOrder(ord);
    setModifyData({
      price: ord.pricePerPlate,
      package: ord.packageDetails?.packageName || 'Custom',
      guests: ord.guests,
      notes: ord.specialNotes || ''
    });
    setShowModifyModal(true);
  };

  // Notification tab state hooks and triggers
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  
  const reloadNotifications = () => {
    const raw = localStorage.getItem('notifications') || '[]';
    try {
      const parsed = JSON.parse(raw);
      const filtered = parsed.filter((n: any) => 
        n.targetRole === 'caterer' && 
        (!n.catererId || n.catererId === caterer?.id || n.catererId === user?.id)
      );
      setLocalNotifications(filtered);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications' || caterer) {
      reloadNotifications();
    }
  }, [activeTab, caterer]);

  const handleMarkNotificationRead = (id: string) => {
    const raw = localStorage.getItem('notifications') || '[]';
    try {
      const parsed = JSON.parse(raw);
      const updated = parsed.map((n: any) => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('notifications', JSON.stringify(updated));
      reloadNotifications();
      toast("Notification marked read", "success");
    } catch(err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = () => {
    const raw = localStorage.getItem('notifications') || '[]';
    try {
      const parsed = JSON.parse(raw);
      const remaining = parsed.filter((n: any) => 
        !(n.targetRole === 'caterer' && (!n.catererId || n.catererId === caterer?.id || n.catererId === user?.id))
      );
      localStorage.setItem('notifications', JSON.stringify(remaining));
      reloadNotifications();
      toast("Notifications cleared", "success");
    } catch(err) {
      console.error(err);
    }
  };

  const handleSaveDraft = async () => {
      const cid = resolvedCatererId || localStorage.getItem('catererDashboardId');
      if (!cid || !caterer) return;

      const supabase = getSupabase() as any;
      if (supabase) {
        try {
          const { error } = await supabase
            .from('caterer_registrations')
            .update({ draftMenuPackages: draftPackages })
            .eq('id', caterer.id);
          if (error) throw error;
        } catch (err: any) {
          console.error("Failed to save draft to Supabase:", err);
        }
      }

      const rawRegistrations = localStorage.getItem('registrations');
      if (rawRegistrations) {
          const all = JSON.parse(rawRegistrations);
          const updated = all.map((c: any) => c.id === caterer.id ? { ...c, draftMenuPackages: draftPackages } : c);
          try {
              localStorage.setItem('registrations', JSON.stringify(updated));
              toast('Draft saved successfully', 'success');
              refreshData();
          } catch (err) {
              console.error("Quota exceeded during save", err);
              toast("Changes saved to live database; local browser cache cleared.", "success");
              refreshData();
          }
      }
  };

  const handlePublishMenu = async () => {
      const cid = resolvedCatererId || localStorage.getItem('catererDashboardId');
      if (!cid || !caterer) return;

      const supabase = getSupabase() as any;
      if (supabase) {
        try {
          const { error } = await supabase
            .from('caterer_registrations')
            .update({ 
               draftMenuPackages: draftPackages, 
               menuPackages: draftPackages,
               packages: draftPackages
            })
            .eq('id', caterer.id);
          if (error) throw error;
        } catch (err: any) {
          console.error("Failed to publish menu to Supabase:", err);
        }
      }

      const rawRegistrations = localStorage.getItem('registrations');
      if (rawRegistrations) {
          const all = JSON.parse(rawRegistrations);
          const updated = all.map((c: any) => c.id === caterer.id ? { ...c, draftMenuPackages: draftPackages, menuPackages: draftPackages, packages: draftPackages } : c);
          try {
              localStorage.setItem('registrations', JSON.stringify(updated));
              toast('Menu published successfully! Customers can now see these changes.', 'success');
              refreshData();
          } catch (err) {
              console.error("Quota exceeded during publish", err);
              toast("Menu published to the live database! Local cache cleared.", "success");
              refreshData();
          }
      }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const cid = resolvedCatererId || localStorage.getItem('catererDashboardId');
      if (!cid || !caterer) return;

      const sensitivePayload = {
          owner: profileFormData.owner || '',
          businessName: profileFormData.businessName || '',
          phone: profileFormData.phone || '',
          alternatePhone: profileFormData.alternatePhone || '',
          email: profileFormData.email || '',
          fssaiNumber: profileFormData.fssaiNumber || '',
          gstNumber: profileFormData.gstNumber || '',
          panNumber: profileFormData.panNumber || '',
          logo: profileFormData.logo || '',
          coverBanner: profileFormData.coverBanner || '',
          ownerPhoto: profileFormData.ownerPhoto || '',
          branchPhoto: profileFormData.branchPhoto || ''
      };

      const hasSensitiveChanges = 
          sensitivePayload.owner !== (caterer.owner || '') ||
          sensitivePayload.businessName !== (caterer.businessName || '') ||
          sensitivePayload.phone !== (caterer.phone || '') ||
          sensitivePayload.alternatePhone !== (caterer.alternatePhone || '') ||
          sensitivePayload.email !== (caterer.email || '') ||
          sensitivePayload.fssaiNumber !== (caterer.fssaiNumber || '') ||
          sensitivePayload.gstNumber !== (caterer.gstNumber || '') ||
          sensitivePayload.panNumber !== (caterer.panNumber || '') ||
          sensitivePayload.logo !== (caterer.logo || '') ||
          sensitivePayload.coverBanner !== (caterer.coverBanner || '') ||
          sensitivePayload.ownerPhoto !== (caterer.ownerPhoto || '') ||
          sensitivePayload.branchPhoto !== (caterer.branchPhoto || '');

      const finalPendingUpdates = hasSensitiveChanges ? {
          ...sensitivePayload,
          _requestedBy: caterer.owner || caterer.businessName || "Caterer",
          _requestedAt: new Date().toISOString()
      } : (caterer.pendingUpdates || null);

      const directPayload = {
          brandName: profileFormData.brandName || null,
          tagline: profileFormData.tagline || null,
          description: profileFormData.description || null,
          experience: profileFormData.experience ? parseInt(profileFormData.experience) : null,
          eventsCompleted: profileFormData.eventsCompleted ? parseInt(profileFormData.eventsCompleted) : null,
          branches: profileFormData.branches ? parseInt(profileFormData.branches) : null,
          serviceAreas: profileFormData.serviceAreas || null,
          serveEntireHyderabad: profileFormData.serveEntireHyderabad || (profileFormData.serviceAreas === "All Hyderabad" || (Array.isArray(profileFormData.serviceAreas) && profileFormData.serviceAreas.length === 1 && profileFormData.serviceAreas[0] === "All Hyderabad")),
          whatsappNumber: profileFormData.whatsappNumber || null,
          address: profileFormData.address || null,
          city: profileFormData.city || null,
          galleryPhotos: profileFormData.galleryPhotos || [],
          services: caterer.services || null,
          achievements: caterer.achievements || null,
          highlights: caterer.highlights || null,
          specializations: caterer.specializations || null,
          pendingUpdates: finalPendingUpdates
      };

      // ADDED DEBUG LOGS
      console.log("=== CATERNEST DATA SYNCHRONIZATION AUDIT LOGS ===");
      const directKeys = [
          { name: "Brand Public Name", field: "brandName", col: "includedItems._fallback_brandName" },
          { name: "Brand Tagline", field: "tagline", col: "includedItems._fallback_tagline" },
          { name: "Description", field: "description", col: "includedItems._fallback_description" },
          { name: "Experience Years", field: "experience", col: "includedItems._fallback_experience" },
          { name: "Events Completed", field: "eventsCompleted", col: "includedItems._fallback_eventsCompleted" },
          { name: "Branch Count", field: "branches", col: "includedItems._fallback_branches" },
          { name: "Service Areas", field: "serviceAreas", col: "includedItems._fallback_serviceAreas" },
          { name: "WhatsApp Number", field: "whatsappNumber", col: "includedItems._fallback_whatsappNumber" },
          { name: "HQ Address", field: "address", col: "address" },
          { name: "City", field: "city", col: "city" }
      ];
      directKeys.forEach(({ name, field, col }) => {
          const oldVal = (caterer as any)[field];
          const newVal = (directPayload as any)[field];
          if (oldVal !== newVal) {
              console.log(`[SYNC DEBUG] Field: "${name}", Old Value: ${JSON.stringify(oldVal)}, New Value: ${JSON.stringify(newVal)}, Database Column Updated: "${col}"`);
          }
      });

      const sensitiveKeysMapping = [
          { name: "Founder Name", field: "owner", col: "owner" },
          { name: "Legal Business Name", field: "businessName", col: "businessName" },
          { name: "Phone/Mobile", field: "phone", col: "phone" },
          { name: "Alternate Phone", field: "alternatePhone", col: "alternatePhone" },
          { name: "Email", field: "email", col: "email" },
          { name: "FSSAI", field: "fssaiNumber", col: "fssaiNumber" },
          { name: "GST", field: "gstNumber", col: "gstNumber" },
          { name: "PAN", field: "panNumber", col: "panNumber" },
          { name: "Logo", field: "logo", col: "logo" },
          { name: "Cover Banner", field: "coverBanner", col: "coverBanner" },
          { name: "Founder Photo", field: "ownerPhoto", col: "ownerPhoto" },
          { name: "Branch Photo", field: "branchPhoto", col: "branchPhoto" }
      ];
      sensitiveKeysMapping.forEach(({ name, field, col }) => {
          const oldVal = (caterer as any)[field];
          const newVal = (sensitivePayload as any)[field];
          if (oldVal !== newVal) {
              console.log(`[SYNC DEBUG] Field: "${name}" (SENSITIVE), Old Value: ${JSON.stringify(oldVal)}, New Value: ${JSON.stringify(newVal)}, Database Column Updated: "pendingUpdates.${field} (Admin review required)"`);
          }
      });
      console.log("================================================");

      const supabase = getSupabase() as any;
      if (supabase) {
        try {
          const { error } = await supabase
            .from('caterer_registrations')
            .update(directPayload)
            .eq('id', caterer.id);
          if (error) throw error;
        } catch (err: any) {
          console.error("Failed to submit profile updates to Supabase:", err);
        }
      }

      const rawRegistrations = localStorage.getItem('registrations');
      if (rawRegistrations) {
          const all = JSON.parse(rawRegistrations);
          const updated = all.map((c: any) => {
              if (c.id === caterer.id) {
                  return {
                      ...c,
                      ...directPayload,
                      address: profileFormData.address || c.address,
                      pendingUpdates: finalPendingUpdates
                  };
              }
              return c;
          });
          try {
              localStorage.setItem('registrations', JSON.stringify(updated));
              if (hasSensitiveChanges) {
                  toast('Sensitive changes require Admin Review. Profile update requested.', 'success');
              } else {
                  toast('Profile saved successfully!', 'success');
              }
              refreshData();
          } catch (err: any) {
              if (err.name === "QuotaExceededError" || err.message?.includes("quota") || err.message?.includes("exceeded")) {
                  console.warn("[QuotaExceededError] localStorage quota exceeded in Dashboard. Cleaning large datasets inside cache.");
                  const cleaned = updated.map((c: any) => {
                      const copy = { ...c };
                      delete copy.galleryPhotos;
                      delete copy.menuPackages;
                      delete copy.packages;
                      delete copy.draftMenuPackages;
                      delete copy.images;
                      if (copy.includedItems && typeof copy.includedItems === "object") {
                          const incCopy = { ...copy.includedItems };
                          delete incCopy._fallback_galleryPhotos;
                          delete incCopy._fallback_menuPackages;
                          delete incCopy._fallback_packages;
                          delete incCopy._fallback_draftMenuPackages;
                          delete incCopy._fallback_images;
                          copy.includedItems = incCopy;
                      }
                      return copy;
                  });
                  try {
                      localStorage.setItem('registrations', JSON.stringify(cleaned));
                      if (hasSensitiveChanges) {
                          toast('Sensitive changes require Admin Review. Profile update requested.', 'success');
                      } else {
                          toast('Profile saved successfully!', 'success');
                      }
                      refreshData();
                  } catch (innerErr) {
                      console.error("Quota exceeded even after cleanup", innerErr);
                      toast("Profile update request saved on live database!", "success");
                      refreshData();
                  }
              } else {
                  console.error("Error setting localStorage registrations:", err);
              }
          }
      }
  };

  const [galleryDragActive, setGalleryDragActive] = useState(false);

  const handleGalleryDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGalleryDragActive(true);
    } else if (e.type === "dragleave") {
      setGalleryDragActive(false);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleDeletePhoto = (index: number) => {
    const current = profileFormData.galleryPhotos || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    setProfileFormData({
      ...profileFormData,
      galleryPhotos: updated
    });
  };

  const handleReplacePhoto = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast("Please select an image file.", "error");
      return;
    }
    const supabase = getSupabase();
    let uploadedUrl = "";
    try {
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const publicUrl = await uploadToSupabaseBucket('branding-images', fileName, file, file.type);
        if (publicUrl) {
          uploadedUrl = publicUrl;
        }
      }
    } catch (err) {
      console.warn("Supabase storage upload failed, fallback to local base64:", err);
    }

    if (!uploadedUrl) {
      try {
        uploadedUrl = await compressImageFile(file, 800, 800, 0.8) as string;
      } catch (e) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const current = [...(profileFormData.galleryPhotos || [])];
            current[index] = ev.target.result as string;
            setProfileFormData({ ...profileFormData, galleryPhotos: current });
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    }

    const current = [...(profileFormData.galleryPhotos || [])];
    current[index] = uploadedUrl;
    setProfileFormData({
      ...profileFormData,
      galleryPhotos: current
    });
  };

  const handleMovePhoto = (index: number, direction: 'left' | 'right') => {
    const current = [...(profileFormData.galleryPhotos || [])];
    if (direction === 'left' && index > 0) {
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
    } else if (direction === 'right' && index < current.length - 1) {
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
    }
    setProfileFormData({
      ...profileFormData,
      galleryPhotos: current
    });
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const current = [...(profileFormData.galleryPhotos || [])];
    const item = current.splice(index, 1)[0];
    current.unshift(item);
    setProfileFormData({
      ...profileFormData,
      galleryPhotos: current
    });
  };

  const handleMultipleFiles = async (files: FileList) => {
    const newPhotos: string[] = [];
    const supabase = getSupabase();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      try {
        if (supabase) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
          const publicUrl = await uploadToSupabaseBucket('branding-images', fileName, file, file.type);
          if (publicUrl) {
            newPhotos.push(publicUrl);
            continue;
          }
        }
      } catch (err) {
        console.warn("Supabase storage upload failed, fallback to local base64:", err);
      }

      // Fallback to Base64 compression
      try {
        const base64 = await compressImageFile(file, 800, 800, 0.8) as string;
        newPhotos.push(base64);
      } catch (e) {
        // Fallback to FileReader
        const p = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
        const res = await p;
        newPhotos.push(res);
      }
    }

    if (newPhotos.length > 0) {
      const current = profileFormData.galleryPhotos || [];
      setProfileFormData({
        ...profileFormData,
        galleryPhotos: [...current, ...newPhotos]
      });
    }
  };

  const totalOrders = partnerOrders.length;
  const pendingOrders = partnerOrders.filter(o => {
    const s = normalizeStatus(o.status);
    return s === 'pending' || s === 'updated_by_customer';
  }).length;
  const approvedOrders = partnerOrders.filter(o => normalizeStatus(o.status) === 'approved').length;
  const modifiedOrders = partnerOrders.filter(o => normalizeStatus(o.status) === 'changes_requested').length;
  const rejectedOrders = partnerOrders.filter(o => {
    const s = normalizeStatus(o.status);
    return s === 'rejected' || s === 'cancelled';
  }).length;
  const completedOrders = partnerOrders.filter(o => normalizeStatus(o.status) === 'completed').length;
  
  // Helpers for robust order calculations
  const getOrderGuests = (ord: any): string | number => {
    if (!ord) return '—';
    const val = ord.guests ?? ord.guestCount;
    return (val !== undefined && val !== null && val !== '') ? val : '—';
  };

  const getOrderTotalAmount = (ord: any): number => {
    if (!ord) return 0;
    const val = ord.totalEstimate ?? ord.totalAmount ?? ord.amount;
    if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
    const g = Number(ord.guests ?? ord.guestCount ?? 0);
    const p = Number(ord.pricePerPlate ?? ord.packageDetails?.startingPrice ?? 0);
    const fee = Number(ord.platformFee ?? 0);
    if (g > 0 && p > 0) return g * p + fee;
    return 0;
  };

  const parseOrderDetails = (order: any) => {
    let meals = order.mealSelection || '';
    let timings = order.mealTimings || '';
    let dietary = order.dietaryPreferences || (Array.isArray(order.dietary) ? order.dietary.join(', ') : '');
    let specialInstructions = order.specialInstructions || '';
    let venueAddress = order.venueAddress || order.address || order.venue || '';
    let venueName = order.venueName || '';
    let mapUrl = order.googleMapsUrl || order.mapLocation || '';

    const rawNotes = order.specialNotes || order.notes || '';
    if (rawNotes) {
      const lines = rawNotes.split(/[\n\r]+/).map((s: string) => s.trim()).filter(Boolean);
      const leftovers: string[] = [];

      for (const line of lines) {
        if (/^meals?\s*:/i.test(line)) {
          if (!meals) meals = line.replace(/^meals?\s*:/i, '').trim();
        } else if (/^timings?\s*:/i.test(line) || /^time\s*:/i.test(line)) {
          if (!timings) timings = line.replace(/^(timings?|time)\s*:/i, '').trim();
        } else if (/^dietary\s*:/i.test(line) || /^diet\s*:/i.test(line)) {
          if (!dietary) dietary = line.replace(/^(dietary|diet)\s*:/i, '').trim();
        } else if (/^google\s*maps?\s*:/i.test(line) || /^map\s*:/i.test(line) || /https?:\/\/maps/i.test(line)) {
          if (!mapUrl) {
            const match = line.match(/https?:\/\/[^\s]+/i);
            mapUrl = match ? match[0] : line.replace(/^.*?:/i, '').trim();
          }
        } else if (/^venue\s*(name|type|address)?\s*:/i.test(line)) {
          if (!venueAddress) venueAddress = line.replace(/^.*?:/i, '').trim();
        } else if (/^special\s*(instructions?|notes?|requests?)\s*:/i.test(line)) {
          leftovers.push(line.replace(/^special\s*(instructions?|notes?|requests?)\s*:/i, '').trim());
        } else {
          leftovers.push(line);
        }
      }

      if (!specialInstructions && leftovers.length > 0) {
        specialInstructions = leftovers.join('\n');
      }
    }

    return {
      meals,
      timings,
      dietary,
      specialInstructions,
      venueAddress,
      venueName,
      mapUrl
    };
  };

  const getCategorizedMenuItems = (order: any) => {
    const selectedList: string[] = order?.selectedItems || [];
    const categories = order?.packageDetails?.categories || [];

    if (categories.length > 0 && selectedList.length > 0) {
      const grouped: { categoryName: string; items: string[] }[] = [];
      const claimed = new Set<string>();

      for (const cat of categories) {
        const catItems = (cat.items || []).filter((it: string) => selectedList.includes(it));
        if (catItems.length > 0) {
          grouped.push({ categoryName: cat.categoryName, items: catItems });
          catItems.forEach((it: string) => claimed.add(it));
        }
      }

      const leftovers = selectedList.filter((it: string) => !claimed.has(it));
      if (leftovers.length > 0) {
        grouped.push({ categoryName: 'Special Add-ons & Extra Items', items: leftovers });
      }

      if (grouped.length > 0) return grouped;
    }

    if (selectedList.length > 0) {
      return [{ categoryName: 'Selected Menu Items', items: selectedList }];
    }

    return [];
  };

  // Calculate Revenue
  const revenue = partnerOrders
      .filter(o => {
        const s = normalizeStatus(o.status);
        return s === 'approved' || s === 'completed';
      })
      .reduce((acc, curr) => acc + (((Number(curr.pricePerPlate) || 0) * (Number(curr.guests || curr.guestCount) || 0)) * 0.9), 0);
  
  // This month revenue
  const thisMonthRevenue = partnerOrders
      .filter(o => {
        const s = normalizeStatus(o.status);
        const isApprovedOrCompleted = s === 'approved' || s === 'completed';
        return isApprovedOrCompleted && new Date(o.created_at).getMonth() === new Date().getMonth();
      })
      .reduce((acc, curr) => acc + (((Number(curr.pricePerPlate) || 0) * (Number(curr.guests || curr.guestCount) || 0)) * 0.9), 0);

  const getStatusColor = (status: string) => {
    return getStatusBadgeColor(status);
  };

  const unreadNotificationsCount = localNotifications.filter(n => !n.read).length;

  const filteredOrderList = partnerOrders
    .filter((o) => {
      const norm = normalizeStatus(o.status);
      if (orderListFilter === 'pending') {
        if (!(norm === 'pending' || norm === 'changes_requested' || o.status === 'Submitted' || o.status === 'Pending Caterer Review')) return false;
      } else if (orderListFilter === 'approved') {
        if (!(norm === 'approved' || o.status === 'Approved')) return false;
      } else if (orderListFilter === 'completed') {
        if (!(norm === 'completed' || o.status === 'Completed')) return false;
      } else if (orderListFilter === 'rejected') {
        if (!(norm === 'rejected' || o.status === 'Rejected' || o.status === 'Cancelled')) return false;
      } else if (orderListFilter === 'revenue') {
        if (!(norm === 'approved' || norm === 'completed' || o.status === 'Approved' || o.status === 'Completed')) return false;
      }

      if (orderDateFilter) {
        const createdKey = o.created_at ? new Date(o.created_at).toISOString().split('T')[0] : '';
        const evKey = o.eventDate ? String(o.eventDate).split('T')[0] : '';
        if (createdKey !== orderDateFilter && evKey !== orderDateFilter) return false;
      }

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.trim().toLowerCase();
        const haystack = [
          o.id,
          o.customerName,
          o.customerPhone,
          o.phone,
          o.packageDetails?.packageName,
          o.venue,
          o.address,
          o.venueAddress,
          o.status
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (orderSortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (orderSortBy === 'event_asc') {
        return new Date(a.eventDate || '9999-12-31').getTime() - new Date(b.eventDate || '9999-12-31').getTime();
      }
      if (orderSortBy === 'amount_desc') {
        return getOrderTotalAmount(b) - getOrderTotalAmount(a);
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  const getFilteredUpcomingEvents = () => {
    const approved = partnerOrders.filter(o => {
      const norm = normalizeStatus(o.status);
      return (norm === 'approved' || o.status === 'Approved') && o.eventDate;
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = approved.filter(o => {
      const evDate = new Date(o.eventDate);
      if (isNaN(evDate.getTime())) return false;
      
      if (evDate < todayStart) return false;

      const diffTime = evDate.getTime() - todayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (eventFilter === '7') {
        return diffDays <= 7;
      }
      if (eventFilter === '15') {
        return diffDays <= 15;
      }
      if (eventFilter === '30') {
        return diffDays <= 30;
      }
      if (eventFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          if (!isNaN(start.getTime()) && evDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          const endPlusDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
          if (!isNaN(end.getTime()) && evDate > endPlusDay) return false;
        }
        return true;
      }
      return true;
    });

    filtered.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    return filtered;
  };

  const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : null },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'gallery', label: 'Gallery', icon: ImageIcon },
      { id: 'packages', label: 'Menu Packages', icon: Package },
       { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (caterer && (caterer.status === 'Pending Approval' || caterer.status === 'pending_approval')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center p-6 pt-24 select-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#FFFDF8] rounded-3xl p-8 border border-[#DFC78A] text-center shadow-[0_18px_45px_rgba(116,84,22,0.12)] animate-fade-in"
          id="pending-approval-guard"
        >
          <div className="w-16 h-16 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#A87512] flex items-center justify-center mx-auto mb-6">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-[#0F241C] mb-3">Under Review</h2>
          <p className="text-[#5C5240] text-sm leading-relaxed mb-6">
            Your account is under review. Please wait for admin approval.
          </p>
          <div className="bg-[#FAF3E2]/70 rounded-2xl p-4 border border-[#DFC78A] text-left mb-6">
            <p className="text-xs text-[#7D6E52] font-bold uppercase tracking-widest mb-1">Business Name</p>
            <p className="font-bold text-[#0F241C]">{caterer.businessName}</p>
            <p className="text-[10px] text-[#7D6E52] font-bold uppercase tracking-widest mt-3 mb-1">Owner</p>
            <p className="text-xs font-semibold text-[#494032]">{caterer.owner || caterer.ownerName}</p>
          </div>
          <p className="text-xs text-[#6B5F4B] font-medium">
            Our administrators typically review registration requests within 24 hours.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF2E1] text-[#0F241C] selection:bg-[#F3D785]">
      {/* Hide global navbar on mobile */}
      <style>{`
        @media (max-width: 767px) {
          #main-navigation-navbar {
            display: none !important;
          }
        }
      `}</style>

      {/* MOBILE PREMIUM VIEW */}
      <CatererMobileDashboard
        user={user}
        caterer={caterer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        partnerOrders={partnerOrders}
        localNotifications={localNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        approvedOrders={approvedOrders}
        completedOrders={completedOrders}
        rejectedOrders={rejectedOrders}
        revenue={revenue}
        eventFilter={eventFilter}
        setEventFilter={setEventFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        getFilteredUpcomingEvents={getFilteredUpcomingEvents}
        handleOpenOrderDetails={handleOpenOrderDetails}
        getStatusColor={getStatusColor}
        navItems={navItems}
        logout={logout}
        orderListFilter={orderListFilter}
        setOrderListFilter={setOrderListFilter}
        filteredOrderList={filteredOrderList}
        setSelectedOrder={setSelectedOrder}
        handleApprove={handleApprove}
        setShowRejectModal={setShowRejectModal}
        openModifyModal={openModifyModal}
        profileFormData={profileFormData}
        setProfileFormData={setProfileFormData}
        isProfilePending={isProfilePending}
        handleProfileSubmit={handleProfileSubmit}
        dashboardNewAreaText={dashboardNewAreaText}
        setDashboardNewAreaText={setDashboardNewAreaText}
        handleClearAllNotifications={handleClearAllNotifications}
        handleMarkNotificationRead={handleMarkNotificationRead}
        handleDeletePhoto={handleDeletePhoto}
        handleReplacePhoto={handleReplacePhoto}
        handleMovePhoto={handleMovePhoto}
        handleMakePrimary={handleMakePrimary}
        handleMultipleFiles={handleMultipleFiles}
      />

      {/* DESKTOP PARTNER PORTAL SHELL (Fixed Emerald Sidebar + Vertically Scrollable Cream Canvas) */}
      <div className="hidden md:flex h-screen pt-[60px] overflow-hidden bg-[#FAF2E1] w-full">
        
        {/* Fixed Dark Emerald Sidebar */}
        <aside className="w-[228px] xl:w-[244px] shrink-0 h-full relative overflow-hidden bg-gradient-to-b from-[#013122] via-[#01281C] to-[#011A12] border-r border-[#D9A323]/30 text-[#F6EFE0] flex flex-col justify-between shadow-[4px_0_24px_rgba(1,24,17,0.22)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C642]/45 to-transparent" />

            <div className="relative z-10 px-4 pt-5 pb-3 border-b border-[#D9A323]/20">
                <p className="text-[10.5px] font-bold text-[#E6C065] uppercase tracking-[0.16em]">Caterer Portal</p>
                <h2 className="text-[19px] font-display font-bold text-[#FFFDF8] truncate mt-1 leading-tight">
                  {caterer?.businessName || 'My Business'}
                </h2>
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[#F5C642] font-semibold bg-[#0A402F] px-2.5 py-1 rounded-full border border-[#D9A323]/40">
                    <CheckCircle size={12} className="text-[#F5C642]" />
                    <span>Approved Partner</span>
                </div>
            </div>
            
            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden w-full px-3.5 pt-3.5 pb-16 space-y-1.5 custom-sidebar-scrollbar">
               {navItems.map(item => {
                   const isActive = activeTab === item.id;
                   return (
                     <button 
                         key={item.id}
                         type="button"
                         onClick={() => setActiveTab(item.id)} 
                         className={cn(
                           "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 text-left cursor-pointer",
                           isActive
                             ? "bg-gradient-to-r from-[#FAE18D] via-[#E8B839] to-[#D2951B] text-[#052419] font-bold shadow-[0_6px_16px_rgba(217,163,35,0.28)] border border-[#FCEBA8]/65"
                             : "text-[#F6EFE0]/90 hover:bg-[#084330]/80 hover:text-[#FCE38A] font-medium"
                         )}
                     >
                         <div className="flex items-center gap-3 min-w-0">
                             <item.icon size={17} className={cn("shrink-0", isActive ? "text-[#052419]" : "text-[#E5BA4C]")} />
                             <span className="truncate">{item.label}</span>
                         </div>
                         {item.badge && (
                           <span className={cn(
                             "text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums shrink-0",
                             isActive ? "bg-[#052419] text-[#FAE18D]" : "bg-[#F4C44E] text-[#052419]"
                           )}>
                             {item.badge}
                           </span>
                         )}
                     </button>
                   );
               })}
            </div>

            {/* Decorative Bottom Golden Wave Accent */}
            <svg
              viewBox="0 0 244 58"
              fill="none"
              className="pointer-events-none select-none absolute bottom-0 left-0 right-0 w-full h-14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="catererSidebarWave1" x1="0" y1="58" x2="244" y2="8" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F9DF86" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#D9A323" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#8E6411" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="catererSidebarWave2" x1="0" y1="58" x2="244" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C88D1B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E6BC52" stopOpacity="0.18" />
                </linearGradient>
              </defs>
              <path d="M0 44 C56 58 112 18 244 26 L244 58 L0 58 Z" fill="url(#catererSidebarWave2)" />
              <path d="M0 52 C68 58 118 22 244 33" stroke="url(#catererSidebarWave1)" strokeWidth="2.4" fill="none" />
              <path d="M0 46 C72 52 132 14 244 22" stroke="#F8D86E" strokeOpacity="0.32" strokeWidth="1" fill="none" />
            </svg>
        </aside>

        {/* Vertically Scrollable Main Content Viewport */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#FAF3E3] via-[#FDF8EC] to-[#FAF0DC] px-5 xl:px-7 py-4">
            <div className="max-w-[1440px] mx-auto pb-6">
               
               {activeTab === 'dashboard' && (() => {
                 const upcomingEvents = getFilteredUpcomingEvents();
                 const calYear = calendarMonthDate.getFullYear();
                 const calMonth = calendarMonthDate.getMonth();
                 const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
                 const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                 const monthLabel = calendarMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                 // Group partner orders by YYYY-MM-DD for calendar indicators
                 const eventsByDayKey: Record<string, any[]> = {};
                 partnerOrders.forEach((ord) => {
                   if (!ord.eventDate) return;
                   const d = new Date(ord.eventDate);
                   if (isNaN(d.getTime())) return;
                   const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                   if (!eventsByDayKey[key]) eventsByDayKey[key] = [];
                   eventsByDayKey[key].push(ord);
                 });

                 const now = new Date();
                 const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                 // Determine active highlighted day in current month (user-clicked day OR first upcoming event day in viewed month OR today)
                 const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-`;
                 const firstEventInViewedMonth = Object.keys(eventsByDayKey)
                   .filter((k) => k.startsWith(monthPrefix))
                   .sort()[0] || null;
                 const highlightedDayKey =
                   (selectedCalendarDayKey && selectedCalendarDayKey.startsWith(monthPrefix) ? selectedCalendarDayKey : null) ||
                   firstEventInViewedMonth ||
                   (todayKey.startsWith(monthPrefix) ? todayKey : null);

                 const approvedShare = totalOrders > 0 ? Math.round(((approvedOrders + completedOrders) / totalOrders) * 100) : 0;

                 const kpiCards = [
                   {
                     id: 'all' as const,
                     label: 'Total Orders',
                     value: totalOrders,
                     icon: Package,
                     cardBg: 'bg-gradient-to-br from-[#F2FBF3] to-[#E5F6E8] border-[#BBE2C4]',
                     iconWrap: 'bg-[#D9F3DF] border-[#A7DCBA] text-[#15803D]',
                     labelColor: 'text-[#1E3B2B]',
                     subTag: `${approvedOrders + completedOrders} Active`,
                     subClass: 'text-[#15803D]',
                   },
                   {
                     id: 'pending' as const,
                     label: 'Pending Orders',
                     value: pendingOrders,
                     icon: Hourglass,
                     cardBg: 'bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border-[#EAD089]',
                     iconWrap: 'bg-[#FCE9B2] border-[#E7C266] text-[#A16207]',
                     labelColor: 'text-[#5C3D06]',
                     subTag: pendingOrders > 0 ? 'Needs Review' : 'All Caught Up',
                     subClass: 'text-[#A16207]',
                   },
                   {
                     id: 'approved' as const,
                     label: 'Approved',
                     value: approvedOrders,
                     icon: CheckCircle2,
                     cardBg: 'bg-gradient-to-br from-[#EEFCF4] to-[#DCF8E7] border-[#9EE2BA]',
                     iconWrap: 'bg-[#C8F4DA] border-[#86DCA9] text-[#15803D]',
                     labelColor: 'text-[#14532D]',
                     subTag: `${approvedShare}% Confirmed`,
                     subClass: 'text-[#15803D]',
                   },
                   {
                     id: 'completed' as const,
                     label: 'Completed',
                     value: completedOrders,
                     icon: Flag,
                     cardBg: 'bg-gradient-to-br from-[#F1F8FF] to-[#E2F0FE] border-[#AED4FA]',
                     iconWrap: 'bg-[#D5E9FE] border-[#98C8F9] text-[#1D4ED8]',
                     labelColor: 'text-[#1E3A8A]',
                     subTag: 'Delivered',
                     subClass: 'text-[#1D4ED8]',
                   },
                   {
                     id: 'rejected' as const,
                     label: 'Rejected',
                     value: rejectedOrders,
                     icon: XCircle,
                     cardBg: 'bg-gradient-to-br from-[#FFF4F5] to-[#FDE4E6] border-[#F6B8BD]',
                     iconWrap: 'bg-[#FAD1D5] border-[#F19FA7] text-[#DC2626]',
                     labelColor: 'text-[#7F1D1D]',
                     subTag: 'Declined',
                     subClass: 'text-[#B91C1C]',
                   },
                   {
                     id: 'revenue' as const,
                     label: 'Revenue',
                     value: `₹${(revenue / 1000).toFixed(1)}K`,
                     icon: Coins,
                     cardBg: 'bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border-[#CEB4FA]',
                     iconWrap: 'bg-[#E5D5FE] border-[#C19CF9] text-[#7E22CE]',
                     labelColor: 'text-[#581C87]',
                     subTag: `₹${(thisMonthRevenue / 1000).toFixed(1)}K Month`,
                     subClass: 'text-[#6B21A8]',
                   },
                 ];

                 // Merge real notifications + fallback recent order updates for notifications panel
                 const notificationItems =
                   localNotifications.length > 0
                     ? localNotifications.slice(0, 4).map((n) => ({
                         id: n.id,
                         title: n.title,
                         subtitle: n.message,
                         time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
                         unread: !n.read,
                         orderId: n.orderId,
                       }))
                     : partnerOrders.slice(0, 4).map((ord) => ({
                         id: `ord-notif-${ord.id}`,
                         title: `New order received from ${ord.customerName || 'Customer'}`,
                         subtitle: `Package: ${ord.packageDetails?.packageName || 'Custom'} • Guests: ${getOrderGuests(ord)} • Date: ${ord.eventDate || 'TBD'}`,
                         time: ord.created_at ? new Date(ord.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
                         unread: normalizeStatus(ord.status) === 'pending',
                         orderId: ord.id,
                       }));

                 return (
                 <div className="space-y-3.5">
                    {/* Decorative Overview Header Banner */}
                    <div className="relative pb-2 pt-0.5 flex items-center justify-between gap-4 overflow-hidden">
                      <svg
                        viewBox="0 0 900 110"
                        fill="none"
                        preserveAspectRatio="none"
                        className="pointer-events-none select-none hidden md:block absolute inset-y-0 right-0 w-[68%] h-full opacity-90"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="partnerHeaderWave" x1="0" y1="55" x2="900" y2="55" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FAF3E3" stopOpacity="0" />
                            <stop offset="50%" stopColor="#F5E6C2" stopOpacity="0.52" />
                            <stop offset="100%" stopColor="#EED7A2" stopOpacity="0.72" />
                          </linearGradient>
                        </defs>
                        <path d="M0 110 C240 105 420 45 900 18 L900 110 Z" fill="url(#partnerHeaderWave)" />
                      </svg>

                      <div className="relative z-10 flex items-stretch gap-3.5">
                        <div className="w-[3px] rounded-full bg-gradient-to-b from-[#E8BA42] via-[#D4971D] to-[#B77A12] shrink-0" />
                        <div>
                          <h1 className="text-2xl xl:text-[28px] font-display font-bold text-[#0F3D2E] tracking-tight leading-tight">
                            Dashboard Overview
                          </h1>
                          <p className="text-[#5C5240] font-medium mt-0.5 text-[12.5px]">
                            Track your events, manage your business and grow with PlanMyChoice.
                          </p>
                        </div>
                      </div>

                      {/* Subtle Antique-Gold Serving Cloche & Leaf Illustration */}
                      <svg
                        viewBox="0 0 260 84"
                        fill="none"
                        className="pointer-events-none select-none hidden md:block relative z-10 w-[210px] xl:w-[240px] h-[72px] shrink-0"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient id="partnerClocheGold" x1="115" y1="18" x2="210" y2="70" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FCE9A6" />
                            <stop offset="55%" stopColor="#DFA833" />
                            <stop offset="100%" stopColor="#B87D16" />
                          </linearGradient>
                        </defs>
                        <path d="M12 72 C84 78 148 64 252 68" stroke="#D9A323" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
                        <circle cx="164" cy="18" r="4.5" fill="url(#partnerClocheGold)" />
                        <path d="M158 23 H170" stroke="#C68917" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M120 62 C120 37 140 23 164 23 C188 23 208 37 208 62 Z" fill="url(#partnerClocheGold)" fillOpacity="0.92" />
                        <path d="M132 55 C135 39 147 30 161 28" stroke="#FFF9E6" strokeOpacity="0.72" strokeWidth="2.4" strokeLinecap="round" />
                        <rect x="112" y="62" width="104" height="4.5" rx="2.25" fill="#B87D16" />
                        {/* Decorative leaves beside platter */}
                        <path d="M220 56 C224 44 236 38 242 44 C244 50 232 58 220 56 Z" fill="#E6BC52" fillOpacity="0.7" />
                        <path d="M222 61 C228 56 242 56 246 62 C243 67 230 67 222 61 Z" fill="#D4971D" fillOpacity="0.65" />
                      </svg>
                    </div>
                    
                    {/* 6 Colorful Compact KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
                      {kpiCards.map((card) => {
                        const CardIcon = card.icon;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('orders');
                              setOrderListFilter(card.id);
                            }}
                            className={cn(
                              "rounded-2xl px-3.5 py-2.5 border shadow-[0_3px_12px_rgba(92,70,22,0.05)] hover:shadow-[0_6px_18px_rgba(92,70,22,0.1)] hover:-translate-y-0.5 transition-all duration-150 flex items-center gap-3 text-left cursor-pointer",
                              card.cardBg
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-2xs", card.iconWrap)}>
                              <CardIcon size={18} strokeWidth={2.1} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-[11px] font-bold leading-tight truncate", card.labelColor)}>
                                {card.label}
                              </p>
                              <div className="flex items-baseline justify-between gap-1 mt-1">
                                <span className="text-[22px] font-display font-bold text-[#0F241C] leading-none tabular-nums">
                                  {card.value}
                                </span>
                                <span className={cn("text-[10px] font-bold whitespace-nowrap tabular-nums", card.subClass)}>
                                  {card.subTag}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Side-by-Side Row 1: Upcoming Scheduled Events (Left) + Event Calendar (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                        {/* Upcoming Scheduled Events */}
                        <div className="lg:col-span-7 xl:col-span-8 bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden flex flex-col">
                            {/* Dark Emerald Header */}
                            <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CalendarDays size={16} className="text-[#F5C642] shrink-0" />
                                    <h3 className="font-display font-bold text-[15px] text-[#FDF8EC] truncate">Upcoming Scheduled Events</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('orders'); setOrderListFilter('approved'); }}
                                    className="text-xs font-bold text-[#F5C642] hover:text-[#FCE9A6] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                >
                                    <span>View All Events</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>

                            <div className="p-3.5 flex-1 flex flex-col gap-3">
                                {/* Compact Filter Pills Row */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="inline-flex items-center bg-[#FAF0D8] border border-[#E6CA82] rounded-full p-0.5">
                                        {[
                                            { id: '7', label: '7 Days' },
                                            { id: '15', label: '15 Days' },
                                            { id: '30', label: '30 Days' },
                                            { id: 'custom', label: 'Custom Range' }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setEventFilter(tab.id as any)}
                                                className={cn(
                                                    "px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                                                    eventFilter === tab.id
                                                        ? "bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#FFFDF8] shadow-2xs"
                                                        : "text-[#493E2B] hover:text-[#0F241C]"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {eventFilter === 'custom' && (
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#493E2B]">
                                            <span>From</span>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="bg-white border border-[#DFC689] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D9A323]"
                                            />
                                            <span>To</span>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="bg-white border border-[#DFC689] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D9A323]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[260px] pr-0.5">
                                    {upcomingEvents.map((ord) => (
                                        <div
                                            key={'upcoming-event-' + ord.id}
                                            className="bg-[#FFFDF9] border border-[#EAE0C8] hover:border-[#D9A323] rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_8px_rgba(92,70,22,0.03)]"
                                        >
                                            {/* Left: Date Badge + Customer Name + Status */}
                                            <div className="flex items-center gap-3 min-w-[165px]">
                                                <div className="w-[54px] h-[54px] rounded-xl bg-gradient-to-b from-[#044530] to-[#01291C] border border-[#D9A323]/60 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#F5C642]">
                                                        {new Date(ord.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                                                    </span>
                                                    <span className="text-lg font-display font-extrabold leading-none tabular-nums mt-0.5">
                                                        {new Date(ord.eventDate).getDate()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#0F241C] text-sm truncate" title={ord.customerName}>
                                                        {ord.customerName}
                                                    </p>
                                                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border mt-1", getStatusColor(ord.status))}>
                                                        <CheckCircle2 size={10} />
                                                        <span>{ord.status}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Middle: Specs List */}
                                            <div className="flex-1 min-w-0 sm:border-l sm:border-[#EFE3C4] sm:pl-3.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px]">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <User size={12} className="text-[#C48E22] shrink-0" />
                                                    <span className="text-[#6B5F4B]">Guests:</span>
                                                    <span className="font-bold text-[#0F241C] tabular-nums">{getOrderGuests(ord)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Layers size={12} className="text-[#C48E22] shrink-0" />
                                                    <span className="text-[#6B5F4B]">Package:</span>
                                                    <span className="font-bold text-[#0F241C] truncate" title={ord.packageDetails?.packageName}>
                                                        {ord.packageDetails?.packageName || 'Custom'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Phone size={12} className="text-[#C48E22] shrink-0" />
                                                    <span className="text-[#6B5F4B]">Phone:</span>
                                                    <span className="font-semibold text-[#0F241C] tabular-nums truncate">
                                                        {ord.phone || ord.customerPhone || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <MapPin size={12} className="text-[#C48E22] shrink-0" />
                                                    <span className="text-[#6B5F4B] shrink-0">Venue:</span>
                                                    <span className="font-semibold text-[#0F241C] truncate" title={ord.venue || ord.address || ord.venueAddress}>
                                                        {ord.venue || ord.address || ord.venueAddress || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: View Details Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenOrderDetails(ord)}
                                                className="px-3.5 py-2 rounded-full bg-[#FAF0D4] hover:bg-[#F3DFAB] border border-[#DFB95B] text-[#0F241C] text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                                <span>View Details</span>
                                                <ArrowRight size={13} className="text-[#9E7018]" />
                                            </button>
                                        </div>
                                    ))}

                                    {upcomingEvents.length === 0 && (
                                        <div className="py-8 text-center text-[#6B5F4B] text-xs bg-[#FCF8EE] rounded-xl border border-dashed border-[#DFC689]">
                                            <CalendarDays size={24} className="mx-auto mb-2 text-[#B8841E]" />
                                            <p className="font-bold text-[#0F241C]">No scheduled events</p>
                                            <p className="text-[11px] text-[#6B5F4B] mt-0.5">No upcoming approved events match this timeframe.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Event Calendar Card */}
                        <div className="lg:col-span-5 xl:col-span-4 bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden flex flex-col">
                            {/* Dark Emerald Header */}
                            <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={16} className="text-[#F5C642]" />
                                    <h3 className="font-display font-bold text-[15px] text-[#FDF8EC]">Event Calendar</h3>
                                </div>
                                {selectedCalendarDayKey && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCalendarDayKey(null)}
                                    className="text-[10.5px] font-bold text-[#F5C642] hover:underline cursor-pointer"
                                  >
                                    Clear Day
                                  </button>
                                )}
                            </div>

                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                                {/* Month Switcher Pill */}
                                <div className="flex items-center justify-center">
                                    <div className="inline-flex items-center gap-4 bg-[#FFFDF9] border border-[#E6CA82] rounded-full px-3.5 py-1 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setCalendarMonthDate(new Date(calYear, calMonth - 1, 1))}
                                            aria-label="Previous month"
                                            className="text-[#493E2B] hover:text-[#023A28] transition-colors cursor-pointer"
                                        >
                                            <ChevronLeft size={15} />
                                        </button>
                                        <span className="font-display font-bold text-xs text-[#0F241C] min-w-[74px] text-center">
                                            {monthLabel}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCalendarMonthDate(new Date(calYear, calMonth + 1, 1))}
                                            aria-label="Next month"
                                            className="text-[#493E2B] hover:text-[#023A28] transition-colors cursor-pointer"
                                        >
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Weekday Headers + Day Cells */}
                                <div className="bg-[#FCF8EE] rounded-xl border border-[#EFE3C4] p-2.5">
                                    <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-bold text-[#7D6E52] mb-1.5">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
                                            <div key={wd} className="py-0.5">{wd}</div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center text-xs tabular-nums">
                                        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                                            <div key={`empty-${idx}`} className="h-7" />
                                        ))}
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                                            const dayKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                            const dayOrders = eventsByDayKey[dayKey] || [];
                                            const hasEvents = dayOrders.length > 0;
                                            const isHighlighted = highlightedDayKey === dayKey;
                                            const isToday = todayKey === dayKey;

                                            return (
                                                <button
                                                    key={dayKey}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCalendarDayKey(dayKey);
                                                        if (dayOrders.length === 1) {
                                                            handleOpenOrderDetails(dayOrders[0]);
                                                        } else if (dayOrders.length > 1) {
                                                            setActiveTab('orders');
                                                        }
                                                    }}
                                                    title={
                                                      hasEvents
                                                        ? `${dayOrders.length} event(s): ${dayOrders.map(o => o.customerName).join(', ')}`
                                                        : dayKey
                                                    }
                                                    className={cn(
                                                        "h-7 rounded-lg flex flex-col items-center justify-center relative font-semibold transition-all cursor-pointer",
                                                        isHighlighted
                                                            ? "bg-gradient-to-b from-[#044732] to-[#01291C] text-[#FFFDF8] font-bold shadow-xs"
                                                            : isToday
                                                              ? "bg-[#FAF0D4] text-[#0F241C] border border-[#DFC482] font-bold"
                                                              : hasEvents
                                                                ? "text-[#0F241C] hover:bg-[#FAF0D4] font-bold"
                                                                : "text-[#3D3526] hover:bg-[#F5EBD0]/70"
                                                    )}
                                                >
                                                    <span className="leading-none">{dayNum}</span>
                                                    {hasEvents && (
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full mt-0.5",
                                                            isHighlighted ? "bg-[#F5C642]" : "bg-[#16A34A]"
                                                        )} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10.5px] text-[#6B5F4B] px-1">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
                                        Scheduled Event
                                    </span>
                                    <span className="font-semibold text-[#0F241C] tabular-nums">
                                        {Object.keys(eventsByDayKey).filter((k) => k.startsWith(monthPrefix)).length} event day(s)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side-by-Side Row 2: Recent Notifications (Left) + Recent Orders (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
                        {/* Recent Notifications */}
                        <div className="lg:col-span-6 bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-[#F5C642]" />
                                    <h3 className="font-display font-bold text-[15px] text-[#FDF8EC]">Recent Notifications</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('notifications')}
                                    className="text-xs font-bold text-[#F5C642] hover:text-[#FCE9A6] flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>View All</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>

                            <div className="divide-y divide-[#EFE4C8] flex-1">
                               {notificationItems.map((n) => (
                                   <div key={n.id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-[#FCF7E8]/80 transition-colors">
                                       <div className="flex items-start gap-3 min-w-0">
                                           <div className="w-9 h-9 rounded-full bg-[#E8F2FE] border border-[#BED9FA] text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5">
                                               <Bell size={15} />
                                           </div>
                                           <div className="min-w-0">
                                               <p className="font-bold text-[#0F241C] text-xs leading-snug truncate">{n.title}</p>
                                               <p className="text-[11px] text-[#494032] mt-0.5 line-clamp-1">{n.subtitle}</p>
                                               <p className="text-[10px] text-[#7D6E52] mt-0.5 tabular-nums">{n.time}</p>
                                           </div>
                                       </div>
                                       {n.unread && (
                                           <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0 mt-1.5" title="Unread" />
                                       )}
                                   </div>
                               ))}
                               {notificationItems.length === 0 && (
                                   <div className="p-8 text-center text-xs text-[#6B5F4B]">No recent notifications.</div>
                               )}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="lg:col-span-6 bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] border-b-2 border-[#D9A323] px-4 py-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={16} className="text-[#F5C642]" />
                                    <h3 className="font-display font-bold text-[15px] text-[#FDF8EC]">Recent Orders</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('orders'); setOrderListFilter('all'); }}
                                    className="text-xs font-bold text-[#F5C642] hover:text-[#FCE9A6] flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>View All</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                                    <thead className="bg-[#FAF2DE] border-b border-[#EFE3C4] text-[11px] text-[#4A3B22] font-bold">
                                        <tr>
                                            <th className="px-3.5 py-2">Order ID</th>
                                            <th className="px-3 py-2">Event Date</th>
                                            <th className="px-3 py-2">Package</th>
                                            <th className="px-3 py-2">Guests</th>
                                            <th className="px-3 py-2">Amount</th>
                                            <th className="px-3 py-2">Status</th>
                                            <th className="px-3 py-2 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EFE4C8]">
                                        {partnerOrders.slice(0, 4).map((ord) => (
                                            <tr key={'recent-ord-' + ord.id} className="bg-[#FFFDF9] hover:bg-[#FCF7E8]/80 transition-colors">
                                                <td className="px-3.5 py-2.5 font-mono font-bold text-[#0F241C] text-[11px]">
                                                    #{ord.id}
                                                </td>
                                                <td className="px-3 py-2.5 text-[#30281E] font-medium tabular-nums">
                                                    {ord.eventDate || 'TBD'}
                                                </td>
                                                <td className="px-3 py-2.5 text-[#30281E] font-medium max-w-[110px] truncate" title={ord.packageDetails?.packageName}>
                                                    {ord.packageDetails?.packageName || 'Custom'}
                                                </td>
                                                <td className="px-3 py-2.5 text-[#0F241C] font-semibold tabular-nums">
                                                    {getOrderGuests(ord)}
                                                </td>
                                                <td className="px-3 py-2.5 font-bold text-[#0F241C] tabular-nums">
                                                    ₹{getOrderTotalAmount(ord).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border", getStatusColor(ord.status))}>
                                                        {ord.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenOrderDetails(ord)}
                                                        title="View order details"
                                                        className="w-7 h-7 rounded-full bg-[#FAF0D4] hover:bg-[#F3DFAB] border border-[#E6CA82] text-[#78530A] inline-flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {partnerOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-[#6B5F4B]">
                                                    No recent orders found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                 </div>
                 );
               })()}

               {activeTab === 'orders' && (() => {
                  const totalFiltered = filteredOrderList.length;
                  const totalOrderPages = Math.max(1, Math.ceil(totalFiltered / ordersPerPage));
                  const safeOrdersPage = Math.min(ordersPage, totalOrderPages);
                  const startIdx = (safeOrdersPage - 1) * ordersPerPage;
                  const paginatedOrders = filteredOrderList.slice(startIdx, startIdx + ordersPerPage);
                  const showingStart = totalFiltered === 0 ? 0 : startIdx + 1;
                  const showingEnd = Math.min(startIdx + ordersPerPage, totalFiltered);
                  const hasActiveOrderFilters =
                    orderListFilter !== 'all' ||
                    orderSearchQuery.trim() !== '' ||
                    orderDateFilter !== '' ||
                    orderSortBy !== 'newest';

                  const orderKpiCards = [
                    {
                      id: 'all' as const,
                      label: 'All Orders',
                      value: totalOrders,
                      icon: Package,
                      cardBg: 'bg-gradient-to-br from-[#F2FBF3] to-[#E5F6E8] border-[#BBE2C4]',
                      iconWrap: 'bg-[#D9F3DF] border-[#A7DCBA] text-[#15803D]',
                      labelColor: 'text-[#1E3B2B]',
                      subText: 'Total Bookings',
                      subColor: 'text-[#15803D]',
                    },
                    {
                      id: 'pending' as const,
                      label: 'Pending',
                      value: pendingOrders,
                      icon: Hourglass,
                      cardBg: 'bg-gradient-to-br from-[#FFFDF3] to-[#FEF4D6] border-[#EAD089]',
                      iconWrap: 'bg-[#FCE9B2] border-[#E7C266] text-[#A16207]',
                      labelColor: 'text-[#5C3D06]',
                      subText: pendingOrders > 0 ? 'Needs Review' : 'All Caught Up',
                      subColor: 'text-[#A16207]',
                    },
                    {
                      id: 'approved' as const,
                      label: 'Approved',
                      value: approvedOrders,
                      icon: CheckCircle2,
                      cardBg: 'bg-gradient-to-br from-[#EEFCF4] to-[#DCF8E7] border-[#9EE2BA]',
                      iconWrap: 'bg-[#C8F4DA] border-[#86DCA9] text-[#15803D]',
                      labelColor: 'text-[#14532D]',
                      subText: 'Confirmed',
                      subColor: 'text-[#15803D]',
                    },
                    {
                      id: 'completed' as const,
                      label: 'Completed',
                      value: completedOrders,
                      icon: Flag,
                      cardBg: 'bg-gradient-to-br from-[#F1F8FF] to-[#E2F0FE] border-[#AED4FA]',
                      iconWrap: 'bg-[#D5E9FE] border-[#98C8F9] text-[#1D4ED8]',
                      labelColor: 'text-[#1E3A8A]',
                      subText: 'Delivered',
                      subColor: 'text-[#1D4ED8]',
                    },
                    {
                      id: 'revenue' as const,
                      label: 'Revenue Base',
                      value: `₹${(revenue / 1000).toFixed(1)}K`,
                      icon: Coins,
                      cardBg: 'bg-gradient-to-br from-[#F8F3FF] to-[#EDE2FE] border-[#CEB4FA]',
                      iconWrap: 'bg-[#E5D5FE] border-[#C19CF9] text-[#7E22CE]',
                      labelColor: 'text-[#581C87]',
                      subText: `${approvedOrders + completedOrders} Paid/Active`,
                      subColor: 'text-[#6B21A8]',
                    },
                  ];

                  return (
                  <div className="space-y-3.5">
                      {/* Decorative Heading Banner */}
                      <div className="relative pb-1.5 pt-0.5 flex items-center justify-between gap-4 overflow-hidden">
                        <svg
                          viewBox="0 0 900 110"
                          fill="none"
                          preserveAspectRatio="none"
                          className="pointer-events-none select-none hidden md:block absolute inset-y-0 right-0 w-[68%] h-full opacity-90"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="partnerOrdersHeaderWave" x1="0" y1="55" x2="900" y2="55" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#FAF3E3" stopOpacity="0" />
                              <stop offset="50%" stopColor="#F5E6C2" stopOpacity="0.52" />
                              <stop offset="100%" stopColor="#EED7A2" stopOpacity="0.72" />
                            </linearGradient>
                          </defs>
                          <path d="M0 110 C240 105 420 45 900 18 L900 110 Z" fill="url(#partnerOrdersHeaderWave)" />
                        </svg>

                        <div className="relative z-10 flex items-stretch gap-3.5">
                          <div className="w-[3px] rounded-full bg-gradient-to-b from-[#E8BA42] via-[#D4971D] to-[#B77A12] shrink-0" />
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F3DFAB] border border-[#E2C274] text-[#6B4A10] text-[10px] font-bold tracking-[0.09em] uppercase mb-1">
                              Caterer Portal
                            </span>
                            <h1 className="text-2xl xl:text-[28px] font-display font-bold text-[#0F3D2E] tracking-tight leading-tight">
                              Order Management
                            </h1>
                            <p className="text-[#5C5240] font-medium mt-0.5 text-[12.5px]">
                              Filter, review, and confirm customer booking requests.
                            </p>
                          </div>
                        </div>

                        <svg
                          viewBox="0 0 260 84"
                          fill="none"
                          className="pointer-events-none select-none hidden md:block relative z-10 w-[200px] xl:w-[230px] h-[70px] shrink-0"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="ordersClocheGold" x1="115" y1="18" x2="210" y2="70" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#FCE9A6" />
                              <stop offset="55%" stopColor="#DFA833" />
                              <stop offset="100%" stopColor="#B87D16" />
                            </linearGradient>
                          </defs>
                          <path d="M12 72 C84 78 148 64 252 68" stroke="#D9A323" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
                          <circle cx="164" cy="18" r="4.5" fill="url(#ordersClocheGold)" />
                          <path d="M158 23 H170" stroke="#C68917" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M120 62 C120 37 140 23 164 23 C188 23 208 37 208 62 Z" fill="url(#ordersClocheGold)" fillOpacity="0.92" />
                          <path d="M132 55 C135 39 147 30 161 28" stroke="#FFF9E6" strokeOpacity="0.72" strokeWidth="2.4" strokeLinecap="round" />
                          <rect x="112" y="62" width="104" height="4.5" rx="2.25" fill="#B87D16" />
                          <path d="M220 56 C224 44 236 38 242 44 C244 50 232 58 220 56 Z" fill="#E6BC52" fillOpacity="0.7" />
                          <path d="M222 61 C228 56 242 56 246 62 C243 67 230 67 222 61 Z" fill="#D4971D" fillOpacity="0.65" />
                        </svg>
                      </div>

                      {/* 5 Compact Gradient KPI Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {orderKpiCards.map((card) => {
                          const CardIcon = card.icon;
                          const isSelected = orderListFilter === card.id;
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => setOrderListFilter(card.id)}
                              className={cn(
                                "rounded-2xl px-3.5 py-2.5 border transition-all duration-150 flex items-center gap-3 text-left cursor-pointer",
                                card.cardBg,
                                isSelected
                                  ? "ring-2 ring-[#D9A323] shadow-[0_6px_18px_rgba(92,70,22,0.12)] -translate-y-0.5"
                                  : "shadow-[0_3px_12px_rgba(92,70,22,0.05)] hover:shadow-[0_6px_18px_rgba(92,70,22,0.09)] hover:-translate-y-0.5"
                              )}
                            >
                              <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-2xs", card.iconWrap)}>
                                <CardIcon size={18} strokeWidth={2.1} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={cn("text-[11px] font-bold leading-tight truncate", card.labelColor)}>
                                  {card.label}
                                </p>
                                <div className="flex items-baseline justify-between gap-1 mt-1">
                                  <span className="text-[21px] font-display font-bold text-[#0F241C] leading-none tabular-nums">
                                    {card.value}
                                  </span>
                                  <span className={cn("text-[10px] font-bold whitespace-nowrap tabular-nums", card.subColor)}>
                                    {card.subText}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Responsive Search & Filter Controls Row */}
                      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] p-2.5 shadow-[0_3px_14px_rgba(92,70,22,0.05)] flex flex-wrap lg:flex-nowrap items-center gap-2.5">
                        {/* Search Box */}
                        <div className="relative flex-1 min-w-[220px]">
                          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C48E22]" />
                          <input
                            type="text"
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            placeholder="Search Order ID, customer, phone, package, or venue..."
                            className="w-full h-9.5 pl-9 pr-8 bg-[#FCF8EE] border border-[#E6CA82] rounded-xl text-xs font-medium text-[#0F241C] placeholder:text-[#8A7B61] focus:bg-white focus:border-[#D9A323] focus:outline-none transition-colors"
                          />
                          {orderSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setOrderSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7D6E52] hover:text-[#0F241C] cursor-pointer"
                              aria-label="Clear search"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {/* Status Segmented Tabs / Filter */}
                        <div className="flex items-center gap-1 bg-[#FAF0D8] border border-[#E6CA82] p-0.5 rounded-xl overflow-x-auto max-w-full">
                          {[
                            { id: 'all', label: 'All Orders' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'approved', label: 'Approved' },
                            { id: 'completed', label: 'Completed' },
                            { id: 'revenue', label: 'Revenue Base' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setOrderListFilter(f.id as any)}
                              className={cn(
                                "px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer",
                                orderListFilter === f.id
                                  ? "bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#FFFDF8] shadow-2xs"
                                  : "text-[#4A3B22] hover:text-[#0F241C]"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {/* Date Filter */}
                        <input
                          type="date"
                          value={orderDateFilter}
                          onChange={(e) => setOrderDateFilter(e.target.value)}
                          title="Filter by booking or event date"
                          className="h-9.5 px-3 bg-[#FCF8EE] border border-[#E6CA82] rounded-xl text-xs font-semibold text-[#0F241C] focus:bg-white focus:border-[#D9A323] focus:outline-none shrink-0"
                        />

                        {/* Sort Selector */}
                        <select
                          value={orderSortBy}
                          onChange={(e) => setOrderSortBy(e.target.value as any)}
                          aria-label="Sort orders"
                          className="h-9.5 px-3 bg-[#FCF8EE] border border-[#E6CA82] rounded-xl text-xs font-bold text-[#0F241C] focus:bg-white focus:border-[#D9A323] focus:outline-none cursor-pointer shrink-0"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="event_asc">Event Date (Soonest)</option>
                          <option value="amount_desc">Amount (High → Low)</option>
                        </select>

                        {hasActiveOrderFilters && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderListFilter('all');
                              setOrderSearchQuery('');
                              setOrderDateFilter('');
                              setOrderSortBy('newest');
                            }}
                            className="h-9.5 px-3 rounded-xl bg-[#FAF0D4] hover:bg-[#F3DFAB] border border-[#DFB95B] text-[#6B4A10] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <RotateCcw size={13} />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>

                      {/* Main Orders Table Card */}
                      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4C987] shadow-[0_6px_22px_rgba(92,70,22,0.06)] overflow-hidden flex flex-col">
                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                  <thead>
                                      <tr className="bg-gradient-to-r from-[#023122] via-[#044732] to-[#022E1F] text-[#FDF8EC] border-b-2 border-[#D9A323] text-[11.5px] font-bold">
                                          <th className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <ClipboardList size={13} className="text-[#F5C642]" />
                                              <span>Order ID</span>
                                            </span>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <button
                                              type="button"
                                              onClick={() => setOrderSortBy(orderSortBy === 'newest' ? 'oldest' : 'newest')}
                                              className="inline-flex items-center gap-1.5 hover:text-[#F5C642] transition-colors cursor-pointer"
                                            >
                                              <CalendarDays size={13} className="text-[#F5C642]" />
                                              <span>Date & Time</span>
                                              <ChevronsUpDown size={11} className="text-[#F5C642]/75" />
                                            </button>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <User size={13} className="text-[#F5C642]" />
                                              <span>Customer</span>
                                            </span>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <Phone size={13} className="text-[#F5C642]" />
                                              <span>Phone</span>
                                            </span>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <Layers size={13} className="text-[#F5C642]" />
                                              <span>Package</span>
                                            </span>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <Users size={13} className="text-[#F5C642]" />
                                              <span>Guests</span>
                                            </span>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <button
                                              type="button"
                                              onClick={() => setOrderSortBy(orderSortBy === 'amount_desc' ? 'newest' : 'amount_desc')}
                                              className="inline-flex items-center gap-1.5 hover:text-[#F5C642] transition-colors cursor-pointer"
                                            >
                                              <Coins size={13} className="text-[#F5C642]" />
                                              <span>Amount</span>
                                              <ChevronsUpDown size={11} className="text-[#F5C642]/75" />
                                            </button>
                                          </th>
                                          <th className="px-3.5 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <Activity size={13} className="text-[#F5C642]" />
                                              <span>Status</span>
                                            </span>
                                          </th>
                                          <th className="px-4 py-3 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                              <Settings size={13} className="text-[#F5C642]" />
                                              <span>Actions</span>
                                            </span>
                                          </th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#EFE4C8] text-xs">
                                      {paginatedOrders.map((ord, idx) => (
                                          <tr
                                            key={ord.id}
                                            className={cn(
                                              "transition-colors group",
                                              idx % 2 === 0 ? "bg-[#FFFDF9]" : "bg-[#FCF8EE]",
                                              "hover:bg-[#FAF1DA]/80"
                                            )}
                                          >
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF0D4] border border-[#E4C987] font-mono font-bold text-[11px] text-[#0F3D2E] shadow-2xs">
                                                  #{ord.id}
                                                </span>
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap tabular-nums">
                                                <div className="font-semibold text-[#0F241C]">
                                                  {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </div>
                                                <div className="text-[10.5px] text-[#7D6E52] mt-0.5">
                                                  {ord.created_at ? new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                  {ord.eventDate ? ` · Event: ${ord.eventDate}` : ''}
                                                </div>
                                              </td>
                                              <td className="px-3.5 py-3 max-w-[240px]">
                                                <div className="font-bold text-[#0F241C] text-[12.5px] leading-snug truncate">
                                                  {ord.customerName || 'Guest Customer'}
                                                </div>
                                                {(ord.venue || ord.address || ord.venueAddress) && (
                                                  <div
                                                    className="flex items-start gap-1 text-[11px] text-[#6B5F4B] mt-0.5 line-clamp-1"
                                                    title={ord.venue || ord.address || ord.venueAddress}
                                                  >
                                                    <MapPin size={11} className="text-[#C48E22] shrink-0 mt-0.5" />
                                                    <span className="truncate">{ord.venue || ord.address || ord.venueAddress}</span>
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap text-[#30281E] font-medium tabular-nums">
                                                {ord.customerPhone || ord.phone || 'N/A'}
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap">
                                                <span className="font-semibold text-[#0F241C]">
                                                  {ord.packageDetails?.packageName || 'Custom'}
                                                </span>
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap font-bold text-[#0F241C] tabular-nums">
                                                {getOrderGuests(ord)}
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap font-display font-bold text-[13px] text-[#0F3D2E] tabular-nums">
                                                ₹{getOrderTotalAmount(ord).toLocaleString('en-IN')}
                                              </td>
                                              <td className="px-3.5 py-3 whitespace-nowrap">
                                                <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(ord.status))}>
                                                  {ord.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => handleOpenOrderDetails(ord)}
                                                  className="px-3.5 py-1.5 rounded-full bg-[#FAF0D4] hover:bg-[#F3DFAB] border border-[#DFB95B] text-[#0F241C] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                                >
                                                  <Eye size={13} className="text-[#9E7018]" />
                                                  <span>View</span>
                                                </button>
                                              </td>
                                          </tr>
                                      ))}
                                      {paginatedOrders.length === 0 && (
                                          <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center">
                                              <div className="max-w-sm mx-auto">
                                                <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#E4C987] text-[#B8841E] flex items-center justify-center mx-auto mb-3">
                                                  <ShoppingBag size={22} />
                                                </div>
                                                <p className="font-display font-bold text-sm text-[#0F241C]">
                                                  No {orderListFilter !== 'all' ? orderListFilter : ''} orders found
                                                </p>
                                                <p className="text-xs text-[#6B5F4B] mt-1">
                                                  Try adjusting your search query, status filter, or selected date.
                                                </p>
                                                {hasActiveOrderFilters && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setOrderListFilter('all');
                                                      setOrderSearchQuery('');
                                                      setOrderDateFilter('');
                                                      setOrderSortBy('newest');
                                                    }}
                                                    className="mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#023A28] to-[#044C35] text-[#FFFDF8] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                                  >
                                                    <RotateCcw size={12} />
                                                    <span>Reset Filters</span>
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>

                          {/* Premium Pagination Footer */}
                          <div className="px-4 py-3 border-t border-[#EFE3C4] bg-gradient-to-r from-[#FFFDF7] via-[#FCF6E7] to-[#FFFDF7] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-3 text-[#4A3B22]">
                              <span className="inline-flex items-center gap-2 font-medium tabular-nums">
                                <ClipboardList size={14} className="text-[#C48E22]" />
                                <span>
                                  Showing <strong className="text-[#0F241C]">{showingStart}</strong> to <strong className="text-[#0F241C]">{showingEnd}</strong> of <strong className="text-[#0F241C]">{totalFiltered}</strong> orders
                                </span>
                              </span>
                              <span className="text-[#D9C59A]" aria-hidden="true">|</span>
                              <label className="inline-flex items-center gap-2 font-medium">
                                <span>Rows per page:</span>
                                <select
                                  value={ordersPerPage}
                                  onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                                  className="h-8 px-2.5 bg-white border border-[#DFC689] rounded-lg font-bold text-[#0F241C] focus:border-[#D9A323] focus:outline-none cursor-pointer"
                                >
                                  <option value={10}>10</option>
                                  <option value={15}>15</option>
                                  <option value={25}>25</option>
                                </select>
                              </label>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={safeOrdersPage <= 1}
                                onClick={() => setOrdersPage(1)}
                                aria-label="First page"
                                className="w-8 h-8 rounded-lg border border-[#E4C987] bg-white hover:bg-[#FAF0D4] text-[#4A3B22] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronsLeft size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={safeOrdersPage <= 1}
                                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                                aria-label="Previous page"
                                className="w-8 h-8 rounded-lg border border-[#E4C987] bg-white hover:bg-[#FAF0D4] text-[#4A3B22] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronLeft size={14} />
                              </button>

                              {Array.from({ length: totalOrderPages }, (_, idx) => idx + 1)
                                .filter((p) => p === 1 || p === totalOrderPages || Math.abs(p - safeOrdersPage) <= 1)
                                .map((p, idx, arr) => (
                                  <React.Fragment key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                      <span className="px-1 text-[#8A7B61]">…</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setOrdersPage(p)}
                                      className={cn(
                                        "w-8 h-8 rounded-lg text-xs font-bold tabular-nums border transition-all cursor-pointer",
                                        safeOrdersPage === p
                                          ? "bg-gradient-to-b from-[#044732] to-[#01291C] text-[#FFFDF8] border-[#023A28] shadow-xs"
                                          : "bg-white hover:bg-[#FAF0D4] text-[#4A3B22] border-[#E4C987]"
                                      )}
                                    >
                                      {p}
                                    </button>
                                  </React.Fragment>
                                ))}

                              <button
                                type="button"
                                disabled={safeOrdersPage >= totalOrderPages}
                                onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                                aria-label="Next page"
                                className="w-8 h-8 rounded-lg border border-[#E4C987] bg-white hover:bg-[#FAF0D4] text-[#4A3B22] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronRight size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={safeOrdersPage >= totalOrderPages}
                                onClick={() => setOrdersPage(totalOrderPages)}
                                aria-label="Last page"
                                className="w-8 h-8 rounded-lg border border-[#E4C987] bg-white hover:bg-[#FAF0D4] text-[#4A3B22] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <ChevronsRight size={14} />
                              </button>
                            </div>
                          </div>
                      </div>
                  </div>
                  );
               })()}

               {activeTab === 'payments' && (
                  <div className="bg-[#FFFDF8] rounded-3xl border border-[#DFC78A] shadow-[0_10px_28px_rgba(92,70,22,0.08)] overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                      <div className="px-6 py-5 border-b border-[#DFC78A]/60 flex justify-between items-center bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01291D]">
                          <h2 className="text-xl font-display font-bold text-[#FFFDF8] flex items-center gap-2">
                            <CreditCard size={20} className="text-[#F5C642]" /> Payment History
                          </h2>
                      </div>
                      
                      <div className="overflow-x-auto flex-1">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-[#FAF3E2] text-[#494032] font-bold sticky top-0 border-b border-[#DFC78A] z-10 text-xs uppercase tracking-wider">
                                  <tr>
                                      <th className="px-6 py-4">Order ID</th>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Customer</th>
                                      <th className="px-6 py-4">Gross Amount</th>
                                      <th className="px-6 py-4">Platform Fee</th>
                                      <th className="px-6 py-4 text-[#065239]">Net Amount</th>
                                      <th className="px-6 py-4">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EFE3C4]">
                                  {partnerOrders.filter(o => ['Approved', 'Completed'].includes(o.status)).map((ord) => {
                                      const gross = (ord.pricePerPlate || 0) * (ord.guests || 0);
                                      const netAmount = gross * 0.9;
                                      return (
                                      <tr key={'pay-'+ord.id} className="hover:bg-[#FAF3E2]/45 transition-colors">
                                          <td className="px-6 py-4 font-mono font-medium text-[#0F241C]">{ord.id}</td>
                                          <td className="px-6 py-4 text-[#6B5F4B] tabular-nums">{new Date(ord.created_at).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 font-bold text-[#0F241C]">{ord.customerName}</td>
                                          <td className="px-6 py-4 font-semibold text-[#0F241C] tabular-nums">₹{gross.toLocaleString()}</td>
                                          <td className="px-6 py-4 text-rose-600 font-semibold tabular-nums">-₹{((gross * 0.1) + (ord.platformFee || 0)).toLocaleString()}</td>
                                          <td className="px-6 py-4 font-bold text-[#065239] bg-[#ECF8F0]/55 tabular-nums">₹{netAmount.toLocaleString()}</td>
                                          <td className="px-6 py-4">
                                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#DCF8E6] text-[#116E39] border border-[#9EE2BA]">
                                                  Settled
                                              </span>
                                          </td>
                                      </tr>
                                      )
                                  })}
                                  {partnerOrders.filter(o => ['Approved', 'Completed'].includes(o.status)).length === 0 && (
                                      <tr><td colSpan={7} className="px-6 py-12 text-center text-[#6B5F4B]">No payment history found.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
               )}

               {activeTab === 'packages' && (
                  <div className="space-y-6">
                      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#FFFDF8] p-6 rounded-3xl border border-[#DFC78A] shadow-[0_6px_22px_rgba(92,70,22,0.07)]">
                          <div>
                              <h2 className="text-xl font-display font-bold text-[#0F241C]">Menu Packages</h2>
                              <p className="text-sm text-[#5C5240]">Edit your menu packages. Changes are saved as drafts until published.</p>
                          </div>
                          <div className="flex gap-3">
                              <button onClick={handleSaveDraft} className="px-6 py-2.5 bg-[#FAF3E2] border border-[#DFC78A] text-[#01291D] hover:bg-[#F3E2BA] font-bold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer">
                                  <Save size={18} /> Save Draft
                              </button>
                              <button onClick={handlePublishMenu} className="px-6 py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] hover:brightness-110 font-bold rounded-xl transition-all shadow-md whitespace-nowrap cursor-pointer">
                                  Publish Changes
                              </button>
                          </div>
                      </div>
                      <CatererMenuBuilder 
                          packages={draftPackages} 
                          onChange={setDraftPackages} 
                          isParsing={isParsing} 
                          setIsParsing={setIsParsing} 
                      />
                  </div>
               )}

               {activeTab === 'profile' && (
                  <div className="bg-[#FFFDF8] rounded-3xl border border-[#DFC78A] shadow-[0_10px_28px_rgba(92,70,22,0.08)] overflow-hidden">
                      <div className="px-8 py-6 border-b border-[#DFC78A]/60 bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01291D]">
                          <h2 className="text-xl font-display font-bold text-[#FFFDF8]">Profile Management</h2>
                          <p className="text-sm text-[#DFC78A] mt-0.5">Identity changes require admin approval before becoming visible.</p>
                      </div>

                      <div className="p-8">
                      {isProfilePending && (
                          <div className="mb-8 p-4 bg-[#FEF3C7] border border-[#DFC78A] rounded-2xl flex items-start gap-4">
                              <Clock className="text-[#9A6A0F] flex-shrink-0 mt-0.5" size={20} />
                              <div>
                                  <h4 className="font-bold text-[#5C3D06] text-sm">Update Request Pending</h4>
                                  <p className="text-[#6B4A10] text-sm mt-1">Your recent profile changes are currently under review by our admin team. Once approved, they will be visible to customers.</p>
                              </div>
                          </div>
                      )}

                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Owner Name</label>
                                  <input type="text" value={profileFormData.owner || ''} onChange={(e) => setProfileFormData({...profileFormData, owner: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" required />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Business Name</label>
                                  <input type="text" value={profileFormData.businessName || ''} onChange={(e) => setProfileFormData({...profileFormData, businessName: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" required />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Mobile Number</label>
                                  <input type="tel" value={profileFormData.phone || ''} onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" required />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Email Address</label>
                                  <input type="email" value={profileFormData.email || ''} onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" required />
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Business Description</label>
                                  <textarea value={profileFormData.description || ''} onChange={(e) => setProfileFormData({...profileFormData, description: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none h-24 resize-none" placeholder="Tell customers about your catering service..." required></textarea>
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Full Address</label>
                                  <textarea value={profileFormData.address || ''} onChange={(e) => setProfileFormData({...profileFormData, address: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none h-24 resize-none" required></textarea>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Base City</label>
                                  <input type="text" value={profileFormData.city || ''} onChange={(e) => setProfileFormData({...profileFormData, city: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" required />
                              </div>
                          </div>

                          <div className="pt-6 border-t border-[#EFE3C4]">
                              <h3 className="font-display font-bold text-[#0F241C] mb-4">Professional &amp; Operational Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Brand Name</label>
                                      <input type="text" value={profileFormData.brandName || ''} onChange={(e) => setProfileFormData({...profileFormData, brandName: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. Royal Caterers Premium" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Tagline</label>
                                      <input type="text" value={profileFormData.tagline || ''} onChange={(e) => setProfileFormData({...profileFormData, tagline: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. Exquisite flavors for unrepeatable moments" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">WhatsApp Mobile Connection</label>
                                      <input type="tel" value={profileFormData.whatsappNumber || ''} onChange={(e) => setProfileFormData({...profileFormData, whatsappNumber: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. +91 98765 43210" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Years of Experience</label>
                                      <input type="number" value={profileFormData.experience || ''} onChange={(e) => setProfileFormData({...profileFormData, experience: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. 10" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Events Completed</label>
                                      <input type="number" value={profileFormData.eventsCompleted || ''} onChange={(e) => setProfileFormData({...profileFormData, eventsCompleted: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. 350" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Number of Branches</label>
                                      <input type="number" value={profileFormData.branches || ''} onChange={(e) => setProfileFormData({...profileFormData, branches: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none" placeholder="e.g. 3" />
                                  </div>
                                  <div className="col-span-1 md:col-span-2">
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Service Areas</label>
                                      
                                      {/* Serve Entire Hyderabad checkbox */}
                                      <label className="flex items-center gap-2 cursor-pointer select-none bg-[#FAF3E2]/65 border border-[#DFC78A] rounded-xl px-4 py-3 mb-3 transition hover:bg-[#FAF0D4]">
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
                                              className="w-4 h-4 text-[#01291D] focus:ring-[#01291D] border-[#DFC78A] rounded cursor-pointer accent-[#01291D]"
                                          />
                                          <span className="text-xs font-bold text-[#0F241C] uppercase tracking-wide">
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
                                              <div className="flex gap-2">
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
                                                      placeholder="Enter area name, e.g. Jubilee Hills"
                                                      className="flex-1 bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none"
                                                  />
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
                                                      className="bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/50 hover:brightness-110 text-[#FFFDF8] text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer whitespace-nowrap"
                                                  >
                                                      + Add Area
                                                  </button>
                                              </div>

                                              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 py-1">
                                                  {(() => {
                                                      const raw = profileFormData.serviceAreas;
                                                      if (!raw) return [];
                                                      return Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                                                  })().map((area: string, idx: number) => (
                                                      <span
                                                          key={idx}
                                                          className="inline-flex items-center gap-1.5 bg-[#FAF3E2] border border-[#DFC78A] text-[#0F241C] px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs select-none"
                                                      >
                                                          {area}
                                                          <button
                                                              type="button"
                                                              onClick={() => {
                                                                  const raw = profileFormData.serviceAreas;
                                                                  const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map(s => s.trim()).filter(Boolean)) : []);
                                                                  const filtered = arr.filter((a: string) => a !== area);
                                                                  setProfileFormData({ ...profileFormData, serviceAreas: filtered });
                                                              }}
                                                              className="text-[#7D6E52] hover:text-rose-600 transition-colors focus:outline-none cursor-pointer"
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
                          </div>

                          <div className="pt-6 border-t border-[#EFE3C4]">
                              <h3 className="font-display font-bold text-[#0F241C] mb-4">Branding &amp; Identity</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <ImageUploaderField 
                                        label="Caterer Logo Upload (500x500)"
                                        value={profileFormData.logo || ''}
                                        onChange={(val) => setProfileFormData({...profileFormData, logo: val})}
                                        placeholder="e.g. https://host.com/logo.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Cover Banner Upload (1600x600)"
                                        value={profileFormData.coverBanner || ''}
                                        onChange={(val) => setProfileFormData({...profileFormData, coverBanner: val})}
                                        placeholder="e.g. https://host.com/banner.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Founder Photo Upload (500x500)"
                                        value={profileFormData.ownerPhoto || ''}
                                        onChange={(val) => setProfileFormData({...profileFormData, ownerPhoto: val})}
                                        placeholder="e.g. https://host.com/founder.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Branch Photo Upload (Optional)"
                                        value={profileFormData.branchPhoto || ''}
                                        onChange={(val) => setProfileFormData({...profileFormData, branchPhoto: val})}
                                        placeholder="e.g. https://host.com/branch.jpg"
                                   />
                              </div>
                          </div>

                          <div className="pt-6 border-t border-[#EFE3C4]">
                               <h3 className="font-display font-bold text-[#0F241C] mb-1">Gallery Photos</h3>
                               <p className="text-sm text-[#5C5240] mb-6">Manage the images shown on your Explore Caterers listing.</p>
                               
                               {/* Desktop Grid (4 images per row) */}
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                   {(profileFormData.galleryPhotos || []).map((imgUrl: string, idx: number) => (
                                       <div key={idx} className="bg-[#FAF3E2]/45 rounded-2xl border border-[#DFC78A] p-3 shadow-sm relative group hover:border-[#D4961B] transition-all flex flex-col justify-between">
                                           <div className="relative aspect-video rounded-xl overflow-hidden bg-[#FFFDF8] border border-[#DFC78A]/70 mb-3 flex items-center justify-center">
                                               <img 
                                                   src={imgUrl} 
                                                   alt={`Gallery ${idx + 1}`} 
                                                   className="w-full h-full object-cover" 
                                                   referrerPolicy="no-referrer"
                                               />
                                               {idx === 0 && (
                                                   <span className="absolute top-2 left-2 bg-gradient-to-r from-[#FCE07E] to-[#D99B16] text-[#042419] text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                       <Star size={10} fill="currentColor" /> Primary
                                                   </span>
                                               )}
                                           </div>
                                           
                                           <div className="space-y-2 mt-auto">
                                               {idx > 0 && (
                                                   <button 
                                                       type="button" 
                                                       onClick={() => handleMakePrimary(idx)}
                                                       className="w-full py-1.5 bg-[#FAF0D4] hover:bg-[#F3DFAB] text-[#78530A] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 border border-[#DFC78A] cursor-pointer"
                                                   >
                                                       <Star size={12} /> Make Primary
                                                   </button>
                                               )}
                                               
                                               <div className="flex gap-2">
                                                   <button 
                                                       type="button"
                                                       disabled={idx === 0}
                                                       onClick={() => handleMovePhoto(idx, 'left')}
                                                       className="flex-1 py-1 bg-[#FFFDF8] hover:bg-[#FAF0D4] disabled:opacity-30 border border-[#DFC78A] text-[#0F241C] rounded-lg flex items-center justify-center cursor-pointer"
                                                       title="Move Left"
                                                   >
                                                       <ChevronLeft size={16} />
                                                   </button>
                                                   <button 
                                                       type="button"
                                                       disabled={idx === (profileFormData.galleryPhotos || []).length - 1}
                                                       onClick={() => handleMovePhoto(idx, 'right')}
                                                       className="flex-1 py-1 bg-[#FFFDF8] hover:bg-[#FAF0D4] disabled:opacity-30 border border-[#DFC78A] text-[#0F241C] rounded-lg flex items-center justify-center cursor-pointer"
                                                       title="Move Right"
                                                   >
                                                       <ChevronRight size={16} />
                                                   </button>
                                               </div>

                                               <div className="flex gap-2">
                                                   <label className="flex-1 py-1.5 bg-[#FFFDF8] hover:bg-[#FAF0D4] border border-[#DFC78A] text-[#0F241C] font-bold rounded-lg text-xs transition-colors cursor-pointer text-center uppercase tracking-wider">
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
                                                       className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                                   >
                                                       <Trash2 size={14} />
                                                   </button>
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* Upload Box with Drag & Drop */}
                               <div 
                                   onDragEnter={handleGalleryDrag}
                                   onDragOver={handleGalleryDrag}
                                   onDragLeave={handleGalleryDrag}
                                   onDrop={handleGalleryDrop}
                                   className={cn(
                                       "border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden bg-[#FAF3E2]/45",
                                       galleryDragActive ? "border-[#D4961B] bg-[#FAF0D4]/65 scale-[0.99]" : "border-[#DFC78A]"
                                   )}
                               >
                                   <div className="text-center flex flex-col items-center">
                                       <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] flex items-center justify-center mb-3 shadow-sm">
                                           <UploadCloud size={24} className="text-[#9A6A0F]" />
                                       </div>
                                       <p className="text-sm font-bold text-[#0F241C] mb-1">Drag &amp; drop your images here</p>
                                       <p className="text-xs text-[#6B5F4B] mb-4">Supports JPG, PNG, WEBP (multiple select)</p>
                                       <label className="cursor-pointer bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] border border-[#B57B0C]/35 text-[#042419] text-xs font-black px-6 py-3 rounded-xl hover:brightness-105 shadow-sm transition-all select-none uppercase tracking-wider">
                                           Upload New Photos
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
                           </div>

                          <div className="pt-6 border-t border-[#EFE3C4]">
                              <h3 className="font-display font-bold text-[#0F241C] mb-4">Legal Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">FSSAI Number</label>
                                      <input type="text" value={profileFormData.fssaiNumber || ''} onChange={(e) => setProfileFormData({...profileFormData, fssaiNumber: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none uppercase" placeholder="14-digit number" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">GSTIN</label>
                                      <input type="text" value={profileFormData.gstNumber || ''} onChange={(e) => setProfileFormData({...profileFormData, gstNumber: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none uppercase" placeholder="15-character GSTIN" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">PAN Number</label>
                                      <input type="text" value={profileFormData.panNumber || ''} onChange={(e) => setProfileFormData({...profileFormData, panNumber: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none uppercase" placeholder="10-character PAN" />
                                  </div>
                              </div>
                          </div>

                          <div className="pt-8 text-right">
                              <button type="submit" className="px-8 py-3 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">
                                  Submit Profile for Review
                              </button>
                          </div>
                      </form>
                      </div>
                  </div>
               )}

               {activeTab === 'notifications' && (
                   <div className="bg-[#FFFDF8] rounded-3xl border border-[#DFC78A] shadow-[0_10px_28px_rgba(92,70,22,0.08)] overflow-hidden max-w-4xl mx-auto">
                       <div className="px-6 py-5 border-b border-[#DFC78A]/60 flex justify-between items-center bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01291D]">
                           <div>
                               <h2 className="text-xl font-display font-bold text-[#FFFDF8] flex items-center gap-2"><Bell className="text-[#F5C642]" /> Notifications Inbox</h2>
                               <p className="text-sm text-[#DFC78A] mt-0.5">Status changes, system updates, and incoming quotations</p>
                           </div>
                           {localNotifications.length > 0 && (
                               <button onClick={handleClearAllNotifications} className="px-4 py-2 bg-rose-500/20 text-rose-200 border border-rose-300/40 hover:bg-rose-500/30 font-bold rounded-xl text-xs transition-colors cursor-pointer">
                                   Clear All
                               </button>
                           )}
                       </div>

                       <div className="p-6 space-y-3">
                           {localNotifications.map((n) => (
                               <div key={n.id} className={cn("p-4 rounded-2xl border transition-all flex justify-between items-start", n.read ? "bg-[#FAF3E2]/45 border-[#DFC78A]/70" : "bg-[#FAF0D4]/65 border-[#D4961B]/70 shadow-sm")}>
                                   <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                           <span className={cn("w-2 h-2 rounded-full", n.read ? "bg-[#DFC78A]" : "bg-[#D4961B]")} />
                                           <h4 className="font-bold text-[#0F241C] text-sm">{n.title}</h4>
                                       </div>
                                       <p className="text-xs text-[#494032] pl-4">{n.message}</p>
                                       {n.orderId && <p className="text-[10px] text-[#7D6E52] font-mono pl-4">Order ID: {n.orderId}</p>}
                                   </div>
                                   {!n.read && (
                                       <button onClick={() => handleMarkNotificationRead(n.id)} className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#FAF0D4] border border-[#DFC78A] text-[#01291D] rounded-lg text-[10px] font-bold transition-all cursor-pointer">
                                           Mark Read
                                       </button>
                                   )}
                               </div>
                           ))}
                           {localNotifications.length === 0 && (
                               <div className="text-center py-12 text-[#6B5F4B]">
                                   <div className="w-12 h-12 bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] rounded-full flex items-center justify-center mx-auto mb-3">
                                       <Bell size={24} />
                                   </div>
                                   <p className="font-semibold text-[#0F241C]">All caught up!</p>
                                   <p className="text-xs text-[#6B5F4B] mt-1">You have no new notifications.</p>
                                </div>
                            )}
                       </div>
                   </div>
               )}

               {['gallery', 'settings'].includes(activeTab) && (
                   <div className="pt-20 text-center flex flex-col items-center">
                       <div className="w-16 h-16 bg-[#FAF0D4] border border-[#DFC78A] text-[#9A6A0F] rounded-2xl flex items-center justify-center mb-4">
                           <Settings size={32}/>
                       </div>
                       <h2 className="text-2xl font-display font-bold text-[#0F241C] mb-2 capitalize">{activeTab} Details</h2>
                       <p className="text-[#5C5240] max-w-md">This section is currently under development and will allow you to manage your {activeTab} in future updates.</p>
                       <button onClick={() => setActiveTab('dashboard')} className="mt-6 px-5 py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] rounded-xl font-bold text-sm cursor-pointer">Return to Dashboard</button>
                   </div>
               )}

            </div>
         </div>
      </div>

              {/* Order Details & Kitchen Work Order Modal */}
      <AnimatePresence>
          {selectedOrder && (
            (() => {
              const parsed = parseOrderDetails(selectedOrder);
              const guestsNum = Number(selectedOrder.guests || selectedOrder.guestCount || 0);
              const pricePerPlate = Number(selectedOrder.pricePerPlate || selectedOrder.packageDetails?.startingPrice || (guestsNum > 0 && selectedOrder.totalEstimate ? Math.round(Number(selectedOrder.totalEstimate) / guestsNum) : 0));
              const foodCost = pricePerPlate * guestsNum;
              const platformFee = Number(selectedOrder.platformFee || 0);
              const customerTotal = getOrderTotalAmount(selectedOrder) || (foodCost + platformFee);
              const categorizedGroups = getCategorizedMenuItems(selectedOrder);
              const totalItemsCount = selectedOrder.selectedItems?.length || selectedOrder.items?.length || 0;

              return (
                <div 
                  key={`order-modal-backdrop-${selectedOrder.id}`}
                  className="fixed inset-0 bg-[#01291D]/75 backdrop-blur-md z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleCloseOrderDetails();
                    }
                  }}
                >
                  <motion.div 
                    key={`order-modal-sheet-${selectedOrder.id}`}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#FFFDF8] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-2 border-[#DFC78A]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Top Action Bar */}
                    <div className="p-4 sm:p-6 border-b border-[#DFC78A]/45 flex flex-wrap justify-between items-center gap-3 bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01291D]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C642] block mb-1">
                          Kitchen Work Order &amp; Event Specification Sheet
                        </span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#FFFDF8]">Order #{selectedOrder.id}</h2>
                          <span className={cn("px-2.5 py-1 inline-block rounded-md text-xs font-bold uppercase tracking-wider", getStatusColor(selectedOrder.status))}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#DFC78A] mt-1">
                          Booked on: {new Date(selectedOrder.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 sm:px-4 py-2 bg-[#FFFDF8] hover:bg-[#FAF0D4] text-[#01291D] font-bold text-xs rounded-xl border border-[#DFC78A] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Print Work Order Sheet"
                        >
                          <Printer size={14} /> <span className="hidden sm:inline">Print Work Order</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleCloseOrderDetails}
                          className="p-2 hover:bg-white/10 rounded-full transition text-[#F5C642] cursor-pointer"
                          title="Close modal"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Modal Body with Full Specification */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
                      
                      {/* Quick Event Specs Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-[#FAF3E2]/55 p-3.5 rounded-xl border border-[#DFC78A]">
                          <p className="text-[10px] uppercase font-bold text-[#7D6E52] mb-1 tracking-widest">Status</p>
                          <span className={cn("px-2 py-0.5 inline-block rounded text-xs font-bold uppercase tracking-wider", getStatusColor(selectedOrder.status))}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <div className="bg-[#FAF3E2]/55 p-3.5 rounded-xl border border-[#DFC78A]">
                          <p className="text-[10px] uppercase font-bold text-[#7D6E52] mb-1 tracking-widest flex items-center gap-1">
                            <CalendarDays size={11} /> Event Date
                          </p>
                          <p className="font-bold text-[#0F241C] text-sm mt-0.5">
                            {selectedOrder.eventDate || selectedOrder.eventDates?.join(", ") || "N/A"}
                          </p>
                        </div>
                        <div className="bg-[#FAF3E2]/55 p-3.5 rounded-xl border border-[#DFC78A]">
                          <p className="text-[10px] uppercase font-bold text-[#7D6E52] mb-1 tracking-widest flex items-center gap-1">
                            <User size={11} /> Guest Count
                          </p>
                          <p className="font-bold text-[#0F241C] text-sm mt-0.5 tabular-nums">
                            {getOrderGuests(selectedOrder)} Guests
                          </p>
                        </div>
                        <div className="bg-[#FAF3E2]/55 p-3.5 rounded-xl border border-[#DFC78A]">
                          <p className="text-[10px] uppercase font-bold text-[#7D6E52] mb-1 tracking-widest">Occasion</p>
                          <p className="font-bold text-[#0F241C] text-sm mt-0.5">
                            {selectedOrder.eventType || selectedOrder.occasion || "Catering Event"}
                          </p>
                        </div>
                      </div>

                      {/* 2-Column: Customer Details & Venue Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Customer Information */}
                        <div className="bg-[#FAF3E2]/45 p-4 rounded-2xl border border-[#DFC78A]">
                          <h4 className="font-bold text-[#0F241C] text-sm mb-3 pb-2 border-b border-[#EFE3C4] flex items-center gap-1.5">
                            <User size={15} className="text-[#9A6A0F]" /> Customer Contact Information
                          </h4>
                          <div className="space-y-2.5 text-xs">
                            <p className="flex justify-between items-center">
                              <span className="text-[#6B5F4B] font-medium">Customer Name:</span>
                              <span className="font-bold text-[#0F241C] text-sm">{selectedOrder.customerName || "N/A"}</span>
                            </p>
                            <p className="flex justify-between items-center">
                              <span className="text-[#6B5F4B] font-medium">Phone Number:</span>
                              {selectedOrder.customerPhone || selectedOrder.phone ? (
                                <a 
                                  href={`tel:${selectedOrder.customerPhone || selectedOrder.phone}`}
                                  className="font-bold text-[#065239] hover:text-[#01291D] flex items-center gap-1 underline"
                                >
                                  <Phone size={11} /> {selectedOrder.customerPhone || selectedOrder.phone}
                                </a>
                              ) : (
                                <span className="text-[#8E7F62] font-medium">N/A</span>
                              )}
                            </p>
                            <p className="flex justify-between items-center">
                              <span className="text-[#6B5F4B] font-medium">Email Address:</span>
                              {selectedOrder.customerEmail ? (
                                <a 
                                  href={`mailto:${selectedOrder.customerEmail}`}
                                  className="font-bold text-[#065239] hover:text-[#01291D] truncate max-w-[200px] flex items-center gap-1 underline"
                                >
                                  <Mail size={11} /> {selectedOrder.customerEmail}
                                </a>
                              ) : (
                                <span className="text-[#8E7F62] font-medium">N/A</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Venue & Location */}
                        <div className="bg-[#FAF3E2]/45 p-4 rounded-2xl border border-[#DFC78A]">
                          <h4 className="font-bold text-[#0F241C] text-sm mb-3 pb-2 border-b border-[#EFE3C4] flex items-center gap-1.5">
                            <MapPin size={15} className="text-[#9A6A0F]" /> Venue &amp; Event Location
                          </h4>
                          <div className="space-y-2 text-xs">
                            {parsed.venueName && (
                              <p className="font-bold text-[#0F241C] text-sm">{parsed.venueName}</p>
                            )}
                            <p className="text-[#494032] font-medium leading-relaxed">
                              {parsed.venueAddress || selectedOrder.venue || selectedOrder.address || "Address not specified"}
                            </p>
                            {(parsed.mapUrl || (selectedOrder.latitude && selectedOrder.longitude) || parsed.venueAddress) && (
                              <a 
                                href={parsed.mapUrl || ((selectedOrder.latitude && selectedOrder.longitude) ? `https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parsed.venueAddress || selectedOrder.venue || selectedOrder.address)}`)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF0D4] hover:bg-[#F3DFAB] text-[#78530A] border border-[#DFC78A] rounded-lg font-bold text-xs transition-colors shadow-2xs"
                              >
                                📍 View in Google Maps ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meal Timings & Dietary Service Specifications */}
                      <div className="bg-[#FAF3E2]/45 p-4 rounded-2xl border border-[#DFC78A]">
                        <h4 className="font-bold text-[#0F241C] text-sm mb-2.5 pb-2 border-b border-[#EFE3C4] flex items-center gap-1.5">
                          <Clock size={15} className="text-[#9A6A0F]" /> Meal Service &amp; Timings
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#DFC78A]">
                            <span className="text-[#6B5F4B] font-medium block mb-1">Service / Meal</span>
                            <span className="font-bold text-[#0F241C] text-sm">{parsed.meals || selectedOrder.mealSelection || "Full Meal Catering"}</span>
                          </div>
                          <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#DFC78A]">
                            <span className="text-[#6B5F4B] font-medium block mb-1">Service Timings</span>
                            <span className="font-bold text-[#0F241C] text-sm">{parsed.timings || selectedOrder.mealTimings || "Standard Meal Timings"}</span>
                          </div>
                          <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#DFC78A]">
                            <span className="text-[#6B5F4B] font-medium block mb-1">Dietary Preferences</span>
                            <span className="font-bold text-[#0F241C] text-sm">{parsed.dietary || "Standard Menu"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Menu & Package Items - Full Specification */}
                      <div className="border border-[#DFC78A] rounded-2xl p-4 sm:p-5 bg-[#FFFDF8] shadow-2xs">
                        <div className="flex flex-wrap justify-between items-center border-b border-[#EFE3C4] pb-3 mb-4 gap-2">
                          <div>
                            <h3 className="font-bold text-[#0F241C] text-sm sm:text-base flex items-center gap-2">
                              <ChefHat size={18} className="text-[#065239]" /> Full Menu Specification ({totalItemsCount} Total Items)
                            </h3>
                            <p className="text-xs text-[#6B5F4B] mt-0.5">
                              Package: <span className="font-bold text-[#0F241C]">{selectedOrder.packageDetails?.packageName || "Customized Menu"}</span>
                            </p>
                          </div>
                          {selectedOrder.matchedSlab && selectedOrder.matchedSlab.minGuests && (
                            <span className="bg-[#FAF0D4] text-[#78530A] border border-[#DFC78A] px-3 py-1 rounded-full text-xs font-bold">
                              {selectedOrder.matchedSlab.minGuests} - {selectedOrder.matchedSlab.maxGuests || "1000+"} Guests Slab
                            </span>
                          )}
                        </div>

                        {categorizedGroups.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-80 overflow-y-auto pr-1">
                            {categorizedGroups.map((group, idx) => (
                              <div key={idx} className="bg-[#FAF3E2]/45 p-3.5 rounded-xl border border-[#DFC78A]">
                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#EFE3C4]">
                                  <span className="font-bold text-xs uppercase text-[#0F241C] tracking-wider">
                                    {group.categoryName}
                                  </span>
                                  <span className="text-[10px] font-bold bg-[#FFFDF8] text-[#494032] px-2 py-0.5 rounded-full border border-[#DFC78A]">
                                    {group.items.length} items
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-xs">
                                  {group.items.map((it, iIdx) => (
                                    <li key={iIdx} className="flex items-center gap-2 font-medium text-[#0F241C]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4961B] shrink-0"></span>
                                      <span>{it}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#6B5F4B] italic py-2">Chef&apos;s curated package selections.</p>
                        )}
                      </div>

                      {/* Customer Special Instructions & Dietary Notes */}
                      {parsed.specialInstructions && (
                        <div className="border border-[#DFC78A] bg-[#FEF3C7]/75 rounded-2xl p-4">
                          <h4 className="font-bold text-[#78530A] text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            📌 Customer Special Instructions &amp; Dietary Notes
                          </h4>
                          <p className="text-[#494032] font-medium text-xs whitespace-pre-line leading-relaxed">
                            {parsed.specialInstructions}
                          </p>
                        </div>
                      )}

                      {/* Financial Breakdown & Commercials */}
                      <div className="border border-[#9EE2BA] bg-[#ECF8F0]/75 rounded-2xl p-4 sm:p-5">
                        <h3 className="font-bold text-[#01291D] text-sm mb-3 flex items-center justify-between border-b border-[#9EE2BA] pb-2">
                          <span className="flex items-center gap-1.5">
                            <CreditCard size={16} className="text-[#065239]" /> Commercial Financials &amp; Billing
                          </span>
                          {pricePerPlate > 0 && (
                            <span className="text-xs font-bold bg-[#FFFDF8] text-[#065239] px-2.5 py-0.5 rounded-full border border-[#9EE2BA] tabular-nums">
                              ₹{pricePerPlate} / plate
                            </span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#9EE2BA]">
                            <span className="text-[#5C5240] font-medium block mb-1">
                              Food Cost ({pricePerPlate > 0 ? `₹${pricePerPlate}` : "Custom"} × {guestsNum} guests)
                            </span>
                            <span className="text-[#0F241C] font-bold text-sm tabular-nums">₹{foodCost.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#9EE2BA]">
                            <span className="text-[#5C5240] font-medium block mb-1">Platform Fee</span>
                            <span className="text-[#0F241C] font-bold text-sm tabular-nums">{platformFee > 0 ? `₹${platformFee.toLocaleString("en-IN")}` : "Included / ₹0"}</span>
                          </div>
                          <div className="bg-[#FFFDF8] p-3.5 rounded-xl border border-[#9EE2BA]">
                            <span className="text-[#5C5240] font-medium block mb-1">Customer Total</span>
                            <span className="text-[#01291D] font-extrabold text-lg tabular-nums">₹{customerTotal.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Private Caterer Kitchen Notes (Memo) */}
                      <div className="border border-[#DFC78A] bg-[#FAF3E2]/55 rounded-2xl p-4 text-left">
                        <div className="flex justify-between items-center mb-1.5">
                          <h4 className="font-bold text-[#0F241C] text-xs flex items-center gap-1.5">
                            🔒 Caterer Private Kitchen Notes (Confidential)
                          </h4>
                          <span className="text-[10px] text-[#7D6E52] uppercase font-semibold">Staff &amp; Kitchen Eyes Only</span>
                        </div>
                        <p className="text-[11px] text-[#5C5240] mb-2">
                          Add private kitchen notes, head chef assignments, delivery dispatch timing, or setup reminders:
                        </p>
                        <textarea 
                          value={internalNotesText}
                          onChange={(e) => setInternalNotesText(e.target.value)}
                          placeholder="e.g. Head chef Assigned: Ramesh. Setup vehicles must leave by 10:30 AM. Extra welcome drinks buffer requested..."
                          className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl p-3 text-xs text-[#0F241C] focus:border-[#D4961B] outline-none resize-none h-20 mb-2 font-sans"
                        />
                        <button 
                          type="button"
                          onClick={() => handleSaveInternalNotes(selectedOrder.id)}
                          className="px-4 py-1.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] rounded-lg text-xs font-bold hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Save size={13} /> Save Memo
                        </button>
                      </div>

                    </div>

                    {/* Modal Footer Actions */}
                    <div className="p-4 border-t border-[#EFE3C4] bg-[#FAF3E2]/70 flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <span className="text-xs text-[#6B5F4B]">
                          Order ID: <strong className="text-[#0F241C] font-mono">#{selectedOrder.id}</strong>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {["pending", "Submitted", "Pending Caterer Review", "updated_by_customer", "changes_requested"].includes(normalizeStatus(selectedOrder.status)) ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => setShowRejectModal(true)} 
                              className="px-4 py-2 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowChangesRequestModal(true)} 
                              className="px-4 py-2 border border-[#DFC78A] text-[#01291D] bg-[#FFFDF8] hover:bg-[#FAF0D4] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Request Changes
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleApprove(selectedOrder.id)} 
                              className="px-5 py-2 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] hover:brightness-110 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                            >
                              Approve Order
                            </button>
                          </>
                        ) : normalizeStatus(selectedOrder.status) === "approved" ? (
                          <>
                            <button 
                              type="button"
                              onClick={async () => {
                                await performOrderStatusUpdate(
                                  selectedOrder.id, 
                                  "completed", 
                                  { completedAt: new Date().toISOString() }, 
                                  user?.email || "partner@caternest.com", 
                                  "partner"
                                );
                                storeNotification(
                                  selectedOrder.id, 
                                  "Event Completed 🎉", 
                                  `Your catering booking with ${caterer?.businessName || "the caterer"} has been marked as Completed!`, 
                                  "customer", 
                                  caterer?.id
                                );
                                await refreshData();
                                handleCloseOrderDetails();
                                toast("Booking marked as Completed!", "success");
                              }} 
                              className="px-5 py-2 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 text-[#FFFDF8] font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Mark Event Completed
                            </button>
                            <button 
                              type="button"
                              onClick={handleCloseOrderDetails} 
                              className="px-6 py-2 bg-[#FFFDF8] border border-[#DFC78A] text-[#0F241C] font-bold rounded-xl hover:bg-[#FAF0D4] text-xs transition cursor-pointer"
                            >
                              Close
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button"
                            onClick={handleCloseOrderDetails} 
                            className="px-6 py-2 bg-[#FFFDF8] border border-[#DFC78A] text-[#0F241C] font-bold rounded-xl hover:bg-[#FAF0D4] text-xs transition cursor-pointer"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
               <div className="fixed inset-0 bg-[#01291D]/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFFDF8] border-2 border-[#DFC78A] rounded-3xl p-6 w-full max-w-md shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-[#0F241C] mb-2">Reject Order</h3>
                     <p className="text-sm text-[#5C5240] mb-4">Please provide a reason for rejecting this order. The customer will be notified.</p>
                     <textarea 
                         className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl p-3 text-sm text-[#0F241C] focus:border-rose-500 outline-none resize-none h-24 mb-4"
                         placeholder="e.g. Date fully booked, Out of service area..."
                         value={rejectReason}
                         onChange={(e)=>setRejectReason(e.target.value)}
                     ></textarea>
                     <div className="flex gap-3 justify-end mt-2">
                         <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 font-bold text-[#0F241C] bg-[#FAF3E2] border border-[#DFC78A] hover:bg-[#F3E2BA] rounded-xl cursor-pointer">Cancel</button>
                         <button onClick={handleReject} className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 w-32 cursor-pointer">Confirm Reject</button>
                     </div>
                 </motion.div>
              </div>
          )}

          {showChangesRequestModal && (
              <div className="fixed inset-0 bg-[#01291D]/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFFDF8] border-2 border-[#DFC78A] rounded-3xl p-6 w-full max-w-md shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-[#0F241C] mb-2">Request Order Changes</h3>
                     <p className="text-sm text-[#5C5240] mb-4">Please specify what changes, details, or clarifications you are requesting from the customer. The customer will be prompted to update their choices.</p>
                     <textarea 
                         className="w-full bg-[#FFFDF8] border border-[#DFC78A] rounded-xl p-3 text-sm text-[#0F241C] focus:border-[#D4961B] outline-none resize-none h-24 mb-4"
                         placeholder="e.g. Please specify dessert choices, adjust event start time, etc..."
                         value={changesRequestText}
                         onChange={(e)=>setChangesRequestText(e.target.value)}
                     ></textarea>
                     <div className="flex gap-3 justify-end mt-2">
                         <button onClick={() => { setShowChangesRequestModal(false); setChangesRequestText(''); }} className="px-4 py-2 font-bold text-[#0F241C] bg-[#FAF3E2] border border-[#DFC78A] hover:bg-[#F3E2BA] rounded-xl cursor-pointer">Cancel</button>
                         <button onClick={handleRequestChanges} className="px-4 py-2 font-bold text-[#FFFDF8] bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 rounded-xl shadow-md cursor-pointer">Send Request</button>
                     </div>
                 </motion.div>
              </div>
          )}

          {showModifyModal && (
              <div className="fixed inset-0 bg-[#01291D]/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFFDF8] border-2 border-[#DFC78A] rounded-3xl p-6 w-full max-w-md shadow-2xl">
                     <h3 className="text-xl font-display font-bold text-[#0F241C] mb-4">Modify Order Quote</h3>
                     
                     <div className="space-y-4 mb-6">
                         <div>
                             <label className="block text-sm font-bold text-[#0F241C] mb-1">Price Per Plate (₹)</label>
                             <input type="number" value={modifyData.price} onChange={(e)=>setModifyData({...modifyData, price: Number(e.target.value)})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] p-2.5 rounded-xl text-[#0F241C] focus:border-[#D4961B] outline-none" />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-[#0F241C] mb-1">Guest Count</label>
                             <input type="number" value={modifyData.guests} onChange={(e)=>setModifyData({...modifyData, guests: Number(e.target.value)})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] p-2.5 rounded-xl text-[#0F241C] focus:border-[#D4961B] outline-none" />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-[#0F241C] mb-1">Caterer Notes for Customer</label>
                             <textarea value={modifyData.notes} onChange={(e)=>setModifyData({...modifyData, notes: e.target.value})} className="w-full bg-[#FFFDF8] border border-[#DFC78A] p-2.5 rounded-xl resize-none h-20 text-[#0F241C] placeholder:text-[#8E7F62] focus:border-[#D4961B] outline-none" placeholder="e.g. Adjusted price for premium items requested..."></textarea>
                         </div>
                     </div>

                     <div className="bg-[#ECF8F0] border border-[#9EE2BA] p-3 rounded-xl flex justify-between items-center mb-6">
                         <span className="font-bold text-[#01291D]">New Estimate:</span>
                         <span className="font-display font-bold text-xl text-[#01291D] tabular-nums">₹{(modifyData.price * modifyData.guests + (selectedOrder?.platformFee || 0)).toLocaleString()}</span>
                     </div>
                     
                     <div className="flex gap-3 justify-end">
                         <button onClick={() => setShowModifyModal(false)} className="px-4 py-2 font-bold text-[#0F241C] bg-[#FAF3E2] border border-[#DFC78A] hover:bg-[#F3E2BA] rounded-xl cursor-pointer">Cancel</button>
                         <button onClick={handleModify} className="px-4 py-2 font-bold text-[#FFFDF8] bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 hover:brightness-110 rounded-xl shadow-md cursor-pointer">Send Modification</button>
                     </div>
                 </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}
