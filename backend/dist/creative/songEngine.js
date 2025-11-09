"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Song Engine - Transform stories into songs with rhyme and meter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSong = convertToSong;
exports.formatSongText = formatSongText;
exports.getUserSongs = getUserSongs;
exports.addCollaborator = addCollaborator;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
async function query(text, params) {
    return pool.query(text, params);
}
const aiClient_js_1 = require("./aiClient.js");
const mythacoinRepository_js_1 = require("../mythacoin/mythacoinRepository.js");
const aiTierSystem_js_1 = require("./aiTierSystem.js");
// Convert story to song
async function convertToSong(data) {
    // Check user's AI tier
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'song');
    if (!canUse) {
        throw new Error("Song feature requires Creator tier or higher");
    }
    const prompt = `Transform this story into song lyrics with a catchy, memorable structure.

Story Title: ${data.title}
Genre: ${data.genre || 'pop'}
Mood: ${data.mood?.join(', ') || 'uplifting'}
Style: ${data.style || 'contemporary'}

Story Content:
${data.storyContent}

Create a complete song with:
1. Verse-Chorus-Verse-Chorus-Bridge-Chorus structure
2. Strong rhyme scheme (ABAB, AABB, etc.)
3. Consistent meter/rhythm
4. Memorable hook/chorus
5. Emotional progression
6. Singable lyrics

Return as JSON:
{
  "structure": {
    "verse1": ["line1", "line2", "line3", "line4"],
    "chorus": ["line1", "line2", "line3", "line4"],
    "verse2": ["line1", "line2", "line3", "line4"],
    "bridge": ["line1", "line2", "line3", "line4"],
    "outro": ["line1", "line2"]
  },
  "rhyme_scheme": "ABAB",
  "meter_pattern": "8-6-8-6",
  "tempo_suggestion": 120,
  "key_suggestion": "C major",
  "performance_notes": "Upbeat, energetic"
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 3000,
        temperature: 0.8
    });
    // Consume tokens
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'song', 3000);
    const songData = JSON.parse(response.content);
    // Analyze rhyme scheme
    const rhymeAnalysis = analyzeRhymeScheme(songData.structure);
    // Analyze meter
    const meterAnalysis = analyzeMeter(songData.structure);
    // Save to database
    const result = await query(`INSERT INTO song_projects (
      user_id, title, genre, mood, structure, lyrics,
      rhyme_scheme, meter_pattern, tempo, key_signature,
      ai_generated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`, [
        data.userId,
        data.title,
        data.genre || 'pop',
        data.mood || ['uplifting'],
        JSON.stringify(songData.structure),
        JSON.stringify(songData),
        songData.rhyme_scheme || rhymeAnalysis,
        songData.meter_pattern || meterAnalysis,
        songData.tempo_suggestion || 120,
        songData.key_suggestion || 'C major',
        true
    ]);
    // Charge Sparks
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: 30,
        transactionType: 'spend',
        description: 'Song conversion',
        metadata: { songId: result.rows[0].id }
    });
    return result.rows[0];
}
// Analyze rhyme scheme
function analyzeRhymeScheme(structure) {
    const schemes = [];
    for (const section in structure) {
        const lines = structure[section];
        if (Array.isArray(lines) && lines.length > 1) {
            const endWords = lines.map((line) => {
                const words = line.trim().split(' ');
                return words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]/, '');
            });
            // Simple rhyme detection
            const scheme = [];
            let currentLetter = 'A';
            const rhymeMap = {};
            endWords.forEach((word) => {
                let assigned = false;
                for (const [prevWord, letter] of Object.entries(rhymeMap)) {
                    if (doWordsRhyme(word, prevWord)) {
                        scheme.push(letter);
                        assigned = true;
                        break;
                    }
                }
                if (!assigned) {
                    scheme.push(currentLetter);
                    rhymeMap[word] = currentLetter;
                    currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
                }
            });
            schemes.push(scheme.join(''));
        }
    }
    return schemes[0] || 'ABAB';
}
// Simple rhyme detection
function doWordsRhyme(word1, word2) {
    if (!word1 || !word2)
        return false;
    // Check if last 2-3 characters match (simple approach)
    const end1 = word1.slice(-3);
    const end2 = word2.slice(-3);
    return end1 === end2 || word1.slice(-2) === word2.slice(-2);
}
// Analyze meter pattern
function analyzeMeter(structure) {
    const patterns = [];
    for (const section in structure) {
        const lines = structure[section];
        if (Array.isArray(lines)) {
            const syllableCounts = lines.map((line) => {
                // Simple syllable counting (approximate)
                return line.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
                    .reduce((count, word) => count + countSyllables(word), 0);
            });
            patterns.push(syllableCounts.join('-'));
        }
    }
    return patterns[0] || '8-6-8-6';
}
// Simple syllable counter
function countSyllables(word) {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    for (let i = 0; i < word.length; i++) {
        const isVowel = /[aeiou]/.test(word[i]);
        if (isVowel && !previousWasVowel) {
            count++;
        }
        previousWasVowel = isVowel;
    }
    // Adjust for silent e
    if (word.endsWith('e')) {
        count--;
    }
    // Ensure at least 1 syllable
    return Math.max(1, count);
}
// Format song for display
function formatSongText(song) {
    const lyrics = song.lyrics;
    let output = `${song.title}\n`;
    if (song.artist_name) {
        output += `by ${song.artist_name}\n`;
    }
    output += `\nGenre: ${song.genre}\n`;
    output += `Tempo: ${song.tempo || 120} BPM\n`;
    output += `Key: ${song.key_signature || 'C major'}\n\n`;
    const structure = lyrics.structure;
    const order = ['verse1', 'chorus', 'verse2', 'chorus', 'bridge', 'chorus', 'outro'];
    for (const section of order) {
        if (structure[section]) {
            output += `[${section.toUpperCase()}]\n`;
            for (const line of structure[section]) {
                output += `${line}\n`;
            }
            output += '\n';
        }
    }
    return output;
}
// Get user's songs
async function getUserSongs(userId) {
    const result = await query(`SELECT * FROM song_projects 
     WHERE user_id = $1 
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
// Add collaboration
async function addCollaborator(data) {
    const result = await query(`INSERT INTO song_collaborations (
      song_id, collaborator_id, role, contribution_percentage
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (song_id, collaborator_id) 
    DO UPDATE SET role = $3, contribution_percentage = $4
    RETURNING *`, [data.songId, data.collaboratorId, data.role, data.contributionPercentage || 0]);
    return result.rows[0];
}
