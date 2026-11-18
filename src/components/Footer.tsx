import React from 'react';
import { Facebook, Twitter, Instagram, Send, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#023224] via-[#012218] to-[#01150F] text-[#DCE6E1]/80 pt-16 sm:pt-20 pb-10 border-t border-[#D9A323]/65 font-sans overflow-hidden">
      {/* Subtle Top Gold Shimmer Line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FCE07E]/75 to-transparent"
        aria-hidden="true"
      />
      {/* Ambient Center Emerald Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(16, 102, 74, 0.22) 0%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">

          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-3 text-left">
            <Link to="/" className="inline-flex items-center group mb-4">
              <img
                src="/assets/aistudio/image_6ce019e3.png"
                alt="PlanMyChoice"
                className="w-[205px] sm:w-[225px] h-auto object-contain select-none brightness-105 contrast-110 drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] group-hover:scale-[1.02] transition-transform"
              />
            </Link>
            <p className="text-[#E9DEC4]/75 text-sm leading-relaxed mb-6 mt-2">
              India&apos;s most trusted platform to discover and book premium caterers for every occasion.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-[#011B13] border border-[#D9A323]/45 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#FCE07E] hover:to-[#D49617] hover:text-[#042419] hover:border-transparent transition-all text-[#F5C642]"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1 lg:col-span-2 text-left">
            <h4
              className="text-[#F8D76A] font-bold mb-5 font-display text-sm uppercase tracking-wider"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3 text-xs font-semibold text-[#EFF5F2]/85">
              <li><Link to="/" className="hover:text-[#F8D76A] transition-colors">Home</Link></li>
              <li><Link to="/explore" className="hover:text-[#F8D76A] transition-colors">Explore Caterers</Link></li>
              <li><Link to="/explore" className="hover:text-[#F8D76A] transition-colors">Packages</Link></li>
              <li><Link to="/explore" className="hover:text-[#F8D76A] transition-colors">Occasions</Link></li>
              <li><Link to="/about" className="hover:text-[#F8D76A] transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3: For Customers */}
          <div className="col-span-1 lg:col-span-3 text-left">
            <h4
              className="text-[#F8D76A] font-bold mb-5 font-display text-sm uppercase tracking-wider"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              For Customers
            </h4>
            <ul className="space-y-3 text-xs font-semibold text-[#EFF5F2]/85">
              <li><Link to="/explore" className="hover:text-[#F8D76A] transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-[#F8D76A] transition-colors">FAQ&apos;s</Link></li>
              <li><Link to="/about" className="hover:text-[#F8D76A] transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/about" className="hover:text-[#F8D76A] transition-colors">Refund Policy</Link></li>
              <li><Link to="/contact" className="hover:text-[#F8D76A] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Payments */}
          <div className="col-span-1 lg:col-span-4 text-left">
            <h4
              className="text-[#F8D76A] font-bold mb-5 font-display text-sm uppercase tracking-wider"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Subscribe to our newsletter
            </h4>
            <p className="text-xs mb-4 text-[#E9DEC4]/75 font-medium">
              Get updates on new caterers, offers &amp; exclusive discounts.
            </p>
            <div className="flex bg-[#011811] border border-[#D9A323]/55 focus-within:border-[#F8D76A] rounded-xl p-1 mb-6 shadow-inner">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-2 text-[#FFFDF8] placeholder-[#A8BFB4]/60 focus:outline-none text-xs font-medium"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="bg-gradient-to-b from-[#FCE07E] via-[#F2BE3B] to-[#D49617] hover:brightness-105 text-[#042419] p-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Send size={14} />
              </button>
            </div>

            {/* We Accept Payment Badges */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#D9A323]/25 pt-5">
              <span className="text-[10px] text-[#E9DEC4]/70 font-bold uppercase mr-1.5">We Accept</span>
              {['VISA', 'MASTERCARD', 'UPI', 'RUPAY'].map((badge) => (
                <span
                  key={badge}
                  className="bg-[#011B13] border border-[#D9A323]/40 px-2.5 py-1 rounded-md font-bold text-[#F8D76A] text-[10px] tracking-wider"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#D9A323]/25 pt-7 flex flex-col md:flex-row justify-between items-center gap-4 text-[#E9DEC4]/65">
          <p className="text-xs font-semibold">
            © {new Date().getFullYear()} PlanMyChoice. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
