# 🔒 Local AI Setup Guide - NDA-Safe, Private AI

## 🎯 Overview

FieldForge supports **TWO AI modes** to give you complete control over your data:

### 🌐 **CLOUD AI** (Default)
- **Providers**: Claude Sonnet 4.5, GPT-4 Turbo, Grok
- **Pros**: Most powerful, internet-connected, can pull external resources
- **Cons**: Data sent to external services (Anthropic, OpenAI, xAI)
- **Best For**: General use, non-sensitive projects

### 🔐 **LOCAL AI** (NDA-Safe)
- **Providers**: Ollama, LM Studio, LocalAI, vLLM
- **Pros**: 100% private, data NEVER leaves your infrastructure, NDA-compliant
- **Cons**: Requires local setup, slightly less powerful
- **Best For**: Companies with NDAs, sensitive projects, data sovereignty requirements

---

## 🚀 Quick Start - Local AI Setup

### Option 1: Ollama (Recommended - Easiest)

**1. Install Ollama**
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

**2. Pull a Model**
```bash
# Recommended models:
ollama pull llama3          # General purpose (4.7GB)
ollama pull mistral         # Fast responses (4.1GB)
ollama pull codellama       # Code-focused (3.8GB)
ollama pull llama3:70b      # Most powerful (39GB, requires good hardware)
```

**3. Start Ollama Server**
```bash
ollama serve
# Runs on http://localhost:11434 by default
```

**4. Configure FieldForge**

Add to your company settings:
```sql
UPDATE company_settings
SET 
  ai_mode = 'local',
  local_ai_url = 'http://localhost:11434',
  local_ai_model = 'llama3',
  ai_privacy_mode = TRUE
WHERE company_id = 'your-company-id';
```

OR set environment variables:
```bash
LOCAL_AI_ENABLED=true
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama3
```

✅ **Done!** All AI requests now run locally.

---

### Option 2: LM Studio (GUI, User-Friendly)

**1. Download LM Studio**
- Visit: https://lmstudio.ai/
- Download for your platform (Windows/Mac/Linux)

**2. Install a Model**
- Open LM Studio
- Click "Search" tab
- Popular models:
  - `TheBloke/Llama-2-13B-chat-GGUF`
  - `TheBloke/Mistral-7B-Instruct-v0.2-GGUF`
  - `TheBloke/CodeLlama-13B-Instruct-GGUF`
- Click "Download"

**3. Start Local Server**
- Click "Local Server" tab
- Select your downloaded model
- Click "Start Server"
- Runs on http://localhost:1234 by default

**4. Configure FieldForge**
```sql
UPDATE company_settings
SET 
  ai_mode = 'local',
  local_ai_url = 'http://localhost:1234',
  local_ai_model = 'llama-2-13b-chat',
  ai_privacy_mode = TRUE
WHERE company_id = 'your-company-id';
```

---

### Option 3: LocalAI (Docker, Production-Ready)

**1. Run LocalAI with Docker**
```bash
docker run -p 8080:8080 --name local-ai \
  -v $PWD/models:/models \
  localai/localai:latest

# Or with GPU support:
docker run -p 8080:8080 --gpus all \
  -v $PWD/models:/models \
  localai/localai:latest-gpu-nvidia-cuda-12
```

**2. Download Models**
```bash
# Download a model
curl -LO https://gpt4all.io/models/ggml-gpt4all-j.bin
mv ggml-gpt4all-j.bin models/
```

**3. Configure FieldForge**
```sql
UPDATE company_settings
SET 
  ai_mode = 'local',
  local_ai_url = 'http://localhost:8080',
  local_ai_model = 'ggml-gpt4all-j',
  ai_privacy_mode = TRUE
WHERE company_id = 'your-company-id';
```

---

### Option 4: vLLM (High Performance, Production Scale)

**Best for**: Companies running AI for many users simultaneously

**1. Install vLLM**
```bash
pip install vllm
```

**2. Start Server**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-13b-chat-hf \
  --port 8000

# With GPU:
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-2-13b-chat-hf \
  --port 8000 \
  --tensor-parallel-size 4
```

**3. Configure FieldForge**
```sql
UPDATE company_settings
SET 
  ai_mode = 'local',
  local_ai_url = 'http://localhost:8000',
  local_ai_model = 'meta-llama/Llama-2-13b-chat-hf',
  ai_privacy_mode = TRUE
WHERE company_id = 'your-company-id';
```

---

## 🔀 Hybrid Mode (Best of Both Worlds)

Set `ai_mode = 'hybrid'` to:
- Use **local AI** for sensitive data (project details, financial info)
- Use **cloud AI** for general queries (weather, documentation lookup)

```sql
UPDATE company_settings
SET ai_mode = 'hybrid'
WHERE company_id = 'your-company-id';
```

FieldForge automatically determines which AI to use based on query sensitivity.

---

## 🎛️ AI Mode Comparison

| Feature | Local AI | Cloud AI | Hybrid |
|---------|----------|----------|--------|
| **Data Privacy** | ✅ 100% Private | ⚠️ Sent to cloud | ✅ Sensitive data local |
| **NDA Compliant** | ✅ Yes | ❌ No | ✅ For sensitive queries |
| **Internet Access** | ❌ No | ✅ Yes | ✅ For non-sensitive |
| **Setup Required** | ⚠️ Yes | ❌ No | ⚠️ Yes |
| **Performance** | ⚠️ Good | ✅ Excellent | ✅ Excellent |
| **Cost** | ✅ Free (hardware) | ⚠️ API costs | 💰 Mixed |
| **Best For** | NDAs, sensitive | General use | Mixed workloads |

---

## 🔐 Recommended Models by Use Case

### For Construction Field Work
- **Llama 3 (8B)**: Best all-around, fast responses
- **Mistral 7B**: Great for technical docs
- **CodeLlama 13B**: If working with code/scripts

### For Office/Planning
- **Llama 3 (70B)**: Most powerful (requires 48GB+ RAM)
- **Mixtral 8x7B**: Excellent reasoning

### For Budget/Basic Hardware
- **Phi-2**: Tiny but capable (2.7GB)
- **TinyLlama**: Ultra-fast (1.1GB)

---

## 🖥️ Hardware Requirements

### Minimum (Small models: Phi-2, TinyLlama)
- **RAM**: 8GB
- **Storage**: 10GB
- **CPU**: Modern i5 or equivalent
- **GPU**: Optional

### Recommended (Medium models: Llama 3 8B, Mistral 7B)
- **RAM**: 16GB
- **Storage**: 20GB
- **CPU**: i7 or equivalent
- **GPU**: Optional (NVIDIA with 8GB+ VRAM for speed)

### Ideal (Large models: Llama 3 70B)
- **RAM**: 64GB+
- **Storage**: 50GB
- **CPU**: Xeon or Threadripper
- **GPU**: NVIDIA A100/H100 or 4x RTX 4090

---

## 🔒 Security & Compliance

### Data Flow - Local AI Mode

```
User Query
  ↓
FieldForge Frontend
  ↓
FieldForge Backend (your server)
  ↓
Local AI (Ollama/LM Studio on your network)
  ↓
Response back to user
```

**✅ Data NEVER leaves your infrastructure**

### Compliance Features

1. **Audit Logging**: All AI mode changes logged in `ai_preference_audit` table
2. **Company-Level Control**: Admins set AI policy for entire company
3. **Privacy Mode**: When enabled, blocks all external AI calls
4. **NDA-Safe**: Local mode complies with non-disclosure agreements

---

## 🧪 Testing Your Local AI

**1. Test Connection**
```bash
# For Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello, test response",
  "stream": false
}'

# For LM Studio / LocalAI / vLLM
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**2. Test in FieldForge**
- Login to https://fieldforge.vercel.app
- Click AI brain icon
- Ask: "What is FieldForge?"
- Check response shows `provider: 'local'` in console

**3. Verify Privacy**
```sql
-- Check your company's AI mode
SELECT ai_mode, ai_privacy_mode, local_ai_url
FROM company_settings
WHERE company_id = 'your-company-id';
```

---

## 🚨 Troubleshooting

### "Local AI unavailable" Error

**Check 1**: Is the AI server running?
```bash
# Ollama
ps aux | grep ollama

# LM Studio - check GUI shows "Server Running"

# Docker
docker ps | grep local-ai
```

**Check 2**: Is the port correct?
```bash
# Test connection
curl http://localhost:11434/api/tags  # Ollama
curl http://localhost:1234/v1/models  # LM Studio
```

**Check 3**: Is the URL configured correctly?
```sql
SELECT local_ai_url FROM company_settings WHERE company_id = 'your-id';
```

### Slow Responses

- **Try a smaller model**: Llama 3 8B instead of 70B
- **Enable GPU**: Install CUDA drivers and use GPU-enabled models
- **Increase RAM**: Close other applications
- **Use vLLM**: Better performance for production

### Out of Memory

- **Reduce model size**: Use 7B instead of 13B model
- **Use quantized models**: GGUF format (4-bit quantization)
- **Increase swap**: Configure system swap space

---

## 📊 Performance Benchmarks

### Response Time Comparison (Typical Query)

| Setup | Model | Response Time |
|-------|-------|---------------|
| Cloud | Claude Sonnet 4 | 2-3 seconds |
| Cloud | GPT-4 Turbo | 2-4 seconds |
| Local (CPU) | Llama 3 8B | 5-10 seconds |
| Local (GPU) | Llama 3 8B | 1-2 seconds |
| Local (GPU) | Llama 3 70B | 3-5 seconds |

---

## 🎯 Recommended Setup by Company Size

### Small Team (1-10 users)
- **Ollama** with Llama 3 8B
- Single workstation with 16GB RAM
- Cost: $0 (use existing hardware)

### Medium Company (10-50 users)
- **LM Studio** or **LocalAI** (Docker)
- Dedicated server with 32GB RAM, GPU
- Cost: ~$2,000 one-time hardware

### Large Enterprise (50+ users)
- **vLLM** with load balancing
- Multiple GPU servers
- Consider **hybrid mode** for scalability
- Cost: $10,000+ hardware + infrastructure

---

## 🔄 Migration Guide

### From Cloud to Local AI

```sql
-- 1. Set up local AI server (see above)

-- 2. Test connection
-- (use curl commands above)

-- 3. Switch company to local mode
UPDATE company_settings
SET 
  ai_mode = 'local',
  local_ai_url = 'http://your-local-ai:port',
  local_ai_model = 'llama3',
  ai_privacy_mode = TRUE
WHERE company_id = 'your-company-id';

-- 4. Log the change for compliance
INSERT INTO ai_preference_audit (company_id, changed_by, old_mode, new_mode, reason)
VALUES (
  'your-company-id',
  'admin-user-id',
  'cloud',
  'local',
  'NDA compliance requirement'
);
```

---

## 📞 Support

- **Ollama**: https://ollama.ai/
- **LM Studio**: https://lmstudio.ai/
- **LocalAI**: https://localai.io/
- **vLLM**: https://docs.vllm.ai/

---

## ✅ Checklist

- [ ] Local AI server installed and running
- [ ] Model downloaded and loaded
- [ ] Connection tested with curl
- [ ] Company settings updated in database
- [ ] AI mode verified (check `ai_preference_audit`)
- [ ] Test query in FieldForge UI
- [ ] Confirm "provider: 'local'" in response
- [ ] Document setup for team
- [ ] Train team on privacy mode

---

**🔒 Your data stays private. NDA-safe. Compliance-ready.**

