import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Link,
  Save,
  ShieldCheck,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  CheckCircle,
  Flame,
  Star,
  Coffee,
  Utensils,
  Award,
  X,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { cn, compressImageFile, safeSaveRegistrations } from "../lib/utils";
import { toast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import JoinSteps from "../components/JoinSteps";
import CatererMenuBuilder from "../components/CatererMenuBuilder";
import { useNavigate } from "react-router-dom";
import { getSupabase, uploadToSupabaseBucket } from "../lib/supabase";
import { storeNotification } from "../lib/orderUtils";
import { MapPickerModal } from "../components/MapPickerModal";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const ImageUploaderField: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }
    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const publicUrl = await uploadToSupabaseBucket(
          "branding-images",
          fileName,
          file,
          file.type,
        );
        if (publicUrl) {
          onChange(publicUrl);
          return;
        }
      }
    } catch (storageErr) {
      console.warn(
        "Supabase storage upload failed, fallback to local:",
        storageErr,
      );
    }

    compressImageFile(file, 600, 600, 0.75)
      .then((base64) => onChange(base64))
      .catch((err) => {
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

  const isBase64 = value && value.startsWith("data:image/");

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wider">
        {label}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-[160px] bg-[#FAF3E2]/45 relative overflow-hidden",
          dragActive
            ? "border-[#D4961B] bg-[#FAF1DA]"
            : "border-[#DFC78A] hover:border-[#D4961B]",
          value ? "border-[#D9A323] bg-[#FFFDF8]" : "",
        )}
      >
        {value ? (
          <div className="relative w-full h-[140px] flex items-center justify-center group rounded-xl overflow-hidden bg-[#FFFDF9]">
            <img
              src={value}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded-xl p-1"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.opacity = "0.3";
              }}
            />
            <div className="absolute inset-0 bg-[#011610]/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer bg-[#FFFDF8] text-[#083A28] border border-[#DFC78A] text-xs font-black px-4 py-2 rounded-xl hover:bg-[#FAF3E2] transition-all select-none col-span-2">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all"
              >
                Clear
              </button>
            </div>
            <span className="absolute bottom-2 left-2 bg-[#D9A323] text-[#052419] font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow">
              {isBase64 ? "Uploaded File" : "URL Image"}
            </span>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center py-2 select-none">
            <div className="w-12 h-12 rounded-full bg-[#FAF1DA] border border-[#DFC78A] text-[#B87D16] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UploadCloud size={22} className="text-[#B87D16]" />
            </div>
            <p className="text-xs font-bold text-[#083A28]">
              Drag & drop your image here, or
            </p>
            <label className="mt-1 text-xs font-extrabold text-[#B87D16] hover:text-[#8E5F0F] cursor-pointer underline decoration-2 underline-offset-2">
              browse files
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
            <p className="text-[10px] text-[#7B6947] mt-1">
              Supports PNG, JPG, JPEG, WEBP, GIF
            </p>
          </div>
        )}
      </div>

      <div className="relative mt-2">
        <label className="block text-[10px] text-[#8A754A] font-bold uppercase tracking-wider mb-1">
          Or paste image URL
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={isBase64 ? "" : value}
          disabled={!!isBase64}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#D9A323]/25 outline-none placeholder:text-[#9A8A68] text-[#142C24] disabled:opacity-50"
        />
        {isBase64 && (
          <p className="text-[10px] text-[#B87D16] mt-1 font-semibold font-poppins">
            Using uploaded file. Clear image to paste a custom URL.
          </p>
        )}
      </div>
    </div>
  );
};

export default function JoinCaterer() {
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("caterer_join_form_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.step === "number") {
          return parsed.step;
        }
      }
    } catch (e) {}
    return 1;
  });
  const [status, setStatus] = useState<"form" | "pending" | "approved">("form");
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [menuPackages, setMenuPackages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("caterer_join_form_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.menuPackages)) {
          return parsed.menuPackages;
        }
      }
    } catch (e) {}
    return [];
  });
  const [isParsing, setIsParsing] = useState(false);
  const [isUsernameManual, setIsUsernameManual] = useState(false);
  const [showNoPackagesConfirm, setShowNoPackagesConfirm] = useState(false);

  const popularAreas = [
    "Kondapur",
    "Gachibowli",
    "Kukatpally",
    "Madhapur",
    "Banjara Hills",
    "Jubilee Hills",
    "Begumpet",
    "Secunderabad",
  ];

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      owner: "",
      phone: "",
      alternatePhone: "",
      additionalMobile: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",

      businessName: "",
      experience: "",
      address: "",
      latitude: null as number | null,
      longitude: null as number | null,
      serviceRadiusKm: 15,
      city: "",
      serviceAreas: "",
      description: "",
      awards: "",
      achievements: "",
      galleryPhotos: [] as string[],
      catererLogo: "",
      coverBanner: "",
      founderPhoto: "",
      branchPhoto: "",

      aadhaarFile: "",
      panFile: "",
      fssaiFile: "",
      gstFile: "",
      otherDocs: "",
      email_verified: false,
    };

    try {
      const saved = localStorage.getItem("caterer_join_form_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          return { ...defaultData, ...parsed.formData };
        }
      }
    } catch (e) {}
    return defaultData;
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  const hyderabadAreasList = [
    "Madhapur",
    "Madinaguda",
    "Madhura Nagar",
    "Manikonda",
    "Gachibowli",
    "Jubilee Hills",
    "Banjara Hills",
    "Kondapur",
    "Kukatpally",
    "Miyapur",
    "Hitech City",
    "Begumpet",
    "Secunderabad",
    "Ameerpet",
    "Himayatnagar",
    "Nallagandla",
    "Nizampet",
    "Hafeezpet",
    "Shaikpet",
    "Tolichowki",
    "Mehdipatnam",
    "Attapur",
    "Somajiguda",
    "Koti",
    "Uppal",
    "L.B. Nagar",
    "Tarnaka",
    "Alwal",
    "Bowenpally",
    "Jeedimetla",
    "Bachupally",
    "Pragathi Nagar",
    "Lingampally",
    "Chanda Nagar",
    "Patancheru",
    "Financial District",
    "Kokapet",
    "Gandipet",
    "Narsingi",
    "Karkhana",
    "Sainikpuri",
    "Kothapet",
    "Dilsukhnagar",
    "Malakpet",
    "Charminar",
    "Nampally",
    "Khairatabad",
    "Srinagar Colony",
    "Yousufguda",
    "Moosapet",
    "Sanathnagar"
  ];

  // Auto-save progress to localStorage draft caching
  React.useEffect(() => {
    const draftPayload = {
      formData: {
        ...formData,
        email_verified: true,
      },
      step,
      menuPackages,
    };
    localStorage.setItem(
      "caterer_join_form_data",
      JSON.stringify(draftPayload),
    );
  }, [formData, step, menuPackages]);

  // Clean up localStorage draft on successful submission
  React.useEffect(() => {
    if (status === "pending") {
      localStorage.removeItem("caterer_join_form_data");
    }
  }, [status]);

  const serviceAreaChips = formData.serviceAreas
    ? formData.serviceAreas
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean)
    : [];

  const filteredAreaSuggestions = areaSearch.trim().length >= 1
    ? hyderabadAreasList.filter(area => {
        const query = areaSearch.toLowerCase();
        const lowerArea = area.toLowerCase();
        if (lowerArea.includes(query)) return true;
        // Prompt example: "Mad" should show "Manikonda"
        if (query === 'mad' && lowerArea === 'manikonda') return true;
        return false;
      })
    : [];

  const addServiceAreaChip = (area: string) => {
    const current = formData.serviceAreas
      ? formData.serviceAreas
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [];
    if (!current.includes(area)) {
      current.push(area);
      setFormData({ ...formData, serviceAreas: current.join(", ") });
    }
  };

  const removeServiceAreaChip = (area: string) => {
    const current = formData.serviceAreas
      ? formData.serviceAreas
          .split(",")
          .map((x: string) => x.trim())
          .filter(Boolean)
      : [];
    const filtered = current.filter(
      (x) => x.toLowerCase() !== area.toLowerCase(),
    );
    setFormData({ ...formData, serviceAreas: filtered.join(", ") });
  };

  const generateUsernameFromBusinessName = (name: string) => {
    if (!name) return "";
    const clean = name.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return "";
    const base = clean.substring(0, 5);

    const raw = localStorage.getItem("registrations") || "[]";
    let registrationsLocal = [];
    try {
      registrationsLocal = JSON.parse(raw);
    } catch (e) {}

    let candidate = base;
    let attempt = 1;
    const usernameExists = (uname: string) =>
      registrationsLocal.some(
        (r: any) => (r.username || "").toLowerCase() === uname.toLowerCase(),
      );

    while (usernameExists(candidate)) {
      const numStr = attempt < 10 ? `0${attempt}` : `${attempt}`;
      candidate = `${base.substring(0, 5 - numStr.length)}${numStr}`;
      attempt++;
    }
    return candidate;
  };

  React.useEffect(() => {
    if (!isUsernameManual && formData.businessName) {
      const generated = generateUsernameFromBusinessName(formData.businessName);
      setFormData((prev) => ({ ...prev, username: generated }));
    }
  }, [formData.businessName, isUsernameManual]);

  const handleCatererDetailsExtracted = (details: any) => {
    setFormData((prev) => ({
      ...prev,
      businessName: prev.businessName || details.businessName || "",
      ownerName: prev.ownerName || details.ownerName || "",
      mobile: prev.mobile || details.primaryWhatsApp || details.phone || "",
      alternateMobile:
        prev.alternateMobile ||
        details.secondaryPhone ||
        details.alternatePhone ||
        "",
      additionalMobile: prev.additionalMobile || details.additionalPhone || "",
      location: prev.location || details.address || "",
      city: prev.city || details.city || "",
      catererLogo: prev.catererLogo || details.logoUrl || "",
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (menuPackages.length === 0) {
        setShowNoPackagesConfirm(true);
        return;
      }
    } else if (step === 2) {
      if (
        !formData.owner ||
        !formData.phone ||
        !formData.email ||
        !formData.username ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast("Please fill all basic details.", "error");
        return;
      }
      if (formData.password.length < 6) {
        toast("Password must be at least 6 characters.", "error");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast("Passwords do not match.", "error");
        return;
      }
    } else if (step === 3) {
      if (!formData.businessName || !formData.address || !formData.city) {
        toast(
          "Please fill the mandatory Business Details (Name, Location, City).",
          "error",
        );
        return;
      }
    }

    setStep((s) => Math.min(5, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const publicUrl = await uploadToSupabaseBucket(
          "documents",
          fileName,
          file,
          file.type,
        );
        if (publicUrl) {
          setFormData((prev) => ({ ...prev, [field]: publicUrl }));
          return;
        }
      }
    } catch (storageErr) {
      console.warn("Document scan upload failed:", storageErr);
    }

    setFormData((prev) => ({ ...prev, [field]: file.name }));
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray: File[] = Array.from(files);

    const uploadedUrls: string[] = [];
    const localFiles: File[] = [];

    for (const file of fileArray) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
          const publicUrl = await uploadToSupabaseBucket(
            "gallery-images",
            fileName,
            file,
            file.type,
          );
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
      setFormData((prev) => ({
        ...prev,
        galleryPhotos: [...prev.galleryPhotos, ...uploadedUrls],
      }));
    }

    if (localFiles.length > 0) {
      const promises = localFiles.map((file: File) => {
        return compressImageFile(file, 600, 600, 0.75).catch(() => file.name);
      });

      Promise.all(promises).then((base64s) => {
        setFormData((prev) => ({
          ...prev,
          galleryPhotos: [...prev.galleryPhotos, ...base64s],
        }));
      });
    }
  };

  const removeGalleryPhoto = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryPhotos: prev.galleryPhotos.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    // Validate that required fields are filled out on submit
    if (!formData.email || !formData.password || !formData.username) {
      toast("Please ensure email, username, and password are completed first.", "error");
      return;
    }

    setSubmitLoading(true);

    const payload = {
      businessName: formData.businessName,
      ownerName: formData.owner,
      email: formData.email,
      phone: formData.phone,
      alternateMobile: formData.alternatePhone,
      additionalMobile: formData.additionalMobile,
      username: formData.username,
      password: formData.password,
      menuPackages: menuPackages,
      location: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      city: formData.city,
      catererLogo: formData.catererLogo,
      coverBanner: formData.coverBanner,
      founderPhoto: formData.founderPhoto,
      branchPhoto: formData.branchPhoto,
      galleryPhotos: formData.galleryPhotos,
    };

    console.log(
      "[JOIN CATERER FLOW] Directly submitting registration payload:",
      payload,
    );
    try {
      const response = await fetch("/api/register/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      setSubmitLoading(false);

      if (!response.ok) {
        throw new Error(resData.error || "Failed to submit registration.");
      }

      toast("Application submitted! Awaiting Admin Approval.", "success");

      const defaultAchievements = [
        { value: "400+", title: "Events Completed", icon: "trophy" },
        { value: "15+", title: "Years Experience", icon: "award" },
        { value: "2500+", title: "Happy Customers", icon: "users" },
        { value: "120+", title: "Menu Items", icon: "clipboard" },
        { value: "75+", title: "Premium Events Served", icon: "chef-hat" },
        { value: "4.9", title: "Average Rating", icon: "star" }
      ];

      const newReg = {
        businessName: formData.businessName,
        owner: formData.owner,
        ownerName: formData.owner,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        additionalPhone: formData.additionalMobile,
        username: formData.username,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        branchesList: [
          {
            name: "Main Branch",
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude
          }
        ],
        city: formData.city,
        status: "Pending Approval",
        logo: formData.catererLogo,
        coverBanner: formData.coverBanner,
        founderImageUrl: formData.founderPhoto,
        ownerPhoto: formData.founderPhoto,
        branchPhoto: formData.branchPhoto,
        galleryPhotos: formData.galleryPhotos,
        gallery: formData.galleryPhotos,
        packages: menuPackages,
        draftMenuPackages: menuPackages,
        achievements: defaultAchievements,
        achievementsList: defaultAchievements,
        id: resData.id || Math.random().toString(36).substr(2, 9),
      };

      const existing = JSON.parse(
        localStorage.getItem("registrations") || "[]",
      );
      safeSaveRegistrations([...existing, newReg]);

      storeNotification(
        "",
        "New Partner Registration 🏢",
        `Partner "${newReg.businessName}" completed registration. Under review!`,
        "admin",
      );

      localStorage.removeItem("caterer_join_form_data");
      setStatus("pending");
    } catch (err: any) {
      setSubmitLoading(false);
      console.error("[REGISTRATION ERROR] Submit failed:", err);
      toast(err.message || err.toString(), "error");
    }
  };

  if (status === "pending") {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-[#01291D] via-[#023A28] to-[#011B13] font-poppins flex flex-col items-center justify-center py-20 px-4 overflow-hidden text-[#FFFDF8]">
        {/* Decorative background light sources */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D9A323]/10 rounded-full blur-[120px] pointer-events-none select-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#035C41]/30 rounded-full blur-[140px] pointer-events-none select-none" />

        {/* Content container */}
        <div className="max-w-2xl w-full text-center relative z-10 animate-in fade-in duration-700">
          {/* Header brand logo */}
          <div className="flex flex-col items-center mb-8 select-none">
            <img
              src="/assets/aistudio/image_6ce019e3.png"
              alt="PlanMyChoice"
              className="w-52 h-auto object-contain brightness-105 contrast-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] mb-1"
            />
            <p className="text-[10px] tracking-[0.2em] text-[#F8D76A] font-bold font-poppins uppercase">
              Making Every Event Special
            </p>
          </div>

          {/* Laurel wreath check indicator */}
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center select-none">
            <div className="absolute inset-0 bg-[#D9A323]/10 rounded-full border border-[#D9A323]/25" />
            <div className="absolute inset-3 bg-[#D9A323]/15 rounded-full border border-[#D9A323]/35" />

            <div className="absolute -inset-1 flex justify-between items-center px-1 pointer-events-none text-[#F8D76A]/70">
              <div className="text-xl rotate-[-25deg] font-serif">✿ ✿ ✿</div>
              <div className="text-xl rotate-[25deg] font-serif">✿ ✿ ✿</div>
            </div>

            {/* Inner central gold check circle */}
            <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-[#C28816] via-[#F2BE3B] to-[#FCE69A] shadow-[0_10px_28px_rgba(217,163,35,0.4)] flex items-center justify-center relative">
              <Check size={40} className="text-[#052419]" strokeWidth={4} />

              <div className="absolute -top-1 -right-1 text-[#FFFDF8]">
                <Sparkles size={16} />
              </div>
              <div className="absolute -bottom-1 -left-1 text-[#FCE69A]">
                <Sparkles size={12} />
              </div>
            </div>
          </div>

          {/* Primary Submit Success heading */}
          <h2
            className="text-3xl sm:text-4xl font-display font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#FCE69A] to-[#F5C642] mt-6 mb-3"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Application Submitted!
          </h2>
          <p className="text-[#E7EFEA]/85 text-sm max-w-md mx-auto font-poppins leading-relaxed mb-8 font-light">
            Thank you for registering with PlanMyChoice. Your application is under
            review. Our team will verify your details and list your profile
            shortly.
          </p>

          {/* Custom Steps Progress Timeline */}
          <div className="bg-[#011F15]/80 border border-[#D9A323]/40 rounded-[2rem] p-6 sm:p-7 max-w-xl mx-auto mb-8 backdrop-blur-md text-left shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <span className="block text-[10px] font-bold text-[#F8D76A] uppercase tracking-widest mb-5 font-poppins">
              What happens next?
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-2 relative">
              <div className="absolute top-[16px] left-[16px] right-[16px] h-[1px] bg-[#D9A323]/25 hidden md:block select-none pointer-events-none" />

              {/* Stage 1: Submitted */}
              <div className="flex md:flex-col items-center md:text-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-emerald-300" strokeWidth={3} />
                </div>
                <div className="pt-0.5">
                  <p className="text-[11px] font-bold text-[#FFFDF8] uppercase tracking-wider md:leading-none">
                    Submitted
                  </p>
                  <p className="text-[9px] text-[#E7EFEA]/70 mt-0.5">
                    Application received
                  </p>
                </div>
              </div>

              {/* Stage 2: Under Review */}
              <div className="flex md:flex-col items-center md:text-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#D9A323]/20 border-2 border-[#F5C642] flex items-center justify-center shrink-0 shadow-[0_10px_25px_rgba(217,163,35,0.3)]">
                  <Clock size={14} className="text-[#F8D76A]" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[11px] font-bold text-[#F8D76A] uppercase tracking-wider md:leading-none">
                    Under Review
                  </p>
                  <p className="text-[9px] text-[#E7EFEA]/80 mt-0.5">
                    Checking qualifications
                  </p>
                </div>
              </div>

              {/* Stage 3: Moderation */}
              <div className="flex md:flex-col items-center md:text-center gap-3 relative z-10 opacity-45">
                <div className="w-8 h-8 rounded-full bg-[#023224] border border-[#D9A323]/40 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#F8D76A] font-sans">
                    3
                  </span>
                </div>
                <div className="pt-0.5">
                  <p className="text-[11px] font-bold text-[#E7EFEA] uppercase tracking-wider md:leading-none">
                    Approval
                  </p>
                  <p className="text-[9px] text-[#E7EFEA]/70 mt-0.5 font-normal">
                    Account activated
                  </p>
                </div>
              </div>

              {/* Stage 4: Live Listing */}
              <div className="flex md:flex-col items-center md:text-center gap-3 relative z-10 opacity-45">
                <div className="w-8 h-8 rounded-full bg-[#023224] border border-[#D9A323]/40 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#F8D76A] font-sans">
                    4
                  </span>
                </div>
                <div className="pt-0.5">
                  <p className="text-[11px] font-bold text-[#E7EFEA] uppercase tracking-wider md:leading-none">
                    Public Live
                  </p>
                  <p className="text-[9px] text-[#E7EFEA]/70 mt-0.5 font-normal">
                    Receive bookings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time frame summary card */}
          <div className="inline-block bg-[#012218]/90 border border-[#D9A323]/40 rounded-2xl px-6 py-3.5 mb-8 backdrop-blur">
            <span className="text-[10px] text-[#F8D76A] font-bold block uppercase tracking-widest">
              Expected Verification Status
            </span>
            <span className="text-xs font-semibold text-[#FFFDF8] mt-0.5 block">
              Pending Review • 1 - 3 Business Days
            </span>
            <p className="text-[10px] text-[#E7EFEA]/75 mt-1">
              Status notification email:{" "}
              <span className="text-[#F8D76A] font-sans">
                {formData.email || "your registered email"}
              </span>
            </p>
          </div>

          {/* Footer Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#D9A323]/60 hover:bg-[#024230] text-[#FFFDF8] text-xs font-semibold transition-all cursor-pointer"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="w-full sm:w-auto bg-gradient-to-r from-[#FAE18D] via-[#E8B839] to-[#D2951B] hover:brightness-105 text-[#052419] px-7 py-2.5 rounded-full text-xs font-bold shadow-[0_8px_20px_rgba(217,163,35,0.28)] transition-all active:scale-95 cursor-pointer"
            >
              Explore Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[76px] pb-12 bg-gradient-to-br from-[#FAF3E3] via-[#FDF8EC] to-[#FAF0DC] min-h-screen font-poppins overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Top Feature Banner matching reference image */}
        <div className="relative rounded-[22px] border border-[#E4C987] shadow-[0_8px_28px_rgba(92,70,22,0.08)] overflow-hidden mb-5 bg-[#FFFDF8] animate-in slide-in-from-top-6 duration-500">
          {/* Split Cream-to-Emerald Swoop Backdrop */}
          <div className="pointer-events-none select-none hidden md:block absolute inset-0" aria-hidden="true">
            <svg viewBox="0 0 1200 130" fill="none" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="joinBannerEmerald" x1="340" y1="0" x2="1200" y2="130" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#04523A" />
                  <stop offset="55%" stopColor="#023A28" />
                  <stop offset="100%" stopColor="#012419" />
                </linearGradient>
                <linearGradient id="joinBannerGold" x1="280" y1="120" x2="1190" y2="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E6BC52" stopOpacity="0.15" />
                  <stop offset="45%" stopColor="#F5C642" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#D4971D" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path d="M295 130 C410 122 440 16 540 0 L1200 0 L1200 130 Z" fill="url(#joinBannerEmerald)" />
              <path d="M280 128 C410 125 450 22 575 4" stroke="url(#joinBannerGold)" strokeWidth="2.5" fill="none" />
              <path d="M890 126 C990 112 1085 68 1196 12" stroke="#F5C642" strokeOpacity="0.55" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 px-5 sm:px-7 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Brand Emblem */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#044530] to-[#01291C] border-2 border-[#D9A323] text-[#F5C642] flex items-center justify-center font-display font-bold text-base select-none shadow-md">
                PMC
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-lg text-[#0F241C] uppercase tracking-wider leading-none">
                    PlanMyChoice
                  </span>
                  <span className="text-[#D99B1E] text-base leading-none">★</span>
                </div>
                <p className="text-[10px] tracking-[0.14em] text-[#5C5240] font-bold uppercase leading-none mt-1.5">
                  Making Every Event Special
                </p>
              </div>
            </div>

            {/* Center AI Menu Extraction Visual Diagram */}
            <div className="hidden lg:flex items-center gap-4 select-none">
              <div className="relative p-2">
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E6C065] rounded-tl" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E6C065] rounded-tr" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E6C065] rounded-bl" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E6C065] rounded-br" />
                <div className="w-14 h-16 rounded-lg bg-[#FFF8E6] border border-[#E5BA4B] px-2 py-1.5 flex flex-col items-center justify-between shadow-sm">
                  <span className="text-[7px] font-extrabold tracking-widest text-[#B87D16] uppercase">▲ Menu</span>
                  <div className="w-6 h-3.5 rounded-t-full bg-[#DFA833]/85 border-b border-[#B87D16]" />
                  <div className="w-full space-y-1">
                    <div className="h-1 bg-[#D9B86C] rounded-full w-full" />
                    <div className="h-1 bg-[#D9B86C] rounded-full w-4/5" />
                    <div className="h-1 bg-[#D9B86C] rounded-full w-3/4" />
                  </div>
                </div>
              </div>

              <svg width="46" height="16" viewBox="0 0 46 16" fill="none" aria-hidden="true">
                <path d="M2 8 H40 M34 3 L41 8 L34 13" stroke="#F5C642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div className="w-12 h-12 rounded-xl bg-[#03402D] border-2 border-[#F5C642] flex items-center justify-center text-[#F5C642] font-display font-bold text-base shadow-[0_0_18px_rgba(245,198,66,0.28)]">
                AI
              </div>
            </div>

            {/* Right Feature Checklist Box */}
            <div className="w-full md:w-auto rounded-xl bg-gradient-to-br from-[#023525] to-[#012016] border border-[#D9A323]/45 px-4 py-2.5 text-[#FDF8EC] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-1 text-[11.5px] font-medium">
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#F5C642] shrink-0" strokeWidth={2.8} />
                  <span>Extract Menu Items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#F5C642] shrink-0" strokeWidth={2.8} />
                  <span>Identify Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-[#F5C642] shrink-0" strokeWidth={2.8} />
                  <span>Suggest Pricing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Registration Progress Sidebar */}
          <div className="w-full lg:w-[295px] shrink-0">
            <div className="bg-[#FFFDF8] rounded-[24px] shadow-[0_8px_28px_rgba(92,70,22,0.08)] border border-[#E4C987] overflow-hidden lg:sticky lg:top-[76px] animate-in slide-in-from-left-6 duration-500">
              {/* Dark Emerald Top Header Block */}
              <div className="bg-gradient-to-br from-[#023A28] via-[#033223] to-[#012217] px-5 py-4 border-b-2 border-[#D9A323] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A4633] border border-[#D9A323]/55 flex items-center justify-center text-[#F5C642] shrink-0 shadow-xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-[12px] tracking-[0.08em] text-[#FFFDF8] uppercase leading-tight">
                    Registration Progress
                  </h3>
                  <p className="text-[11px] text-[#E6ECE8]/85 mt-1 leading-snug">
                    Complete 5 simple steps to get listed on PlanMyChoice
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-5 relative">
                <JoinSteps currentStep={step} />

                {/* Sidebar Support Widget */}
                <div className="bg-[#FCF7E8] rounded-2xl p-4 border border-[#EAE0C8] relative z-10">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FAF0D4] border border-[#E4C987] flex items-center justify-center text-[#B87D16] shrink-0">
                      <Headphones size={15} />
                    </div>
                    <h4 className="font-bold text-sm text-[#0F241C] font-poppins">
                      Need Help?
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#5C5240] mb-3.5 leading-relaxed font-poppins">
                    Have questions about registration? Our onboarding team is here to assist you.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open("https://wa.me/919999999999", "_blank")
                    }
                    className="w-full bg-gradient-to-r from-[#024731] to-[#013122] hover:from-[#03583D] hover:to-[#023C2A] border border-[#D9A323]/45 text-[#FFFDF8] font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <MessageCircle size={14} className="text-[#F5C642]" />
                    <span>Chat with Support</span>
                  </button>
                </div>

                {/* Subtle Bottom Gold Cloche Accent */}
                <svg
                  viewBox="0 0 260 54"
                  fill="none"
                  className="pointer-events-none select-none w-full h-11 opacity-75"
                  aria-hidden="true"
                >
                  <path d="M0 44 C68 54 146 28 260 12 L260 54 L0 54 Z" fill="#F5E6C2" fillOpacity="0.65" />
                  <circle cx="130" cy="14" r="3" fill="#DFA833" />
                  <path d="M98 40 C98 24 112 16 130 16 C148 16 162 24 162 40 Z" fill="#E6BC52" fillOpacity="0.55" />
                  <rect x="92" y="40" width="76" height="3.5" rx="1.75" fill="#C48E22" fillOpacity="0.7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Wizard Form container card */}
          <div className="flex-1 w-full min-w-0 bg-[#FFFDF8] rounded-[24px] shadow-[0_8px_28px_rgba(92,70,22,0.08)] border border-[#E4C987] overflow-hidden min-h-[540px] flex flex-col justify-between animate-in fade-in duration-500">
            {/* Internal Step Header Banner */}
            <div className="bg-gradient-to-r from-[#FCF7EA] via-[#FFFDF8] to-[#FCF7EA] border-b border-[#EFE3C4] px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-[3px] h-4 rounded-full bg-gradient-to-b from-[#E8BA42] to-[#B77A12]" />
                <span className="text-xs text-[#0F3D2E] font-extrabold uppercase tracking-wider font-poppins">
                  {step === 1 && "1. MENU EXTRACTION"}
                  {step === 2 && "2. CONTACT DETAILS"}
                  {step === 3 && "3. BRAND & OPERATIONS"}
                  {step === 4 && "4. BACKUP VERIFICATION"}
                  {step === 5 && "5. FINAL CONFIRMATION"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] text-[#5C5240] bg-[#FAF3E3] border border-[#E6CA82] px-2.5 py-1 rounded-full font-bold font-poppins">
                  Step {step} of 5
                </span>
                <button
                  type="button"
                  onClick={() => {
                    toast(
                      "Draft saved successfully! You can resume registration anytime.",
                      "success",
                    );
                  }}
                  className="text-[11px] font-bold px-3 py-1 rounded-full border border-[#DFC689] text-[#0F3D2E] hover:bg-[#FAF0D4] transition-all flex items-center gap-1 bg-white cursor-pointer"
                >
                  <Save size={12} className="text-[#B87D16]" /> Save Draft
                </button>
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#FAF0D4] border border-[#E4C987] text-[#6B4A10] px-3 py-1 rounded-full font-bold font-poppins">
                  <Lock size={11} className="text-[#C48E22]" /> Safe &amp; Secure
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7 flex-1">
              {/* STEP 1: Menu Upload & AI Scan */}
              {step === 1 && (
                <div className="font-poppins animate-in fade-in duration-300">
                  <CatererMenuBuilder
                    packages={menuPackages}
                    onChange={setMenuPackages}
                    isParsing={isParsing}
                    setIsParsing={setIsParsing}
                    onCatererDetailsExtracted={handleCatererDetailsExtracted}
                  />
                </div>
              )}

              {/* STEP 2: Basic Details */}
              {step === 2 && (
                <div className="space-y-6 font-poppins animate-in fade-in duration-300">
                  <div>
                    <h3
                      className="font-display font-bold text-2xl text-[#083A28] mb-1"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Caterer Contact Information
                    </h3>
                    <p className="text-xs text-[#6B5A38] font-poppins">
                      Provide the owner contacts and account credentials for
                      your Caterer Panel login.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Owner Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.owner}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              owner: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Enter owner's full legal name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Mobile Number <span className="text-red-500">*</span>{" "}
                          (Primary WhatsApp Number)
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Line 2: Secondary Number
                        </label>
                        <input
                          type="text"
                          value={formData.alternatePhone || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alternatePhone: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="e.g. Backup manager number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Line 3: Additional Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.additionalMobile || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              additionalMobile: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24] mb-4"
                          placeholder="e.g. backup or landline"
                        />
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              email: val,
                            });
                          }}
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24] font-sans"
                          placeholder="e.g. delicious@caterer.com"
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center my-6">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-[#DFC78A]/70"></div>
                      </div>
                      <div className="relative bg-[#FFFDF8] px-4 text-xs font-bold text-[#8A754A] font-poppins uppercase tracking-wider">
                        Choose Login Credentials
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Choose Username{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => {
                            setIsUsernameManual(true);
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            });
                          }}
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="e.g. gourmet_kitchens"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Choose Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Choose a secure password"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Retype password to confirm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Shield Callout block */}
                  <div className="p-4 bg-[#FAF3E2]/70 border border-[#DFC78A] rounded-2xl flex items-start gap-3 mt-6">
                    <span className="w-8 h-8 rounded-full bg-[#01291D] text-[#F8D76A] border border-[#D9A323]/60 flex items-center justify-center shrink-0">
                      <Lock size={15} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#083A28] leading-none font-poppins">
                        Security Encryption
                      </h4>
                      <p className="text-[11px] text-[#5C5240] mt-1 leading-normal font-poppins">
                        Your password and confidential business logs are fully
                        hashed and encrypted. We never share or sell onboarding
                        registry records.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Business Details */}
              {step === 3 && (
                <div className="space-y-6 font-poppins animate-in fade-in duration-300">
                  <div>
                    <h3
                      className="font-display font-bold text-2xl text-[#083A28] mb-1"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Business Setup &amp; Branding
                    </h3>
                    <p className="text-xs text-[#6B5A38]">
                      How customers see your brand listing. Add high quality
                      logos and banner assets.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Caterer Name / Brand Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessName: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="e.g. Royal Taste Caterers"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Years of Experience{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="e.g. Hyderabad"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wider">
                            Kitchen Office Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className="text-xs font-bold text-[#B87D16] hover:text-[#8E5F0F] transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>📍 Pick Branch Location</span>
                          </button>
                        </div>
                        <AddressAutocomplete
                          value={formData.address}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              address: val,
                            })
                          }
                          onSelect={(data) => {
                            setFormData({
                              ...formData,
                              address: data.address,
                              latitude: data.latitude,
                              longitude: data.longitude,
                            });
                          }}
                          placeholder="Enter complete physical address of central kitchen"
                          theme="gold"
                          leftIcon={<MapPin className="text-[#D4961B] w-4 h-4 hover:text-[#B87D16] transition-colors" />}
                          onIconClick={() => setIsMapOpen(true)}
                          className="bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all"
                        />
                        {formData.latitude && formData.longitude && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B5A38] font-medium">
                            <span>📍 Serving location set. Delivery coverage:</span>
                            <span className="font-bold text-[#7B5610] bg-[#FAF1DA] border border-[#DFC78A] rounded-full px-2.5 py-0.5">{formData.serviceRadiusKm || 15} KM radius</span>
                          </div>
                        )}
                        <MapPickerModal
                          isOpen={isMapOpen}
                          onClose={() => setIsMapOpen(false)}
                          initialLat={formData.latitude}
                          initialLng={formData.longitude}
                          initialAddress={formData.address}
                          showRadius={true}
                          initialRadius={formData.serviceRadiusKm}
                          onSave={(data) => {
                            setFormData({
                              ...formData,
                              address: data.address,
                              latitude: data.latitude,
                              longitude: data.longitude,
                              serviceRadiusKm: data.serviceRadiusKm ?? formData.serviceRadiusKm
                            });
                          }}
                          title="Pick Kitchen Office Location"
                        />
                      </div>

                      {/* Service Areas with interactive quick chips and premium toggle */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wider">
                            Service Areas <span className="text-red-500">*</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={formData.serviceAreas === "Entire Hyderabad"}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, serviceAreas: "Entire Hyderabad" });
                                } else {
                                  setFormData({ ...formData, serviceAreas: "" });
                                }
                              }}
                              className="rounded border-[#DFC78A] text-[#083A28] focus:ring-[#D9A323] h-4 w-4"
                            />
                            <span className="text-xs font-bold text-[#B87D16] uppercase tracking-wider">
                              Serve Entire Hyderabad
                            </span>
                          </label>
                        </div>

                        {formData.serviceAreas === "Entire Hyderabad" ? (
                          <div className="p-4 bg-[#FAF1DA]/75 border border-[#DFC78A] rounded-2xl flex items-center gap-3">
                            <span className="text-[#B87D16] text-lg">🌐</span>
                            <div>
                              <p className="text-xs font-bold text-[#083A28]">Serving Entire Hyderabad Area</p>
                              <p className="text-[10px] text-[#5C5240] mt-0.5">Your catering services will be listed as available across all locations in Hyderabad.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search & add service areas in Hyderabad (e.g. Madhapur)..."
                                value={areaSearch}
                                onChange={(e) => {
                                  setAreaSearch(e.target.value);
                                  setIsAreaDropdownOpen(true);
                                }}
                                onFocus={() => setIsAreaDropdownOpen(true)}
                                className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                              />
                              {isAreaDropdownOpen && filteredAreaSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-[#FFFDF8] border border-[#DFC78A] rounded-xl shadow-xl max-h-48 overflow-y-auto z-[999]">
                                  <div className="p-1.5 divide-y divide-[#DFC78A]/40">
                                    {filteredAreaSuggestions.map((area) => (
                                      <button
                                        key={area}
                                        type="button"
                                        onClick={() => {
                                          addServiceAreaChip(area);
                                          setAreaSearch("");
                                          setIsAreaDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2.5 hover:bg-[#FAF3E2] text-xs font-medium text-[#142C24] transition rounded-lg flex items-center gap-2"
                                      >
                                        <span className="text-[#D4961B]">📍</span> {area}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Selected Chips */}
                            {serviceAreaChips.length > 0 && (
                              <div className="flex flex-wrap gap-2 py-1">
                                {serviceAreaChips.map((area) => (
                                  <span
                                    key={area}
                                    className="inline-flex items-center gap-1.5 bg-[#FAF1DA] text-[#083A28] border border-[#D9A323]/65 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                                  >
                                    {area}
                                    <button
                                      type="button"
                                      onClick={() => removeServiceAreaChip(area)}
                                      className="text-[#B87D16] hover:text-[#083A28] hover:bg-[#F3E6C6] rounded-full p-0.5 transition"
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Quick selection popular areas */}
                            <div className="pt-1">
                              <span className="block text-[10px] text-[#8A754A] font-bold uppercase tracking-wider mb-2">
                                Popular Hyderabad Areas
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {popularAreas.map((area, sIdx) => {
                                  const contains = serviceAreaChips.some(
                                    (x) => x.toLowerCase() === area.toLowerCase(),
                                  );
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() =>
                                        contains
                                          ? removeServiceAreaChip(area)
                                          : addServiceAreaChip(area)
                                      }
                                      className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-full border transition-all uppercase tracking-wide cursor-pointer",
                                        contains
                                          ? "bg-gradient-to-r from-[#FAE18D] via-[#F2BE3B] to-[#D99B16] border-[#D4961B] text-[#052419] shadow"
                                          : "bg-[#FAF3E2]/70 border-[#DFC78A] text-[#5C5240] hover:bg-[#F3E6C6]",
                                      )}
                                    >
                                      {contains ? "✓" : "+"} {area}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description with visual WYSIWYG editor mockup toolbar */}
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Public Description{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-wrap items-center gap-1 bg-[#FAF3E2] border border-[#DFC78A] border-b-0 px-3 py-1.5 rounded-t-xl text-[#6B5A38] select-none">
                          <button
                            type="button"
                            className="p-1 hover:bg-[#FFFDF8] hover:text-[#083A28] rounded transition-colors"
                            title="Bold"
                          >
                            <Bold size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-[#FFFDF8] hover:text-[#083A28] rounded transition-colors"
                            title="Italic"
                          >
                            <Italic size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-[#FFFDF8] hover:text-[#083A28] rounded transition-colors"
                            title="Underline"
                          >
                            <Underline size={13} />
                          </button>
                          <div className="w-[1px] h-3 bg-[#DFC78A] mx-1" />
                          <button
                            type="button"
                            className="p-1 hover:bg-[#FFFDF8] hover:text-[#083A28] rounded transition-colors"
                            title="List"
                          >
                            <List size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-[#FFFDF8] hover:text-[#083A28] rounded transition-colors"
                            title="Numbered List"
                          >
                            <ListOrdered size={13} />
                          </button>
                          <div className="w-[1px] h-3 bg-[#DFC78A] mx-1" />
                          <span className="text-[9px] font-bold text-[#8A754A] ml-auto uppercase tracking-wider font-poppins">
                            Visual Editor
                          </span>
                        </div>

                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-b-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Write details about your cuisine specialties, corporate history, client list, safety certifications..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Awards (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.awards}
                          onChange={(e) =>
                            setFormData({ ...formData, awards: e.target.value })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Best Caterer Award 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#083A28] mb-1 uppercase tracking-wider">
                          Achievements (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.achievements}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              achievements: e.target.value,
                            })
                          }
                          className="w-full bg-[#FFFDF9] border border-[#DFC78A] focus:border-[#D4961B] focus:bg-[#FFFDF8] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#D9A323]/15 outline-none transition-all text-[#142C24]"
                          placeholder="Served 500+ premium wedding events"
                        />
                      </div>
                    </div>

                    <div className="pt-6 mt-8 border-t border-[#DFC78A]/60">
                      <h3
                        className="font-display font-bold text-lg text-[#083A28] mb-4 flex items-center gap-1.5"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        <Sparkles size={16} className="text-[#D4961B]" />{" "}
                        Profile Media &amp; Branding Assets
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <ImageUploaderField
                          label="Caterer Logo Upload (500x500)"
                          value={formData.catererLogo}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              catererLogo: val,
                            }))
                          }
                          placeholder="e.g. Paste logo photo URL"
                        />
                        <ImageUploaderField
                          label="Cover Banner Upload (1600x600)"
                          value={formData.coverBanner}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              coverBanner: val,
                            }))
                          }
                          placeholder="e.g. Paste banner hero URL"
                        />
                        <ImageUploaderField
                          label="Founder / Chef Headshot (500x500)"
                          value={formData.founderPhoto}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              founderPhoto: val,
                            }))
                          }
                          placeholder="e.g. Paste portrait URL"
                        />
                        <ImageUploaderField
                          label="Branch / Front Outlet Photo (Optional)"
                          value={formData.branchPhoto}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              branchPhoto: val,
                            }))
                          }
                          placeholder="e.g. Paste storefront image URL"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-[#083A28] uppercase tracking-wider font-poppins">
                          Gallery Showcase Images{" "}
                          <span className="text-[#8A754A] font-normal capitalize font-poppins">
                            (Food Prep, Live Stalls, Catering Teams)
                          </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {formData.galleryPhotos.map((photo, i) => {
                            const isImage =
                              photo.startsWith("data:image/") ||
                              photo.startsWith("http://") ||
                              photo.startsWith("https://");
                            return (
                              <div
                                key={i}
                                className="relative aspect-video rounded-xl border border-[#DFC78A] bg-[#FAF3E2]/45 flex items-center justify-center overflow-hidden group shadow-sm hover:shadow transition-shadow"
                              >
                                {isImage ? (
                                  <img
                                    src={photo}
                                    alt={`Gallery ${i}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="p-2 text-center text-xs text-[#6B5A38] font-medium truncate max-w-full font-poppins">
                                    {photo}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeGalleryPhoto(i)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remove Image"
                                >
                                  <span className="block text-sm font-bold leading-none">
                                    ×
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                          <label className="aspect-video border-2 border-dashed border-[#DFC78A] bg-[#FAF3E2]/45 hover:bg-[#FAF1DA] hover:border-[#D4961B] rounded-xl cursor-pointer flex flex-col items-center justify-center text-xs font-bold text-[#083A28] transition-all gap-1 select-none text-center p-2">
                            <UploadCloud size={20} className="text-[#B87D16]" />
                            <span>+ Add Photo</span>
                            <span className="text-[9px] text-[#8A754A] font-normal font-poppins">
                              JPG, PNG, WEBP
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleGalleryUpload}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Documents Verification */}
              {step === 4 && (
                <div className="space-y-6 font-poppins animate-in fade-in duration-300">
                  <div>
                    <h3
                      className="font-display font-bold text-2xl text-[#083A28] mb-1"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Corporate Verification Docs
                    </h3>
                    <p className="text-xs text-[#6B5A38] font-poppins">
                      Provide legal identification and licensing scans to
                      fast-track moderation. Safe and encrypted storage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Aadhaar card uploader */}
                    <div className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-5 rounded-2xl relative flex flex-col justify-between min-h-[180px]">
                      <div>
                        <h4 className="font-bold text-sm text-[#083A28] flex items-center justify-between font-poppins">
                          Aadhaar Card{" "}
                          <span className="text-[10px] font-normal text-[#8A754A] uppercase font-poppins">
                            Optional
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#6B5A38] mt-0.5 font-poppins">
                          Owner or company signatory's ID scanned copy
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center justify-center border border-dashed border-[#DFC78A] hover:border-[#D4961B] bg-[#FFFDF8] rounded-xl py-2.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "aadhaarFile")}
                          />
                          <span className="text-xs font-semibold text-[#142C24] px-4 truncate flex items-center gap-2 font-poppins">
                            {formData.aadhaarFile ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <UploadCloud
                                size={14}
                                className="text-[#B87D16] shrink-0"
                              />
                            )}
                            {formData.aadhaarFile || "Upload Aadhaar PDF/Image"}
                          </span>
                        </label>
                      </div>
                      {formData.aadhaarFile && (
                        <span className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>

                    {/* PAN Card uploader */}
                    <div className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-5 rounded-2xl relative flex flex-col justify-between min-h-[180px]">
                      <div>
                        <h4 className="font-bold text-sm text-[#083A28] flex items-center justify-between font-poppins">
                          PAN Card{" "}
                          <span className="text-[10px] font-normal text-[#8A754A] uppercase font-poppins">
                            Optional
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#6B5A38] mt-0.5 font-poppins">
                          Corporate PAN or Proprietor PAN certificate scan
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center justify-center border border-dashed border-[#DFC78A] hover:border-[#D4961B] bg-[#FFFDF8] rounded-xl py-2.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "panFile")}
                          />
                          <span className="text-xs font-semibold text-[#142C24] px-4 truncate flex items-center gap-2 font-poppins">
                            {formData.panFile ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <UploadCloud
                                size={14}
                                className="text-[#B87D16] shrink-0"
                              />
                            )}
                            {formData.panFile || "Upload PAN Scan"}
                          </span>
                        </label>
                      </div>
                      {formData.panFile && (
                        <span className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>

                    {/* FSSAI License */}
                    <div className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-5 rounded-2xl relative flex flex-col justify-between min-h-[180px]">
                      <div>
                        <h4 className="font-bold text-sm text-[#083A28] flex items-center justify-between font-poppins">
                          FSSAI Licence{" "}
                          <span className="text-[10px] font-normal text-[#8A754A] uppercase font-poppins">
                            Optional
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#6B5A38] mt-0.5 font-poppins">
                          Food Safety Standard Authority registry certificate
                          copy
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center justify-center border border-dashed border-[#DFC78A] hover:border-[#D4961B] bg-[#FFFDF8] rounded-xl py-2.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "fssaiFile")}
                          />
                          <span className="text-xs font-semibold text-[#142C24] px-4 truncate flex items-center gap-2 font-poppins">
                            {formData.fssaiFile ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <UploadCloud
                                size={14}
                                className="text-[#B87D16] shrink-0"
                              />
                            )}
                            {formData.fssaiFile ||
                              "Upload FSSAI License Certificate"}
                          </span>
                        </label>
                      </div>
                      {formData.fssaiFile && (
                        <span className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>

                    {/* GST Certificate */}
                    <div className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-5 rounded-2xl relative flex flex-col justify-between min-h-[180px]">
                      <div>
                        <h4 className="font-bold text-sm text-[#083A28] flex items-center justify-between font-poppins">
                          GSTIN Form{" "}
                          <span className="text-[10px] font-normal text-[#8A754A] uppercase font-poppins">
                            Optional
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#6B5A38] mt-0.5 font-poppins">
                          Goods and Services Tax registration certificate copy
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center justify-center border border-dashed border-[#DFC78A] hover:border-[#D4961B] bg-[#FFFDF8] rounded-xl py-2.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "gstFile")}
                          />
                          <span className="text-xs font-semibold text-[#142C24] px-4 truncate flex items-center gap-2 font-poppins">
                            {formData.gstFile ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <UploadCloud
                                size={14}
                                className="text-[#B87D16] shrink-0"
                              />
                            )}
                            {formData.gstFile || "Upload GST Reg Form (REG-06)"}
                          </span>
                        </label>
                      </div>
                      {formData.gstFile && (
                        <span className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>

                    {/* Additional validation attachments */}
                    <div className="border border-[#DFC78A] bg-[#FAF3E2]/45 p-5 rounded-2xl relative flex flex-col justify-between min-h-[180px] md:col-span-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#083A28] flex items-center justify-between font-poppins">
                          Other ISO or Municipal Certificates{" "}
                          <span className="text-[10px] font-normal text-[#8A754A] uppercase font-poppins">
                            Optional
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#6B5A38] mt-0.5 font-poppins">
                          Any health clearance certificates from local
                          authorities or ISO standard copies
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center justify-center border border-dashed border-[#DFC78A] hover:border-[#D4961B] bg-[#FFFDF8] rounded-xl py-2.5 cursor-pointer transition-all">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "otherDocs")}
                          />
                          <span className="text-xs font-semibold text-[#142C24] px-4 truncate flex items-center gap-2 font-poppins">
                            {formData.otherDocs ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600 shrink-0"
                              />
                            ) : (
                              <UploadCloud
                                size={14}
                                className="text-[#B87D16] shrink-0"
                              />
                            )}
                            {formData.otherDocs ||
                              "Upload extra attachment files"}
                          </span>
                        </label>
                      </div>
                      {formData.otherDocs && (
                        <span className="absolute top-4 right-4 text-emerald-600">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Submit */}
              {step === 5 && (
                <div className="space-y-6 font-poppins animate-in fade-in duration-300">
                  <div className="text-left bg-gradient-to-br from-[#023224] via-[#012218] to-[#011610] p-6 rounded-2xl border border-[#D9A323]/60 mb-4 shadow-sm">
                    <h3
                      className="font-display font-bold text-xl text-[#FFFDF8] leading-none mb-1.5 flex items-center gap-2"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      <ShieldCheck size={20} className="text-[#F8D76A]" />{" "}
                      Verify &amp; Clear Application
                    </h3>
                    <p className="text-[#E7EFEA]/85 text-xs leading-relaxed font-poppins">
                      Please review your catering records before signing off for
                      onboarding clearance. Approval verification generally
                      succeeds faster when details match document archives.
                    </p>
                  </div>

                  {/* Card 1: Contact Details */}
                  <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-[#FAF3E2]/70 px-6 py-3 border-b border-[#DFC78A]/80 flex justify-between items-center">
                      <h4 className="font-bold text-[#083A28] text-xs uppercase tracking-wider font-poppins">
                        Owner &amp; Contacts
                      </h4>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[#B87D16] text-xs font-bold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Owner Name
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold font-poppins">
                          {formData.owner || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Mobile Number
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold font-poppins">
                          {formData.phone || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Email Signature
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold break-all font-poppins">
                          {formData.email || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Login Account
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold font-poppins">
                          @{formData.username || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Experience Slabs
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold font-poppins">
                          {formData.experience || "0"} Years
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#8A754A] uppercase font-bold mb-0.5 font-poppins">
                          Service Location
                        </span>
                        <span className="text-xs text-[#142C24] font-semibold font-poppins">
                          {formData.city || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Menus & Packages */}
                  <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-[#FAF3E2]/70 px-6 py-3 border-b border-[#DFC78A]/80 flex justify-between items-center">
                      <h4 className="font-bold text-[#083A28] text-xs uppercase tracking-wider font-poppins">
                        Public Offerings / Packages
                      </h4>
                      <button
                        onClick={() => setStep(1)}
                        className="text-[#B87D16] text-xs font-bold hover:underline cursor-pointer font-poppins"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="p-6 space-y-3">
                      {menuPackages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {menuPackages.map((pkg, i) => {
                            const sortedSlabs = pkg.pricingSlabs
                              ? [...pkg.pricingSlabs].sort(
                                  (a: any, b: any) => a.minGuests - b.minGuests,
                                )
                              : [];
                            const basePrice =
                              pkg.pricePerPlate || sortedSlabs[0]?.price || 0;
                            return (
                              <div
                                key={i}
                                className="border border-[#DFC78A]/85 rounded-xl p-4 bg-[#FAF3E2]/45 relative flex items-center justify-between animate-in fade-in duration-300"
                              >
                                <div>
                                  <span className="block font-bold text-[#083A28] text-sm leading-none mb-1 font-poppins">
                                    {pkg.packageName || "Package " + (i + 1)}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#8A754A] uppercase tracking-wider font-poppins">
                                    {pkg.categories?.length || 0} Categories
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-sans font-bold text-sm text-[#B87D16] block font-poppins">
                                    ₹{basePrice}
                                  </span>
                                  <span className="text-[10px] text-[#6B5A38] block font-poppins">
                                    per plate
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#8A754A] italic font-poppins">
                          No catering packages compiled.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Verification Credentials */}
                  <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-[#FAF3E2]/70 px-6 py-3 border-b border-[#DFC78A]/80 flex justify-between items-center">
                      <h4 className="font-bold text-[#083A28] text-xs uppercase tracking-wider font-poppins">
                        Corporate Documents Checklist
                      </h4>
                      <button
                        onClick={() => setStep(4)}
                        className="text-[#B87D16] text-xs font-bold hover:underline cursor-pointer font-poppins"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="bg-[#FAF3E2]/55 p-3 rounded-xl border border-[#DFC78A]/70">
                        <span className="block text-[9px] text-[#8A754A] font-bold uppercase tracking-wider mb-1.5 font-poppins">
                          Aadhaar Card
                        </span>
                        {formData.aadhaarFile ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-poppins">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-xs text-[#8A754A] font-poppins">
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="bg-[#FAF3E2]/55 p-3 rounded-xl border border-[#DFC78A]/70">
                        <span className="block text-[9px] text-[#8A754A] font-bold uppercase tracking-wider mb-1.5 font-poppins">
                          PAN Card
                        </span>
                        {formData.panFile ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-poppins">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-xs text-[#8A754A] font-poppins">
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="bg-[#FAF3E2]/55 p-3 rounded-xl border border-[#DFC78A]/70">
                        <span className="block text-[9px] text-[#8A754A] font-bold uppercase tracking-wider mb-1.5 font-poppins">
                          FSSAI License
                        </span>
                        {formData.fssaiFile ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-poppins">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-xs text-[#8A754A] font-poppins">
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="bg-[#FAF3E2]/55 p-3 rounded-xl border border-[#DFC78A]/70">
                        <span className="block text-[9px] text-[#8A754A] font-bold uppercase tracking-wider mb-1.5 font-poppins">
                          GST License
                        </span>
                        {formData.gstFile ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-poppins">
                            ✓ Attached
                          </span>
                        ) : (
                          <span className="text-xs text-[#8A754A] font-poppins">
                            N/A
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-[#FCF8EE]/80 px-5 sm:px-7 py-4 border-t border-[#EFE3C4] flex justify-between items-center mt-auto">
              <button
                onClick={handleBack}
                disabled={step === 1 || isParsing}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold font-poppins text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer",
                  step === 1 || isParsing
                    ? "opacity-0 pointer-events-none"
                    : "text-[#4A3B22] bg-[#FAF0D4] border border-[#E4C987] hover:bg-[#F3DFAB]",
                )}
              >
                <ChevronLeft size={14} /> Back
              </button>

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={isParsing}
                  className={cn(
                    "bg-gradient-to-r from-[#024731] to-[#013122] hover:from-[#03583D] hover:to-[#023C2A] border border-[#D9A323]/45 text-[#FFFDF8] px-7 py-2.5 rounded-xl font-bold font-poppins text-xs tracking-wide flex items-center gap-2 transition-all shadow-[0_6px_18px_rgba(1,49,34,0.22)] cursor-pointer",
                    isParsing ? "opacity-50 cursor-not-allowed" : "",
                  )}
                >
                  <span>Next Step</span>
                  <ChevronRight size={15} className="text-[#F5C642]" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-[#FAE18D] via-[#E8B839] to-[#D2951B] hover:brightness-105 text-[#052419] px-8 py-2.5 rounded-xl font-black font-poppins text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[0_6px_18px_rgba(217,163,35,0.28)] active:scale-95 cursor-pointer"
                >
                  Submit For Approval
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showNoPackagesConfirm && (
        <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-display font-bold text-[#083A28] mb-2">Continue Without Packages?</h3>
            <p className="text-sm text-[#5C5240] mb-6 leading-relaxed">
              You haven&apos;t added any menu packages yet. Are you sure you want to continue to the next step?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNoPackagesConfirm(false)}
                className="flex-1 py-2.5 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl text-xs hover:bg-[#FAF0D4] cursor-pointer"
              >
                Add Packages
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoPackagesConfirm(false);
                  setStep((s: number) => s + 1);
                }}
                className="flex-1 py-2.5 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
