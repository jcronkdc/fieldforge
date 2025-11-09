# LangBot Deployment Playbook

This guide documents how we broadcast MythaTron story prompts via the LangBot multi-channel messaging platform (Discord, Slack, Telegram).

## Prerequisites
- Clone and install [LangBot](https://github.com/langbot-app/LangBot) per upstream instructions.
- Create bot credentials for each platform:
  - **Discord:** bot token + channel IDs.
  - **Slack:** bot token + signing secret.
  - **Telegram:** bot token via BotFather.
- Ensure access to the MythaTron API (service key) and deployment endpoints.

## Repository Structure
```
integrations/langbot/
  README.md
  prompts/
    daily_seeds.yaml
  scripts/
    schedule_prompts.sh
```

`prompts/daily_seeds.yaml` stores seed prompts until the `/v1/prompts/daily` API is live.

## Environment Configuration
Add the following to the LangBot `.env` (example names):

```
MYTHATRON_API_BASE=https://api.mythatron.com
MYTHATRON_API_KEY=<service-key>
MYTHATRON_SHARE_URL=https://mythatron.com

DISCORD_TOKEN=<token>
DISCORD_CHANNEL_IDS=111111111111,222222222222

SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

TELEGRAM_BOT_TOKEN=...
```

LangBot should fetch prompts from `MYTHATRON_API_BASE/v1/prompts/daily`. Until that endpoint exists, load from the local YAML file.

## Scheduling Broadcasts
1. Deploy LangBot with cron support (Docker + cron, PM2, or GitHub Actions schedule).
2. Run the script `scripts/schedule_prompts.sh` daily at 14:00 UTC (adjust per audience).
3. Script example:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   PROMPT_FILE="$(dirname "$0")/../prompts/daily_seeds.yaml"
   python broadcast_prompts.py --from-yaml "$PROMPT_FILE"
   ```
4. Implement `broadcast_prompts.py` in the LangBot deployment repository to read YAML and send messages to each platform adapter.

## Content Guidelines
- Keep prompt intro under 280 characters; include emoji/hook.
- Append `Link: ${MYTHATRON_SHARE_URL}` directing to the swipe feed.
- Tag prompts with genres that align with story genome labels for analytics.
- Rotate prompts to ensure all seed worlds get exposure.

## Monitoring & Analytics
- Monitor LangBot logs for delivery success.
- Use UTM parameters on share links to track conversion in analytics.
- Record prompt performance back to MythaTron analytics for feedback loops.

## Next Steps
- Build `/v1/prompts/daily` endpoint returning curated highlights.
- Automate prompt generation using the ML tagging pipeline.
- Expand support to additional platforms (WeChat, WhatsApp) once MVP loops are validated.

