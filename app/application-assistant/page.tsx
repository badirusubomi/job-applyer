'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Download, Pencil, Save } from 'lucide-react';
import Editor from '@monaco-editor/react';

const STORAGE_KEY = 'assistant_session';

function loadSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  // Restore from storage on mount, or use URL param / defaults
  const saved = loadSession();

  const [jobDescription, setJobDescription] = useState<string>(urlParam || saved?.jobDescription || '');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'answers'>(
    saved?.activeTab || 'resume'
  );
  const [results, setResults] = useState<any>(saved?.results || null);
  const [selectedModel, setSelectedModel] = useState<string>(saved?.selectedModel || 'gemini');
  const [questions, setQuestions] = useState<string>(saved?.questions || '');
  const [actions, setActions] = useState(saved?.actions || {
    resume: true,
    coverLetter: true,
    answers: true
  });
  
  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Reset editor mode when tabs switch
  useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  // Persist all state changes to localStorage
  const persistSession = useCallback((updates: object) => {
    if (typeof window === 'undefined') return;
    try {
      const current = loadSession() || {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
    } catch {}
  }, []);

  useEffect(() => { persistSession({ jobDescription }); }, [jobDescription, persistSession]);
  useEffect(() => { persistSession({ selectedModel }); }, [selectedModel, persistSession]);
  useEffect(() => { persistSession({ actions }); }, [actions, persistSession]);
  useEffect(() => { persistSession({ results }); }, [results, persistSession]);
  useEffect(() => { persistSession({ activeTab }); }, [activeTab, persistSession]);
  useEffect(() => { persistSession({ questions }); }, [questions, persistSession]);

  const handleGenerate = async () => {
    if (!jobDescription) return;
    setLoading(true);
    setResults(null);

    // Parse questions into array (split by newline, filter blanks)
    const questionList = questions
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    try {
      const res = await fetch('/api/assistant/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          actions,
          model: selectedModel,
          questions: questionList.length > 0 ? questionList : undefined
        })
      });
      const data = await res.json();
      setResults(data);
      if (data.resume && actions.resume) setActiveTab('resume');
      else if (data.coverLetter && actions.coverLetter) setActiveTab('coverLetter');
      else if (data.answers && actions.answers) setActiveTab('answers');
    } catch (err) {
      console.error(err);
      alert('Failed to generate. Check your API key and environment.\n' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const content = results?.[activeTab];
    if (!content || activeTab === 'answers') return;

    try {
      const resp = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'resume' ? 'resume' : 'cover-letter',
          data: JSON.parse(content)
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const contentType = resp.headers.get('Content-Type');
      if (contentType !== 'application/pdf') {
        throw new Error('Server returned invalid data format. Check server logs.');
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('PDF export failed: ' + err);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      try {
        const parsed = JSON.parse(editContent);
        setResults({ ...results, [activeTab]: JSON.stringify(parsed) });
        setIsEditing(false);
      } catch (e) {
        alert("Invalid JSON format. Please fix any syntax errors before saving.");
      }
    } else {
      try {
        const parsed = JSON.parse(results[activeTab]);
        setEditContent(JSON.stringify(parsed, null, 2));
      } catch {
        setEditContent(results[activeTab] || '{}');
      }
      setIsEditing(true);
    }
  };

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const updatePreview = async () => {
      if (results?.[activeTab] && activeTab !== 'answers') {
        try {
          const resp = await fetch('/api/pdf/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: activeTab === 'resume' ? 'resume' : 'cover-letter',
              data: JSON.parse(results[activeTab])
            })
          });
          const html = await resp.text();
          setPreviewHtml(html);
        } catch (err) {
          console.error('Preview update failed', err);
        }
      } else {
        setPreviewHtml(null);
      }
    };
    updatePreview();
  }, [results, activeTab]);

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#e5e5df] text-black">
      {/* Left Column: Input */}
      <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col border-r-4 border-black bg-[#f4f4f0] overflow-y-auto">
        <div className="p-8 border-b-4 border-black bg-white">
          <h1 className="text-3xl font-black font-playfair tracking-tight uppercase">AI Assistant</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-black/60 mt-3">Synthesize applications.</p>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {/* Job Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="w-full p-4 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 bg-white font-mono text-xs resize-none placeholder:text-black/30"
              rows={7}
              placeholder="Paste the full job description here..."
            />
          </div>

          {/* AI Model */}
          <div className="border-y-4 border-black py-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-black/60">AI Model:</h3>
            <div className="flex flex-col space-y-2">
              {(['gemini', 'openai', 'local'] as const).map(m => (
                <label key={m} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    value={m}
                    checked={selectedModel === m}
                    onChange={e => setSelectedModel(e.target.value)}
                    name="modelSelect"
                    className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black flex-shrink-0"
                  />
                  <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#e8fc3b] px-1">
                    {m === 'gemini' ? 'Gemini' : m === 'openai' ? 'OpenAI' : 'Local Node'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Directives */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-black/60">Directives:</h3>
            {[
              { key: 'resume', label: 'Tailored Resume' },
              { key: 'coverLetter', label: 'Cover Letter' },
              { key: 'answers', label: 'Application Q&A' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={actions[key as keyof typeof actions]}
                  onChange={e => setActions({ ...actions, [key]: e.target.checked })}
                  className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black flex-shrink-0"
                />
                <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#ff5e5b] px-1">{label}</span>
              </label>
            ))}
          </div>

          {/* Custom Questions — only when answers is checked */}
          {actions.answers && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">
                Application Questions <span className="font-normal normal-case">(one per line)</span>
              </label>
              <textarea
                value={questions}
                onChange={e => setQuestions(e.target.value)}
                className="w-full p-4 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 bg-white font-mono text-xs resize-none placeholder:text-black/30"
                rows={5}
                placeholder={`Why are you interested in this role?\nDescribe a challenge you overcame.\nWhat's your experience with RAG systems?`}
              />
              <p className="text-xs font-mono text-black/40 mt-1 uppercase tracking-wide">Leave blank for generic questions</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !jobDescription || (!actions.resume && !actions.coverLetter && !actions.answers)}
            className="w-full py-4 bg-black text-white border-4 border-black font-bold uppercase tracking-widest flex justify-center items-center hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
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
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {results ? (
          <>
            {/* Tab bar */}
            <div className="flex border-b-4 border-black bg-[#f4f4f0] flex-shrink-0">
              {actions.resume && results.resume && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'resume' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('resume')}
                >
                  Resume
                </button>
              )}
              {actions.coverLetter && results.coverLetter && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'coverLetter' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('coverLetter')}
                >
                  Cover Letter
                </button>
              )}
              {actions.answers && results.answers && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'answers' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('answers')}
                >
                  Q&amp;A
                </button>
              )}
              {(results.resume || results.coverLetter) && (
                <button
                  onClick={handleDownload}
                  disabled={activeTab === 'answers'}
                  className="px-8 py-4 bg-[#e8fc3b] text-black border-l-4 border-black hover:bg-black hover:text-[#e8fc3b] transition-colors flex items-center justify-center font-bold text-xs uppercase disabled:opacity-30 disabled:hover:bg-[#e8fc3b] disabled:hover:text-black flex-shrink-0"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4 mr-2 stroke-[3]" />
                  PDF
                </button>
              )}
            </div>
            
            {/* Content area */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab !== 'answers' && results?.[activeTab] && (
                <button
                  onClick={handleToggleEdit}
                  className={`absolute bottom-6 right-8 z-10 flex items-center px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${
                    isEditing ? 'bg-[#ff5e5b] text-white border-black hover:bg-black' : 'bg-[#e8fc3b] text-black border-black hover:bg-black hover:text-[#e8fc3b]'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save & View
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit JSON
                    </>
                  )}
                </button>
              )}

              {activeTab !== 'answers' ? (
                isEditing ? (
                  <div className="w-full h-full bg-[#1e1e1e]">
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      theme="vs-dark"
                      value={editContent}
                      onChange={(value) => setEditContent(value || '')}
                      options={{
                        minimap: { enabled: false },
                        formatOnPaste: true,
                        fontSize: 14,
                        fontFamily: 'monospace',
                        wordWrap: 'on'
                      }}
                    />
                  </div>
                ) : previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-[#f4f4f0]/30 font-mono text-xs uppercase tracking-widest text-black/40">
                    Synthesizing Layout…
                  </div>
                )
              ) : activeTab === 'answers' && results.answers ? (
                <div className="h-full overflow-y-auto p-8 lg:p-12">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-black leading-relaxed">{results.answers}</pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 bg-[#f4f4f0]/30 font-mono text-xs uppercase tracking-widest text-black/40">
                  Synthesizing Layout…
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-12 text-center bg-white">
            <div className="border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#f4f4f0] max-w-md">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-black stroke-[2]" />
              <p className="font-mono text-sm uppercase tracking-widest font-bold text-black/60 leading-loose">
                Paste a job description and hit Initialize.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationAssistantPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center font-mono text-sm uppercase tracking-widest text-black/40">
        Loading…
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
