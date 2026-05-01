'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Briefcase, HelpCircle } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/job-watcher', label: 'Job Watcher', icon: Briefcase },
    { href: '/profile-editor', label: 'Profile Editor', icon: FileText },
    { href: '/application-assistant', label: 'Assistant', icon: Activity },
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

      <div className="p-4 border-t border-white/10 mt-auto">
        <a
          href="mailto:badirusubomi@gmail.com"
          className="flex items-center px-4 py-3 transition-all hover:bg-[#ff5e5b] hover:text-white border-2 border-transparent hover:border-black group relative overflow-hidden"
        >
          <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 font-bold">
            GET SUPPORT
          </span>
        </a>
      </div>
    </>
  );
}
