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

The literature catalogue has an explicit dry-run/apply importer, using an existing curator account. After deploying the merged revision, the integration administrator should follow [the literature import handoff](../../science/literature/README.md). Do not run db:setup or reset credentials to import these entries.

For the Rosalind catalogue, deploy the merged revision and run the separate `scripts/seed-rosalind.ts` dry run/apply procedure in [the handoff](../../science/rosalind/README.md). This imports proposed instructions only; testing actual Workbench tools still needs an authorized user. The literature import remains independent.

Ownership correction: after deploying this revision, run `scripts/seed-rosalind.ts` without `--owner wojtek`, first dry-run then `--apply`. It assigns unchanged Workbench starters to the Rosalind collection profile. See the updated handoff for identity conflicts; never rename or reset another account automatically.

The Anthropic source entry uses its own `scripts/seed-anthropic.ts` dry-run/apply importer, with no owner argument. The owner is the `anthropic` attribution profile. Deploy then follow [the handoff](../../science/anthropic/README.md); do not run the upstream campaign or reset an existing account's credentials.

For the attached contributor workflow, deploy this revision and run `scripts/seed-aleksy.ts`, first dry run, then `--apply`, with no owner argument. It creates/reuses Aleksy Kwiatkowski without issuing or changing existing login credentials. The same release adds the AI file/folder importer; verify its UI without paid calls unless separately authorized. No migration is required.

### Landing and catalogue update

Deploy the merged landing/catalogue release from `origin/main`; no migration is required. Verify `/`, `/about`, `/browse` and GitHub sign-in on the public origin. Public password login controls were removed; operational credentials were not changed. All skills receive generated artwork automatically and new domains can be selected without seeding placeholder skills. Continue the separate Rosalind, Anthropic and Aleksy importer handoffs if upgrading from PR #7.

### ZIP/source importer handoff

Deploy the merged importer release from `origin/main`, installing the updated lockfile before rebuilding. No schema change. Verify a Java file and a ZIP folder in Creator studio, the 200 KB instructions, local file previews, explicit sharing consent and the personal/hosted API-key information notices. Live model verification remains separate from fixture-based checks.

The same release makes the landing page permanent at `/` and `/about`, with the app at `/workspace`. Verify brand-to-home navigation, signed-in Open workspace and GitHub callback routing. Direct Markdown creation works without AI credentials. All creator paths are included in the browser rehearsal; live AI remains a separate deployment check.

### Audit handoff

The audit fixes strict API body/route validation and adds concurrency, ZIP boundary, negative-browser and bounded HTTP regressions. See `docs/qa/overnight-audit.md` and its checkpoint. Deploy the merged audit release with the usual build/restart; no migration. Verify real public login and provider configuration separately.

### Creator studio upload follow-up

Deploy the authoring/ZIP fix with npm ci and rebuild; no migration. Verify that all four methods retain their selected interface and show suggested headings and shared review controls. Custom-heading Markdown publishes unchanged by default; the optional adaptation checkbox must be off initially and require explicit sharing consent before any AI request. Verify ZIP preview excludes Git/macOS metadata. Keep the user-supplied Fiji archive private; it is test input, not an authorized public catalogue import. See the usage guide for standalone Markdown versus supporting-file import.

### BioNeMo case-study preparation

The [Ramachandran study package](../../science/bionemo/ramachandran-case-study/README.md) is a preparation handoff only. Do not execute/provision from the teammate's quoted prompt. Complete its frozen-input/reference/confidence/environment review after a later explicit run instruction. The custom skill attachment stays private; no account ownership or public import is assigned by this protocol. This documentation change needs no app redeployment or migration.

### iPhone Safari / creator fixes handoff

`codex/wojtek-mobile-creator-fixes` addresses the off-screen skill dialog, redundant New skill control, missing Other domain, uneditable zero price, unclear publish prerequisites and lost editor/chat answers. See the final entry in [status](../status.md). Typecheck, build, 19 Node/PostgreSQL checks, 16 Python tests, full Chromium and targeted WebKit mobile browser flows pass using disposable local schemas; paid AI is mocked.

The integration chat owns deployment after merge: rebuild/restart the app; no schema migration or credential changes. On an actual iPhone, scroll Explore, open/close a skill (including long content), then create an Other-domain skill at £20, generate/review instructions, save/publish and acquire it into My library. Verify incomplete answers survive refresh and review consent resets. No integration or infrastructure changes were made by this development task.

### Community feedback / Agent Skills deployment handoff

Branch: `codex/wojtek-ratings-agent-skills`, PR #18 targets main; PR #17 is merged. All required checks, Chromium/WebKit browser flows and the bounded-load audit passed locally. The WebKit rehearsal now waits for recovery/reset state and finishes catalogue prefetches before its deliberate refresh, retaining all recovery/security and browser-error assertions. Confirm the latest PR revision has green CI before deployment.

The integration administrator should:

1. Preserve a database backup and deploy the tested merged revision using the established procedure.
2. Run `npm run db:migrate` against integration using its existing private configuration. This adds `skill_ratings`, `skill_demo_feedback` and `eval_status` columns on drafts/releases; existing content and accounts are preserved.
3. Rebuild/restart the app. No new package dependencies or credentials are needed.
4. Run `npm run db:seed-demo-feedback` to review the plan, then `npm run db:seed-demo-feedback -- --apply` to add the explicitly requested demo scores/badges. The importer is idempotent and only uses currently published skills. Rosalind/BioNeMo detection uses ID, owner, title and summary; inspect that plan for the intended collection entries. Existing versions, real votes, drafts and credentials are not rewritten.
5. Verify that demo labels remain visible, an acquired non-owner can rate/update, creator self-rating is unavailable, eval flags say creator-reported or DEMO ONLY, and a downloaded ZIP contains `<name>/SKILL.md`. Check a direct Markdown upload plus optional AI conversion with fixtures unless a live paid call is separately authorized.

The eval checkbox is a presentation field only. Demo scores are not actual user reviews, and demo passes are not scientific/evaluation results. The development agent did not run migration/import against integration or the personal non-test schema.
