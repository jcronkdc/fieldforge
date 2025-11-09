/**
 * Privacy Policy Page
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black text-xl">
                M
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">MythaTron</h1>
            </Link>
            <Link 
              to="/"
              className="px-6 py-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
            >
              <span className="font-bold uppercase tracking-wider text-sm">Back to App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          PRIVACY POLICY
        </h1>
        
        <p className="text-white/60 mb-8">
          Effective Date: January 1, 2025 | Last Updated: January 15, 2025
        </p>

        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <p className="text-cyan-400 font-bold mb-2">Our Commitment</p>
          <p className="text-white/80">
            At MythaTron, we take your privacy seriously. We believe in transparency, user control, 
            and data minimization. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">1.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Account Information:</strong> Email, username, password (encrypted)</li>
                  <li><strong>Profile Information:</strong> Display name, avatar, bio (optional)</li>
                  <li><strong>Content:</strong> Stories, songs, game data, and other creations</li>
                  <li><strong>Communications:</strong> Messages, feedback, support requests</li>
                  <li><strong>Payment Information:</strong> Processed securely via Stripe (we don't store card details)</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">1.2 Information We Collect Automatically</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Usage Data:</strong> Features used, time spent, interaction patterns</li>
                  <li><strong>Device Information:</strong> Browser type, OS, screen resolution</li>
                  <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
                  <li><strong>Cookies:</strong> Session management, preferences, analytics</li>
                  <li><strong>Performance Data:</strong> App crashes, errors, load times</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">1.3 AI-Related Data</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Prompts & Outputs:</strong> Your AI interactions and generated content</li>
                  <li><strong>Training Feedback:</strong> Ratings and corrections you provide</li>
                  <li><strong>Usage Patterns:</strong> How you use AI features (anonymized for improvement)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Service Delivery</h3>
                <p className="text-sm">Provide and maintain MythaTron features</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Personalization</h3>
                <p className="text-sm">Customize your experience and recommendations</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Communication</h3>
                <p className="text-sm">Send updates, notifications, and support messages</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Improvement</h3>
                <p className="text-sm">Enhance our AI models and platform features</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Security</h3>
                <p className="text-sm">Detect and prevent fraud, abuse, and threats</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Legal Compliance</h3>
                <p className="text-sm">Meet legal obligations and enforce our terms</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
            <p className="mb-4">We do NOT sell your personal information. We share data only in these circumstances:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <div>
                  <strong>With Your Consent:</strong> When you explicitly agree to share
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <div>
                  <strong>Service Providers:</strong> Trusted partners who help operate our platform 
                  (Supabase for auth, Stripe for payments, Vercel for hosting)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <div>
                  <strong>Legal Requirements:</strong> When required by law or to protect rights and safety
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <div>
                  <strong>Business Transfers:</strong> In case of merger, acquisition, or sale (with notice)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <div>
                  <strong>Aggregated Data:</strong> Non-identifiable statistics for analytics and research
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <p className="mb-3">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication</li>
                <li>Data encryption at rest and in transit</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4 text-yellow-400">
                While we strive to protect your data, no method is 100% secure. Please use strong passwords 
                and protect your account credentials.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights & Controls</h2>
            <p className="mb-4">You have control over your information:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Access</h3>
                <p className="text-sm">Request a copy of your personal data</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Correction</h3>
                <p className="text-sm">Update or correct inaccurate information</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Deletion</h3>
                <p className="text-sm">Request deletion of your account and data</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Portability</h3>
                <p className="text-sm">Export your data in a machine-readable format</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Restriction</h3>
                <p className="text-sm">Limit how we process your information</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Objection</h3>
                <p className="text-sm">Opt-out of certain data processing</p>
              </div>
            </div>
            
            <p className="mt-4">
              To exercise these rights, contact us at privacy@mythatron.com or use the controls in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Active Account Data:</strong> Retained while your account is active</li>
              <li><strong>Deleted Account Data:</strong> Removed within 30 days of deletion request</li>
              <li><strong>Legal/Compliance Data:</strong> Retained as required by law (typically 7 years)</li>
              <li><strong>Anonymized Data:</strong> May be retained indefinitely for analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. International Data Transfers</h2>
            <p>
              MythaTron operates globally. Your information may be transferred to and processed in countries 
              other than your own. We ensure appropriate safeguards are in place for international transfers, 
              including Standard Contractual Clauses and adequacy decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p>
                MythaTron is not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected such information, 
                please contact us immediately at privacy@mythatron.com.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
            <p className="mb-3">We integrate with trusted third-party services:</p>
            <div className="space-y-3">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <strong className="text-cyan-400">Supabase:</strong> Authentication and database
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <strong className="text-cyan-400">Stripe:</strong> Payment processing
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <strong className="text-cyan-400">OpenAI:</strong> AI model provider
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <strong className="text-cyan-400">Vercel:</strong> Hosting and analytics
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <strong className="text-cyan-400">Cloudflare:</strong> Security and CDN
              </div>
            </div>
            <p className="mt-3 text-white/60">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Right to know what personal information we collect, use, and share</li>
              <li>Right to delete personal information (with exceptions)</li>
              <li>Right to opt-out of the sale of personal information (we don't sell data)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. European Privacy Rights (GDPR)</h2>
            <p>
              If you're in the European Economic Area (EEA), you have rights under the General Data Protection 
              Regulation (GDPR), including the right to data portability, the right to be forgotten, and the 
              right to lodge a complaint with your local supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last Updated" date. For significant changes, 
              we'll provide additional notice via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <p className="font-bold text-cyan-400 mb-3">Privacy Team</p>
              <p>Cronk Companies, LLC</p>
              <p>Email: privacy@mythatron.com</p>
              <p>Address: 123 Innovation Way, Tech City, TC 12345</p>
              
              <div className="mt-4 pt-4 border-t border-cyan-500/20">
                <p className="font-bold text-cyan-400 mb-2">Data Protection Officer</p>
                <p>Email: dpo@mythatron.com</p>
              </div>
              
              <p className="mt-4 text-sm text-white/60">
                We aim to respond to all privacy requests within 30 days.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-gray-900/30 border border-cyan-500/20 rounded-xl">
          <p className="text-sm text-white/60">
            This Privacy Policy is part of our Terms of Service. By using MythaTron, you agree to this policy.
          </p>
          <p className="text-sm text-white/60 mt-2">
            Document Version: 2.0 | ISO 27001 Compliant | GDPR & CCPA Compliant
          </p>
        </div>
      </div>
    </div>
  );
}