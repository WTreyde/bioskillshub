# BioSkillsHub maintainer guidance

Read `README.md`, `docs/architecture.md` and `docs/status.md` before changing the application. The repository contains the full Next.js/TypeScript/PostgreSQL prototype and a static GitHub Pages showcase. The Brev deployment has been retired; do not assume a live app, database, tunnel or scientific worker exists. See `docs/restart.md` before recreating the service.

## Product and safety

- Skills are access-controlled instructions, not DRM. Never claim a controlling user cannot inspect content retrieved by their agent.
- Published versions are immutable. Demo purchases, synthetic feedback and demo evaluation badges must be clearly labelled and kept separate from real user feedback or scientific results.
- Never claim Rosalind, AI provider, or scientific execution is verified unless a current end-to-end check proves it.
- Treat uploaded skill content as untrusted text. Never execute it in web handlers.
- Keep secrets, database dumps, private datasets and local operational records out of Git. `.gitignore` does not protect files from cloud-folder sync.

## Git and collaboration

Use a clean working tree, a short-lived `codex/` branch from `origin/main`, focused commits and a pull request. Do not overwrite uncommitted work or modify another contributor's checkout. Coordinate before concurrent edits to shared files.

## Validation

Run `npm run typecheck`, `npm run build`, `npm test` against a disposable PostgreSQL database, and `python3 -m unittest discover -s tests -p 'test_*.py'`. For UI changes, run the relevant browser rehearsal when a supported browser is available. Never point tests at a personal or production database.

## Current state

The current deployment and remaining limitations are recorded in `docs/status.md`. Recovery steps are in `docs/restart.md`; `docs/operations.md` describes retired-service cleanup and backup handling.
