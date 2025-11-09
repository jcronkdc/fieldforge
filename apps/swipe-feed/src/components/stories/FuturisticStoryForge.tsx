/**
 * FUTURISTIC STORYFORGE - Code Editor Aesthetic
 */

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import type { FocusedView } from '../AuthenticatedAppV2';

interface Story {
  id: string;
  title: string;
  author: string;
  content: string;
  genre: string;
  likes: number;
  branches: number;
  createdAt: string;
  tags: string[];
}

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const FuturisticStoryForge: React.FC<Props> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'branches'>('editor');
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState({
    title: '',
    content: '',
    genre: 'Cyberpunk',
    tags: [] as string[]
  });
  const [lineNumbers, setLineNumbers] = useState<string[]>(['1']);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // Load stories
    const saved = localStorage.getItem('storyforge_stories');
    if (saved) setStories(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Update line numbers and word count
    const lines = currentStory.content.split('\n');
    setLineNumbers(lines.map((_, i) => String(i + 1)));
    setWordCount(currentStory.content.trim().split(/\s+/).filter(w => w).length);
  }, [currentStory.content]);

  const saveStory = () => {
    if (!currentStory.title || !currentStory.content) {
      alert('TITLE AND CONTENT REQUIRED');
      return;
    }

    const story: Story = {
      id: `story-${Date.now()}`,
      title: currentStory.title,
      author: profile?.username || 'ANONYMOUS',
      content: currentStory.content,
      genre: currentStory.genre,
      likes: 0,
      branches: 0,
      createdAt: new Date().toISOString(),
      tags: currentStory.tags
    };

    const updated = [story, ...stories];
    setStories(updated);
    localStorage.setItem('storyforge_stories', JSON.stringify(updated));
    
    setCurrentStory({ title: '', content: '', genre: 'Cyberpunk', tags: [] });
    setActiveTab('library');
  };

  const genres = ['Cyberpunk', 'Sci-Fi', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Romance', 'Adventure'];

  const tabs = [
    { id: 'editor', label: 'EDITOR', icon: '📝' },
    { id: 'library', label: 'LIBRARY', icon: '📚' },
    { id: 'branches', label: 'BRANCHES', icon: '🌿' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/90 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                STORYFORGE
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-bold uppercase">
                  ONLINE
                </span>
                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400">
                  {wordCount} WORDS
                </span>
              </div>
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

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'editor' && (
          <div className="flex h-[calc(100vh-140px)]">
            {/* Editor Panel */}
            <div className="flex-1 flex">
              {/* Line Numbers */}
              <div className="w-12 bg-gray-900/50 border-r border-gray-800 py-4 text-right">
                {lineNumbers.map(num => (
                  <div key={num} className="px-2 text-xs text-gray-600 font-mono leading-6">
                    {num}
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div className="flex-1 p-4">
                <input
                  type="text"
                  value={currentStory.title}
                  onChange={(e) => setCurrentStory({ ...currentStory, title: e.target.value })}
                  placeholder="STORY TITLE..."
                  className="w-full mb-4 px-4 py-2 bg-black/60 border border-cyan-500/20 rounded-lg text-cyan-400 placeholder-gray-600 focus:border-cyan-400 focus:outline-none font-black uppercase tracking-wider"
                />
                
                <textarea
                  value={currentStory.content}
                  onChange={(e) => setCurrentStory({ ...currentStory, content: e.target.value })}
                  placeholder="BEGIN YOUR STORY..."
                  className="w-full h-[calc(100%-60px)] p-4 bg-black/60 border border-gray-800 rounded-lg text-gray-300 placeholder-gray-600 focus:border-cyan-500 focus:outline-none font-mono leading-6 resize-none"
                  style={{ tabSize: 2 }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-gray-900/30 border-l border-cyan-500/20 p-4">
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider mb-4">STORY CONFIG</h3>
              
              {/* Genre */}
              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider">GENRE</label>
                <select
                  value={currentStory.genre}
                  onChange={(e) => setCurrentStory({ ...currentStory, genre: e.target.value })}
                  className="w-full mt-2 px-3 py-2 bg-black/60 border border-gray-800 rounded-lg text-cyan-400 focus:border-cyan-500 focus:outline-none"
                >
                  {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* AI Tools */}
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg text-purple-400 font-bold uppercase tracking-wider text-xs hover:from-purple-500/20 hover:to-pink-500/20 transition-all">
                  🤖 AI SUGGEST
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-bold uppercase tracking-wider text-xs hover:from-blue-500/20 hover:to-cyan-500/20 transition-all">
                  ✨ ENHANCE
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-green-400 font-bold uppercase tracking-wider text-xs hover:from-green-500/20 hover:to-emerald-500/20 transition-all">
                  🔀 BRANCH
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveStory}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
              >
                SAVE STORY
              </button>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="p-6">
            <div className="grid gap-4 max-w-6xl mx-auto">
              {stories.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className="text-2xl font-black text-cyan-400 mb-2">NO STORIES YET</h2>
                  <p className="text-gray-500 uppercase tracking-wider">Start writing your first story</p>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                  >
                    CREATE STORY
                  </button>
                </div>
              ) : (
                stories.map(story => (
                  <div key={story.id} className="bg-black/60 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-cyan-400 uppercase tracking-wider mb-1">{story.title}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                          BY {story.author} • {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-bold uppercase">
                        {story.genre}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 line-clamp-3 mb-4">{story.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <span className="text-xs text-gray-500">❤️ {story.likes}</span>
                        <span className="text-xs text-gray-500">🌿 {story.branches} BRANCHES</span>
                      </div>
                      <button className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all">
                        READ MORE →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-6 text-center">
            <div className="py-20">
              <div className="text-6xl mb-4">🌿</div>
              <h2 className="text-2xl font-black text-cyan-400 mb-2">STORY BRANCHES</h2>
              <p className="text-gray-500 uppercase tracking-wider">Create alternate versions and timelines</p>
              <button className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-black font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all">
                COMING SOON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticStoryForge;
