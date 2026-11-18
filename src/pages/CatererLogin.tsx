import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from '../components/Toast';
import { getSupabase } from '../lib/supabase';
import { safeSaveRegistrations } from '../lib/utils';

export default function CatererLogin() {
  const { signIn, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputId = formData.identifier.trim();
    if (!inputId) {
      setError("Please enter your email, username, or mobile number.");
      setLoading(false);
      return;
    }

    let resolvedEmail = '';

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Database is temporarily unavailable.");
        setLoading(false);
        return;
      }

      if (inputId.includes('@')) {
        resolvedEmail = inputId.toLowerCase();
      } else {
        // Resolve email using username or phone lookups
        const { data: matchedRegs, error: lookupErr } = await supabase
          .from('caterer_registrations')
          .select('email, id, status, userId, username, phone, updated_at')
          .or(`phone.eq.${inputId},username.eq.${inputId},username.eq.${inputId.toLowerCase()}`);

        if (lookupErr) {
          console.error("Error looking up caterer account:", lookupErr);
        }

        if (!matchedRegs || matchedRegs.length === 0) {
          setError("No caterer account found with the provided email, username, or mobile number.");
          setLoading(false);
          return;
        }

        // Retrieve approved registration containing a valid email Address, ordered by updated_at desc
        const approvedRegs = matchedRegs
          .filter(r => r.status === 'Approved' && r.email)
          .sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

        const resolvedRecord = approvedRegs[0];
        if (!resolvedRecord || !resolvedRecord.email) {
          setError("No approved caterer account found with the provided email, username, or mobile number.");
          setLoading(false);
          return;
        }

        resolvedEmail = resolvedRecord.email.toLowerCase();
      }

      // 1. Sign in natively via Supabase
      console.log("[AUDIT LOG] CatererLogin.tsx invoking signIn with payload:", {
        email: resolvedEmail,
        passwordLength: formData.password?.length
      });

      let signInResult = await signIn(resolvedEmail, formData.password);
      let authUser = signInResult?.data?.user;
      let signInErr = signInResult?.error;

      if (signInErr) {
        setError(signInErr.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!authUser) {
        setError("User session could not be established.");
        setLoading(false);
        return;
      }

      // 2. Fetch their registration to verify status
      const { data: registrations, error: regError } = await supabase
        .from('caterer_registrations')
        .select('*')
        .or(`userId.eq.${authUser.id},email.eq.${resolvedEmail}`);

      if (regError) {
        console.error("Error checking caterer registration:", regError);
      }

      // If user is also an Admin, they can view everything and bypass status checks
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();

      const isAdmin = profile?.role === 'admin';

      if (!registrations || registrations.length === 0) {
        if (isAdmin) {
          toast("Authenticating Admin into Caterer Dashboard...", "success");
          navigate('/caterer-dashboard');
          return;
        }
        setError("No registered caterer profile found for this account. Go to the Join page to register.");
        await logout();
        setLoading(false);
        return;
      }

      // Sort status priorities: Approved is preferred
      const sortedRegs = [...registrations].sort((a: any, b: any) => {
        const rank = (s: string) => (s || '').toLowerCase() === 'approved' ? 3 : (s || '').toLowerCase() === 'pending approval' ? 2 : 1;
        return rank(b.status) - rank(a.status);
      });

      const activeReg = sortedRegs[0];

      // Keep registration userId synchronized with authentic authUser id if it is misaligned or has demo value
      if (activeReg && activeReg.userId !== authUser.id) {
         console.log(`[CATERER LOGIN] Aligning register userId "${activeReg.userId}" to current secure session id "${authUser.id}"...`);
         const { error: syncUserIdErr } = await supabase
           .from('caterer_registrations')
           .update({ userId: authUser.id })
           .eq('id', activeReg.id);

         if (syncUserIdErr) {
           console.warn("[CATERER LOGIN] Failed to sync userId back to Cloud DB schema:", syncUserIdErr.message);
         } else {
           activeReg.userId = authUser.id;
           // Keep localCache registrations in perfect local sync
           const rawLocal = localStorage.getItem('registrations');
           if (rawLocal) {
              const allLocal = JSON.parse(rawLocal);
              const updatedLocal = allLocal.map((r: any) => r.id === activeReg.id ? { ...r, userId: authUser.id } : r);
              safeSaveRegistrations(updatedLocal);
           }
         }
      }

      const status = (activeReg.status || '').toLowerCase();

      if (status === 'suspended') {
        setError("Your account is currently suspended. Please contact coordinator support.");
        await logout();
        setLoading(false);
        return;
      }

      if (status === 'trashed' || status === 'deleted') {
        setError("Your account has been deactivated.");
        await logout();
        setLoading(false);
        return;
      }

      if (status === 'rejected') {
        setError("Your registration request was not approved.");
        await logout();
        setLoading(false);
        return;
      }

      if (status === 'pending verification') {
        setError("Your registration is pending email verification. Please sign up again to complete verification.");
        await logout();
        setLoading(false);
        return;
      }

      if (status === 'pending approval' || status === 'pending') {
        setError("Your account is under review. Please wait for coordinator approval.");
        await logout();
        setLoading(false);
        return;
      }

      // Save active caterer ID to local session
      localStorage.setItem('catererDashboardId', activeReg.id);
      toast("Login successful! Welcome to coordinates.", "success");
      navigate('/caterer-dashboard');
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred during check-in.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 md:py-12 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 font-poppins bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A]">
        
        {/* Emerald & Gold Header */}
        <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#01291D] px-6 py-7 text-center relative overflow-hidden border-b border-[#D9A323]/45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.16),transparent_65%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-[#011F16]/85 border border-[#DFC78A]/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
              <img src="/assets/aistudio/image_6ce019e3.png" alt="PlanMyChoice" className="w-10 h-10 object-contain" />
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F8D76A]/15 text-[#F8D76A] border border-[#DFC78A]/35 mb-2">
              Partner Portal
            </span>
            <h1 className="text-2xl sm:text-[28px] font-display font-bold text-[#FFFDF8] mb-1">Caterer Login</h1>
            <p className="text-[#DFC78A]/90 text-center text-xs max-w-xs mx-auto">
              Access your partner dashboard and manage your orders.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#083A28] uppercase tracking-wide ml-0.5">
                Email, Username or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C7826]">
                  <Mail size={17} />
                </div>
                <input 
                  type="text" 
                  name="identifier"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl text-[#132A1F] placeholder:text-[#8E7D5A] focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white transition-all outline-none text-sm"
                  placeholder="Enter email, username or mobile number"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-0.5">
                <label className="block text-xs font-semibold text-[#083A28] uppercase tracking-wide">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C7826]">
                  <Lock size={17} />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl text-[#132A1F] placeholder:text-[#8E7D5A] focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white transition-all outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] hover:brightness-105 text-[#042419] border border-[#B57B0C]/35 font-bold py-3.5 rounded-xl transition-all shadow-[0_6px_18px_rgba(217,155,22,0.28)] mt-4 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
            >
              {loading ? 'Authenticating Partner...' : 'Caterer Check-In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
