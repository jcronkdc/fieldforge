/**
 * Friend Invitation System - Easy way to invite non-members
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';
import { TERMS } from '../../config/terminology';

interface InviteMethod {
  type: 'email' | 'link' | 'social';
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface InviteStatus {
  email: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  sentAt: string;
  acceptedAt?: string;
  sparksEarned?: number;
}

export const InviteFriends: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<'email' | 'link' | 'social'>('email');
  const [emails, setEmails] = useState<string[]>(['']);
  const [personalMessage, setPersonalMessage] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteHistory, setInviteHistory] = useState<InviteStatus[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate unique invite link
  useEffect(() => {
    const userId = localStorage.getItem('mythatron_user_id') || 'demo';
    const inviteCode = btoa(`${userId}-${Date.now()}`).substring(0, 10);
    setInviteLink(`https://mythatron.com/join/${inviteCode}`);
  }, []);

  // Load invite history
  useEffect(() => {
    const history = localStorage.getItem('mythatron_invite_history');
    if (history) {
      setInviteHistory(JSON.parse(history));
    }
  }, []);

  // Icons
  const EmailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7L12 13L2 7"/>
    </svg>
  );

  const LinkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );

  const SocialIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
    </svg>
  );

  const SparkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
            fill="url(#spark-gradient-invite)" stroke="url(#spark-gradient-invite)" strokeWidth="0.5"/>
      <defs>
        <linearGradient id="spark-gradient-invite" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );

  const inviteMethods: InviteMethod[] = [
    {
      type: 'email',
      icon: <EmailIcon />,
      title: 'Email Invites',
      description: 'Send personalized invitations directly to email',
    },
    {
      type: 'link',
      icon: <LinkIcon />,
      title: 'Share Link',
      description: 'Copy your unique invitation link to share anywhere',
    },
    {
      type: 'social',
      icon: <SocialIcon />,
      title: 'Social Share',
      description: 'Share on your favorite social platforms',
    },
  ];

  // Add email input
  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  // Update email
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Remove email
  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
  };

  // Send email invites
  const sendEmailInvites = async () => {
    setSending(true);
    
    // Filter valid emails
    const validEmails = emails.filter(email => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      alert('Please enter at least one valid email address');
      setSending(false);
      return;
    }

    // Simulate sending (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update history
    const newInvites: InviteStatus[] = validEmails.map(email => ({
      email,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }));

    const updatedHistory = [...inviteHistory, ...newInvites];
    setInviteHistory(updatedHistory);
    localStorage.setItem('mythatron_invite_history', JSON.stringify(updatedHistory));

    setSending(false);
    setShowSuccess(true);
    setEmails(['']);
    setPersonalMessage('');

    setTimeout(() => setShowSuccess(false), 5000);
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Share on social
  const shareOnSocial = (platform: string) => {
    const message = `Join me on MythaTron - the creative platform where stories evolve. ${inviteLink}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(inviteLink);

    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Calculate total rewards
  const totalSparksEarned = inviteHistory
    .filter(i => i.status === 'accepted')
    .reduce((sum, i) => sum + (i.sparksEarned || 0), 0);

  const acceptedCount = inviteHistory.filter(i => i.status === 'accepted').length;
  const pendingCount = inviteHistory.filter(i => i.status === 'sent').length;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Invite Friends to MythaTron
          </h1>
          <p className="text-white/60">
            Invite your friends and earn rewards when they join the creative revolution
          </p>
        </div>

        {/* Rewards Banner */}
        <div className="glass rounded-2xl p-6 mb-8 border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-light mb-2 flex items-center gap-2">
                <SparkIcon />
                Earn Sparks for Every Friend
              </h3>
              <p className="text-white/60 text-sm">
                Get 25 Sparks when your friend joins + 50 Sparks when they create their first story.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-yellow-400">{totalSparksEarned}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Sparks Earned</div>
            </div>
          </div>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {inviteMethods.map((method) => (
            <button
              key={method.type}
              onClick={() => setActiveMethod(method.type)}
              className={`p-6 rounded-xl border transition-all ${
                activeMethod === method.type
                  ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  activeMethod === method.type ? 'bg-purple-500/20' : 'bg-white/5'
                }`}>
                  {method.icon}
                </div>
                <div className="text-sm font-medium">{method.title}</div>
                <div className="text-xs text-white/40 text-center">{method.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Method Content */}
        <div className="glass rounded-2xl p-8 mb-8">
          {activeMethod === 'email' && (
            <div className="space-y-6">
              <h3 className="text-xl font-light mb-4">Send Email Invitations</h3>
              
              {/* Email inputs */}
              <div className="space-y-3">
                <label className="text-sm text-white/60">Email Addresses</label>
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:border-purple-500/50 focus:outline-none"
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addEmailField}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-all"
                >
                  + Add another email
                </button>
              </div>

              {/* Personal message */}
              <div className="space-y-2">
                <label className="text-sm text-white/60">Personal Message (Optional)</label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Hey, I've been creating amazing stories on MythaTron. You should join me"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:border-purple-500/50 focus:outline-none h-24 resize-none"
                />
              </div>

              {/* Send button */}
              <button
                onClick={sendEmailInvites}
                disabled={sending}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending Invitations' : 'Send Invitations'}
              </button>

              {showSuccess && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  ✅ Invitations sent successfully. You will earn Sparks when your friends join.
                </div>
              )}
            </div>
          )}

          {activeMethod === 'link' && (
            <div className="space-y-6">
              <h3 className="text-xl font-light mb-4">Your Unique Invitation Link</h3>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-white/80"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-all"
                  >
                    {copySuccess ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/60">Share this link anywhere:</p>
                <ul className="space-y-2 text-sm text-white/40">
                  <li>• Text messages</li>
                  <li>• Discord servers</li>
                  <li>• Forums and communities</li>
                  <li>• Your social media bio</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm">
                  <span className="text-purple-400">Pro tip:</span> This link never expires and tracks all your referrals automatically.
                </p>
              </div>
            </div>
          )}

          {activeMethod === 'social' && (
            <div className="space-y-6">
              <h3 className="text-xl font-light mb-4">Share on Social Media</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>𝕏</span>
                    <span>Share on X</span>
                  </div>
                </button>

                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>f</span>
                    <span>Share on Facebook</span>
                  </div>
                </button>

                <button
                  onClick={() => shareOnSocial('linkedin')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>in</span>
                    <span>Share on LinkedIn</span>
                  </div>
                </button>

                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>W</span>
                    <span>Share on WhatsApp</span>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm text-white/60 mb-2">Your message will include:</p>
                <p className="text-xs text-white/40 italic">
                  "Join me on MythaTron - the creative platform where stories evolve. {inviteLink}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Invitation History */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-light mb-6">Your Invitation Stats</h3>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-light text-green-400">{acceptedCount}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Friends Joined</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-yellow-400">{pendingCount}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Pending Invites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-purple-400">{totalSparksEarned}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Sparks Earned</div>
            </div>
          </div>

          {inviteHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-white/60 mb-3">Recent Invitations</div>
              {inviteHistory.slice(-5).reverse().map((invite, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      invite.status === 'accepted' ? 'bg-green-400' :
                      invite.status === 'sent' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm">{invite.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {invite.sparksEarned && (
                      <span className="text-xs text-yellow-400">+{invite.sparksEarned} Sparks</span>
                    )}
                    <span className="text-xs text-white/40">
                      {new Date(invite.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
