import React from 'react';
import { Link } from 'react-router-dom';

export const CookiePolicy: React.FC = () => {
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
          COOKIE POLICY
        </h1>
        
        <p className="text-white/60 mb-8">Effective Date: January 1, 2025</p>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
            
            <div className="space-y-4 mt-4">
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Essential Cookies</h3>
                <p className="text-sm">
                  Required for the website to function properly. These include authentication cookies, security cookies, and load-balancing cookies.
                </p>
              </div>
              
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Functional Cookies</h3>
                <p className="text-sm">
                  Remember your preferences and settings, such as language selection, theme preferences, and recently used features.
                </p>
              </div>
              
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Analytics Cookies</h3>
                <p className="text-sm">
                  Help us understand how visitors interact with our website, which pages are most popular, and how we can improve our services.
                </p>
              </div>
              
              <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Marketing Cookies</h3>
                <p className="text-sm">
                  Track your activity across websites to provide targeted advertising and measure the effectiveness of our marketing campaigns.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Cookies</h2>
            <p>
              We work with third-party services that may set cookies on your device:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Google Analytics - for website analytics</li>
              <li>Stripe - for payment processing</li>
              <li>Cloudflare - for security and performance</li>
              <li>Vercel - for hosting and analytics</li>
              <li>Supabase - for authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Most browsers allow you to block or delete cookies</li>
              <li>You can set your browser to notify you when cookies are being set</li>
              <li>You can choose to accept or reject specific types of cookies</li>
            </ul>
            <p className="mt-4">
              Note: Blocking essential cookies may prevent you from using certain features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookie Duration</h2>
            <p>
              Our cookies have different lifespans:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain for a set period (typically 30 days to 1 year)</li>
              <li><strong>Authentication cookies:</strong> Valid for your session duration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting a notice on our website or sending you an email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-900/30 border border-cyan-500/20 rounded-xl">
              <p>Email: privacy@mythatron.com</p>
              <p>Address: Cronk Companies, LLC</p>
              <p>123 Innovation Way, Tech City, TC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
