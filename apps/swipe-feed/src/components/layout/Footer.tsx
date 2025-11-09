/**
 * Footer Component
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-light text-white">MythaTron</span>
            </div>
            <p className="text-sm text-white/60">
              The creative platform where stories evolve and creators thrive.
            </p>
            <div className="flex gap-3">
              {/* Social Icons */}
              <a href="https://twitter.com/mythatron" target="_blank" rel="noopener noreferrer" 
                 className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 hover:text-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://discord.gg/mythatron" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 hover:text-white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="https://github.com/mythatron" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 hover:text-white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/roadmap" className="text-sm text-white/60 hover:text-white transition-colors">Roadmap</Link></li>
              <li><a href="https://status.mythatron.com" className="text-sm text-white/60 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-white/60 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/blog" className="text-sm text-white/60 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/community" className="text-sm text-white/60 hover:text-white transition-colors">Community</Link></li>
              <li><Link to="/developers" className="text-sm text-white/60 hover:text-white transition-colors">Developers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-sm text-white/60 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/dmca" className="text-sm text-white/60 hover:text-white transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © {currentYear} Cronk Companies, LLC. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/contact" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                About
              </Link>
              <Link to="/careers" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Careers
              </Link>
              <a href="mailto:support@mythatron.com" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
