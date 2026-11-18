import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { cn, safeSaveRegistrations } from '../lib/utils';
import CatererMenuBuilder from '../components/CatererMenuBuilder';
import { toast } from '../components/Toast';

export default function EditCaterer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState<any>(null);
  const [menuPackages, setMenuPackages] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
      const all = JSON.parse(raw);
      const found = all.find((c: any) => c.id === id);
      if (found) {
        setCaterer(found);
        setMenuPackages(found.packages || found.draftMenuPackages || found.menuPackages || []);
      }
    }
  }, [id]);

  if (!caterer) return (
    <div className="min-h-screen pt-32 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex flex-col items-center justify-center text-[#083A28] font-medium font-poppins">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#DFC78A] border-t-[#024731] mb-4" />
      Loading business profile...
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCaterer({ ...caterer, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
      const all = JSON.parse(raw);
      // Change status to Pending Re-Approval upon edit
      const updated = all.map((c: any) => c.id === id ? {
        ...caterer,
        packages: menuPackages,
        draftMenuPackages: menuPackages,
        menuPackages,
        status: 'Pending Re-Approval'
      } : c);
      try {
        safeSaveRegistrations(updated);
        toast('Profile updated! Sent to Admin for Re-Approval.', 'success');
        navigate('/businesses');
      } catch (err) {
        console.error("Quota exceeded during save", err);
        toast("The profile data is too large to save. Try reducing gallery photos or image sizes.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pb-16 font-poppins">
      {/* Emerald & Gold Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01291D] via-[#034431] to-[#01261B] pt-24 pb-8 px-4 border-b-2 border-[#D9A323]/60">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#DFC78A] hover:text-[#FFFDF8] mb-3 font-semibold text-xs uppercase tracking-wider cursor-pointer">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#FFFDF8]">Edit Business Profile</h1>
            <p className="text-xs sm:text-sm text-[#DFC78A]/90 mt-1">Changes will require admin re-approval.</p>
          </div>
          <button onClick={handleSave} className="bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] hover:brightness-105 text-[#042419] border border-[#B57B0C]/35 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer shrink-0">
            <Save size={18} /> Save &amp; Submit
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-[#FFFDF8] p-6 sm:p-8 rounded-[24px] shadow-[0_14px_38px_rgba(140,105,32,0.1)] border border-[#DFC78A]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wide mb-2">Business Name</label>
                <input name="businessName" value={caterer.businessName || ''} onChange={handleChange} className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#132A1F] outline-none focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/25" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wide mb-2">Owner Name</label>
                <input name="owner" value={caterer.owner || ''} onChange={handleChange} className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#132A1F] outline-none focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/25" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wide mb-2">Location</label>
                  <input name="location" value={caterer.location || ''} onChange={handleChange} className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#132A1F] outline-none focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/25" placeholder="e.g. Madhapur" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wide mb-2">Description</label>
              <textarea name="description" value={caterer.description || ''} onChange={handleChange} rows={3} className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-3 text-sm text-[#132A1F] outline-none focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/25"></textarea>
            </div>

            <div className="border border-[#DFC78A] rounded-2xl p-6 bg-[#FAF3E2]/55 mt-8">
               <h3 className="font-bold font-display text-lg mb-4 text-[#083A28]">Menu &amp; Packages</h3>
               <CatererMenuBuilder packages={menuPackages} onChange={setMenuPackages} isParsing={isParsing} setIsParsing={setIsParsing} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
