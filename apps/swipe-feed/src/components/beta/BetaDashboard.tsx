/**
 * Beta Dashboard Component
 * Shows beta tester stats, daily bonus, and leaderboard
 */

import { useState, useEffect } from "react";
import { Sparkles, Trophy, Calendar, Users, TrendingUp, Gift, Hash } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface BetaUserInfo {
  userId: string;
  betaNumber: number;
  joinedAt: string;
  referralCode: string;
  totalSparksEarned: number;
  totalSparksSpent: number;
  activityScore: number;
  isVip: boolean;
}

interface LeaderboardEntry {
  display_name: string;
  username: string;
  beta_number: number;
  total_sparks_earned: number;
  activity_score: number;
  is_vip: boolean;
}

export function BetaDashboard() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<BetaUserInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadBetaInfo();
      loadLeaderboard();
    }
  }, [user?.id]);

  const loadBetaInfo = async () => {
    if (!user?.id) return;
    
    try {
      const info = await apiRequest<BetaUserInfo>(`/api/beta/user/${user.id}`);
      setUserInfo(info);
    } catch (error) {
      console.error("Error loading beta info:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiRequest<LeaderboardEntry[]>("/api/beta/leaderboard");
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  };

  const claimDailyBonus = async () => {
    if (!user?.id || bonusClaimed) return;
    
    try {
      const response = await apiRequest<{ success: boolean; bonusAmount: number; message: string }>(
        "/api/beta/daily-bonus",
        {
          method: "POST",
          body: { userId: user.id }
        }
      );
      
      if (response.success) {
        setBonusClaimed(true);
        setBonusAmount(response.bonusAmount);
        // Refresh user info to show updated balance
        loadBetaInfo();
      }
    } catch (error) {
      console.error("Error claiming bonus:", error);
    }
  };

  const copyReferralCode = () => {
    if (!userInfo?.referralCode) return;
    
    const referralUrl = `${window.location.origin}?ref=${userInfo.referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setReferralCopied(true);
    
    setTimeout(() => setReferralCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-purple-500/20 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-purple-500/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <div className="space-y-6">
      {/* Beta Tester Badge */}
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Hash className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Beta Tester #{userInfo.betaNumber}</h3>
              <p className="text-purple-300 text-sm">Member since {new Date(userInfo.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>
          {userInfo.isVip && (
            <div className="px-3 py-1 bg-yellow-500/20 rounded-full">
              <span className="text-yellow-400 text-sm font-semibold">VIP</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">Earned</span>
            </div>
            <div className="text-xl font-bold text-white">{userInfo.totalSparksEarned.toFixed(0)}</div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-purple-300">Activity</span>
            </div>
            <div className="text-xl font-bold text-white">{userInfo.activityScore}</div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-purple-300">Rank</span>
            </div>
            <div className="text-xl font-bold text-white">
              #{leaderboard.findIndex(u => u.beta_number === userInfo.betaNumber) + 1 || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Daily Login Bonus</h3>
              <p className="text-green-300 text-sm">
                {bonusClaimed ? `You earned ${bonusAmount} Sparks today!` : "Claim your free Sparks!"}
              </p>
            </div>
          </div>
          <button
            onClick={claimDailyBonus}
            disabled={bonusClaimed}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              bonusClaimed
                ? "bg-green-900/30 text-green-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-500"
            }`}
          >
            {bonusClaimed ? "Claimed ✓" : "Claim Bonus"}
          </button>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Invite Friends</h3>
              <p className="text-indigo-300 text-sm">Both get 100 bonus Sparks!</p>
            </div>
          </div>
          <button
            onClick={copyReferralCode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all"
          >
            {referralCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        <div className="mt-3 p-3 bg-black/30 rounded-lg">
          <code className="text-indigo-300 text-sm break-all">
            {window.location.origin}?ref={userInfo.referralCode}
          </code>
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Top Beta Testers</h3>
        </div>
        
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <div
              key={entry.beta_number}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.beta_number === userInfo.betaNumber
                  ? "bg-purple-500/20 border border-purple-500/40"
                  : "bg-black/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  index === 1 ? "bg-gray-400/20 text-gray-300" :
                  index === 2 ? "bg-orange-600/20 text-orange-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {entry.display_name || entry.username}
                    {entry.is_vip && <span className="ml-2 text-xs text-yellow-400">VIP</span>}
                  </div>
                  <div className="text-xs text-purple-300">Beta #{entry.beta_number}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{entry.activity_score}</div>
                <div className="text-xs text-purple-300">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
