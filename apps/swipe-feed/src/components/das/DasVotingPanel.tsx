import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  getCurrentVotingCycle,
  listProposals,
  castVote,
  getUserVotes,
  type DasProposal,
  type DasVotingCycle,
  type DasVote
} from "../../lib/dasApi";
import { formatDistanceToNow } from "../../lib/utils";

export function DasVotingPanel() {
  const { user } = useAuth();
  const [currentCycle, setCurrentCycle] = useState<DasVotingCycle | null>(null);
  const [proposals, setProposals] = useState<DasProposal[]>([]);
  const [userVotes, setUserVotes] = useState<DasVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<DasProposal | null>(null);
  const [voteForm, setVoteForm] = useState({
    voteType: 'approve' as 'approve' | 'reject' | 'abstain',
    feedback: '',
    ethicalConcerns: ''
  });
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadVotingData();
  }, [user]);

  async function loadVotingData() {
    if (!user?.id) return;
    
    try {
      const [cycle, votes] = await Promise.all([
        getCurrentVotingCycle(),
        getUserVotes(user.id)
      ]);
      
      setCurrentCycle(cycle);
      setUserVotes(votes);
      
      if (cycle) {
        const props = await listProposals(cycle.id, 'voting');
        setProposals(props);
      }
    } catch (error) {
      console.error("Failed to load voting data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitVote() {
    if (!selectedProposal || !user?.id) return;
    
    setVoting(true);
    try {
      await castVote({
        proposalId: selectedProposal.id,
        voteType: voteForm.voteType,
        feedback: voteForm.feedback || undefined,
        ethicalConcerns: voteForm.ethicalConcerns || undefined
      });
      
      // Reload data
      await loadVotingData();
      
      // Reset form
      setSelectedProposal(null);
      setVoteForm({
        voteType: 'approve',
        feedback: '',
        ethicalConcerns: ''
      });
    } catch (error: any) {
      console.error("Failed to cast vote:", error);
      alert(error.message || "Failed to cast vote");
    } finally {
      setVoting(false);
    }
  }

  function hasVoted(proposalId: string): boolean {
    return userVotes.some(v => v.proposal_id === proposalId);
  }

  function getVoteType(proposalId: string): string | undefined {
    return userVotes.find(v => v.proposal_id === proposalId)?.vote_type;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentCycle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Active Voting Cycle</h3>
          <p className="text-gray-600">
            Check back soon for the next voting cycle!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Voting Cycle Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{currentCycle.cycle_name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-sm opacity-90">Voting Ends</div>
            <div className="font-semibold">
              {formatDistanceToNow(new Date(currentCycle.end_date))}
            </div>
          </div>
          <div>
            <div className="text-sm opacity-90">Proposals</div>
            <div className="font-semibold">{proposals.length}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Approval Threshold</div>
            <div className="font-semibold">{currentCycle.approval_threshold}%</div>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.map(proposal => {
          const voted = hasVoted(proposal.id);
          const voteType = getVoteType(proposal.id);
          const approvalRate = proposal.total_votes 
            ? Math.round((proposal.approve_votes! / proposal.total_votes) * 100)
            : 0;

          return (
            <div
              key={proposal.id}
              className={`bg-white rounded-xl shadow-lg p-6 ${
                voted ? 'border-2 border-green-500' : ''
              }`}
            >
              {/* Brand & Campaign Info */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{proposal.campaign_name}</h3>
                    <p className="text-sm text-gray-600">{proposal.company_name}</p>
                  </div>
                  {proposal.reputation_score && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Reputation</div>
                      <div className="flex items-center">
                        {"⭐".repeat(Math.floor(proposal.reputation_score))}
                        <span className="ml-1 text-sm">
                          {proposal.reputation_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {proposal.campaign_description}
                </p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="ml-1 font-medium">${proposal.proposed_budget}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-1 font-medium">{proposal.campaign_duration_days} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Revenue Share:</span>
                  <span className="ml-1 font-medium">{proposal.revenue_share_percentage}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Votes:</span>
                  <span className="ml-1 font-medium">{proposal.total_votes || 0}</span>
                </div>
              </div>

              {/* Voting Progress */}
              {proposal.total_votes! > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Approval Rate</span>
                    <span className={approvalRate >= currentCycle.approval_threshold ? 'text-green-600' : 'text-gray-600'}>
                      {approvalRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        approvalRate >= currentCycle.approval_threshold
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Interactive Elements */}
              {proposal.interactive_elements && proposal.interactive_elements.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Interactive Elements:</div>
                  <div className="flex flex-wrap gap-1">
                    {proposal.interactive_elements.map((elem: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                      >
                        {elem.type || elem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {voted ? (
                  <div className="flex-1 text-center py-2 px-4 bg-green-50 text-green-700 rounded-lg">
                    ✅ Voted: {voteType}
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={() => setSelectedProposal(proposal)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Cast Vote
                    </Button>
                    <Button
                      onClick={() => {
                        // Show detailed view
                        alert(`Full details:\n\nEthical Disclosure:\n${proposal.ethical_disclosure}\n\nCreative Concept:\n${proposal.creative_concept}\n\nLore Integration:\n${proposal.lore_integration_plan || 'Not specified'}`);
                      }}
                      className="bg-gray-200 hover:bg-gray-300"
                    >
                      Details
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voting Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-4">
              Vote on: {selectedProposal.campaign_name}
            </h3>

            {/* Vote Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Vote</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVoteForm(prev => ({ ...prev, voteType: 'approve' }))}
                  className={`p-3 rounded-lg border-2 ${
                    voteForm.voteType === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">👍</div>
                  <div className="text-sm">Approve</div>
                </button>
                <button
                  onClick={() => setVoteForm(prev => ({ ...prev, voteType: 'reject' }))}
                  className={`p-3 rounded-lg border-2 ${
                    voteForm.voteType === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">👎</div>
                  <div className="text-sm">Reject</div>
                </button>
                <button
                  onClick={() => setVoteForm(prev => ({ ...prev, voteType: 'abstain' }))}
                  className={`p-3 rounded-lg border-2 ${
                    voteForm.voteType === 'abstain'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🤷</div>
                  <div className="text-sm">Abstain</div>
                </button>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={voteForm.feedback}
                onChange={(e) => setVoteForm(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Share your thoughts on this proposal..."
              />
            </div>

            {/* Ethical Concerns */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Ethical Concerns (Optional)
              </label>
              <textarea
                value={voteForm.ethicalConcerns}
                onChange={(e) => setVoteForm(prev => ({ ...prev, ethicalConcerns: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Any ethical issues to flag?"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedProposal(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={submitVote}
                disabled={voting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {voting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
