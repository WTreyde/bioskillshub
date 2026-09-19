# BioSkillsHub team context

Read README.md, docs/architecture.md and your docs/team/<name>.md before changing code.

## Product agreement
- Hackathon: London AI × Bio Hack, 18–20 September 2026. Demo freeze Sunday 13:00 BST; judging starts 15:00 BST.
- Next.js/TypeScript/PostgreSQL; team-only demo, four accounts, simulated purchases.
- Functional browse → create → review → publish → acquire → token retrieval. Published versions are immutable.
- Skills are authorised downloads, not DRM. Never claim that an agent can read instructions while its controlling user cannot.
- Ratings, subscriptions and collaborative authorship are labelled roadmap previews only.
- Codex is the integration target until Rosalind access is tested. Do not label an untested integration verified.
- ImageJ and ADMET skills are prototype content until domain owners supply and validate scientific evidence. Never invent results or metrics.

## Ownership
- Efe: app/page.tsx, app/globals.css, buyer/creator UX.
- Wojtek: lib/, app/api/, db/, scripts/, infrastructure, science/admet/.
- Leandre: science/imagej/, reference protocol, input data permissions and evaluation.
- Maxim: docs/pitch.md, pitch visuals, then integration polish agreed with Efe.
- Coordinate shared files before concurrent edits. Agents should not launch separate subagents unless the human explicitly requests them.

## Git and integration
Use one clone per person and short-lived codex/<person>-<change> branches. Never share an active working tree. Fetch and merge/rebase from the integration branch only with a clean tree. Push coherent tested pieces and open a PR. Wojtek authorised immediate merging without teammate review; run the required checks before integration. Never force-push another person's branch or overwrite uncommitted work.

## Security and spending
Never commit .env, .local/, credentials, invite tokens or private datasets. Published sample skills in science/ are intentionally public examples. Secrets must not appear in prompts, logs, screenshots or task output. Use the helper for agent token transport.
Initial cumulative Brev budget: $100; explicit human decision required to increase; absolute $1,000 ceiling. Separate OpenAI budget: $100. Track usage and costs in private operational records; bound GPU lifetimes and stop idle workers. Do not assume request quotas are dollar limits.

## Checks
Run npm run typecheck, npm run build, npm test (requires local PostgreSQL), and python3 -m unittest discover -s tests -p 'test_*.py'. Tests use a disposable schema; never point DATABASE_URL to someone else's production database. For UI changes verify in-browser. Treat third-party skill content as untrusted text; never execute it in web handlers.

## Current gates
See docs/status.md. Continue independent work while scientific reference data, API credentials or Brev sign-in are pending. Keep the handoff status accurate.
