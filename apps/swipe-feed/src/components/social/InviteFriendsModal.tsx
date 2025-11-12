/**
 * Invite Friends Modal - Social sharing and invitations
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect } from 'react';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  username?: string;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  username = 'User',
}) => {
  const [inviteLink, setInviteLink] = useState('');
  const [emailList, setEmailList] = useState('');
  const [message, setMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [inviteStats, setInviteStats] = useState({ sent: 0, joined: 0 });
  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'social'>('link');
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check for mobile and native share capability
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setCanShare('share' in navigator);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate unique invite link
  useEffect(() => {
    if (isOpen) {
      const baseUrl = window.location.origin;
      const inviteCode = btoa(`${userId}_${Date.now()}`).replace(/=/g, '').substring(0, 8);
      setInviteLink(`${baseUrl}/?invite=${inviteCode}&ref=${encodeURIComponent(username)}`);
      
      // Load invite stats
      const stats = JSON.parse(localStorage.getItem('mythatron_invite_stats') || '{"sent": 0, "joined": 0}');
      setInviteStats(stats);
      
      // Default message
      setMessage(`Hey, join me on MythaTron - the creative storytelling platform where we can create amazing stories together, play Angry Lips, and build our creative network. 🚀`);
    }
  }, [isOpen, userId, username]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      
      // Track invite action
      const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
      setInviteStats(stats);
      localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
    } catch (err) {
      alert('Failed to copy link. Please select and copy manually.');
    }
  };

  // Native mobile share
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on MythaTron',
          text: message,
          url: inviteLink,
        });
        
        // Track share
        const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
        setInviteStats(stats);
        localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
      } catch (_err) {
        // User cancelled or share failed
      }
    }
  };

  // Send via SMS (mobile)
  const sendSMS = () => {
    const smsBody = encodeURIComponent(`${message}\n\n${inviteLink}`);
    const smsUrl = `sms:?&body=${smsBody}`;
    window.location.href = smsUrl;
    
    // Track SMS share
    const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
    setInviteStats(stats);
    localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
  };

  // Send via Email (native mail app)
  const sendNativeEmail = () => {
    const subject = encodeURIComponent('Join me on MythaTron');
    const body = encodeURIComponent(`${message}\n\n${inviteLink}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    
    // Track email share
    const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
    setInviteStats(stats);
    localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
  };

  // Send via WhatsApp
  const sendWhatsApp = () => {
    const text = encodeURIComponent(`${message}\n\n${inviteLink}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp share
    const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
    setInviteStats(stats);
    localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
  };

  const sendEmailInvites = () => {
    const emails = emailList.split(/[,\s]+/).filter(email => email.includes('@'));
    
    if (emails.length === 0) {
      alert('Please enter valid email addresses');
      return;
    }

    setSendingEmails(true);
    
    // Simulate sending emails (in production, this would call an API)
    setTimeout(() => {
      const stats = { ...inviteStats, sent: inviteStats.sent + emails.length };
      setInviteStats(stats);
      localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
      
      // Store invited emails for tracking
      const invitedEmails = JSON.parse(localStorage.getItem('mythatron_invited_emails') || '[]');
      invitedEmails.push(...emails.map(email => ({
        email,
        invitedBy: username,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      })));
      localStorage.setItem('mythatron_invited_emails', JSON.stringify(invitedEmails));
      
      setSendingEmails(false);
      setEmailList('');
      alert(`Successfully sent invites to ${emails.length} friends.`);
    }, 1500);
  };

  const shareOnSocial = (platform: string) => {
    const text = encodeURIComponent(message);
    const url = encodeURIComponent(inviteLink);
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'discord':
        // Discord doesn't have a direct share URL, so we copy a formatted message
        navigator.clipboard.writeText(`${message}\n\nJoin here: ${inviteLink}`);
        alert('Discord invite message copied. Paste it in your Discord server.');
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join me on MythaTron')}&body=${text}%0A%0A${url}`;
        break;
    }

    if (shareUrl && platform !== 'discord') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Track share
    const stats = { ...inviteStats, sent: inviteStats.sent + 1 };
    setInviteStats(stats);
    localStorage.setItem('mythatron_invite_stats', JSON.stringify(stats));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-white">Invite Friends</h2>
              <p className="text-sm text-white/60 mt-1">
                Grow your creative network and earn rewards.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-4">
            <div className="flex-1 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Invites Sent</span>
                <span className="text-lg font-bold text-purple-400">{inviteStats.sent}</span>
              </div>
            </div>
            <div className="flex-1 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Friends Joined</span>
                <span className="text-lg font-bold text-green-400">{inviteStats.joined}</span>
              </div>
            </div>
            <div className="flex-1 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Sparks Earned</span>
                <span className="text-lg font-bold text-yellow-400">{inviteStats.joined * 50}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 px-4 transition-all ${
              activeTab === 'link'
                ? 'bg-purple-500/10 border-b-2 border-purple-500 text-purple-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            Share Link
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 transition-all ${
              activeTab === 'email'
                ? 'bg-purple-500/10 border-b-2 border-purple-500 text-purple-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Invite
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3 px-4 transition-all ${
              activeTab === 'social'
                ? 'bg-purple-500/10 border-b-2 border-purple-500 text-purple-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Social Share
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {activeTab === 'link' && (
            <div className="space-y-6">
              {/* Mobile Native Share Button */}
              {isMobile && canShare && (
                <div>
                  <button
                    onClick={nativeShare}
                    className="w-full py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    <span className="text-lg">Share with Your Apps</span>
                  </button>
                  <p className="text-xs text-white/40 mt-2 text-center">
                    Use your device's native share to send via any app
                  </p>
                </div>
              )}

              {/* Mobile Quick Share Options */}
              {isMobile && (
                <div>
                  <h3 className="text-sm text-white/60 mb-3">Quick Share Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={sendSMS}
                      className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all flex flex-col items-center gap-2"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                      </svg>
                      <span className="text-xs">Text/SMS</span>
                    </button>
                    
                    <button
                      onClick={sendWhatsApp}
                      className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all flex flex-col items-center gap-2"
                    >
                      <svg width="28" height="28" viewBox="0 0 448 512" fill="currentColor" className="text-green-400">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    
                    <button
                      onClick={sendNativeEmail}
                      className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all flex flex-col items-center gap-2"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="text-xs">Email</span>
                    </button>
                    
                    <button
                      onClick={() => shareOnSocial('facebook')}
                      className="p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-xl transition-all flex flex-col items-center gap-2"
                    >
                      <svg width="28" height="28" viewBox="0 0 320 512" fill="currentColor" className="text-blue-500">
                        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                      </svg>
                      <span className="text-xs">Facebook</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-white/60 mb-2">Your Personal Invite Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white/80 font-mono text-xs sm:text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-sm ${
                      copiedLink
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-white'
                    }`}
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Share this link with friends to invite them to MythaTron
                </p>
              </div>

              {!isMobile && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">QR Code</label>
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <div className="w-32 h-32 bg-black/10 flex items-center justify-center">
                      <span className="text-black/30 text-xs">QR Code</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    Friends can scan this code to join instantly
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email Addresses</label>
                <textarea
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  placeholder="Enter email addresses separated by commas or new lines"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={4}
                />
                <p className="text-xs text-white/40 mt-2">
                  Example: friend1@email.com, friend2@email.com
                </p>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Personal Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={sendEmailInvites}
                disabled={sendingEmails || !emailList.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmails ? 'Sending' : 'Send Email Invites'}
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-4">Share on Social Media</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => shareOnSocial('twitter')}
                    className="p-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                    <span className="text-[#1DA1F2]">Twitter</span>
                  </button>

                  <button
                    onClick={() => shareOnSocial('facebook')}
                    className="p-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                    <span className="text-[#1877F2]">Facebook</span>
                  </button>

                  <button
                    onClick={() => shareOnSocial('linkedin')}
                    className="p-4 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    <span className="text-[#0A66C2]">LinkedIn</span>
                  </button>

                  <button
                    onClick={() => shareOnSocial('whatsapp')}
                    className="p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-[#25D366]">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => shareOnSocial('telegram')}
                    className="p-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0088cc">
                      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-[#0088cc]">Telegram</span>
                  </button>

                  <button
                    onClick={() => shareOnSocial('discord')}
                    className="p-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-xl transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="text-[#5865F2]">Discord</span>
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={() => shareOnSocial('email')}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Share via Email</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
            </svg>
            <div className="flex-1">
              <p className="text-sm text-white/90">Earn 50 Sparks for each friend who joins.</p>
              <p className="text-xs text-white/60">Plus unlock exclusive rewards at milestones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
