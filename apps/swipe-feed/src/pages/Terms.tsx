/**
 * Terms of Service Page
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function Terms() {
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
          TERMS OF SERVICE
        </h1>
        
        <p className="text-white/60 mb-8">
          Effective Date: January 1, 2025 | Last Updated: January 15, 2025
        </p>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using MythaTron ("Service", "Platform"), operated by Cronk Companies, LLC 
              ("Company", "we", "us", "our"), you ("User", "you", "your") agree to be bound by these 
              Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. 
              If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Account Registration</h2>
            <p className="mb-3">To use certain features of MythaTron, you must register for an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Content Ownership & Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">3.1 Your Content</h3>
                <p>
                  You retain all ownership rights to content you create on MythaTron ("User Content"). 
                  By posting content, you grant us a non-exclusive, worldwide, royalty-free, sublicensable, 
                  and transferable license to use, reproduce, distribute, prepare derivative works of, 
                  display, and perform your content in connection with the Service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">3.2 AI-Generated Content</h3>
                <p>
                  Content created with our AI tools is owned by you, subject to our license to use it 
                  for improving our AI models and services. You are responsible for ensuring AI-generated 
                  content does not infringe on third-party rights.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">3.3 Platform Content</h3>
                <p>
                  All platform content, including but not limited to software, designs, graphics, and text, 
                  is the exclusive property of Cronk Companies, LLC and is protected by copyright, 
                  trademark, and other intellectual property laws.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Sparks Economy</h2>
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <p className="mb-3">Sparks are our virtual currency used for AI operations:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Sparks have no cash value and cannot be exchanged for real money</li>
                <li>All Spark purchases are final and non-refundable</li>
                <li>Unused Sparks do not expire but may be forfeited if you violate these Terms</li>
                <li>We reserve the right to modify Spark pricing and allocation at any time</li>
                <li>1 Spark approximately equals $0.02 USD in computational cost</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Subscription Plans</h2>
            <p className="mb-3">We offer various subscription tiers:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Free Tier</h3>
                <p className="text-sm">100 Sparks/month, basic features</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Creator ($19/mo)</h3>
                <p className="text-sm">2,000 Sparks/month, premium features</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Studio ($79/mo)</h3>
                <p className="text-sm">10,000 Sparks/month, team features</p>
              </div>
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="font-bold text-cyan-400 mb-2">Enterprise</h3>
                <p className="text-sm">Custom pricing and features</p>
              </div>
            </div>
            <p className="mt-4">
              Subscriptions auto-renew unless canceled. You may cancel anytime through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Uses</h2>
            <p className="mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-red-400/80">
              <li>Post illegal, harmful, threatening, abusive, or offensive content</li>
              <li>Harass, impersonate, or harm other users</li>
              <li>Violate any laws or regulations in your jurisdiction</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to hack, reverse engineer, or compromise the platform</li>
              <li>Create multiple accounts to circumvent restrictions</li>
              <li>Use the platform for spam, phishing, or commercial solicitation</li>
              <li>Generate content that violates OpenAI's usage policies</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems or bots without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. AI Usage & Limitations</h2>
            <p>
              Our AI features are provided "as-is" without guarantees of accuracy, completeness, or fitness 
              for any particular purpose. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You are responsible for reviewing and editing AI output</li>
              <li>AI features may be limited or unavailable during high demand</li>
              <li>We may implement usage limits to ensure fair access for all users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Privacy & Data Protection</h2>
            <p>
              Your use of our Service is also governed by our Privacy Policy. By using MythaTron, 
              you consent to our collection and use of personal information as outlined in the Privacy Policy. 
              We comply with GDPR, CCPA, and other applicable data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account immediately, without prior notice 
              or liability, for any reason, including but not limited to breach of these Terms. Upon 
              termination, your right to use the Service will immediately cease. You may terminate your 
              account at any time through account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Disclaimers & Limitation of Liability</h2>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="mb-3">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                OR NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL CRONK COMPANIES, LLC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Cronk Companies, LLC and its officers, 
              directors, employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including reasonable attorney's fees) arising out of or in connection with your use of the 
              Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law & Disputes</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States 
              and the State of Delaware, without regard to its conflict of law provisions. Any disputes arising 
              from these Terms or your use of the Service shall be resolved through binding arbitration in 
              accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice prior to any new terms taking effect. Your continued 
              use of the Service after changes become effective constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <p className="font-bold text-cyan-400 mb-3">Cronk Companies, LLC</p>
              <p>Legal Department</p>
              <p>Email: legal@mythatron.com</p>
              <p>Address: 123 Innovation Way, Tech City, TC 12345</p>
              <p className="mt-4 text-sm text-white/60">
                For general support, please visit our Help Center or contact support@mythatron.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, the remaining 
              provisions will continue in full force and effect. The invalid or unenforceable provision 
              will be replaced with a valid, enforceable provision that most closely matches the intent 
              of the original provision.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-gray-900/30 border border-cyan-500/20 rounded-xl">
          <p className="text-sm text-white/60">
            By using MythaTron, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <p className="text-sm text-white/60 mt-2">
            Document Version: 2.0 | Last Review: January 15, 2025
          </p>
        </div>
      </div>
    </div>
  );
}