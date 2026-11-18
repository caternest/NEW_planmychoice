import React from 'react';
import { Check, ChevronRight, Utensils, User, Store, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function JoinSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { title: "Menu & Pricing", desc: "AI Extraction", icon: Utensils },
    { title: "Basic Details", desc: "Contact Information", icon: User },
    { title: "Business Details", desc: "Operations & Location", icon: Store },
    { title: "Documents", desc: "Verification Documents", icon: FileText },
    { title: "Review & Submit", desc: "Final Confirmation", icon: CheckCircle2 }
  ];

  return (
    <div className="relative">
      <div className="absolute left-[26px] top-6 bottom-6 w-[1.5px] bg-[#E3D5B0]" />
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isPast = currentStep > stepNum;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={cn(
                "relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-2xl transition-all duration-200 select-none",
                isActive
                  ? "bg-gradient-to-r from-[#FAE4A0] via-[#F7DC88] to-[#F3CF6B]/85 border border-[#E5B84B] shadow-[0_4px_14px_rgba(217,163,35,0.2)]"
                  : "border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex flex-shrink-0 items-center justify-center relative z-10 transition-all border font-poppins text-xs font-bold",
                    isPast
                      ? "bg-[#024731] border-[#024731] text-white"
                      : isActive
                        ? "bg-gradient-to-b from-[#E8A923] to-[#C88412] border-[#B77A12] text-white shadow-xs"
                        : "bg-[#FFFDF8] border-[#D8CFAF] text-[#494032]"
                  )}
                >
                  {isPast ? <Check size={13} strokeWidth={3} /> : <span>{stepNum}</span>}
                </div>

                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex flex-shrink-0 items-center justify-center border transition-colors",
                    isActive
                      ? "bg-[#FFFDF8]/80 border-[#D9A323]/55 text-[#0F3D2E]"
                      : isPast
                        ? "bg-[#E6F4EC] border-[#A7DCBA] text-[#024731]"
                        : "bg-[#FAF6EC] border-[#E4D7B6] text-[#6B5F4B]"
                  )}
                >
                  <StepIcon size={13} strokeWidth={2.1} />
                </div>

                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[11px] font-bold font-poppins uppercase tracking-wider leading-tight truncate",
                      isActive ? "text-[#0F241C]" : isPast ? "text-[#024731]" : "text-[#3D3526]"
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "text-[10.5px] font-poppins leading-tight mt-0.5 truncate",
                      isActive ? "text-[#4A3B22] font-medium" : "text-[#6B5F4B]"
                    )}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {isActive && (
                <ChevronRight size={14} className="text-[#6B4A10] shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
