# Wojtek — integration, infrastructure and ADMET

Read AGENTS.md, docs/architecture.md and docs/setup.md. Own server-side access control, PostgreSQL, agent retrieval and deployment. Efe owns primary UI edits. Keep all credentials private.

## Mentor questions to resolve now

- OpenAI: Is Rosalind API access actually active, what exact model ID works, and how can Workbench load custom instructions? Verify an end-to-end harmless example before claiming compatibility.
- NVIDIA: Which KERMT endpoint-specific fine-tuned checkpoint can we run today? What endpoint, output units/classes, licence, preprocessing, scaling, features, reference inputs and expected outputs apply? Is there a ready container and GPU recommendation?
- If no appropriate ADMET checkpoint is available, report the exact missing artefact to the mentor and team immediately. Do not substitute general pretrained weights or invent predictions. Agree a replacement scientific example explicitly.

Fill science/admet/endpoint.example.json into a private real manifest, run preflight, then run documented inference. Do not train a broad model this weekend. Freeze a small evaluation set and metric. Keep existing BioNeMo instructions in both conditions, adding our expert guidance only in the treatment condition.

Provision CPU workspace only after Brev login and price verification. Initial cumulative Brev cap $100, absolute $1,000; OpenAI $100 separate. Install per-user Codex and SSH setup. The CPU host can remain up overnight; bound and stop all GPU workers. Keep the integration clone separate from active development.

Run npm test against the isolated test schema before integration. Test real provider calls only after environment credentials are configured, with limited requests. Record provider/model and token usage.

## Development environment verified — 19 September 2026

- Personal checkout: `/home/wojtek/bioskillshub`; `codex/wojtek-setup` created from merged `origin/main` (`fa775ce`). Future work should use a new `codex/wojtek-<change>` branch from `origin/main` with a clean tree.
- Node 22.23.2, npm 10.9.8 and Python 3.10.12 are available; project dependencies are installed. Docker CLI/Compose are installed, but personal accounts rely on the integration administrator to manage containers.
- Private configuration uses `bsh-wojtek`, app origin `http://localhost:3004` and the personal PostgreSQL database at `127.0.0.1:5442`. `.env` permissions are `0600`; existing credentials were preserved.
- `npm run typecheck`, `npm run build`, `npm test` and all three Python unit tests passed. The lifecycle test created and removed its disposable schema in the personal database. Under the Codex sandbox, tests required permission for IPC/database access and the build required a retry outside the sandbox after a TypeScript subprocess failure.
- `npm run dev -- --port 3004` started successfully: `/` returned 200, `/api/auth/me` returned an anonymous session and `/api/catalog` returned 401. The temporary server was stopped after verification. Browser sign-in and a laptop SSH tunnel were not exercised.
- GitHub CLI was absent; a temporary CLI was downloaded and Wojtek completed personal GitHub authentication. The setup branch was successfully pushed to `origin`. Git author identity is unset in this clone; this follow-up uses the public Wojtek Treyde identity from the PR #1 merge commit for its commits only. Set a preferred Git author identity for future work; never reuse another teammate's credentials.

## Rehearsal follow-up

The complete synthetic browser-to-Python flow passed in a disposable schema; see [status](../status.md#demo-rehearsal--19-september-2026). The [administrator handoff](../rehearsal.md) contains integration backup/deploy steps, the live demo sequence and remaining scientific/provider/spend gates. The local machine can perform deployment through the original Brev administrator connection; the personal Wojtek login cannot manage Docker. No other person's checkout or credentials were modified.

Recovery, open GitHub registration/public browsing, client reliability and scientific-intake readiness work is tracked in [the readiness ledger](../readiness.md). The CPU stop deadline is Monday 21 September 12:00 BST; scheduling requires the local administrator and is not claimed complete.

## Personal AI / usage handoff

The `codex/wojtek-ai-handoff` change adds optional tab-memory OpenAI keys and explicit per-action calls, plus acquired-version downloads and detailed assistant/terminal instructions. No credentials were added or changed. The deployment administrator must deploy the merged revision to make these available on the demo URL; no migration is required. Live paid provider calls remain unverified. See [usage guide](../using-skills.md).

The follow-up `codex/wojtek-chat-builder` adds conversational skill creation. Deploy latest merged main to include both the personal-key/usage change and this chat builder. No migration or new credentials are needed; provider verification still requires an explicitly configured live key.
