'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Download, Pencil, Save, Settings as SettingsIcon, User, FileText, Trash2, Key, AlertTriangle, X, Type } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'isomorphic-dompurify';
import { maskPii, unmaskPii, PrivacyConfig } from '@/lib/utils/privacy';

const STORAGE_KEY = 'assistant_session';
const PROFILE_KEY = 'assistant_profile';
const PRIVACY_KEY = 'assistant_privacy';
const KEYS_KEY = 'assistant_keys';
const FONT_KEY = 'assistant_font';

const FONTS = [
  { id: 'mono', name: 'IBM Plex Mono (Classic)', family: "'IBM Plex Mono', monospace", importUrl: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" },
  { id: 'inter', name: 'Inter (Modern Sans)', family: "'Inter', sans-serif", importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" },
  { id: 'playfair', name: 'Playfair Display (Editorial)', family: "'Playfair Display', serif", importUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" },
  { id: 'garamond', name: 'EB Garamond (Elegant)', family: "'EB Garamond', serif", importUrl: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap" },
  { id: 'jetbrains', name: 'JetBrains Mono (Technical)', family: "'JetBrains Mono', monospace", importUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" },
];

const DEFAULT_PROFILE = `# Sample Profile

**Name**: Alex Pro
**Current Title**: Senior AI Engineer
**Location**: San Francisco, CA
**Email**: alex.pro@example.com

## Summary
AI Engineer with 6+ years of experience building scalable ML systems...

## Experience
**Acme Corp — Lead AI Engineer** (Jan 2021 - Present)
- Designed an intelligent automation system using LLMs, reducing manual workflows by 40%.
- Deployed highly available RAG pipelines on AWS.

## Skills
- **Languages**: Python, TypeScript, Go
- **Frameworks**: Next.js, React, PyTorch
- **Cloud**: AWS, Docker, Kubernetes`;

function loadData(key: string, defaultVal: any = null) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');

  // Hydration safety
  const [mounted, setMounted] = useState(false);

  // Initial states with safe defaults for SSR
  const [profile, setProfile] = useState<string>(DEFAULT_PROFILE);
  const [privacy, setPrivacy] = useState<PrivacyConfig>({});
  const [apiKeys, setApiKeys] = useState<{ openai?: string, gemini?: string }>({});
  const [selectedFontId, setSelectedFontId] = useState<string>('mono');
  
  const [jobDescription, setJobDescription] = useState<string>(urlParam || '');
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter' | 'answers'>('resume');
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini');
  const [questions, setQuestions] = useState<string>('');
  const [actions, setActions] = useState({ resume: true, coverLetter: true, answers: true });

  const [sidebarTab, setSidebarTab] = useState<'build' | 'profile' | 'settings'>('build');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'error' | 'success' }[]>([]);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // LOAD FROM LOCALSTORAGE AFTER MOUNT
  useEffect(() => {
    setMounted(true);
    
    // Sync all persistence
    const savedSession = loadData(STORAGE_KEY, {});
    if (savedSession.jobDescription) setJobDescription(urlParam || savedSession.jobDescription);
    if (savedSession.selectedModel) setSelectedModel(savedSession.selectedModel);
    if (savedSession.actions) setActions(savedSession.actions);
    if (savedSession.results) setResults(savedSession.results);
    if (savedSession.activeTab) setActiveTab(savedSession.activeTab);
    if (savedSession.questions) setQuestions(savedSession.questions);

    setProfile(localStorage.getItem(PROFILE_KEY) || DEFAULT_PROFILE);
    setPrivacy(loadData(PRIVACY_KEY, {}));
    
    const keys = loadData(KEYS_KEY, {});
    setApiKeys(keys);

    const savedFont = loadData(FONT_KEY);
    if (savedFont) setSelectedFontId(savedFont);

    if (!keys.openai && !keys.gemini) {
      setShowOnboarding(true);
    }
  }, [urlParam]);

  const addToast = (message: string, type: 'error' | 'success' = 'error') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const persistSession = useCallback((updates: object) => {
    if (typeof window === 'undefined') return;
    try {
      const current = loadData(STORAGE_KEY, {});
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
    } catch {}
  }, []);

  // Update effect dependency to include all session triggers
  useEffect(() => { 
    if (mounted) {
      persistSession({ jobDescription, selectedModel, actions, results, activeTab, questions }); 
    }
  }, [mounted, jobDescription, selectedModel, actions, results, activeTab, questions, persistSession]);

  const saveProfile = (p: string) => {
    setProfile(p);
    localStorage.setItem(PROFILE_KEY, p);
  };

  const savePrivacy = (p: PrivacyConfig) => {
    setPrivacy(p);
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(p));
  };

  const saveKeys = (k: any) => {
    setApiKeys(k);
    localStorage.setItem(KEYS_KEY, JSON.stringify(k));
  };

  const saveFont = (fid: string) => {
    setSelectedFontId(fid);
    localStorage.setItem(FONT_KEY, JSON.stringify(fid));
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear ALL data (Profile, Keys, Settings, Session)? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription) return;
    
    const currentKey = selectedModel === 'openai' ? apiKeys.openai : apiKeys.gemini;
    if (selectedModel !== 'local' && !currentKey) {
      addToast("API Key required. Check Options tab.");
      setSidebarTab('settings');
      return;
    }

    setLoading(true);
    setResults(null);

    const questionList = questions.split('\n').map(q => q.trim()).filter(q => q.length > 0);
    const maskedProfile = maskPii(profile, privacy);

    try {
      const res = await fetch('/api/assistant/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          actions,
          model: selectedModel,
          questions: questionList.length > 0 ? questionList : undefined,
          apiKey: currentKey,
          profile: maskedProfile
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      const unmaskedData = unmaskPii(data, privacy);
      setResults(unmaskedData);
      
      if (unmaskedData.resume && actions.resume) setActiveTab('resume');
      else if (unmaskedData.coverLetter && actions.coverLetter) setActiveTab('coverLetter');
      else if (unmaskedData.answers && actions.answers) setActiveTab('answers');
      setIsEditing(false);
      addToast("Generation successful!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Generation failed. Please try again soon.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const content = results?.[activeTab];
    if (!content || activeTab === 'answers') return;

    const font = FONTS.find(f => f.id === selectedFontId) || FONTS[0];

    try {
      const resp = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'resume' ? 'resume' : 'cover-letter',
          data: typeof content === 'string' ? JSON.parse(content) : content,
          fontConfig: { family: font.family, importUrl: font.importUrl }
        })
      });

      if (!resp.ok) throw new Error('Failed to generate PDF');

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      addToast("PDF export failed. Try again soon.", "error");
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      try {
        const parsed = JSON.parse(editContent);
        setResults({ ...results, [activeTab]: parsed });
        setIsEditing(false);
      } catch (e) {
        addToast("Invalid JSON format.");
      }
    } else {
      const raw = results[activeTab];
      setEditContent(typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2));
      setIsEditing(true);
    }
  };

  useEffect(() => {
    const updatePreview = async () => {
      if (results?.[activeTab] && activeTab !== 'answers' && !isEditing) {
        try {
          const raw = results[activeTab];
          const font = FONTS.find(f => f.id === selectedFontId) || FONTS[0];
          
          const resp = await fetch('/api/pdf/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: activeTab === 'resume' ? 'resume' : 'cover-letter',
              data: typeof raw === 'string' ? JSON.parse(raw) : raw,
              fontConfig: { family: font.family, importUrl: font.importUrl }
            })
          });
          const html = await resp.text();
          setPreviewHtml(html);
        } catch (err) {}
      } else {
        setPreviewHtml(null);
      }
    };
    if (mounted) updatePreview();
  }, [mounted, results, activeTab, isEditing, selectedFontId]);

  if (!mounted) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-[#e5e5df] font-mono text-sm uppercase tracking-[0.2em] font-bold">
        Initializing Vault...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#e5e5df] text-black">
      
      {/* Toast System */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between min-w-[300px] animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-[#ff5e5b] text-white' : 'bg-[#e8fc3b] text-black'}`}>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-4 hover:opacity-50">
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        ))}
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-lg w-full">
            <h2 className="text-2xl font-black font-playfair uppercase tracking-tight mb-4">Welcome to Job Assistant</h2>
            <p className="font-mono text-sm leading-relaxed mb-6">
              To get started, you'll need to configure an API key. For your security, keys are stored locally in your browser.
            </p>
            <div className="space-y-4 font-mono text-sm">
              <div className="p-4 border-2 border-black bg-[#f4f4f0]">
                <h3 className="font-bold uppercase tracking-wide mb-2"><Key className="inline w-4 h-4 mr-2" />API Key Advice</h3>
                <p className="text-xs text-black/80">We highly recommend generating a "Project-Specific" key to protect your account. Never share master keys.</p>
                <div className="mt-3 flex gap-4 text-xs font-bold uppercase underline">
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff5e5b]">OpenAI Keys</a>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:text-[#e8fc3b] hover:bg-black px-1">Gemini Keys</a>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-xs">OpenAI Key (Optional)</label>
                <input type="password" value={apiKeys.openai || ''} onChange={e => saveKeys({ ...apiKeys, openai: e.target.value })} className="w-full p-2 border-2 border-black focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-xs">Gemini Key (Optional)</label>
                <input type="password" value={apiKeys.gemini || ''} onChange={e => saveKeys({ ...apiKeys, gemini: e.target.value })} className="w-full p-2 border-2 border-black focus:outline-none" />
              </div>
            </div>
            <button
              onClick={() => { setShowOnboarding(false); setSidebarTab('settings'); }}
              className="mt-8 w-full py-3 bg-black text-white hover:bg-[#e8fc3b] hover:text-black hover:border-black border-2 border-transparent font-bold uppercase tracking-widest transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div className="w-20 lg:w-24 border-r-4 border-black bg-white flex flex-col flex-shrink-0 z-10 relative">
        <button onClick={() => setSidebarTab('build')} className={`flex-1 flex flex-col items-center justify-center p-4 border-b-4 border-black transition-colors ${sidebarTab === 'build' ? 'bg-[#e8fc3b]' : 'hover:bg-[#f4f4f0]'}`}>
          <FileText className="w-6 h-6 stroke-[2]" />
          <span className="text-[10px] font-bold font-mono uppercase mt-2">Build</span>
        </button>
        <button onClick={() => setSidebarTab('profile')} className={`flex-1 flex flex-col items-center justify-center p-4 border-b-4 border-black transition-colors ${sidebarTab === 'profile' ? 'bg-[#ff5e5b] text-white' : 'hover:bg-[#f4f4f0]'}`}>
          <User className="w-6 h-6 stroke-[2]" />
          <span className="text-[10px] font-bold font-mono uppercase mt-2">Profile</span>
        </button>
        <button onClick={() => setSidebarTab('settings')} className={`flex-1 flex flex-col items-center justify-center p-4 border-black transition-colors ${sidebarTab === 'settings' ? 'bg-black text-white' : 'hover:bg-[#f4f4f0]'}`}>
          <SettingsIcon className="w-6 h-6 stroke-[2]" />
          <span className="text-[10px] font-bold font-mono uppercase mt-2">Options</span>
        </button>
      </div>

      {/* Secondary Sidebar Content based on Sidebar Tab */}
      {sidebarTab === 'build' && (
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col border-r-4 border-black bg-[#f4f4f0] overflow-y-auto">
          <div className="p-8 border-b-4 border-black bg-white">
            <h1 className="text-2xl font-black font-playfair tracking-tight uppercase">Assistant</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-black/60 mt-3">Synthesize context.</p>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="w-full p-4 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10 bg-white font-mono text-xs resize-none placeholder:text-black/30"
                rows={7}
                placeholder="Paste the full job description here..."
              />
            </div>

            <div className="border-y-4 border-black py-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-black/60">AI Model:</h3>
              <div className="flex flex-col space-y-2">
                {(['gemini', 'openai', 'local'] as const).map(m => (
                  <label key={m} className={`flex items-center space-x-3 group ${m === 'local' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      value={m}
                      checked={selectedModel === m}
                      onChange={e => m !== 'local' && setSelectedModel(e.target.value)}
                      disabled={m === 'local'}
                      name="modelSelect"
                      className="appearance-none w-4 h-4 border-2 border-black checked:bg-black checked:border-black flex-shrink-0 disabled:bg-gray-300"
                    />
                    <span className="text-sm font-bold uppercase tracking-widest group-hover:bg-[#e8fc3b] px-1">
                      {m === 'gemini' ? 'Gemini' : m === 'openai' ? 'OpenAI' : 'Local Node (Requires local install)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

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

            {actions.answers && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest font-bold text-black/60 mb-2">Application Questions</label>
                <textarea
                  value={questions}
                  onChange={e => setQuestions(e.target.value)}
                  className="w-full p-4 border-4 border-black bg-white font-mono text-xs resize-none placeholder:text-black/30"
                  rows={4}
                  placeholder="One question per line"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription || (!actions.resume && !actions.coverLetter && !actions.answers)}
              className="w-full py-4 bg-black text-white border-4 border-black font-bold uppercase tracking-widest flex justify-center items-center hover:bg-white hover:text-black transition-colors disabled:opacity-40"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin stroke-[3]" /> Executing</> : <><Sparkles className="w-4 h-4 mr-2 stroke-[3]" /> Initialize</>}
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        
        {sidebarTab === 'build' && results ? (
          <>
            <div className="flex border-b-4 border-black bg-[#f4f4f0] flex-shrink-0">
              {actions.resume && results.resume && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'resume' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('resume')}
                >Resume</button>
              )}
              {actions.coverLetter && results.coverLetter && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'coverLetter' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('coverLetter')}
                >Cover Letter</button>
              )}
              {actions.answers && results.answers && (
                <button
                  className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest border-r-4 border-black transition-colors ${activeTab === 'answers' ? 'bg-black text-white' : 'hover:bg-[#e8fc3b]'}`}
                  onClick={() => setActiveTab('answers')}
                >Q&amp;A</button>
              )}
              {(results.resume || results.coverLetter) && (
                <button
                  onClick={handleDownload}
                  disabled={activeTab === 'answers'}
                  className="px-8 py-4 bg-[#e8fc3b] text-black border-l-4 border-black hover:bg-black hover:text-[#e8fc3b] transition-colors flex items-center justify-center font-bold text-xs uppercase disabled:opacity-30 disabled:hover:bg-[#e8fc3b]"
                  title="Download as PDF"
                ><Download className="w-4 h-4 mr-2 stroke-[3]" /> PDF</button>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {activeTab !== 'answers' && results?.[activeTab] && (
                <button
                  onClick={handleToggleEdit}
                  className={`absolute bottom-6 right-8 z-10 flex items-center px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${
                    isEditing ? 'bg-[#ff5e5b] text-white border-black hover:bg-black' : 'bg-[#e8fc3b] text-black border-black hover:bg-black hover:text-[#e8fc3b]'
                  }`}
                >
                  {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save & View</> : <><Pencil className="w-4 h-4 mr-2" /> Edit JSON</>}
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
                      options={{ minimap: { enabled: false }, formatOnPaste: true, fontSize: 14, fontFamily: 'monospace', wordWrap: 'on' }}
                    />
                  </div>
                ) : previewHtml ? (
                  <iframe srcDoc={previewHtml} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-[#f4f4f0]/30 font-mono text-xs uppercase tracking-widest text-black/40">Synthesizing Layout…</div>
                )
              ) : activeTab === 'answers' && results.answers ? (
                <div className="h-full overflow-y-auto p-8 lg:p-12">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-black leading-relaxed">{results.answers}</pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 bg-[#f4f4f0]/30 font-mono text-xs uppercase tracking-widest text-black/40">Synthesizing Layout…</div>
              )}
            </div>
          </>
        ) : sidebarTab === 'build' ? (
          <div className="h-full flex items-center justify-center p-12 text-center bg-white">
            <div className="border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#f4f4f0] max-w-md">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-black stroke-[2]" />
              <p className="font-mono text-sm uppercase tracking-widest font-bold text-black/60 leading-loose">
                Paste a job description and hit Initialize.
              </p>
            </div>
          </div>
        ) : null}

        {/* Profile Tab View: Split Pane */}
        {sidebarTab === 'profile' && (
          <div className="flex h-full w-full">
            <div className="w-1/2 border-r-4 border-black flex flex-col">
              <div className="p-4 border-b-4 border-black bg-[#1e1e1e] text-white flex justify-between items-center font-mono text-xs uppercase tracking-widest">
                <span>Profile Markdown</span>
              </div>
              <div className="flex-1 bg-[#1e1e1e] pt-4">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-dark"
                  value={profile}
                  onChange={(val) => saveProfile(val || '')}
                  options={{ minimap: { enabled: false }, fontFamily: 'monospace', fontSize: 13, wordWrap: 'on' }}
                />
              </div>
            </div>
            <div className="w-1/2 overflow-y-auto bg-white p-8">
              <div className="prose prose-sm max-w-none text-black font-mono">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{DOMPurify.sanitize(profile)}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab View */}
        {sidebarTab === 'settings' && (
          <div className="p-10 h-full overflow-y-auto w-full max-w-3xl">
            <h1 className="text-3xl font-black font-playfair uppercase tracking-tight mb-8">Options</h1>
            
            {/* Aesthetics Section */}
            <div className="mb-12 space-y-6">
              <h2 className="text-lg font-bold font-mono uppercase tracking-widest flex items-center border-b-4 border-black pb-2">
                <Type className="w-5 h-5 mr-3" /> File Aesthetics
              </h2>
              <p className="text-xs font-mono uppercase text-black/60 mb-4 leading-loose">
                Customize the typographic signature of your generated PDF documents. Changes are applied instantly to the preview.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => saveFont(font.id)}
                    className={`p-5 border-4 border-black flex flex-col items-start text-left transition-all hover:bg-[#e8fc3b] ${selectedFontId === font.id ? 'bg-[#e8fc3b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest mb-1">{font.name}</span>
                    <span className="text-xl" style={{ fontFamily: font.family }}>Sample Text: The quick brown fox jumps...</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10 space-y-6">
              <h2 className="text-lg font-bold font-mono uppercase tracking-widest flex items-center border-b-4 border-black pb-2">
                <Key className="w-5 h-5 mr-3" /> API Keys
              </h2>
              <p className="text-xs font-mono uppercase text-black/60 mb-4">Keys are stored locally in your browser.</p>
              
              <div className="space-y-4 font-mono">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">OpenAI API Key</label>
                  <input type="password" value={apiKeys.openai || ''} onChange={e => saveKeys({ ...apiKeys, openai: e.target.value })} className="w-full p-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10" placeholder="sk-..." />
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs uppercase underline text-black/50 hover:text-black mt-2 inline-block">Manage OpenAI Keys</a>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 mt-4">Gemini API Key</label>
                  <input type="password" value={apiKeys.gemini || ''} onChange={e => saveKeys({ ...apiKeys, gemini: e.target.value })} className="w-full p-3 border-4 border-black focus:outline-none focus:bg-[#e8fc3b]/10" placeholder="AIzaSy..." />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs uppercase underline text-black/50 hover:text-black mt-2 inline-block">Manage Gemini Keys</a>
                </div>
              </div>
            </div>

            <div className="mb-12 space-y-6">
              <h2 className="text-lg font-bold font-mono uppercase tracking-widest flex items-center border-b-4 border-black pb-2">
                <AlertTriangle className="w-5 h-5 mr-3 text-[#ff5e5b]" /> Privacy & PII Masking
              </h2>
              <p className="text-xs font-mono uppercase text-black/60 mb-4 leading-loose">
                Define information to be masked (replaced with placeholders) before LLM transmission.
              </p>
              
              <div className="grid grid-cols-2 gap-6 font-mono text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Real Name to Mask</label>
                  <input type="text" value={privacy.name || ''} onChange={e => savePrivacy({ ...privacy, name: e.target.value })} className="w-full p-3 border-4 border-black" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email to Mask</label>
                  <input type="text" value={privacy.email || ''} onChange={e => savePrivacy({ ...privacy, email: e.target.value })} className="w-full p-3 border-4 border-black" placeholder="e.g. email@val.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Phone to Mask</label>
                  <input type="text" value={privacy.phone || ''} onChange={e => savePrivacy({ ...privacy, phone: e.target.value })} className="w-full p-3 border-4 border-black" placeholder="e.g. +1 555-5555" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Address to Mask</label>
                  <input type="text" value={privacy.address || ''} onChange={e => savePrivacy({ ...privacy, address: e.target.value })} className="w-full p-3 border-4 border-black" placeholder="e.g. New York, NY" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-4 border-black">
              <button onClick={clearAllData} className="px-6 py-3 bg-[#fa4642] text-white font-bold font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider border-4 border-black hover:translate-y-1 hover:shadow-none transition-all flex items-center">
                <Trash2 className="w-4 h-4 mr-3" />
                Clear All Data & Sessions
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ApplicationAssistantPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center font-mono text-sm uppercase">Loading...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
