export interface StoryHighlight {
  id: string;
  title: string;
  genre: string;
  mood: string;
  tags: string[];
  snippet: string;
  world: string;
  author: string;
  remixCount: number;
  isCanon: boolean;
  paceBucket: "rapid" | "moderate" | "leisurely";
  readTime: number;
  artUrl?: string;
}

export const stories: StoryHighlight[] = [
  {
    id: "story-001",
    title: "Neon Reverie",
    genre: "Science Fiction",
    mood: "Electric",
    tags: ["cyberpunk", "heist", "ai"],
    snippet:
      "Vex vaulted across a holo-crosswalk just as the Grid glitched, the smuggled companion AI flickering in her palms like a trapped aurora.",
    world: "City of Thousand Codes",
    author: "@kyotoSignal",
    remixCount: 42,
    isCanon: true,
    paceBucket: "rapid",
    readTime: 2,
    artUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-002",
    title: "Harvest Moon Heist",
    genre: "Fantasy Comedy",
    mood: "Whimsical",
    tags: ["witches", "heist", "kitchen"],
    snippet:
      "Three novice witches hovered over the royal pantry skylight, whispering incantations between giggles while a bewitched whisk paced anxiously below.",
    world: "Cauldron Collective",
    author: "@briarpatch",
    remixCount: 31,
    isCanon: false,
    paceBucket: "moderate",
    readTime: 3,
    artUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-003",
    title: "Retro Tape #47",
    genre: "Mystery",
    mood: "Uneasy",
    tags: ["analog", "ghost", "detective"],
    snippet:
      "The cassette wheezed to life, and a stranger’s voice calmly narrated how you would react to the message you were currently hearing.",
    world: "Echoes of Apartment 12B",
    author: "@noirwave",
    remixCount: 18,
    isCanon: false,
    paceBucket: "leisurely",
    readTime: 4,
    artUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-004",
    title: "The Librarian of Wind",
    genre: "Magical Realism",
    mood: "Hopeful",
    tags: ["library", "wind", "memory"],
    snippet:
      "Each gust that rattled the floating shelves delivered a forgotten memory, and today the librarian caught one with your name stitched into its spine.",
    world: "Atlas of Whispering Isles",
    author: "@islewalker",
    remixCount: 24,
    isCanon: true,
    paceBucket: "moderate",
    readTime: 3,
    artUrl: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-005",
    title: "Signal Lost",
    genre: "Sci-Fi Thriller",
    mood: "Tense",
    tags: ["space", "crew", "countdown"],
    snippet:
      "The crew had 180 seconds to reboot the last beacon, and the only one small enough to crawl inside the conduit was the stowaway kid nobody trusted yet.",
    world: "Orbital Echo",
    author: "@relayghost",
    remixCount: 39,
    isCanon: true,
    paceBucket: "rapid",
    readTime: 2,
  },
  {
    id: "story-006",
    title: "Auroral Choir",
    genre: "Space Opera",
    mood: "Triumphant",
    tags: ["orchestra", "nebula", "rebellion"],
    snippet:
      "The rebel conductor raised her baton and the nebula itself began to sing, drowning out the empire’s broadcast in a cascade of color.",
    world: "Nebula Choir",
    author: "@stellarhythm",
    remixCount: 27,
    isCanon: false,
    paceBucket: "moderate",
    readTime: 3,
    artUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-007",
    title: "Verdant Wildcall",
    genre: "Eco Fantasy",
    mood: "Ferocious",
    tags: ["forest", "beasts", "ritual"],
    snippet:
      "When the canopy drums thundered, every creature of the Verdant Wildcall turned as one toward the intruders dragging chains through the moss.",
    world: "Verdant Wildcall",
    author: "@rootweaver",
    remixCount: 33,
    isCanon: true,
    paceBucket: "rapid",
    readTime: 2,
    artUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-008",
    title: "Clockwork Bazaar",
    genre: "Steampunk Mystery",
    mood: "Curious",
    tags: ["clockwork", "market", "puzzle"],
    snippet:
      "Every stall in the bazaar ticked in unison until a single cog went missing, and suddenly time itself began to haggle.",
    world: "Clockwork Bazaar",
    author: "@gearling",
    remixCount: 22,
    isCanon: false,
    paceBucket: "moderate",
    readTime: 3,
    artUrl: "https://images.unsplash.com/photo-1512427691650-1e0c4aa12266?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-009",
    title: "Midnight Archive",
    genre: "Urban Fantasy",
    mood: "Mysterious",
    tags: ["librarian", "moonlight", "pact"],
    snippet:
      "At midnight the archive unspooled a staircase of moonlight, and the seeker was asked to trade their oldest secret for entry.",
    world: "Midnight Archive",
    author: "@inkthreshold",
    remixCount: 19,
    isCanon: true,
    paceBucket: "leisurely",
    readTime: 4,
    artUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "story-010",
    title: "Crimson Circuit",
    genre: "Tech Thriller",
    mood: "Urgent",
    tags: ["grid", "runaway", "pulse"],
    snippet:
      "The Crimson Circuit lit up like a second sunrise, and every runner knew that whoever reached the hub first would rewrite the city’s power map.",
    world: "Crimson Circuit",
    author: "@pulsecaster",
    remixCount: 28,
    isCanon: false,
    paceBucket: "rapid",
    readTime: 2,
    artUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  },
];

