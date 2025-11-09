/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Pre-built Angry Lips Templates - 20 Fun Templates for All Ages
 */

export interface PrebuiltTemplate {
  id: string;
  title: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: string;
  template: string;
  blankCount: number;
  estimatedTime: string;
  tags: string[];
}

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  // ============ EASY TEMPLATES (7-10 years) ============
  {
    id: 'magical-pet',
    title: 'My Magical Pet',
    genre: 'fantasy',
    difficulty: 'easy',
    ageGroup: '7+',
    template: 'I have a magical [ANIMAL] named [NAME]. It can [VERB] through walls and loves to eat [FOOD]. Every [TIME OF DAY], we go on adventures to the [PLACE] where we search for [PLURAL NOUN]. My pet\'s favorite toy is a [ADJECTIVE] [OBJECT] that glows [COLOR] in the dark!',
    blankCount: 9,
    estimatedTime: '5-10 min',
    tags: ['animals', 'magic', 'adventure', 'kids']
  },
  {
    id: 'pizza-disaster',
    title: 'The Great Pizza Disaster',
    genre: 'comedy',
    difficulty: 'easy',
    ageGroup: '7+',
    template: 'Yesterday, I tried to make a [ADJECTIVE] pizza with [TOPPING] and [TOPPING]. But when I opened the oven, the pizza had turned into a [CREATURE]! It started [VERB ENDING IN -ING] around the kitchen, throwing [PLURAL NOUN] everywhere. My [FAMILY MEMBER] screamed and hid under the [FURNITURE]!',
    blankCount: 8,
    estimatedTime: '5-10 min',
    tags: ['food', 'funny', 'chaos', 'family']
  },
  {
    id: 'superhero-origin',
    title: 'Superhero Origin Story',
    genre: 'action',
    difficulty: 'easy',
    ageGroup: '7+',
    template: 'I got my superpowers when a [ADJECTIVE] [OBJECT] from outer space hit me while I was [VERB ENDING IN -ING]. Now I can [SUPERPOWER] and [SUPERPOWER]! My superhero name is [SUPERHERO NAME] and I protect [CITY NAME] from evil [PLURAL NOUN]. My weakness is [FOOD OR OBJECT]!',
    blankCount: 9,
    estimatedTime: '5-10 min',
    tags: ['superheroes', 'powers', 'action', 'origin']
  },
  {
    id: 'school-adventure',
    title: 'Crazy Day at School',
    genre: 'comedy',
    difficulty: 'easy',
    ageGroup: '7+',
    template: 'Today at school, our [SUBJECT] teacher turned into a [ANIMAL]! The principal announced that lunch would be [FOOD] covered in [LIQUID]. During recess, we played [SPORT] with [PLURAL NOUN] instead of balls. My best friend [NAME] accidentally [PAST TENSE VERB] the [SCHOOL ROOM]!',
    blankCount: 8,
    estimatedTime: '5-10 min',
    tags: ['school', 'funny', 'friends', 'chaos']
  },

  // ============ MEDIUM TEMPLATES (10-15 years) ============
  {
    id: 'time-travel',
    title: 'Time Travel Mishap',
    genre: 'sci-fi',
    difficulty: 'medium',
    ageGroup: '10+',
    template: 'I accidentally traveled to the year [YEAR] when my [ELECTRONIC DEVICE] malfunctioned. The first person I met was [HISTORICAL FIGURE] who was [VERB ENDING IN -ING] a [ADJECTIVE] [VEHICLE]. They told me that in this timeline, [PLURAL NOUN] rule the world and everyone must [VERB] three times a day. To get home, I need to find a [RARE OBJECT] hidden in the [LANDMARK].',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['time-travel', 'sci-fi', 'adventure', 'history']
  },
  {
    id: 'zombie-apocalypse',
    title: 'Zombie Survival Guide',
    genre: 'horror',
    difficulty: 'medium',
    ageGroup: '13+',
    template: 'Day [NUMBER] of the zombie apocalypse. The zombies are attracted to [NOUN] and afraid of [PLURAL NOUN]. Our group leader, [NAME], insists we head to [LOCATION] where supposedly there\'s a cure made from [LIQUID] and [PLANT]. We\'re armed with [WEAPON] and [HOUSEHOLD ITEM]. The zombies make a [ADJECTIVE] [SOUND] when they\'re near.',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['zombies', 'survival', 'horror', 'adventure']
  },
  {
    id: 'dating-disaster',
    title: 'Worst Date Ever',
    genre: 'romance',
    difficulty: 'medium',
    ageGroup: '13+',
    template: 'I took my crush to [RESTAURANT/PLACE] for our first date. They ordered [WEIRD FOOD] with extra [CONDIMENT]. Suddenly, their ex, [NAME], burst in riding a [ANIMAL] and declared their love using a [MUSICAL INSTRUMENT]. My date then revealed they collect [PLURAL OBJECTS] and have a pet [CREATURE] named [PET NAME]. The night ended when [CELEBRITY] crashed into our table!',
    blankCount: 9,
    estimatedTime: '10-15 min',
    tags: ['romance', 'comedy', 'dating', 'disaster']
  },
  {
    id: 'video-game',
    title: 'Trapped in a Video Game',
    genre: 'adventure',
    difficulty: 'medium',
    ageGroup: '10+',
    template: 'I got sucked into my favorite game, [VIDEO GAME NAME]! My character class is [CLASS/JOB] and my special ability is [ABILITY]. The main boss is a giant [CREATURE] that shoots [PLURAL NOUN] from its [BODY PART]. To defeat it, I need to collect [NUMBER] [MAGICAL ITEMS] hidden in the [ADJECTIVE] [LOCATION]. My companion is a talking [OBJECT] named [NAME].',
    blankCount: 11,
    estimatedTime: '10-15 min',
    tags: ['gaming', 'adventure', 'fantasy', 'quest']
  },
  {
    id: 'talent-show',
    title: 'School Talent Show Chaos',
    genre: 'comedy',
    difficulty: 'medium',
    ageGroup: '10+',
    template: 'At the school talent show, [NAME] performed [TALENT] while wearing a [ADJECTIVE] [COSTUME]. The judges were [CELEBRITY], [FICTIONAL CHARACTER], and our [SCHOOL STAFF MEMBER]. Everything went wrong when someone\'s pet [ANIMAL] escaped and started [VERB ENDING IN -ING] on stage. The grand prize was a lifetime supply of [FOOD] and a trip to [PLACE].',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['school', 'performance', 'comedy', 'competition']
  },

  // ============ HARD TEMPLATES (15+ years) ============
  {
    id: 'murder-mystery',
    title: 'Murder at the Mansion',
    genre: 'mystery',
    difficulty: 'hard',
    ageGroup: '15+',
    template: 'Detective [LAST NAME] arrived at the [ADJECTIVE] mansion where [VICTIM NAME] was found dead, clutching a [OBJECT]. The suspects included the [OCCUPATION] who was [VERB ENDING IN -ING] in the [ROOM], the victim\'s [RELATIONSHIP] who had [PAST TENSE VERB] about [SECRET], and a mysterious [ADJECTIVE] stranger carrying [WEAPON]. The killer left behind only a [CLUE] and the scent of [SMELL].',
    blankCount: 12,
    estimatedTime: '15-20 min',
    tags: ['mystery', 'crime', 'detective', 'suspense']
  },
  {
    id: 'alien-invasion',
    title: 'First Contact',
    genre: 'sci-fi',
    difficulty: 'hard',
    ageGroup: '15+',
    template: 'The aliens from planet [PLANET NAME] arrived in ships shaped like [PLURAL OBJECTS]. Their leader, [ALIEN NAME], communicated by [VERB ENDING IN -ING] their [BODY PART]. They demanded Earth\'s entire supply of [RESOURCE] and threatened to turn our [LIQUID] into [SUBSTANCE]. The President responded by offering them [PLURAL NOUN] and a recording of [MUSICIAN/BAND]. Surprisingly, they were allergic to [COMMON ITEM].',
    blankCount: 10,
    estimatedTime: '15-20 min',
    tags: ['aliens', 'sci-fi', 'invasion', 'diplomacy']
  },
  {
    id: 'startup-pitch',
    title: 'Silicon Valley Startup Pitch',
    genre: 'business',
    difficulty: 'hard',
    ageGroup: '16+',
    template: 'Our startup, [COMPANY NAME], is the Uber of [INDUSTRY]. We use [BUZZWORD] technology and [BUZZWORD] algorithms to disrupt the [TRADITIONAL BUSINESS] industry. Our app connects [TYPE OF PERSON] with [TYPE OF PERSON] who need [SERVICE]. We\'re seeking [DOLLAR AMOUNT] in funding to scale our [ADJECTIVE] platform. Our main competitor is [COMPANY] but we\'re [COMPARATIVE ADJECTIVE] because we have [UNIQUE FEATURE].',
    blankCount: 11,
    estimatedTime: '15-20 min',
    tags: ['business', 'tech', 'startup', 'comedy']
  },
  {
    id: 'dystopian-future',
    title: 'Year 2084',
    genre: 'dystopian',
    difficulty: 'hard',
    ageGroup: '15+',
    template: 'In 2084, the world is ruled by [CORPORATION/ENTITY]. Citizens must [VERB] every [TIME PERIOD] or face exile to the [ADJECTIVE] wastelands. Food is replaced by [SUBSTANCE] pills that taste like [FLAVOR]. The resistance, led by [NAME] "The [ADJECTIVE] [NOUN]", plans to destroy the [IMPORTANT BUILDING] using modified [HOUSEHOLD ITEMS]. Love is illegal unless approved by the [DEPARTMENT NAME].',
    blankCount: 11,
    estimatedTime: '15-20 min',
    tags: ['dystopia', 'future', 'rebellion', 'sci-fi']
  },

  // ============ SPECIAL THEMED TEMPLATES ============
  {
    id: 'cooking-show',
    title: 'Celebrity Cooking Disaster',
    genre: 'comedy',
    difficulty: 'medium',
    ageGroup: '10+',
    template: 'On today\'s episode, Chef [NAME] attempts to make [FANCY DISH] using only [KITCHEN TOOL] and [KITCHEN TOOL]. The secret ingredient is [UNUSUAL FOOD]. Celebrity guest [CELEBRITY] accidentally adds [CONDIMENT] instead of [INGREDIENT]. The dish explodes, covering the audience in [ADJECTIVE] [SUBSTANCE]. Gordon Ramsay shouts "[EXCLAMATION]!" and storms off.',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['cooking', 'celebrity', 'disaster', 'TV']
  },
  {
    id: 'fantasy-quest',
    title: 'Epic Fantasy Quest',
    genre: 'fantasy',
    difficulty: 'medium',
    ageGroup: '10+',
    template: 'The prophecy speaks of a [ADJECTIVE] hero who will find the [MAGICAL OBJECT] of [ANCIENT NAME]. Armed with a [WEAPON] and accompanied by a [ADJECTIVE] [MYTHICAL CREATURE], you must cross the [TERRAIN] of [OMINOUS NAME]. The evil [TITLE] [VILLAIN NAME] has cursed the land with eternal [WEATHER CONDITION]. Only the power of [EMOTION] can break the spell.',
    blankCount: 11,
    estimatedTime: '10-15 min',
    tags: ['fantasy', 'quest', 'magic', 'adventure']
  },
  {
    id: 'social-media',
    title: 'Going Viral',
    genre: 'modern',
    difficulty: 'medium',
    ageGroup: '13+',
    template: 'My video of [ACTION] while wearing [CLOTHING ITEM] got [BIG NUMBER] views! [CELEBRITY] commented "[COMMENT]" and now everyone\'s doing the [ADJECTIVE] [DANCE NAME] challenge. Brands are offering me [PRODUCT] sponsorships. My mom thinks I should quit [ACTIVITY] and become a professional [JOB]. The haters say I\'m just copying [INFLUENCER].',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['social-media', 'viral', 'modern', 'fame']
  },
  {
    id: 'sports-championship',
    title: 'The Big Game',
    genre: 'sports',
    difficulty: 'easy',
    ageGroup: '7+',
    template: 'With [NUMBER] seconds left, [PLAYER NAME] grabbed the [SPORTS EQUIPMENT] and [PAST TENSE VERB] toward the goal. The crowd went [ADJECTIVE]! The opposing team\'s mascot, a giant [ANIMAL], started [VERB ENDING IN -ING] on the sidelines. The final score was [NUMBER] to [NUMBER]. We celebrated with [FOOD] and [BEVERAGE]!',
    blankCount: 10,
    estimatedTime: '5-10 min',
    tags: ['sports', 'competition', 'victory', 'team']
  },
  {
    id: 'band-formation',
    title: 'Starting a Band',
    genre: 'music',
    difficulty: 'medium',
    ageGroup: '13+',
    template: 'Our band "[BAND NAME]" plays [MUSIC GENRE] mixed with [MUSIC GENRE]. I play the [INSTRUMENT], [NAME] plays [INSTRUMENT] with their [BODY PART], and our drummer only uses [HOUSEHOLD ITEMS]. Our hit song "[SONG TITLE]" is about [TOPIC]. We got kicked out of [VENUE] for being too [ADJECTIVE]. Our manager is a [OCCUPATION] who insists we wear [CLOTHING STYLE].',
    blankCount: 12,
    estimatedTime: '10-15 min',
    tags: ['music', 'band', 'creative', 'performance']
  },
  {
    id: 'wedding-chaos',
    title: 'Wedding Day Disasters',
    genre: 'romance',
    difficulty: 'medium',
    ageGroup: '15+',
    template: 'At [NAME] and [NAME]\'s wedding, the flower girl threw [PLURAL OBJECTS] instead of petals. The best man\'s speech mentioned the groom\'s ex, [NAME], and their trip to [PLACE]. The wedding cake was accidentally replaced with a [FOOD ITEM] shaped like a [OBJECT]. The DJ only played [MUSIC ARTIST] remixes. The priest turned out to be [CELEBRITY] in disguise!',
    blankCount: 9,
    estimatedTime: '10-15 min',
    tags: ['wedding', 'romance', 'chaos', 'celebration']
  },
  {
    id: 'haunted-house',
    title: 'The Haunted House',
    genre: 'horror',
    difficulty: 'medium',
    ageGroup: '13+',
    template: 'The old [LAST NAME] house has been empty since the [ADJECTIVE] incident of [YEAR]. Legend says if you say "[PHRASE]" three times in the [ROOM], the ghost of [NAME] appears holding a [OBJECT]. We found [PLURAL NOUN] arranged in a circle and heard [SOUND] coming from the [PART OF HOUSE]. The walls were covered in [SUBSTANCE].',
    blankCount: 10,
    estimatedTime: '10-15 min',
    tags: ['horror', 'ghost', 'haunted', 'mystery']
  }
];

// Helper function to get templates by difficulty
export function getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): PrebuiltTemplate[] {
  return PREBUILT_TEMPLATES.filter(t => t.difficulty === difficulty);
}

// Helper function to get templates by age group
export function getTemplatesForAge(age: number): PrebuiltTemplate[] {
  if (age < 10) {
    return PREBUILT_TEMPLATES.filter(t => t.ageGroup === '7+');
  } else if (age < 13) {
    return PREBUILT_TEMPLATES.filter(t => t.ageGroup === '7+' || t.ageGroup === '10+');
  } else if (age < 15) {
    return PREBUILT_TEMPLATES.filter(t => t.ageGroup !== '15+' && t.ageGroup !== '16+');
  } else {
    return PREBUILT_TEMPLATES;
  }
}

// Helper function to get random template
export function getRandomTemplate(): PrebuiltTemplate {
  const index = Math.floor(Math.random() * PREBUILT_TEMPLATES.length);
  return PREBUILT_TEMPLATES[index];
}

// Helper function to get template by ID
export function getTemplateById(id: string): PrebuiltTemplate | undefined {
  return PREBUILT_TEMPLATES.find(t => t.id === id);
}
