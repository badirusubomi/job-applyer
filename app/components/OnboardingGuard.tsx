'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Key, FileText, Video, CheckCircle, Upload, Loader2, Play } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [step, setStep] = useState(1);
  const pathname = usePathname();
  const router = useRouter();

  // Step 1: API Key
  const [model, setModel] = useState('openai');
  const [apiKey, setApiKey] = useState('');

  // Step 2: Profile parsing
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  useEffect(() => {
    setMounted(true);
    const complete = localStorage.getItem('applyer_onboarding_complete') === 'true';
    setIsComplete(complete);

    if (!complete && pathname !== '/home') {
      router.push('/home');
    }
  }, [pathname, router]);

  const saveApiKey = () => {
    if (!apiKey) {
      addToast('Please enter an API key to continue.', 'error');
      return;
    }
    const keys = JSON.parse(localStorage.getItem('assistant_keys') || '{}');
    keys[model] = apiKey;
    localStorage.setItem('assistant_keys', JSON.stringify(keys));
    
    const session = JSON.parse(localStorage.getItem('assistant_session') || '{}');
    session.selectedModel = model;
    localStorage.setItem('assistant_session', JSON.stringify(session));

    setStep(2);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('apiKey', apiKey);

    try {
      const res = await fetch('/api/profile/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse resume');

      // Save raw data
      localStorage.setItem('assistant_profile_data', JSON.stringify(data));

      // Build basic markdown
      let markdown = `# ${data.name || 'Candidate Profile'}\n\n`;
      if (data.summary) markdown += `## Summary\n${data.summary}\n\n`;
      localStorage.setItem('assistant_profile', markdown);

      addToast("Resume parsed successfully!", "success");
      setStep(3);
    } catch (err: any) {
      addToast(err.message || "Failed to extract profile.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const skipProfile = () => {
    setStep(3);
  };

  const finishOnboarding = () => {
    localStorage.setItem('applyer_onboarding_complete', 'true');
    window.dispatchEvent(new Event('applyer_onboarding_complete'));
    setIsComplete(true);
    addToast('Welcome to Applyer!', 'success');
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}
      {!isComplete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f4f4f0] text-black border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[8px_8px_0px_0px_rgba(232,252,59,1)]">
            <div className="p-6 border-b-4 border-black bg-[#e8fc3b]">
              <h2 className="text-2xl font-black font-playfair uppercase tracking-tighter">Welcome to Applyer</h2>
              <p className="font-mono text-xs font-bold uppercase mt-2">Let's get you set up</p>
            </div>

            <div className="p-6 flex-1">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg uppercase tracking-wide">Step 1: Configuration</h3>
                      <p className="text-sm mt-2 leading-relaxed">Applyer uses Bring-Your-Own-Key (BYOK) architecture. Your keys never leave your browser and are stored securely in local storage.</p>
                      
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Select AI Provider</label>
                          <select 
                            value={model} 
                            onChange={e => setModel(e.target.value)}
                            className="w-full p-3 border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#e8fc3b]"
                          >
                            <option value="openai">OpenAI (Recommended)</option>
                            <option value="gemini">Google Gemini</option>
                          </select>
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold uppercase tracking-wider">API Key</label>
                            {model === 'openai' ? (
                              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-black/60 hover:text-black hover:underline uppercase font-bold tracking-wider">Get OpenAI Key ↗</a>
                            ) : (
                              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-black/60 hover:text-black hover:underline uppercase font-bold tracking-wider">Get Gemini Key ↗</a>
                            )}
                          </div>
                          <input 
                            type="password" 
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder={model === 'openai' ? 'sk-...' : 'AIza...'}
                            className="w-full p-3 border-2 border-black bg-white text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#e8fc3b]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={saveApiKey} className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#e8fc3b] hover:text-black border-2 border-black transition-colors">
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg uppercase tracking-wide">Step 2: Profile Import</h3>
                      <p className="text-sm mt-2 leading-relaxed">Let's build your master candidate profile. Upload your current resume (PDF) and the AI model will parse it automatically.</p>
                      
                      <div className="mt-6 p-6 border-2 border-dashed border-black bg-white text-center hover:bg-[#e8fc3b]/20 transition-colors">
                        <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#e8fc3b] hover:text-black border-2 border-black transition-colors disabled:opacity-50"
                        >
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          {uploading ? 'Parsing Profile...' : 'Upload PDF Resume'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black transition-colors">
                      Back
                    </button>
                    <button onClick={skipProfile} className="px-6 py-3 text-black/60 font-bold uppercase tracking-widest hover:text-black underline transition-colors">
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
                      <Play className="w-5 h-5 ml-1" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg uppercase tracking-wide">Step 3: Quick Tour</h3>
                      <p className="text-sm mt-2 leading-relaxed">Here's a quick rundown of the main areas:</p>
                      <ul className="mt-4 space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="font-bold border-b-2 border-[#e8fc3b] leading-tight flex-shrink-0">Job Watcher:</span>
                          <span className="text-sm">Monitor job listings.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold border-b-2 border-[#e8fc3b] leading-tight flex-shrink-0">Profile Editor:</span>
                          <span className="text-sm">Manage your master resume data.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold border-b-2 border-[#e8fc3b] leading-tight flex-shrink-0">Assistant:</span>
                          <span className="text-sm">Generate tailored resumes, cover letters, and interview answers based on a job description.</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-4 border-2 border-black bg-white flex gap-3 items-center">
                        <Video className="w-6 h-6 flex-shrink-0" />
                        <p className="text-xs font-bold">A video walkthrough is available on the Home page.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(2)} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black transition-colors">
                      Back
                    </button>
                    <button onClick={finishOnboarding} className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-[#e8fc3b] hover:text-black border-2 border-black transition-colors flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Finish Setup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
