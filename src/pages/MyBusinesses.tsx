import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Plus, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, safeSaveRegistrations } from '../lib/utils';

import { toast } from '../components/Toast';

export default function MyBusinesses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
      const allRegs = JSON.parse(raw);
      // Filter out deleted logic if needed, but for now show user's active/pending items
      setBusinesses(allRegs.filter((r: any) => 
        (r.userId === user?.id || (r.email && r.email.toLowerCase() === user?.email?.toLowerCase())) 
        && r.status !== 'Deleted'
      ));
    }
  }, [user]);

  const handleConfirmDeleteBusiness = () => {
    if (!deleteTarget) return;
    const raw = JSON.parse(localStorage.getItem('registrations') || '[]');
    const updated = raw.filter((x: any) => x.id !== deleteTarget.id);
    safeSaveRegistrations(updated);
    setBusinesses(updated.filter((r: any) => (r.userId === user?.id || (r.email && r.email.toLowerCase() === user?.email?.toLowerCase())) && r.status !== 'Deleted'));
    toast(`${deleteTarget.businessName || 'Business'} removed from your portal.`, 'success');
    setDeleteTarget(null);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return <span className="px-2.5 py-1 bg-[#FAF3E2] text-[#5C5240] border border-[#DFC78A] rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Edit size={12}/> Draft</span>;
      case 'Pending Approval': return <span className="px-2.5 py-1 bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><Clock size={12}/> Pending Approval</span>;
      case 'Approved': return <span className="px-2.5 py-1 bg-[#DCF8E6] text-[#116E39] border border-[#9EE2BA] rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Approved</span>;
      case 'Rejected': return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><XCircle size={12}/> Rejected</span>;
      case 'Needs Changes': return <span className="px-2.5 py-1 bg-[#FFF9EA] text-[#8E5B08] border border-[#DFC78A] rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><AlertCircle size={12}/> Needs Changes</span>;
      case 'Suspended': return <span className="px-2.5 py-1 bg-[#01291D] text-[#F5C642] border border-[#D9A323]/60 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><AlertCircle size={12}/> Suspended</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pb-20 font-poppins">
      {/* Emerald & Gold Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01291D] via-[#034431] to-[#01261B] pt-24 pb-10 px-4 sm:px-6 lg:px-8 border-b-2 border-[#D9A323]/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.14),transparent_65%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F8D76A]/15 text-[#F8D76A] border border-[#DFC78A]/35 mb-2">
              Partner Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#FFFDF8]">My Businesses</h1>
            <p className="text-[#DFC78A]/90 mt-1 text-sm">Manage your service registrations and approvals.</p>
          </div>
          <Link to="/partner-selection" className="flex items-center gap-2 bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] hover:brightness-105 text-[#042419] border border-[#B57B0C]/35 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <Plus size={18} /> Register New Service
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {businesses.length === 0 ? (
            <div className="bg-[#FFFDF8] rounded-[24px] p-12 text-center border border-[#DFC78A] shadow-[0_14px_38px_rgba(140,105,32,0.1)]">
                <div className="w-20 h-20 bg-[#FAF1DA] border border-[#DFC78A] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#9C6F11]">
                   <Building size={32} />
                </div>
                <h3 className="text-xl font-bold font-display text-[#083A28] mb-2">No Businesses Yet</h3>
                <p className="text-[#5D665F] text-sm mb-8 max-w-md mx-auto">You haven't registered any services. Join our marketplace to start getting orders.</p>
                <Link to="/partner-selection" className="inline-flex items-center gap-2 bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)]">
                   Become a Partner
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map(b => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFFDF8] rounded-[20px] border border-[#DFC78A] p-6 flex flex-col hover:border-[#D4961B] transition-all shadow-[0_10px_28px_rgba(140,105,32,0.08)] relative overflow-hidden">
                        
                        {/* Accent strips based on status */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            b.status === 'Approved' ? "bg-emerald-600" :
                            b.status === 'Pending Approval' ? "bg-[#D9A323]" :
                            b.status === 'Rejected' ? "bg-red-500" :
                            b.status === 'Needs Changes' ? "bg-[#C28824]" :
                            "bg-[#DFC78A]"
                        )}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold font-display text-[#083A28]">{b.businessName}</h3>
                                <p className="text-sm font-medium text-[#6B5A38]">{b.type}</p>
                            </div>
                            {getStatusBadge(b.status)}
                        </div>

                        {b.date && (
                            <p className="text-xs text-[#6B5A38] mb-3 flex items-center gap-1"><Clock size={12} className="text-[#9C7826]"/> Submitted: {b.date}</p>
                        )}
                        
                        <div className="flex gap-4 text-xs font-medium text-[#6B5A38] mb-3">
                            <span><span className="font-bold text-[#083A28]">{b.location || 'Hyderabad'}</span></span>
                            <span>•</span>
                            <span><span className="font-bold text-[#083A28]">{b.menuPackages?.length || 0}</span> Packages</span>
                            <span>•</span>
                            <span><span className="font-bold text-[#083A28]">{b.galleryPhotos?.length || 0}</span> Images</span>
                        </div>

                        {b.reason && (b.status === 'Rejected' || b.status === 'Needs Changes') && (
                            <div className="mt-2 text-sm bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4">
                                <p className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={14}/> Reason:</p>
                                <p className="opacity-90 leading-relaxed">{b.reason}</p>
                            </div>
                        )}

                        <div className="mt-auto pt-6 flex justify-end gap-2.5 border-t border-[#E8D7B0] flex-wrap">
                             {b.status === 'Approved' && (
                                <button 
                                   onClick={() => {
                                       localStorage.setItem('catererDashboardId', b.id);
                                       navigate('/caterer-dashboard');
                                   }} 
                                   className="px-4 py-2 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] text-xs font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    Dashboard
                                </button>
                             )}
                             <Link to={`/caterer/${b.id}`} className="px-4 py-2 bg-[#FAF3E2] border border-[#DFC78A] text-[#083A28] text-xs font-bold rounded-lg hover:bg-[#F3E6C6] transition-colors">
                                View Profile
                             </Link>
                             <Link to={`/edit-business/${b.id}`} className="px-4 py-2 bg-[#FFFDF8] border border-[#DFC78A] text-[#083A28] text-xs font-bold rounded-lg hover:bg-[#FAF3E2] transition-colors flex items-center gap-1">
                                <Edit size={14} /> Edit
                             </Link>
                             <button onClick={() => setDeleteTarget(b)} className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer">
                                <XCircle size={14} />
                             </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-display font-bold text-[#083A28] mb-2">Remove Business?</h3>
            <p className="text-sm text-[#5C5240] mb-6">Are you sure you want to remove <span className="font-bold text-[#0F241C]">"{deleteTarget.businessName}"</span> from your businesses list?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl text-xs hover:bg-[#FAF0D4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBusiness}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
