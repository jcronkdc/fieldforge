/**
 * Publishing Modal - Publish stories to public realms
 */

import React, { useState } from 'react';
import type { StoryBranch } from '../../lib/storyforge/types';

interface PublishingModalProps {
  branch: StoryBranch;
  onPublish: () => void;
  onClose: () => void;
}

export const PublishingModal: React.FC<PublishingModalProps> = ({
  branch,
  onPublish,
  onClose
}) => {
  const [publishTo, setPublishTo] = useState<'public' | 'realm' | 'private'>('public');
  const [selectedRealm, setSelectedRealm] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [contentRating, setContentRating] = useState(branch.metadata.contentRating);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [allowRemix, setAllowRemix] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handlePublish = () => {
    // Publishing logic would go here
    onPublish();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/10 rounded-2xl w-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light">Publish Story</h2>
              <p className="text-sm text-white/60 mt-1">{branch.title}</p>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Publishing Destination */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Publish To</label>
            <div className="grid grid-cols-3 gap-2">
              {(['public', 'realm', 'private'] as const).map(dest => (
                <button
                  key={dest}
                  onClick={() => setPublishTo(dest)}
                  className={`px-4 py-3 rounded-lg border transition-all capitalize ${
                    publishTo === dest
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {dest === 'public' && '🌍 '}
                  {dest === 'realm' && '🏰 '}
                  {dest === 'private' && '🔒 '}
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Realm Selection */}
          {publishTo === 'realm' && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Select Realm</label>
              <select
                value={selectedRealm}
                onChange={(e) => setSelectedRealm(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <option value="">Choose a realm...</option>
                <option value="fantasy-writers">Fantasy Writers Guild</option>
                <option value="scifi-collective">Sci-Fi Collective</option>
                <option value="romance-realm">Romance Realm</option>
                <option value="horror-house">Horror House</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of your story..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="hover:text-purple-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Content Rating */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Content Rating</label>
            <div className="grid grid-cols-4 gap-2">
              {(['E', 'T', 'M', 'R'] as const).map(rating => (
                <button
                  key={rating}
                  onClick={() => setContentRating(rating)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    contentRating === rating
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{rating}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {rating === 'E' && 'Everyone'}
                    {rating === 'T' && 'Teen'}
                    {rating === 'M' && 'Mature'}
                    {rating === 'R' && 'Restricted'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Cover Image (Optional)</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Enter image URL..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            />
          </div>

          {/* Publishing Options */}
          <div>
            <label className="block text-sm text-white/60 mb-3">Publishing Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allowRemix}
                  onChange={(e) => setAllowRemix(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="text-sm">Allow Remixing</div>
                  <div className="text-xs text-white/40">Others can create branches from your story</div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="text-sm">Allow Comments</div>
                  <div className="text-xs text-white/40">Readers can leave feedback</div>
                </div>
              </label>
            </div>
          </div>

          {/* Royalty Settings */}
          {allowRemix && (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Royalty Percentage for Remixes
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">{royaltyPercentage}%</span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                You'll receive this percentage of Sparks earned from remixes
              </p>
            </div>
          )}

          {/* Preview Stats */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm text-white/60 mb-3">Story Statistics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/40">Word Count:</span>
                <span className="ml-2 text-white/80">{branch.metadata.wordCount}</span>
              </div>
              <div>
                <span className="text-white/40">Reading Time:</span>
                <span className="ml-2 text-white/80">{branch.metadata.readingTime} min</span>
              </div>
              <div>
                <span className="text-white/40">Genre:</span>
                <span className="ml-2 text-white/80">{branch.metadata.genre}</span>
              </div>
              <div>
                <span className="text-white/40">Quality Score:</span>
                <span className="ml-2 text-white/80">{branch.continuityState.consistency_score}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/40">
              {publishTo === 'public' && '🌍 Your story will be visible to everyone'}
              {publishTo === 'realm' && '🏰 Your story will be shared with realm members'}
              {publishTo === 'private' && '🔒 Your story will remain private'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
