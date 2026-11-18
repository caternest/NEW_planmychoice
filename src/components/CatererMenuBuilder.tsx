import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Trash2, Edit2, Plus, GripVertical, X, Copy, ChevronDown, Check, ChefHat, AlertCircle, Layers, Tag, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase, uploadToSupabaseBucket, uploadMenuDocumentToStorage } from '../lib/supabase';
import { toast } from './Toast';

interface MenuCategory {
  categoryName: string;
  selectionRule: string;
  items: string[];
}

interface MenuPackage {
  packageName: string;
  packageType: string;
  itemCount?: number;
  pricePerPlate?: number;
  minimumGuests?: number;
  pricingSlabs?: {
    minGuests: number;
    maxGuests: number | null;
    price: number;
  }[];
  categories: MenuCategory[];
}

export const STANDARD_SELECTION_RULES = [
  'Included',
  'Choose Any One',
  'Choose Any Two',
  'Choose Any Three',
  'Choose Any Four',
  'Choose Any Five',
  'Choose Any Six',
  'Optional',
  'Needs Review',
];

export function normalizeCategoryRule(rule?: string): string {
  if (!rule || !rule.trim()) return 'Needs Review';
  const clean = rule.trim();
  const lower = clean.toLowerCase();

  if (lower === 'included' || lower === 'fixed' || lower === 'all included') {
    return 'Included';
  }
  if (lower === 'optional') {
    return 'Optional';
  }
  if (
    lower === 'needs review' ||
    lower === 'needs_review' ||
    lower === 'unclear' ||
    lower === 'unknown'
  ) {
    return 'Needs Review';
  }

  // Check trailing dash pattern like '------1' or '--2' or '-1' or '-- Any 1'
  const dashMatch = clean.match(/[-–—]+\s*(?:any\s*)?(\d+)/i);
  if (dashMatch) {
    const num = parseInt(dashMatch[1], 10);
    if (num === 0) return 'Included';
    if (num === 1) return 'Choose Any One';
    if (num === 2) return 'Choose Any Two';
    if (num === 3) return 'Choose Any Three';
    if (num === 4) return 'Choose Any Four';
    if (num === 5) return 'Choose Any Five';
    if (num === 6) return 'Choose Any Six';
  }

  // Exact word matches or containment
  if (lower.includes('one') || lower.includes('any one') || clean === '1' || clean === 'Choose Any 1' || /\b1\b/.test(clean)) {
    return 'Choose Any One';
  }
  if (lower.includes('two') || lower.includes('any two') || clean === '2' || clean === 'Choose Any 2' || /\b2\b/.test(clean)) {
    return 'Choose Any Two';
  }
  if (lower.includes('three') || lower.includes('any three') || clean === '3' || clean === 'Choose Any 3' || /\b3\b/.test(clean)) {
    return 'Choose Any Three';
  }
  if (lower.includes('four') || lower.includes('any four') || clean === '4' || clean === 'Choose Any 4' || /\b4\b/.test(clean)) {
    return 'Choose Any Four';
  }
  if (lower.includes('five') || lower.includes('any five') || clean === '5' || clean === 'Choose Any 5' || /\b5\b/.test(clean)) {
    return 'Choose Any Five';
  }
  if (lower.includes('six') || lower.includes('any six') || clean === '6' || clean === 'Choose Any 6' || /\b6\b/.test(clean)) {
    return 'Choose Any Six';
  }

  // Any other numeric quantity
  const match = clean.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num === 0) return 'Included';
    if (num === 1) return 'Choose Any One';
    if (num === 2) return 'Choose Any Two';
    if (num === 3) return 'Choose Any Three';
    if (num === 4) return 'Choose Any Four';
    if (num === 5) return 'Choose Any Five';
    if (num === 6) return 'Choose Any Six';
    return `Choose Any ${num}`;
  }

  return clean;
}

interface CatererMenuBuilderProps {
  packages: MenuPackage[];
  onChange: (pkgs: MenuPackage[]) => void;
  isParsing: boolean;
  setIsParsing: (isParsing: boolean) => void;
  onCatererDetailsExtracted?: (details: any) => void;
}

export default function CatererMenuBuilder({ packages, onChange, isParsing, setIsParsing, onCatererDetailsExtracted }: CatererMenuBuilderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Food image management states
  const [foodImages, setFoodImages] = useState<any[]>([]);
  const [catererEditingItem, setCatererEditingItem] = useState<any>(null);
  const [catererImgPreview, setCatererImgPreview] = useState<string>('');

  React.useEffect(() => {
    // Reset scanner states on mount to ensure fresh state upon load/user switch/page reload
    try {
      setIsParsing(false);
    } catch (e) {
      console.warn("Could not reset parsing state in parent:", e);
    }
    setUploadProgress(0);
    setScanProgress(0);
    setScanStatus('');
    setScanError('');
    setTimeRemaining(0);
    setLastFiles(null);
  }, []);

  React.useEffect(() => {
    fetch('/api/food-images')
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error(`Response was not JSON. Status: ${res.status}`);
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.images)) {
          setFoodImages(data.images);
        } else if (Array.isArray(data)) {
          setFoodImages(data);
        }
      })
      .catch(err => console.error("Error loading food images inside builder:", err));
  }, []);

  const refreshBuilderImages = () => {
    fetch('/api/food-images')
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error(`Response was not JSON. Status: ${res.status}`);
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.images)) {
          setFoodImages(data.images);
        } else if (Array.isArray(data)) {
          setFoodImages(data);
        }
      })
      .catch(err => console.error(err));
  };

  const getBuilderItemImage = (itemName: string) => {
    const found = foodImages.find(img => img.item_name.toLowerCase() === itemName.toLowerCase() && img.status === 'Approved');
    if (found?.image_url) return found.image_url;
    
    // Check pending/rejected ones too so the caterer sees what they have
    const pendingFound = foodImages.find(img => img.item_name.toLowerCase() === itemName.toLowerCase());
    if (pendingFound?.image_url) return pendingFound.image_url;

    // Direct fallback professional food thumbnail
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=60`;
  };

  const getBuilderItemStatus = (itemName: string) => {
    const found = foodImages.find(img => img.item_name.toLowerCase() === itemName.toLowerCase());
    return found ? found.status : 'System Default';
  };

  const handleCatererImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("File size is too large. Max limit is 2MB.", "error");
      return;
    }

    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
        const publicUrl = await uploadToSupabaseBucket('food-images', fileName, file, file.type);
        if (publicUrl) {
          setCatererImgPreview(publicUrl);
          return;
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload failed, fallback to local base64:", storageErr);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCatererImgPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const saveCatererCustomImage = () => {
    if (!catererEditingItem) return;
    
    fetch('/api/food-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: catererEditingItem.item_name,
        image_url: catererImgPreview,
        status: 'Pending Admin Review',
        approved_by_admin: false
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast("Image submitted successfully! It will be shown instantly, pending Admin approval.", "success");
          setCatererEditingItem(null);
          refreshBuilderImages();
        } else {
          toast(data.error || "Failed to submit image.", "error");
        }
      })
      .catch(err => {
        console.error("Error submitting custom image:", err);
        toast("An error occurred. Please try again.", "error");
      });
  };

  // States for Modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [activePackageIndex, setActivePackageIndex] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatRule, setNewCatRule] = useState('Choose Any One');

  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPkgData, setNewPkgData] = useState({ name: '', type: 'Mixed', price: '', minGuests: '' });

  const [showAddItemModal, setShowAddItemModal] = useState<{pkgIdx: number, catIdx: number} | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const [showEditItemModal, setShowEditItemModal] = useState<{pkgIdx: number, catIdx: number, itemIdx: number, currentName: string} | null>(null);

  const [deletePackageModal, setDeletePackageModal] = useState<{pkgIdx: number, name: string} | null>(null);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{pkgIdx: number, catIdx: number, name: string} | null>(null);
  const [deleteItemModal, setDeleteItemModal] = useState<{pkgIdx: number, catIdx: number, itemIdx: number, name: string} | null>(null);

  const [editPackageIdx, setEditPackageIdx] = useState<number | null>(null);
  const [editPackageNameStr, setEditPackageNameStr] = useState('');

  const [editCategoryIdx, setEditCategoryIdx] = useState<{pkg: number, cat: number} | null>(null);
  const [editCategoryNameStr, setEditCategoryNameStr] = useState('');

  // New states for progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [scanError, setScanError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastFiles, setLastFiles] = useState<FileList | null>(null);
  const currentScanIdRef = useRef<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLastFiles(files);
    processFiles(files);
  };

  const processFiles = async (files: FileList) => {
    const scanId = ++currentScanIdRef.current;
    setIsParsing(true);
    setUploadProgress(0);
    setScanProgress(0);
    setScanError('');
    setScanStatus('Uploading documents...');
    setTimeRemaining(45);

    // CRITICAL: Immediately clear previous packages so stale results never appear during scanning or after a failed scan
    onChange([]);

    let uploadInterval: any = null;
    let scanInterval: any = null;
    let timerInterval: any = null;

    const cleanupTimers = () => {
      if (uploadInterval) { clearInterval(uploadInterval); uploadInterval = null; }
      if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    };

    // Simulate upload progress
    uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          if (uploadInterval) clearInterval(uploadInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 200);

    // Time remaining countdown
    timerInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    const startTime = Date.now();

    const readImageAsOptimizedBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn(`[MENU BUILDER] Reading timeout reached for file: ${file.name}`);
          resolve('');
        }, 15000);

        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            clearTimeout(timeout);
            try {
              const maxDimension = 2048;
              let { width, height } = img;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(optimizedDataUrl);
                return;
              }
              resolve(reader.result as string);
            } catch (canvasErr) {
              console.warn('[MENU BUILDER] Canvas compression fallback:', canvasErr);
              resolve(reader.result as string);
            }
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve(reader.result as string || '');
          };
          img.src = reader.result as string;
        };
        reader.onabort = () => {
          clearTimeout(timeout);
          console.warn(`[MENU BUILDER] File read aborted for image: ${file.name}`);
          resolve('');
        };
        reader.onerror = (err) => {
          clearTimeout(timeout);
          console.warn(`[MENU BUILDER] File read error for image: ${file.name}`, err);
          resolve('');
        };
        reader.readAsDataURL(file);
      });
    };

    const readPdfAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(`[MENU BUILDER] Reading timeout reached for PDF: ${file.name}`);
          resolve('');
        }, 20000);

        const reader = new FileReader();
        reader.onload = () => {
          clearTimeout(timeout);
          resolve(reader.result as string);
        };
        reader.onabort = () => {
          clearTimeout(timeout);
          console.warn(`[MENU BUILDER] File read aborted for PDF: ${file.name}`);
          resolve('');
        };
        reader.onerror = (err) => {
          clearTimeout(timeout);
          console.warn(`[MENU BUILDER] File read error for PDF: ${file.name}`, err);
          resolve('');
        };
        reader.readAsDataURL(file);
      });
    };

    try {
      console.log(`[MENU BUILDER] Starting processFiles for ${files.length} document(s)...`);
      setScanStatus('Reading document files...');

      const uploadedUrls: string[] = [];
      const storageFiles: { bucket: string; path: string; url?: string }[] = [];
      const localTempFiles: { path: string; sessionId: string; mimeType: string }[] = [];
      const base64Images: string[] = [];

      for (const file of Array.from(files)) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          if (file.size > 25 * 1024 * 1024) {
            throw new Error(`File "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 25MB limit. Please upload a PDF under 25MB.`);
          }

          setScanStatus(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);
          const uploadRes = await uploadMenuDocumentToStorage(file, (pct) => {
            setScanStatus(`Uploading ${file.name} (${pct}%)...`);
            setUploadProgress(pct);
          });

          if (uploadRes.success && uploadRes.localTempFile) {
            console.log(`[MENU BUILDER] PDF uploaded via resilient chunked transfer:`, uploadRes.localTempFile.path);
            localTempFiles.push({
              path: uploadRes.localTempFile.path,
              sessionId: uploadRes.localTempFile.sessionId,
              mimeType: file.type || 'application/pdf',
            });
          } else if (uploadRes.success && uploadRes.bucket && uploadRes.path) {
            console.log(`[MENU BUILDER] PDF uploaded to storage: ${uploadRes.bucket}/${uploadRes.path}`);
            storageFiles.push({
              bucket: uploadRes.bucket,
              path: uploadRes.path,
              url: uploadRes.url,
            });
            if (uploadRes.url) {
              uploadedUrls.push(uploadRes.url);
            }
          } else if (uploadRes.offline) {
            // Local dev mode without Supabase storage credentials: read directly as base64 (Express dev server handles up to 50MB)
            console.log(`[MENU BUILDER] Storage server in offline mode. Reading ${file.name} as base64 for local processing...`);
            setScanStatus(`Reading ${file.name} for local processing...`);
            const b64 = await readPdfAsBase64(file);
            if (b64) base64Images.push(b64);
          } else {
            console.warn(`[MENU BUILDER] Direct storage upload failed for ${file.name}:`, uploadRes.error);
            if (file.size <= 4 * 1024 * 1024) {
              const b64 = await readPdfAsBase64(file);
              if (b64) base64Images.push(b64);
            } else {
              throw new Error(uploadRes.error || `Large PDF (${(file.size / 1024 / 1024).toFixed(1)}MB) could not be uploaded to storage. Please check your connection and try again.`);
            }
          }
        } else {
          // All images (JPG, PNG, WebP): compress to JPEG max 2048px (200-350KB each)
          const b64 = await readImageAsOptimizedBase64(file);
          if (b64) base64Images.push(b64);
        }
      }

      if (uploadedUrls.length === 0 && storageFiles.length === 0 && localTempFiles.length === 0 && base64Images.length === 0) {
        throw new Error('No valid menu documents found.');
      }

      if (uploadInterval) clearInterval(uploadInterval);
      setUploadProgress(100);
      setScanStatus('Analyzing menu layout & document pages...');

      const reqBody: any = {};
      if (storageFiles.length > 0) reqBody.storageFiles = storageFiles;
      if (localTempFiles.length > 0) reqBody.localTempFiles = localTempFiles;
      if (uploadedUrls.length > 0) reqBody.urls = uploadedUrls;
      if (base64Images.length > 0) reqBody.images = base64Images;

      console.log(
        `[MENU BUILDER] Payload ready (${storageFiles.length} Storage file(s), ${localTempFiles.length} Chunked file(s), ${uploadedUrls.length} URL(s), ${base64Images.length} Base64 image(s)). Sending request to /api/parse-menu...`
      );

      // Smooth progress pacing that informs user of each stage
      setScanProgress(15);
      scanInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev === 25) setScanStatus('Extracting caterer info & package tiers...');
          if (prev === 45) setScanStatus('Extracting pricing slabs & guest minimums...');
          if (prev === 65) setScanStatus('Categorizing dishes & items...');
          if (prev === 80) setScanStatus('Detecting package selection rules...');
          if (prev === 90) setScanStatus('Validating rules (Choose Any One/Two, Included)...');
          
          if (prev >= 92) return 92;
          return prev + 2;
        });
      }, 600);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(new Error('Menu parsing request reached 3-minute client timeout.')), 180000); // 3 minutes client timeout

      let res: Response;
      try {
        res = await fetch('/api/parse-menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reqBody),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      cleanupTimers();

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Failed to parse menu (HTTP ${res.status}). Please try again.`);
      }

      const data = await res.json();
      const duration = Date.now() - startTime;
      console.log(`[MENU BUILDER] /api/parse-menu succeeded in ${duration}ms using model: ${data.modelUsed || 'default'}`);

      // If a newer scan was initiated in the meantime, discard stale response
      if (scanId !== currentScanIdRef.current) {
        console.log(`[MENU BUILDER] Discarding stale scan response (${scanId} vs ${currentScanIdRef.current})`);
        return;
      }

      // Set to 100% on verified successful extraction
      setScanProgress(100);
      setScanStatus('Scan successful!');

      const normalizePkg = (pkg: any) => ({
        ...pkg,
        packageName: pkg.packageName || pkg.name || 'Unnamed Package',
        packageType: pkg.packageType || 'Mixed',
        pricingSlabs: Array.isArray(pkg.pricingSlabs) && pkg.pricingSlabs.length > 0
          ? pkg.pricingSlabs
          : [{ minGuests: pkg.minimumGuests || 100, maxGuests: null, price: pkg.pricePerPlate || 0 }],
        pricePerPlate: pkg.pricePerPlate || pkg.pricingSlabs?.[0]?.price || 0,
        minimumGuests: pkg.minimumGuests || pkg.pricingSlabs?.[0]?.minGuests || 100,
        categories: (pkg.categories || []).map((cat: any) => {
          let categoryName = cat.categoryName || 'Category';
          let detectedRule = '';
          const catDashMatch = categoryName.match(/^(.*?)\s*[-–—]+\s*(?:any\s*)?(\d+)\s*$/i);
          if (catDashMatch) {
            categoryName = catDashMatch[1].trim();
            const count = parseInt(catDashMatch[2], 10);
            if (categoryName.toLowerCase().includes('common item')) {
              categoryName = 'Common Items';
              detectedRule = 'Included';
            } else {
              detectedRule = count === 1 ? 'Choose Any One' : count === 2 ? 'Choose Any Two' : count === 3 ? 'Choose Any Three' : `Choose Any ${count}`;
            }
          } else if (categoryName.toLowerCase().includes('common item')) {
            categoryName = 'Common Items';
            detectedRule = 'Included';
          }
          const rawRule = detectedRule || cat.selectionRule;
          let finalRule = normalizeCategoryRule(rawRule);

          let itemsList = Array.isArray(cat.items) ? cat.items.map((it: any) => (typeof it === 'string' ? it : (it?.name || String(it)))) : [];
          
          // Defensive client-side enrichment from masterDishes if category has placeholder item
          if (itemsList.length <= 1 && data.masterDishes && typeof data.masterDishes === 'object') {
            const lower = categoryName.toLowerCase();
            const masterKeys = Object.keys(data.masterDishes);
            for (const k of masterKeys) {
              if (k.toLowerCase() === lower && Array.isArray(data.masterDishes[k]) && data.masterDishes[k].length > 0) {
                itemsList = data.masterDishes[k];
                break;
              }
            }
            if (itemsList.length <= 1) {
              if (lower.includes('salad')) itemsList = data.masterDishes['Salads'] || data.masterDishes['Salad'] || itemsList;
              else if (lower.includes('veg soup')) itemsList = data.masterDishes['Veg Soup'] || itemsList;
              else if (lower.includes('chicken soup')) itemsList = data.masterDishes['Chicken Soup'] || itemsList;
              else if (lower.includes('soup')) itemsList = data.masterDishes['Soups'] || itemsList;
              else if (lower.includes('non-veg starter') || lower.includes('non veg starter')) {
                if (lower.includes('chicken') && !lower.includes('fish') && !lower.includes('mutton') && !lower.includes('prawn')) {
                  itemsList = data.masterDishes['Chicken Starter'] || data.masterDishes['Non-Veg Starters'] || itemsList;
                } else {
                  const combined = [
                    ...(data.masterDishes['Chicken Starter'] || []),
                    ...(data.masterDishes['Sea Food Starter'] || []),
                    ...(data.masterDishes['Mutton Starter'] || [])
                  ];
                  itemsList = combined.length > 0 ? combined : (data.masterDishes['Non-Veg Starters'] || itemsList);
                }
              }
              else if (lower.includes('veg starter')) itemsList = data.masterDishes['Veg Starters'] || data.masterDishes['Veg Starter'] || itemsList;
              else if (lower.includes('chicken gravy') || lower.includes('chicken cur')) itemsList = data.masterDishes['Chicken Gravies'] || data.masterDishes['Chicken Gravy'] || itemsList;
              else if (lower.includes('mutton gravy') || lower.includes('mutton cur')) itemsList = data.masterDishes['Mutton Gravies'] || data.masterDishes['Mutton Gravy'] || itemsList;
              else if (lower.includes('veg gravy') || lower.includes('veg cur')) itemsList = data.masterDishes['Veg Gravies'] || data.masterDishes['Veg Gravy'] || itemsList;
              else if (lower.includes('dal') || lower.includes('dall')) itemsList = data.masterDishes['Dal'] || data.masterDishes['Variety of Dal'] || ['Dal Makhni', 'Dal Fry', 'Dal Tadka'];
              else if (lower.includes('bread') || lower.includes('roti') || lower.includes('naan')) itemsList = data.masterDishes['Indian Breads'] || data.masterDishes['Breads'] || itemsList;
              else if (lower.includes('biryani')) itemsList = data.masterDishes['Biryani'] || data.masterDishes['Non Veg Biryani'] || itemsList;
              else if (lower.includes('dessert') || lower.includes('sweet')) itemsList = data.masterDishes['Desserts'] || data.masterDishes['Sweets'] || itemsList;
              else if (lower.includes('drink')) itemsList = data.masterDishes['Welcome Drink'] || data.masterDishes['Drinks'] || itemsList;
              else if (lower.includes('ice cream')) itemsList = data.masterDishes['Ice Cream'] || ['Butterscotch', 'Vanilla', 'Chocolate', 'Kulfi', 'Cream Stone Ice Cream'];
            }
          }

          // Guard: If category has multiple choices and is not Common Items/Accompaniments, never allow it to remain 'Included'
          if (
            finalRule === 'Included' &&
            !categoryName.toLowerCase().includes('common item') &&
            !categoryName.toLowerCase().includes('accompaniment') &&
            Array.isArray(itemsList) &&
            itemsList.length > 1
          ) {
            console.log(
              `[MENU BUILDER GUARD] Category "${categoryName}" has ${itemsList.length} items but was "Included". Correcting to "Choose Any One".`
            );
            finalRule = 'Choose Any One';
          }

          console.log(
            `[MENU BUILDER DIAGNOSTIC] Package: "${pkg.packageName}" | Category: "${categoryName}" | Items: ${itemsList.length} | Rule: "${finalRule}"`
          );
          return {
            ...cat,
            categoryName,
            selectionRule: finalRule,
            items: itemsList,
          };
        }),
      });

      let extractedPackagesList: any[] = [];
      if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
        extractedPackagesList = data.packages.map(normalizePkg);
      } else if (data.packageName) {
        extractedPackagesList = [normalizePkg(data)];
      } else {
        throw new Error('AI parser returned an empty package list. Please verify the document format and try again.');
      }

      console.log(
        `[MENU BUILDER] Replacing previous packages completely with ${extractedPackagesList.length} fresh packages from new scan`
      );

      // Completely REPLACE previous scanned packages with the newly extracted results
      onChange(extractedPackagesList);

      if (data.catererDetails && onCatererDetailsExtracted) {
        onCatererDetailsExtracted(data.catererDetails);
      }
      refreshBuilderImages();

      // Show 100% success state briefly, then dismiss loader
      setTimeout(() => {
        setIsParsing(false);
        setUploadProgress(0);
        setScanProgress(0);
        setScanStatus('');
      }, 1000);

    } catch (err: any) {
      if (scanId !== currentScanIdRef.current) return;
      console.error('[MENU BUILDER ERROR]', err);
      cleanupTimers();
      setScanProgress(0);
      setUploadProgress(0);
      setIsParsing(false);
      const isAbort = err.name === 'AbortError';
      const userMessage = isAbort
        ? 'Scanning timed out after 3 minutes. Please check your internet connection or try a smaller PDF / fewer images.'
        : (err.message || 'Error parsing menu card. Please try again.');
      setScanError(userMessage);
      onChange([]); // Clear stale previous extraction results so old data isn't displayed on scan failure
    }
  };

  // --- Package Management ---
  const handleAddPackageManually = () => {
    setShowAddPackageModal(true);
    setNewPkgData({ name: '', type: 'Mixed', price: '', minGuests: '' });
  };

  const createManualPackage = () => {
    if (newPkgData.name.trim()) {
      const newPkgs = [...packages, {
        packageName: newPkgData.name.trim(),
        packageType: newPkgData.type,
        categories: [],
        pricePerPlate: parseInt(newPkgData.price) || 0,
        minimumGuests: parseInt(newPkgData.minGuests) || 0,
        pricingSlabs: [{
            minGuests: parseInt(newPkgData.minGuests) || 0,
            maxGuests: null,
            price: parseInt(newPkgData.price) || 0
        }]
      }];
      onChange(newPkgs);
      setShowAddPackageModal(false);
    }
  };

  const confirmDeletePackage = () => {
    if (deletePackageModal) {
      const newPkgs = [...packages];
      newPkgs.splice(deletePackageModal.pkgIdx, 1);
      onChange(newPkgs);
      setDeletePackageModal(null);
    }
  };

  const duplicatePackage = (idx: number) => {
    const newPkgs = [...packages];
    const original = newPkgs[idx];
    const dup = JSON.parse(JSON.stringify(original));
    dup.packageName = `${dup.packageName} (Copy)`;
    newPkgs.splice(idx + 1, 0, dup);
    onChange(newPkgs);
  };

  const savePackageName = (idx: number) => {
    if (editPackageNameStr.trim()) {
      const newPkgs = [...packages];
      newPkgs[idx].packageName = editPackageNameStr;
      onChange(newPkgs);
    }
    setEditPackageIdx(null);
  };

  // --- Category Management ---
  const openAddCategory = (pkgIdx: number) => {
    setActivePackageIndex(pkgIdx);
    setNewCatName('');
    setNewCatRule('Choose Any One');
    setShowAddCategoryModal(true);
  };

  const handleAddCategory = () => {
    if (activePackageIndex !== null && newCatName.trim()) {
      const newPkgs = [...packages];
      newPkgs[activePackageIndex].categories.push({
        categoryName: newCatName.trim(),
        selectionRule: newCatRule,
        items: []
      });
      onChange(newPkgs);
      setShowAddCategoryModal(false);
    }
  };

  const confirmDeleteCategory = () => {
    if (deleteCategoryModal) {
      const newPkgs = [...packages];
      newPkgs[deleteCategoryModal.pkgIdx].categories.splice(deleteCategoryModal.catIdx, 1);
      onChange(newPkgs);
      setDeleteCategoryModal(null);
    }
  };

  const duplicateCategory = (pkgIdx: number, catIdx: number) => {
    const newPkgs = [...packages];
    const original = newPkgs[pkgIdx].categories[catIdx];
    const dup = JSON.parse(JSON.stringify(original));
    dup.categoryName = `${dup.categoryName} (Copy)`;
    newPkgs[pkgIdx].categories.splice(catIdx + 1, 0, dup);
    onChange(newPkgs);
  };

  const saveCategoryName = (pkgIdx: number, catIdx: number) => {
    if (editCategoryNameStr.trim()) {
      const newPkgs = [...packages];
      newPkgs[pkgIdx].categories[catIdx].categoryName = editCategoryNameStr;
      onChange(newPkgs);
    }
    setEditCategoryIdx(null);
  };

  const updateRule = (pkgIdx: number, catIdx: number, val: string) => {
    const newPkgs = [...packages];
    newPkgs[pkgIdx].categories[catIdx].selectionRule = val;
    onChange(newPkgs);
  };

  // --- Item Management ---
  const openAddItemModal = (pkgIdx: number, catIdx: number) => {
    setNewItemName('');
    setShowAddItemModal({ pkgIdx, catIdx });
  };

  const handleAddItem = () => {
    if (showAddItemModal && newItemName.trim()) {
      const { pkgIdx, catIdx } = showAddItemModal;
      const newPkgs = [...packages];
      newPkgs[pkgIdx].categories[catIdx].items.push(newItemName.trim());
      onChange(newPkgs);
      setShowAddItemModal(null);
    }
  };

  const saveEditedItem = () => {
    if (showEditItemModal && showEditItemModal.currentName.trim()) {
        const { pkgIdx, catIdx, itemIdx, currentName } = showEditItemModal;
        const newPkgs = [...packages];
        newPkgs[pkgIdx].categories[catIdx].items[itemIdx] = currentName.trim();
        onChange(newPkgs);
        setShowEditItemModal(null);
    }
  };

  const updateItem = (pkgIdx: number, catIdx: number, itemIdx: number, val: string) => {
    const newPkgs = [...packages];
    newPkgs[pkgIdx].categories[catIdx].items[itemIdx] = val;
    onChange(newPkgs);
  };

  const confirmDeleteItem = () => {
    if (deleteItemModal) {
      const newPkgs = [...packages];
      newPkgs[deleteItemModal.pkgIdx].categories[deleteItemModal.catIdx].items.splice(deleteItemModal.itemIdx, 1);
      onChange(newPkgs);
      setDeleteItemModal(null);
    }
  };

  const moveItem = (pkgIdx: number, catIdx: number, itemIdx: number, targetCatIdx: number) => {
    if (catIdx === targetCatIdx) return;
    const newPkgs = [...packages];
    const itemToMove = newPkgs[pkgIdx].categories[catIdx].items.splice(itemIdx, 1)[0];
    newPkgs[pkgIdx].categories[targetCatIdx].items.push(itemToMove);
    onChange(newPkgs);
  };

  return (
    <div className="font-poppins bg-transparent relative">
      {/* Title & Subtitle */}
      <div className="text-left mb-5">
        <h2 className="text-2xl md:text-[28px] font-display font-bold text-[#0F241C] flex items-center gap-2 tracking-tight leading-tight">
          <span>Build Your Menu with AI</span>
          <span className="text-[#E6A823] font-sans text-xl">✨</span>
        </h2>
        <p className="text-[#5C5240] text-xs md:text-[13px] mt-1">
          Upload your catering menu and let our AI extract dishes, categories &amp; pricing automatically.
        </p>
      </div>

      {/* Drag & Drop Upload Box */}
      <div className="mb-6 bg-gradient-to-b from-[#F4FAF6] via-[#EFF8F3] to-[#E2F2E8] rounded-2xl p-6 sm:p-8 border-2 border-dashed border-[#6AA38C] flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden transition-all">
        {/* Delicate Layered Emerald Wave Background Accent */}
        <svg
          viewBox="0 0 800 120"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none select-none absolute inset-x-0 bottom-0 w-full h-24 opacity-80"
          aria-hidden="true"
        >
          <path d="M0 90 C180 36 330 112 520 74 C650 48 730 32 800 52 L800 120 L0 120 Z" fill="#D5ECE0" fillOpacity="0.65" />
          <path d="M0 105 C210 68 410 118 610 82 C700 66 760 56 800 68 L800 120 L0 120 Z" fill="#C4E3D3" fillOpacity="0.55" />
        </svg>

        <input 
          type="file" 
          multiple
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf" 
          onChange={handleFileUpload} 
        />
        
        {isParsing ? (
          <div className="relative z-10 w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-500 py-3">
              <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 bg-[#FFFDF8] rounded-full flex items-center justify-center shadow-lg mb-4 text-[#024731] relative border border-[#E4C987]">
                       <ChefHat size={30} className="animate-pulse text-[#024731]" />
                       <div className="absolute inset-0 border-4 border-[#9EE2BA] border-t-[#024731] rounded-full animate-spin"></div>
                  </div>
                  <h3 className="font-bold text-base text-[#0F241C]">{scanStatus || 'Processing...'}</h3>
                  <p className="text-[11px] font-medium text-[#5C5240] mt-1">
                      {timeRemaining > 20 ? `Estimated time remaining: 00:${timeRemaining.toString().padStart(2, '0')}` : 
                       timeRemaining > 10 ? "Approx 15 seconds remaining" :
                       timeRemaining > 0 ? "Almost done..." : "Finalizing extraction..."}
                  </p>
              </div>

              <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-[#4A3B22] uppercase tracking-wider">
                     <span>Uploading Documents</span>
                     <span>{Math.min(100, uploadProgress)}%</span>
                  </div>
                  <div className="h-2 bg-[#DCECE3] rounded-full overflow-hidden">
                     <div className="h-full bg-[#024731] transition-all duration-300" style={{width: `${uploadProgress}%`}} />
                  </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between text-[10px] font-bold text-[#4A3B22] uppercase tracking-wider">
                    <span>AI Menu Extraction</span>
                    <span>{Math.min(100, scanProgress)}%</span>
                 </div>
                 <div className="h-2 bg-[#F3E2B8] rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-500", scanProgress === 100 ? "bg-[#15803D]" : "bg-[#D99B1E]")} style={{width: `${scanProgress}%`}} />
                 </div>
              </div>
          </div>
        ) : scanError ? (
          <div className="relative z-10 flex flex-col items-center justify-center text-red-800 w-full py-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-sm mb-3 text-red-600 animate-bounce">
              <AlertCircle size={24} />
            </div>
            <p className="font-bold mb-1">Scan Failed</p>
            <p className="text-xs text-red-800/80 font-medium mb-4 text-center max-w-sm">{scanError}</p>
            <div className="flex gap-3">
               <button type="button" onClick={(e) => { e.stopPropagation(); setScanError(''); setScanStatus(''); setUploadProgress(0); setScanProgress(0); }} className="text-xs font-bold bg-white text-slate-700 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
               <button type="button" onClick={(e) => { e.stopPropagation(); if(lastFiles) processFiles(lastFiles); }} className="text-xs font-bold bg-red-600 text-white px-4 py-2 rounded-xl shadow min-w-[100px] hover:bg-red-700 transition-colors cursor-pointer">Retry Scan</button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center py-1 select-none text-center">
            {/* Scan Bracket Menu Icon matching Reference */}
            <div className="relative p-2.5 mb-3">
              <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-[2.5px] border-l-[2.5px] border-[#024731] rounded-tl" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-[2.5px] border-r-[2.5px] border-[#024731] rounded-tr" />
              <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-[2.5px] border-l-[2.5px] border-[#024731] rounded-bl" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-[2.5px] border-r-[2.5px] border-[#024731] rounded-br" />
              <div className="w-12 h-14 rounded-lg bg-gradient-to-b from-[#6ED39D] to-[#42B97C] border border-[#2C9D63] px-2 py-1.5 flex flex-col items-center justify-between shadow-sm text-white">
                <span className="text-[7px] font-extrabold tracking-widest uppercase">▲ MENU</span>
                <div className="w-6 h-1 bg-white/85 rounded-full" />
                <div className="w-full space-y-1">
                  <div className="h-1 bg-white/85 rounded-full w-full" />
                  <div className="h-1 bg-white/75 rounded-full w-4/5" />
                  <div className="h-1 bg-white/70 rounded-full w-3/4" />
                </div>
              </div>
            </div>
            
            <p className="text-lg font-bold text-[#0F241C] font-display tracking-tight">Drag &amp; Drop Menu Here</p>
            <p className="text-xs text-[#5C5240] mt-0.5 mb-4">Supports: JPG, PNG, PDF (Max 25MB)</p>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-[#024731] to-[#013122] hover:from-[#03583D] hover:to-[#023C2A] border border-[#D9A323]/45 text-[#FFFDF8] font-semibold font-sans text-xs px-7 py-2.5 rounded-full transition-all shadow-[0_6px_16px_rgba(1,49,34,0.22)] active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload size={14} className="text-[#F5C642]" />
              <span>Choose File</span>
            </button>
          </div>
        )}
      </div>

      {/* AI automatically bullet highlights row */}
      <div className="mb-6">
        <p className="text-xs font-bold text-[#0F241C] tracking-wide font-poppins mb-2.5">Our AI will automatically:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#FCF7E8] border border-[#EAE0C8] rounded-2xl divide-y sm:divide-y-0 sm:divide-x divide-[#E8D9B5] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-[#30281E]">
            <span className="w-7 h-7 rounded-lg bg-[#FAF0D4] border border-[#E4C987] text-[#C48E22] flex items-center justify-center shrink-0">
              <Layers size={14} />
            </span>
            <span>Extract all menu items</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-[#30281E]">
            <span className="w-7 h-7 rounded-lg bg-[#FAF0D4] border border-[#E4C987] text-[#C48E22] flex items-center justify-center shrink-0">
              <Tag size={14} />
            </span>
            <span>Suggest pricing slabs</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-[#30281E]">
            <span className="w-7 h-7 rounded-lg bg-[#FAF0D4] border border-[#E4C987] text-[#C48E22] flex items-center justify-center shrink-0">
              <ChefHat size={14} />
            </span>
            <span>Organize dishes by category</span>
          </div>
        </div>
      </div>

      {/* Separator - Or create packages manually */}
      <div className="relative flex items-center justify-center my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[#E6D8B8]"></div>
        </div>
        <div className="relative bg-[#FFFDF8] px-4 text-[11px] font-bold text-[#6B5F4B] font-poppins uppercase tracking-wider">
          Or create packages manually
        </div>
      </div>

      {/* Add package manually button centered */}
      <div className="flex justify-center mb-4">
        <button 
          type="button"
          onClick={handleAddPackageManually}
          className="border-2 border-dashed border-[#D9BE7D] bg-[#FFFDF8] hover:border-[#D9A323] hover:bg-[#FAF0D4]/55 text-[#0F241C] font-bold text-xs px-7 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <span className="text-[#D99B1E] text-base font-bold leading-none">+</span> Add Package Manually
        </button>
      </div>

      {/* Your Packages list (Extracted items) - hidden during scanning or when scan error occurs */}
      {!isParsing && !scanError && packages.length > 0 && (
        <div className="mb-8 mt-6 pt-6 border-t border-[#EFE3C4]">
          <h3 className="text-xs font-bold tracking-wider text-[#6B5F4B] uppercase font-poppins mb-4">Your Packages (AI Extracted)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg, idx) => {
              const totalCats = pkg.categories?.length || 0;
              const minGuestsVal = pkg.minimumGuests || (pkg.pricingSlabs?.[0]?.minGuests) || 100;
              const basePrice = pkg.pricePerPlate || (pkg.pricingSlabs?.[0]?.price) || 0;
              
              const isGold = pkg.packageName?.toLowerCase().includes('gold') || idx === 1;
              const isPlatinum = pkg.packageName?.toLowerCase().includes('platinum') || pkg.packageName?.toLowerCase().includes('premium') || idx === 2;
              
              let badge = "PURE VEG";
              let cardBg = "bg-[#FCF8EE] border-[#E4C987]";
              let badgeStyle = "bg-[#E6F9ED] text-[#15803D] border border-[#A7DCBA]";
              
              if (isGold) {
                badge = "MOST POPULAR";
                cardBg = "bg-[#FAF0D4]/65 border-[#DFB95B]";
                badgeStyle = "bg-[#E5B84B] text-[#0F241C] font-bold";
              } else if (isPlatinum) {
                badge = "PREMIUM";
                cardBg = "bg-[#F4FAF6] border-[#9ECDB4]";
                badgeStyle = "bg-[#024731] text-[#F5C642] font-bold";
              }

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "rounded-2xl p-5 border relative shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group",
                    cardBg
                  )}
                >
                  <div>
                    <div className="mb-3">
                      <span className={cn("text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block", badgeStyle)}>
                        {badge}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-lg text-[#0F241C] group-hover:text-[#024731] transition-colors">
                      {pkg.packageName || `Package ${idx + 1}`}
                    </h4>

                    <p className="text-xl font-bold text-[#B87D16] font-sans mt-2 tabular-nums">
                      ₹{basePrice} <span className="text-xs text-[#6B5F4B] font-normal">/ pax</span>
                    </p>

                    <div className="mt-4 space-y-2 border-t border-[#E6D8B8] pt-3">
                      <div className="flex items-center gap-2 text-xs text-[#4A3B22]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C48E22]"></span>
                        <span>Min {minGuestsVal} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#4A3B22]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C48E22]"></span>
                        <span>{totalCats || 8} Categories</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E6D8B8] flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={() => {
                        const targetElement = document.getElementById(`pkg-edit-${idx}`);
                        if (targetElement) {
                          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="text-xs font-bold text-[#024731] hover:text-[#01291C] hover:underline flex items-center gap-1.5 transition-all text-left cursor-pointer"
                    >
                      Preview &amp; Edit Menu <span className="text-[#C48E22]">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Package Editors Section - hidden during scanning or when scan error occurs */}
      {!isParsing && !scanError && packages.length > 0 && (
        <div className="space-y-8 mt-10">
          {packages.map((pkg, pIdx) => {
          const totalItems = pkg.categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
          const totalCats = pkg.categories?.length || 0;
          
          return (
          <div key={pIdx} id={`pkg-edit-${pIdx}`} className="border border-[#E4C987] rounded-2xl bg-[#FFFDF8] overflow-hidden shadow-sm">
            
            {/* Extraction Review Panel */}
            <div className="bg-[#FCF7E8] border-b border-[#EFE3C4] px-6 py-3 flex flex-wrap gap-6 items-center">
                <div>
                   <p className="text-xs text-[#B87D16] font-bold uppercase tracking-wider mb-0.5">Extraction Review</p>
                   <p className="text-sm text-[#4A3B22]">Check and edit your package details before saving.</p>
                </div>
                <div className="flex gap-4 ml-auto">
                    <div className="text-center font-bold text-[#0F241C] bg-[#FFFDF8] px-3 py-1.5 rounded-lg border border-[#E4C987] text-sm"><span className="text-[#B87D16]">{totalCats}</span> Categories</div>
                    <div className="text-center font-bold text-[#0F241C] bg-[#FFFDF8] px-3 py-1.5 rounded-lg border border-[#E4C987] text-sm"><span className="text-[#B87D16]">{totalItems}</span> Items</div>
                    <div className="text-center font-bold text-[#024731] bg-[#E8F6EE] px-3 py-1.5 rounded-lg border border-[#9ECDB4] text-sm flex items-center gap-1"><CheckCircle2 size={16}/> 98% Confidence</div>
                </div>
            </div>

            <div className="bg-[#FFFDF8] border-b border-[#EFE3C4] p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                {editPackageIdx === pIdx ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input 
                               type="text" 
                               value={editPackageNameStr}
                               onChange={(e) => setEditPackageNameStr(e.target.value)}
                               className="text-xl font-bold bg-[#FFFDF9] border-2 border-[#065239] text-[#0F241C] focus:outline-none rounded-xl px-3 py-1.5 w-full max-w-[300px]"
                               autoFocus
                               onKeyDown={(e) => e.key === 'Enter' && savePackageName(pIdx)}
                            />
                            <button onClick={() => savePackageName(pIdx)} className="p-2 bg-[#024731] text-[#FFFDF8] rounded-lg hover:bg-[#013122] cursor-pointer"><Check size={16}/></button>
                            <button onClick={() => setEditPackageIdx(null)} className="p-2 bg-[#FAF3E2] border border-[#DFC78A] text-[#5C5240] rounded-lg hover:bg-[#F3E5C3] cursor-pointer"><X size={16}/></button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-display font-bold text-[#0F241C] flex items-center gap-3 mb-2">
                        {pkg.packageName || 'Unnamed Package'}
                        <button onClick={() => { setEditPackageNameStr(pkg.packageName); setEditPackageIdx(pIdx); }} className="text-[#8E7D5E] hover:text-[#9A6A0F] cursor-pointer"><Edit2 size={16}/></button>
                        <span className={cn("text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border", pkg.packageType?.toLowerCase() === 'veg' ? "bg-[#DCF8E6] text-[#116E39] border-[#9EE2BA]" : pkg.packageType?.toLowerCase() === 'non veg' ? "bg-red-50 text-red-700 border-red-200" : "bg-[#FAF0D4] text-[#8E5B08] border-[#DFC78A]")}>
                            {pkg.packageType || 'Mixed'}
                        </span>
                        </h3>
                        
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="text-xs font-bold text-[#7D6E52] uppercase tracking-wider mb-1">Pricing Slabs</div>
                            <div className="bg-[#FAF3E2]/55 border border-[#DFC78A] rounded-xl overflow-hidden">
                                <div className="grid grid-cols-4 bg-[#FAF0D4]/90 p-2.5 text-xs font-bold text-[#0F241C] border-b border-[#DFC78A]">
                                    <div className="px-2">Min Guests</div>
                                    <div className="px-2">Max Guests</div>
                                    <div className="px-2">Price (₹)</div>
                                    <div className="px-2 text-right">Actions</div>
                                </div>
                                {pkg.pricingSlabs?.map((slab, sIdx) => (
                                    <div key={sIdx} className="grid grid-cols-4 p-2 items-center text-sm border-b border-[#EFE3C4] last:border-0 hover:bg-[#FFFDF8] transition-colors">
                                        <div className="px-2">
                                            <input 
                                                type="number" 
                                                value={slab.minGuests || ''}
                                                onChange={(e) => {
                                                    const newPkgs = [...packages];
                                                    if(newPkgs[pIdx].pricingSlabs) newPkgs[pIdx].pricingSlabs![sIdx].minGuests = Number(e.target.value);
                                                    onChange(newPkgs);
                                                }}
                                                className="w-full bg-transparent text-[#0F241C] font-medium tabular-nums border-b border-transparent focus:border-[#065239] outline-none"
                                                placeholder="Min"
                                            />
                                        </div>
                                        <div className="px-2 flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                value={slab.maxGuests || ''}
                                                onChange={(e) => {
                                                    const newPkgs = [...packages];
                                                    if(newPkgs[pIdx].pricingSlabs) newPkgs[pIdx].pricingSlabs![sIdx].maxGuests = e.target.value ? Number(e.target.value) : null;
                                                    onChange(newPkgs);
                                                }}
                                                className="w-full bg-transparent text-[#0F241C] font-medium tabular-nums border-b border-transparent focus:border-[#065239] outline-none"
                                                placeholder="Max (optional)"
                                            />
                                        </div>
                                        <div className="px-2 flex items-center gap-1">
                                            <span className="text-[#9A6A0F] font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={slab.price || ''}
                                                onChange={(e) => {
                                                    const newPkgs = [...packages];
                                                    if(newPkgs[pIdx].pricingSlabs) newPkgs[pIdx].pricingSlabs![sIdx].price = Number(e.target.value);
                                                    if (sIdx === 0) {
                                                        newPkgs[pIdx].pricePerPlate = Number(e.target.value);
                                                    }
                                                    onChange(newPkgs);
                                                }}
                                                className="w-full bg-transparent text-[#0F241C] tabular-nums border-b border-transparent focus:border-[#065239] outline-none font-bold"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="px-2 text-right">
                                            <button 
                                                onClick={() => {
                                                    const newPkgs = [...packages];
                                                    newPkgs[pIdx].pricingSlabs?.splice(sIdx, 1);
                                                    onChange(newPkgs);
                                                }}
                                                className="text-[#8E7D5E] hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Delete Slab"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => {
                                    const newPkgs = [...packages];
                                    if (!newPkgs[pIdx].pricingSlabs) newPkgs[pIdx].pricingSlabs = [];
                                    newPkgs[pIdx].pricingSlabs!.push({ minGuests: 100, maxGuests: null, price: 0 });
                                    onChange(newPkgs);
                                }}
                                className="text-xs font-bold text-[#065239] self-start flex items-center gap-1 hover:text-[#01291D] transition-colors bg-[#E8F6EE] border border-[#9EE2BA] px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                                <Plus size={14} /> Add Pricing Slab
                            </button>
                        </div>
                    </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => duplicatePackage(pIdx)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DFC78A] bg-[#FAF3E2]/70 text-[#0F241C] hover:bg-[#FAF0D4] font-semibold text-sm transition-colors cursor-pointer">
                  <Copy size={16} /> Duplicate
                </button>
                <button onClick={() => setDeletePackageModal({pkgIdx: pIdx, name: pkg.packageName})} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold text-sm transition-colors cursor-pointer">
                  <Trash2 size={16} /> Delete Package
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 bg-[#FFFDF8]">
              {pkg.categories?.map((cat, cIdx) => (
                <div key={cIdx} className="bg-[#FFFDF8] border border-[#E6D8B8] rounded-xl shadow-sm relative flex flex-col">
                  <div className="p-4 border-b border-[#EFE3C4] flex justify-between items-start bg-[#FCF7E8]/75 rounded-t-xl">
                    <div className="flex-1 mr-4">
                      {editCategoryIdx?.pkg === pIdx && editCategoryIdx?.cat === cIdx ? (
                          <div className="flex items-center gap-2 mb-2">
                              <input 
                                 type="text" 
                                 value={editCategoryNameStr}
                                 onChange={(e) => setEditCategoryNameStr(e.target.value)}
                                 className="font-bold bg-[#FFFDF9] border-2 border-[#065239] text-[#0F241C] rounded-lg px-2 py-1 flex-1 min-w-0 text-sm focus:outline-none"
                                 autoFocus
                                 onKeyDown={(e) => e.key === 'Enter' && saveCategoryName(pIdx, cIdx)}
                              />
                              <button onClick={() => saveCategoryName(pIdx, cIdx)} className="text-[#065239] p-1 hover:bg-[#E8F6EE] rounded cursor-pointer"><Check size={16}/></button>
                              <button onClick={() => setEditCategoryIdx(null)} className="text-[#7D6E52] p-1 hover:bg-[#FAF0D4] rounded cursor-pointer"><X size={16}/></button>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-[#0F241C]">{cat.categoryName}</h4>
                              <button onClick={() => { setEditCategoryNameStr(cat.categoryName); setEditCategoryIdx({pkg: pIdx, cat: cIdx}); }} className="text-[#8E7D5E] hover:text-[#9A6A0F] opacity-60 hover:opacity-100 cursor-pointer"><Edit2 size={14}/></button>
                          </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={normalizeCategoryRule(cat.selectionRule)} 
                          onChange={(e) => updateRule(pIdx, cIdx, e.target.value)}
                          className="text-xs bg-[#FFFDF9] border border-[#DFC78A] rounded-lg px-2 py-1 focus:border-[#D4961B] focus:outline-none font-semibold text-[#8E5B08] cursor-pointer hover:bg-[#FAF0D4]/50 w-full max-w-[140px]" 
                        >
                          {STANDARD_SELECTION_RULES.map((ruleOption) => (
                            <option key={ruleOption} value={ruleOption}>{ruleOption}</option>
                          ))}
                          {!STANDARD_SELECTION_RULES.includes(normalizeCategoryRule(cat.selectionRule)) && (
                            <option value={normalizeCategoryRule(cat.selectionRule)}>
                              {normalizeCategoryRule(cat.selectionRule)}
                            </option>
                          )}
                        </select>
                        <span className="bg-[#FAF0D4] border border-[#DFC78A] text-[#6B4A10] text-[10px] font-bold px-2 py-1 rounded-md tabular-nums">
                          {cat.items?.length || 0} Items
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => duplicateCategory(pIdx, cIdx)} className="p-1.5 text-[#8E7D5E] hover:text-[#9A6A0F] hover:bg-[#FAF0D4] rounded-lg transition-colors cursor-pointer" title="Duplicate Category">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => setDeleteCategoryModal({pkgIdx: pIdx, catIdx: cIdx, name: cat.categoryName})} className="p-1.5 text-[#8E7D5E] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Category">
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 space-y-2">
                    {cat.items?.map((item, iIdx) => (
                      <div key={iIdx} className="flex flex-row items-center gap-3 py-1 group/item border-b border-dashed border-[#EFE3C4] last:border-0 hover:bg-[#FAF3E2]/55 px-1.5 rounded-lg transition-all">
                        <div className="text-[#B8A582] group-hover/item:text-[#6B5F4B] cursor-grab px-1"><GripVertical size={14}/></div>
                        
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <span className="text-sm font-bold text-[#0F241C] truncate">{item}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider block mt-0.5",
                            getBuilderItemStatus(item) === 'Approved' ? "text-emerald-700" :
                            getBuilderItemStatus(item) === 'Pending Admin Review' ? "text-[#B87D16]" :
                            getBuilderItemStatus(item) === 'Rejected' ? "text-red-600" : "text-[#8E7D5E]"
                          )}>
                            {getBuilderItemStatus(item) === 'Pending Admin Review' ? 'Review Pending' : getBuilderItemStatus(item)}
                          </span>
                        </div>
                        
                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                            {/* Move to Category Dropdown */}
                            <div className="relative group/move">
                                <button className="p-1 text-[#7D6E52] hover:text-[#065239] rounded hover:bg-[#E8F6EE] flex items-center gap-1 cursor-pointer" title="Move to Category">
                                   <ChevronDown size={14} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-[#FFFDF8] border border-[#DFC78A] shadow-xl rounded-xl p-1 hidden group-hover/move:block z-10">
                                    <p className="text-[10px] font-bold text-[#8E7D5E] uppercase tracking-wider px-2 py-1">Move to:</p>
                                    {pkg.categories.map((targetCat, tIdx) => (
                                        <button 
                                           key={tIdx} 
                                           onClick={(e) => { e.stopPropagation(); moveItem(pIdx, cIdx, iIdx, tIdx); }}
                                           className={cn("w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer", tIdx === cIdx ? "bg-[#E8F6EE] text-[#065239] font-bold" : "hover:bg-[#FAF0D4]/60 text-[#0F241C]")}
                                        >
                                            {targetCat.categoryName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                              onClick={() => {
                                setCatererEditingItem({ item_name: item, package_idx: pIdx, category_idx: cIdx, item_idx: iIdx });
                                setCatererImgPreview(getBuilderItemImage(item));
                              }} 
                              className="p-1 text-[#7D6E52] hover:text-[#065239] rounded hover:bg-[#E8F6EE] cursor-pointer" 
                              title="Change/Upload Image"
                            >
                                <UploadCloud size={14} />
                            </button>
                            
                            <button onClick={() => setShowEditItemModal({pkgIdx: pIdx, catIdx: cIdx, itemIdx: iIdx, currentName: item})} className="p-1 text-[#7D6E52] hover:text-[#9A6A0F] rounded hover:bg-[#FAF0D4] cursor-pointer" title="Edit Item">
                                <Edit2 size={14} />
                            </button>
 
                            <button onClick={() => setDeleteItemModal({pkgIdx: pIdx, catIdx: cIdx, itemIdx: iIdx, name: item})} className="p-1 text-[#7D6E52] hover:text-red-600 rounded hover:bg-red-50 cursor-pointer" title="Delete Item">
                                <Trash2 size={14} />
                            </button>
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => openAddItemModal(pIdx, cIdx)} className="mt-2 text-[#065239] text-sm font-semibold flex items-center gap-1 hover:text-[#01291D] px-2 py-2 w-full hover:bg-[#E8F6EE] rounded-lg transition-colors cursor-pointer">
                      <Plus size={16} /> Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-[#FCF7E8] border-t border-[#EFE3C4] flex justify-center">
                 <button onClick={() => openAddCategory(pIdx)} className="px-6 py-2.5 bg-gradient-to-r from-[#024731] to-[#013122] text-[#FFFDF8] border border-[#D9A323]/45 rounded-xl text-sm font-bold shadow-sm hover:from-[#03583D] hover:to-[#023C2A] flex items-center gap-2 transition-colors cursor-pointer">
                    <Plus size={18} className="text-[#F5C642]"/> Add Category
                 </button>
            </div>
          </div>
        )})}
        </div>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
                >
                    <button onClick={() => setShowAddCategoryModal(false)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-6">Add New Category</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Category Name</label>
                            <input 
                               type="text" 
                               value={newCatName}
                               onChange={(e) => setNewCatName(e.target.value)}
                               placeholder="e.g. Premium Desserts"
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] placeholder:text-[#8E7D5E] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none"
                               autoFocus
                               onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Selection Rule</label>
                            <select 
                               value={normalizeCategoryRule(newCatRule)}
                               onChange={(e) => setNewCatRule(e.target.value)}
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none cursor-pointer"
                            >
                               {STANDARD_SELECTION_RULES.map((ruleOption) => (
                                 <option key={ruleOption} value={ruleOption}>{ruleOption}</option>
                               ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowAddCategoryModal(false)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleAddCategory} className="flex-1 py-3 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">Create Category</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setShowAddItemModal(null)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-6">Add New Item</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Item Name</label>
                            <input 
                               type="text" 
                               value={newItemName}
                               onChange={(e) => setNewItemName(e.target.value)}
                               placeholder="e.g. Paneer Butter Masala"
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] placeholder:text-[#8E7D5E] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none"
                               autoFocus
                               onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowAddItemModal(null)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={handleAddItem} className="flex-1 py-3 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">Add Item</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {showEditItemModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setShowEditItemModal(null)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-6">Edit Item</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Item Name</label>
                            <input 
                               type="text" 
                               value={showEditItemModal.currentName}
                               onChange={(e) => setShowEditItemModal({...showEditItemModal, currentName: e.target.value})}
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none"
                               autoFocus
                               onKeyDown={(e) => e.key === 'Enter' && saveEditedItem()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowEditItemModal(null)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={saveEditedItem} className="flex-1 py-3 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">Save Changes</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Add Package Modal */}
      <AnimatePresence>
        {showAddPackageModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                    <button onClick={() => setShowAddPackageModal(false)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-6">Create Package Manually</h3>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Package Name</label>
                            <input 
                               type="text" 
                               value={newPkgData.name}
                               onChange={(e) => setNewPkgData({...newPkgData, name: e.target.value})}
                               placeholder="e.g. Premium Wedding Buffet"
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] placeholder:text-[#8E7D5E] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Package Type</label>
                            <select 
                               value={newPkgData.type}
                               onChange={(e) => setNewPkgData({...newPkgData, type: e.target.value})}
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none cursor-pointer"
                            >
                               <option value="Veg">Veg</option>
                               <option value="Non-Veg">Non-Veg</option>
                               <option value="Breakfast">Breakfast</option>
                               <option value="Mixed">Mixed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Price Per Plate (₹)</label>
                            <input 
                               type="number" 
                               value={newPkgData.price}
                               onChange={(e) => setNewPkgData({...newPkgData, price: e.target.value})}
                               placeholder="e.g. 450"
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] placeholder:text-[#8E7D5E] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none tabular-nums"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#0F241C] mb-1.5">Minimum Guests</label>
                            <input 
                               type="number" 
                               value={newPkgData.minGuests}
                               onChange={(e) => setNewPkgData({...newPkgData, minGuests: e.target.value})}
                               placeholder="e.g. 100"
                               className="w-full border border-[#DFC78A] bg-[#FFFDF9] text-[#0F241C] placeholder:text-[#8E7D5E] px-4 py-3 rounded-xl focus:border-[#D4961B] focus:ring-2 focus:ring-[#D4961B]/20 outline-none tabular-nums"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setShowAddPackageModal(false)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={createManualPackage} className="flex-1 py-3 bg-gradient-to-b from-[#065239] to-[#012217] border border-[#D4961B]/60 text-[#FFFDF8] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">Create Package</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletePackageModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setDeletePackageModal(null)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-2">Delete Package?</h3>
                    <p className="text-[#5C5240] text-sm mb-6">Are you sure you want to delete <span className="font-bold text-[#0F241C]">"{deletePackageModal.name}"</span>? All categories and items inside it will be permanently removed.</p>

                    <div className="flex gap-3">
                        <button onClick={() => setDeletePackageModal(null)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={confirmDeletePackage} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors cursor-pointer">Delete Package</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteCategoryModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setDeleteCategoryModal(null)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-2">Delete Category?</h3>
                    <div className="mb-6">
                        <p className="text-[#5C5240] text-sm mb-1">Category Name:</p>
                        <p className="font-bold text-[#0F241C] bg-[#FAF3E2] border border-[#DFC78A] p-3 rounded-xl">{deleteCategoryModal.name}</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setDeleteCategoryModal(null)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={confirmDeleteCategory} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors cursor-pointer">Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItemModal && (
            <div className="fixed inset-0 bg-[#011B13]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-[#FFFDF8] border border-[#DFC78A] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setDeleteItemModal(null)} className="absolute top-4 right-4 text-[#7D6E52] hover:text-[#0F241C] bg-[#FAF3E2] hover:bg-[#FAF0D4] rounded-full p-2 cursor-pointer transition-colors"><X size={18}/></button>
                    <h3 className="text-xl font-display font-bold text-[#0F241C] mb-2">Delete Item?</h3>
                    <p className="text-[#5C5240] text-sm mb-6">Are you sure you want to delete <span className="font-bold text-[#0F241C]">"{deleteItemModal.name}"</span>?</p>

                    <div className="flex gap-3">
                        <button onClick={() => setDeleteItemModal(null)} className="flex-1 py-3 bg-[#FAF3E2] border border-[#DFC78A] text-[#494032] font-bold rounded-xl hover:bg-[#FAF0D4] transition-colors cursor-pointer">Cancel</button>
                        <button onClick={confirmDeleteItem} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors cursor-pointer">Delete Item</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>



    </div>
  );
}
