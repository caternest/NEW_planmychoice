import React, { useState, useRef, useEffect } from 'react';
import { 
  Search,
  MapPin,
  Crosshair,
  ChevronDown,
  ArrowRight,
  Handshake,
  Smartphone,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HYDERABAD_AREAS } from '../data';
import heroBannerBg from '../assets/images/hero_banner_wide.jpg';
import partnerHandshakeImg from '../assets/images/partner_handshake_emblem.png';
import partnerAppPhoneImg from '../assets/images/partner_app_phone.png';
import partnerOrnamentImg from '../assets/images/partner_ornament.png';

export default function Home() {
  const navigate = useNavigate();

  // Search & Location States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Hyderabad, Telangana');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close location dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (selectedLocation) {
      const cleanLoc = selectedLocation.replace(', Telangana', '').trim();
      if (cleanLoc && cleanLoc !== 'All Hyderabad') {
        params.set('location', cleanLoc);
      }
    }
    navigate(`/explore?${params.toString()}`);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation('Current Location');
          setIsLocationDropdownOpen(false);
          const params = new URLSearchParams();
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          params.set('lat', position.coords.latitude.toString());
          params.set('lng', position.coords.longitude.toString());
          navigate(`/explore?${params.toString()}`);
        },
        () => {
          setSelectedLocation('Hyderabad, Telangana');
          setIsLocationDropdownOpen(false);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF3E3] font-sans overflow-x-hidden pt-14 sm:pt-[60px]">
      
      {/* 1. LUXURY EMERALD & GOLD CATERING HERO */}
      <section
        className="relative w-full text-center min-h-[250px] sm:min-h-[270px] md:min-h-[285px] lg:min-h-[300px] xl:min-h-[315px] 2xl:min-h-[325px] min-[1680px]:min-h-[350px] py-3.5 sm:py-4 lg:py-5 flex flex-col justify-center select-none bg-[#023728]"
        style={{
          backgroundImage: `url(${heroBannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle Center Dark Emerald Contrast Overlay for Crisp Text Readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 48%, rgba(1, 30, 21, 0.24) 0%, rgba(1, 30, 21, 0.06) 72%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Hero Center Body */}
        <div className="relative z-20 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          {/* Top Golden Catering Cloche Crest with Tapered Rules */}
          <div className="flex items-center justify-center gap-2.5 mb-1.5">
            <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#E5B84B]/80 to-[#F8D76A]" />
            <svg viewBox="0 0 56 36" fill="none" className="w-8 sm:w-9 h-[22px] text-[#F8D76A] shrink-0 drop-shadow-[0_2px_6px_rgba(248,215,106,0.35)]" aria-hidden="true">
              <circle cx="24" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.9" />
              <path d="M9 26 C9 17.7157 15.7157 11 24 11 C32.2843 11 39 17.7157 39 26" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              <path d="M4 30 H44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M7 26.5 H41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M44 17 C47 14 45 10 48 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M50 19 C53 16 51 12 54 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent via-[#E5B84B]/80 to-[#F8D76A]" />
          </div>

          {/* Main Prominent Serif Heading */}
          <h1
            className="text-[21px] sm:text-[26px] md:text-[30px] lg:text-[33px] xl:text-[35px] font-display font-bold text-white tracking-tight leading-[1.14] max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] text-center"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            <span className="block text-white md:whitespace-nowrap">Explore All Caterers in One Place.</span>
            <span className="block text-[#F3C54D] mt-0.5 md:whitespace-nowrap">
              Choose the Best for Every Occasion
            </span>
          </h1>

          {/* Ornamental Gold Diamond Flourish Under Heading */}
          <div className="flex items-center justify-center gap-2 my-1.5" aria-hidden="true">
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#D9A323]/70 to-[#F8D76A]" />
            <span className="w-1.5 h-1.5 rotate-45 border border-[#F8D76A] bg-[#D9A323]/60 inline-block" />
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#D9A323]/70 to-[#F8D76A]" />
          </div>

          {/* Supporting Subtitle */}
          <p className="text-[#EFF7F3]/90 text-[11.5px] sm:text-[12.5px] md:text-[13px] max-w-md mx-auto mb-2.5 sm:mb-3.5 leading-snug font-sans font-medium text-center">
            Compare verified caterers, explore menus, and choose packages that make your event special.
          </p>

          {/* Premium Ivory Rounded Search Bar Container */}
          <div className="w-full max-w-xl lg:max-w-[640px] mx-auto relative z-30">
            <div className="bg-[#FFFDF6] rounded-xl md:rounded-full p-1.5 md:p-1 md:pl-4 shadow-[0_14px_34px_rgba(0,0,0,0.4),0_0_0_1px_rgba(248,215,106,0.28)] border border-[#E8C77A] flex flex-col md:flex-row items-stretch md:items-center gap-1.5">

              {/* Search Input for Caterer Name / Cuisine */}
              <div className="flex-1 flex items-center gap-2 px-2 md:px-0 py-1 md:py-0">
                <Search size={16} className="text-[#C8941A] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by caterer name, cuisine, or keyword..."
                  className="w-full bg-transparent text-[#173D30] placeholder-[#5B6D65]/75 text-xs sm:text-[12.5px] font-medium outline-none py-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-[#173D30] p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Vertical Divider for Desktop */}
              <div className="hidden md:block w-px h-5 bg-[#E8C77A]/70 shrink-0 mx-0.5" />

              {/* Location Selector */}
              <div ref={locationDropdownRef} className="relative flex items-center gap-1.5 px-2 md:px-1.5 py-1 md:py-0 border-t md:border-t-0 border-[#E8C77A]/40">
                <MapPin size={15} className="text-[#C8941A] shrink-0" />

                <div
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-1 cursor-pointer select-none text-left min-w-[115px] sm:min-w-[145px]"
                >
                  <span className="text-[11.5px] sm:text-xs font-semibold text-[#173D30] truncate max-w-[140px]">
                    {selectedLocation}
                  </span>
                  <ChevronDown size={13} className="text-[#5B6D65] shrink-0 ml-auto" />
                </div>

                {/* GPS Current Location Target Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  title="Use current location"
                  className="p-1 rounded-full hover:bg-[#FBF3DB] text-[#5B6D65] hover:text-[#C8941A] transition-colors cursor-pointer shrink-0"
                >
                  <Crosshair size={13} />
                </button>

                {/* Location Dropdown Options */}
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 mt-2 w-full md:w-60 bg-[#FFFDF8] rounded-xl shadow-2xl border border-[#E8C77A] py-1.5 z-50 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation('Hyderabad, Telangana');
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#173D30] hover:bg-[#FBF5E4] hover:text-[#B8860B] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>All Hyderabad</span>
                      <span className="text-[10px] text-[#004B35] bg-[#EAF7EC] px-1.5 py-0.5 rounded font-mono font-medium">Default</span>
                    </button>
                    <div className="h-px bg-[#E8C77A]/40 my-1" />
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {HYDERABAD_AREAS.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(`${area.name}, Hyderabad`);
                            setIsLocationDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-[#354B43] hover:bg-[#FBF5E4] hover:text-[#0B1F17] transition-colors truncate cursor-pointer"
                        >
                          {area.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Explore Caterers Button */}
              <button
                type="button"
                onClick={handleSearch}
                className="w-full md:w-auto px-4 sm:px-5 py-2 md:py-1.5 bg-gradient-to-r from-[#FBE082] via-[#E9B52F] to-[#D49617] hover:brightness-105 active:scale-[0.98] text-[#06261C] font-extrabold text-xs sm:text-[12.5px] rounded-lg md:rounded-full tracking-wide transition-all shadow-[0_4px_12px_rgba(217,163,35,0.36)] border border-[#FFF2B2]/75 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Explore Caterers</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* 2. LUXURY EMERALD & GOLD PARTNER PROMOTION & APP DOWNLOAD SECTION */}
      <section className="relative py-3.5 sm:py-4 lg:py-5 px-3 sm:px-5 lg:px-6 bg-[#FDF3E3] overflow-hidden">
        <div className="relative z-10 max-w-5xl xl:max-w-[1040px] mx-auto py-1.5 sm:py-2">
          {/* Top Center Antique-Gold Fleur Ornament */}
          <div className="relative z-20 flex justify-center -mb-[14px] sm:-mb-[16px] pointer-events-none select-none">
            <img
              src={partnerOrnamentImg}
              alt=""
              aria-hidden="true"
              className="w-32 sm:w-40 md:w-44 h-auto object-contain drop-shadow-[0_1px_3px_rgba(138,94,14,0.2)]"
            />
          </div>

          {/* Outer Antique-Gold Double Frame */}
          <div className="relative rounded-xl sm:rounded-2xl border border-[#CF9B29] bg-[#FDF3E3] p-1 sm:p-1.5 shadow-[0_6px_22px_rgba(168,124,36,0.09)]">
            {/* Specular Gold Rim Highlights (Top & Bottom) */}
            <div className="pointer-events-none absolute -top-px left-[8%] w-[26%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E9C15B] to-transparent opacity-80" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-px right-[8%] w-[26%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E9C15B] to-transparent opacity-80" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-px left-[10%] w-[24%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E9C15B] to-transparent opacity-75" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-px right-[10%] w-[24%] h-[1.5px] bg-gradient-to-r from-transparent via-[#E9C15B] to-transparent opacity-75" aria-hidden="true" />

            {/* Four Subtle Gold Corner Accents */}
            <span className="pointer-events-none absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-tl-lg border-t border-l border-[#C9921F]" aria-hidden="true" />
            <span className="pointer-events-none absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-tr-lg border-t border-r border-[#C9921F]" aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-3.5 h-3.5 rounded-bl-lg border-b border-l border-[#C9921F]" aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-br-lg border-b border-r border-[#C9921F]" aria-hidden="true" />

            {/* Inner Hairline Gold Border & Two-Card Grid */}
            <div className="rounded-[10px] sm:rounded-[11px] border border-[#D4A12D]/45 bg-[#FDF3E3] p-2 sm:p-2.5 lg:p-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5">

                {/* Left Card: Become a Catering Partner */}
                <div className="relative rounded-xl border border-[#D49F2A] bg-gradient-to-br from-[#022C20] via-[#012219] to-[#011610] p-3.5 sm:p-4 lg:p-[18px] overflow-hidden shadow-[0_8px_22px_rgba(2,36,24,0.18),inset_0_1px_0_rgba(248,215,106,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 min-h-[175px] sm:min-h-[185px] lg:min-h-[195px] group">
                  {/* Golden Spotlight & Subtle Wave Backdrop Behind Illustration */}
                  <div
                    className="pointer-events-none absolute right-[-20px] top-[-20px] w-56 h-56 rounded-full opacity-55"
                    style={{
                      background:
                        'radial-gradient(circle at 60% 65%, rgba(233, 181, 47, 0.22) 0%, rgba(16, 102, 72, 0.14) 45%, transparent 74%)',
                    }}
                    aria-hidden="true"
                  />
                  <svg
                    viewBox="0 0 360 120"
                    fill="none"
                    className="pointer-events-none absolute right-0 top-0 w-56 sm:w-64 h-auto opacity-35"
                    aria-hidden="true"
                  >
                    <path
                      d="M40 0 C110 70 215 95 360 35 L360 0 Z"
                      fill="url(#partnerGoldWave)"
                    />
                    <defs>
                      <linearGradient id="partnerGoldWave" x1="40" y1="0" x2="360" y2="95" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F5CB5C" stopOpacity="0.45" />
                        <stop offset="55%" stopColor="#D9A323" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#012219" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Left Text & CTA Column */}
                  <div className="relative z-10 w-full sm:w-[60%] flex flex-col items-start text-left">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#D9A323]/80 bg-[#011B13]/75 text-[#F6CE64] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.08em] mb-2 shadow-[0_2px_8px_rgba(0,0,0,0.22)]">
                      <Handshake size={12} className="text-[#F6CE64] shrink-0" />
                      <span>Catering Network</span>
                    </span>

                    <h2
                      className="text-lg sm:text-[21px] lg:text-[22px] xl:text-[23px] font-bold text-white tracking-tight leading-[1.15]"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Become a Catering Partner
                    </h2>

                    {/* Gold Diamond Horizontal Divider */}
                    <div className="flex items-center gap-1.5 w-full max-w-[230px] my-1.5" aria-hidden="true">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E5B84B]/80 to-[#F8D76A]" />
                      <span className="w-1.5 h-1.5 rotate-45 bg-[#F8D76A] shrink-0" />
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E5B84B]/80 to-[#F8D76A]" />
                    </div>

                    <p className="text-[#E7EFEA]/90 text-[11.5px] sm:text-xs font-normal leading-[1.45] mb-3 max-w-[295px]">
                      List your kitchens, showcase your menus and start receiving high-volume bookings for premium events across Hyderabad.
                    </p>

                    <Link
                      to="/partner-selection"
                      className="inline-flex items-center gap-1.5 py-1.5 sm:py-2 px-4 sm:px-5 bg-gradient-to-r from-[#F9DC7A] via-[#E6B236] to-[#CF931B] hover:brightness-105 active:scale-[0.98] text-[#07261B] rounded-full font-bold text-[11.5px] sm:text-xs tracking-wide transition-all shadow-[0_5px_14px_rgba(217,163,35,0.34)] border border-[#FFF2B2]/75 cursor-pointer"
                    >
                      <span>Register Your Kitchen</span>
                      <ArrowRight size={13} className="stroke-[2.25]" />
                    </Link>
                  </div>

                  {/* Right Transparent Golden Partnership Emblem Illustration */}
                  <div className="relative z-10 w-[135px] sm:w-[40%] max-w-[175px] flex items-end justify-center shrink-0">
                    <div
                      className="pointer-events-none absolute bottom-1 inset-x-3 h-5 rounded-full blur-md bg-[#F5CB5C]/25"
                      aria-hidden="true"
                    />
                    <img
                      src={partnerHandshakeImg}
                      alt="PlanMyChoice Catering Partner Golden Emblem"
                      className="w-full h-auto max-h-[155px] sm:max-h-[168px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Right Card: Download App (Coming Soon) */}
                <div className="relative rounded-xl border border-[#D49F2A]/90 bg-gradient-to-br from-[#FFF9ED] via-[#FBF1DF] to-[#F4E3C2] p-3.5 sm:p-4 lg:p-[18px] overflow-hidden shadow-[0_8px_20px_rgba(155,112,24,0.10),inset_0_1px_0_rgba(255,255,255,0.85)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 min-h-[175px] sm:min-h-[185px] lg:min-h-[195px] group">
                  {/* Soft Warm Cream-Gold Glow Behind Smartphone */}
                  <div
                    className="pointer-events-none absolute right-[-16px] top-[-16px] w-56 h-56 rounded-full opacity-70"
                    style={{
                      background:
                        'radial-gradient(circle at 58% 58%, rgba(255, 249, 232, 0.9) 0%, rgba(235, 198, 120, 0.22) 55%, transparent 78%)',
                    }}
                    aria-hidden="true"
                  />

                  {/* Left Text & Status Pill Column */}
                  <div className="relative z-10 w-full sm:w-[58%] flex flex-col items-start text-left">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#D9A323]/85 bg-gradient-to-r from-[#F9E3A6] to-[#F1CA6A] text-[#08241A] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.08em] mb-2 shadow-[0_2px_6px_rgba(184,134,11,0.16)]">
                      <Smartphone size={11} className="text-[#08241A] shrink-0" />
                      <span>Coming Soon</span>
                    </span>

                    <h2
                      className="text-lg sm:text-[21px] lg:text-[22px] xl:text-[23px] font-bold text-[#032E20] tracking-tight leading-[1.15] mb-1.5"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Download App
                    </h2>

                    <p className="text-[#1A352B]/90 text-[11.5px] sm:text-xs font-normal leading-[1.45] mb-3.5 max-w-[290px]">
                      Book premium caterers, customize dishes, and track your events seamlessly on the go.
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#FFFDF8]/80 border border-[#C9962B]/70 shadow-[0_2px_8px_rgba(184,134,11,0.1)]">
                      <Smartphone size={13} className="text-[#B8821B] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-[#07261B]">
                        iOS &amp; Android App Launching Soon
                      </span>
                    </div>
                  </div>

                  {/* Right Transparent Golden Smartphone Illustration */}
                  <div className="relative z-10 w-[140px] sm:w-[42%] max-w-[180px] flex items-end justify-center shrink-0">
                    <img
                      src={partnerAppPhoneImg}
                      alt="PlanMyChoice Mobile App Preview"
                      className="w-full h-auto max-h-[160px] sm:max-h-[172px] object-contain drop-shadow-[0_10px_18px_rgba(68,48,12,0.2)] group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Center Antique-Gold Fleur Ornament (Mirrored) */}
          <div className="relative z-20 flex justify-center -mt-[14px] sm:-mt-[16px] pointer-events-none select-none">
            <img
              src={partnerOrnamentImg}
              alt=""
              aria-hidden="true"
              className="w-32 sm:w-40 md:w-44 h-auto object-contain scale-y-[-1] drop-shadow-[0_-1px_3px_rgba(138,94,14,0.2)]"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
