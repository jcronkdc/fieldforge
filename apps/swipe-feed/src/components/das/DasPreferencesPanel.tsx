import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { 
  getUserAdPreferences, 
  updateUserAdPreferences,
  type DasUserPreferences 
} from "../../lib/dasApi";
import { PLATFORM_NAMES } from "../../config/naming";

const AD_TYPES = [
  { value: 'quest', label: '🗺️ Quests', description: 'Story-driven missions' },
  { value: 'mini_game', label: '🎮 Mini Games', description: 'Quick interactive games' },
  { value: 'puzzle', label: '🧩 Puzzles', description: 'Brain teasers and challenges' },
  { value: 'poll', label: '📊 Polls', description: 'Share your opinion' },
  { value: 'story', label: '📖 Stories', description: 'Narrative experiences' },
  { value: 'challenge', label: '⚡ Challenges', description: 'Skill-based tasks' }
];

const PRIVACY_LEVELS = [
  { 
    value: 'minimal' as const, 
    label: 'Minimal Privacy',
    description: 'Basic protection, more personalized ads'
  },
  { 
    value: 'standard' as const, 
    label: 'Standard Privacy',
    description: 'Balanced privacy and personalization'
  },
  { 
    value: 'maximum' as const, 
    label: 'Maximum Privacy',
    description: 'Maximum protection, generic ads only'
  }
];

export function DasPreferencesPanel() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Partial<DasUserPreferences>>({
    opt_in_ads: false,
    preferred_ad_types: [],
    blocked_brands: [],
    max_daily_ads: 5,
    preferred_difficulty: 2,
    auto_skip_after_seconds: 30,
    share_analytics: false,
    receive_vote_notifications: true,
    payout_preferences: { method: 'sparks', auto_convert: false },
    privacy_level: 'standard'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user]);

  async function loadPreferences() {
    if (!user?.id) return;
    
    try {
      const prefs = await getUserAdPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load ad preferences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    if (!user?.id) return;
    
    setSaving(true);
    setMessage("");
    
    try {
      await updateUserAdPreferences(user.id, preferences);
      setMessage("✅ Preferences saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setMessage("❌ Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  function toggleAdType(type: string) {
    setPreferences(prev => ({
      ...prev,
      preferred_ad_types: prev.preferred_ad_types?.includes(type)
        ? prev.preferred_ad_types.filter(t => t !== type)
        : [...(prev.preferred_ad_types || []), type]
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Democratic Ad System (DAS) Preferences</h2>
        
        {/* Main Opt-In Toggle */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Participate in DAS</h3>
              <p className="text-sm text-gray-600 mt-1">
                Earn {PLATFORM_NAMES.currency} by engaging with community-approved ads
              </p>
              <p className="text-sm text-purple-600 font-semibold mt-2">
                💰 40% of ad revenue goes to creators & users • 10% to charity!
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.opt_in_ads}
                onChange={(e) => setPreferences(prev => ({ ...prev, opt_in_ads: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          {preferences.opt_in_ads && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>You're now part of the democratic ad ecosystem!</strong> You can:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Vote on which brands can advertise</li>
                <li>• Earn {PLATFORM_NAMES.currency} from ad engagement</li>
                <li>• Receive profit-sharing payouts</li>
                <li>• Shape the advertising experience for everyone</li>
              </ul>
            </div>
          )}
        </div>

        {preferences.opt_in_ads && (
          <>
            {/* Ad Type Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Preferred Ad Types</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the types of interactive ads you'd like to see
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AD_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => toggleAdType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.preferred_ad_types?.includes(type.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Settings */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Daily Ads
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={preferences.max_daily_ads}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    max_daily_ads: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {preferences.max_daily_ads} ads per day
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Difficulty
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={preferences.preferred_difficulty}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    preferred_difficulty: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  Level {preferences.preferred_difficulty} 
                  {preferences.preferred_difficulty === 1 && ' (Easy)'}
                  {preferences.preferred_difficulty === 2 && ' (Normal)'}
                  {preferences.preferred_difficulty === 3 && ' (Medium)'}
                  {preferences.preferred_difficulty === 4 && ' (Hard)'}
                  {preferences.preferred_difficulty === 5 && ' (Expert)'}
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Privacy Level</h3>
              <div className="space-y-2">
                {PRIVACY_LEVELS.map(level => (
                  <label
                    key={level.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      preferences.privacy_level === level.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy_level"
                      value={level.value}
                      checked={preferences.privacy_level === level.value}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        privacy_level: e.target.value as any
                      }))}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payout Preferences */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Payout Method</h3>
              <select
                value={preferences.payout_preferences?.method}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  payout_preferences: {
                    ...prev.payout_preferences!,
                    method: e.target.value as any
                  }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="sparks">{PLATFORM_NAMES.currency}</option>
                <option value="credits">Platform Credits</option>
                <option value="cash">Cash (Coming Soon)</option>
                <option value="donation">Donate to Charity</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.share_analytics}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    share_analytics: e.target.checked 
                  }))}
                  className="mr-3"
                />
                <span className="text-sm">
                  Share anonymized analytics to improve ad quality
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.receive_vote_notifications}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    receive_vote_notifications: e.target.checked 
                  }))}
                  className="mr-3"
                />
                <span className="text-sm">
                  Notify me about new ad proposals to vote on
                </span>
              </label>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {message}
          </div>
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          How the Democratic Ad System Works
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>1. Community Voting:</strong> Users vote on which brands can advertise
          </li>
          <li>
            <strong>2. Interactive Ads:</strong> Ads are games, quests, and stories - never intrusive
          </li>
          <li>
            <strong>3. Revenue Sharing:</strong> 50% platform, 40% creators/users, 10% charity
          </li>
          <li>
            <strong>4. Transparency:</strong> All revenue and payouts are publicly auditable
          </li>
          <li>
            <strong>5. User Control:</strong> You decide everything about your ad experience
          </li>
        </ul>
      </div>
    </div>
  );
}
