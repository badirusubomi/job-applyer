'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Download } from 'lucide-react';

function AssistantContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  
  const [jobDescription, setJobDescription] = useState(urlParam || '');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'answers'>('resume');
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('openai');
  
  const [actions, setActions] = useState({
    resume: true,
    coverLetter: true,
    answers: true
  });

  const handleGenerate = async () => {
    if (!jobDescription) return;
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/assistant/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, actions, model: selectedModel })
      });
      const data = await res.json();
      setResults(data);
      if (data.resume && actions.resume) setActiveTab('resume');
      else if (data.coverLetter && actions.coverLetter) setActiveTab('coverLetter');
      else if (data.answers && actions.answers) setActiveTab('answers');
    } catch (err) {
      console.error(err);
      alert('Failed to generate. Make sure OPENAI_API_KEY is set in your environment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const content = results?.[activeTab];
    if (!content) return;

    const fileName = `${activeTab}_${new Date().getTime()}.md`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#e5e5df] text-black">
      {/* Left Column: Input */}
      <div className="w-full lg:w-1/3 flex flex-col border-r-4 border-black bg-[#f4f4f0]">
        <div className="p-8 lg:p-12 border-b-4 border-black bg-white">
          <h1 className="text-3xl font-black font-playfair tracking-tight uppercase">AI Assistant</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-black/60 mt-4">Synthesize applications.</p>
        </div>
        
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">
            Target Intel (Job Description/URL)
          </label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            className="w-full flex-1 p-6 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 bg-white font-mono text-sm resize-none mb-8 placeholder:text-black/30"
            placeholder="Paste the full job description or a link here..."
          />
          
          <div className="space-y-4 mb-8 border-y-4 border-black py-6">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-black/60">AI Model Protocol:</h3>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" value="openai" checked={selectedModel === 'openai'} onChange={e => setSelectedModel(e.target.value)} name="modelSelect" className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
                <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#e8fc3b] px-1">OpenAI</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" value="gemini" checked={selectedModel === 'gemini'} onChange={e => setSelectedModel(e.target.value)} name="modelSelect" className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
                <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#e8fc3b] px-1">Gemini</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" value="local" checked={selectedModel === 'local'} onChange={e => setSelectedModel(e.target.value)} name="modelSelect" className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
                <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#e8fc3b] px-1">Local Node</span>
              </label>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-black/60">Directives:</h3>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" checked={actions.resume} onChange={e => setActions({...actions, resume: e.target.checked})} className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
              <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#ff5e5b] px-1">Tailored Resume</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" checked={actions.coverLetter} onChange={e => setActions({...actions, coverLetter: e.target.checked})} className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
              <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#ff5e5b] px-1">Cover Letter</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" checked={actions.answers} onChange={e => setActions({...actions, answers: e.target.checked})} className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black" />
              <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#ff5e5b] px-1">Application Q&A</span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription || (!actions.resume && !actions.coverLetter && !actions.answers)}
            className="w-full py-4 bg-black text-white border-4 border-black font-bold uppercase tracking-widest flex justify-center items-center hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin stroke-[3]" /> EXECUTING...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-3 stroke-[3]" /> INITIALIZE</>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="flex-1 flex flex-col bg-white">
        {results ? (
          <>
            <div className="flex border-b-4 border-black bg-[#f4f4f0]">
              {actions.resume && (
                <button 
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'resume' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('resume')}
                >
                  Resume
                </button>
              )}
               {actions.coverLetter && (
                <button 
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'coverLetter' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('coverLetter')}
                >
                  Cover Letter
                </button>
              )}
               {actions.answers && (
                <button 
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${activeTab === 'answers' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('answers')}
                >
                  Answers
                </button>
              )}
              <button 
                onClick={handleDownload}
                className="px-8 py-4 bg-white text-black border-l-4 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center font-bold text-xs uppercase"
                title="Download as Markdown"
              >
                <Download className="w-4 h-4 mr-2" />
                EXPORT
              </button>
            </div>
            
            <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-white">
              {activeTab === 'resume' && (
                <div className="opacity-100 transition-opacity">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-black leading-relaxed">{results.resume}</pre>
                </div>
              )}
              {activeTab === 'coverLetter' && (
                <div className="opacity-100 transition-opacity">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-black leading-relaxed">{results.coverLetter}</pre>
                </div>
              )}
              {activeTab === 'answers' && (
                <div className="opacity-100 transition-opacity">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-black leading-relaxed">{results.answers}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-12 text-center bg-white">
            <div className="border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#f4f4f0] max-w-md">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-black stroke-[2]" />
              <p className="font-mono text-sm uppercase tracking-widest font-bold text-black/60 leading-loose">Awaiting intel. Provide a job description and execute initialization.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationAssistant() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssistantContent />
    </Suspense>
  )
}
