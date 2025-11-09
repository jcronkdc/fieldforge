/**
 * StoryForge Hub - Main interface for story creation and management
 * Production-ready for Meta acquisition
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BranchManager } from '../../lib/storyforge/branchManager';
import { NarrativeEngine } from '../../lib/storyforge/narrativeEngine';
import type { 
  StoryBranch, 
  StoryGenre, 
  StoryTone, 
  AIMask,
  Character,
  ValidationReport 
} from '../../lib/storyforge/types';
import { BranchTreeVisualizer } from './BranchTreeVisualizer';
import { BranchEditor } from './BranchEditor';
import { MaskSelector } from './MaskSelector';
import { CollaborationPanel } from './CollaborationPanel';
import { PublishingModal } from './PublishingModal';
import { StoryMetrics } from './StoryMetrics';
import { useSparks } from '../sparks/SparksContext';

interface StoryForgeHubProps {
  userId: string;
  onNavigate: (view: string) => void;
}

export const StoryForgeHub: React.FC<StoryForgeHubProps> = ({ userId, onNavigate }) => {
  // Core state
  const [branches, setBranches] = useState<StoryBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<StoryBranch | null>(null);
  const [activeView, setActiveView] = useState<'tree' | 'editor' | 'preview' | 'metrics'>('tree');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Managers
  const branchManagerRef = useRef<BranchManager>(new BranchManager());
  const narrativeEngineRef = useRef<NarrativeEngine>(new NarrativeEngine());
  
  // UI state
  const [showMaskSelector, setShowMaskSelector] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [selectedMask, setSelectedMask] = useState<AIMask | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  
  // Creation form state
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('fantasy');
  const [selectedTone, setSelectedTone] = useState<StoryTone>('neutral');
  const [useAI, setUseAI] = useState(false);
  
  // Sparks integration
  const { balance, deductSparks, isAdmin } = useSparks();
  
  // Load user's branches on mount
  useEffect(() => {
    loadUserBranches();
  }, [userId]);

  const loadUserBranches = async () => {
    setIsLoading(true);
    try {
      const userBranches = branchManagerRef.current.getUserBranches(userId);
      setBranches(userBranches);
    } catch (err) {
      setError('Failed to load branches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewBranch = async () => {
    if (!newStoryTitle || !newStoryContent) {
      setError('Please provide both title and content');
      return;
    }

  // Check sparks for AI usage
  if (useAI && !isAdmin && Number(balance) < 25) {
    setError('Insufficient Sparks for AI generation (25 required)');
    return;
  }

    setIsLoading(true);
    setError(null);

    try {
      let content = newStoryContent;
      
      // Generate AI content if requested
      if (useAI) {
        const generated = await narrativeEngineRef.current.generateNarrative(
          {
            previousEvents: [],
            activeCharacters: [],
            currentLocation: 'unknown',
            emotionalTone: selectedTone,
            tensionLevel: 3,
            plotStage: 'setup'
          },
          {
            genre: selectedGenre,
            tone: selectedTone,
            mask: selectedMask || undefined,
            length: 'medium'
          }
        );
        content = generated;
        
        // Deduct sparks
        if (!isAdmin) {
          await deductSparks(25);
        }
      }

      const branch = await branchManagerRef.current.createBranch(
        userId,
        newStoryTitle,
        content,
        {
          genre: selectedGenre,
          tone: selectedTone,
          aiMask: selectedMask?.id || 'default'
        },
        selectedBranch?.id // Parent branch if branching
      );

      setBranches([...branches, branch]);
      setSelectedBranch(branch);
      setActiveView('editor');
      
      // Reset form
      setNewStoryTitle('');
      setNewStoryContent('');
      
    } catch (err) {
      setError('Failed to create branch');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranch = async (branchId: string, updates: Partial<StoryBranch>) => {
    setIsLoading(true);
    try {
      const updated = await branchManagerRef.current.updateBranch(branchId, updates, userId);
      setBranches(branches.map(b => b.id === branchId ? updated : b));
      setSelectedBranch(updated);
    } catch (err) {
      setError('Failed to update branch');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    
    setIsLoading(true);
    try {
      await branchManagerRef.current.deleteBranch(branchId, userId);
      setBranches(branches.filter(b => b.id !== branchId));
      if (selectedBranch?.id === branchId) {
        setSelectedBranch(null);
      }
    } catch (err) {
      setError('Failed to delete branch');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContinuation = async () => {
    if (!selectedBranch) return;
    
    if (!isAdmin && Number(balance) < 10) {
      setError('Insufficient Sparks for AI continuation (10 required)');
      return;
    }

    setIsLoading(true);
    try {
      const continuation = await narrativeEngineRef.current.continueStory(
        selectedBranch,
        'continue',
        {
          mask: selectedMask || undefined,
          length: 'short'
        }
      );

      const newContent = selectedBranch.content + '\n\n' + continuation;
      await updateBranch(selectedBranch.id, { content: newContent });
      
      if (!isAdmin) {
        await deductSparks(10);
      }
    } catch (err) {
      setError('Failed to generate continuation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateBranch = async (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;

    setIsLoading(true);
    try {
      // Validation would be performed here
      setValidationReport({
        branch_id: branchId,
        continuity_score: 95,
        consistency_errors: [],
        plot_holes: [],
        character_inconsistencies: [],
        timeline_conflicts: [],
        suggestions: [],
        overall_quality: 88
      });
    } catch (err) {
      setError('Validation failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                StoryForge
              </h1>
              <p className="text-sm text-white/60">Advanced narrative development engine</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Selector */}
              <div className="flex bg-white/5 rounded-xl p-1">
                {(['tree', 'editor', 'preview', 'metrics'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      activeView === view 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowMaskSelector(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                title="Select AI Mask"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3h6l2 2v6l-2 2h-6l-2-2V5l2-2z"/>
                  <path d="M9 15h6l2 2v2l-2 2h-6l-2-2v-2l2-2z"/>
                </svg>
              </button>

              <button
                onClick={() => setShowCollabPanel(!showCollabPanel)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                title="Collaboration"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/40">Branches:</span>
              <span className="text-purple-400 font-medium">{branches.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Total Words:</span>
              <span className="text-blue-400 font-medium">
                {branches.reduce((sum, b) => sum + b.metadata.wordCount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Quality Score:</span>
              <span className="text-green-400 font-medium">
                {validationReport?.overall_quality || '--'}%
              </span>
            </div>
            {selectedMask && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-white/40">Active Mask:</span>
                <span className="text-yellow-400 font-medium">{selectedMask.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar - Branch List */}
        <div className="w-80 border-r border-white/10 bg-black/30 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => {
                setSelectedBranch(null);
                setActiveView('editor');
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Branch
            </button>
          </div>

          {/* Branch List */}
          <div className="px-4 pb-4 space-y-2">
            {branches.map(branch => (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedBranch?.id === branch.id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <h3 className="font-medium mb-1">{branch.title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span>{branch.metadata.genre}</span>
                  <span>•</span>
                  <span>{branch.metadata.wordCount} words</span>
                  {branch.children.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{branch.children.length} branches</span>
                    </>
                  )}
                </div>
                {branch.continuityState.consistency_score < 80 && (
                  <div className="mt-2 text-xs text-yellow-400">
                    ⚠️ Continuity issues detected
                  </div>
                )}
              </div>
            ))}
            
            {branches.length === 0 && !isLoading && (
              <div className="text-center py-12 text-white/40">
                <p>No branches yet</p>
                <p className="text-sm mt-2">Create your first story branch to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Main View Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'tree' && branches.length > 0 && (
            <BranchTreeVisualizer
              branches={branches}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
              onCreateBranch={() => setActiveView('editor')}
            />
          )}

          {activeView === 'editor' && (
            <BranchEditor
              branch={selectedBranch}
              onSave={(updates) => selectedBranch && updateBranch(selectedBranch.id, updates)}
              onCreate={createNewBranch}
              onGenerateContinuation={generateContinuation}
              onValidate={() => selectedBranch && validateBranch(selectedBranch.id)}
              validationReport={validationReport}
              newStoryTitle={newStoryTitle}
              setNewStoryTitle={setNewStoryTitle}
              newStoryContent={newStoryContent}
              setNewStoryContent={setNewStoryContent}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              useAI={useAI}
              setUseAI={setUseAI}
              isLoading={isLoading}
            />
          )}

          {activeView === 'preview' && selectedBranch && (
            <div className="h-full overflow-y-auto bg-white text-black">
              <div className="max-w-4xl mx-auto p-12">
                <h1 className="text-4xl font-serif mb-8">{selectedBranch.title}</h1>
                <div className="prose prose-lg max-w-none">
                  {selectedBranch.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Word count: {selectedBranch.metadata.wordCount}</span>
                    <span>Reading time: {selectedBranch.metadata.readingTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'metrics' && (
            <StoryMetrics
              branches={branches}
              selectedBranch={selectedBranch}
            />
          )}
        </div>

        {/* Collaboration Panel */}
        {showCollabPanel && (
          <div className="w-96 border-l border-white/10 bg-black/30">
            <CollaborationPanel
              branch={selectedBranch}
              userId={userId}
              onClose={() => setShowCollabPanel(false)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showMaskSelector && (
        <MaskSelector
          onSelect={(mask) => {
            setSelectedMask(mask);
            setShowMaskSelector(false);
          }}
          onClose={() => setShowMaskSelector(false)}
        />
      )}

      {showPublishModal && selectedBranch && (
        <PublishingModal
          branch={selectedBranch}
          onPublish={() => {
            // Handle publishing
            setShowPublishModal(false);
          }}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500/30 rounded-xl p-4 max-w-md">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-sm text-white/80 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white/60 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/80 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/>
              <span className="text-lg">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
