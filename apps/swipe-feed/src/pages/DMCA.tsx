import React from 'react';
import { Link } from 'react-router-dom';

export const DMCA: React.FC = () => {
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
          DMCA POLICY
        </h1>
        
        <p className="text-white/60 mb-8">Digital Millennium Copyright Act Compliance</p>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Copyright Policy</h2>
            <p>
              MythaTron respects the intellectual property rights of others and expects our users to do the same. 
              We will respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA) 
              and other applicable intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Reporting Copyright Infringement</h2>
            <p className="mb-4">
              If you believe that your copyrighted work has been copied and is accessible on our platform in a way that constitutes 
              copyright infringement, please provide our DMCA Agent with the following information:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>A physical or electronic signature of the copyright owner or authorized representative</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Identification of the copyrighted work claimed to have been infringed</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Identification of the material that is claimed to be infringing, including its location on our platform</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Your contact information (address, telephone number, and email address)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>A statement that you have a good faith belief that the disputed use is not authorized</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>A statement, under penalty of perjury, that the information in your notice is accurate</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. DMCA Agent Contact</h2>
            <div className="bg-gray-900/30 border border-cyan-500/20 rounded-xl p-6">
              <p className="font-bold text-cyan-400 mb-3">Designated DMCA Agent:</p>
              <p>Legal Department</p>
              <p>Cronk Companies, LLC</p>
              <p>Email: dmca@mythatron.com</p>
              <p>Address: 123 Innovation Way, Tech City, TC 12345</p>
              <p className="mt-4 text-sm text-yellow-400">
                Please note: This contact information is solely for DMCA notices. 
                General inquiries sent to this address will not receive a response.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Counter-Notification</h2>
            <p className="mb-4">
              If you believe that your content was removed or disabled by mistake or misidentification, 
              you may submit a counter-notification containing:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Your physical or electronic signature</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Identification of the material that was removed and its location before removal</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>Your name, address, telephone number, and email address</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1">•</span>
                <p>A statement consenting to jurisdiction in your federal district court</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Repeat Infringer Policy</h2>
            <p>
              In accordance with the DMCA and other applicable laws, MythaTron has adopted a policy of terminating, 
              in appropriate circumstances, users who are deemed to be repeat infringers. We may also, at our sole discretion, 
              limit access to the platform and/or terminate the accounts of any users who infringe any intellectual property 
              rights of others, whether or not there is any repeat infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Fair Use</h2>
            <p>
              Please note that under Section 107 of the Copyright Act, certain uses of copyrighted material for purposes 
              such as criticism, comment, news reporting, teaching, scholarship, or research may constitute fair use and 
              may not require permission from the copyright owner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. False Claims</h2>
            <p className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <strong>Warning:</strong> Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents 
              that material or activity is infringing may be subject to liability for damages, including costs and attorneys' fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Modifications</h2>
            <p>
              MythaTron reserves the right to modify this DMCA Policy at any time. Changes will be posted on this page 
              with an updated effective date.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-gray-900/30 border border-cyan-500/20 rounded-xl">
          <p className="text-sm text-white/60">
            Last Updated: January 1, 2025
          </p>
          <p className="text-sm text-white/60 mt-2">
            This DMCA Policy is part of our Terms of Service and should be read in conjunction with our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
