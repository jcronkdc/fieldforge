"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * Story Enhancement Features - AI-powered story additions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrologue = generatePrologue;
exports.generateEpilogue = generateEpilogue;
exports.generateTableOfContents = generateTableOfContents;
exports.generateCharacterProfiles = generateCharacterProfiles;
exports.generateMarketingCopy = generateMarketingCopy;
exports.getStoryEnhancements = getStoryEnhancements;
const pg_1 = require("pg");
const env_js_1 = require("../worker/env.js");
const aiClient_js_1 = require("./aiClient.js");
const mythacoinRepository_js_1 = require("../mythacoin/mythacoinRepository.js");
const aiTierSystem_js_1 = require("./aiTierSystem.js");
const env = (0, env_js_1.loadEnv)();
const pool = new pg_1.Pool({ connectionString: env.DATABASE_URL });
async function query(text, params) {
    return pool.query(text, params);
}
const ENHANCEMENT_COSTS = {
    prologue: 40,
    epilogue: 40,
    summary: 20,
    table_of_contents: 15,
    character_profiles: 30,
    world_building: 50,
    cover_letter: 25,
    marketing_copy: 35
};
// Generate prologue for story
async function generatePrologue(data) {
    // Check user tier
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'enhancements');
    if (!canUse) {
        throw new Error("Story enhancements require Professional tier or higher");
    }
    const prompt = `Write a compelling prologue for this story that:
1. Sets the tone and atmosphere
2. Hints at the main conflict without revealing too much
3. Introduces key themes
4. Hooks the reader immediately
5. Is approximately 300-500 words

Story Title: ${data.storyTitle}
Desired Tone: ${data.tone || 'mysterious and engaging'}

Main Story:
${data.storyContent.substring(0, 3000)}...

Write a prologue that draws readers in and makes them want to read more.`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1500,
        temperature: 0.8
    });
    // Consume tokens
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'enhancements', 1500, 'claude-3-opus');
    // Save enhancement
    const result = await query(`INSERT INTO story_enhancements (
      story_id, user_id, enhancement_type, content,
      metadata, cost_sparks, ai_model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        data.storyId,
        data.userId,
        'prologue',
        response.content,
        JSON.stringify({ tone: data.tone }),
        ENHANCEMENT_COSTS.prologue,
        'claude-3-opus'
    ]);
    // Charge Sparks
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: ENHANCEMENT_COSTS.prologue,
        transactionType: 'spend',
        description: 'Prologue generation',
        metadata: { storyId: data.storyId, enhancementId: result.rows[0].id }
    });
    return result.rows[0];
}
// Generate epilogue
async function generateEpilogue(data) {
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'enhancements');
    if (!canUse) {
        throw new Error("Story enhancements require Professional tier or higher");
    }
    const prompt = `Write a satisfying epilogue for this story that:
1. Shows the long-term consequences of the story's events
2. Provides closure for main characters
3. ${data.yearsLater ? `Takes place ${data.yearsLater} years after the main story` : 'Takes place sometime after the main story'}
4. Leaves readers with a lasting impression
5. Is approximately 300-500 words

Story Title: ${data.storyTitle}

Main Story (focusing on ending):
${data.storyContent.substring(data.storyContent.length - 3000)}

Create an epilogue that provides satisfying closure while leaving some mystery.`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1500,
        temperature: 0.8
    });
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'enhancements', 1500, 'claude-3-opus');
    const result = await query(`INSERT INTO story_enhancements (
      story_id, user_id, enhancement_type, content,
      metadata, cost_sparks, ai_model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        data.storyId,
        data.userId,
        'epilogue',
        response.content,
        JSON.stringify({ yearsLater: data.yearsLater }),
        ENHANCEMENT_COSTS.epilogue,
        'claude-3-opus'
    ]);
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: ENHANCEMENT_COSTS.epilogue,
        transactionType: 'spend',
        description: 'Epilogue generation',
        metadata: { storyId: data.storyId }
    });
    return result.rows[0];
}
// Generate table of contents
async function generateTableOfContents(data) {
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'enhancements');
    if (!canUse) {
        throw new Error("Story enhancements require Professional tier or higher");
    }
    const prompt = `Create a detailed table of contents for this story.

Story Title: ${data.storyTitle}
Suggested Chapters: ${data.chapterCount || 'auto-detect'}

Story Content:
${data.storyContent}

Generate a table of contents with:
1. Creative chapter titles (not just "Chapter 1")
2. Brief description for each chapter
3. Page estimates
4. Natural story breaks

Return as JSON:
{
  "chapters": [
    {
      "number": 1,
      "title": "Creative Title",
      "description": "Brief summary",
      "estimated_pages": 15
    }
  ]
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1000,
        temperature: 0.7
    });
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'enhancements', 1000);
    const tocData = JSON.parse(response.content);
    const result = await query(`INSERT INTO story_enhancements (
      story_id, user_id, enhancement_type, content,
      metadata, cost_sparks, ai_model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        data.storyId,
        data.userId,
        'table_of_contents',
        JSON.stringify(tocData),
        JSON.stringify({ chapterCount: tocData.chapters.length }),
        ENHANCEMENT_COSTS.table_of_contents,
        'claude-3-sonnet'
    ]);
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: ENHANCEMENT_COSTS.table_of_contents,
        transactionType: 'spend',
        description: 'Table of contents generation',
        metadata: { storyId: data.storyId }
    });
    return result.rows[0];
}
// Generate character profiles
async function generateCharacterProfiles(data) {
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'enhancements');
    if (!canUse) {
        throw new Error("Story enhancements require Professional tier or higher");
    }
    const prompt = `Analyze this story and create detailed character profiles for all major and supporting characters.

Story Content:
${data.storyContent}

For each character, provide:
1. Full name
2. Age and physical description
3. Personality traits
4. Backstory/history
5. Motivations and goals
6. Relationships with other characters
7. Character arc/development
8. Key quotes

Return as JSON:
{
  "characters": [
    {
      "name": "Character Name",
      "role": "protagonist/antagonist/supporting",
      "age": "age or age range",
      "description": "physical description",
      "personality": ["trait1", "trait2"],
      "backstory": "brief history",
      "motivations": ["goal1", "goal2"],
      "relationships": {"other_character": "relationship type"},
      "arc": "character development",
      "quotes": ["memorable quote"]
    }
  ]
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-opus-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 2000,
        temperature: 0.7
    });
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'enhancements', 2000, 'claude-3-opus');
    const profileData = JSON.parse(response.content);
    const result = await query(`INSERT INTO story_enhancements (
      story_id, user_id, enhancement_type, content,
      metadata, cost_sparks, ai_model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        data.storyId,
        data.userId,
        'character_profiles',
        JSON.stringify(profileData),
        JSON.stringify({ characterCount: profileData.characters.length }),
        ENHANCEMENT_COSTS.character_profiles,
        'claude-3-opus'
    ]);
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: ENHANCEMENT_COSTS.character_profiles,
        transactionType: 'spend',
        description: 'Character profiles generation',
        metadata: { storyId: data.storyId }
    });
    return result.rows[0];
}
// Generate marketing copy
async function generateMarketingCopy(data) {
    const canUse = await (0, aiTierSystem_js_1.checkUserAITier)(data.userId, 'enhancements');
    if (!canUse) {
        throw new Error("Story enhancements require Professional tier or higher");
    }
    const prompt = `Create compelling marketing copy for this story.

Story Title: ${data.storyTitle}
Target Audience: ${data.targetAudience || 'general readers'}

Story Summary:
${data.storyContent.substring(0, 2000)}

Generate:
1. Tagline (one sentence hook)
2. Short synopsis (50 words)
3. Back cover copy (150-200 words)
4. Marketing blurb for social media (280 characters)
5. Keywords/tags for discoverability

Return as JSON:
{
  "tagline": "compelling one-liner",
  "short_synopsis": "50 word summary",
  "back_cover": "full back cover text",
  "social_media": "tweet-length promo",
  "keywords": ["keyword1", "keyword2"]
}`;
    const response = await (0, aiClient_js_1.runCreativeCompletion)({
        model: "claude-3-sonnet-20240229",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1000,
        temperature: 0.8
    });
    await (0, aiTierSystem_js_1.consumeAITokens)(data.userId, 'enhancements', 1000);
    const marketingData = JSON.parse(response.content);
    const result = await query(`INSERT INTO story_enhancements (
      story_id, user_id, enhancement_type, content,
      metadata, cost_sparks, ai_model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        data.storyId,
        data.userId,
        'marketing_copy',
        JSON.stringify(marketingData),
        JSON.stringify({ targetAudience: data.targetAudience }),
        ENHANCEMENT_COSTS.marketing_copy,
        'claude-3-sonnet'
    ]);
    await (0, mythacoinRepository_js_1.recordTransaction)({
        userId: data.userId,
        amount: ENHANCEMENT_COSTS.marketing_copy,
        transactionType: 'spend',
        description: 'Marketing copy generation',
        metadata: { storyId: data.storyId }
    });
    return result.rows[0];
}
// Get all enhancements for a story
async function getStoryEnhancements(storyId, userId) {
    const result = await query(`SELECT * FROM story_enhancements 
     WHERE story_id = $1 AND user_id = $2
     ORDER BY created_at DESC`, [storyId, userId]);
    return result.rows;
}
