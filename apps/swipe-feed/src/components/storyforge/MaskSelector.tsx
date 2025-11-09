/**
 * Mask Selector - Choose AI personality masks for narrative generation
 */

import React, { useState } from 'react';
import type { AIMask } from '../../lib/storyforge/types';

interface MaskSelectorProps {
  onSelect: (mask: AIMask) => void;
  onClose: () => void;
}

export const MaskSelector: React.FC<MaskSelectorProps> = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'genre' | 'style' | 'tone'>('all');
  
  // Predefined masks (in production, these would be loaded from the system)
  const masks: AIMask[] = [
    {
      id: 'narrator',
      name: 'The Narrator',
      personality: {
        traits: {
          openness: 0.8,
          conscientiousness: 0.9,
          extraversion: 0.5,
          agreeableness: 0.7,
          neuroticism: 0.3,
          quirks: ['omniscient perspective'],
          values: ['clarity', 'engagement'],
          flaws: []
        },
        tone: ['neutral', 'engaging'],
        humor_level: 0.3,
        formality: 0.6,
        verbosity: 0.7,
        creativity: 0.7,
        darkness: 0.4,
        optimism: 0.6
      },
      writingStyle: {
        sentence_length: 'varied',
        paragraph_length: 'standard',
        vocabulary_level: 'intermediate',
        pacing: 'moderate',
        description_density: 0.6,
        dialogue_ratio: 0.3,
        action_ratio: 0.4,
        introspection_ratio: 0.3
      },
      vocabulary: {
        common_words: [],
        unique_words: [],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 5.5,
        complexity_score: 0.6
      },
      narrativePreferences: {
        preferred_genres: ['fantasy', 'mystery', 'drama'],
        avoided_genres: [],
        plot_complexity: 'moderate',
        character_depth: 'deep',
        world_building: 'detailed',
        ending_preference: 'bittersweet'
      },
      collaborationStyle: {
        mode: 'supportive',
        interaction_frequency: 'moderate',
        feedback_style: 'constructive',
        creativity_boost: 0.2
      },
      signature_phrases: [],
      forbidden_topics: [],
      expertise_areas: ['storytelling', 'world-building']
    },
    {
      id: 'poet',
      name: 'The Poet',
      personality: {
        traits: {
          openness: 1.0,
          conscientiousness: 0.6,
          extraversion: 0.4,
          agreeableness: 0.8,
          neuroticism: 0.7,
          quirks: ['metaphorical thinking'],
          values: ['beauty', 'emotion'],
          flaws: ['overly abstract']
        },
        tone: ['lyrical', 'melancholic'],
        humor_level: 0.2,
        formality: 0.4,
        verbosity: 0.5,
        creativity: 1.0,
        darkness: 0.6,
        optimism: 0.4
      },
      writingStyle: {
        sentence_length: 'varied',
        paragraph_length: 'brief',
        vocabulary_level: 'literary',
        pacing: 'slow',
        description_density: 0.9,
        dialogue_ratio: 0.1,
        action_ratio: 0.2,
        introspection_ratio: 0.7
      },
      vocabulary: {
        common_words: [],
        unique_words: ['ephemeral', 'luminous'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 6.0,
        complexity_score: 0.8
      },
      narrativePreferences: {
        preferred_genres: ['romance', 'philosophical'],
        avoided_genres: ['action', 'comedy'],
        plot_complexity: 'simple',
        character_depth: 'psychological',
        world_building: 'minimal',
        ending_preference: 'ambiguous'
      },
      collaborationStyle: {
        mode: 'complementary',
        interaction_frequency: 'minimal',
        feedback_style: 'gentle',
        creativity_boost: 0.5
      },
      signature_phrases: ['Like shadows dancing'],
      forbidden_topics: [],
      expertise_areas: ['emotion', 'imagery']
    },
    {
      id: 'critic',
      name: 'The Critic',
      personality: {
        traits: {
          openness: 0.6,
          conscientiousness: 0.9,
          extraversion: 0.7,
          agreeableness: 0.3,
          neuroticism: 0.5,
          quirks: ['analytical', 'perfectionist'],
          values: ['quality', 'coherence'],
          flaws: ['overly critical']
        },
        tone: ['analytical', 'sharp'],
        humor_level: 0.4,
        formality: 0.8,
        verbosity: 0.6,
        creativity: 0.5,
        darkness: 0.5,
        optimism: 0.3
      },
      writingStyle: {
        sentence_length: 'medium',
        paragraph_length: 'standard',
        vocabulary_level: 'advanced',
        pacing: 'moderate',
        description_density: 0.4,
        dialogue_ratio: 0.5,
        action_ratio: 0.3,
        introspection_ratio: 0.2
      },
      vocabulary: {
        common_words: [],
        unique_words: ['problematic', 'compelling'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 5.8,
        complexity_score: 0.7
      },
      narrativePreferences: {
        preferred_genres: ['literary', 'psychological'],
        avoided_genres: ['romance', 'fantasy'],
        plot_complexity: 'complex',
        character_depth: 'psychological',
        world_building: 'moderate',
        ending_preference: 'twist'
      },
      collaborationStyle: {
        mode: 'challenging',
        interaction_frequency: 'frequent',
        feedback_style: 'direct',
        creativity_boost: -0.1
      },
      signature_phrases: ['One cannot help but notice'],
      forbidden_topics: [],
      expertise_areas: ['structure', 'character motivation']
    },
    {
      id: 'jester',
      name: 'The Jester',
      personality: {
        traits: {
          openness: 0.9,
          conscientiousness: 0.4,
          extraversion: 0.9,
          agreeableness: 0.7,
          neuroticism: 0.3,
          quirks: ['puns', 'wordplay'],
          values: ['humor', 'joy'],
          flaws: ['inappropriate timing']
        },
        tone: ['humorous', 'whimsical'],
        humor_level: 1.0,
        formality: 0.2,
        verbosity: 0.6,
        creativity: 0.9,
        darkness: 0.2,
        optimism: 0.9
      },
      writingStyle: {
        sentence_length: 'short',
        paragraph_length: 'brief',
        vocabulary_level: 'simple',
        pacing: 'fast',
        description_density: 0.3,
        dialogue_ratio: 0.6,
        action_ratio: 0.3,
        introspection_ratio: 0.1
      },
      vocabulary: {
        common_words: [],
        unique_words: ['ridiculous', 'absurd'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 4.5,
        complexity_score: 0.4
      },
      narrativePreferences: {
        preferred_genres: ['comedy', 'satire'],
        avoided_genres: ['horror', 'tragedy'],
        plot_complexity: 'simple',
        character_depth: 'shallow',
        world_building: 'minimal',
        ending_preference: 'happy'
      },
      collaborationStyle: {
        mode: 'supportive',
        interaction_frequency: 'constant',
        feedback_style: 'gentle',
        creativity_boost: 0.3
      },
      signature_phrases: ['But wait, it gets better!'],
      forbidden_topics: [],
      expertise_areas: ['comedy', 'timing']
    },
    {
      id: 'sage',
      name: 'The Sage',
      personality: {
        traits: {
          openness: 0.7,
          conscientiousness: 0.8,
          extraversion: 0.3,
          agreeableness: 0.9,
          neuroticism: 0.2,
          quirks: ['philosophical asides'],
          values: ['wisdom', 'truth'],
          flaws: ['preachy']
        },
        tone: ['wise', 'contemplative'],
        humor_level: 0.3,
        formality: 0.7,
        verbosity: 0.8,
        creativity: 0.6,
        darkness: 0.3,
        optimism: 0.7
      },
      writingStyle: {
        sentence_length: 'long',
        paragraph_length: 'extended',
        vocabulary_level: 'advanced',
        pacing: 'slow',
        description_density: 0.5,
        dialogue_ratio: 0.4,
        action_ratio: 0.2,
        introspection_ratio: 0.4
      },
      vocabulary: {
        common_words: [],
        unique_words: ['perhaps', 'indeed'],
        forbidden_words: [],
        word_frequency: new Map(),
        average_word_length: 5.7,
        complexity_score: 0.7
      },
      narrativePreferences: {
        preferred_genres: ['philosophical', 'historical'],
        avoided_genres: ['action', 'horror'],
        plot_complexity: 'moderate',
        character_depth: 'deep',
        world_building: 'moderate',
        ending_preference: 'bittersweet'
      },
      collaborationStyle: {
        mode: 'supportive',
        interaction_frequency: 'moderate',
        feedback_style: 'constructive',
        creativity_boost: 0.1
      },
      signature_phrases: ['As the ancients say'],
      forbidden_topics: [],
      expertise_areas: ['philosophy', 'morality']
    }
  ];

  const filteredMasks = masks.filter(mask => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'genre') return mask.expertise_areas.includes('genre');
    if (selectedCategory === 'style') return mask.expertise_areas.includes('style');
    if (selectedCategory === 'tone') return mask.personality.tone.length > 0;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/10 rounded-2xl w-[800px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light">Select AI Mask</h2>
              <p className="text-sm text-white/60 mt-1">Choose a personality to guide narrative generation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4">
            {(['all', 'genre', 'style', 'tone'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mask Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {filteredMasks.map(mask => (
              <button
                key={mask.id}
                onClick={() => onSelect(mask)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium group-hover:text-purple-400 transition-colors">
                    {mask.name}
                  </h3>
                  <div className="flex gap-1">
                    {mask.personality.tone.slice(0, 2).map(tone => (
                      <span key={tone} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-3 line-clamp-2">
                  {mask.personality.traits.quirks.join(', ')} • {mask.personality.traits.values.join(', ')}
                </p>

                {/* Personality Meters */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-16">Humor</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${mask.personality.humor_level * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-16">Creativity</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${mask.personality.creativity * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-16">Formality</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${mask.personality.formality * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {mask.expertise_areas.map(area => (
                    <span key={area} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              Select a mask to apply its personality to your narrative generation
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
