import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Package, Activity, MessageSquare, ChefHat, Edit, Star, Image as ImageIcon, Settings, Bell, TrendingUp, CalendarDays, ChevronRight, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function PartnerDashboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState<any>(null);
  const [partnerOrders, setPartnerOrders] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('registrations');
    if (raw) {
       const all = JSON.parse(raw);
       const found = all.find((c: any) => c.id === id);
       if (found) {
           setCaterer(found);
       }
    }
    
    // Fetch orders
    const rawOrders = localStorage.getItem('orders');
    if (rawOrders) {
        const allOrders = JSON.parse(rawOrders);
        const myOrders = allOrders.filter((o: any) => o.catererId === id);
        // sort by newest
        myOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPartnerOrders(myOrders);
    }
  }, [id]);

  if (!caterer) return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex flex-col items-center justify-center text-[#083A28] font-medium font-poppins">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#DFC78A] border-t-[#024731] mb-4" />
      Loading dashboard...
    </div>
  );

  const handleEditClick = () => {
     navigate(`/edit-business/${caterer.id}`);
  };

  const totalOrders = partnerOrders.length;
  const pendingOrders = partnerOrders.filter(o => o.status === 'Pending Caterer Review').length;
  const approvedOrders = partnerOrders.filter(o => o.status === 'Approved').length;
  const modifiedOrders = partnerOrders.filter(o => o.status === 'Modified').length;
  const rejectedOrders = partnerOrders.filter(o => o.status === 'Rejected').length;
  const completedOrders = partnerOrders.filter(o => o.status === 'Completed').length;
  
  // Calculate Revenue from Approved and Completed
  const revenue = partnerOrders
      .filter(o => o.status === 'Approved' || o.status === 'Completed')
      .reduce((acc, curr) => acc + (Number(curr.totalEstimate) || 0), 0);

  const stats = [
    { label: 'Total Orders', val: totalOrders, trend: 'All Time', icon: Package, color: 'text-[#054A33]', bg: 'bg-[#E7F4EC] border border-[#054A33]/15' },
    { label: 'Pending Review', val: pendingOrders, trend: 'Needs action', icon: Clock, color: 'text-[#9C6F11]', bg: 'bg-[#FAF1DA] border border-[#DFC78A]' },
    { label: 'Revenue Earned', val: `₹${revenue.toLocaleString('en-IN')}`, trend: 'Approved & Completed', icon: Activity, color: 'text-[#054A33]', bg: 'bg-[#E7F4EC] border border-[#054A33]/15' },
    { label: 'Completed Orders', val: completedOrders, trend: 'Delivered', icon: CheckCircle, color: 'text-[#9C6F11]', bg: 'bg-[#FAF1DA] border border-[#DFC78A]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] pb-20 font-poppins">
      {/* Emerald & Gold Partner Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#01291D] via-[#034431] to-[#01261B] pt-24 pb-10 px-4 sm:px-6 lg:px-8 border-b-2 border-[#D9A323]/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-display font-bold text-[#FFFDF8]">{caterer.businessName}</h1>
              <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border", caterer.status === 'Approved' ? "bg-[#E7F4EC] text-[#054A33] border-[#054A33]/20" : "bg-[#FAF1DA] text-[#7D5708] border-[#DFC78A]")}>
                {caterer.status}
              </span>
            </div>
            <p className="text-[#DFC78A]/90 font-poppins text-xs sm:text-sm flex items-center gap-2">
              Partner Dashboard • ID: {id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/orders')} className="relative p-2.5 bg-[#011F16]/85 text-[#F8D76A] hover:bg-[#023828] rounded-xl border border-[#DFC78A]/45 transition-colors shadow-sm cursor-pointer">
              <Bell size={20} />
              {pendingOrders > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F2BE3B] rounded-full border-2 border-[#011F16]"></span>}
            </button>
            <button onClick={() => navigate(`/edit-business/${caterer.id}`)} className="bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] hover:brightness-105 text-[#042419] border border-[#B57B0C]/35 px-5 py-2.5 rounded-xl font-bold font-poppins text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer">
              <Edit size={16} /> Edit Business
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[#FFFDF8] p-6 rounded-[20px] shadow-[0_10px_28px_rgba(140,105,32,0.08)] border border-[#DFC78A] hover:border-[#D4961B] transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                      <stat.icon size={22} />
                    </div>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-[#083A28] mb-1 tabular-nums">{stat.val}</h3>
                  <p className="text-sm font-bold text-[#6B5A38] mb-1.5">{stat.label}</p>
                  <p className="text-xs font-semibold text-[#054A33]">{stat.trend}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-[#FFFDF8] p-6 rounded-[20px] border border-[#DFC78A] shadow-[0_8px_24px_rgba(140,105,32,0.07)] flex items-center gap-4">
              <div className="bg-[#E7F4EC] text-[#054A33] border border-[#054A33]/15 p-3 rounded-xl"><CheckCircle size={20}/></div>
              <div>
                 <p className="text-xs uppercase tracking-wider font-bold text-[#6B5A38]">Approved</p>
                 <p className="text-xl font-bold text-[#083A28] tabular-nums">{approvedOrders}</p>
              </div>
           </div>
           <div className="bg-[#FFFDF8] p-6 rounded-[20px] border border-[#DFC78A] shadow-[0_8px_24px_rgba(140,105,32,0.07)] flex items-center gap-4">
              <div className="bg-[#FAF1DA] text-[#9C6F11] border border-[#DFC78A] p-3 rounded-xl"><RefreshCw size={20}/></div>
              <div>
                 <p className="text-xs uppercase tracking-wider font-bold text-[#6B5A38]">Modified</p>
                 <p className="text-xl font-bold text-[#083A28] tabular-nums">{modifiedOrders}</p>
              </div>
           </div>
           <div className="bg-[#FFFDF8] p-6 rounded-[20px] border border-[#DFC78A] shadow-[0_8px_24px_rgba(140,105,32,0.07)] flex items-center gap-4">
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl"><XCircle size={20}/></div>
              <div>
                 <p className="text-xs uppercase tracking-wider font-bold text-[#6B5A38]">Rejected</p>
                 <p className="text-xl font-bold text-[#083A28] tabular-nums">{rejectedOrders}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#FFFDF8] rounded-[20px] border border-[#DFC78A] shadow-[0_10px_28px_rgba(140,105,32,0.08)] overflow-hidden flex flex-col">
                   <div className="px-6 py-4 border-b border-[#D9A323]/40 flex justify-between items-center bg-gradient-to-r from-[#01291D] to-[#034431] text-[#FFFDF8]">
                       <h3 className="font-bold font-display text-base flex items-center gap-2"><CalendarDays size={18} className="text-[#F8D76A]"/> Recent Orders</h3>
                       <button onClick={() => navigate('/orders')} className="text-xs font-bold text-[#F8D76A] hover:underline cursor-pointer">View CRM</button>
                   </div>
                   <div className="divide-y divide-[#E8D7B0] flex-1 h-[400px] overflow-y-auto">
                       {partnerOrders.length === 0 ? (
                           <div className="p-8 text-center text-[#6B5A38] text-sm">No orders received yet.</div>
                       ) : (
                           partnerOrders.map(ord => (
                               <div key={ord.id} className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#FAF3E2]/60 transition-colors">
                                   <div>
                                       <p className="font-bold text-[#083A28] text-sm mb-1">{ord.customerName} - {ord.packageDetails?.packageName || 'Custom'}</p>
                                       <p className="text-xs text-[#6B5A38]">{ord.id} • Event Date: {ord.eventDate || 'TBD'} • Guests: {ord.guests}</p>
                                   </div>
                                   <div className="flex items-center gap-4">
                                       <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", 
                                           ord.status === 'Approved' || ord.status === 'Completed' ? "bg-[#E7F4EC] text-[#054A33] border-[#054A33]/15" :
                                           ord.status === 'Pending Caterer Review' || 'Submitted' ? "bg-[#FAF1DA] text-[#7D5708] border-[#DFC78A]" :
                                           ord.status === 'Rejected' || ord.status === 'Cancelled' ? "bg-red-50 text-red-700 border-red-200" :
                                           "bg-blue-50 text-blue-800 border-blue-200")}>
                                          {ord.status}
                                       </span>
                                       <button onClick={() => navigate('/orders')} className="w-8 h-8 flex items-center justify-center bg-[#FAF3E2] border border-[#DFC78A] rounded-lg text-[#083A28] hover:bg-[#F3E6C6] transition-colors cursor-pointer">
                                           <ChevronRight size={16} />
                                       </button>
                                   </div>
                               </div>
                           ))
                       )}
                   </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-[#FFFDF8] rounded-[20px] shadow-[0_10px_28px_rgba(140,105,32,0.08)] border border-[#DFC78A] p-6">
                    <h3 className="font-bold font-display text-[#083A28] mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button onClick={handleEditClick} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-[#132A1F] hover:bg-[#FAF3E2] hover:text-[#083A28] rounded-xl transition-colors border border-transparent hover:border-[#DFC78A] cursor-pointer">
                           <div className="w-8 h-8 rounded-lg bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] flex items-center justify-center"><ChefHat size={16}/></div>
                           Edit Core Menu Items
                        </button>
                        <button onClick={handleEditClick} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-[#132A1F] hover:bg-[#FAF3E2] hover:text-[#083A28] rounded-xl transition-colors border border-transparent hover:border-[#DFC78A] cursor-pointer">
                           <div className="w-8 h-8 rounded-lg bg-[#E7F4EC] border border-[#054A33]/15 text-[#054A33] flex items-center justify-center"><Package size={16}/></div>
                           Update Package Plans
                        </button>
                        <button onClick={handleEditClick} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-[#132A1F] hover:bg-[#FAF3E2] hover:text-[#083A28] rounded-xl transition-colors border border-transparent hover:border-[#DFC78A] cursor-pointer">
                           <div className="w-8 h-8 rounded-lg bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] flex items-center justify-center"><ImageIcon size={16}/></div>
                           Manage Photos &amp; Gallery
                        </button>
                        <button onClick={handleEditClick} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-[#132A1F] hover:bg-[#FAF3E2] hover:text-[#083A28] rounded-xl transition-colors border border-transparent hover:border-[#DFC78A] cursor-pointer">
                           <div className="w-8 h-8 rounded-lg bg-[#E7F4EC] border border-[#054A33]/15 text-[#054A33] flex items-center justify-center"><Settings size={16}/></div>
                           Business Settings
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#01291D] via-[#034431] to-[#011D15] border border-[#D9A323]/55 p-6 rounded-[20px] shadow-[0_14px_34px_rgba(1,34,23,0.22)] text-[#FFFDF8] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F8D76A]/10 rounded-full blur-2xl pointer-events-none"></div>
                    <h3 className="font-display font-bold text-lg mb-2 text-[#F8D76A]">Growth Center</h3>
                    <p className="text-sm font-poppins text-[#DFC78A]/90 mb-6">Complete your profile 100% to rank higher in customer searches.</p>
                    <div className="w-full bg-[#011710] border border-[#DFC78A]/25 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#FCE07E] via-[#F2BE3B] to-[#D99B16] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs font-bold text-[#F8D76A] text-right">75% Completed</p>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}
