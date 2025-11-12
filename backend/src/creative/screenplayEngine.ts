/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Screenplay Engine - Convert stories to professional screenplay format
 */

import { loadEnv } from "../worker/env.js";
import { query } from "../database.js";
import { runCreativeCompletion } from "./aiClient.js";
import { recordTransaction } from "../mythacoin/mythacoinRepository.js";
import { checkUserAITier, consumeAITokens } from "./aiTierSystem.js";

const env = loadEnv();

export interface ScreenplayProject {
  id: string;
  user_id: string;
  source_story_id?: string;
  title: string;
  logline?: string;
  genre?: string;
  format: 'feature' | 'short' | 'tv_pilot' | 'tv_episode' | 'web_series';
  page_count: number;
  screenplay_data: any;
  settings: any;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScreenplayScene {
  id: string;
  screenplay_id: string;
  scene_number: number;
  scene_heading: string;
  action_lines: string[];
  dialogue_blocks: Array<{
    character: string;
    parenthetical?: string;
    dialogue: string;
  }>;
  transitions?: string;
  notes?: string;
  scene_order: number;
}

// Format story as screenplay
export async function convertToScreenplay(data: {
  userId: string;
  storyContent: string;
  title: string;
  format?: 'feature' | 'short' | 'tv_pilot' | 'tv_episode' | 'web_series';
  genre?: string;
}) {
  // Check user's AI tier
  const canUse = await checkUserAITier(data.userId, 'screenplay');
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

  const response = await runCreativeCompletion({
    model: "claude-3-sonnet-20240229",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 4000,
    temperature: 0.7
  });

  // Consume tokens
  await consumeAITokens(data.userId, 'screenplay', 4000);

  const screenplayData = JSON.parse(response.content);

  // Save to database
  const result = await query(
    `INSERT INTO screenplay_projects (
      user_id, title, logline, genre, format, 
      screenplay_data, ai_generated, page_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      data.userId,
      data.title,
      screenplayData.logline,
      data.genre || 'drama',
      data.format || 'feature',
      JSON.stringify(screenplayData),
      true,
      Math.ceil(data.storyContent.length / 150) // Rough page estimate
    ]
  );

  const screenplay = result.rows[0];

  // Save individual scenes
  for (const scene of screenplayData.scenes) {
    await query(
      `INSERT INTO screenplay_scenes (
        screenplay_id, scene_number, scene_heading,
        action_lines, dialogue_blocks, transitions,
        scene_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        screenplay.id,
        scene.scene_number,
        scene.scene_heading,
        scene.action_lines,
        JSON.stringify(scene.dialogue_blocks),
        scene.transition,
        scene.scene_number
      ]
    );
  }

  // Charge Sparks
  await recordTransaction({
    userId: data.userId,
    amount: 50,
    transactionType: 'spend',
    description: 'Screenplay conversion',
    metadata: { screenplayId: screenplay.id }
  });

  return screenplay;
}

// Format screenplay for display/export
export function formatScreenplayText(screenplay: ScreenplayProject): string {
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
export async function getUserScreenplays(userId: string) {
  const result = await query(
    `SELECT * FROM screenplay_projects 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Get screenplay with scenes
export async function getScreenplayWithScenes(screenplayId: string) {
  const screenplayResult = await query(
    `SELECT * FROM screenplay_projects WHERE id = $1`,
    [screenplayId]
  );

  const scenesResult = await query(
    `SELECT * FROM screenplay_scenes 
     WHERE screenplay_id = $1 
     ORDER BY scene_order`,
    [screenplayId]
  );

  return {
    ...screenplayResult.rows[0],
    scenes: scenesResult.rows
  };
}
