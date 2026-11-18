import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  ChefHat, 
  Tag, 
  CheckCircle2, 
  ImageIcon, 
  Heart, 
  Users, 
  Calendar, 
  Smartphone,
  ArrowRight,
  Award,
  Filter,
  X,
  Clock,
  Leaf,
  Trophy,
  Utensils,
  BadgeCheck,
  Flame,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HYDERABAD_AREAS, DEMO_CATERERS, DEMO_REVIEWS } from '../data';
import { cn, safeSaveRegistrations } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useCatererFilters } from '../contexts/CatererFilterContext';
import { getSupabase } from '../lib/supabase';
import { MapPickerModal } from '../components/MapPickerModal';
import { calculateDistanceKm, estimateDrivingTimeMinutes, searchLocations } from '../lib/locationIntelligence';
import { fetchCatererBadgesMap } from '../lib/badgeApi';
import { PlatformBadge, STYLE_VARIANT_CONFIG, BadgeStyleVariant, getBadgeIconComponent } from '../lib/badgeUtils';

// Helper to return beautiful, premium fallback images for caterers
export function getCatererImagesFallback(name: string, images?: string[]): string[] {
  const defaultImages = [
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', // Party catering table
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', // Assorted food
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800', // Indian buffet
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800'  // Premium dining
  ];

  // Clean the existing images array of any falsy or broken placeholder values
  const cleanImages = (images || []).filter(img => 
    img && 
    typeof img === 'string' && 
    img.trim() !== '' && 
    !img.includes('placeholder') && 
    !img.includes('broken') &&
    (img.startsWith('http') || img.startsWith('data:image/'))
  );

  if (cleanImages.length > 0) {
    return cleanImages;
  }

  // Assign high quality specific images based on caterer name keywords
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('south') || lowerName.includes('venue')) {
    return [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800', // South Indian traditional spread
      'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800'  // South Indian delicacies
    ];
  }
  if (lowerName.includes('elite')) {
    return [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', // Luxury wedding buffet
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800'
    ];
  }
  if (lowerName.includes('grand') || lowerName.includes('feast')) {
    return [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800'
    ];
  }
  if (lowerName.includes('royal') || lowerName.includes('flavour')) {
    return [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'
    ];
  }
  if (lowerName.includes('spice') || lowerName.includes('affair')) {
    return [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800'
    ];
  }

  // Dynamic assignment based on string hash to vary fallbacks nicely
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % defaultImages.length;
  return [defaultImages[index], defaultImages[(index + 1) % defaultImages.length]];
}

// Reusable Image component that handles error fallbacks elegantly without broken placeholder icons
export function SafeImage({ src, alt, className, style, fallbackType = 'catering' }: { 
  src: string | null | undefined; 
  alt: string; 
  className?: string; 
  style?: React.CSSProperties;
  fallbackType?: 'catering' | 'occasion' | 'cuisine' | 'avatar' | 'logo'
}) {
  const getFallback = () => {
    if (fallbackType === 'cuisine') {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=60&w=400';
    }
    if (fallbackType === 'occasion') {
      return 'https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&q=60&w=400';
    }
    if (fallbackType === 'avatar') {
      return 'https://i.pravatar.cc/150?u=fallback';
    }
    if (fallbackType === 'logo') {
      return '';
    }
    return 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800'; // luxury wedding buffet
  };

  const initialSrc = src && typeof src === 'string' && src.trim() !== '' ? src : getFallback();
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(getFallback());
    }
  }, [src, fallbackType]);

  if (fallbackType === 'logo' && (!src || src.trim() === '')) {
    return null; // Let the text-based circle logo render instead
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getFallback());
        }
      }}
    />
  );
}

function GoldOrnamentalCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotationClass = {
    'top-left': 'top-2.5 left-2.5',
    'top-right': 'top-2.5 right-2.5 rotate-90',
    'bottom-left': 'bottom-2.5 left-2.5 -rotate-90',
    'bottom-right': 'bottom-2.5 right-2.5 rotate-180',
  }[position];

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("absolute w-10 h-10 md:w-12 md:h-12 text-[#DEAA38]/80 pointer-events-none select-none z-10", rotationClass)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer corner frame line */}
      <path d="M 6,90 L 6,10 C 6,7 7,6 10,6 L 90,6" strokeWidth="1.2" />
      <path d="M 14,90 L 14,14 L 90,14" strokeWidth="0.8" opacity="0.5" />
      
      {/* Elegant scroll curls */}
      <path d="M 6,6 C 18,6 26,14 26,26 C 26,38 14,32 20,20 C 24,12 34,6 48,6" strokeWidth="1" />
      <path d="M 6,6 C 6,18 14,26 26,26 C 38,26 32,14 20,20 C 12,24 6,34 6,48" strokeWidth="1" />
      
      {/* Inner accent fleur-de-lis style leaf */}
      <path d="M 14,14 L 32,32" strokeWidth="0.8" />
      <path d="M 32,32 C 34,28 34,22 28,24 Z" fill="currentColor" opacity="0.15" />
      <path d="M 32,32 C 28,34 22,34 24,28 Z" fill="currentColor" opacity="0.15" />
      
      {/* Tiny ornamental dots */}
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      <circle cx="21" cy="21" r="1.2" fill="currentColor" />
      <circle cx="27" cy="27" r="0.9" fill="currentColor" />
    </svg>
  );
}

const OCCASIONS = [
  { name: 'Wedding', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
  { name: 'Reception', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600' },
  { name: 'Birthday', img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600' },
  { name: 'Housewarming', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600' },
  { name: 'Corporate', img: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=600' },
  { name: 'Engagement', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600' },
  { name: 'Baby Shower', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600' },
  { name: 'Festival', img: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=600' }
];

const CUISINES = [
  { name: 'Hyderabadi', img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=60&w=400' },
  { name: 'South Indian', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=60&w=400' },
  { name: 'North Indian', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=60&w=400' },
  { name: 'Chinese', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=60&w=400' },
  { name: 'Continental', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=60&w=400' },
  { name: 'Live Counters', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=60&w=400' },
  { name: 'Desserts', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=60&w=400' },
  { name: 'Multi Cuisine', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=60&w=400' }
];

// Horizontal Image Slider for Caterer Cards
function CardImageSlider({ images, name }: { images: string[]; name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Clean and prepare valid images list using our helper
  const fallbackList = getCatererImagesFallback(name, images);
  const [validImages, setValidImages] = useState<string[]>(fallbackList);

  useEffect(() => {
    setValidImages(getCatererImagesFallback(name, images));
    setCurrentIndex(0);
  }, [images, name]);

  const handleImageError = (index: number) => {
    const updated = [...validImages];
    if (updated.length > 1) {
      updated.splice(index, 1);
      setValidImages(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(0);
      }
    } else {
      // Fallback to beautiful default single images based on name
      setValidImages(['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800']);
      setCurrentIndex(0);
    }
  };

  if (!validImages || validImages.length === 0) {
    return (
      <div className="w-full h-full bg-[#FAF3E2] flex items-center justify-center">
        <ImageIcon className="text-[#C8941A]/55 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group overflow-hidden">
      <img
        src={validImages[currentIndex]}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
        onError={() => handleImageError(currentIndex)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % validImages.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronRight size={14} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {validImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === idx ? "w-3 bg-brand-gold-500" : "w-1.5 bg-white/60"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Search Form State
  const [searchLocation, setSearchLocation] = useState('Hyderabad');
  const [searchOccasion, setSearchOccasion] = useState('');
  const [searchGuests, setSearchGuests] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  // Customer Precise Location States for intelligence/filtering
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [isExploreMapOpen, setIsExploreMapOpen] = useState(false);

  // Caterers & Filtering State
  const [caterers, setCaterers] = useState<any[]>([]);
  const [filteredCaterers, setFilteredCaterers] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({});
  
  // Active Filter States provided by session-scoped CatererFilterContext
  const {
    cuisineFilter,
    occasionFilter,
    budgetFilter,
    guestsFilter,
    sortOption,
    isLiveCounters,
    ratingFilter,
    searchKeyword,
    setCuisineFilter,
    setOccasionFilter,
    toggleOccasionFilter,
    setBudgetFilter,
    setGuestsFilter,
    setSortOption,
    setIsLiveCounters,
    setRatingFilter,
    setSearchKeyword,
    clearAllFilters,
  } = useCatererFilters();

  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qLocation = searchParams.get('location') || 'Hyderabad';
    const qBudget = searchParams.get('budget');
    const qGuests = searchParams.get('guests');

    const qDiet = searchParams.get('diet') || searchParams.get('cuisine');
    const qOccasion = searchParams.get('occasion');

    if (qDiet !== null && qDiet !== undefined) {
      if (qDiet.toLowerCase().includes('non')) {
        setCuisineFilter('Non-Veg');
      } else if (qDiet.toLowerCase().includes('veg')) {
        setCuisineFilter('Veg');
      }
    }

    if (qOccasion !== null && qOccasion !== undefined) {
      setOccasionFilter(qOccasion ? [qOccasion] : []);
    }

    if (qSearch !== null && qSearch !== undefined) {
      setSearchKeyword(qSearch);
      const matchedOcc = ['Wedding', 'Reception', 'Birthday', 'Corporate', 'Housewarming', 'Engagement', 'Baby Shower', 'Festival'].find(
        o => o.toLowerCase() === qSearch.toLowerCase() || qSearch.toLowerCase().includes(o.toLowerCase())
      );
      if (matchedOcc && !qOccasion) {
        setOccasionFilter([matchedOcc]);
      }
    }

    if (qLocation) {
      setSearchLocation(qLocation);
    }
    const qLat = searchParams.get('lat');
    const qLng = searchParams.get('lng');
    if (qLat && qLng) {
      setCustomerLat(parseFloat(qLat));
      setCustomerLng(parseFloat(qLng));
    } else {
      const savedLat = localStorage.getItem('customer_lat');
      const savedLng = localStorage.getItem('customer_lng');
      const savedAddr = localStorage.getItem('customer_address');
      if (savedLat && savedLng) {
        setCustomerLat(parseFloat(savedLat));
        setCustomerLng(parseFloat(savedLng));
        if (savedAddr) setSearchLocation(savedAddr);
      }
    }
    if (qBudget !== null && qBudget !== undefined) {
      setSearchBudget(qBudget);
      if (qBudget === '300-400') setBudgetFilter(400);
      else if (qBudget === '400-600') setBudgetFilter(600);
      else if (qBudget === '600-800') setBudgetFilter(800);
      else if (qBudget === '800+') setBudgetFilter(1000);
    }
    if (qGuests !== null && qGuests !== undefined) {
      setSearchGuests(qGuests);
      if (qGuests === 'Upto 50') setGuestsFilter(['Upto 50']);
      else if (qGuests === '50-100') setGuestsFilter(['50 - 105']);
      else if (qGuests === '100-200') setGuestsFilter(['100 - 200']);
      else if (qGuests === '200-500') setGuestsFilter(['200 - 500']);
      else if (qGuests === '500-1000') setGuestsFilter(['500 - 1000']);
      else if (qGuests === '1000+') setGuestsFilter(['1000+']);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('scroll') === 'true') {
      const timer = setTimeout(() => {
        const element = document.getElementById('explore-marketplace');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          
          const newParams = new URLSearchParams(window.location.search);
          newParams.delete('scroll');
          const newSearch = newParams.toString();
          navigate({
            pathname: window.location.pathname,
            search: newSearch ? `?${newSearch}` : '',
          }, { replace: true });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  // Accordion Open states
  const [openCuisine, setOpenCuisine] = useState(true);
  const [openOccasion, setOpenOccasion] = useState(true);
  const [openBudget, setOpenBudget] = useState(true);
  const [openGuests, setOpenGuests] = useState(true);
  const [openMoreFilters, setOpenMoreFilters] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const moreFiltersRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(event.target as Node)) {
        setOpenMoreFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch active customer orders
  const fetchCustomerActiveOrders = async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const filtered = data.filter((o: any) => 
            o.userId === user.id || 
            (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
            o.customerName === user.name
          );
          setActiveOrders(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const raw = localStorage.getItem('orders') || '[]';
        const parsed = JSON.parse(raw);
        const filtered = parsed.filter((o: any) => 
          o.userId === user.id || 
          (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          o.customerName === user.name
        );
        setActiveOrders(filtered);
      } catch(e) {}
    }
  };

  useEffect(() => {
    fetchCustomerActiveOrders();

    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase
        .channel('explore-active-orders-channel-upgraded')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchCustomerActiveOrders();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Fetch approved caterers
  useEffect(() => {
    const fetchCaterersData = async () => {
      let allCaterers: any[] = [];
      const supabase = getSupabase();
      
      // Load dynamic caterer badge mappings
      let badgesMap: Record<string, PlatformBadge[]> = {};
      try {
        badgesMap = await fetchCatererBadgesMap();
      } catch (e) {
        console.warn("[EXPLORE] Failed to fetch caterer badges map:", e);
      }
      
      const formatCatererRecord = (r: any) => {
        const assignedBadges = (badgesMap && badgesMap[r.id]) ? badgesMap[r.id].filter(b => b.is_active) : [];
        const isVerifiedBadge = assignedBadges.some(b => b.slug === 'verified' && b.is_active);
        const isPremiumBadge = assignedBadges.some(b => b.slug === 'premium-partner' && b.is_active);

        return {
          id: r.id,
          name: r.businessName || 'Premium Caterer',
          location: r.address || r.location || 'Hyderabad', 
          type: r.type || 'Veg + Non-Veg',
          startingPrice: Number(r.startingPrice) || 350,
          rating: typeof r.rating === 'number' ? r.rating : 5.0,
          reviewCount: typeof r.reviewCount === 'number' ? r.reviewCount : 0,
          description: r.description || 'Welcome to our premium catering service.',
          images: getCatererImagesFallback(r.businessName || 'Premium Caterer', r.galleryPhotos || r.gallery || r.images || []),
          logo: r.logo || null,
          coverBanner: r.coverBanner || null,
          address: r.address || 'Hyderabad, Telangana',
          phone: r.phone || '+91 00000 00000',
          isVerified: isVerifiedBadge || r.isVerified || false,
          isPremium: isPremiumBadge || r.isPremium || false,
          fssaiCertified: Boolean(r.fssaiNumber || r.fssaiFile || r.fssai || r.fssaiCertified || isVerifiedBadge || r.isVerified),
          years: r.experience ? `${r.experience}+ Years` : r.years || '5+ Years',
          minimumGuests: Number(r.minimumGuests) || 50,
          badges: assignedBadges,
          latitude: r.latitude ? Number(r.latitude) : null,
          longitude: r.longitude ? Number(r.longitude) : null,
          serviceRadiusKm: r.serviceRadiusKm ? Number(r.serviceRadiusKm) : 15,
          createdAt: r.created_at || r.createdAt || new Date(0).toISOString(),
          updatedAt: r.updated_at || r.updatedAt || new Date(0).toISOString(),
        };
      };

      let isSupabaseAuthoritative = false;

      if (supabase) {
        try {
          // Query only explicitly approved records from Supabase
          const { data, error } = await supabase
            .from('caterer_registrations')
            .select('*')
            .or('status.eq.Approved,status.eq.approved')
            .order('created_at', { ascending: false });
          
          if (!error && Array.isArray(data)) {
            isSupabaseAuthoritative = true;
            allCaterers = data.map((r: any) => formatCatererRecord(r));

            // Synchronize localStorage cache with Supabase: purge any deleted/trashed/stale approved records
            try {
              const rawLocal = localStorage.getItem('registrations');
              if (rawLocal) {
                const localList = JSON.parse(rawLocal);
                if (Array.isArray(localList)) {
                  const remoteApprovedIds = new Set(data.map((r: any) => r.id));
                  const sanitizedLocal = localList.filter((r: any) => {
                    if (!r || !r.id) return false;
                    const st = (r.status || '').toLowerCase().trim();
                    // Permanently drop trashed, rejected, hidden, suspended, or deleted records
                    if (st === 'trashed' || st === 'suspended' || st === 'hidden' || st === 'rejected' || r.deleted === true || r.is_deleted === true) {
                      return false;
                    }
                    // For records claiming to be approved, verify they exist in remote approved records
                    if (st === 'approved') {
                      return remoteApprovedIds.has(r.id);
                    }
                    return true;
                  });
                  safeSaveRegistrations(sanitizedLocal);
                }
              }
            } catch (cacheErr) {
              console.warn("[EXPLORE] Failed to sanitize local storage cache:", cacheErr);
            }
          }
        } catch (e) {
          console.error("[EXPLORE] Failed to fetch from Supabase:", e);
        }
      }

      // Offline fallback ONLY: If Supabase connection is unavailable or returned an error,
      // load strictly approved records from localStorage without resurrecting trashed/deleted items.
      if (!isSupabaseAuthoritative) {
        const raw = localStorage.getItem('registrations');
        if (raw) {
          try {
            const allRegs = JSON.parse(raw);
            if (Array.isArray(allRegs)) {
              const approved = allRegs.filter((r: any) => {
                if (!r || !r.id) return false;
                const st = (r.status || '').toLowerCase().trim();
                // Must be explicitly approved
                if (st !== 'approved') return false;
                // Exclude any deleted, trashed, hidden, suspended, or rejected
                if (st === 'trashed' || st === 'hidden' || st === 'suspended' || st === 'rejected' || r.deleted === true || r.is_deleted === true) {
                  return false;
                }
                return true;
              });
              allCaterers = approved.map((r: any) => formatCatererRecord(r));
            }
          } catch (e) {
            console.error("[EXPLORE] Failed parsing local registrations:", e);
          }
        }
      }

      // Sort newest approved/registered caterers first using actual timestamp field
      allCaterers.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setCaterers(allCaterers);
    };

    fetchCaterersData();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...caterers];

    // Compute distances if customer location is set
    if (customerLat !== null && customerLng !== null) {
      result = result.map(c => {
        if (c.latitude !== null && c.longitude !== null) {
          const dist = calculateDistanceKm(customerLat, customerLng, c.latitude, c.longitude);
          const time = estimateDrivingTimeMinutes(dist);
          return { ...c, distanceKm: dist, drivingTimeMins: time };
        }
        return { ...c, distanceKm: null, drivingTimeMins: null };
      });

      // Filter: Show caterers whose service radius includes the customer's location
      result = result.filter(c => c.distanceKm === null || c.distanceKm <= (c.serviceRadiusKm || 15));
    }

    // Food Type Preference (Veg / Non-Veg only)
    if (cuisineFilter === 'Veg') {
      result = result.filter(c => c.type?.toLowerCase() === 'veg' || c.type?.toLowerCase().includes('pure veg'));
    } else if (cuisineFilter === 'Non-Veg') {
      result = result.filter(c => c.type?.toLowerCase().includes('non-veg') || c.type?.toLowerCase().includes('both') || c.type?.toLowerCase().includes('+'));
    }

    // Occasion Filters
    if (occasionFilter.length > 0) {
      result = result.filter(c => {
        const desc = (c.description || '').toLowerCase();
        const name = (c.name || '').toLowerCase();
        return occasionFilter.some(occ => desc.includes(occ.toLowerCase()) || name.includes(occ.toLowerCase()) || occ.toLowerCase() === 'wedding');
      });
    }

    // Budget range Filter
    result = result.filter(c => (c.startingPrice || 300) <= budgetFilter);

    // Live Counters toggle
    if (isLiveCounters) {
      result = result.filter(c => (c.description || '').toLowerCase().includes('live') || c.name.toLowerCase().includes('elite') || c.name.toLowerCase().includes('spice'));
    }

    // Rating filter
    if (ratingFilter > 0) {
      result = result.filter(c => (c.rating || 5) >= ratingFilter);
    }

    // Search keyword pre-filter if typed in search panel
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw) || c.location.toLowerCase().includes(kw));
    }

    // Sort options
    if (sortOption === 'Price: Low to High') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortOption === 'Price: High to Low') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortOption === 'Newest First') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortOption === 'Highest Rated') {
      result.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else if (sortOption === 'Popularity') {
      // Sort newest approved/registered caterers first using actual timestamp field, breaking ties by rating
      result.sort((a, b) => {
        const timeDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        if (timeDiff !== 0) return timeDiff;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else if (sortOption === 'Nearest First' || sortOption === 'Lowest Delivery Distance') {
      result.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortOption === 'Fastest Arrival') {
      result.sort((a, b) => {
        if (a.drivingTimeMins === null && b.drivingTimeMins === null) return 0;
        if (a.drivingTimeMins === null) return 1;
        if (b.drivingTimeMins === null) return -1;
        return a.drivingTimeMins - b.drivingTimeMins;
      });
    } else if (sortOption === 'Highest Rated Nearby') {
      result.sort((a, b) => {
        const aInRadius = a.distanceKm !== null && a.distanceKm <= (a.serviceRadiusKm || 15);
        const bInRadius = b.distanceKm !== null && b.distanceKm <= (b.serviceRadiusKm || 15);
        if (aInRadius && !bInRadius) return -1;
        if (!aInRadius && bInRadius) return 1;
        return b.rating - a.rating;
      });
    }

    setFilteredCaterers(result);
  }, [caterers, cuisineFilter, occasionFilter, budgetFilter, isLiveCounters, ratingFilter, sortOption, searchKeyword, customerLat, customerLng]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For Explore page, search can be handled inline directly by updating filter keyword
    if (searchKeyword) {
      setSearchKeyword(searchKeyword);
    } else if (searchOccasion) {
      setSearchKeyword(searchOccasion);
    }
    const el = document.getElementById('explore-marketplace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if viewport is mobile (< 768px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleClearAll = () => {
    clearAllFilters();
    setSearchOccasion('');
    setSearchGuests('');
    setSearchBudget('');
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeOrderTypeValue = isLiveCounters ? 'Live Buffet' : (occasionFilter[0] || '');

  const hasActiveFilters =
    occasionFilter.length > 0 ||
    guestsFilter.length > 0 ||
    budgetFilter < 1000 ||
    isLiveCounters ||
    ratingFilter > 0 ||
    cuisineFilter !== '' ||
    (searchKeyword && searchKeyword.trim() !== '');

  const activeFilterCount =
    Number(occasionFilter.length > 0) +
    Number(guestsFilter.length > 0) +
    Number(budgetFilter < 1000) +
    Number(isLiveCounters) +
    Number(ratingFilter > 0) +
    Number(cuisineFilter !== '') +
    Number(Boolean(searchKeyword && searchKeyword.trim() !== ''));

  const displayedLocation =
    !searchLocation || searchLocation === 'Hyderabad'
      ? 'Hyderabad, Telangana, India'
      : searchLocation;

  const isCustomSearchKeyword =
    Boolean(searchKeyword && searchKeyword.trim() !== '') &&
    !CUISINES.some((c) => c.name === searchKeyword);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] font-sans pt-14 sm:pt-[60px] overflow-x-hidden">
      {/* 1. Top Explore Caterers Hero Banner */}
      <div
        className="relative w-full pt-5 pb-12 sm:pt-6 sm:pb-14 md:pt-7 md:pb-16 overflow-hidden text-center select-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 95% at 50% 28%, #074C37 0%, #022C20 55%, #011B13 100%)',
        }}
      >
        {/* Subtle Flowing Emerald Silk Wave Accents */}
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          className="pointer-events-none select-none absolute inset-0 w-full h-full opacity-35"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="silkWaveLeft" x1="0" y1="0" x2="720" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#197555" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#022C20" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="silkWaveRight" x1="1440" y1="0" x2="720" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#197555" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#022C20" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 0 Q 320 120 620 240 L 0 240 Z" fill="url(#silkWaveLeft)" />
          <path d="M 1440 0 Q 1120 120 820 240 L 1440 240 Z" fill="url(#silkWaveRight)" />
          <path d="M 0 90 C 260 20 520 175 840 125 C 1100 85 1290 30 1440 75" stroke="#228662" strokeOpacity="0.35" strokeWidth="1.5" />
          <path d="M 0 135 C 310 65 590 190 920 145 C 1150 112 1320 65 1440 110" stroke="#1E7B5A" strokeOpacity="0.25" strokeWidth="1" />
        </svg>

        {/* Top-Left Ornate Gold Lotus Mandala */}
        <svg
          viewBox="0 0 220 140"
          className="pointer-events-none select-none absolute -top-2 left-[3%] sm:left-[6%] w-32 sm:w-44 h-auto text-[#E2B246]/35"
          fill="none"
          aria-hidden="true"
        >
          <g transform="translate(110, 10)">
            {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
              <path
                key={deg}
                d="M 0 0 C 12 24 12 52 0 76 C -12 52 -12 24 0 0 Z"
                transform={`rotate(${deg - 90})`}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
            {[15, 45, 75, 105, 135, 165].map((deg) => (
              <path
                key={deg}
                d="M 0 0 C 16 32 18 68 0 102 C -18 68 -16 32 0 0 Z"
                transform={`rotate(${deg - 90})`}
                stroke="currentColor"
                strokeWidth="0.9"
              />
            ))}
            <circle cx="0" cy="0" r="46" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="82" stroke="currentColor" strokeWidth="0.8" />
          </g>
        </svg>

        {/* Top-Right Ornate Gold Lotus Mandala */}
        <svg
          viewBox="0 0 220 140"
          className="pointer-events-none select-none absolute -top-2 right-[3%] sm:right-[6%] w-32 sm:w-44 h-auto text-[#E2B246]/35"
          fill="none"
          aria-hidden="true"
        >
          <g transform="translate(110, 10)">
            {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
              <path
                key={deg}
                d="M 0 0 C 12 24 12 52 0 76 C -12 52 -12 24 0 0 Z"
                transform={`rotate(${deg - 90})`}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
            {[15, 45, 75, 105, 135, 165].map((deg) => (
              <path
                key={deg}
                d="M 0 0 C 16 32 18 68 0 102 C -18 68 -16 32 0 0 Z"
                transform={`rotate(${deg - 90})`}
                stroke="currentColor"
                strokeWidth="0.9"
              />
            ))}
            <circle cx="0" cy="0" r="46" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="82" stroke="currentColor" strokeWidth="0.8" />
          </g>
        </svg>

        {/* Centered Hero Heading, Top & Bottom Lotus Ornaments & Subtitle */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center">
          {/* Top Lotus Emblem with Gold Flanking Lines */}
          <div className="flex items-center justify-center gap-3 mb-1 w-48 sm:w-56">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#F2C95E]" />
            <svg width="26" height="20" viewBox="0 0 36 28" fill="none" className="text-[#F5CC58] shrink-0" aria-hidden="true">
              <path d="M18 2 C21 9 21 16 18 22 C15 16 15 9 18 2 Z" fill="currentColor" />
              <path d="M18 22 C11 19 8 12 10 6 C14 9 16 15 18 22 Z" fill="#E6AE2B" />
              <path d="M18 22 C25 19 28 12 26 6 C22 9 20 15 18 22 Z" fill="#E6AE2B" />
              <path d="M18 22 C9 22 4 17 4 11 C9 13 13 17 18 22 Z" fill="#C98A15" />
              <path d="M18 22 C27 22 32 17 32 11 C27 13 23 17 18 22 Z" fill="#C98A15" />
              <circle cx="5" cy="18" r="1.4" fill="#F8DB7E" />
              <circle cx="31" cy="18" r="1.4" fill="#F8DB7E" />
            </svg>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#F2C95E]" />
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-[42px] font-display font-bold tracking-tight leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Explore{' '}
            <span className="bg-gradient-to-b from-[#FCE68A] via-[#F2C344] to-[#C88A16] bg-clip-text text-transparent">
              Caterers
            </span>
          </h1>

          <p className="text-[#ECF3EE]/90 text-xs sm:text-[13.5px] max-w-lg mx-auto font-sans font-medium leading-relaxed mt-1.5">
            Discover verified caterers, compare customizable packages, and filter menus for your special occasion.
          </p>

          {/* Bottom Lotus Emblem with Gold Flanking Lines */}
          <div className="flex items-center justify-center gap-3 mt-2.5 w-48 sm:w-56">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#F2C95E]" />
            <svg width="26" height="20" viewBox="0 0 36 28" fill="none" className="text-[#F5CC58] shrink-0" aria-hidden="true">
              <path d="M18 2 C21 9 21 16 18 22 C15 16 15 9 18 2 Z" fill="currentColor" />
              <path d="M18 22 C11 19 8 12 10 6 C14 9 16 15 18 22 Z" fill="#E6AE2B" />
              <path d="M18 22 C25 19 28 12 26 6 C22 9 20 15 18 22 Z" fill="#E6AE2B" />
              <path d="M18 22 C9 22 4 17 4 11 C9 13 13 17 18 22 Z" fill="#C98A15" />
              <path d="M18 22 C27 22 32 17 32 11 C27 13 23 17 18 22 Z" fill="#C98A15" />
              <circle cx="5" cy="18" r="1.4" fill="#F8DB7E" />
              <circle cx="31" cy="18" r="1.4" fill="#F8DB7E" />
            </svg>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#F2C95E]" />
          </div>
        </div>

        {/* Signature Sweeping Curved Gold Arch Divider into Warm Ivory Background */}
        <svg
          viewBox="0 0 1440 68"
          preserveAspectRatio="none"
          className="pointer-events-none select-none absolute inset-x-0 bottom-0 w-full h-10 sm:h-12 md:h-14 z-10"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroGoldArchStroke" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A96E0B" />
              <stop offset="16%" stopColor="#FCE07A" />
              <stop offset="32%" stopColor="#D79A1E" />
              <stop offset="50%" stopColor="#F8D86A" />
              <stop offset="68%" stopColor="#D79A1E" />
              <stop offset="84%" stopColor="#FCE07A" />
              <stop offset="100%" stopColor="#A96E0B" />
            </linearGradient>
          </defs>
          {/* Creamy Ivory Wave Cutout at Bottom */}
          <path
            d="M 0 36 Q 160 -2 390 24 Q 720 64 1050 24 Q 1280 -2 1440 36 L 1440 68 L 0 68 Z"
            fill="#FBF4E4"
          />
          {/* Rich Metallic Gold Arch Ribbon */}
          <path
            d="M 0 36 Q 160 -2 390 24 Q 720 64 1050 24 Q 1280 -2 1440 36 Q 1280 7 1050 31 Q 720 67 390 31 Q 160 7 0 36 Z"
            fill="url(#heroGoldArchStroke)"
          />
          {/* Fine Bright Highlight Rim */}
          <path
            d="M 0 34 Q 160 -3 390 23 Q 720 63 1050 23 Q 1280 -3 1440 34"
            stroke="#FFF2B2"
            strokeOpacity="0.85"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* 2. Main Explore Marketplace Section */}
      <section id="explore-marketplace" className="pt-2 pb-6 sm:pb-8">
        <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Heading + Location + Count Badge + Sort Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="text-left">
              <h2
                className="text-2xl sm:text-[27px] font-display font-bold text-[#111C17] tracking-tight leading-snug"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Explore{' '}
                <span className="bg-gradient-to-b from-[#DF9E20] to-[#B6760B] bg-clip-text text-transparent">
                  Premium
                </span>{' '}
                Caterers
              </h2>
              <button
                type="button"
                onClick={() => setIsExploreMapOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#23334C] hover:text-[#024731] mt-0.5 transition-colors cursor-pointer text-left"
                title="Change event location"
              >
                <MapPin size={14} className="text-[#D4961B] fill-[#F7CD5B]/35 shrink-0" />
                <span className="truncate max-w-[260px] sm:max-w-md">{displayedLocation}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 justify-between md:justify-end">
              {/* Count Badge matching reference gold pill */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-b from-[#FDEEB9] to-[#F4D57A] border border-[#DEAE3E] text-[#111C17] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-[0_2px_8px_rgba(182,126,20,0.16)] tabular-nums whitespace-nowrap">
                <span className="w-5 h-5 rounded-full bg-gradient-to-b from-[#DDA025] to-[#B97B12] text-[#FFFDF8] flex items-center justify-center shrink-0">
                  <Utensils size={10} strokeWidth={2.5} />
                </span>
                <span>
                  {filteredCaterers.length} {filteredCaterers.length === 1 ? 'Caterer' : 'Caterers'} Found
                </span>
              </div>

              <div className="hidden sm:block w-px h-5 bg-[#DFCFA9]" />

              {/* Top Sort Control */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111C17] whitespace-nowrap">Sort by:</span>
                <div className="relative flex items-center">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-[#FFFDF8] border border-[#DFD0AC] hover:border-[#D4961B] rounded-full px-4 py-1.5 pr-8 text-xs font-semibold text-[#111C17] focus:outline-none focus:border-[#D4961B] cursor-pointer shadow-2xs transition-colors min-w-[144px]"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Highest Rated">Rating: High to Low</option>
                    <option value="Newest First">Newest First</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    {customerLat !== null && customerLng !== null && (
                      <>
                        <option value="Nearest First">Nearest First</option>
                        <option value="Lowest Delivery Distance">Lowest Delivery Distance</option>
                        <option value="Highest Rated Nearby">Highest Rated Nearby</option>
                        <option value="Fastest Arrival">Fastest Arrival</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#C2851A] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Filter Trigger Row (< md) */}
          <div className="flex md:hidden items-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex-1 py-2.5 px-4 bg-gradient-to-b from-[#065239] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/45 rounded-full font-bold text-xs tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter size={14} className="text-[#F3C144]" />
              <span>Filter Caterers</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#F3C144] text-[#0F241C] rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExploreMapOpen(true)}
              className="py-2.5 px-3.5 bg-[#FFFDF8] border border-[#DFC78A] text-[#111C17] rounded-full font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <MapPin size={14} className="text-[#D4961B]" />
              <span>Area</span>
            </button>
          </div>

          {/* Desktop/Tablet 5-Column Horizontal Filter Card Bar */}
          <div className="hidden md:block bg-[#FFFDF8] rounded-[22px] border border-[#DFC78A] shadow-[0_8px_24px_rgba(140,105,32,0.08)] px-5 py-4 mb-5">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {/* 1. Order Type */}
              <div className="flex flex-col text-left">
                <label className="text-[11.5px] font-bold text-[#111C17] mb-1.5">Order Type</label>
                <div className="relative flex items-center">
                  <Utensils size={14} className="absolute left-3.5 text-[#D4961B] pointer-events-none" />
                  <select
                    value={activeOrderTypeValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIsLiveCounters(false);
                        setOccasionFilter([]);
                      } else if (val === 'Live Buffet') {
                        setIsLiveCounters(true);
                        setOccasionFilter([]);
                      } else {
                        setIsLiveCounters(false);
                        setOccasionFilter([val]);
                      }
                    }}
                    className="w-full appearance-none bg-[#FFFDF9] border border-[#2D614D] hover:border-[#024731] focus:border-[#D4961B] rounded-full pl-9 pr-8 py-2 text-xs font-semibold text-[#111C17] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="">All Service Styles</option>
                    <option value="Live Buffet">Live Buffet</option>
                    {['Wedding', 'Reception', 'Birthday Party', 'Corporate Events', 'House Warming', 'Engagement', 'Baby Shower', 'Festival'].map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#111C17] pointer-events-none" />
                </div>
                <p className="text-[10.5px] text-[#5C5446] mt-1.5 leading-snug">
                  Shows packages for this service style.
                </p>
              </div>

              {/* 2. Guest Count */}
              <div className="flex flex-col text-left">
                <label className="text-[11.5px] font-bold text-[#111C17] mb-1.5">Guest Count</label>
                <div className="relative flex items-center">
                  <Users size={14} className="absolute left-3.5 text-[#D4961B] pointer-events-none" />
                  <select
                    value={guestsFilter[0] || ''}
                    onChange={(e) => {
                      if (e.target.value) setGuestsFilter([e.target.value]);
                      else setGuestsFilter([]);
                    }}
                    className="w-full appearance-none bg-[#FFFDF9] border border-[#2D614D] hover:border-[#024731] focus:border-[#D4961B] rounded-full pl-9 pr-8 py-2 text-xs font-semibold text-[#111C17] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="">All Guests</option>
                    <option value="Upto 50">Upto 50 People</option>
                    <option value="50 - 105">50 - 105 People</option>
                    <option value="100 - 200">100 - 200 People</option>
                    <option value="200 - 500">200+ People</option>
                    <option value="500 - 1000">500 - 1000 People</option>
                    <option value="1000+">1000+ People</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#111C17] pointer-events-none" />
                </div>
                <p className="text-[10.5px] text-[#5C5446] mt-1.5 leading-snug">
                  Shows caterers offering a package for this group size.
                </p>
              </div>

              {/* 3. Cuisine */}
              <div className="flex flex-col text-left">
                <label className="text-[11.5px] font-bold text-[#111C17] mb-1.5">Cuisine</label>
                <div className="relative flex items-center">
                  <ChefHat size={14} className="absolute left-3.5 text-[#D4961B] pointer-events-none" />
                  <select
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full appearance-none bg-[#FFFDF9] border border-[#2D614D] hover:border-[#024731] focus:border-[#D4961B] rounded-full pl-9 pr-8 py-2 text-xs font-semibold text-[#111C17] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="">All Cuisines</option>
                    {isCustomSearchKeyword && (
                      <option value={searchKeyword}>{searchKeyword}</option>
                    )}
                    {CUISINES.map((cui) => (
                      <option key={cui.name} value={cui.name}>{cui.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#111C17] pointer-events-none" />
                </div>
              </div>

              {/* 4. Food Preference */}
              <div className="flex flex-col text-left">
                <label className="text-[11.5px] font-bold text-[#111C17] mb-1.5">Food Preference</label>
                <div className="relative flex items-center">
                  <Leaf size={14} className="absolute left-3.5 text-[#1F7A3E] pointer-events-none" />
                  <select
                    value={cuisineFilter}
                    onChange={(e) => setCuisineFilter(e.target.value)}
                    className="w-full appearance-none bg-[#FFFDF9] border border-[#2D614D] hover:border-[#024731] focus:border-[#D4961B] rounded-full pl-9 pr-8 py-2 text-xs font-semibold text-[#111C17] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="">Veg &amp; Non-Veg</option>
                    <option value="Veg">Veg Only</option>
                    <option value="Non-Veg">Non-Veg &amp; Both</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#111C17] pointer-events-none" />
                </div>
              </div>

              {/* 5. Sort By */}
              <div className="flex flex-col text-left">
                <label className="text-[11.5px] font-bold text-[#111C17] mb-1.5">Sort By</label>
                <div className="relative flex items-center">
                  <Star size={14} className="absolute left-3.5 text-[#D4961B] fill-[#D4961B] pointer-events-none" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full appearance-none bg-[#FFFDF9] border border-[#2D614D] hover:border-[#024731] focus:border-[#D4961B] rounded-full pl-9 pr-8 py-2 text-xs font-semibold text-[#111C17] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Highest Rated">Rating: High to Low</option>
                    <option value="Newest First">Newest First</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    {customerLat !== null && customerLng !== null && (
                      <>
                        <option value="Nearest First">Nearest First</option>
                        <option value="Lowest Delivery Distance">Lowest Delivery Distance</option>
                        <option value="Highest Rated Nearby">Highest Rated Nearby</option>
                        <option value="Fastest Arrival">Fastest Arrival</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 text-[#111C17] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary Strip (only shown when filters are applied) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold text-[#4A3B22]">
              <span className="text-[11px] font-bold text-[#6F6554] mr-1">Active Filters:</span>
              {cuisineFilter && (
                <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5">
                  {cuisineFilter}
                  <button type="button" onClick={() => setCuisineFilter('')} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {occasionFilter.map((occ) => (
                <span key={occ} className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5">
                  {occ}
                  <button type="button" onClick={() => toggleOccasionFilter(occ)} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {guestsFilter.map((gst) => (
                <span key={gst} className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5">
                  Guests: {gst}
                  <button type="button" onClick={() => setGuestsFilter([])} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {searchKeyword && (
                <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5">
                  Cuisine / Search: {searchKeyword}
                  <button type="button" onClick={() => setSearchKeyword('')} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {budgetFilter < 1000 && (
                <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5 tabular-nums">
                  Budget ≤ ₹{budgetFilter}
                  <button type="button" onClick={() => setBudgetFilter(1000)} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {isLiveCounters && (
                <span className="px-2.5 py-1 bg-[#FDF2D6] border border-[#E4C987] text-[#6B4A10] rounded-lg inline-flex items-center gap-1.5">
                  Live Buffet
                  <button type="button" onClick={() => setIsLiveCounters(false)} className="text-[#6B4A10]/70 hover:text-[#6B4A10] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              {ratingFilter > 0 && (
                <span className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D4B3] text-[#17281F] rounded-lg inline-flex items-center gap-1.5 tabular-nums">
                  {ratingFilter}+ Rating
                  <button type="button" onClick={() => setRatingFilter(0)} className="text-[#7A705F] hover:text-[#0F241C] cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-[#B9382C] hover:underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* 3. Caterer Listing Cards */}
          <div className="space-y-4 pb-8">
            {filteredCaterers.length === 0 ? (
              <div className="bg-[#FFFDF8] rounded-2xl p-10 text-center border border-[#E5D3A7] max-w-md mx-auto shadow-sm">
                <ChefHat className="text-[#D4961B] w-11 h-11 mx-auto mb-3" />
                <h3 className="text-base font-display font-bold text-[#0F241C] mb-1">
                  No matching caterers found
                </h3>
                <p className="text-[#6F6554] text-xs leading-relaxed">
                  Try adjusting your filters or clearing active search criteria.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-[#033A27] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/45 font-bold text-xs rounded-xl hover:from-[#044A32] hover:to-[#022E20] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredCaterers.map((caterer) => {
                const isFav = Boolean(favoriteIds[caterer.id]);
                const photoCount = Math.max(1, caterer.images?.length || 1);
                const showVeg =
                  !caterer.type ||
                  caterer.type.toLowerCase().includes('veg') ||
                  caterer.type.toLowerCase().includes('both');
                const showNonVeg =
                  !caterer.type ||
                  caterer.type.toLowerCase().includes('non') ||
                  caterer.type.toLowerCase().includes('both') ||
                  caterer.type.toLowerCase().includes('+');

                return (
                  <div
                    key={caterer.id}
                    className="bg-[#FFFDF8] rounded-[24px] border border-[#DFC78A] hover:border-[#C89323] shadow-[0_8px_26px_rgba(140,105,32,0.09)] hover:shadow-[0_12px_32px_rgba(140,105,32,0.14)] transition-all duration-200 p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch gap-4 sm:gap-5 relative"
                  >
                    {/* Left Image Column — Preserving existing CardImageSlider & image URLs/sources 100% */}
                    <div className="relative w-full md:w-[270px] lg:w-[290px] h-[190px] md:h-[176px] shrink-0 rounded-2xl overflow-hidden bg-[#0A251B] border border-[#DFC78A]/60">
                      <CardImageSlider images={caterer.images} name={caterer.name} />

                      {/* Top-Right Heart / Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(caterer.id);
                        }}
                        aria-label="Favorite caterer"
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-sm z-10 cursor-pointer transition-transform active:scale-95"
                      >
                        <Heart
                          size={15}
                          className={cn(
                            'transition-all duration-150',
                            isFav ? 'text-[#C62828] fill-[#C62828] scale-110' : 'text-[#9B1C1C]'
                          )}
                        />
                      </button>

                      {/* Bottom-Right Photo Count Chip */}
                      <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10 pointer-events-none">
                        <ImageIcon size={12} className="text-[#F5CC58]" />
                        <span className="tabular-nums">
                          {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-left">
                      <div>
                        {/* Title + Verified Check */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            onClick={() => navigate(`/caterer/${caterer.id}?tab=menu`)}
                            className="text-xl sm:text-[22px] font-display font-bold text-[#111C17] hover:text-[#024731] tracking-tight leading-tight cursor-pointer transition-colors"
                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                          >
                            {caterer.name}
                          </h3>
                          <BadgeCheck size={18} className="text-[#2563EB] fill-[#2563EB] [&>path:last-child]:stroke-white shrink-0" />
                        </div>

                        {/* Rating + Location + Distance */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs mb-2.5">
                          <span className="inline-flex items-center gap-1 font-bold text-[#111C17] tabular-nums">
                            <Star size={13} className="text-[#E0A11E] fill-[#E0A11E]" />
                            <span>{Number(caterer.rating).toFixed(1)}</span>
                            <span className="text-[#162C5B] font-medium">
                              ({caterer.reviewCount.toLocaleString()} {caterer.reviewCount === 1 ? 'Review' : 'Reviews'})
                            </span>
                          </span>
                          <span className="text-[#DFD0AA] hidden sm:inline">|</span>
                          <span className="inline-flex items-center gap-1 text-[#162C5B] font-medium min-w-0">
                            <MapPin size={13} className="text-[#D4961B] shrink-0" />
                            <span className="truncate max-w-[260px] sm:max-w-[380px]">{caterer.location}</span>
                          </span>
                          {caterer.distanceKm !== undefined && caterer.distanceKm !== null && (
                            <span className="text-[#8B5D08] bg-[#FAECC8]/80 border border-[#E5C983] px-2 py-0.5 rounded-md font-semibold text-[10.5px] tabular-nums">
                              {caterer.distanceKm.toFixed(1)} km · {caterer.drivingTimeMins} min
                            </span>
                          )}
                        </div>

                        {/* Dietary & Live Counters Badges matching reference */}
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          {showVeg && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#CBEED6] text-[#115029]">
                              <Leaf size={12} className="text-[#1F7A3E]" />
                              <span>Veg</span>
                            </span>
                          )}
                          {showNonVeg && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#FAD1D1] text-[#841D1D]">
                              <Flame size={12} className="text-[#B92B2B]" />
                              <span>Non-Veg</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#FCE494] text-[#4E3507]">
                            <ChefHat size={12} className="text-[#B87D16]" />
                            <span>Live Counters</span>
                          </span>
                        </div>

                        {/* Experience & Events Metrics */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#111C17] mb-2">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#D4961B]" />
                            <strong className="font-bold tabular-nums">800+</strong>
                            <span className="text-[#162C5B]">Events</span>
                          </span>
                          <span className="text-[#DFD0AA]">|</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Trophy size={13} className="text-[#D4961B]" />
                            <strong className="font-bold tabular-nums">{caterer.years || '5+ Years'}</strong>
                            <span className="text-[#162C5B]">Experience</span>
                          </span>
                        </div>
                      </div>

                      {/* Speciality Line */}
                      <p className="text-xs leading-snug">
                        <span className="font-bold text-[#024731] mr-1.5">Speciality:</span>
                        <span className="text-[#162C5B] font-medium">Hyderabadi, North Indian, Chinese</span>
                      </p>
                    </div>

                    {/* Right Price & Action Column */}
                    <div className="w-full md:w-[225px] lg:w-[245px] shrink-0 border-t md:border-t-0 md:border-l border-[#E7D8B6] pt-3 md:pt-0 md:pl-5 flex flex-row md:flex-col items-center justify-between md:justify-center text-left md:text-center gap-3">
                      <div className="flex flex-col md:items-center">
                        <span className="inline-block bg-gradient-to-r from-[#F9DFCA]/55 via-[#F4C7A2]/85 to-[#F9DFCA]/55 px-4 py-0.5 text-[11px] font-bold text-[#1A1A1A] rounded-sm mb-1.5">
                          Starting From
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-sans font-extrabold text-[28px] sm:text-[32px] text-[#111C17] tracking-tight tabular-nums leading-none">
                            ₹{caterer.startingPrice}
                          </span>
                          <span className="text-xs sm:text-[13px] font-semibold text-[#111C17]">/ plate</span>
                        </div>
                        <span className="text-[11.5px] font-bold text-[#162C5B] mt-1 tabular-nums">
                          Min. {caterer.minimumGuests || 50} Plates
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/caterer/${caterer.id}?tab=menu`)}
                        className="bg-gradient-to-b from-[#065239] via-[#023A27] to-[#012217] hover:from-[#076143] hover:to-[#022C1E] border border-[#D4961B]/45 text-[#FFFDF8] font-bold text-xs sm:text-[13.5px] px-6 py-2.5 rounded-full shadow-[0_6px_16px_rgba(2,58,39,0.28)] inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap w-auto md:w-full"
                      >
                        <Utensils size={14} className="text-[#F5CC58]" />
                        <span>View Menu</span>
                        <ArrowRight size={14} className="text-[#F5CC58]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filters Bottom Sheet / Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t-2 border-[#D4961B] rounded-t-[28px] max-h-[85vh] overflow-y-auto z-50 p-5 shadow-2xl flex flex-col text-left"
            >
              <div className="w-12 h-1 bg-[#E2D4B3] rounded-full mx-auto mb-4 shrink-0" />

              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3
                  className="text-lg font-bold text-[#0F241C]"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  Filter <span className="text-[#D4961B]">Caterers</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF3E3] border border-[#E5D3A7] flex items-center justify-center text-[#4A3B22] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5 flex-1 overflow-y-auto pb-5 pr-1">
                {/* Order Type / Occasion */}
                <div>
                  <label className="text-xs font-bold text-[#17281F] block mb-1.5">Order Type / Occasion</label>
                  <select
                    value={activeOrderTypeValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIsLiveCounters(false);
                        setOccasionFilter([]);
                      } else if (val === 'Live Buffet') {
                        setIsLiveCounters(true);
                        setOccasionFilter([]);
                      } else {
                        setIsLiveCounters(false);
                        setOccasionFilter([val]);
                      }
                    }}
                    className="w-full bg-[#FFFDF8] border border-[#E2D4B3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17281F]"
                  >
                    <option value="">All Service Styles</option>
                    <option value="Live Buffet">Live Buffet</option>
                    {['Wedding', 'Reception', 'Birthday Party', 'Corporate Events', 'House Warming', 'Engagement', 'Baby Shower', 'Festival'].map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="text-xs font-bold text-[#17281F] block mb-1.5">Guest Count</label>
                  <select
                    value={guestsFilter[0] || ''}
                    onChange={(e) => setGuestsFilter(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-[#FFFDF8] border border-[#E2D4B3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17281F]"
                  >
                    <option value="">All Guests</option>
                    <option value="Upto 50">Upto 50 People</option>
                    <option value="50 - 105">50 - 105 People</option>
                    <option value="100 - 200">100 - 200 People</option>
                    <option value="200 - 500">200+ People</option>
                    <option value="500 - 1000">500 - 1000 People</option>
                    <option value="1000+">1000+ People</option>
                  </select>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="text-xs font-bold text-[#17281F] block mb-1.5">Cuisine</label>
                  <select
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-[#FFFDF8] border border-[#E2D4B3] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#17281F]"
                  >
                    <option value="">All Cuisines</option>
                    {CUISINES.map((cui) => (
                      <option key={cui.name} value={cui.name}>{cui.name}</option>
                    ))}
                  </select>
                </div>

                {/* Food Preference */}
                <div>
                  <label className="text-xs font-bold text-[#17281F] block mb-1.5">Food Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Veg & Non-Veg', val: '' },
                      { label: 'Veg Only', val: 'Veg' },
                      { label: 'Non-Veg & Both', val: 'Non-Veg' },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setCuisineFilter(opt.val)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors',
                          cuisineFilter === opt.val
                            ? 'bg-[#024731] text-[#FFFDF8] border-[#024731]'
                            : 'bg-[#FAF3E3] text-[#17281F] border-[#E2D4B3]'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#17281F]">Max Budget (per plate)</span>
                    <span className="text-xs font-bold text-[#B87D16] tabular-nums">
                      {budgetFilter === 1000 ? 'Any' : `≤ ₹${budgetFilter}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1000"
                    step="50"
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(Number(e.target.value))}
                    className="w-full accent-[#D4961B] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE3C4] flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleClearAll();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-3 border border-[#E2D4B3] text-[#4A3B22] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#033A27] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/45 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Map Picker Modal */}
      <MapPickerModal
        isOpen={isExploreMapOpen}
        onClose={() => setIsExploreMapOpen(false)}
        initialLat={customerLat || 17.3850}
        initialLng={customerLng || 78.4867}
        initialAddress={searchLocation === 'Hyderabad' ? '' : searchLocation}
        onSave={(data) => {
          setSearchLocation(data.address);
          setCustomerLat(data.latitude);
          setCustomerLng(data.longitude);
          if (data.latitude) localStorage.setItem('customer_lat', String(data.latitude));
          if (data.longitude) localStorage.setItem('customer_lng', String(data.longitude));
          if (data.address) localStorage.setItem('customer_address', data.address);
          setIsExploreMapOpen(false);
        }}
        title="Choose Your Event Venue Location"
      />
    </div>
  );
}
