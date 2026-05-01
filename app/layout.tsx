import type { Metadata } from 'next';
import { Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Activity, FileText, Briefcase } from 'lucide-react';
import SidebarNav from './components/SidebarNav';
import { ToastProvider } from './components/ToastProvider';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const plexMono = IBM_Plex_Mono({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-plex' });

export const metadata: Metadata = {
  title: 'Job Application Assistant',
  description: 'Local AI-powered job application automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plexMono.className} ${playfair.variable} bg-[#f4f4f0] text-black flex h-screen overflow-hidden antialiased`}>
        <ToastProvider>
          {/* Sidebar */}
        <aside className="w-64 bg-black border-r-4 border-black text-white flex flex-col uppercase tracking-wider text-sm font-semibold">
          <div className="h-16 flex items-center px-6 border-b-2 border-white/20">
            <h1 className="text-2xl font-black font-playfair tracking-tighter">JOB ASSIST</h1>
          </div>
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#e5e5df]">
          {children}
        </main>
        </ToastProvider>
      </body>
    </html>
  );
}
