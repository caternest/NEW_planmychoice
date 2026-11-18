import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck, Key, Image as ImageIcon, FileText, ChefHat, Building2, User, UploadCloud, X, CheckCircle2 } from 'lucide-react';
import { cn, compressImageFile, safeSaveRegistrations } from '../lib/utils';
import CatererMenuBuilder from '../components/CatererMenuBuilder';
import { toast } from '../components/Toast';
import { getSupabase, uploadToSupabaseBucket } from '../lib/supabase';

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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#0F241C]">{label}</label>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-[160px] bg-[#FAF3E2]/45 relative overflow-hidden",
          dragActive ? "border-[#D4961B] bg-[#FAF0D4]/65" : "border-[#DFC78A] hover:border-[#D4961B]",
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
            <div className="absolute inset-0 bg-[#012419]/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer bg-[#FFFDF8] text-[#0F241C] border border-[#DFC78A] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#FAF0D4] transition-all select-none">
                Change Image
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              <button 
                type="button"
                onClick={() => onChange('')}
                className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-all"
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
            <div className="w-12 h-12 rounded-full bg-[#FAF0D4] border border-[#DFC78A] text-[#A87512] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UploadCloud size={22} />
            </div>
            <p className="text-sm font-bold text-[#0F241C]">Drag &amp; drop your image here, or</p>
            <label className="mt-1 text-xs font-extrabold text-[#9A6A0F] hover:text-[#785109] cursor-pointer underline decoration-2 underline-offset-2">
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
          className="w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#D4961B]/25 focus:border-[#D4961B] outline-none placeholder:text-[#8E7D5E] text-[#0F241C] disabled:opacity-50" 
        />
        {isBase64 && (
          <p className="text-[10px] text-[#9A6A0F] mt-1 font-semibold">Using uploaded file. Clear image to paste a custom URL.</p>
        )}
      </div>
    </div>
  );
};

export default function AdminEditCaterer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState<any>(null);
  const [menuPackages, setMenuPackages] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'business' | 'menu' | 'documents' | 'gallery'>('basic');

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState({ username: '', password: '' });
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
      const all = JSON.parse(raw);
      const found = all.find((c: any) => c.id === id);
      if (found) {
        // Ensure default values are populated
        if (!found.galleryPhotos) found.galleryPhotos = [];
        setCaterer(found);
        setMenuPackages(found.packages || found.draftMenuPackages || found.menuPackages || []);
      }
    }
  }, [id]);

  if (!caterer) {
    return (
      <div className="pt-28 pb-16 min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4 font-poppins">
        <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl px-8 py-10 text-center shadow-[0_14px_36px_rgba(116,84,22,0.10)] max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-[#064E3B] border-t-[#D9A323] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#0F241C]">Loading Caterer Profile...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCaterer({ ...caterer, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
      const all = JSON.parse(raw);
      const updated = all.map((c: any) => c.id === id ? {
        ...caterer,
        packages: menuPackages,
        draftMenuPackages: menuPackages,
        menuPackages
      } : c);
      try {
        safeSaveRegistrations(updated);

        // Persist full profile updates to Supabase caterer_registrations table securely
        const supabase = getSupabase();
        if (supabase) {
          console.log("[ADMIN EDIT CATERER] Persisting updated profile parameters onto Supabase...", caterer);
          const { error: dbError } = await supabase
            .from('caterer_registrations')
            .update({
              ...caterer,
              packages: menuPackages,
              draftMenuPackages: menuPackages,
              menuPackages: menuPackages
            })
            .eq('id', id);

          if (dbError) {
            console.error("[ADMIN EDIT CATERER] Cloud database save warning:", dbError);
            toast(`Profile cached locally. Warning: Cloud database update failed: ${dbError.message}`, 'error');
          } else {
            console.log("[ADMIN EDIT CATERER] Profile successfully updated in database.");
          }
        }

        // If the password changed, update it securely on the auth server tier
        if (isPasswordChanged && caterer.password) {
          try {
            const res = await fetch('/api/admin/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                catererId: id,
                newPassword: caterer.password
              })
            });
            const data = await res.json();
            if (!res.ok) {
              console.error("Backend credentials auth sync failed:", data.error);
              toast(`Profile saved local. Warning: Auth server update failed: ${data.error}`, 'error');
              return;
            } else {
              console.log("Credentials synced successfully on auth tier:", data);
              setIsPasswordChanged(false);

              // Update the local storage state with the newly synchronized userId if it returned one
              if (data.userId) {
                const refreshedRaw = localStorage.getItem('registrations');
                if (refreshedRaw) {
                  const refreshedAll = JSON.parse(refreshedRaw);
                  const updatedWithUserId = refreshedAll.map((c: any) => c.id === id ? { ...c, userId: data.userId } : c);
                  safeSaveRegistrations(updatedWithUserId);
                  setCaterer((prev: any) => ({ ...prev, userId: data.userId }));
                }
              }
            }
          } catch (syncErr: any) {
            console.error("Credentials sync error:", syncErr);
            toast('Profile saved, but Auth system update postponed.', 'error');
            return;
          }
        }

        toast('Caterer profile successfully updated!', 'success');
      } catch (err) {
        console.error("Quota exceeded during save", err);
        toast("The profile data is too large to save. Try reducing gallery photos or image sizes.", "error");
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const fileArray: File[] = Array.from(files);

      const uploadedUrls: string[] = [];
      const localFiles: File[] = [];

      for (const file of fileArray) {
          try {
              const supabase = getSupabase();
              if (supabase) {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
                  const publicUrl = await uploadToSupabaseBucket('gallery-images', fileName, file, file.type);
                  if (publicUrl) {
                      uploadedUrls.push(publicUrl);
                      continue;
                  }
              }
          } catch (storageErr) {
              console.warn("Storage upload failed for gallery item:", storageErr);
          }
          localFiles.push(file);
      }

      if (uploadedUrls.length > 0) {
          setCaterer((prev: any) => ({
              ...prev,
              galleryPhotos: [...(prev.galleryPhotos || []), ...uploadedUrls]
          }));
      }

      if (localFiles.length > 0) {
          const promises = localFiles.map((file: File) => {
              return compressImageFile(file, 600, 600, 0.75).catch(() => file.name);
          });

          Promise.all(promises).then(base64s => {
              setCaterer((prev: any) => ({
                  ...prev,
                  galleryPhotos: [...(prev.galleryPhotos || []), ...base64s]
              }));
          });
      }
  };

  const removeGalleryPhoto = (idx: number) => {
      setCaterer((prev: any) => ({
          ...prev,
          galleryPhotos: prev.galleryPhotos.filter((_: any, i: number) => i !== idx)
      }));
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const supabase = getSupabase();
          if (supabase) {
              const fileExt = file.name.split('.').pop();
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
              const publicUrl = await uploadToSupabaseBucket('documents', fileName, file, file.type);
              if (publicUrl) {
                  setCaterer((prev: any) => ({ ...prev, [field]: publicUrl }));
                  return;
              }
          }
      } catch (storageErr) {
          console.warn("Document scan upload failed:", storageErr);
      }

      setCaterer((prev: any) => ({ ...prev, [field]: file.name }));
  };

  const openPasswordReset = () => {
     setResetData({ username: caterer.username || '', password: '' });
     setIsResetOpen(true);
  };

  const handlePasswordReset = () => {
     if (resetData.password && resetData.password.length < 6) {
         toast('Password must be at least 6 characters.', 'error');
         return;
     }
     setCaterer((prev: any) => ({ 
         ...prev, 
         username: resetData.username || prev.username,
         password: resetData.password || prev.password
     }));
     if (resetData.password) {
         setIsPasswordChanged(true);
     }
     setIsResetOpen(false);
     toast('Credentials updated in editor. Click Save All Changes to confirm.', 'success');
  };

  const TABS = [
      { id: 'basic', label: 'Basic Details', icon: User },
      { id: 'business', label: 'Business Details', icon: Building2 },
      { id: 'menu', label: 'Menu Management', icon: ChefHat },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'gallery', label: 'Branding & Gallery', icon: ImageIcon },
  ];

  const inputCls = "w-full bg-[#FFFDF9] border border-[#DFC78A] rounded-xl px-4 py-2.5 text-[#0F241C] outline-none focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 placeholder:text-[#8E7D5E] transition-colors";

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] font-poppins">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate('/admin-dashboard')} className="inline-flex items-center gap-2 text-[#064E3B] hover:text-[#01261B] mb-6 font-semibold bg-[#FFFDF8] border border-[#DFC78A] px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        
        <div className="bg-[#FFFDF8] rounded-3xl shadow-[0_18px_45px_rgba(116,84,22,0.12)] border border-[#DFC78A] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#D9A323]/45 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01261B]">
            <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5C642] uppercase tracking-wider mb-1.5">
                  <ShieldCheck size={14} /> Super Admin Control Panel
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-[#FFFDF8] tracking-tight flex flex-wrap items-center gap-2">
                    Edit Profile: <span className="text-[#F5C642]">{caterer.businessName}</span>
                </h1>
            </div>
            <div className="flex gap-3">
                <button onClick={handleSave} className="bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] border border-[#B57B0C]/35 px-7 py-2.5 rounded-xl font-bold hover:brightness-105 flex items-center gap-2 shadow-lg transition-all cursor-pointer">
                  <Save size={18} /> Save All Changes
                </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Sidebar Navigation */}
              <div className="w-full lg:w-64 bg-[#FAF3E2]/70 border-b lg:border-b-0 lg:border-r border-[#DFC78A]/70 p-4 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto">
                  {TABS.map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer",
                            activeTab === tab.id 
                              ? "bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] shadow-sm border border-[#B57B0C]/35" 
                              : "text-[#3F3523] hover:bg-[#FFFDF8] border border-transparent"
                          )}
                      >
                          <tab.icon size={18} className={activeTab === tab.id ? "text-[#042419]" : "text-[#9A6A0F]"} />
                          {tab.label}
                      </button>
                  ))}
              </div>

               {/* Main Content Area */}
              <div className="flex-1 p-6 lg:p-8 bg-[#FFFDF8]">
                  {activeTab === 'basic' && (
                      <div className="space-y-8 max-w-3xl animate-in fade-in duration-300">
                          <div>
                              <h3 className="text-lg font-bold font-display text-[#0F241C] mb-4 border-b border-[#EFE3C4] pb-2">Account Ownership</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Owner Name</label>
                                      <input name="owner" value={caterer.owner || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Primary Email</label>
                                      <input name="email" value={caterer.email || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Mobile Number</label>
                                      <input name="phone" value={caterer.phone || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Alternate Mobile</label>
                                      <input name="alternatePhone" value={caterer.alternatePhone || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">WhatsApp Mobile Connection</label>
                                      <input name="whatsappNumber" value={caterer.whatsappNumber || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-bold font-display text-[#0F241C] mb-4 border-b border-[#EFE3C4] pb-2">Login Credentials</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Username</label>
                                      <input name="username" value={caterer.username || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Current Password</label>
                                      <div className="flex items-center gap-3">
                                          <input type="text" readOnly value={"••••••••"} className="w-full bg-[#FAF3E2]/70 border border-[#DFC78A] text-[#7D6E52] rounded-xl px-4 py-2.5 outline-none cursor-not-allowed" />
                                          <button onClick={openPasswordReset} className="flex-shrink-0 px-4 py-2.5 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition flex items-center gap-2 cursor-pointer">
                                              <Key size={16} /> Reset
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-bold font-display text-[#0F241C] mb-4 border-b border-[#EFE3C4] pb-2">Location</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Full Address</label>
                                      <textarea name="location" value={caterer.location || ''} onChange={handleChange} rows={2} className={inputCls} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-[#0F241C] mb-1.5">City</label>
                                      <input name="city" value={caterer.city || ''} onChange={handleChange} className={inputCls} />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'business' && (
                      <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Business Name</label>
                                  <input name="businessName" value={caterer.businessName || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Brand Display Name</label>
                                  <input name="brandName" value={caterer.brandName || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Brand Tagline</label>
                                  <input name="tagline" value={caterer.tagline || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Business Description</label>
                                  <textarea name="description" value={caterer.description || ''} onChange={handleChange} rows={4} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Years of Experience</label>
                                  <input name="experience" type="number" value={caterer.experience || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Events Completed</label>
                                  <input name="eventsCompleted" type="number" value={caterer.eventsCompleted || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Established Year</label>
                                  <input name="establishedYear" type="number" value={caterer.establishedYear || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Number of Branches</label>
                                  <input name="branches" type="number" value={caterer.branches || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Operating Hours</label>
                                  <input name="operatingHours" value={caterer.operatingHours || ''} onChange={handleChange} placeholder="e.g. 6:00 AM - 11:00 PM" className={inputCls} />
                              </div>
                              <div className="md:col-span-2 flex flex-col gap-3">
                                  <label className="flex items-center gap-2 cursor-pointer select-none bg-[#FAF3E2]/70 border border-[#DFC78A] rounded-xl px-4 py-3 transition hover:bg-[#FAF0D4]">
                                      <input
                                          type="checkbox"
                                          checked={!!caterer.serveEntireHyderabad}
                                          onChange={(e) => {
                                              setCaterer(prev => ({
                                                  ...prev,
                                                  serveEntireHyderabad: e.target.checked
                                              }));
                                          }}
                                          className="w-4 h-4 text-[#0F3D2E] focus:ring-[#0F3D2E] border-[#DFC78A] rounded cursor-pointer accent-[#0F3D2E]"
                                      />
                                      <span className="text-xs font-bold text-[#0F241C] uppercase tracking-wide">
                                          Serve Entire Hyderabad
                                      </span>
                                  </label>

                                  {!caterer.serveEntireHyderabad && (
                                      <div>
                                          <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Service Areas (comma separated)</label>
                                          <input name="serviceAreas" value={caterer.serviceAreas || ''} onChange={handleChange} className={inputCls} />
                                      </div>
                                  )}
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Awards (Optional)</label>
                                  <input name="awards" value={caterer.awards || ''} onChange={handleChange} className={inputCls} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Certifications (Optional)</label>
                                  <input name="certifications" value={caterer.certifications || ''} onChange={handleChange} className={inputCls} />
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'menu' && (
                      <div className="animate-in fade-in duration-300">
                          <CatererMenuBuilder packages={menuPackages} onChange={setMenuPackages} isParsing={isParsing} setIsParsing={setIsParsing} />
                      </div>
                  )}

                  {activeTab === 'documents' && (
                      <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
                          <p className="text-sm text-[#5C3D06] bg-[#FAF0D4]/65 p-4 rounded-2xl border border-[#DFC78A] font-medium">As Admin, you can view and replace the uploaded verification documents for this caterer.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['aadhaarFile', 'panFile', 'fssaiFile', 'gstFile'].map((docField) => (
                                  <div key={docField} className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-6 rounded-2xl relative shadow-2xs">
                                      <h4 className="font-bold text-[#0F241C] mb-1 capitalize text-base">{docField.replace('File', '')} Document</h4>
                                      <div className="mt-4 flex items-center justify-between">
                                          {caterer[docField] ? (
                                              <div className="flex items-center gap-2">
                                                  <CheckCircle2 size={18} className="text-[#116E39]" />
                                                  <span className="text-sm font-bold text-[#0F241C] truncate max-w-[150px]" title={caterer[docField]}>{caterer[docField]}</span>
                                              </div>
                                          ) : (
                                              <span className="text-sm text-[#7D6E52] font-medium italic">Not uploaded</span>
                                          )}
                                          <label className="cursor-pointer text-xs font-bold text-[#064E3B] hover:text-[#01261B] bg-[#E3F8EA] px-3 py-1.5 rounded-lg border border-[#9EE2BA] transition-colors">
                                              Replace
                                              <input type="file" className="hidden" onChange={e => handleDocumentChange(e, docField)} />
                                          </label>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {activeTab === 'gallery' && (
                      <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
                          
                          <div>
                              <h3 className="text-lg font-bold font-display text-[#0F241C] mb-4 border-b border-[#EFE3C4] pb-2 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">Profile Branding</h3>
                              <p className="text-sm text-[#5C5240] font-medium mb-6">Manage logo, cover banner, and founder image uploads.</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <ImageUploaderField 
                                        label="Caterer Logo Upload (500x500)"
                                        value={caterer.logo || ''}
                                        onChange={(val) => setCaterer({...caterer, logo: val})}
                                        placeholder="e.g. https://host.com/logo.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Cover Banner Upload (1600x600)"
                                        value={caterer.coverBanner || ''}
                                        onChange={(val) => setCaterer({...caterer, coverBanner: val})}
                                        placeholder="e.g. https://host.com/banner.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Founder Photo Upload (500x500)"
                                        value={caterer.ownerPhoto || ''}
                                        onChange={(val) => setCaterer({...caterer, ownerPhoto: val})}
                                        placeholder="e.g. https://host.com/founder.jpg"
                                   />
                                   <ImageUploaderField 
                                        label="Branch Photo Upload (Optional)"
                                        value={caterer.branchPhoto || ''}
                                        onChange={(val) => setCaterer({...caterer, branchPhoto: val})}
                                        placeholder="e.g. https://host.com/branch.jpg"
                                   />
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-bold font-display text-[#0F241C] mb-4 border-b border-[#EFE3C4] pb-2">Gallery Upload</h3>
                              <div className="flex justify-between items-center mb-6 gap-4">
                                  <p className="text-sm text-[#5C5240] font-medium font-poppins">Manage portfolio images visible to customers.</p>
                                  <label className="cursor-pointer font-semibold text-sm bg-gradient-to-b from-[#065239] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/60 px-5 py-2.5 rounded-xl hover:brightness-110 flex items-center gap-2 shadow-sm transition-all shrink-0">
                                     <UploadCloud size={16} /> Upload New Images
                                     <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                                  </label>
                              </div>
                              
                              {(!caterer.galleryPhotos || caterer.galleryPhotos.length === 0) ? (
                                  <div className="border-2 border-dashed border-[#DFC78A] bg-[#FAF3E2]/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                                      <ImageIcon size={48} className="text-[#C9A85B] mb-4" />
                                      <p className="text-[#0F241C] font-medium text-lg mb-1">No images uploaded yet</p>
                                      <p className="text-sm text-[#6B5F4B]">Click upload to add some portfolio pictures.</p>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                      {caterer.galleryPhotos.map((photo: string, i: number) => {
                                          const isImage = photo.startsWith('data:image/') || photo.startsWith('http://') || photo.startsWith('https://');
                                          return (
                                              <div key={i} className="group relative aspect-square bg-[#FAF3E2] rounded-2xl overflow-hidden border border-[#DFC78A] shadow-sm">
                                                  {isImage ? (
                                                      <img src={photo} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                  ) : (
                                                      <div className="absolute inset-0 flex items-center justify-center text-[#6B5F4B] p-4 text-center break-all font-medium text-xs">
                                                          {photo}
                                                      </div>
                                                  )}
                                                  <div className="absolute inset-0 bg-[#012419]/45 group-hover:bg-[#012419]/65 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                      <button onClick={() => removeGalleryPhoto(i)} className="p-3 bg-[#FFFDF8] text-red-600 rounded-full hover:scale-110 shadow-lg transition-transform cursor-pointer" title="Remove Photo">
                                                          <X size={20} />
                                                      </button>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

              </div>
          </div>
        </div>
      </div>
      
      {/* Password Reset Modal */}
      {isResetOpen && (
          <div className="fixed inset-0 bg-[#011F16]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-bold font-display text-[#0F241C] mb-6 flex items-center gap-2"><Key size={20} className="text-[#D4961B]"/> Reset Login Credentials</h3>
                  <div className="space-y-4 mb-8">
                      <div>
                          <label className="block text-sm font-bold text-[#0F241C] mb-1.5">New Username</label>
                          <input required value={resetData.username} onChange={e => setResetData({...resetData, username: e.target.value})} className={inputCls} placeholder="Username" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-[#0F241C] mb-1.5">New Password</label>
                          <input type="text" value={resetData.password} onChange={e => setResetData({...resetData, password: e.target.value})} className={inputCls} placeholder="Leave empty to keep current" />
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setIsResetOpen(false)} className="flex-1 px-4 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#F3DFAB] transition cursor-pointer">Cancel</button>
                      <button onClick={handlePasswordReset} className="flex-1 px-4 py-3 bg-gradient-to-b from-[#065239] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/60 font-bold rounded-xl hover:brightness-110 transition cursor-pointer">Save Credentials</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
