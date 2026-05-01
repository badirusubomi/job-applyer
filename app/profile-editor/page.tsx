'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Check, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export default function ProfileEditor() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [] as { title: string; company: string; startDate: string; endDate: string; bullets: string }[],
    skills: [] as { category: string; skills: string }[],
    education: [] as { institution: string; degree: string; date: string }[],
    projects: [] as { name: string; description: string; link: string }[],
    customSections: [] as { title: string; content: string }[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sessionStr = localStorage.getItem('assistant_session') || '{}';
    const keysStr = localStorage.getItem('assistant_keys') || '{}';
    const { selectedModel = 'openai' } = JSON.parse(sessionStr);
    const keys = JSON.parse(keysStr);
    const apiKey = selectedModel === 'openai' ? keys.openai : keys.gemini;

    if (selectedModel !== 'local' && !apiKey) {
      addToast("Please configure an API key in the Assistant Settings first.", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', selectedModel);
    if (apiKey) formData.append('apiKey', apiKey);

    try {
      const res = await fetch('/api/profile/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse resume');

      setProfile(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        location: data.location || prev.location,
        summary: data.summary || prev.summary,
        experience: data.experience?.length ? data.experience : prev.experience,
        skills: data.skills?.length ? data.skills : prev.skills,
        education: data.education?.length ? data.education : prev.education,
        projects: data.projects?.length ? data.projects : prev.projects || [],
        customSections: data.customSections?.length ? data.customSections : prev.customSections || [],
      }));
      
      addToast("Resume parsed successfully! Please review the extracted data.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to extract profile from PDF.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Load existing form data or initialize from privacy vault
    const savedData = localStorage.getItem('assistant_profile_data');
    if (savedData) {
      setProfile(JSON.parse(savedData));
    } else {
      const privacyData = localStorage.getItem('assistant_privacy');
      if (privacyData) {
        const p = JSON.parse(privacyData);
        setProfile(prev => ({
          ...prev,
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          location: p.address || ''
        }));
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    
    // Save raw json data for the form
    localStorage.setItem('assistant_profile_data', JSON.stringify(profile));

    // Compile to Markdown for the AI Assistant
    let markdown = `# ${profile.name || 'Candidate Profile'}\n\n`;
    if (profile.email || profile.phone || profile.location) {
      markdown += `**Contact**: ${[profile.email, profile.phone, profile.location].filter(Boolean).join(' | ')}\n\n`;
    }
    if (profile.summary) {
      markdown += `## Summary\n${profile.summary}\n\n`;
    }
    if (profile.experience.length > 0) {
      markdown += `## Experience\n`;
      profile.experience.forEach(exp => {
        markdown += `**${exp.title} at ${exp.company}** (${exp.startDate} - ${exp.endDate})\n`;
        const bullets = exp.bullets.split('\n').filter(b => b.trim());
        bullets.forEach(b => {
          markdown += `- ${b.trim()}\n`;
        });
        markdown += '\n';
      });
    }
    if (profile.skills.length > 0) {
      markdown += `## Skills\n`;
      profile.skills.forEach(skill => {
        markdown += `- **${skill.category}**: ${skill.skills}\n`;
      });
      markdown += '\n';
    }
    if (profile.education.length > 0) {
      markdown += `## Education\n`;
      profile.education.forEach(edu => {
        markdown += `**${edu.institution}** - ${edu.degree} (${edu.date})\n`;
      });
      markdown += '\n';
    }
    if (profile.projects && profile.projects.length > 0) {
      markdown += `## Projects\n`;
      profile.projects.forEach(proj => {
        markdown += `**${proj.name}**${proj.link ? ` (${proj.link})` : ''}\n${proj.description}\n\n`;
      });
    }
    if (profile.customSections && profile.customSections.length > 0) {
      profile.customSections.forEach(section => {
        markdown += `## ${section.title}\n${section.content}\n\n`;
      });
    }

    localStorage.setItem('assistant_profile', markdown);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f4f0] p-6 lg:p-12 overflow-hidden">
      <div className="flex items-end justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black font-playfair tracking-tight text-black">PROFILE<br/>EDITOR</h1>
          <p className="font-mono text-sm uppercase tracking-widest text-black/60 mt-4 max-w-sm">
            Edit your structured profile. Compiled to Markdown globally.
          </p>
        </div>
        <div className="flex gap-4">
          <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-4 bg-white text-black border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
          >
            {uploading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Upload className="w-5 h-5 mr-3" />}
            {uploading ? 'PARSING...' : 'UPLOAD PDF'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-4 bg-[#e8fc3b] text-black border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-[#e8fc3b] transition-colors flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
          >
            {saved ? (
              <><Check className="w-5 h-5 mr-3" /> SAVED STATUS</>
            ) : (
               <><Save className="w-5 h-5 mr-3" /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-black">
        <div className="space-y-8 font-mono max-w-3xl">
          
          {/* Basic Info */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-2 border-2 border-black bg-white text-black placeholder:text-black/40" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full p-2 border-2 border-black bg-white text-black placeholder:text-black/40" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Phone</label>
                <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-2 border-2 border-black bg-white text-black placeholder:text-black/40" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Location</label>
                <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full p-2 border-2 border-black bg-white text-black placeholder:text-black/40" />
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Summary</h2>
            <textarea 
              value={profile.summary} 
              onChange={e => setProfile({...profile, summary: e.target.value})} 
              className="w-full p-3 border-2 border-black h-32 bg-white text-black placeholder:text-black/40"
            />
          </section>

          {/* Skills */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Skills</h2>
              <button onClick={() => setProfile({...profile, skills: [...profile.skills, { category: '', skills: '' }]})} className="text-xs bg-black text-white px-3 py-1 uppercase font-bold">+ Add Category</button>
            </div>
            {profile.skills.map((skill, index) => (
              <div key={index} className="flex gap-4 mb-4 items-start">
                <div className="w-1/3">
                  <input type="text" placeholder="Category (e.g. Languages)" value={skill.category} onChange={e => {
                    const newSkills = [...profile.skills];
                    newSkills[index].category = e.target.value as any;
                    setProfile({...profile, skills: newSkills});
                  }} className="w-full p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                </div>
                <div className="flex-1">
                  <input type="text" placeholder="Comma separated skills" value={skill.skills} onChange={e => {
                    const newSkills = [...profile.skills];
                    newSkills[index].skills = e.target.value as any;
                    setProfile({...profile, skills: newSkills});
                  }} className="w-full p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                </div>
                <button onClick={() => {
                  const newSkills = profile.skills.filter((_, i) => i !== index);
                  setProfile({...profile, skills: newSkills});
                }} className="p-2 bg-[#ff5e5b] text-white border-2 border-black hover:bg-black transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Experience</h2>
              <button onClick={() => setProfile({...profile, experience: [...profile.experience, { title: '', company: '', startDate: '', endDate: '', bullets: '' }]})} className="text-xs bg-black text-white px-3 py-1 uppercase font-bold">+ Add Role</button>
            </div>
            {profile.experience.map((exp, index) => (
              <div key={index} className="mb-6 p-4 border-2 border-black bg-[#f4f4f0] text-black">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Job Title" value={exp.title} onChange={e => {
                    const newExp = [...profile.experience];
                    newExp[index].title = e.target.value as any;
                    setProfile({...profile, experience: newExp});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                  <input type="text" placeholder="Company" value={exp.company} onChange={e => {
                    const newExp = [...profile.experience];
                    newExp[index].company = e.target.value as any;
                    setProfile({...profile, experience: newExp});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                  <input type="text" placeholder="Start Date" value={exp.startDate} onChange={e => {
                    const newExp = [...profile.experience];
                    newExp[index].startDate = e.target.value as any;
                    setProfile({...profile, experience: newExp});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                  <input type="text" placeholder="End Date" value={exp.endDate} onChange={e => {
                    const newExp = [...profile.experience];
                    newExp[index].endDate = e.target.value as any;
                    setProfile({...profile, experience: newExp});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                </div>
                <textarea placeholder="Bullet points (one per line)" value={exp.bullets} onChange={e => {
                  const newExp = [...profile.experience];
                  newExp[index].bullets = e.target.value as any;
                  setProfile({...profile, experience: newExp});
                }} className="w-full p-2 border-2 border-black text-sm h-24 mb-2 bg-white text-black placeholder:text-black/40" />
                <button onClick={() => {
                  const newExp = profile.experience.filter((_, i) => i !== index);
                  setProfile({...profile, experience: newExp});
                }} className="text-xs font-bold text-[#ff5e5b] uppercase">Remove Role</button>
              </div>
            ))}
          </section>

          {/* Education */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Education</h2>
              <button onClick={() => setProfile({...profile, education: [...profile.education, { institution: '', degree: '', date: '' }]})} className="text-xs bg-black text-white px-3 py-1 uppercase font-bold">+ Add Education</button>
            </div>
            {profile.education.map((edu, index) => (
              <div key={index} className="flex gap-4 mb-4 items-start">
                <input type="text" placeholder="Institution" value={edu.institution} onChange={e => {
                  const newEdu = [...profile.education];
                  newEdu[index].institution = e.target.value as any;
                  setProfile({...profile, education: newEdu});
                }} className="flex-1 p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                <input type="text" placeholder="Degree" value={edu.degree} onChange={e => {
                  const newEdu = [...profile.education];
                  newEdu[index].degree = e.target.value as any;
                  setProfile({...profile, education: newEdu});
                }} className="flex-1 p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                <input type="text" placeholder="Date" value={edu.date} onChange={e => {
                  const newEdu = [...profile.education];
                  newEdu[index].date = e.target.value as any;
                  setProfile({...profile, education: newEdu});
                }} className="w-32 p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                <button onClick={() => {
                  const newEdu = profile.education.filter((_, i) => i !== index);
                  setProfile({...profile, education: newEdu});
                }} className="p-2 bg-[#ff5e5b] text-white border-2 border-black hover:bg-black transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Projects</h2>
              <button onClick={() => setProfile({...profile, projects: [...(profile.projects || []), { name: '', description: '', link: '' }]})} className="text-xs bg-black text-white px-3 py-1 uppercase font-bold">+ Add Project</button>
            </div>
            {(profile.projects || []).map((proj, index) => (
              <div key={index} className="mb-6 p-4 border-2 border-black bg-[#f4f4f0] text-black">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Project Name" value={proj.name} onChange={e => {
                    const newProj = [...profile.projects];
                    newProj[index].name = e.target.value as any;
                    setProfile({...profile, projects: newProj});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                  <input type="text" placeholder="Link (Optional)" value={proj.link} onChange={e => {
                    const newProj = [...profile.projects];
                    newProj[index].link = e.target.value as any;
                    setProfile({...profile, projects: newProj});
                  }} className="p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40" />
                </div>
                <textarea placeholder="Description" value={proj.description} onChange={e => {
                  const newProj = [...profile.projects];
                  newProj[index].description = e.target.value as any;
                  setProfile({...profile, projects: newProj});
                }} className="w-full p-2 border-2 border-black text-sm h-24 mb-2 bg-white text-black placeholder:text-black/40" />
                <button onClick={() => {
                  const newProj = profile.projects.filter((_, i) => i !== index);
                  setProfile({...profile, projects: newProj});
                }} className="text-xs font-bold text-[#ff5e5b] uppercase">Remove Project</button>
              </div>
            ))}
          </section>

          {/* Custom Sections */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
              <h2 className="text-xl font-bold uppercase tracking-widest">Custom Sections</h2>
              <button onClick={() => setProfile({...profile, customSections: [...(profile.customSections || []), { title: '', content: '' }]})} className="text-xs bg-black text-white px-3 py-1 uppercase font-bold">+ Add Section</button>
            </div>
            {(profile.customSections || []).map((section, index) => (
              <div key={index} className="mb-6 p-4 border-2 border-black bg-[#f4f4f0] text-black">
                <div className="mb-4">
                  <input type="text" placeholder="Section Title (e.g. Volunteer Work)" value={section.title} onChange={e => {
                    const newSec = [...profile.customSections];
                    newSec[index].title = e.target.value as any;
                    setProfile({...profile, customSections: newSec});
                  }} className="w-full p-2 border-2 border-black text-sm bg-white text-black placeholder:text-black/40 font-bold uppercase" />
                </div>
                <textarea placeholder="Section Content" value={section.content} onChange={e => {
                  const newSec = [...profile.customSections];
                  newSec[index].content = e.target.value as any;
                  setProfile({...profile, customSections: newSec});
                }} className="w-full p-2 border-2 border-black text-sm h-32 mb-2 bg-white text-black placeholder:text-black/40" />
                <button onClick={() => {
                  const newSec = profile.customSections.filter((_, i) => i !== index);
                  setProfile({...profile, customSections: newSec});
                }} className="text-xs font-bold text-[#ff5e5b] uppercase">Remove Section</button>
              </div>
            ))}
          </section>

        </div>
      </div>
    </div>
  );
}
