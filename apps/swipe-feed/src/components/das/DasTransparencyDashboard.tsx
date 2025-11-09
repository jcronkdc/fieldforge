import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDashboardStats,
  getTransparencyReport,
  getUserPayouts,
  getRevenueStats,
  verifyAuditChain,
  type DasDashboardStats,
  type DasTransparencyReport,
  type DasUserPayout
} from "../../lib/dasApi";
import { formatDistanceToNow } from "../../lib/utils";
import { PLATFORM_NAMES, formatCurrencyWithSymbol } from "../../config/naming";

export function DasTransparencyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DasDashboardStats | null>(null);
  const [transparencyReport, setTransparencyReport] = useState<DasTransparencyReport[]>([]);
  const [userPayouts, setUserPayouts] = useState<DasUserPayout[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [auditValid, setAuditValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'transparency' | 'audit'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    try {
      const [dashStats, report, revStats] = await Promise.all([
        getDashboardStats(),
        getTransparencyReport(),
        getRevenueStats()
      ]);
      
      setStats(dashStats);
      setTransparencyReport(report);
      setRevenueStats(revStats);
      
      if (user?.id) {
        const payouts = await getUserPayouts(user.id, 20);
        setUserPayouts(payouts);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyAudit() {
    try {
      const result = await verifyAuditChain();
      setAuditValid(result.isChainValid);
    } catch (error) {
      console.error("Failed to verify audit chain:", error);
      setAuditValid(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">DAS Transparency Dashboard</h2>
        <p className="opacity-90">
          Complete transparency in advertising revenue and distribution
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            ) },
            { id: 'personal', label: 'My Earnings', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            ) },
            { id: 'transparency', label: '🔍 Transparency', icon: '🔍' },
            { id: 'audit', label: '🔐 Audit', icon: '🔐' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Active Brands</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.overall.active_brands}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Active Campaigns</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.overall.active_campaigns}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Proposals Voting</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.overall.proposals_voting}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-1">Total Distributed</div>
              <div className="text-3xl font-bold text-yellow-600">
                ${stats.overall.total_revenue_distributed?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Revenue Split Visualization */}
          {revenueStats && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Revenue Distribution (50/40/10 Split)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Platform Operations (50%)</span>
                    <span className="font-semibold">
                      ${revenueStats.total_platform_share?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-purple-500 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ width: '50%' }}>
                      50%
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Content Creators & Users (40%)</span>
                    <span className="font-semibold">
                      ${revenueStats.total_user_share?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ width: '40%' }}>
                      40%
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Charity Fund (10%)</span>
                    <span className="font-semibold">
                      ${revenueStats.total_charity_share?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-blue-500 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ width: '10%' }}>
                      10%
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Charity Allocation:</strong> 10% of revenue funds free summer camps for 
                    underprivileged children and anti-trafficking efforts.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {revenueStats.total_distributions || 0}
                  </div>
                  <div className="text-sm text-gray-500">Distributions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {revenueStats.total_users_paid || 0}
                  </div>
                  <div className="text-sm text-gray-500">Users Paid</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${revenueStats.total_revenue?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personal Earnings Tab */}
      {activeTab === 'personal' && user && (
        <div className="space-y-6">
          {/* User Stats */}
          {stats?.user && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-500 mb-1">Total Votes</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.user.total_votes}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-500 mb-1">Engagements</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.user.total_engagements}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-500 mb-1">Total Earned</div>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.user.total_earnings?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="text-xl font-bold">
                  {stats.user.opted_in ? (
                    <span className="text-green-600">✅ Opted In</span>
                  ) : (
                    <span className="text-gray-400">❌ Not Active</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payout History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Payout History</h3>
            {userPayouts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No payouts yet. Start engaging with ads to earn!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Campaign</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Method</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPayouts.map(payout => (
                      <tr key={payout.id} className="border-b">
                        <td className="py-2">{payout.campaign_name || 'Campaign'}</td>
                        <td className="py-2 font-semibold">
                          ${payout.payout_amount.toFixed(2)}
                        </td>
                        <td className="py-2">
                          {payout.payout_method === 'sparks' ? formatCurrencyWithSymbol(0) : payout.payout_method}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            payout.payout_status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payout.payout_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {payout.payout_status}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(payout.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transparency Tab */}
      {activeTab === 'transparency' && (
        <div className="space-y-6">
          {/* Monthly Report */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Monthly Revenue Report</h3>
            {transparencyReport.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No revenue data available yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Total Revenue</th>
                      <th className="text-right py-2">Platform (50%)</th>
                      <th className="text-right py-2">Users (40%)</th>
                      <th className="text-right py-2">Charity (10%)</th>
                      <th className="text-right py-2">Users Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transparencyReport.map((report, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">
                          {new Date(report.month).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          ${report.revenue.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          ${report.platform_share.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          ${report.user_share.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          ${report.charity_share.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {report.users_paid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Public Commitment */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Our Public Commitment
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✅ All revenue data is publicly auditable</li>
              <li>✅ User payouts are guaranteed and transparent</li>
              <li>✅ No hidden fees or deductions</li>
              <li>✅ Immutable audit trail using blockchain technology</li>
              <li>✅ Community governance over all decisions</li>
              <li>✅ 10% of all revenue goes to charity</li>
            </ul>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Blockchain Audit Verification</h3>
            
            <div className="text-center py-8">
              {auditValid === null ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Verify the integrity of the audit trail
                  </p>
                  <button
                    onClick={verifyAudit}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    🔐 Verify Audit Chain
                  </button>
                </div>
              ) : auditValid ? (
                <div className="text-green-600">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-2xl font-semibold mb-2">Audit Chain Valid</h4>
                  <p className="text-gray-600">
                    All transactions are verified and the audit trail is intact
                  </p>
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h4 className="text-2xl font-semibold mb-2">Audit Issue Detected</h4>
                  <p className="text-gray-600">
                    Please contact support for investigation
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2">How the Audit System Works:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Every transaction is hashed using SHA-256</li>
                <li>• Each hash includes the previous hash, creating a chain</li>
                <li>• Any tampering breaks the chain and is immediately detectable</li>
                <li>• All audit logs are publicly readable</li>
                <li>• Future integration with blockchain for permanent record</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
