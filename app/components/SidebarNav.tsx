'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Briefcase, HelpCircle, Sparkles, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/home', label: 'Home', icon: Activity },
  { href: '/job-watcher', label: 'Job Watcher', icon: Briefcase },
  { href: '/profile-editor', label: 'Profile Editor', icon: FileText },
  { href: '/application-assistant', label: 'Assistant', icon: Sparkles },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomeHidden, setIsWelcomeHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true); // default true to avoid flicker if SSR, but we handle mounted

  useEffect(() => {
    setMounted(true);
    const hidden = localStorage.getItem('welcome_hidden') === 'true';
    setIsWelcomeHidden(hidden);
    setIsOnboardingComplete(localStorage.getItem('applyer_onboarding_complete') === 'true');

    const handleOnboardingComplete = () => setIsOnboardingComplete(true);
    window.addEventListener('applyer_onboarding_complete', handleOnboardingComplete);
    return () => window.removeEventListener('applyer_onboarding_complete', handleOnboardingComplete);
  }, []);

  const toggleWelcomeVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isWelcomeHidden;
    setIsWelcomeHidden(newState);
    localStorage.setItem('welcome_hidden', newState.toString());
  };

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

  if (!mounted) return null;

  let mainNavItems = navItems;
  if (!isOnboardingComplete) {
    // Only show home when onboarding is incomplete
    mainNavItems = navItems.filter(item => item.href === '/home');
  } else if (isWelcomeHidden) {
    mainNavItems = navItems.filter(item => item.href !== '/home');
  }

  const hiddenWelcomeItem = navItems.find(item => item.href === '/home');

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
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center group relative px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-[#e8fc3b] text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black border-r-0 translate-x-1 outline-none' 
                    : 'hover:bg-white hover:text-black border-2 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.label}</span>
                {item.href === '/home' && (
                  <button 
                    onClick={toggleWelcomeVisibility}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 text-black transition-opacity"
                    title="Hide Welcome Page"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — pinned to bottom via mt-auto */}
        <div className="p-4 border-t border-white/10 mt-auto space-y-2">
          {isWelcomeHidden && hiddenWelcomeItem && (
            <Link
              href={hiddenWelcomeItem.href}
              className={`flex items-center px-4 py-2 text-[10px] opacity-40 hover:opacity-100 transition-all border-2 border-dashed border-white/10 hover:border-[#e8fc3b] hover:text-[#e8fc3b] group ${pathname === hiddenWelcomeItem.href ? 'opacity-100 text-[#e8fc3b] border-[#e8fc3b]' : ''}`}
            >
              <hiddenWelcomeItem.icon className="w-3 h-3 mr-2" />
              <span className="flex-1 uppercase font-bold tracking-[0.2em]">{hiddenWelcomeItem.label}</span>
              <button 
                onClick={toggleWelcomeVisibility}
                className="p-1 hover:bg-white/10 text-white transition-opacity"
                title="Unhide Welcome Page"
              >
                <Eye className="w-3 h-3" />
              </button>
            </Link>
          )}

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
