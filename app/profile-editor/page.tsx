'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Plus, Trash2 } from 'lucide-react';

export default function ProfileEditor() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [] as { title: '', company: '', startDate: '', endDate: '', bullets: '' }[],
    skills: [] as { category: '', skills: '' }[],
    education: [] as { institution: '', degree: '', date: '' }[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-4 bg-[#e8fc3b] text-black border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-[#e8fc3b] transition-colors flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 bg-white text-black placeholder:text-black/40"
        >
          {saved ? (
            <><Check className="w-5 h-5 mr-3" /> SAVED STATUS</>
          ) : (
             <><Save className="w-5 h-5 mr-3" /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}</>
          )}
        </button>
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
                }} className="p-2 bg-[#ff5e5b] text-white border-2 border-black bg-white text-black placeholder:text-black/40"><Trash2 className="w-4 h-4" /></button>
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
              <div key={index} className="mb-6 p-4 border-2 border-black bg-[#f4f4f0] bg-white text-black placeholder:text-black/40">
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
                }} className="p-2 bg-[#ff5e5b] text-white border-2 border-black bg-white text-black placeholder:text-black/40"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

        </div>
      </div>
    </div>
  );
}
