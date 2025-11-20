"use strict";
/**
 * Hybrid AI System - Local & Cloud Routing
 *
 * Supports:
 * - LOCAL AI: Ollama, LM Studio, LocalAI, vLLM (NDA-safe, private)
 * - CLOUD AI: Claude, GPT-4, Grok (powerful, internet-connected)
 *
 * Companies can choose:
 * - 'local' mode: All AI runs on company infrastructure
 * - 'cloud' mode: Use powerful cloud AI services
 * - 'hybrid' mode: Use local for sensitive data, cloud for general queries
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldUseLocalAI = shouldUseLocalAI;
exports.getLocalAIConfig = getLocalAIConfig;
exports.callLocalAI = callLocalAI;
exports.callCloudAI = callCloudAI;
exports.callAI = callAI;
exports.askAI = askAI;
const axios_1 = __importDefault(require("axios"));
const database_js_1 = require("../database.js");
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
/**
 * Check if company requires local-only AI (NDA compliance)
 */
async function shouldUseLocalAI(companyId, userId) {
    // Check global setting
    if (env.LOCAL_AI_ENABLED === 'true') {
        return true;
    }
    // Check company preference
    if (companyId) {
        const result = await (0, database_js_1.query)(`
      SELECT ai_mode, ai_privacy_mode
      FROM company_settings
      WHERE company_id = $1
    `, [companyId]);
        if (result.rows.length > 0) {
            const { ai_mode, ai_privacy_mode } = result.rows[0];
            return ai_mode === 'local' || ai_privacy_mode === true;
        }
    }
    // Check user's company via user_profiles
    if (userId) {
        const result = await (0, database_js_1.query)(`
      SELECT cs.ai_mode, cs.ai_privacy_mode
      FROM company_settings cs
      JOIN user_profiles up ON up.company_id = cs.company_id
      WHERE up.id = $1
    `, [userId]);
        if (result.rows.length > 0) {
            const { ai_mode, ai_privacy_mode } = result.rows[0];
            return ai_mode === 'local' || ai_privacy_mode === true;
        }
    }
    // Default to cloud if no restrictions
    return false;
}
/**
 * Get local AI configuration
 */
async function getLocalAIConfig(companyId) {
    if (companyId) {
        const result = await (0, database_js_1.query)(`
      SELECT local_ai_url, local_ai_model
      FROM company_settings
      WHERE company_id = $1
    `, [companyId]);
        if (result.rows.length > 0 && result.rows[0].local_ai_url) {
            return {
                url: result.rows[0].local_ai_url,
                model: result.rows[0].local_ai_model || 'llama3'
            };
        }
    }
    // Fall back to environment variables
    return {
        url: env.LOCAL_AI_URL || 'http://localhost:11434', // Ollama default
        model: env.LOCAL_AI_MODEL || 'llama3'
    };
}
/**
 * Call LOCAL AI (Ollama, LM Studio, LocalAI, vLLM)
 * Data NEVER leaves company infrastructure
 */
async function callLocalAI(messages, companyId) {
    const config = await getLocalAIConfig(companyId);
    try {
        console.log(`[AI] Using LOCAL AI at ${config.url} (model: ${config.model})`);
        // Support multiple local AI formats
        // Try Ollama format first (most common)
        try {
            const response = await axios_1.default.post(`${config.url}/api/generate`, {
                model: config.model,
                prompt: messages.map(m => m.content).join('\n\n'),
                stream: false
            }, {
                timeout: 30000
            });
            return {
                content: response.data.response,
                model: config.model,
                tokens: response.data.total_duration ? Math.floor(response.data.total_duration / 1000000) : undefined,
                provider: 'local',
                privacy: 'private'
            };
        }
        catch (ollamaError) {
            // Try OpenAI-compatible format (LM Studio, LocalAI, vLLM)
            const response = await axios_1.default.post(`${config.url}/v1/chat/completions`, {
                model: config.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            }, {
                timeout: 30000
            });
            return {
                content: response.data.choices[0].message.content,
                model: config.model,
                tokens: response.data.usage?.total_tokens,
                provider: 'local',
                privacy: 'private'
            };
        }
    }
    catch (error) {
        console.error('[AI] Local AI error:', error.message);
        throw new Error(`Local AI unavailable: ${error.message}. Please ensure Ollama/LM Studio is running at ${config.url}`);
    }
}
/**
 * Call CLOUD AI (Claude, GPT-4, Grok)
 * Powerful but data sent to external services
 */
async function callCloudAI(messages) {
    // Try Claude Sonnet 4.5 (most powerful)
    if (env.ANTHROPIC_API_KEY) {
        try {
            console.log('[AI] Using Claude Sonnet 4.5 (cloud)');
            const Anthropic = (await import('@anthropic-ai/sdk')).default;
            const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
            const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: messages.map(m => ({ role: m.role, content: m.content }))
            });
            return {
                content: response.content[0].type === 'text' ? response.content[0].text : '',
                model: 'claude-sonnet-4',
                tokens: response.usage.input_tokens + response.usage.output_tokens,
                provider: 'claude',
                privacy: 'cloud'
            };
        }
        catch (error) {
            console.error('[AI] Claude error, trying fallback...');
        }
    }
    // Try GPT-4 Turbo
    if (env.OPENAI_API_KEY) {
        try {
            console.log('[AI] Using GPT-4 Turbo (cloud)');
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: messages,
                max_tokens: 4096,
                temperature: 0.7
            });
            return {
                content: response.choices[0].message.content || '',
                model: 'gpt-4-turbo',
                tokens: response.usage?.total_tokens,
                provider: 'openai',
                privacy: 'cloud'
            };
        }
        catch (error) {
            console.error('[AI] OpenAI error, trying fallback...');
        }
    }
    // Try Grok
    if (env.XAI_API_KEY) {
        try {
            console.log('[AI] Using Grok (cloud)');
            const response = await axios_1.default.post('https://api.x.ai/v1/chat/completions', {
                model: 'grok-beta',
                messages: messages,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${env.XAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                content: response.data.choices[0].message.content,
                model: 'grok-beta',
                tokens: response.data.usage?.total_tokens,
                provider: 'grok',
                privacy: 'cloud'
            };
        }
        catch (error) {
            console.error('[AI] Grok error');
        }
    }
    throw new Error('No cloud AI services available');
}
/**
 * HYBRID AI ROUTER
 * Automatically chooses local or cloud based on company policy
 */
async function callAI(messages, options = {}) {
    const { companyId, userId, forceLocal, forceCloud } = options;
    // Check if local AI is required
    const requiresLocal = forceLocal || await shouldUseLocalAI(companyId, userId);
    if (requiresLocal) {
        console.log('[AI] Using LOCAL AI (NDA-safe, private)');
        return await callLocalAI(messages, companyId);
    }
    // Use cloud AI if not restricted
    if (!forceCloud) {
        console.log('[AI] Using CLOUD AI (powerful, internet-connected)');
    }
    try {
        return await callCloudAI(messages);
    }
    catch (error) {
        // Fall back to local if available
        if (env.LOCAL_AI_URL) {
            console.log('[AI] Cloud AI failed, falling back to local...');
            return await callLocalAI(messages, companyId);
        }
        throw error;
    }
}
/**
 * Simple AI call with automatic routing
 */
async function askAI(question, context, options) {
    const messages = [];
    if (context) {
        messages.push({
            role: 'system',
            content: context
        });
    }
    messages.push({
        role: 'user',
        content: question
    });
    const response = await callAI(messages, options);
    return response.content;
}
