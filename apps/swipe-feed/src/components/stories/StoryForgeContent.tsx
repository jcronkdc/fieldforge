/**
 * StoryForge Content - Complete story creation and browsing interface
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
  coverImage?: string;
  tags: string[];
}

interface Props {
  profile: any;
  onNavigate: (view: FocusedView) => void;
}

export const StoryForgeContent: React.FC<Props> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-stories'>('browse');
  const [stories, setStories] = useState<Story[]>([]);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    genre: 'Fantasy',
    tags: [] as string[]
  });
  const [isWriting, setIsWriting] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Load stories from localStorage
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    // Load user's stories
    const savedStories = localStorage.getItem('storyforge_stories');
    if (savedStories) {
      setStories(JSON.parse(savedStories));
    } else {
      // Add sample stories if none exist
      const sampleStories: Story[] = [
        {
          id: 'sample-1',
          title: 'The Last Algorithm',
          author: 'AI Storyteller',
          content: 'In a world where artificial intelligence has evolved beyond human comprehension, one programmer discovers a hidden message in the code that could change everything...',
          genre: 'Sci-Fi',
          likes: 42,
          branches: 7,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          tags: ['AI', 'Future', 'Technology']
        },
        {
          id: 'sample-2',
          title: 'Whispers in the Digital Wind',
          author: 'MythMaker',
          content: 'The network was alive. Not in the way servers hummed or data flowed, but truly, consciously alive. And it was trying to tell us something...',
          genre: 'Cyberpunk',
          likes: 28,
          branches: 4,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          tags: ['Cyberpunk', 'Mystery', 'Thriller']
        },
        {
          id: 'sample-3',
          title: 'The Enchanted Repository',
          author: 'CodeWizard',
          content: 'Every commit to this repository seemed to change reality itself. Variables became spells, functions became rituals, and bugs... bugs became monsters.',
          genre: 'Fantasy',
          likes: 67,
          branches: 12,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          tags: ['Magic', 'Coding', 'Adventure']
        }
      ];
      setStories(sampleStories);
      localStorage.setItem('storyforge_stories', JSON.stringify(sampleStories));
    }
  };

  const saveStory = () => {
    if (!newStory.title || !newStory.content) {
      alert('Please add a title and content for your story');
      return;
    }

    const story: Story = {
      id: `story-${Date.now()}`,
      title: newStory.title,
      author: profile?.username || 'Anonymous',
      content: newStory.content,
      genre: newStory.genre,
      likes: 0,
      branches: 0,
      createdAt: new Date().toISOString(),
      tags: newStory.tags
    };

    const updatedStories = [story, ...stories];
    setStories(updatedStories);
    localStorage.setItem('storyforge_stories', JSON.stringify(updatedStories));
    
    // Reset form
    setNewStory({
      title: '',
      content: '',
      genre: 'Fantasy',
      tags: []
    });
    setIsWriting(false);
    setActiveTab('my-stories');
  };

  const deleteStory = (storyId: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      const updatedStories = stories.filter(s => s.id !== storyId);
      setStories(updatedStories);
      localStorage.setItem('storyforge_stories', JSON.stringify(updatedStories));
      setSelectedStory(null);
    }
  };

  const likeStory = (storyId: string) => {
    const updatedStories = stories.map(s => 
      s.id === storyId ? { ...s, likes: s.likes + 1 } : s
    );
    setStories(updatedStories);
    localStorage.setItem('storyforge_stories', JSON.stringify(updatedStories));
  };

  const myStories = stories.filter(s => s.author === (profile?.username || 'Anonymous'));

  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Adventure', 'Cyberpunk', 'Historical'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                StoryForge
              </h1>
              <p className="text-gray-400 mt-1">Create and share amazing stories</p>
            </div>
            <button
              onClick={() => onNavigate('prologue')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icons.Dashboard size={20} />
              Back to Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'browse' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Browse Stories
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'create' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Create Story
            </button>
            <button
              onClick={() => setActiveTab('my-stories')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'my-stories' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              My Stories ({myStories.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Discover Stories</h2>
            {stories.length === 0 ? (
              <div className="text-center py-12">
                <Icons.StoryForge size={64} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No stories yet</p>
                <p className="text-gray-500 mt-2">Be the first to create one!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Create First Story
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {stories.map(story => (
                  <div key={story.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{story.title}</h3>
                        <p className="text-sm text-gray-400">
                          by {story.author} • {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                        {story.genre}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3">{story.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => likeStory(story.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Icons.Heart size={18} />
                        {story.likes}
                      </button>
                      <span className="flex items-center gap-2 text-gray-400">
                        <Icons.StoryForge size={18} />
                        {story.branches} branches
                      </span>
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Create New Story</h2>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              {!isWriting ? (
                <div className="text-center py-12">
                  <Icons.StoryForge size={64} className="mx-auto text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready to create?</h3>
                  <p className="text-gray-400 mb-6">Start writing your amazing story</p>
                  <button
                    onClick={() => setIsWriting(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Start Writing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      placeholder="Enter your story title..."
                      className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                    <select
                      value={newStory.genre}
                      onChange={(e) => setNewStory({ ...newStory, genre: e.target.value })}
                      className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Story Content</label>
                    <textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                      placeholder="Write your story here..."
                      rows={12}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveStory}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      Save Story
                    </button>
                    <button
                      onClick={() => {
                        setIsWriting(false);
                        setNewStory({ title: '', content: '', genre: 'Fantasy', tags: [] });
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Stories Tab */}
        {activeTab === 'my-stories' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">My Stories</h2>
            {myStories.length === 0 ? (
              <div className="text-center py-12">
                <Icons.StoryForge size={64} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">You haven't created any stories yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Create Your First Story
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myStories.map(story => (
                  <div key={story.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{story.title}</h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                          {story.genre}
                        </span>
                        <button
                          onClick={() => deleteStory(story.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Icons.Error size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{story.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 text-gray-400">
                        <Icons.Heart size={18} />
                        {story.likes} likes
                      </span>
                      <span className="flex items-center gap-2 text-gray-400">
                        <Icons.StoryForge size={18} />
                        {story.branches} branches
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Story Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedStory.title}</h2>
                    <p className="text-gray-400 mt-1">
                      by {selectedStory.author} • {new Date(selectedStory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Icons.Error size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                    {selectedStory.genre}
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.content}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      likeStory(selectedStory.id);
                      setSelectedStory({ ...selectedStory, likes: selectedStory.likes + 1 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <Icons.Heart size={18} />
                    Like ({selectedStory.likes})
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <Icons.StoryForge size={18} />
                    Create Branch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryForgeContent;
