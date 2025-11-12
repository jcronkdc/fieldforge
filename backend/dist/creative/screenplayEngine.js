"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Screenplay Engine - Convert stories to professional screenplay format
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToScreenplay = convertToScreenplay;
exports.formatScreenplayText = formatScreenplayText;
exports.getUserScreenplays = getUserScreenplays;
exports.getScreenplayWithScenes = getScreenplayWithScenes;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const aiClient_js_1 = require("./aiClient.js");
const mythacoinRepository_js_1 = require("../mythacoin/mythacoinRepository.js");
const aiTierSystem_js_1 = require("./aiTierSystem.js");
const env = (0, env_js_1.loadEnv)();
// Format story as screenplay
async function convertToScreenplay(data) {
    // Check user's AI tier
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'screenplay');
    if (!canUse) {
        throw new Error("Screenplay feature requires Creator tier or higher");
    }
    const prompt = `Convert the following story into professional screenplay format.

Title: ${data.title}
Format: ${data.format || 'feature'}
Genre: ${data.genre || 'drama'}

Story Content:
${data.storyContent}

Please format as a professional screenplay with:
1. Proper scene headings (INT./EXT. LOCATION - TIME)
2. Action lines (present tense, concise)
3. Character names (CENTERED, CAPS)
4. Dialogue (indented properly)
5. Parentheticals where needed
6. Appropriate transitions

Return as JSON with structure:
{
  "logline": "One sentence summary",
  "scenes": [
    {
      "scene_number": 1,
      "scene_heading": "INT. LOCATION - DAY",
      "action_lines": ["Action description..."],
      "dialogue_blocks": [
        {
          "character": "CHARACTER NAME",
          "parenthetical": "(optional)",
          "dialogue": "What they say"
        }
      ],
      "transition": "CUT TO:"
    }
  ]
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 4000,
        temperature: 0.7
    });
    // Consume tokens
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'screenplay', 4000);
    const screenplayData = JSON.parse(response.content);
    // Save to database
    const result = await (0, database_js_1.query)(`INSERT INTO screenplay_projects (
      user_id, title, logline, genre, format, 
      screenplay_data, ai_generated, page_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`, [
        data.userId,
        data.title,
        screenplayData.logline,
        data.genre || 'drama',
        data.format || 'feature',
        JSON.stringify(screenplayData),
        true,
        Math.ceil(data.storyContent.length / 150) // Rough page estimate
    ]);
    const screenplay = result.rows[0];
    // Save individual scenes
    for (const scene of screenplayData.scenes) {
        await (0, database_js_1.query)(`INSERT INTO screenplay_scenes (
        screenplay_id, scene_number, scene_heading,
        action_lines, dialogue_blocks, transitions,
        scene_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            screenplay.id,
            scene.scene_number,
            scene.scene_heading,
            scene.action_lines,
            JSON.stringify(scene.dialogue_blocks),
            scene.transition,
            scene.scene_number
        ]);
    }
    // Charge Sparks
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: 50,
        transactionType: 'spend',
        description: 'Screenplay conversion',
        metadata: { screenplayId: screenplay.id }
    });
    return screenplay;
}
// Format screenplay for display/export
function formatScreenplayText(screenplay) {
    const data = screenplay.screenplay_data;
    let output = '';
    // Title page
    output += `${screenplay.title.toUpperCase()}\n\n`;
    if (screenplay.logline) {
        output += `"${screenplay.logline}"\n\n`;
    }
    output += `FADE IN:\n\n`;
    // Format each scene
    for (const scene of data.scenes) {
        // Scene heading
        output += `${scene.scene_heading}\n\n`;
        // Action lines
        for (const action of scene.action_lines) {
            output += `${action}\n\n`;
        }
        // Dialogue blocks
        for (const block of scene.dialogue_blocks) {
            output += `\t\t\t${block.character}\n`;
            if (block.parenthetical) {
                output += `\t\t${block.parenthetical}\n`;
            }
            output += `\t\t${block.dialogue}\n\n`;
        }
        // Transition
        if (scene.transition) {
            output += `\t\t\t\t\t\t${scene.transition}\n\n`;
        }
    }
    output += 'FADE OUT.\n\nTHE END';
    return output;
}
// Get user's screenplays
async function getUserScreenplays(userId) {
    const result = await (0, database_js_1.query)(`SELECT * FROM screenplay_projects 
     WHERE user_id = $1 
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
// Get screenplay with scenes
async function getScreenplayWithScenes(screenplayId) {
    const screenplayResult = await (0, database_js_1.query)(`SELECT * FROM screenplay_projects WHERE id = $1`, [screenplayId]);
    const scenesResult = await (0, database_js_1.query)(`SELECT * FROM screenplay_scenes 
     WHERE screenplay_id = $1 
     ORDER BY scene_order`, [screenplayId]);
    return {
        ...screenplayResult.rows[0],
        scenes: scenesResult.rows
    };
}
