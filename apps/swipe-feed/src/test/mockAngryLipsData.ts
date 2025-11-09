/**
 * Mock data generator for testing Angry Lips sessions
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

// Simple UUID generator for testing
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isBot?: boolean;
}

export interface MockSession {
  id: string;
  hostId: string;
  title: string;
  genre: string;
  templateSource: string;
  templateLength: string;
  templateText: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  participants: MockUser[];
  currentTurn: number;
  totalTurns: number;
  responses: string[];
  createdAt: string;
  pausedAt?: string;
  resumedAt?: string;
}

// Generate mock users for testing
export const mockUsers: MockUser[] = [
  {
    id: 'user-host',
    username: '@mythatron',
    displayName: 'MythaTron (You)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mythatron',
    isBot: false,
  },
  {
    id: 'user-alice',
    username: '@storyweaver',
    displayName: 'Alice Storyweaver',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    isBot: false,
  },
  {
    id: 'user-bob',
    username: '@wordsmith',
    displayName: 'Bob Wordsmith',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    isBot: false,
  },
  {
    id: 'user-charlie',
    username: '@narratorpro',
    displayName: 'Charlie Narrator',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    isBot: false,
  },
  {
    id: 'user-ai',
    username: '@aicohost',
    displayName: 'AI Co-Host',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai',
    isBot: true,
  },
];

// Sample templates for different genres
export const sampleTemplates = {
  heist: {
    template: "The crew gathered at [BLANK_1], each member carrying [BLANK_2]. 'Tonight, we steal [BLANK_3],' whispered the leader, pointing at [BLANK_4]. The getaway driver revved [BLANK_5], ready to escape through [BLANK_6].",
    blanks: ['location', 'equipment', 'target', 'obstacle', 'vehicle', 'route'],
  },
  scifi: {
    template: "Captain [BLANK_1] discovered [BLANK_2] floating near the [BLANK_3]. The ship's AI warned about [BLANK_4], but the crew decided to [BLANK_5] anyway. Suddenly, [BLANK_6] appeared on the viewscreen.",
    blanks: ['name', 'object', 'location', 'danger', 'action', 'phenomenon'],
  },
  fantasy: {
    template: "The wizard pulled out [BLANK_1] from their [BLANK_2] and cast a spell on [BLANK_3]. The dragon responded by [BLANK_4], causing the entire [BLANK_5] to [BLANK_6].",
    blanks: ['item', 'container', 'target', 'action', 'location', 'reaction'],
  },
  romance: {
    template: "Their eyes met across the [BLANK_1], and suddenly [BLANK_2] didn't matter anymore. 'You remind me of [BLANK_3],' they said, holding out [BLANK_4]. The music changed to [BLANK_5], and they both [BLANK_6].",
    blanks: ['location', 'problem', 'comparison', 'object', 'song', 'action'],
  },
  horror: {
    template: "The [BLANK_1] creaked open, revealing [BLANK_2] covered in [BLANK_3]. From the shadows, [BLANK_4] emerged, carrying [BLANK_5]. 'Welcome to [BLANK_6],' it whispered.",
    blanks: ['door', 'object', 'substance', 'creature', 'item', 'place'],
  },
};

// Sample responses for testing
export const sampleResponses = {
  heist: [
    'the abandoned warehouse on 5th street',
    'rubber chickens and smoke grenades',
    'the world\'s largest collection of vintage memes',
    'a wall made entirely of jello',
    'a unicycle with rocket boosters',
    'the underground tunnel system filled with disco balls',
  ],
  scifi: [
    'Sparkles McGee',
    'a rubber duck wearing a tiny spacesuit',
    'interdimensional taco stand',
    'space pirates with terrible singing voices',
    'challenge them to a dance-off',
    'a giant space hamster doing the macarena',
  ],
  fantasy: [
    'a moldy sandwich',
    'bottomless bag of holding',
    'the kingdom\'s tax forms',
    'filing a formal complaint with HR',
    'enchanted porta-potty',
    'spontaneously break into a musical number',
  ],
};

// Generate a mock session
export function generateMockSession(
  genre: keyof typeof sampleTemplates = 'heist',
  status: MockSession['status'] = 'draft'
): MockSession {
  const template = sampleTemplates[genre];
  const sessionId = uuidv4();
  
  return {
    id: sessionId,
    hostId: mockUsers[0].id,
    title: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Adventure #${Math.floor(Math.random() * 100)}`,
    genre,
    templateSource: 'generated',
    templateLength: 'medium',
    templateText: template.template,
    status,
    participants: mockUsers.slice(0, 4), // Host + 3 players
    currentTurn: 0,
    totalTurns: template.blanks.length,
    responses: [],
    createdAt: new Date().toISOString(),
  };
}

// Generate responses for a session
export function generateMockResponses(session: MockSession): string[] {
  const responseSet = sampleResponses[session.genre as keyof typeof sampleResponses] || sampleResponses.heist;
  return responseSet.slice(0, session.totalTurns);
}

// Simulate session progression
export function progressSession(session: MockSession, response?: string): MockSession {
  if (session.currentTurn >= session.totalTurns) {
    return { ...session, status: 'completed' };
  }

  const newResponses = [...session.responses];
  if (response) {
    newResponses.push(response);
  } else {
    // Auto-generate response if not provided
    const responseSet = sampleResponses[session.genre as keyof typeof sampleResponses] || sampleResponses.heist;
    newResponses.push(responseSet[session.currentTurn] || `[AI Generated Response ${session.currentTurn + 1}]`);
  }

  return {
    ...session,
    status: 'active',
    currentTurn: session.currentTurn + 1,
    responses: newResponses,
  };
}

// Pause a session
export function pauseSession(session: MockSession): MockSession {
  if (session.status !== 'active') {
    throw new Error('Can only pause active sessions');
  }
  
  return {
    ...session,
    status: 'paused',
    pausedAt: new Date().toISOString(),
  };
}

// Resume a session
export function resumeSession(session: MockSession): MockSession {
  if (session.status !== 'paused') {
    throw new Error('Can only resume paused sessions');
  }
  
  return {
    ...session,
    status: 'active',
    resumedAt: new Date().toISOString(),
  };
}

// Generate final story from responses
export function generateFinalStory(session: MockSession): string {
  if (session.responses.length !== session.totalTurns) {
    throw new Error('Session not complete');
  }

  let story = session.templateText;
  session.responses.forEach((response, index) => {
    story = story.replace(`[BLANK_${index + 1}]`, `**${response}**`);
  });

  return story;
}

// Convert story to different formats
export function convertStory(story: string, format: 'screenplay' | 'poem' | 'song'): string {
  const lines = story.split('. ').filter(l => l.length > 0);
  
  switch (format) {
    case 'screenplay':
      return `FADE IN:

INT. MYSTERIOUS LOCATION - NIGHT

${lines.map((line, i) => {
  if (i % 2 === 0) {
    return `ACTION: ${line}.`;
  } else {
    return `CHARACTER ${Math.floor(i/2) + 1}: "${line}."`;
  }
}).join('\n\n')}

FADE OUT.`;

    case 'poem':
      return `${lines.map((line, i) => {
        const words = line.split(' ');
        if (i % 2 === 0) {
          return `    ${line},`;
        } else {
          return `${line},\n`;
        }
      }).join('\n')}
      
And thus the tale was told,
Of adventures brave and bold.`;

    case 'song':
      return `[Verse 1]
${lines.slice(0, 2).join('\n')}

[Chorus]
Oh, what a story we've created,
Every blank that we have stated,
Together we have narrated,
This tale so complicated!

[Verse 2]
${lines.slice(2, 4).join('\n')}

[Bridge]
${lines.slice(4).join('\n')}

[Outro]
And that's how our story goes,
From beginning to the close!`;

    default:
      return story;
  }
}

// Save session to localStorage
export function saveSessionToStorage(session: MockSession): void {
  const key = `angry_lips_session_${session.id}`;
  const savedSessions = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
  
  if (!savedSessions.includes(key)) {
    savedSessions.push(key);
    localStorage.setItem('angry_lips_sessions', JSON.stringify(savedSessions));
  }
  
  localStorage.setItem(key, JSON.stringify(session));
}

// Load session from localStorage
export function loadSessionFromStorage(sessionId: string): MockSession | null {
  const key = `angry_lips_session_${sessionId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data) as MockSession;
  } catch (error) {
    console.error('Failed to parse session data:', error);
    return null;
  }
}

// Get all saved sessions
export function getAllSavedSessions(): MockSession[] {
  const savedSessionKeys = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
  const sessions: MockSession[] = [];
  
  for (const key of savedSessionKeys) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        sessions.push(JSON.parse(data));
      } catch (error) {
        console.error(`Failed to parse session ${key}:`, error);
      }
    }
  }
  
  return sessions;
}

// Clear all saved sessions
export function clearAllSessions(): void {
  const savedSessionKeys = JSON.parse(localStorage.getItem('angry_lips_sessions') || '[]');
  
  for (const key of savedSessionKeys) {
    localStorage.removeItem(key);
  }
  
  localStorage.removeItem('angry_lips_sessions');
}
