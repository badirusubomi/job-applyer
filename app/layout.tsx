import type { Metadata } from 'next';
import { Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import SidebarNav from './components/SidebarNav';
import { ToastProvider } from './components/ToastProvider';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const plexMono = IBM_Plex_Mono({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-plex' });

export const metadata: Metadata = {
  title: 'Applyer',
  description: 'Local AI-powered job application automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plexMono.className} ${playfair.variable} bg-[#f4f4f0] text-black flex h-[100dvh] overflow-hidden antialiased`}>
        <ToastProvider>
          {/* Sidebar — hidden on mobile, visible on lg+ */}
          <SidebarNav />

          {/* Main Content — full width on mobile, flex-1 on desktop */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#e5e5df] w-full">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
