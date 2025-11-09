/**
 * Story Metrics - Analytics and insights for story performance
 */

import React, { useMemo } from 'react';
import type { StoryBranch } from '../../lib/storyforge/types';

interface StoryMetricsProps {
  branches: StoryBranch[];
  selectedBranch: StoryBranch | null;
}

export const StoryMetrics: React.FC<StoryMetricsProps> = ({
  branches,
  selectedBranch
}) => {
  const metrics = useMemo(() => {
    const totalWords = branches.reduce((sum, b) => sum + b.metadata.wordCount, 0);
    const avgWords = branches.length > 0 ? Math.round(totalWords / branches.length) : 0;
    const totalReadingTime = branches.reduce((sum, b) => sum + b.metadata.readingTime, 0);
    const avgQuality = branches.length > 0 
      ? Math.round(branches.reduce((sum, b) => sum + b.continuityState.consistency_score, 0) / branches.length)
      : 0;
    
    const genreDistribution = branches.reduce((acc, b) => {
      acc[b.metadata.genre] = (acc[b.metadata.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const toneDistribution = branches.reduce((acc, b) => {
      acc[b.metadata.tone] = (acc[b.metadata.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const complexityDistribution = branches.reduce((acc, b) => {
      acc[b.metadata.complexity] = (acc[b.metadata.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timelineData = branches.map(b => ({
      date: new Date(b.createdAt).toLocaleDateString(),
      words: b.metadata.wordCount,
      quality: b.continuityState.consistency_score
    }));

    return {
      totalBranches: branches.length,
      totalWords,
      avgWords,
      totalReadingTime,
      avgQuality,
      genreDistribution,
      toneDistribution,
      complexityDistribution,
      timelineData
    };
  }, [branches]);

  const getMaxValue = (distribution: Record<string, number>) => {
    return Math.max(...Object.values(distribution), 1);
  };

  return (
    <div className="h-full overflow-y-auto bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {metrics.totalBranches}
            </div>
            <div className="text-sm text-white/60">Total Branches</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {metrics.totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-white/60">Total Words</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {metrics.avgQuality}%
            </div>
            <div className="text-sm text-white/60">Avg Quality Score</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {metrics.totalReadingTime}
            </div>
            <div className="text-sm text-white/60">Total Reading Time (min)</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Genre Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Genre Distribution</h3>
            <div className="space-y-3">
              {Object.entries(metrics.genreDistribution).map(([genre, count]) => (
                <div key={genre}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{genre}</span>
                    <span className="text-sm text-white/60">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${(count / getMaxValue(metrics.genreDistribution)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(metrics.genreDistribution).length === 0 && (
                <p className="text-white/40 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Tone Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Tone Distribution</h3>
            <div className="space-y-3">
              {Object.entries(metrics.toneDistribution).map(([tone, count]) => (
                <div key={tone}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{tone}</span>
                    <span className="text-sm text-white/60">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${(count / getMaxValue(metrics.toneDistribution)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(metrics.toneDistribution).length === 0 && (
                <p className="text-white/40 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Complexity Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Complexity Distribution</h3>
            <div className="space-y-3">
              {Object.entries(metrics.complexityDistribution).map(([complexity, count]) => (
                <div key={complexity}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{complexity}</span>
                    <span className="text-sm text-white/60">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${(count / getMaxValue(metrics.complexityDistribution)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(metrics.complexityDistribution).length === 0 && (
                <p className="text-white/40 text-sm">No data available</p>
              )}
            </div>
          </div>

          {/* Writing Activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {branches.slice(-5).reverse().map(branch => (
                <div key={branch.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{branch.title}</p>
                    <p className="text-xs text-white/40">
                      {new Date(branch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">{branch.metadata.wordCount} words</p>
                    <p className="text-xs text-white/40">{branch.metadata.genre}</p>
                  </div>
                </div>
              ))}
              {branches.length === 0 && (
                <p className="text-white/40 text-sm">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Selected Branch Details */}
        {selectedBranch && (
          <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Selected Branch: {selectedBranch.title}</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-white/60 mb-1">Word Count</p>
                <p className="text-xl font-medium">{selectedBranch.metadata.wordCount}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Quality Score</p>
                <p className="text-xl font-medium">{selectedBranch.continuityState.consistency_score}%</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Child Branches</p>
                <p className="text-xl font-medium">{selectedBranch.children.length}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">Version</p>
                <p className="text-xl font-medium">v{selectedBranch.version}</p>
              </div>
            </div>

            {/* Character Count */}
            <div className="mt-6">
              <p className="text-sm text-white/60 mb-2">Characters</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedBranch.dynamicVariables.characters.values()).map(char => (
                  <span key={char.id} className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                    {char.name}
                  </span>
                ))}
                {selectedBranch.dynamicVariables.characters.size === 0 && (
                  <span className="text-white/40 text-sm">No characters defined</span>
                )}
              </div>
            </div>

            {/* Plot Threads */}
            <div className="mt-6">
              <p className="text-sm text-white/60 mb-2">Active Plot Threads</p>
              <div className="space-y-2">
                {selectedBranch.continuityState.plotThreads.map(thread => (
                  <div key={thread.id} className="flex items-center justify-between">
                    <span className="text-sm">{thread.description}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      thread.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      thread.status === 'developing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {thread.status}
                    </span>
                  </div>
                ))}
                {selectedBranch.continuityState.plotThreads.length === 0 && (
                  <span className="text-white/40 text-sm">No plot threads</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
