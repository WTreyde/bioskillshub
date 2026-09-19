# BioSkillsHub

Expert scientific workflows, available to research agents through a versioned, access-controlled catalogue.

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

## LLM features

Set server-only `OPENAI_API_KEY` and a mentor-confirmed `OPENAI_MODEL`; restart the app. Uses the Responses API, `store:false`, no tool execution and bounded output. Without configuration, recommendations explicitly use keyword matching, while guided forms can create a labelled structured template. No paid calls are made by setup or tests. `ai_usage` records token counts, not prompts. The global 40-request/day default and 10 requests/user/hour reduce accidental usage; additionally enforce the $100 budget through the OpenAI project billing controls and monitor actual cost.

## Agent handoff

Acquire a skill, create a token in **Connect agent**, and download the bootstrap. Set `BIOSKILLS_TOKEN` securely outside the conversation and `BIOSKILLS_URL` to your localhost tunnel. Run:

```sh
python3 scripts/agent_client.py list
python3 scripts/agent_client.py get imagej-foci 1 --output results/imagej/SKILL.md
```

The helper verifies the response SHA-256 and saves a provenance manifest. Access expires after seven days or immediate revocation. Agents cannot acquire skills through these endpoints. The user controlling the agent can inspect downloaded instructions.

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
- [Scientific evaluation contract](science/evaluation/README.md)

ImageJ statistical utilities are runnable; real scientific validation requires Leandre's reference data. ADMET preflight deliberately rejects the placeholder manifest until a usable endpoint checkpoint is documented. These are not validated scientific demonstrations yet.
