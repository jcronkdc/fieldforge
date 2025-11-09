/**
 * Authenticated App V2 - Improved navigation and UX
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { NavigationSidebar } from './navigation/NavigationSidebar';
import { SparksPurchase } from './sparks/SparksPurchase';
import { ProfileSetup } from './profile/ProfileSetup';
import { FullPageLoader } from './LoadingStates';
import { SparksProvider, useSparks } from './sparks/SparksContext';

// Import all views
import { FuturisticDashboard } from './dashboard/FuturisticDashboard';
import { SparksDisplay } from './sparks/SparksDisplay';
import { Icons } from './icons/Icons';
import { QuickTestButton } from './dashboard/QuickTestButton';
import { FuturisticFeedView } from '../views/FuturisticFeedView';
import { FuturisticMessages } from './messages/FuturisticMessages';
import { FuturisticAngryLipsHub } from './angrylips/FuturisticAngryLipsHub';
import { FuturisticStoryForge } from './stories/FuturisticStoryForge';
import { FuturisticSongForge } from './songforge/FuturisticSongForge';
import { FuturisticScreenplay } from './screenplay/FuturisticScreenplay';
import { FuturisticMythaQuest } from './mythaquest/FuturisticMythaQuest';
import { CreatorNetworkView } from './creators/CreatorNetworkView';
import { DemocraticAdsView } from './das/DemocraticAdsView';
import { FuturisticSettings } from './settings/FuturisticSettings';
import { MasterTestSuite } from './test/MasterTestSuite';
import { InviteFriendsModal } from './social/InviteFriendsModal';
import { FuturisticNotifications } from './notifications/FuturisticNotifications';
import { NotificationBadge } from './notifications/NotificationBadge';
import { FuturisticModal } from './modals/FuturisticModal';
import { StoryForgeContent } from './stories/StoryForgeContent';
import { OmniGuideChat } from './omniguide/OmniGuideChat';
import { FloatingOmniGuideButton } from './omniguide/FloatingOmniGuideButton';
import { useOmniGuide } from '../context/OmniGuideContext';
import { FuturisticFeedbackDashboard } from './feedback/FuturisticFeedbackDashboard';

export type FocusedView = 
  | 'prologue'      // Dashboard/Home
  | 'feed'          // Community Feed
  | 'messages'      // Direct Messages
  | 'angrylips'     // AngryLips Game
  | 'stories'       // StoryForge
  | 'songforge'     // SongForge Music Creation
  | 'screenplay'    // Screenplay Writer
  | 'mythaquest'    // MythaQuest RPG
  | 'bookworms'     // Friend Network
  | 'das'           // Democratic Ads
  | 'settings'      // Account Settings
  | 'master-test'   // Admin Tools
  | 'sparks-store'  // Sparks Purchase
  | 'notifications' // Notifications
  | 'invite'        // Invite Friends
  | 'feedback';      // Feedback Dashboard

interface AuthenticatedAppV2Props {}

const AppInner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, setProfile } = useProfile(user?.id);
  const { balance: sparksBalance, isAdmin } = useSparks();
  const { isOpen: isOmniGuideOpen, isMinimized, toggleOmniGuide } = useOmniGuide();

  // Navigation state
  const [currentView, setCurrentView] = useState<FocusedView>('prologue');
  const [navigationHistory, setNavigationHistory] = useState<FocusedView[]>(['prologue']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Modal states
  const [showSparksPurchase, setShowSparksPurchase] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Data states - Admin gets infinite Sparks
  const [notifications, setNotifications] = useState(0); // Real notifications from backend

  // Update sparks balance when it changes (for purchases, usage, etc)
  useEffect(() => {
    // The useSparks hook manages the actual balance and its updates.
    // We can remove the old polling logic here.
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut for OmniGuide (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOmniGuide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleOmniGuide]);

  // Parse URL hash for navigation
  useEffect(() => {
    const hash = location.hash.slice(1).toLowerCase();
    if (hash && isValidView(hash)) {
      setCurrentView(hash as FocusedView);
    }
  }, [location.hash]);

  // Update URL when view changes
  const handleNavigate = useCallback((view: FocusedView) => {
    // Add to history if not going back
    if (view !== currentView) {
      setNavigationHistory(prev => [...prev, view]);
    }
    setCurrentView(view);
    navigate(`#${view}`);
    
    // Handle special navigation cases
    if (view === 'sparks-store') {
      setShowSparksPurchase(true);
    } else if (view === 'invite') {
      setShowInviteModal(true);
    }
  }, [navigate, currentView]);

  // Go back in navigation history
  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current
      const previousView = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentView(previousView);
      navigate(`#${previousView}`);
    }
  }, [navigationHistory, navigate]);


  // Check if view is valid
  const isValidView = (view: string): boolean => {
    const validViews: FocusedView[] = [
      'prologue', 'feed', 'stream', 'messages', 'angry-lips',
      'stories', 'bookworms', 'das', 'settings', 'master-test',
      'sparks-store', 'notifications', 'invite'
    ];
    return validViews.includes(view as FocusedView);
  };

  // Loading state
  if (profileLoading) {
    return <FullPageLoader />;
  }

  // Profile setup if needed
  if (!profile?.username && user) {
    return (
      <ProfileSetup
        user={user}
        onComplete={(updatedProfile) => {
          setProfile(updatedProfile);
          // Navigate to dashboard after profile creation
          handleNavigate('prologue');
        }}
      />
    );
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'prologue':
        return (
          <FuturisticDashboard
            userId={profile?.id || 'guest'}
            userRole={profile?.role || 'viewer'}
            sparksBalance={sparksBalance}
            notifications={notifications}
            onNavigate={handleNavigate}
          />
        );
      
      case 'feed':
        return (
          <FuturisticFeedView
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      
      case 'messages':
        return (
          <FuturisticMessages
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'angry-lips':
        return (
          <FuturisticAngryLipsHub
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'stories':
        return (
          <FuturisticStoryForge
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'songforge':
        return (
          <FuturisticSongForge
            onClose={() => handleNavigate('prologue')}
          />
        );
      
      case 'screenplay':
        return (
          <FuturisticScreenplay
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'mythaquest':
        return (
          <FuturisticMythaQuest
            onNavigate={handleNavigate}
          />
        );
      
      case 'bookworms':
        return (
          <CreatorNetworkView
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'das':
        return (
          <DemocraticAdsView
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'notifications':
        return (
          <FuturisticNotifications
            onNavigate={handleNavigate}
          />
        );
      
      case 'settings':
        return (
          <FuturisticSettings
            profile={profile}
            onNavigate={handleNavigate}
          />
        );
      
      case 'master-test':
        if (isAdmin) {
          return <MasterTestSuite />;
        }
        // Redirect non-admins to home
        handleNavigate('prologue');
        return null;
      
      case 'feedback':
        if (isAdmin) {
          return <FuturisticFeedbackDashboard onNavigate={handleNavigate} />;
        }
        // Redirect non-admins to home
        handleNavigate('prologue');
        return null;
      
      case 'sparks-store':
        // Sparks store is handled via modal, show empty view
        return null;
      
      case 'invite':
        // Invite is handled via modal, show empty view
        return null;
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-light text-white mb-4">Page Not Found</h2>
              <button
                onClick={() => handleNavigate('prologue')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Quick Test Button - Only for admins */}
      {profile?.role === 'admin' && <QuickTestButton />}
      
      {/* Floating OmniGuide Button - Always visible */}
      <FloatingOmniGuideButton />
      
      {/* OmniGuide AI Assistant */}
      {(isOmniGuideOpen || isMinimized) && (
        <OmniGuideChat
          currentView={currentView}
          onNavigate={handleNavigate}
          isMinimized={isMinimized}
          onToggleMinimize={toggleOmniGuide}
        />
      )}
      
      {/* Desktop Navigation Sidebar */}
      {!isMobile && (
        <NavigationSidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          notifications={notifications}
          sparksBalance={sparksBalance}
          username={profile?.username}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Top Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-light bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MythaTron
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('sparks-store')}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg"
            >
              <span className="text-xs">{typeof sparksBalance === 'number' ? sparksBalance : '∞'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            <NotificationBadge count={notifications} onClick={() => handleNavigate('notifications')} />
          </div>
        </div>
      )}

      {/* Mobile Slide-out Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-br from-purple-900/20 to-black border-r border-white/10 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              {/* Mobile Menu Items */}
              <nav className="space-y-2">
                {[
                  { id: 'prologue', label: 'Home', icon: Icons.Dashboard },
                  { id: 'feed', label: 'Feed', icon: Icons.Feed },
                  { id: 'angrylips', label: 'AngryLips', icon: Icons.Fire },
                  { id: 'stories', label: 'StoryForge', icon: Icons.StoryForge },
                  { id: 'songforge', label: 'SongForge', icon: Icons.SongForge },
                  { id: 'mythaquest', label: 'MythaQuest', icon: Icons.MythaQuest },
                  { id: 'bookworms', label: 'Friends', icon: Icons.Friends },
                  { id: 'messages', label: 'Messages', icon: Icons.Messages },
                  { id: 'settings', label: 'Settings', icon: Icons.Settings },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigate(item.id as FocusedView);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    handleNavigate('invite');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl"
                >
                  Invite Friends & Earn
                </button>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={signOut}
                  className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        isMobile ? 'pt-14 pb-16' : sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Desktop Top Header Bar */}
        {!isMobile && (
          <div className="fixed top-0 right-0 left-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/10 z-30" 
             style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
            <div className="h-full flex items-center justify-end px-6 gap-4">
              {/* Sparks Balance */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L19 7L15.45 11.82L21 16L14.81 16.95L16 23L12 18.27L8 23L9.19 16.95L3 16L8.55 11.82L5 7L10.91 8.26L12 2Z" 
                        fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5"/>
                </svg>
                <span className="text-yellow-400 font-bold">{sparksBalance === Infinity ? '∞' : sparksBalance.toLocaleString()}</span>
              </div>
              
              {/* Notifications */}
              <NotificationBadge onNavigate={handleNavigate} userId={user?.id} />
            </div>
          </div>
        )}
        
        <div className={`min-h-screen ${!isMobile ? 'pt-16' : ''}`}>
          {renderView()}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Futuristic Design */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-white/5 z-40">
          <div className="h-full flex items-center justify-around relative">
            {/* Active indicator */}
            <div 
              className="absolute top-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{
                width: '20%',
                left: `${['prologue', 'feed', 'angry-lips', 'bookworms', 'messages'].indexOf(currentView) * 20}%`
              }}
            />
            
            {[
              { 
                id: 'prologue', 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                ),
                label: 'Home' 
              },
              { 
                id: 'feed', 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                ),
                label: 'Feed' 
              },
              { 
                id: 'angry-lips', 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <circle cx="9" cy="9" r="1" fill="currentColor"/>
                    <circle cx="15" cy="9" r="1" fill="currentColor"/>
                  </svg>
                ),
                label: 'Lips' 
              },
              { 
                id: 'bookworms', 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ),
                label: 'Create' 
              },
              { 
                id: 'messages', 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                ),
                label: 'Chat' 
              },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as FocusedView)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                  currentView === item.id ? 'text-white' : 'text-white/40'
                }`}
              >
                <div className={`transition-all ${currentView === item.id ? 'scale-110' : 'scale-100'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-1 font-light tracking-wider uppercase transition-all ${
                  currentView === item.id ? 'opacity-100' : 'opacity-60'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Widget - Keep at bottom right */}

      {/* Modals */}
      {showSparksPurchase && (
        <SparksPurchase
          isOpen={showSparksPurchase}
          onClose={() => {
            setShowSparksPurchase(false);
            setCurrentView('prologue');
          }}
          currentBalance={sparksBalance}
        />
      )}

      {showInviteModal && (
        <InviteFriendsModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setCurrentView('prologue');
          }}
          userId={user?.id || ''}
          userEmail={user?.email || ''}
          username={profile?.username}
        />
      )}
    </div>
  );
};

export const AuthenticatedAppV2: React.FC<AuthenticatedAppV2Props> = () => (
  <SparksProvider>
    <AppInner />
  </SparksProvider>
);
