# BioSkillsHub

Expert scientific workflows, available to research agents through a versioned, access-controlled catalogue. Browse published metadata at `/browse`; instruction downloads require sign-in and acquisition.

## Run locally

Requires Node.js 22+, Python 3.10+ and Docker Compose.

1. Copy `.env.example` to `.env`. Set a random `POSTGRES_PASSWORD` and the same password in `DATABASE_URL`. Set `APP_ORIGIN` to the exact browser origin (default `http://localhost:3000`).
2. `npm ci`
3. `docker compose up -d db`
4. `npm run db:setup`
5. `npm run dev`
6. Open http://localhost:3000. Initial passwords are written once to a private `.local/team-credentials-*.txt` file. Share individual passwords privately, not through Git or chat transcripts.

Setup is idempotent and does not replace existing passwords or published versions. The seeded sample skills are explicitly unvalidated prototype protocols.

For the containerised app: `docker compose up -d --build`. Initialise a new database from the host as above, or run `docker compose exec app node --import tsx scripts/setup.ts` and retrieve credentials privately from the app container. The app and database bind only to localhost. Access the remote app with SSH forwarding.

## GitHub sign-in and upgrades

Any GitHub account can join once an administrator creates an OAuth App and privately configures `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `GITHUB_ALLOW_SIGNUP=true`. Existing team password login remains available. See [OAuth activation and identity mapping](docs/github-sign-in.md). Live GitHub authorization is unverified until those credentials are configured and exercised.

For an existing database, back up first, run `npm run db:migrate` to add the OAuth tables, and restart the app. This preserves accounts, credentials and releases.

## LLM features

Set server-only `OPENAI_API_KEY` and a mentor-confirmed `OPENAI_MODEL`; restart the app. Uses the Responses API, `store:false`, no tool execution and bounded output. Without configuration, recommendations explicitly use keyword matching, while guided forms can create a labelled structured template. No paid calls are made by setup or tests. `ai_usage` records token counts, not prompts. The global 40-request/day default and 10 requests/user/hour reduce accidental usage; additionally enforce the $100 budget through the OpenAI project billing controls and monitor actual cost.

## Agent handoff

Acquire a skill, create a token in **Connect agent**, and download the bootstrap. Set `BIOSKILLS_TOKEN` securely outside the conversation and `BIOSKILLS_URL` to your localhost tunnel. Run:

```sh
python3 scripts/agent_client.py list
python3 scripts/agent_client.py get imagej-foci 1 --output results/imagej/SKILL.md
```

The helper verifies the requested identity/version and response SHA-256, then saves private content and provenance files. Choose a fresh output path; existing downloads are never overwritten. Access expires after seven days or immediate revocation. Agents cannot acquire skills through these endpoints. The user controlling the agent can inspect downloaded instructions.

## Tests and team docs

```sh
npm run typecheck
npm run build
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
```

- [Architecture and API](docs/architecture.md)
- [Remote workspace setup](docs/setup.md)
- [Implementation status and external gates](docs/status.md)
- [Efe](docs/team/efe.md), [Leandre](docs/team/leandre.md), [Maxim](docs/team/maxim.md), [Wojtek](docs/team/wojtek.md)
- [Pitch and rehearsal](docs/pitch.md)
- [Readiness ledger and remaining gates](docs/readiness.md)
- [Recovery, access and shutdown](docs/operations.md)
- [Scientific artifact intake](docs/scientific-intake.md)
- [Scientific evaluation contract](science/evaluation/README.md)

ImageJ statistical utilities are runnable; real scientific validation requires Leandre's reference data. ADMET preflight deliberately rejects the placeholder manifest until a usable endpoint checkpoint is documented. These are not validated scientific demonstrations yet.

## Using your library and optional AI

See [the acquired-skill walkthrough](docs/using-skills.md). Each acquired version includes direct Markdown/provenance downloads, a copyable task prompt and optional terminal retrieval instructions. **AI settings** supports a personal OpenAI API key for explicit recommendations/draft generation; keys are request-scoped and not saved. API usage is billed separately from simulated skill purchases. Manual ChatGPT/local-agent handoff requires no API key in BioSkillsHub.

Create a skill conversationally in **Creator studio → Chat with AI**: explain the workflow, answer follow-up questions, create a draft, then review/save/publish. See [the walkthrough](docs/using-skills.md#create-a-skill-by-chatting).

## Literature starter catalogue

Four free, cited review checklists cover Imaging, Genomics, Chemistry and Structural biology. Populate an existing database with `npm run db:seed-literature -- --owner wojtek --apply` after reviewing the default dry run. See [sources, limitations and container import instructions](science/literature/README.md). These are literature adaptations awaiting expert review, not validated scientific protocols.

## Rosalind Workbench skills

Three free workflow proposals cover FASTQ quality review, structure inspection and sequence alignment. See [manual handoff, verification limits and import instructions](science/rosalind/README.md). Workbench execution remains unverified; these entries do not establish an automatic integration or grant Workbench access.

## Anthropic source collection

An Anthropic-owned entry provides an attributed guide to the released protein-binder campaign bundle. It links to a pinned source revision and does not launch the campaign. See [scope, provenance and import instructions](science/anthropic/README.md).

Creator studio also supports **Import files with AI** for text skill files and folders containing scripts. Review the selected files before sending them, then review the converted draft before saving/publishing. Original sources remain embedded as text in the Markdown download. See [file import instructions and limits](docs/using-skills.md#import-files-or-a-folder-with-ai).

The attached chemical reaction prediction workflow is available as a free contributor skill owned by Aleksy Kwiatkowski; [import instructions](science/aleksy/README.md) preserve the original attachment and existing credentials.
