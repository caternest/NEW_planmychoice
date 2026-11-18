import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChefHat, Calendar, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide customer bottom navigation on dashboard/portal routes
  const isCatererDashboard =
    currentPath.startsWith('/caterer-dashboard') ||
    currentPath.startsWith('/partner') ||
    currentPath.startsWith('/businesses') ||
    currentPath.startsWith('/edit-business');

  const isAdminDashboard =
    currentPath.startsWith('/admin-dashboard') ||
    currentPath.startsWith('/admin/');

  if (isCatererDashboard || isAdminDashboard) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      label: 'Caterers',
      icon: ChefHat,
      path: '/explore',
    },
    {
      label: 'Orders',
      icon: Calendar,
      path: '/orders',
    },
    {
      label: 'Profile',
      icon: User,
      path: '/profile',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF8]/95 border-t border-[#DFC78A] px-3 py-1.5 flex justify-around items-center z-40 shadow-[0_-6px_22px_rgba(140,105,32,0.12)] backdrop-blur-md">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(item.path);

        return (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition-all duration-200 active:scale-95',
              isActive && 'bg-gradient-to-b from-[#FCE9A8]/65 to-[#F5D67B]/45 border border-[#D9A323]/45 shadow-2xs'
            )}
          >
            <item.icon
              size={19}
              className={cn(
                'transition-all duration-200',
                isActive
                  ? 'text-[#024731] stroke-[2.4px]'
                  : 'text-[#6E6350] hover:text-[#024731] stroke-[1.9px]'
              )}
            />
            <span
              className={cn(
                'text-[10px] mt-0.5 font-poppins transition-all duration-200',
                isActive
                  ? 'text-[#024731] font-bold'
                  : 'text-[#6E6350] font-semibold'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
