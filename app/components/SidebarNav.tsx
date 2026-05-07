'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Briefcase, HelpCircle, Sparkles } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/job-watcher', label: 'Job Watcher', icon: Briefcase },
    { href: '/profile-editor', label: 'Profile Editor', icon: FileText },
    { href: '/application-assistant', label: 'Assistant', icon: Sparkles },
  ];

  return (
    <>
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
    </>
  );
}
