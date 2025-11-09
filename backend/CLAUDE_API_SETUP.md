# 🤖 Claude API Setup for MythaTron

## 📍 Two Options for Using Claude

### Option 1: Direct Anthropic API (Your Claude API Key)
If you have a Claude API key from Anthropic directly:

1. **Create `.env` file in backend folder:**
```bash
cd backend
cp example.env .env
```

2. **Add to `.env`:**
```env
# Direct Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
AI_PROVIDER_URL=https://api.anthropic.com/v1
AI_PROVIDER_API_KEY=sk-ant-api03-YOUR-KEY-HERE
AI_PROVIDER_MODEL=claude-3-haiku-20240307
```

### Option 2: OpenRouter (Recommended - Works with Multiple Models)
OpenRouter lets you use Claude, GPT-4, and many other models with one API key:

1. **Sign up at:** https://openrouter.ai
2. **Get your API key from:** https://openrouter.ai/keys
3. **Add to `.env`:**
```env
# OpenRouter Configuration (for Claude via OpenRouter)
AI_PROVIDER_URL=https://openrouter.ai/api/v1
AI_PROVIDER_API_KEY=sk-or-v1-YOUR-OPENROUTER-KEY-HERE
AI_PROVIDER_MODEL=anthropic/claude-3-haiku
```

## 🔧 Current Configuration Check

The code is currently configured to:
1. Look for `AI_PROVIDER_API_KEY` (not ANTHROPIC_API_KEY directly)
2. Use OpenRouter as the default endpoint
3. Default to `claude-3-haiku` model

## ✅ To Set Up Your Claude API:

### If you have an Anthropic Claude API key:

1. **Update your `.env` file:**
```env
# Your Claude Configuration
AI_PROVIDER_URL=https://api.anthropic.com/v1
AI_PROVIDER_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
AI_PROVIDER_MODEL=claude-3-haiku-20240307
```

2. **Update the AI client to work with Anthropic directly:**

In `backend/src/creative/aiClient.ts`, change line 6:
```typescript
// FROM:
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

// TO:
const DEFAULT_BASE_URL = "https://api.anthropic.com/v1";
```

And update the request format (lines 50-58) to match Anthropic's API:
```typescript
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": resolvedKey,  // Anthropic uses x-api-key
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify(body),
});
```

## 🎯 Quick Test

To test if your API is working:

1. **Create a test file `backend/test-claude.js`:**
```javascript
require('dotenv').config();

const apiKey = process.env.AI_PROVIDER_API_KEY || process.env.ANTHROPIC_API_KEY;
console.log('API Key configured:', apiKey ? 'Yes ✅' : 'No ❌');
console.log('Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'Not set');
```

2. **Run it:**
```bash
cd backend
node test-claude.js
```

## 📝 Environment Variables Needed

```env
# Option A: Direct Anthropic
AI_PROVIDER_URL=https://api.anthropic.com/v1
AI_PROVIDER_API_KEY=sk-ant-api03-YOUR-KEY
AI_PROVIDER_MODEL=claude-3-haiku-20240307

# Option B: OpenRouter (easier, works with multiple models)
AI_PROVIDER_URL=https://openrouter.ai/api/v1
AI_PROVIDER_API_KEY=sk-or-v1-YOUR-KEY
AI_PROVIDER_MODEL=anthropic/claude-3-haiku
```

## ⚠️ Common Issues

1. **"AI provider API key is not configured"**
   - Make sure `AI_PROVIDER_API_KEY` is set (not just ANTHROPIC_API_KEY)

2. **"401 Unauthorized"**
   - Check your API key is correct
   - Make sure you're using the right endpoint URL

3. **"Model not found"**
   - Anthropic direct: use `claude-3-haiku-20240307`
   - OpenRouter: use `anthropic/claude-3-haiku`
