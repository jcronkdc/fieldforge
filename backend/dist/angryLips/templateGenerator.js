"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = generateTemplate;
const SLOT_ORDER = [
    "verb",
    "verb_past",
    "verb_ing",
    "adjective",
    "adverb",
    "number",
    "exclamation",
    "animal",
    "color",
    "body_part",
    "place",
    "person_name",
    "occupation",
    "emotion",
    "food",
    "liquid",
    "vehicle",
    "celebrity",
    "object",
    "sound",
    "relative",
    "clothing",
    "silly_word",
];
const SLOT_DEFS = {
    verb: {
        prompt: "Verb",
        description: "Action word in present tense — something happening right now.",
        example: "sprint",
    },
    verb_past: {
        prompt: "Verb (past tense)",
        description: "Action that already happened.",
        example: "hacked",
    },
    verb_ing: {
        prompt: "Verb (ending in -ing)",
        description: "Action in progress or ongoing.",
        example: "glitching",
    },
    adjective: {
        prompt: "Adjective",
        description: "Word that describes a noun.",
        example: "luminous",
    },
    adverb: {
        prompt: "Adverb",
        description: "Word that describes how an action happens.",
        example: "urgently",
    },
    number: {
        prompt: "Number",
        description: "Any number helps track scale or stakes.",
        example: "47",
    },
    exclamation: {
        prompt: "Exclamation / Interjection",
        description: "A quick burst of feeling or surprise.",
        example: "Blast!",
    },
    animal: {
        prompt: "Animal",
        description: "Any creature, real or imagined.",
        example: "manta ray",
    },
    color: {
        prompt: "Color",
        description: "Shade, hue, or combination of colors.",
        example: "crimson",
    },
    body_part: {
        prompt: "Body Part",
        description: "Part of a body or anatomy.",
        example: "left antenna",
    },
    place: {
        prompt: "Place",
        description: "Location, setting, or realm.",
        example: "floating market",
    },
    person_name: {
        prompt: "Person’s Name",
        description: "Name, alias, or handle.",
        example: "Nova Vance",
    },
    occupation: {
        prompt: "Occupation",
        description: "Job, role, or calling.",
        example: "timeline archivist",
    },
    emotion: {
        prompt: "Emotion",
        description: "Feeling or mood.",
        example: "awe",
    },
    food: {
        prompt: "Food",
        description: "Anything edible or tasty.",
        example: "starfruit tart",
    },
    liquid: {
        prompt: "Liquid",
        description: "Any fluid, mundane or exotic.",
        example: "aurora syrup",
    },
    vehicle: {
        prompt: "Vehicle",
        description: "Something used for transport.",
        example: "hoverbike",
    },
    celebrity: {
        prompt: "Celebrity",
        description: "Famous person (real or in-universe).",
        example: "Celeste Halo",
    },
    object: {
        prompt: "Object / Thing",
        description: "Physical item or artifact.",
        example: "quantum compass",
    },
    sound: {
        prompt: "Sound / Noise",
        description: "Distinct noise, tone, or effect.",
        example: "static hiss",
    },
    relative: {
        prompt: "Relative",
        description: "Family connection or chosen kin.",
        example: "great-aunt",
    },
    clothing: {
        prompt: "Clothing Item",
        description: "Something someone can wear.",
        example: "gravity boots",
    },
    silly_word: {
        prompt: "Silly Word",
        description: "Playful nonsense or made-up slang.",
        example: "zizzle",
    },
};
function generateTemplate(options) {
    const blanks = buildBlankCandidates();
    const placeholders = blanks.map((blank) => `[[${blank.id.toUpperCase()}::${blank.slot}]]`);
    const [verb, verbPast, verbIng, adjective, adverb, number, exclamation, animal, color, bodyPart, place, personName, occupation, emotion, food, liquid, vehicle, celebrity, object, sound, relative, clothing, sillyWord,] = placeholders;
    const segments = [
        `${exclamation}! We must ${verb} the vault before the timer flashes ${number} times.`,
        `We already ${verbPast} across the ${place}, so ${personName} — our ${occupation} — double-checks the ${object}.`,
        `Our ${adjective} crew keeps ${verbIng} ${adverb}, feeding off pure ${emotion} to stay focused.`,
        `A ${color} ${animal} bumps everyone's ${bodyPart} for luck while passing around ${food}.`,
        `${personName} tops off the ${vehicle} with ${liquid}, bragging that even ${celebrity} approved of the recipe.`,
        `A burst of ${sound} from ${relative}'s comm reminds us to pack the spare ${clothing} labeled "${sillyWord}".`,
    ];
    const intro = buildGenreIntro(options.genre, place, personName, verb, verbIng);
    segments.unshift(intro);
    if (options.length !== "quick") {
        segments.push(`After the reveal, we ${verbIng} toward the ${place} again, chanting ${sillyWord} in perfect ${adverb} rhythm.`);
    }
    if (options.length === "epic") {
        segments.push(`By the time the ${vehicle} lifts off, ${relative} is humming along with the ${sound} while ${celebrity} streams the victory.`);
    }
    const templateText = segments.join(" ");
    const originalText = templateText.replace(/\[\[[^\]]+\]\]/g, "_____");
    const tagCounts = blanks.reduce((acc, blank) => {
        acc[blank.slot] = (acc[blank.slot] ?? 0) + 1;
        return acc;
    }, {});
    return {
        template: templateText,
        originalText,
        blanks,
        metadata: {
            wordCount: originalText.trim().split(/\s+/).filter(Boolean).length,
            blankCount: blanks.length,
            tagCounts,
        },
    };
}
function buildBlankCandidates() {
    return SLOT_ORDER.map((slot, index) => {
        const descriptor = SLOT_DEFS[slot];
        return {
            id: `${slot}_${index + 1}`,
            slot,
            prompt: descriptor.prompt,
            description: descriptor.description,
            example: descriptor.example,
        };
    });
}
function buildGenreIntro(genre, place, personName, verb, verbIng) {
    const normalized = genre.toLowerCase();
    if (normalized.includes("heist")) {
        return `In the neon glow of the ${place}, ${personName} signals it's time to ${verb}.`;
    }
    if (normalized.includes("fantasy") || normalized.includes("myth")) {
        return `Legends whisper that ${personName} is ${verbIng} toward the ${place} as destiny stirs.`;
    }
    if (normalized.includes("comedy")) {
        return `Somehow we ended up back at the ${place}, where ${personName} tries to ${verb} without laughing.`;
    }
    return `Inside the ${place}, ${personName} cues the squad to ${verb} before anyone hesitates.`;
}
