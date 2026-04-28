'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Briefcase } from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/job-watcher', label: 'Job Watcher', icon: Briefcase },
    { href: '/profile-editor', label: 'Profile Editor', icon: FileText },
    { href: '/application-assistant', label: 'Assistant', icon: Activity },
  ];

  return (
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
  );
}
