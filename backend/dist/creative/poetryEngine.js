"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Poetry Engine - Generate poems from narratives with various forms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToPoem = convertToPoem;
exports.analyzeLiteraryDevices = analyzeLiteraryDevices;
exports.formatPoemText = formatPoemText;
exports.createAnthology = createAnthology;
exports.getUserPoems = getUserPoems;
exports.createPoetryDuel = createPoetryDuel;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const aiClient_js_1 = require("./aiClient.js");
const mythacoinRepository_js_1 = require("../mythacoin/mythacoinRepository.js");
const aiTierSystem_js_1 = require("./aiTierSystem.js");
const env = (0, env_js_1.loadEnv)();
const POETRY_FORMS = {
    haiku: {
        structure: '5-7-5 syllables',
        lines: 3,
        description: 'Japanese form capturing a moment in nature'
    },
    sonnet: {
        structure: '14 lines, iambic pentameter, ABAB CDCD EFEF GG',
        lines: 14,
        description: 'Classical form exploring love or philosophical themes'
    },
    limerick: {
        structure: 'AABBA rhyme scheme, humorous',
        lines: 5,
        description: 'Humorous five-line poem with distinctive rhythm'
    },
    free_verse: {
        structure: 'No fixed structure',
        lines: null,
        description: 'Modern form without regular rhyme or meter'
    },
    ballad: {
        structure: 'Quatrains with ABAB or ABCB rhyme',
        lines: null,
        description: 'Narrative poem often set to music'
    },
    ode: {
        structure: 'Formal, often three-part structure',
        lines: null,
        description: 'Celebratory poem addressing a subject'
    },
    tanka: {
        structure: '5-7-5-7-7 syllables',
        lines: 5,
        description: 'Japanese form, longer than haiku'
    },
    cinquain: {
        structure: '2-4-6-8-2 syllables',
        lines: 5,
        description: 'Five-line poem with increasing syllables'
    },
    acrostic: {
        structure: 'First letters spell a word',
        lines: null,
        description: 'First letter of each line spells a message'
    },
    villanelle: {
        structure: '19 lines, 5 tercets + quatrain, ABA rhyme',
        lines: 19,
        description: 'Complex form with repeating refrains'
    }
};
// Convert story to poem
async function convertToPoem(data) {
    // Check user's AI tier for poetry
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'poetry');
    if (!canUse && data.form !== 'haiku' && data.form !== 'free_verse') {
        throw new Error("Advanced poetry forms require Creator tier or higher");
    }
    const selectedForm = data.form || 'free_verse';
    const formInfo = POETRY_FORMS[selectedForm];
    const prompt = `Transform this story into a ${selectedForm} poem.

Story Title: ${data.title}
Poetry Form: ${selectedForm}
Form Structure: ${formInfo.structure}
Theme: ${data.theme?.join(', ') || 'universal'}
Mood: ${data.mood || 'contemplative'}

Story Content:
${data.storyContent}

Create a beautiful ${selectedForm} that:
1. Follows the traditional structure of ${formInfo.structure}
2. Captures the essence of the story
3. Uses vivid imagery and metaphors
4. Maintains consistent voice and tone
5. Includes literary devices (alliteration, assonance, etc.)

Return as JSON:
{
  "stanzas": [
    {
      "number": 1,
      "lines": ["line1", "line2", "line3"],
      "rhyme_pattern": "ABA"
    }
  ],
  "meter_analysis": {
    "pattern": "iambic pentameter",
    "syllables_per_line": [10, 10, 10]
  },
  "literary_devices": [
    {
      "type": "metaphor",
      "example": "specific example",
      "line": 2
    }
  ],
  "theme_summary": "Brief thematic analysis"
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: selectedForm === 'haiku' ? "claude-3-haiku-20240307" : "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 2000,
        temperature: 0.9
    });
    // Consume tokens
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'poetry', 2000);
    const poemData = JSON.parse(response.content);
    // Count words and lines
    let wordCount = 0;
    let lineCount = 0;
    poemData.stanzas.forEach((stanza) => {
        stanza.lines.forEach((line) => {
            wordCount += line.split(/\s+/).length;
            lineCount++;
        });
    });
    // Save to database
    const result = await (0, database_js_1.query)(`INSERT INTO poetry_projects (
      user_id, title, form, theme, mood,
      stanzas, meter_analysis, rhyme_analysis,
      literary_devices, word_count, line_count,
      ai_generated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`, [
        data.userId,
        data.title,
        selectedForm,
        data.theme || ['universal'],
        data.mood || 'contemplative',
        JSON.stringify(poemData.stanzas),
        JSON.stringify(poemData.meter_analysis),
        JSON.stringify(poemData.rhyme_analysis || {}),
        JSON.stringify(poemData.literary_devices || []),
        wordCount,
        lineCount,
        true
    ]);
    // Charge Sparks (less for simpler forms)
    const cost = selectedForm === 'haiku' ? 5 : selectedForm === 'limerick' ? 10 : 20;
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: cost,
        transactionType: 'spend',
        description: `${selectedForm} poem creation`,
        metadata: { poemId: result.rows[0].id }
    });
    return result.rows[0];
}
// Analyze poem for literary devices
function analyzeLiteraryDevices(text) {
    const devices = [];
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        // Check for alliteration
        const words = line.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
            if (words[i][0] === words[i + 1][0] && /^[a-z]/.test(words[i][0])) {
                devices.push({
                    type: 'alliteration',
                    example: `${words[i]} ${words[i + 1]}`,
                    line: index + 1
                });
                break;
            }
        }
        // Check for repetition
        const wordCounts = {};
        words.forEach(word => {
            word = word.replace(/[.,!?;:]/, '');
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        Object.entries(wordCounts).forEach(([word, count]) => {
            if (count > 1 && word.length > 3) {
                devices.push({
                    type: 'repetition',
                    example: word,
                    line: index + 1
                });
            }
        });
    });
    return devices;
}
// Format poem for display
function formatPoemText(poem) {
    let output = `${poem.title}\n`;
    if (poem.poet_name) {
        output += `by ${poem.poet_name}\n`;
    }
    output += `\nForm: ${poem.form}\n`;
    if (poem.theme && poem.theme.length > 0) {
        output += `Theme: ${poem.theme.join(', ')}\n`;
    }
    output += '\n---\n\n';
    const stanzas = poem.stanzas;
    stanzas.forEach((stanza, index) => {
        stanza.lines.forEach((line) => {
            output += `${line}\n`;
        });
        // Add space between stanzas (except after last)
        if (index < stanzas.length - 1) {
            output += '\n';
        }
    });
    return output;
}
// Create poetry anthology
async function createAnthology(data) {
    const result = await (0, database_js_1.query)(`INSERT INTO poetry_anthology (
      user_id, title, description, poem_ids,
      is_public, price_sparks
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`, [
        data.userId,
        data.title,
        data.description,
        data.poemIds,
        data.isPublic || false,
        data.priceSparks || 0
    ]);
    return result.rows[0];
}
// Get user's poems
async function getUserPoems(userId) {
    const result = await (0, database_js_1.query)(`SELECT * FROM poetry_projects 
     WHERE user_id = $1 
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
// Poetry duel/competition
async function createPoetryDuel(data) {
    // This would create a competitive poetry writing session
    // Implementation would involve real-time collaboration
    // and voting mechanisms similar to Angry Lips
    return {
        id: 'duel_' + Date.now(),
        ...data,
        status: 'pending'
    };
}
