/**
 * Sparks Costs Configuration - Clear pricing for all features
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

export const SPARKS_COSTS = {
  // AI Features
  ai: {
    storyGeneration: {
      cost: 10,
      label: 'AI Story Generation',
      description: 'Generate a complete story with AI',
    },
    storyEnhancement: {
      cost: 5,
      label: 'AI Story Enhancement',
      description: 'Improve existing story with AI suggestions',
    },
    characterCreation: {
      cost: 8,
      label: 'AI Character Creation',
      description: 'Generate a detailed character with backstory',
    },
    dialogueGeneration: {
      cost: 3,
      label: 'AI Dialogue',
      description: 'Generate realistic dialogue for scenes',
    },
    plotSuggestions: {
      cost: 2,
      label: 'Plot Ideas',
      description: 'Get AI suggestions for plot development',
    },
  },

  // Angry Lips Features
  angryLips: {
    hostSession: {
      cost: 0,
      label: 'Host Session',
      description: 'Free to host Angry Lips sessions',
    },
    joinSession: {
      cost: 0,
      label: 'Join Session',
      description: 'Free to join existing sessions',
    },
    aiAssist: {
      cost: 5,
      label: 'AI Assistant',
      description: 'Get AI help during your turn',
    },
    convertToStory: {
      cost: 15,
      label: 'Convert to Story',
      description: 'Transform session into polished story',
    },
    convertToScreenplay: {
      cost: 20,
      label: 'Convert to Screenplay',
      description: 'Professional screenplay formatting',
    },
    convertToSong: {
      cost: 25,
      label: 'Convert to Song',
      description: 'Create lyrics and structure from session',
    },
  },

  // Story Features
  stories: {
    create: {
      cost: 0,
      label: 'Create Story',
      description: 'Free to write your own stories',
    },
    branch: {
      cost: 0,
      label: 'Branch Story',
      description: 'Free to create story branches',
    },
    aiContinue: {
      cost: 8,
      label: 'AI Continue',
      description: 'AI writes the next chapter',
    },
    aiEdit: {
      cost: 5,
      label: 'AI Editor',
      description: 'AI editing and improvement suggestions',
    },
    publish: {
      cost: 0,
      label: 'Publish',
      description: 'Free to publish to community',
    },
    promote: {
      cost: 50,
      label: 'Promote Story',
      description: 'Feature your story for 7 days',
    },
  },

  // RPG Features
  rpg: {
    createWorld: {
      cost: 0,
      label: 'Create World',
      description: 'Free to build your RPG world',
    },
    aiWorldBuilder: {
      cost: 30,
      label: 'AI World Builder',
      description: 'Generate complete RPG world with AI',
    },
    aiQuestGenerator: {
      cost: 10,
      label: 'AI Quest Generator',
      description: 'Create engaging quests automatically',
    },
    aiNPCGenerator: {
      cost: 5,
      label: 'AI NPC Generator',
      description: 'Generate NPCs with personalities',
    },
  },

  // Social Features
  social: {
    message: {
      cost: 0,
      label: 'Send Message',
      description: 'Free messaging between creators',
    },
    giftSparks: {
      cost: 0, // Plus the Sparks gifted
      label: 'Gift Sparks',
      description: 'Send Sparks to other creators',
    },
    tipCreator: {
      cost: 0, // Plus the tip amount
      label: 'Tip Creator',
      description: 'Support creators with Sparks',
    },
  },

  // Premium Features
  premium: {
    customTheme: {
      cost: 100,
      label: 'Custom Theme',
      description: 'Personalize your profile theme',
    },
    verifiedBadge: {
      cost: 500,
      label: 'Verified Badge',
      description: 'Get verified creator status',
    },
    analyticsAccess: {
      cost: 0, // Included in Professional+
      label: 'Analytics',
      description: 'Detailed analytics dashboard',
    },
  },
} as const;

// Helper functions
export function getSparksCost(category: keyof typeof SPARKS_COSTS, feature: string): number {
  return (SPARKS_COSTS[category] as any)[feature]?.cost || 0;
}

export function formatSparksCost(cost: number): string {
  if (cost === 0) return 'FREE';
  return `${cost} Sparks`;
}

export function calculateDollarValue(sparks: number): string {
  // Average value: 3 cents per Spark
  const dollars = (sparks * 0.03).toFixed(2);
  return `≈ $${dollars}`;
}

// Subscription benefits
export const SUBSCRIPTION_BENEFITS = {
  free: {
    aiUsesPerMonth: 3,
    includedSparks: 0,
    features: [
      'Create unlimited stories',
      'Join Angry Lips sessions',
      'Basic themes',
      'Community access',
    ],
  },
  creator: {
    aiUsesPerMonth: 50,
    includedSparks: 500,
    monthlyPrice: 9.99,
    features: [
      'Everything in Free',
      '50 AI uses per month',
      '500 Sparks monthly',
      'Priority support',
      'Early access to features',
      'Custom themes',
    ],
  },
  professional: {
    aiUsesPerMonth: -1, // Unlimited
    includedSparks: 1200,
    monthlyPrice: 19.99,
    features: [
      'Everything in Creator',
      'Unlimited AI uses',
      '1,200 Sparks monthly',
      'Advanced analytics',
      'API access (coming soon)',
      'Priority processing',
    ],
  },
  enterprise: {
    aiUsesPerMonth: -1, // Unlimited
    includedSparks: 3000,
    monthlyPrice: 49.99,
    features: [
      'Everything in Professional',
      '3,000 Sparks monthly',
      'Dedicated support',
      'Custom integrations',
      'Team management',
      'White-label options',
    ],
  },
};

// Quick purchase options
export const QUICK_RELOAD_OPTIONS = [
  { sparks: 50, price: 2.99, popular: false },
  { sparks: 100, price: 4.99, popular: true },
  { sparks: 250, price: 9.99, popular: false },
  { sparks: 500, price: 17.99, popular: false },
];

// Bulk packages
export const SPARK_PACKAGES = [
  { 
    name: 'Starter',
    sparks: 100,
    bonus: 0,
    price: 4.99,
    savings: 0,
  },
  { 
    name: 'Creator',
    sparks: 500,
    bonus: 50,
    price: 19.99,
    savings: 20,
    popular: true,
  },
  { 
    name: 'Professional',
    sparks: 1000,
    bonus: 150,
    price: 34.99,
    savings: 30,
  },
  { 
    name: 'Legend',
    sparks: 2500,
    bonus: 500,
    price: 79.99,
    savings: 35,
  },
  { 
    name: 'Mega',
    sparks: 5000,
    bonus: 1500,
    price: 149.99,
    savings: 40,
  },
];
