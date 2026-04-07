'use client';

import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';

export default function ProfileEditor() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f4f0] p-6 lg:p-12 overflow-hidden">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black font-playfair tracking-tight text-black">PROFILE<br/>EDITOR</h1>
          <p className="font-mono text-sm uppercase tracking-widest text-black/60 mt-4 max-w-sm">
            Edit your raw markdown resume. Used globally by AI agents.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-4 bg-[#e8fc3b] text-black border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-[#e8fc3b] transition-colors flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
        >
          {saved ? (
            <><Check className="w-5 h-5 mr-3" /> SAVED STATUS</>
          ) : (
             <><Save className="w-5 h-5 mr-3" /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        {loading ? (
          <div className="h-full flex items-center justify-center font-mono font-bold uppercase tracking-widest text-black/50">Loading payload...</div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full h-full p-8 bg-transparent text-black font-mono text-sm leading-relaxed resize-none focus:outline-none"
            placeholder="# John Doe\n\n## Experience..."
          />
        )}
      </div>
    </div>
  );
}
