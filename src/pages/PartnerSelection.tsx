import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, PartyPopper, Music, Wand2, Camera, GraduationCap, Mic, Plus, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Full list of partner categories preserved for future activation
  const allPartners = [
    { name: 'Caterer', icon: ChefHat, path: '/join', desc: 'Join the food marketplace', active: true },
    { name: 'Decoration Services', icon: PartyPopper, path: '#', desc: 'Event decors & setups', active: false },
    { name: 'Music Services', icon: Music, path: '#', desc: 'DJs & Live bands', active: false },
    { name: 'Photography', icon: Camera, path: '#', desc: 'Capture memories', active: false },
    { name: 'Classes', icon: GraduationCap, path: '#', desc: 'Cooking & baking', active: false },
    { name: 'Magician', icon: Wand2, path: '#', desc: 'Event entertainment', active: false },
    { name: 'Event Host', icon: Mic, path: '#', desc: 'MCs and hosts', active: false },
  ];

  // Currently available service categories for customer-facing display
  const activePartners = allPartners.filter(p => p.name === 'Caterer');

  const handlePartnerClick = (e: React.MouseEvent, path: string, active: boolean) => {
      e.preventDefault();
      if (!active) return;
      
      if (!user) {
          navigate('/login', { state: { from: path } });
      } else {
          navigate(path);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pb-20">
      {/* Emerald & Gold Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01291D] via-[#034431] to-[#01261B] pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b-2 border-[#D9A323]/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,190,59,0.14),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#F8D76A]/15 text-[#F8D76A] border border-[#DFC78A]/35 mb-4">
            Catering Partner Network
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#FFFDF8] mb-3 tracking-tight">
            Partner with <span className="text-[#F8D76A]">PlanMyChoice</span>
          </h1>
          <p className="text-[#DFC78A]/90 max-w-2xl mx-auto text-sm sm:text-base font-poppins">
            Join our premium marketplace and grow your catering business. Register as a verified caterer to get started.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Display only Caterer as the available service category */}
        <div className="max-w-md mx-auto">
          {activePartners.map((p, idx) => (
            <div 
              key={idx} 
              onClick={(e) => handlePartnerClick(e, p.path, p.active)}
              className="rounded-[24px] p-8 sm:p-10 border border-[#DFC78A] bg-[#FFFDF8] shadow-[0_14px_38px_rgba(140,105,32,0.12)] hover:shadow-[0_20px_48px_rgba(140,105,32,0.18)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden text-center cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-[#E7F4EC] text-[#054A33] border border-[#054A33]/15 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                Active
              </div>
              
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all mx-auto bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-[#065239] group-hover:to-[#012217] group-hover:text-[#F8D76A] shadow-sm">
                <p.icon size={36} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2.5 text-[#083A28]">{p.name}</h3>
              <p className="text-sm text-center font-poppins text-[#5D665F] mb-6">{p.desc}</p>
              
              <div className="flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] group-hover:brightness-105 text-[#042419] border border-[#B57B0C]/35 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_6px_16px_rgba(217,155,22,0.25)]">
                <span>Register Now</span>
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
