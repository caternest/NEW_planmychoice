import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, Lock, User as UserIcon, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from '../components/Toast';
import { getSupabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthPage({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentMode(mode);
    setError('');
  }, [mode]);

  // Automatic role-based redirect after login or if user session is already present
  useEffect(() => {
    console.log("[AUDIT LOG] AuthPage useEffect trigger. User state:", user, "authLoading:", authLoading);
    if (user && !authLoading) {
      const targetRole = user.role;
      const targetMustChange = user.must_change_password;
      console.log("[AUDIT LOG] Redirect condition met! User role:", targetRole, "must_change_password:", targetMustChange);
      
      if (targetMustChange) {
        console.log("[AUDIT LOG] Directing user to target: /change-password");
        navigate('/change-password', { replace: true });
      } else if (targetRole === 'admin') {
        console.log("[AUDIT LOG] Directing user to target: /admin-dashboard");
        navigate('/admin-dashboard', { replace: true });
      } else if (targetRole === 'caterer') {
        console.log("[AUDIT LOG] Directing user to target: /caterer-dashboard");
        navigate('/caterer-dashboard', { replace: true });
      } else {
        const from = location.state?.from || '/';
        console.log("[AUDIT LOG] Defaulting customer or standard user. State from:", from);
        // Prevent redirect loops
        if (from === '/login' || from === '/signup' || from === '/admin-login') {
          console.log("[AUDIT LOG] Prevent redirect loop. Directing user to target: /");
          navigate('/', { replace: true });
        } else {
          console.log("[AUDIT LOG] Directing user to target:", from);
          navigate(from, { replace: true });
        }
      }
    } else {
      console.log("[AUDIT LOG] Redirect condition NOT met. user is falsy or authLoading is true.");
    }
  }, [user, authLoading, navigate, location.state?.from]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log("[AUDIT LOG] handleSubmit initiated. Mode:", currentMode, "Email:", formData.email.trim());

    try {
      if (currentMode === 'forgot') {
        const { error: resetErr } = await resetPassword(formData.email.trim());
        if (resetErr) {
          setError(resetErr.message || "Failed to send reset email.");
        } else {
          toast("Password reset link sent to your email!", "success");
          setCurrentMode('login');
        }
      } else if (currentMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const { data, error: signUpErr } = await signUp(
          formData.email.trim().toLowerCase(),
          formData.password,
          formData.name.trim(),
          formData.phone.trim(),
          'customer'
        );

        if (signUpErr) {
          setError(signUpErr.message || "Registration failed.");
        } else {
          toast("Registration successful! Verify your email to activate.", "success");
          setUnverifiedEmail(formData.email.trim().toLowerCase());
        }
      } else {
        // Native email login
        const normalizedEmail = formData.email.trim().toLowerCase();
        console.log("[AUDIT LOG] Calling signInWithPassword helper for email:", normalizedEmail);
        const { error: signInErr } = await signIn(normalizedEmail, formData.password);
        
        if (signInErr) {
          console.warn("[AUDIT LOG] signInWithPassword returned error:", signInErr.message);
          const isInvalidCreds = signInErr.message?.toLowerCase().includes("invalid login credentials");
          setError(
            isInvalidCreds
              ? "Invalid email or password. Please verify your credentials or click 'Forgot Password?' below."
              : signInErr.message || "Invalid email or password."
          );
        } else {
          console.log("[AUDIT LOG] signInWithPassword returned success! Triggering success toast...");
          toast("Logged in successfully!", "success");
          const from = location.state?.from || '/';
          console.log("[AUDIT LOG] Navigating locally from login to target:", from);
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      console.warn("[AUDIT LOG] Exception caught during handleSubmit:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      console.log("[AUDIT LOG] handleSubmit finally block: setting state loading to false.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast("Database is not configured.", "error");
        return;
      }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail
      });
      if (error) {
        toast(error.message, "error");
      } else {
        toast("Verification link sent! Please check your inbox.", "success");
      }
    } catch (err: any) {
      console.error(err);
      toast("Error resending verification email.", "error");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { error: googleErr } = await signInWithGoogle();
      if (googleErr) {
        setError(googleErr.message || "Google authentication failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize Google Login.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // If we are waiting for email verification
  if (unverifiedEmail) {
    return (
      <div className="min-h-screen pt-24 pb-12 md:py-12 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A]">
          <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#01291D] px-6 py-7 text-center relative overflow-hidden border-b border-[#D9A323]/45">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.16),transparent_65%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-[#011F16]/85 border border-[#DFC78A]/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
                <img src="/assets/aistudio/image_6ce019e3.png" alt="PlanMyChoice" className="w-10 h-10 object-contain" />
              </div>
              <h2 className="text-2xl font-display font-bold text-[#FFFDF8] tracking-tight mb-1">
                Verify Your Email
              </h2>
              <p className="text-[#DFC78A]/90 font-poppins text-xs">
                Activate your account to start ordering
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className="bg-[#FAF3E2] border border-[#DFC78A] p-4 rounded-xl text-[#132A1F] font-poppins text-sm leading-relaxed text-left">
              Verification email has been sent to your email address. Please verify your email before logging in.
            </div>

            <div className="text-xs text-[#6B5A38] font-poppins bg-[#F7EED7] border border-[#DFC78A]/80 py-2 px-3.5 rounded-lg inline-block">
              Email sent to: <span className="text-[#024731] font-semibold">{unverifiedEmail}</span>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-semibold font-poppins py-3 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {resending ? 'Resending verification...' : 'Resend Verification Email'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnverifiedEmail(null);
                  setCurrentMode('login');
                }}
                className="w-full bg-[#FAF3E2] hover:bg-[#F3E6C6] text-[#132A1F] border border-[#DFC78A] font-medium font-poppins py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Go To Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 md:py-12 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className={`w-full transition-all duration-300 max-w-md ${currentMode === 'signup' ? 'md:max-w-xl' : 'md:max-w-md'} bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A]`}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#01291D] px-6 py-7 text-center relative overflow-hidden border-b border-[#D9A323]/45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.16),transparent_65%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            {currentMode === 'forgot' && (
              <button 
                type="button"
                onClick={() => setCurrentMode('login')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-[#F8D76A] hover:text-white transition-colors cursor-pointer"
                aria-label="Back to login"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="bg-[#011F16]/85 border border-[#DFC78A]/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
              <img src="/assets/aistudio/image_6ce019e3.png" alt="PlanMyChoice" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-display font-bold text-[#FFFDF8] tracking-tight mb-1">
              {currentMode === 'login' ? 'Welcome Back' : currentMode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-[#DFC78A]/90 font-poppins text-xs max-w-xs mx-auto">
              {currentMode === 'login' 
                ? 'Sign in to access your orders and favorites.' 
                : currentMode === 'signup' 
                ? 'Join PlanMyChoice to explore premium catering services.'
                : 'Enter your details to reset your password.'}
            </p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-3.5 rounded-xl text-xs font-semibold text-center mb-4 font-poppins flex flex-col items-center justify-center gap-1.5">
              <span>{error}</span>
              {error.toLowerCase().includes("log in instead") && (
                <button
                  type="button"
                  onClick={() => { setError(''); setCurrentMode('login'); }}
                  className="text-[#024731] underline font-bold hover:text-[#043625] cursor-pointer transition-colors"
                >
                  Click here to Log In
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {currentMode === 'signup' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                
                {/* 2-column on desktop: Full Name | Mobile Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                      <input 
                        required 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        type="text" 
                        className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                        placeholder="John Doe" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                      <input 
                        required 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        type="tel" 
                        className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                        placeholder="+91" 
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address - full width */}
                <div>
                  <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                    <input 
                      required 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      type="email" 
                      className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>

                {/* 2-column on desktop: Password | Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                      <input 
                        required 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E7D5A] hover:text-[#083A28] focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                      <input 
                        required 
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E7D5A] hover:text-[#083A28] focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* Login and Reset Password flows - single column, highly compact */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#083A28] mb-1.5 font-poppins uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                    <input 
                      required 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      type="email" 
                      className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>

                {currentMode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-[#083A28] font-poppins uppercase tracking-wide">Password</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setCurrentMode('forgot');
                          setError('');
                        }} 
                        className="text-xs font-bold text-[#B57B0C] hover:text-[#8E5F07] transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={17} />
                      <input 
                        required 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:bg-white outline-none transition-all text-sm font-poppins text-[#132A1F] placeholder:text-[#8E7D5A]" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E7D5A] hover:text-[#083A28] focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-semibold font-poppins py-3 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading 
                ? 'Processing...' 
                : currentMode === 'login' 
                ? 'Sign In' 
                : currentMode === 'signup' 
                ? 'Create Account' 
                : 'Send Reset Link'
              }
            </button>
          </form>

          {currentMode !== 'forgot' && (
            <>
              <div className="relative mt-5 mb-5 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8D7B0]"></div></div>
                <span className="relative bg-[#FFFDF8] px-3 text-[10px] font-semibold text-[#8A754A] uppercase tracking-widest font-poppins">Or continue with</span>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-[#FAF3E2]/75 border border-[#DFC78A] hover:bg-[#F5E9CE] py-2.5 rounded-xl text-[#132A1F] font-medium font-poppins transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Google
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[#5D665F] mt-6 text-sm font-poppins">
            {currentMode === 'login' ? "Don't have an account? " : currentMode === 'signup' ? "Already have an account? " : "Remember your password? "}
            <button 
              type="button"
              onClick={() => {
                setError('');
                setCurrentMode(currentMode === 'login' ? 'signup' : 'login');
              }} 
              className="text-[#B57B0C] font-bold hover:text-[#8E5F07] transition-colors cursor-pointer"
            >
              {currentMode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
