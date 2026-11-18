import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-lg bg-[#FFFDF8] rounded-[24px] shadow-[0_18px_45px_rgba(116,84,22,0.12)] overflow-hidden border border-[#DFC78A]"
      >
        <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#01291D] px-8 py-7 text-center border-b border-[#D9A323]/45">
          <div className="w-20 h-20 bg-[#011F16]/85 border border-[#DFC78A]/60 text-[#F8D76A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#FFFDF8]">Registration Submitted</h1>
        </div>

        <div className="p-8 text-center">
          <div className="bg-[#FAF3E2] border border-[#DFC78A] text-[#7D5708] p-4 rounded-xl mb-6 flex flex-col items-center">
             <div className="flex items-center gap-2 font-bold text-[#083A28] mb-1">
                <Clock size={18} className="text-[#B57B0C]" /> Status: Pending Admin Approval
             </div>
             <p className="text-sm text-[#6B5A38]">Estimated review time: 24-48 hours</p>
          </div>
          
          <p className="text-[#5D665F] text-sm leading-relaxed mb-8 font-poppins">
             Thank you for joining PlanMyChoice! Our team will review your application and documents carefully. 
             You will receive an email and notification once your business is approved.
          </p>

          <Link to="/businesses" className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-bold py-3.5 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] text-sm">
              View My Businesses <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
