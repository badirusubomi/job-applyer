'use client';

import { Sparkles, Briefcase, FileText, CheckCircle2, ChevronRight, Zap, Target, Key } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="flex-1 p-4 pt-16 lg:pt-8 lg:p-12 overflow-y-auto w-full text-black bg-[#f4f4f0]">
      <div className="max-w-4xl">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-black text-[#e8fc3b] text-[10px] font-black uppercase tracking-tighter">Getting Started</span>
            <div className="h-[2px] flex-1 bg-black/10"></div>
          </div>
          <h1 className="text-4xl lg:text-7xl font-black font-playfair tracking-tight uppercase leading-none mb-6">
            Welcome to <br/> <span className="text-[#ff5e5b]">Applyer</span>
          </h1>
          <p className="font-mono text-sm lg:text-lg text-black/70 max-w-2xl leading-relaxed uppercase tracking-tight font-bold">
            Your centralized hub for professional career management. Use the following guide to optimize your workspace and begin your journey.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Step 1 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black text-[#e8fc3b] flex items-center justify-center font-black text-xl">1</div>
                <h3 className="font-black text-xl uppercase tracking-tight">AI Configuration</h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-black/60 mb-8 uppercase font-bold">
                Configure your API keys to enable neural drafting. We support OpenAI and Google Gemini for high-precision document synthesis.
              </p>
              <Link href="/application-assistant" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#e8fc3b] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#e8fc3b] transition-all">
                Configure Keys <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Key className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Step 2 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black text-[#00cecb] flex items-center justify-center font-black text-xl">2</div>
                <h3 className="font-black text-xl uppercase tracking-tight">Build Your Profile</h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-black/60 mb-8 uppercase font-bold">
                Configure your professional identity. This information allows the AI to synthesize highly accurate and tailored application documents.
              </p>
              <Link href="/profile-editor" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#00cecb] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#00cecb] transition-all">
                Setup Profile <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <FileText className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Step 3 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black text-[#ff5e5b] flex items-center justify-center font-black text-xl">3</div>
                <h3 className="font-black text-xl uppercase tracking-tight">Monitor Listings</h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-black/60 mb-8 uppercase font-bold">
                Connect your preferred job boards to your workspace. Applyer will monitor these sources to identify new opportunities as they appear.
              </p>
              <Link href="/job-watcher" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#ff5e5b] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#ff5e5b] transition-all">
                Manage Sources <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Briefcase className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Step 4 */}
          <div className="bg-black text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(232,252,59,1)] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#e8fc3b] text-black flex items-center justify-center font-black text-xl">4</div>
                <h3 className="font-black text-xl uppercase tracking-tight">Draft Documents</h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-white/60 mb-8 uppercase font-bold">
                The final stage of preparation. Generate customized documents based on specific job requirements and your saved profile.
              </p>
              <Link href="/application-assistant" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-[#e8fc3b] text-black px-6 py-3 border-2 border-[#e8fc3b] hover:bg-white hover:text-black transition-all">
                Launch Assistant <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <section className="bg-white border-4 border-black p-8">
          <h2 className="text-xl font-black tracking-tight uppercase mb-8 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" /> Professional Standards
          </h2>
          <div className="space-y-6 font-mono text-sm uppercase font-bold tracking-tight">
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 bg-black mt-1.5 flex-shrink-0"></div>
              <p>Data Sovereignty: All your professional information is stored locally in your browser for maximum privacy.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 bg-black mt-1.5 flex-shrink-0"></div>
              <p>Efficiency: Use the 'Acknowledge All' feature in the Job Bank to maintain a clean workspace as you review listings.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 bg-black mt-1.5 flex-shrink-0"></div>
              <p>Accessibility: Export your finalized resumes and cover letters as professional PDF files directly from the workspace.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
