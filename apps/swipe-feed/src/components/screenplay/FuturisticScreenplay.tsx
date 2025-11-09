/**
 * FUTURISTIC SCREENPLAY WRITER - Professional Script Creation
 */

import React, { useState, useEffect } from 'react';
import type { FocusedView } from '../AuthenticatedAppV2';
import { useSparks } from '../sparks/SparksContext';

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

interface Script {
  id: string;
  title: string;
  genre: string;
  format: 'feature' | 'short' | 'tv' | 'web';
  pages: number;
  createdAt: string;
  lastEdited: string;
  content: string;
}

export const FuturisticScreenplay: React.FC<Props> = ({ profile, onNavigate }) => {
  const { balance: sparksBalance, deductSparks, isAdmin } = useSparks();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [format, setFormat] = useState<'feature' | 'short' | 'tv' | 'web'>('feature');
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    // Load saved scripts
    const saved = localStorage.getItem('screenplay_scripts');
    if (saved) {
      try {
        setScripts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load scripts');
      }
    }
  }, []);

  const createNewScript = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const newScript: Script = {
      id: `script-${Date.now()}`,
      title,
      genre,
      format,
      pages: 0,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      content: generateTemplate(title, format)
    };

    const updated = [newScript, ...scripts];
    setScripts(updated);
    localStorage.setItem('screenplay_scripts', JSON.stringify(updated));
    
    setActiveScript(newScript);
    setScriptContent(newScript.content);
    setIsWriting(true);
  };

  const generateTemplate = (title: string, format: string): string => {
    const templates = {
      feature: `FADE IN:

${title.toUpperCase()}

Written by

${profile?.username || 'Author'}


INT. LOCATION - TIME

Scene description here...

CHARACTER NAME
Dialogue goes here...

FADE OUT.`,
      short: `${title.toUpperCase()}

INT. LOCATION - DAY

Scene description...

CHARACTER
Dialogue...

THE END`,
      tv: `"${title}"

TEASER

FADE IN:

INT. LOCATION - DAY

Scene description...

CHARACTER
Dialogue...

END OF TEASER

ACT ONE

FADE OUT.`,
      web: `${title.toUpperCase()}

EPISODE 1

INT. LOCATION - DAY

Scene description...

CHARACTER
Dialogue...

TO BE CONTINUED...`
    };

    return templates[format] || templates.feature;
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    const cost = 50; // 50 Sparks for AI generation
    
    if (!isAdmin && sparksBalance < cost) {
      alert(`Need ${cost} Sparks. Current balance: ${sparksBalance}`);
      return;
    }

    if (!isAdmin) {
      deductSparks(cost);
    }

    // Simulate AI generation
    const aiGenerated = `
INT. ${aiPrompt.toUpperCase()} - DAY

The scene opens with dramatic intensity. ${aiPrompt}

CHARACTER 1
(thoughtfully)
This is exactly what we needed for this scene.

CHARACTER 2
(responding)
I couldn't agree more. The ${genre.toLowerCase()} elements really shine through here.

They exchange meaningful glances as the camera pulls back.

CUT TO:`;

    setScriptContent(prev => prev + '\n\n' + aiGenerated);
    setAiPrompt('');
  };

  const saveScript = () => {
    if (!activeScript) return;

    const updated = scripts.map(s => 
      s.id === activeScript.id 
        ? { ...s, content: scriptContent, lastEdited: new Date().toISOString(), pages: Math.ceil(scriptContent.length / 3000) }
        : s
    );

    setScripts(updated);
    localStorage.setItem('screenplay_scripts', JSON.stringify(updated));
    
    // Visual feedback
    const button = document.querySelector('#save-button');
    if (button) {
      button.textContent = 'SAVED!';
      setTimeout(() => {
        button.textContent = 'SAVE';
      }, 2000);
    }
  };

  const exportScript = () => {
    if (!activeScript) return;
    
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeScript.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const genres = ['Drama', 'Comedy', 'Action', 'Thriller', 'Horror', 'Sci-Fi', 'Romance', 'Mystery'];
  const formats = [
    { id: 'feature' as const, name: 'FEATURE FILM', pages: '90-120' },
    { id: 'short' as const, name: 'SHORT FILM', pages: '5-30' },
    { id: 'tv' as const, name: 'TV EPISODE', pages: '22-60' },
    { id: 'web' as const, name: 'WEB SERIES', pages: '10-20' }
  ];

  if (isWriting && activeScript) {
    return (
      <div className="min-h-screen bg-black text-white flex">
        {/* Writing Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWriting(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div>
                <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider">{activeScript.title}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  {activeScript.genre} • {activeScript.format} • {Math.ceil(scriptContent.length / 3000)} PAGES
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                id="save-button"
                onClick={saveScript}
                className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase tracking-wider text-xs hover:bg-green-500/20 transition-all"
              >
                SAVE
              </button>
              <button
                onClick={exportScript}
                className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-bold uppercase tracking-wider text-xs hover:bg-blue-500/20 transition-all"
              >
                EXPORT
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 p-6">
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="w-full h-full bg-black/60 border border-gray-800 rounded-lg p-6 text-gray-300 font-mono text-sm resize-none focus:border-cyan-500/50 focus:outline-none"
              placeholder="Start writing your screenplay..."
              style={{ fontFamily: 'Courier New, monospace' }}
            />
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className={`border-l border-cyan-500/20 bg-black/90 transition-all ${showAIPanel ? 'w-96' : 'w-12'}`}>
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="w-full p-3 border-b border-cyan-500/20 hover:bg-white/5 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-cyan-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </button>

          {showAIPanel && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-black text-cyan-400 uppercase tracking-wider">AI ASSISTANT</h3>
              
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
                  GENERATE SCENE
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the scene you want..."
                  className="w-full px-3 py-2 bg-black/60 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
                  rows={4}
                />
                <button
                  onClick={generateWithAI}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  GENERATE • 50 SPARKS
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest">QUICK ACTIONS</p>
                <button className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-xs text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                  ADD CHARACTER
                </button>
                <button className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-xs text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                  ADD LOCATION
                </button>
                <button className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded text-xs text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                  ADD ACTION
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-600 uppercase tracking-widest">
                  BALANCE: {isAdmin ? '∞' : sparksBalance} SPARKS
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                SCREENPLAY
              </h1>
              <p className="text-sm text-cyan-500/60 uppercase tracking-widest">
                PROFESSIONAL SCRIPT WRITER
              </p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-cyan-400"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create New Script */}
        <div className="mb-8 p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl">
          <h2 className="text-xl font-black text-emerald-400 uppercase tracking-wider mb-6">CREATE NEW SCRIPT</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full px-4 py-2 bg-black/60 border border-gray-800 rounded-lg text-emerald-300 placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">GENRE</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2 bg-black/60 border border-gray-800 rounded-lg text-emerald-300 focus:border-emerald-500 focus:outline-none"
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">FORMAT</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-4 py-2 bg-black/60 border border-gray-800 rounded-lg text-emerald-300 focus:border-emerald-500 focus:outline-none"
              >
                {formats.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={createNewScript}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all self-end"
            >
              CREATE
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {formats.map(f => (
              <div key={f.id} className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-widest">{f.name}</p>
                <p className="text-sm text-emerald-400 font-bold">{f.pages} pages</p>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Scripts */}
        <div>
          <h2 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-4">MY SCRIPTS</h2>
          
          {scripts.length === 0 ? (
            <div className="bg-black/60 border border-gray-800 rounded-xl p-12 text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-gray-700">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3 className="text-lg font-black text-gray-400 mb-2">NO SCRIPTS YET</h3>
              <p className="text-sm text-gray-600 uppercase tracking-widest">
                Create your first screenplay above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts.map(script => (
                <div
                  key={script.id}
                  className="bg-black/60 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
                  onClick={() => {
                    setActiveScript(script);
                    setScriptContent(script.content);
                    setIsWriting(true);
                  }}
                >
                  <h3 className="text-lg font-black text-cyan-400 mb-2">{script.title}</h3>
                  <div className="space-y-1 text-xs text-gray-500 uppercase tracking-widest">
                    <p>{script.genre} • {script.format}</p>
                    <p>{script.pages} PAGES</p>
                    <p>EDITED: {new Date(script.lastEdited).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all">
                      EDIT
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = scripts.filter(s => s.id !== script.id);
                        setScripts(updated);
                        localStorage.setItem('screenplay_scripts', JSON.stringify(updated));
                      }}
                      className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturisticScreenplay;
