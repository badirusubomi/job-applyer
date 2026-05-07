'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, ExternalLink, ChevronDown, ChevronRight, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'applyer_sources';

export default function JobWatcher() {
  const [sources, setSources] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSearchTerms, setNewSearchTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSources(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sources", e);
        setSources([]);
      }
    }
  }, []);

  const saveToStorage = (updatedSources: any[]) => {
    setSources(updatedSources);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSources));
    // Trigger storage event for other components (like Dashboard)
    window.dispatchEvent(new Event('storage'));
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;
    
    const newSource = {
      id: crypto.randomUUID(),
      name: newName,
      url: newUrl,
      search_terms: newSearchTerms,
      jobs: [],
      created_at: new Date().toISOString()
    };

    saveToStorage([...sources, newSource]);
    setNewName('');
    setNewUrl('');
    setNewSearchTerms('');
  };

  const deleteSource = (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      const updated = sources.filter(s => s.id !== id);
      saveToStorage(updated);
    }
  };

  const refreshSource = async (id: string) => {
    const source = sources.find(s => s.id === id);
    if (!source) return;

    setRefreshing(id);
    const sessionStr = localStorage.getItem('assistant_session') || '{}';
    const keysStr = localStorage.getItem('assistant_keys') || '{}';
    const { selectedModel = 'openai' } = JSON.parse(sessionStr);
    const keys = JSON.parse(keysStr);
    const apiKey = selectedModel === 'openai' ? keys.openai : keys.gemini;

    try {
      const res = await fetch('/api/sources/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: source.url, 
          searchTerms: source.search_terms,
          model: selectedModel, 
          apiKey 
        })
      });
      
      const data = await res.json();
      
      if (data.jobs) {
        // Track existing job links to avoid duplicates
        const existingJobLinks = new Set(source.jobs.map((j: any) => j.link));
        const newJobs = data.jobs
          .filter((j: any) => !existingJobLinks.has(j.link))
          .map((j: any) => ({ 
            ...j, 
            id: crypto.randomUUID(), 
            is_new: true, 
            first_seen: new Date().toISOString() 
          }));

        const updatedSources = sources.map(s => 
          s.id === id 
            ? { ...s, jobs: [...newJobs, ...s.jobs] }
            : s
        );
        saveToStorage(updatedSources);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(null);
    }
  };

  const acknowledgeAll = () => {
    const updated = sources.map(source => ({
      ...source,
      jobs: source.jobs.map((job: any) => ({ ...job, is_new: false }))
    }));
    saveToStorage(updated);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full max-w-5xl mx-auto text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl lg:text-5xl font-black font-playfair tracking-tight uppercase">JOB BANK</h1>
        <button 
          onClick={acknowledgeAll}
          className="px-6 py-2 bg-black text-white border-2 border-black font-bold uppercase tracking-widest text-xs hover:bg-[#e8fc3b] hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(232,252,59,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
        >
          Acknowledge All
        </button>
      </div>

      <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <h2 className="text-xl font-black tracking-tight uppercase mb-6">Add Job Source</h2>
        <form onSubmit={addSource} className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Source Name</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 font-mono text-sm"
              placeholder="e.g. YC Jobs"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Source URL</label>
            <input 
              type="url" 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)} 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 font-mono text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Target Roles</label>
            <input 
              type="text" 
              value={newSearchTerms} 
              onChange={e => setNewSearchTerms(e.target.value)} 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 font-mono text-sm"
              placeholder="e.g. AI Engineer"
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

      <div className="space-y-8 pb-12">
        {sources.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-mono text-black/50 uppercase tracking-widest font-bold">No active intel sources connected.</p>
          </div>
        ) : sources.map(source => (
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
              <div className="flex items-center space-x-4">
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
                <button
                  onClick={() => deleteSource(source.id)}
                  className="p-2 bg-white border-2 border-black hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
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
                          {job.is_new && (
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
