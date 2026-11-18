import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Shield, Mail, Key, X, Download, Trash2, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/Toast';
import { getSupabase } from '../lib/supabase';

export default function Profile() {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showManageDataModal, setShowManageDataModal] = useState(false);

  // Password modal states
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Manage data states
  const [downloadingData, setDownloadingData] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!user) {
    return (
      <div className="pt-32 pb-24 text-center min-h-[75vh] bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex flex-col items-center justify-center px-4 font-poppins">
        <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-[24px] p-8 sm:p-10 max-w-md w-full shadow-[0_14px_38px_rgba(140,105,32,0.1)]">
          <h1 className="text-3xl font-bold font-display text-[#083A28] mb-3">Please log in</h1>
          <p className="text-sm text-[#5D665F] mb-6">Sign in to view your PlanMyChoice account details and security settings.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.roles.includes('admin') || user.email === 'meda1824@gmail.com';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSubmitting(true);
    try {
      const { error } = await updatePassword(passwordForm.password);
      if (error) {
        setPasswordError(error.message || "Failed to update password. Please try again.");
      } else {
        toast("Password updated successfully!", "success");
        setPasswordForm({ password: '', confirmPassword: '' });
        setShowPasswordModal(false);
      }
    } catch (err: any) {
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloadingData(true);
    try {
      const supabase = getSupabase();
      let ordersData = [];
      let notificationsData = [];

      if (supabase) {
        try {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('userId', user.id);
          ordersData = orders || [];
        } catch (e) {
          console.warn("Could not export orders:", e);
        }

        try {
          const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('userId', user.id);
          notificationsData = notifications || [];
        } catch (e) {
          // Non-fatal
        }
      }

      const exportPayload = {
        exportDate: new Date().toISOString(),
        application: "PlanMyChoice",
        userProfile: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roles: user.roles,
          provider: user.provider || (user.isGoogleUser ? 'google' : 'email')
        },
        orders: ordersData,
        notifications: notificationsData
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `planmychoice-user-data-${user.id.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast("Account data exported successfully!", "success");
    } catch (err) {
      console.error("Export data error:", err);
      toast("Failed to export account data.", "error");
    } finally {
      setDownloadingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isAdmin) {
      setDeleteError("Administrator accounts cannot be deleted.");
      return;
    }

    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setDeleteError("Please type DELETE to confirm account deletion.");
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Active session token not found. Please log in again.");
      }

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete account.");
      }

      toast("Your account has been permanently deleted.", "success");
      await logout();
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error("Delete account error:", err);
      setDeleteError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pb-20 font-poppins">
      {/* Emerald & Gold Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01291D] via-[#034431] to-[#01261B] pt-24 pb-10 px-4 border-b-2 border-[#D9A323]/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.14),transparent_65%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F8D76A]/15 text-[#F8D76A] border border-[#DFC78A]/35 mb-2">
              Account Preferences
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#FFFDF8]">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-[#FFFDF8] rounded-[24px] border border-[#DFC78A] p-6 sm:p-8 shadow-[0_14px_40px_rgba(140,105,32,0.1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-[#E8D7B0] pb-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#023828] to-[#011C14] text-[#F8D76A] border-2 border-[#D9A323] flex items-center justify-center text-3xl font-bold font-display shadow-[0_6px_18px_rgba(1,34,23,0.2)] shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#083A28] font-display">{user.name}</h2>
              <p className="text-[#5D665F] flex items-center gap-2 mt-1 text-sm"><Mail size={16} className="text-[#B57B0C]" /> {user.email}</p>
              
              <div className="flex gap-2 mt-3 flex-wrap">
                {isAdmin && (
                  <span className="px-3 py-1 bg-[#FAF1DA] text-[#7D5708] border border-[#DFC78A] text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5"><Shield size={12}/> Admin Role</span>
                )}
                <span className="px-3 py-1 bg-[#E7F4EC] text-[#054A33] border border-[#054A33]/15 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">User</span>
                {user.isGoogleUser && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">Google Account</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg font-display text-[#083A28]">Account Security</h3>
            
            {/* Password Row */}
            <div className="flex justify-between items-center bg-[#FAF3E2]/70 border border-[#DFC78A]/85 p-4 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFFDF8] rounded-lg flex items-center justify-center border border-[#DFC78A] text-[#9C7826]">
                  <Key size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#083A28]">Password</p>
                  <p className="text-xs text-[#6B5A38]">
                    {user.isGoogleUser ? 'Managed securely via Google' : 'Secured with email credentials'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setPasswordError('');
                  setPasswordForm({ password: '', confirmPassword: '' });
                  setShowPasswordModal(true);
                }}
                className="text-xs sm:text-sm font-semibold text-[#FFFDF8] bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 px-4 py-2 rounded-lg hover:brightness-110 transition-all cursor-pointer shrink-0"
              >
                Change
              </button>
            </div>

            {/* Manage Data Row */}
            <div className="flex justify-between items-center bg-[#FAF3E2]/70 border border-[#DFC78A]/85 p-4 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFFDF8] rounded-lg flex items-center justify-center border border-[#DFC78A] text-[#9C7826]">
                  <Settings size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#083A28]">Manage Data</p>
                  <p className="text-xs text-[#6B5A38]">Download or delete your account</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setDeleteError('');
                  setDeleteConfirmation('');
                  setShowManageDataModal(true);
                }}
                className="text-xs sm:text-sm font-semibold text-[#083A28] bg-[#FFFDF8] border border-[#DFC78A] px-4 py-2 rounded-lg hover:bg-[#F5E9CE] transition-colors cursor-pointer shrink-0"
              >
                Manage
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8D7B0]">
            <button onClick={() => { logout(); navigate('/'); }} className="text-red-700 bg-red-50 border border-red-200/80 font-bold text-sm flex items-center gap-2 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-[#011811]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#DFC78A] relative">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-[#6B5A38] hover:text-[#083A28] p-1 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#083A28] font-display">Change Password</h3>
                <p className="text-xs text-[#6B5A38]">Update your security credentials</p>
              </div>
            </div>

            {user.isGoogleUser ? (
              <div className="space-y-4 py-2">
                <div className="bg-[#FAF3E2] border border-[#DFC78A] text-[#083A28] p-4 rounded-xl text-sm leading-relaxed">
                  Your account is secured with Google Sign-In. Password change is not applicable.
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-full bg-[#FAF3E2] border border-[#DFC78A] text-[#132A1F] font-medium py-2.5 rounded-xl hover:bg-[#F3E6C6] transition-colors text-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#083A28] mb-1 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={16} />
                    <input 
                      required
                      type="password"
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#132A1F] focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#083A28] mb-1 uppercase tracking-wide">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C7826]" size={16} />
                    <input 
                      required
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#132A1F] focus:ring-2 focus:ring-[#D4961B]/30 focus:border-[#D4961B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-[#FAF3E2] border border-[#DFC78A] text-[#132A1F] font-medium py-2.5 rounded-xl hover:bg-[#F3E6C6] transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="flex-1 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-semibold py-2.5 rounded-xl hover:brightness-110 transition-all text-sm disabled:opacity-75 cursor-pointer"
                  >
                    {passwordSubmitting ? 'Updating...' : 'Save Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manage Data Modal */}
      {showManageDataModal && (
        <div className="fixed inset-0 z-50 bg-[#011811]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#DFC78A] relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowManageDataModal(false)}
              className="absolute right-4 top-4 text-[#6B5A38] hover:text-[#083A28] p-1 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#083A28] font-display">Manage Account Data</h3>
                <p className="text-xs text-[#6B5A38]">Export or delete your personal account data</p>
              </div>
            </div>

            {/* Section A: Download */}
            <div className="border border-[#DFC78A] rounded-xl p-5 bg-[#FAF3E2]/60 mb-6">
              <div className="flex items-start gap-3">
                <Download size={20} className="text-[#024731] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#083A28]">Download Account Data</h4>
                  <p className="text-xs text-[#5D665F] mt-1 leading-relaxed">
                    Export a copy of your personal profile, contact information, and order history as a formatted JSON document.
                  </p>
                  <button
                    onClick={handleDownloadData}
                    disabled={downloadingData}
                    className="mt-3 bg-[#FFFDF8] border border-[#DFC78A] hover:bg-[#F5E9CE] text-[#083A28] font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    <Download size={14} />
                    {downloadingData ? 'Generating export...' : 'Download My Data'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section B: Delete Account (Danger Zone) */}
            <div className="border border-red-200 rounded-xl p-5 bg-red-50/50">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900">Delete Account</h4>
                  <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                    Deleting your account is permanent and cannot be undone. All your personal data and booking profile will be removed.
                  </p>

                  {isAdmin ? (
                    <div className="mt-3 bg-red-100/60 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold">
                      Administrator accounts cannot be deleted directly.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {deleteError && (
                        <div className="bg-red-100 border border-red-200 text-red-700 p-2.5 rounded-lg text-xs font-medium">
                          {deleteError}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#083A28] mb-1">
                          Type <span className="font-mono text-red-700 bg-red-100 px-1 py-0.5 rounded">DELETE</span> to confirm:
                        </label>
                        <input 
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="DELETE"
                          className="w-full bg-white border border-red-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount || deleteConfirmation.trim().toUpperCase() !== 'DELETE'}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                        {deletingAccount ? 'Deleting Account...' : 'Permanently Delete My Account'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageDataModal(false)}
                className="bg-[#FAF3E2] border border-[#DFC78A] text-[#132A1F] font-medium px-4 py-2 rounded-xl hover:bg-[#F3E6C6] transition-colors text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
