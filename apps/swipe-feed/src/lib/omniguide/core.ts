/**
 * OMNIGUIDE AI SYSTEM - Core Module
 * Platform's embedded AI assistant with full system authority
 */

import { FocusedView } from '../../components/AuthenticatedAppV2';

export interface OmniGuideContext {
  userId: string;
  userTier: 'free' | 'standard' | 'pro';
  currentView: FocusedView;
  sparksBalance: number;
  permissions: string[];
  sessionHistory: string[];
  activeErrors: SystemError[];
  pageData?: any;
}

import { searchKnowledge, getRelatedTopics, OMNIGUIDE_KNOWLEDGE } from './knowledgeBase';

// Conversation memory interface
export interface ConversationMemory {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  context: Record<string, any>;
  preferences: Record<string, any>;
}

export interface SystemError {
  id: string;
  type: 'connection' | 'permission' | 'configuration' | 'runtime' | 'payment';
  message: string;
  timestamp: number;
  resolved: boolean;
  context?: any;
}

export interface OmniGuideResponse {
  message: string;
  actions?: SystemAction[];
  navigation?: NavigationAction;
  troubleshooting?: TroubleshootingStep[];
  requiresUpgrade?: UpgradePrompt;
  feedbackRequest?: FeedbackRequest;
  confidence: number;
}

export interface FeedbackRequest {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemAction {
  type: 'execute' | 'navigate' | 'purchase' | 'reset' | 'verify';
  label: string;
  command: string;
  params?: any;
  requiresPremium?: boolean;
}

export interface NavigationAction {
  view: FocusedView;
  params?: any;
  description: string;
}

export interface TroubleshootingStep {
  step: number;
  instruction: string;
  verification?: string;
  fallback?: string;
}

export interface UpgradePrompt {
  tier: 'standard' | 'pro';
  features: string[];
  price: number;
  sparksRequired: number;
  ctaText: string;
}

export class OmniGuideCore {
  private context: OmniGuideContext;
  private apiKey: string;
  private model: 'gpt-4.1' | 'grok-2';
  private memoryStore: Map<string, any>;
  private conversationMemory: ConversationMemory;
  private knowledgeBase = OMNIGUIDE_KNOWLEDGE;

  constructor(context: OmniGuideContext, apiKey: string, model: 'gpt-4.1' | 'grok-2' = 'gpt-4.1') {
    this.context = context;
    this.apiKey = apiKey;
    this.model = model;
    this.memoryStore = new Map();
    
    // Initialize conversation memory
    this.conversationMemory = this.loadMemory();
  }

  /**
   * Load conversation memory from localStorage
   */
  private loadMemory(): ConversationMemory {
    const stored = localStorage.getItem('omniguide_memory');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load memory');
      }
    }
    
    return {
      messages: [],
      context: {},
      preferences: {}
    };
  }

  /**
   * Save conversation memory
   */
  private saveMemory() {
    localStorage.setItem('omniguide_memory', JSON.stringify(this.conversationMemory));
  }

  /**
   * Add to conversation memory
   */
  private addToMemory(role: 'user' | 'assistant', content: string) {
    this.conversationMemory.messages.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Keep only last 50 messages
    if (this.conversationMemory.messages.length > 50) {
      this.conversationMemory.messages = this.conversationMemory.messages.slice(-50);
    }
    
    this.saveMemory();
  }

  /**
   * Process user query with full system context
   */
  async processQuery(query: string): Promise<OmniGuideResponse> {
    // Add to memory
    this.addToMemory('user', query);
    
    // Check for feedback intent
    const feedbackIntent = this.detectFeedbackIntent(query);
    if (feedbackIntent) {
      return this.handleFeedback(query, feedbackIntent);
    }

    // Check for active errors first
    const activeError = this.detectActiveError(query);
    if (activeError) {
      return this.handleError(activeError);
    }

    // Search knowledge base first
    const knowledgeResults = searchKnowledge(query);
    if (knowledgeResults.length > 0) {
      return this.handleKnowledgeResponse(query, knowledgeResults);
    }

    // Check for navigation intent but don't auto-navigate
    const navigationIntent = this.detectNavigationIntent(query);
    if (navigationIntent) {
      return this.suggestNavigation(navigationIntent);
    }

    // Check for premium feature request
    if (this.requiresPremium(query) && this.context.userTier === 'free') {
      return this.generateUpgradePrompt(query);
    }

    // Process with AI model as fallback
    return await this.processWithAI(query);
  }

  /**
   * Handle knowledge base response
   */
  private handleKnowledgeResponse(query: string, results: any[]): OmniGuideResponse {
    const primary = results[0];
    const response = primary.content;
    
    // Build actions from knowledge entry
    const actions: SystemAction[] = [];
    
    if (primary.actions) {
      primary.actions.forEach((action: string) => {
        switch(action) {
          case 'open_storyforge':
            actions.push({
              type: 'navigate',
              label: 'Open StoryForge',
              command: 'navigate',
              params: { view: 'stories' }
            });
            break;
          case 'open_songforge':
            actions.push({
              type: 'navigate',
              label: 'Open SongForge',
              command: 'navigate',
              params: { view: 'songforge' }
            });
            break;
          case 'play_angry_lips':
            actions.push({
              type: 'navigate',
              label: 'Play AngryLips',
              command: 'navigate',
              params: { view: 'angry-lips' }
            });
            break;
          case 'enter_mythaquest':
            actions.push({
              type: 'navigate',
              label: 'Enter MythaQuest',
              command: 'navigate',
              params: { view: 'mythaquest' }
            });
            break;
          case 'view_dashboard':
            actions.push({
              type: 'navigate',
              label: 'View Dashboard',
              command: 'navigate',
              params: { view: 'prologue' }
            });
            break;
          case 'buy_sparks':
            actions.push({
              type: 'navigate',
              label: 'Buy Sparks',
              command: 'navigate',
              params: { view: 'sparks-store' }
            });
            break;
        }
      });
    }
    
    // Add "Learn More" for related topics
    if (primary.related && primary.related.length > 0) {
      actions.push({
        type: 'execute',
        label: 'Related Topics',
        command: 'show.related',
        params: { topics: primary.related }
      });
    }
    
    // Save response to memory
    this.addToMemory('assistant', response);
    
    return {
      message: response,
      actions: actions.length > 0 ? actions : undefined,
      confidence: 0.95
    };
  }

  /**
   * Suggest navigation without auto-navigating
   */
  private suggestNavigation(intent: string): OmniGuideResponse {
    const viewMap: Record<string, string> = {
      'storyforge': 'stories',
      'songforge': 'songforge',
      'angry lips': 'angry-lips',
      'mythaquest': 'mythaquest',
      'dashboard': 'prologue',
      'feed': 'feed',
      'messages': 'messages',
      'settings': 'settings'
    };
    
    const view = viewMap[intent.toLowerCase()];
    
    return {
      message: `Would you like me to take you to ${intent}? I can explain how it works or navigate you there.`,
      actions: [
        {
          type: 'navigate',
          label: `Go to ${intent}`,
          command: 'navigate',
          params: { view }
        },
        {
          type: 'execute',
          label: `Tell me more`,
          command: 'explain',
          params: { topic: intent }
        }
      ],
      confidence: 0.9
    };
  }

  /**
   * Detect feedback intent from query
   */
  private detectFeedbackIntent(query: string): 'bug' | 'feature' | 'improvement' | 'general' | null {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('bug') || lowerQuery.includes('broken') || lowerQuery.includes('fix')) {
      return 'bug';
    }
    if (lowerQuery.includes('feature') || lowerQuery.includes('add') || lowerQuery.includes('request')) {
      return 'feature';
    }
    if (lowerQuery.includes('improve') || lowerQuery.includes('better') || lowerQuery.includes('enhance')) {
      return 'improvement';
    }
    if (lowerQuery.includes('feedback') || lowerQuery.includes('suggest') || lowerQuery.includes('comment')) {
      return 'general';
    }
    
    return null;
  }

  /**
   * Handle feedback submission
   */
  private handleFeedback(query: string, type: 'bug' | 'feature' | 'improvement' | 'general'): OmniGuideResponse {
    // Store feedback
    this.storeFeedback({
      type,
      message: query,
      userId: this.context.userId,
      view: this.context.currentView,
      timestamp: Date.now(),
      context: this.context
    });

    return {
      message: `Thank you for your ${type} report! I've logged this for the development team. Would you like to provide more details?`,
      feedbackRequest: {
        type,
        category: this.context.currentView,
        priority: type === 'bug' ? 'high' : 'medium'
      },
      actions: [
        {
          type: 'execute',
          label: 'Add Details',
          command: 'feedback.details',
          params: { type }
        },
        {
          type: 'navigate',
          label: 'View Feedback',
          command: 'feedback.view',
          params: { view: 'feedback' }
        }
      ],
      confidence: 1.0
    };
  }

  /**
   * Store feedback for retrieval
   */
  storeFeedback(feedback: any) {
    // Get existing feedback
    const existingFeedback = JSON.parse(localStorage.getItem('omniguide_feedback') || '[]');
    
    // Add new feedback
    existingFeedback.push(feedback);
    
    // Store back
    localStorage.setItem('omniguide_feedback', JSON.stringify(existingFeedback));
    
    // Log for analytics
    console.log('[OmniGuide Feedback]', feedback);
  }

  /**
   * Detect and categorize system errors
   */
  private detectActiveError(query: string): SystemError | null {
    const errorPatterns = [
      { pattern: /not working|broken|error|failed/i, type: 'runtime' as const },
      { pattern: /can't access|permission denied|unauthorized/i, type: 'permission' as const },
      { pattern: /connection|offline|network/i, type: 'connection' as const },
      { pattern: /payment|sparks|purchase/i, type: 'payment' as const },
      { pattern: /setting|config|preference/i, type: 'configuration' as const }
    ];

    for (const { pattern, type } of errorPatterns) {
      if (pattern.test(query)) {
        return {
          id: `error-${Date.now()}`,
          type,
          message: query,
          timestamp: Date.now(),
          resolved: false,
          context: this.context
        };
      }
    }

    // Check for existing unresolved errors
    return this.context.activeErrors.find(e => !e.resolved) || null;
  }

  /**
   * Handle system errors with troubleshooting
   */
  private handleError(error: SystemError): OmniGuideResponse {
    const troubleshootingSteps = this.getTroubleshootingSteps(error);
    
    return {
      message: `I've detected a ${error.type} issue. Let me help you resolve this.`,
      troubleshooting: troubleshootingSteps,
      actions: this.getErrorActions(error),
      confidence: 0.95
    };
  }

  /**
   * Get troubleshooting steps for error type
   */
  private getTroubleshootingSteps(error: SystemError): TroubleshootingStep[] {
    const steps: Record<SystemError['type'], TroubleshootingStep[]> = {
      connection: [
        { step: 1, instruction: 'Check your internet connection', verification: 'Can you access other websites?' },
        { step: 2, instruction: 'Refresh the page (Ctrl+R or Cmd+R)', verification: 'Has the issue persisted?' },
        { step: 3, instruction: 'Clear browser cache and cookies', fallback: 'Contact support if issue persists' }
      ],
      permission: [
        { step: 1, instruction: 'Verify you are logged in', verification: 'Check for your username in top-right' },
        { step: 2, instruction: 'Check your account tier', verification: 'This feature may require an upgrade' },
        { step: 3, instruction: 'Re-authenticate by signing out and back in', fallback: 'Contact admin for permission issues' }
      ],
      configuration: [
        { step: 1, instruction: 'Navigate to Settings', verification: 'Click the settings icon in sidebar' },
        { step: 2, instruction: 'Reset to default configuration', verification: 'Use the "Reset Defaults" button' },
        { step: 3, instruction: 'Save and refresh', fallback: 'Manual configuration may be needed' }
      ],
      runtime: [
        { step: 1, instruction: 'Refresh the current page', verification: 'Press F5 or Cmd+R' },
        { step: 2, instruction: 'Check browser console for errors', verification: 'Press F12, click Console tab' },
        { step: 3, instruction: 'Try a different browser', fallback: 'Report bug with console screenshot' }
      ],
      payment: [
        { step: 1, instruction: 'Check your Sparks balance', verification: 'View balance in sidebar' },
        { step: 2, instruction: 'Verify payment method', verification: 'Go to Settings > Billing' },
        { step: 3, instruction: 'Purchase additional Sparks', fallback: 'Contact billing support' }
      ]
    };

    return steps[error.type] || [];
  }

  /**
   * Get recovery actions for error
   */
  private getErrorActions(error: SystemError): SystemAction[] {
    const baseActions: SystemAction[] = [
      {
        type: 'reset',
        label: 'Reset Component',
        command: 'system.reset',
        params: { component: this.context.currentView }
      },
      {
        type: 'verify',
        label: 'Run Diagnostics',
        command: 'system.diagnose',
        params: { errorId: error.id }
      }
    ];

    if (error.type === 'payment') {
      baseActions.unshift({
        type: 'purchase',
        label: 'Purchase Sparks',
        command: 'sparks.purchase',
        params: { amount: 1000 }
      });
    }

    return baseActions;
  }

  /**
   * Detect navigation intent from query
   */
  private detectNavigationIntent(query: string): FocusedView | null {
    const navigationMap: Record<string, FocusedView> = {
      'dashboard|home|main': 'prologue',
      'feed|community|posts': 'feed',
      'message|chat|dm': 'messages',
      'angry lips|game': 'angry-lips',
      'story|storyforge|write': 'stories',
      'song|music|songforge': 'songforge',
      'mythaquest|rpg|quest': 'mythaquest',
      'friend|network|bookworm': 'bookworms',
      'setting|preference|config': 'settings',
      'notification|alert|update': 'notifications',
      'spark|purchase|buy': 'sparks-store'
    };

    const lowerQuery = query.toLowerCase();
    for (const [keywords, view] of Object.entries(navigationMap)) {
      if (new RegExp(keywords).test(lowerQuery)) {
        return view;
      }
    }

    return null;
  }

  /**
   * Handle navigation requests
   */
  private handleNavigation(view: FocusedView): OmniGuideResponse {
    const descriptions: Record<FocusedView, string> = {
      prologue: 'Dashboard - Your command center',
      feed: 'Community Feed - See what others are creating',
      stream: 'Live Stream - Watch real-time content',
      messages: 'Messages - Chat with other users',
      'angrylips': 'AngryLips - AI-powered word game',
      stories: 'StoryForge - Create and branch stories',
      songforge: 'SongForge - AI music creation',
      mythaquest: 'MythaQuest - Epic RPG adventure',
      bookworms: 'Friends Network - Connect with creators',
      das: 'Democratic Ads - Community-driven advertising',
      settings: 'Settings - Manage your account',
      'master-test': 'Admin Tools - System management',
      'sparks-store': 'Sparks Store - Purchase currency',
      notifications: 'Notifications - Your alerts',
      invite: 'Invite Friends - Grow your network'
    };

    return {
      message: `Navigating to ${descriptions[view]}`,
      navigation: {
        view,
        description: descriptions[view]
      },
      actions: [{
        type: 'navigate',
        label: `Go to ${view}`,
        command: `navigate.${view}`,
        params: {}
      }],
      confidence: 1.0
    };
  }

  /**
   * Check if query requires premium features
   */
  private requiresPremium(query: string): boolean {
    const premiumKeywords = [
      'advanced', 'premium', 'pro', 'unlimited',
      'ai generate', 'custom', 'export', 'analytics',
      'batch', 'automate', 'schedule', 'priority'
    ];

    const lowerQuery = query.toLowerCase();
    return premiumKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Generate upgrade prompt for premium features
   */
  private generateUpgradePrompt(query: string): OmniGuideResponse {
    const tierFeatures = {
      standard: [
        'AI Story Generation',
        'Advanced Analytics',
        'Priority Support',
        'Export Features',
        '5000 Monthly Sparks'
      ],
      pro: [
        'Unlimited AI Generation',
        'Custom Workflows',
        'API Access',
        'White-label Options',
        'Unlimited Sparks'
      ]
    };

    const recommendedTier = query.includes('unlimited') ? 'pro' : 'standard';

    return {
      message: 'This feature requires a premium subscription. Upgrade to unlock powerful capabilities.',
      requiresUpgrade: {
        tier: recommendedTier as 'standard' | 'pro',
        features: tierFeatures[recommendedTier],
        price: recommendedTier === 'pro' ? 49.99 : 19.99,
        sparksRequired: recommendedTier === 'pro' ? 0 : 2000,
        ctaText: `Upgrade to ${recommendedTier.toUpperCase()}`
      },
      actions: [{
        type: 'purchase',
        label: 'View Upgrade Options',
        command: 'upgrade.show',
        params: { tier: recommendedTier },
        requiresPremium: false
      }],
      confidence: 0.9
    };
  }

  /**
   * Process query with AI model
   */
  private async processWithAI(query: string): Promise<OmniGuideResponse> {
    // This would integrate with OpenAI or Grok API
    // For now, return a structured response
    
    const systemPrompt = `You are OmniGuide, the authoritative AI assistant for MythaTron platform.
    Current context:
    - User: ${this.context.userId}
    - Tier: ${this.context.userTier}
    - View: ${this.context.currentView}
    - Sparks: ${this.context.sparksBalance}
    
    Respond with clear, actionable guidance. Be direct and solution-focused.`;

    // Simulate AI response
    return {
      message: `I understand your request about "${query}". Based on your current context in ${this.context.currentView}, here's what you can do.`,
      actions: this.suggestActions(query),
      confidence: 0.85
    };
  }

  /**
   * Suggest relevant actions based on query
   */
  private suggestActions(query: string): SystemAction[] {
    const actions: SystemAction[] = [];

    if (query.includes('create') || query.includes('new')) {
      actions.push({
        type: 'execute',
        label: 'Create New',
        command: 'create.new',
        params: { type: this.context.currentView }
      });
    }

    if (query.includes('help') || query.includes('how')) {
      actions.push({
        type: 'execute',
        label: 'View Tutorial',
        command: 'help.tutorial',
        params: { topic: this.context.currentView }
      });
    }

    if (query.includes('share') || query.includes('invite')) {
      actions.push({
        type: 'execute',
        label: 'Share/Invite',
        command: 'social.share',
        params: {}
      });
    }

    return actions;
  }

  /**
   * Log interaction for analytics
   */
  logInteraction(query: string, response: OmniGuideResponse) {
    const interaction = {
      timestamp: Date.now(),
      userId: this.context.userId,
      tier: this.context.userTier,
      query,
      response,
      view: this.context.currentView,
      resolved: response.confidence > 0.7
    };

    // Store in memory for session
    this.memoryStore.set(`interaction-${Date.now()}`, interaction);

    // Would send to analytics backend
    console.log('[OmniGuide Analytics]', interaction);
  }

  /**
   * Update context with new information
   */
  updateContext(updates: Partial<OmniGuideContext>) {
    this.context = { ...this.context, ...updates };
  }
}
