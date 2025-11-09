# Vercel Preview Setup

We deploy the marketing site to Vercel project `prj_qGaPo7wpeQjXDVRRsxoGpCEkeJew`. The root `vercel.json` points the static output to `Mobile app copy/web/` with caching and HSTS headers.

## Deploy Workflow
1. Ensure the repository is up to date and the Open Graph metadata passes local validation (`python tools/opengraph/inspect.py http://localhost:8080/index.html`).
2. Commit your changes; runs that land on `main` will trigger Vercel’s auto preview.
3. Use the Vercel dashboard to monitor build logs and the preview URL.

## Guardrails Against Common Errors

| Error | Mitigation |
| --- | --- |
| `DEPLOYMENT_NOT_FOUND`, `RESOURCE_NOT_FOUND` | Always deploy from branches tracked by Vercel. Avoid deleting active previews until new deployments are healthy. |
| `FUNCTION_*` failures (500/504/413) | We serve static assets only; avoid adding Serverless/Edge functions unless latency budgets and payload sizes are defined. |
| `DNS_HOSTNAME_*` | Keep custom domain records synced with Vercel DNS or your registrar. Test with `dig` before switching traffic. |
| `OPTIMIZED_EXTERNAL_IMAGE_*` | Host marketing images locally inside `Mobile app copy/web/assets/` to bypass remote optimization errors. |
| `ROUTER_*` and `TOO_MANY_*` | Keep routes static. If SPA routing is introduced, add explicit rewrites in `vercel.json` rather than relying on catch-all middleware. |
| `BODY_NOT_A_STRING_FROM_FUNCTION`, `FALLBACK_BODY_TOO_LARGE` | Avoid dynamic responses for now; any future functions must return string bodies under Vercel limits. |

## Monitoring & Rollback
- Enable preview comments in GitHub so designers can review each run.
- Configure Vercel notifications to Slack/Email for build failures.
- To rollback, promote the last known-good deployment from the Vercel dashboard.

Refer to Vercel’s [error codes reference](https://vercel.com/docs/errors) for full context and keep this document updated as the deployment architecture evolves.

