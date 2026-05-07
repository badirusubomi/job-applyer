'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Briefcase, HelpCircle, Sparkles, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/job-watcher', label: 'Job Watcher', icon: Briefcase },
  { href: '/profile-editor', label: 'Profile Editor', icon: FileText },
  { href: '/application-assistant', label: 'Assistant', icon: Sparkles },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(232,252,59,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full w-64 bg-black text-white
          flex flex-col uppercase tracking-wider text-sm font-semibold
          z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r-4 border-black
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b-2 border-white/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Applyer Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-black font-playfair tracking-tighter">APPLYER</h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-[#e8fc3b] text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black border-r-0 translate-x-1 outline-none' 
                    : 'hover:bg-white hover:text-black border-2 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — pinned to bottom via mt-auto */}
        <div className="p-4 border-t border-white/10 mt-auto space-y-2">
          <a 
            href='https://ko-fi.com/B0B81Z4K3J' 
            target='_blank' 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 transition-all hover:bg-white/5 border-2 border-transparent hover:border-white/10 group rounded-sm"
          >
            <img 
              height='28' 
              style={{ border: '0px', height: '28px' }} 
              src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' 
              alt='Ko-fi' 
              className="flex-shrink-0"
            />
          </a>

          <a
            href="mailto:badirusubomi@gmail.com"
            className="flex items-center px-4 py-3 transition-all hover:bg-[#ff5e5b] hover:text-white border-2 border-transparent hover:border-black group"
          >
            <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              Get Support
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
