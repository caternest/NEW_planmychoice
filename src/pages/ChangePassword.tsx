import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldAlert, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from '../components/Toast';
import { getSupabase } from '../lib/supabase';

export default function ChangePassword() {
  const { updatePassword, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [verifyingRecovery, setVerifyingRecovery] = useState(true);

  useEffect(() => {
    // Check if URL has recovery tokens in hash or query
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecoveryToken = hash.includes('type=recovery') || search.includes('type=recovery');

    if (hasRecoveryToken) {
      setIsRecoverySession(true);
    }

    // Give Supabase a brief moment to process recovery hash from URL if arriving from email link
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsRecoverySession(true);
        }
        setVerifyingRecovery(false);
      }).catch(() => {
        setVerifyingRecovery(false);
      });
    } else {
      setVerifyingRecovery(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await updatePassword(formData.password);
      if (updateError) {
        setError(updateError.message || "Failed to update password. Please try again.");
      } else {
        // If this was a forced password change for an active logged in user
        if (user?.must_change_password) {
          toast("Password updated successfully!", "success");
          if (user?.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else if (user?.role === 'caterer') {
            navigate('/caterer-dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          // Password recovery flow: sign out cleanly and redirect to login
          toast("Password reset successfully! Please log in with your new password.", "success");
          await logout();
          navigate('/login', { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Change password error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // While checking session or loading auth
  if (loading || verifyingRecovery) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#FFFDF8] rounded-[24px] p-8 shadow-[0_14px_36px_rgba(116,84,22,0.1)] border border-[#DFC78A] text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#DFC78A] border-t-[#024731] mx-auto mb-4"></div>
          <p className="text-[#083A28] font-medium font-poppins text-sm">Verifying secure link...</p>
        </div>
      </div>
    );
  }

  // If no user and not a recovery session
  if (!user && !isRecoverySession) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A] text-center p-8">
          <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-2xl font-display font-bold text-[#083A28] mb-2">Invalid or Expired Link</h2>
          <p className="text-[#5D665F] font-poppins text-sm mb-6 leading-relaxed">
            The password reset link is invalid or has expired. Please request a new password reset from the login page.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-semibold font-poppins py-3 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A]">
        <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#01291D] px-8 py-7 text-center relative overflow-hidden border-b border-[#D9A323]/45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.16),transparent_65%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="bg-[#011F16]/85 border border-[#DFC78A]/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
              <img src="/assets/aistudio/image_6ce019e3.png" alt="PlanMyChoice" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#FFFDF8] tracking-tight mb-1.5">
              Set New Password
            </h2>
            <p className="text-[#DFC78A]/90 font-poppins text-xs sm:text-sm">
              Please choose a secure new password for your PlanMyChoice account.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {user?.must_change_password && (
            <div className="mb-6 flex gap-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#7D5708] p-4 rounded-xl text-sm font-medium">
              <ShieldAlert size={20} className="shrink-0 text-[#B57B0C] mt-0.5" />
              <div>
                <p className="font-bold text-[#083A28]">First login modification required</p>
                <p className="text-xs text-[#6B5A38] mt-0.5">As part of secure credential management, you must set a new password before accessing your dashboard.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="bg-red-500/10 border border-red-500/35 text-red-700 p-3 rounded-xl text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                <input 
                  required 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  type="password" 
                  className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white focus:outline-none transition-all text-sm text-[#132A1F] placeholder:text-[#8E7D5A]" 
                  placeholder="At least 6 characters" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                <input 
                  required 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  type="password" 
                  className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white focus:outline-none transition-all text-sm text-[#132A1F] placeholder:text-[#8E7D5A]" 
                  placeholder="Repeat new password" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-semibold font-poppins py-3.5 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {submitting ? 'Updating Password...' : 'Update Password & Proceed'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
