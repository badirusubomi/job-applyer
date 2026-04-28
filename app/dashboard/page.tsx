'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Briefcase, FileText } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ sources: 0, jobs: 0, newJobs: 0 });

  useEffect(() => {
    fetch('/api/sources')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sources = data.length;
          let jobs = 0;
          let newJobs = 0;
          data.forEach((s: any) => {
            jobs += s.jobs.length;
            newJobs += s.jobs.filter((j: any) => j.is_new).length;
          });
          setStats({ sources, jobs, newJobs });
        }
      });
  }, []);

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full text-black">
      <h1 className="text-4xl lg:text-6xl font-black font-playfair tracking-tight mb-12">SYSTEM<br/>DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-48 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-[#ff5e5b] border-2 border-black rounded-full flex items-center justify-center text-black mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-1">Sources</p>
            <h2 className="text-4xl font-black font-playfair">{stats.sources}</h2>
          </div>
        </div>
        
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-48 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-[#00cecb] border-2 border-black rounded-full flex items-center justify-center text-black mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-1">Raw Jobs</p>
            <h2 className="text-4xl font-black font-playfair">{stats.jobs}</h2>
          </div>
        </div>

        <div className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(232,252,59,1)] flex flex-col justify-between h-48 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(232,252,59,1)] transition-all cursor-pointer relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-[#e8fc3b] border-2 border-black rounded-full flex items-center justify-center text-black mb-4">
              <FileText className="w-6 h-6" />
            </div>
            {stats.newJobs > 0 && (
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  await fetch('/api/jobs/acknowledge', { method: 'POST' });
                  // Re-fetch stats
                  const res = await fetch('/api/sources');
                  const data = await res.json();
                  let jobs = 0;
                  let newJobs = 0;
                  data.forEach((s: any) => {
                    jobs += s.jobs.length;
                    newJobs += s.jobs.filter((j: any) => j.is_new).length;
                  });
                  setStats({ sources: data.length, jobs, newJobs });
                }}
                className="text-[10px] font-mono font-bold bg-[#e8fc3b] text-black px-2 py-1 border border-black hover:bg-white transition-colors uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-widest text-white/60 mb-1">New Intel</p>
            <h2 className="text-4xl font-black font-playfair">{stats.newJobs}</h2>
          </div>
          {/* Decorative scanner background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(232,252,59,0.5)_3px)]"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black tracking-tight mb-6 uppercase">Directives</h3>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/job-watcher" className="px-8 py-4 bg-[#e8fc3b] text-black border-2 border-black font-bold uppercase tracking-wider text-center hover:bg-black hover:text-[#e8fc3b] transition-colors relative group">
            <span className="relative z-10">Job Watcher</span>
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
          </Link>
          <Link href="/profile-editor" className="px-8 py-4 bg-white text-black border-2 border-black font-bold uppercase tracking-wider text-center hover:bg-black hover:text-white transition-colors relative group">
            <span className="relative z-10">Edit Profile</span>
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
