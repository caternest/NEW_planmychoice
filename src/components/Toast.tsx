import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export let toast: (message: string, type?: 'success' | 'error') => void = () => {};

export function ToastProvider() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    toast = (message: string, type: 'success' | 'error' = 'success') => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_14px_34px_rgba(1,34,23,0.22)] text-sm font-semibold max-w-sm border backdrop-blur-md",
              t.type === 'success'
                ? "bg-[#FFFDF8] text-[#083A28] border-[#DFC78A]"
                : "bg-[#FFF6F6] text-red-900 border-red-200"
            )}
          >
            {t.type === 'success' ? (
              <span className="w-7 h-7 rounded-full bg-[#DCF8E6] border border-[#9EE2BA] flex items-center justify-center shrink-0">
                <CheckCircle size={16} className="text-[#065239]" />
              </span>
            ) : (
              <span className="w-7 h-7 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-red-600" />
              </span>
            )}
            <span className="leading-snug">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto hover:bg-[#FAF0D4] text-[#6B5F4B] p-1 rounded-lg transition-colors cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
