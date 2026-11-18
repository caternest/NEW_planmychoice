import { useState } from 'react';
import { Check, X, Building2, Search, ArrowRight, ShieldCheck, Mail, Phone, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('pending');
  
  const pendingCaterers = [
    { id: 1, name: "Hyderabadi Grand Events", owner: "Mohammed Ali", phone: "+91 9988776655", date: "2 hours ago", status: "pending", location: "Jubilee Hills" },
    { id: 2, name: "Sri Balaji Caterers", owner: "V. Sharma", phone: "+91 8877665544", date: "5 hours ago", status: "pending", location: "Madhapur" },
    { id: 3, name: "Urban Tastes", owner: "Sneha Reddy", phone: "+91 7766554433", date: "1 day ago", status: "pending", location: "Kukatpally" },
  ];

  return (
    <div className="pt-24 pb-20 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#01291D] via-[#034431] to-[#01261B] border border-[#D9A323]/45 p-6 sm:p-8 shadow-[0_18px_45px_rgba(1,36,25,0.18)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#FFFDF8] mb-2 flex items-center gap-3">
              <ShieldCheck className="text-[#F5C642]" size={30} />
              Admin Dashboard
            </h1>
            <p className="text-[#D4E6DC] font-poppins text-sm">Manage caterers, review approvals, and monitor platform health.</p>
          </div>
          <div className="flex gap-2">
             <button className="px-5 py-2.5 bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] text-[#042419] border border-[#B57B0C]/35 hover:brightness-105 rounded-xl text-sm font-bold transition-all font-poppins shadow-md cursor-pointer">
               Export Report
             </button>
          </div>
        </div>

        {/* Analytics mini */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Active Caterers', val: '142', inc: '+3 this week' },
            { label: 'Pending Approvals', val: pendingCaterers.length.toString(), inc: 'Requires review' },
            { label: 'Total Orders', val: '8,420', inc: '+12% vs last month' },
            { label: 'Revenue Generated', val: '₹4.5Cr', inc: 'All time' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#FFFDF8] p-6 rounded-2xl shadow-[0_10px_28px_rgba(140,105,32,0.08)] border border-[#DFC78A] hover:-translate-y-1 transition-transform">
               <p className="text-sm font-medium text-[#5C5240] mb-2 font-poppins">{stat.label}</p>
               <h3 className="text-3xl font-display font-bold text-[#0F241C] mb-1 tabular-nums">{stat.val}</h3>
               <p className="text-[11px] text-[#9A6A0F] font-semibold uppercase tracking-wider">{stat.inc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FFFDF8] rounded-3xl border border-[#DFC78A] shadow-[0_14px_36px_rgba(116,84,22,0.10)] overflow-hidden">
           <div className="border-b border-[#EFE3C4] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF3E2]/65">
              <div className="flex space-x-6">
                <button onClick={() => setActiveTab('pending')} className={cn("text-sm font-bold tracking-wide uppercase pb-4 -mb-4 border-b-[3px] transition-colors font-poppins cursor-pointer", activeTab === 'pending' ? "border-[#D4961B] text-[#0F241C]" : "border-transparent text-[#6B5F4B] hover:text-[#0F241C]")}>
                  Approvals <span className="ml-1.5 bg-[#FAF0D4] border border-[#E6CA82] text-[#78530A] px-2 py-0.5 rounded-full text-xs">{pendingCaterers.length}</span>
                </button>
                <button onClick={() => setActiveTab('approved')} className={cn("text-sm font-bold tracking-wide uppercase pb-4 -mb-4 border-b-[3px] transition-colors font-poppins cursor-pointer", activeTab === 'approved' ? "border-[#D4961B] text-[#0F241C]" : "border-transparent text-[#6B5F4B] hover:text-[#0F241C]")}>
                  Active Caterers
                </button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D5E]" />
                <input type="text" placeholder="Search businesses..." className="w-full pl-9 pr-4 py-2 bg-[#FFFDF9] border border-[#DFC78A] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4961B]/25 focus:border-[#D4961B] text-[#0F241C] font-poppins" />
              </div>
           </div>
           
           {activeTab === 'pending' && (
             <div className="divide-y divide-[#EFE3C4]">
               {pendingCaterers.map(c => (
                 <div key={c.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:bg-[#FAF3E2]/45 transition-colors group">
                    <div className="flex gap-4 items-start w-full lg:w-1/3">
                       <div className="w-12 h-12 bg-[#FAF0D4] text-[#9A6A0F] rounded-xl flex items-center justify-center shrink-0 border border-[#DFC78A]">
                         <Building2 size={24} />
                       </div>
                       <div>
                         <h4 className="font-bold text-[#0F241C] text-lg mb-0.5">{c.name}</h4>
                         <p className="text-sm text-[#9A6A0F] font-medium">Applied {c.date}</p>
                       </div>
                    </div>

                    <div className="flex gap-6 w-full lg:w-auto text-sm text-[#494032] font-poppins">
                        <div>
                            <p className="font-semibold text-[#0F241C] mb-1 flex items-center gap-1"><Mail size={14} className="text-[#D4961B]"/> Contact Info</p>
                            <p>{c.owner}</p>
                            <p className="tabular-nums">{c.phone}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-[#0F241C] mb-1">Location</p>
                            <p>{c.location}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0 flex-wrap">
                       <button className="flex-1 lg:flex-none justify-center px-4 py-2.5 text-sm font-medium bg-[#FAF0D4] text-[#78530A] hover:bg-[#F3DFAB] border border-[#DFC78A] rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
                         <Eye size={16} /> Request Changes
                       </button>
                       <button className="flex-1 lg:flex-none justify-center px-4 py-2.5 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-xl flex items-center gap-2 transition-colors border border-red-200 cursor-pointer">
                         <X size={16} /> Reject
                       </button>
                       <button className="flex-1 lg:flex-none justify-center px-6 py-2.5 text-sm font-semibold bg-gradient-to-b from-[#065239] to-[#012217] text-[#FFFDF8] border border-[#D4961B]/60 hover:brightness-110 shadow-md rounded-xl flex items-center gap-2 transition-all cursor-pointer">
                         <Check size={16} /> Approve
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}

           {activeTab === 'approved' && (
             <div className="p-16 flex flex-col items-center justify-center text-center">
                 <ShieldCheck size={48} className="text-[#DFC78A] mb-4" />
                 <h4 className="text-xl font-bold font-display text-[#0F241C] mb-2">No Active Filters</h4>
                 <p className="text-[#5C5240] font-poppins text-sm max-w-sm">Use search to find active caterers, or view the analytics overview to see live statistics.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
