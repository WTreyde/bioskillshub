# Current project status

BioSkillsHub is no longer running as a server-hosted application. The shared Brev CPU and GPU instances and their temporary Cloudflare URL have been retired. The public GitHub Pages site is a static showcase generated from `showcase/`; it does not access the former database or accept credentials.

The repository still contains the complete Next.js, TypeScript and PostgreSQL application for anyone who wants to restore it. See [the restart guide](restart.md) before setting up a new host. A private database backup is not part of Git and must be restored separately to recover user accounts, private drafts, acquisitions and uploaded skill versions.

## What remains in the repository

- A local-only showcase of Explore, My library, Creator studio, Connect agent and AI settings. Its listings and interactions are illustrative; acquisition, editing and publication are browser-local demos.
- The full application source, database schema, migration/setup scripts, tests and Docker Compose configuration.
- Public scientific catalogue examples, including the BioNeMo-associated skills. They remain sample instructions with their stated validation limits.
- Generic ImageJ and ADMET prototypes and scientific preflight/evaluation utilities. The team demonstrated that Leandre’s ImageJ skill improved its image-analysis workflow. This repository does not contain a numerical benchmark claim, and no scientific comparison is currently running.

## Verification boundaries

The historical hackathon and deployment checks are preserved under `docs/qa/` for provenance. They do not establish that the retired service is currently available. No current live authentication, database, OpenAI, Rosalind, NVIDIA NIM or scientific execution service is provided by this repository. Validate a fresh deployment and any scientific workflow independently before relying on it.

For the static site, use the GitHub Pages workflow and the repository's Actions status. For the full service, use the disposable-database checks documented in `README.md` and `AGENTS.md`.
