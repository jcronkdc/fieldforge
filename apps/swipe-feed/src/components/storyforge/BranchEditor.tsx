/**
 * Branch Editor - Advanced story editing interface with AI assistance
 */

import React, { useState, useRef, useEffect } from 'react';
import type { StoryBranch, StoryGenre, StoryTone, ValidationReport } from '../../lib/storyforge/types';

interface BranchEditorProps {
  branch: StoryBranch | null;
  onSave: (updates: Partial<StoryBranch>) => void;
  onCreate: () => void;
  onGenerateContinuation: () => void;
  onValidate: () => void;
  validationReport: ValidationReport | null;
  newStoryTitle: string;
  setNewStoryTitle: (title: string) => void;
  newStoryContent: string;
  setNewStoryContent: (content: string) => void;
  selectedGenre: StoryGenre;
  setSelectedGenre: (genre: StoryGenre) => void;
  selectedTone: StoryTone;
  setSelectedTone: (tone: StoryTone) => void;
  useAI: boolean;
  setUseAI: (use: boolean) => void;
  isLoading: boolean;
}

export const BranchEditor: React.FC<BranchEditorProps> = ({
  branch,
  onSave,
  onCreate,
  onGenerateContinuation,
  onValidate,
  validationReport,
  newStoryTitle,
  setNewStoryTitle,
  newStoryContent,
  setNewStoryContent,
  selectedGenre,
  setSelectedGenre,
  selectedTone,
  setSelectedTone,
  useAI,
  setUseAI,
  isLoading
}) => {
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (branch) {
      setEditedTitle(branch.title);
      setEditedContent(branch.content);
      setWordCount(branch.metadata.wordCount);
    }
  }, [branch]);

  useEffect(() => {
    const words = (branch ? editedContent : newStoryContent).split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [editedContent, newStoryContent, branch]);

  const handleSave = () => {
    if (branch) {
      onSave({
        title: editedTitle,
        content: editedContent,
        metadata: {
          ...branch.metadata,
          wordCount,
          readingTime: Math.ceil(wordCount / 200)
        }
      });
    } else {
      onCreate();
    }
  };

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectedText(textareaRef.current.value.substring(start, end));
      }
    }
  };

  const genres: StoryGenre[] = [
    'fantasy', 'sci-fi', 'mystery', 'thriller', 'romance',
    'horror', 'comedy', 'drama', 'action', 'adventure'
  ];

  const tones: StoryTone[] = [
    'dark', 'light', 'serious', 'humorous', 'satirical',
    'whimsical', 'gritty', 'romantic', 'melancholic', 'hopeful'
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Editor Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={branch ? editedTitle : newStoryTitle}
            onChange={(e) => branch ? setEditedTitle(e.target.value) : setNewStoryTitle(e.target.value)}
            placeholder="Enter story title..."
            className="text-2xl font-light bg-transparent border-none outline-none text-white placeholder-white/30 flex-1"
          />
          
          <div className="flex items-center gap-4">
            {/* Word Count */}
            <div className="text-sm text-white/40">
              <span className="text-white/60">{wordCount}</span> words
            </div>

            {/* AI Toggle */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`p-2 rounded-lg transition-all ${
                showAIPanel ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10'
              }`}
              title="AI Assistant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </button>

            {/* Validation */}
            {branch && (
              <button
                onClick={() => {
                  onValidate();
                  setShowValidation(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                title="Validate"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            )}

            {/* Save/Create Button */}
            <button
              onClick={handleSave}
              disabled={isLoading || (!branch && (!newStoryTitle || !newStoryContent))}
              className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : branch ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        {!branch && (
          <div className="flex items-center gap-4 mt-4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as StoryGenre)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
            >
              {genres.map(g => (
                <option key={g} value={g} className="bg-black">{g}</option>
              ))}
            </select>

            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as StoryTone)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
            >
              {tones.map(t => (
                <option key={t} value={t} className="bg-black">{t}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="rounded"
              />
              <span>Use AI Generation (25 Sparks)</span>
            </label>
          </div>
        )}

        {branch && (
          <div className="flex items-center gap-4 mt-4 text-sm text-white/40">
            <span>Genre: <span className="text-white/60">{branch.metadata.genre}</span></span>
            <span>•</span>
            <span>Tone: <span className="text-white/60">{branch.metadata.tone}</span></span>
            <span>•</span>
            <span>Version: <span className="text-white/60">{branch.version}</span></span>
            <span>•</span>
            <span>Quality: <span className={`${
              branch.continuityState.consistency_score > 80 ? 'text-green-400' :
              branch.continuityState.consistency_score > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>{branch.continuityState.consistency_score}%</span></span>
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={branch ? editedContent : newStoryContent}
            onChange={(e) => branch ? setEditedContent(e.target.value) : setNewStoryContent(e.target.value)}
            onSelect={handleTextSelection}
            placeholder="Begin your story..."
            className="flex-1 p-8 bg-black text-white text-lg leading-relaxed resize-none outline-none placeholder-white/20"
            style={{ fontFamily: 'Georgia, serif' }}
          />

          {/* Editor Footer */}
          <div className="border-t border-white/10 p-4 bg-black/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/40">
                {selectedText && (
                  <span className="text-white/60">
                    Selected: {selectedText.length} characters
                  </span>
                )}
              </div>

              {branch && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onGenerateContinuation}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm transition-all"
                  >
                    Generate Continuation (10 Sparks)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <div className="w-96 border-l border-white/10 bg-black/30 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">AI Assistant</h3>
            
            <div className="space-y-4">
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm text-white/60 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left transition-all">
                    🔄 Rewrite Selected Text
                  </button>
                  <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left transition-all">
                    📝 Expand This Scene
                  </button>
                  <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left transition-all">
                    💭 Add Character Thoughts
                  </button>
                  <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left transition-all">
                    🎭 Generate Dialogue
                  </button>
                  <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-left transition-all">
                    🌍 Describe Setting
                  </button>
                </div>
              </div>

              {/* Style Adjustments */}
              <div>
                <h4 className="text-sm text-white/60 mb-2">Style Adjustments</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Pacing</span>
                    <select className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm">
                      <option>Slow</option>
                      <option>Moderate</option>
                      <option>Fast</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Description Density</span>
                    <input type="range" min="0" max="100" className="w-24"/>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Dialogue Ratio</span>
                    <input type="range" min="0" max="100" className="w-24"/>
                  </label>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-sm text-white/60 mb-2">AI Suggestions</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    💡 Consider adding more sensory details to enhance immersion
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    ⚠️ Character motivation unclear in paragraph 3
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    ✅ Strong opening hook detected
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Panel */}
        {showValidation && validationReport && (
          <div className="w-96 border-l border-white/10 bg-black/30 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Validation Report</h3>
              <button
                onClick={() => setShowValidation(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Overall Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Continuity Score</span>
                <span className={`text-2xl font-bold ${
                  validationReport.continuity_score > 80 ? 'text-green-400' :
                  validationReport.continuity_score > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {validationReport.continuity_score}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    validationReport.continuity_score > 80 ? 'bg-green-400' :
                    validationReport.continuity_score > 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${validationReport.continuity_score}%` }}
                />
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-4">
              {validationReport.consistency_errors.length > 0 && (
                <div>
                  <h4 className="text-sm text-white/60 mb-2">Consistency Issues</h4>
                  <div className="space-y-2">
                    {validationReport.consistency_errors.map((error, i) => (
                      <div key={i} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm">
                        {error.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationReport.plot_holes.length > 0 && (
                <div>
                  <h4 className="text-sm text-white/60 mb-2">Plot Holes</h4>
                  <div className="space-y-2">
                    {validationReport.plot_holes.map((hole, i) => (
                      <div key={i} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                        {hole.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationReport.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm text-white/60 mb-2">Suggestions</h4>
                  <div className="space-y-2">
                    {validationReport.suggestions.map((suggestion, i) => (
                      <div key={i} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
                        {suggestion.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
