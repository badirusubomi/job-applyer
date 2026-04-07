'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, ExternalLink, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';

export default function JobWatcher() {
  const [sources, setSources] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    const res = await fetch('/api/sources');
    const data = await res.json();
    setSources(data);
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;
    setLoading(true);
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, url: newUrl })
    });
    setNewName('');
    setNewUrl('');
    await fetchSources();
    setLoading(false);
  };

  const refreshSource = async (id: string) => {
    setRefreshing(id);
    await fetch('/api/sources/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: id })
    });
    await fetchSources();
    setRefreshing(null);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full max-w-5xl mx-auto text-black">
      <h1 className="text-4xl lg:text-5xl font-black font-playfair tracking-tight mb-8 uppercase">Radar Network</h1>

      <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <h2 className="text-xl font-black tracking-tight uppercase mb-6">Establish New Uplink</h2>
        <form onSubmit={addSource} className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Target Alias</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 font-mono text-sm"
              placeholder="e.g. YC Jobs"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Target Vector (URL)</label>
            <input 
              type="url" 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)} 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 font-mono text-sm"
              placeholder="https://..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-[#00cecb] text-black border-4 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-[#00cecb] transition-colors flex items-center h-[52px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            Connect
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {sources.map(source => (
          <div key={source.id} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#f4f4f0] border-b-4 border-black">
              <div className="flex items-center cursor-pointer flex-1 mb-4 sm:mb-0" onClick={() => toggleExpand(source.id)}>
                {expanded[source.id] ? <ChevronDown className="w-6 h-6 mr-4 text-black stroke-[3]" /> : <ChevronRight className="w-6 h-6 mr-4 text-black stroke-[3]" />}
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight">{source.name}</h3>
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-black/60 hover:text-blue-600 hover:underline flex items-center mt-1" onClick={e => e.stopPropagation()}>
                    {source.url} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-sm font-mono font-bold bg-black text-white px-3 py-1 uppercase tracking-widest">
                  {source.jobs?.length || 0} hits
                </span>
                <button
                  onClick={() => refreshSource(source.id)}
                  disabled={refreshing === source.id}
                  className="px-4 py-2 bg-white border-2 border-black font-bold uppercase tracking-widest text-xs hover:bg-[#e8fc3b] transition-colors flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 stroke-[3] ${refreshing === source.id ? 'animate-spin' : ''}`} />
                  Scan
                </button>
              </div>
            </div>

            {expanded[source.id] && (
              <div className="p-0 divide-y-4 divide-black max-h-[600px] overflow-y-auto">
                {source.jobs?.length === 0 ? (
                  <p className="font-mono text-sm uppercase text-black/50 text-center py-8">Awaiting initial scan.</p>
                ) : (
                  source.jobs?.map((job: any) => (
                    <div key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-[#f4f4f0] transition-colors">
                      <div className="mb-4 sm:mb-0">
                        <a href={job.link} target="_blank" rel="noreferrer" className="text-xl font-bold hover:text-blue-600 uppercase tracking-tight flex items-center">
                          {job.title}
                          {job.is_new === 1 && (
                            <span className="ml-4 px-2 py-0.5 bg-[#e8fc3b] text-black border border-black text-xs font-black tracking-widest">NEW INTEL</span>
                          )}
                        </a>
                        {job.location && (
                          <p className="font-mono text-xs text-black/60 mt-2 uppercase">{job.location}</p>
                        )}
                      </div>
                      <Link 
                        href={{
                          pathname: '/application-assistant',
                          query: { url: job.link, title: job.title }
                        }}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-[#ff5e5b] text-black border-2 border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-[#ff5e5b] transition-colors flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-max"
                      >
                        <FileText className="w-4 h-4 mr-2 stroke-[3]" /> Auto-Apply
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
