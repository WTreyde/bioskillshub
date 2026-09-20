# Delivery status

## Implemented

- Next.js scientific catalogue, pre-created team accounts, creator drafts, upload/guided forms, immutable releases and restoration.
- Simulated acquisition, persistent buyer library, token creation/revocation, protected pinned-version API and provenance-verifying Python client.
- LLM recommendation and draft-generation adapters; honest keyword/template fallback without configuration.
- Docker Compose PostgreSQL deployment, local setup, API contract and individual team instructions.
- Descriptive microscopy summarisation and fail-closed ADMET checkpoint provenance checks.

## External gates — not complete

- Brev: `bioskillshub-cpu` is running at $0.32/hour including storage. SSH, production deployment and remote agent smoke test passed. Separate team clones/databases are ready; all four SSH public keys are installed; Wojtek’s personal workspace and the integration app login are verified; each teammate must verify their own login. See docs/team/ssh-access.md.
- Rosalind: technical access unconfirmed; do not advertise a verified integration.
- OpenAI API: project key/model not configured by this implementation; live model calls unverified.
- ImageJ: Leandre's dataset, parameters, reference annotations and experimental design still required. Synthetic fixtures establish software behaviour only.
- ADMET: no endpoint-specific fine-tuned checkpoint or reference outputs provided; no ADMET predictions produced. Send docs/team/wojtek.md questions to the NVIDIA mentor in person.
- Scientific benchmark and final pitch evidence depend on those gates. No accuracy/speed improvement claimed.

## Validation

TypeScript check, native and Docker production builds, PostgreSQL access-control lifecycle test and Python scientific utility tests passed. Real HTTP/Python client smoke tests against development and production servers verified acquired-only listing, pinned retrieval, SHA-256 provenance and immediate revocation. LLM adapter tests use a mocked provider and cover unknown-ID filtering and provider/JSON failures; no live provider verification is implied. The database was restarted to check persistence. The core ImageJ container produced masks, ROI archive, labelled overlay and exactly the expected synthetic counts 0, 2, 3; descriptive replicate summaries were generated. This is a synthetic software check, not scientific validation. Login layout was visually checked in the browser; authenticated synthetic browser rehearsal is recorded below; shared integration sign-in remains to be checked.

## Wojtek development handoff — 19 September 2026

PR #1 is merged into `main`; new work should branch from `origin/main`, not `codex/platform-review`. Wojtek's personal checkout passed typecheck, production build, the PostgreSQL lifecycle test and three Python tests. A temporary development server on port 3004 passed anonymous HTTP checks and was stopped. See [Wojtek's environment record](team/wojtek.md#development-environment-verified--19-september-2026) for configuration and verification limits. Wojtek completed personal GitHub authentication and pushed the setup branch; its commits use Wojtek's existing public merge-commit identity without changing Git configuration. No other checkout or credentials were changed.

## Demo rehearsal — 19 September 2026

- Both PR #2 CI jobs passed. Browser rehearsal against a production build on Wojtek's port 3004 passed sign-in, guided template/draft save, review-gated publication, buyer browse/acquisition/library, selected-version reading, UI token creation, Python pinned retrieval/SHA-256 verification and immediate revocation. No browser page errors were observed. The synthetic users and releases existed only in a disposable schema on port 5442; the schema and temporary server were removed. Private evidence is in Wojtek's `.local/rehearsal/` and was not committed.
- All required checks passed, including four Python tests. ADMET preflight now streams checkpoint hashes on Python 3.10; a synthetic checkpoint test covers successful provenance checking and tampering rejection. This does not supply or validate an ADMET predictor.
- Shared integration HTTP health returned 200 on port 3000. Its deployed commit, authenticated browser flow and redeployment remain unverified because Wojtek's personal account lacks Docker/sudo access. An administrator must perform the [backup and deployment handoff](rehearsal.md).
- Wojtek confirmed scientific reference artifacts and provider configuration are not yet available. No live provider calls or GPU workers were started. Actual billing totals and shutdown ownership still need administrator confirmation; the documented hourly rate alone does not establish total spend.

## Readiness implementation — 19 September 2026

See [the readiness ledger](readiness.md) for the complete implementation and external-action split. Added public metadata browsing, configurable open GitHub registration, keyboard/mobile improvements, reproducible token-free browser recording, recovery/access checks, hardened client downloads and scientific intake/comparison tooling. The existing slide deck is preserved, with supporting evidence/Q&A notes in the pitch document.

Local checks passed: typecheck, production build, PostgreSQL access-control/mocked OAuth lifecycle, fourteen Python tests, full Chromium creator/buyer/helper flow with public browsing and keyboard/mobile checks, and restore verification of all eleven application tables. Scientific/provider evidence is still pending. GitHub OAuth requires App registration and private credentials for live verification. The requested Monday 12:00 BST CPU stop is prepared but not scheduled from this account. Previous integration deployment/sign-in was confirmed by the local task and Wojtek; this newer release requires migration and redeployment by that administrator.

## Personal AI and skill usage — 19 September 2026

Added optional request-scoped OpenAI keys, explicit billing/data consent, model selection, clear/refresh/sign-out removal, and sanitized provider failures. Acquired versions now have direct instruction/provenance downloads, a task prompt, manual ChatGPT/local-agent instructions and a downloadable Python helper with hidden token entry. See [usage guide](using-skills.md). Provider checks use fixtures; real paid AI calls and deployment of this change remain unverified.

The administrator's later handoff confirms PR #4 deployment, live GitHub sign-in and backup verification. This supersedes earlier OAuth-registration/deployment gates above. The Monday 21 September 11:00 UTC stop is scheduled locally by the administrator and depends on that machine remaining available; billing and scientific evidence still require their respective owners.

Validation for this change: typecheck, production build, PostgreSQL provider/access lifecycle, sixteen Python tests and Chromium desktop/mobile rehearsal passed. Browser checks cover selected-version downloads, the task guide, explicit personal-key transport, absence from browser storage and removal on refresh. No live provider call was made.

## Conversational creation — 19 September 2026

Creator studio now includes Chat with AI: describe a workflow, answer targeted questions, explicitly generate a skill preview, then transfer it to the editable review/save/publish flow. Missing evidence must remain labelled as missing. Conversations are bounded, temporary and never auto-published. The feature uses the same personal/hosted OpenAI settings and sanitized provider adapter. Deployment and a paid live-provider smoke test remain outstanding; no migration is required.

Validation passed: TypeScript, production build, PostgreSQL conversation/access/provider lifecycle, all sixteen Python tests and Chromium desktop/mobile flows. Browser coverage includes follow-up questions, preserved input after failure, draft preview/download, transfer to the editor, review gating and private draft saving. Provider responses are fixtures; no live AI or scientific validation is implied.

## Literature starter catalogue — 19 September 2026

Prepared four free, attributed literature checklists for Imaging, Genomics, Chemistry and Structural biology. Each includes scope, inputs, outputs, decisions, limitations, examples and a DOI citation; all explicitly remain expert-review pending and experimentally unvalidated. The transactional importer preserves accounts, credentials, existing releases, drafts and entitlements. See [source catalogue and import instructions](../science/literature/README.md). Public deployment/import requires the integration administrator; a personal database import does not update the website.

Typecheck, production build, PostgreSQL importer/access tests and sixteen Python tests passed. All four entries were imported into Wojtek's personal database; a repeat dry run reported all four as existing. Integration database import remains pending. No credentials or teammate checkouts were modified, and no live model calls were made.

## Rosalind workflow proposals — 19 September 2026

Added three free skills targeting documented Workbench NGS, structure-viewer and alignment-viewer capabilities, plus a manual handoff and separate importer. All retain Workbench execution unverified and scientific-validation-pending labels. The official documentation is now identified, but account access and actual execution are still untested. No connector, endpoint, tool invocation or scientific output is claimed verified. See [Rosalind handoff](../science/rosalind/README.md).

Typecheck, production build, PostgreSQL catalogue/access tests and all sixteen Python tests passed. The three Workbench entries were imported into Wojtek's personal database; repeat dry runs recognized them and the four literature entries without changes. Public import remains an administrator action. No live Workbench or model execution took place.

## Rosalind catalogue ownership

The Workbench importer now creates/reuses the reserved `rosalind` profile (display name Rosalind) and atomically transfers only the three unchanged starter workflows to it. Existing credentials, published versions and acquisitions are preserved. The profile is a BioSkillsHub collection, not an official OpenAI identity. Conflicting account names, edited releases and saved drafts cause a full abort. Omit the old `--owner wojtek` argument. Required tests and production build pass, including catalogue authorship and preserved buyer access.

## Anthropic source collection

Added a free Anthropic-owned guide to the requested protein-binder prompt-release README, pinned to source revision d442eeb195e50e071f53e91ddb1ce046cf2a4249 with CC BY 4.0 attribution and explicit adaptation notes. This is a source-bundle guide, not a runnable campaign or a replicated scientific result. The atomic importer creates/reuses the attribution profile without changing existing credentials and preserves all existing content. See [import handoff](../science/anthropic/README.md). No source budgets, external messages or scientific computation are authorized by import.

Typecheck, production build, PostgreSQL ownership/import/access tests and all sixteen Python tests passed. The entry is imported into Wojtek's database under Anthropic; a repeat dry run recognized the existing entry. The public integration import still requires the administrator. No upstream workflow, paid service or scientific computation was run.

## Contributor attachment and AI file import

Prepared the user-supplied reaction-prediction workflow under ak, preserving the original file and verifying its SHA-256. Added Creator studio file/folder selection, local preview/removal, explicit sharing consent and AI conversion to reviewable skill drafts. Scripts are never executed; source text is appended unchanged to the Markdown skill. Input size/path/type checks and existing ownership/review gates apply. Model behavior is tested with fixtures, not paid live calls. Deployment and the separate ak import remain administrator actions.

All required checks passed: TypeScript, production build, PostgreSQL ownership/import/provider/access tests, sixteen Python tests and Chromium desktop/mobile rehearsal. Browser checks exercised both file and folder selection, private-file exclusion, explicit sharing consent, source retention and review-gated saving. ak's skill was imported into Wojtek's database and repeat import detection passed. Public deployment/import remains pending; no paid live-model verification was performed.

## Public introduction, artwork and domain expansion

Added a shared project explanation at the unauthenticated landing page and `/about`, stable per-skill abstract artwork, and 16 selectable scientific domains including empty categories. Domain choices are shared with draft validation and AI authoring/import prompts. Public sign-in now offers GitHub only; no team-account/password form is displayed. Legacy team credentials and the password API remain unchanged for operational compatibility. GitHub must be configured on the integration host for website sign-in.

TypeScript, production build, PostgreSQL tests, sixteen Python tests and the desktop/mobile browser rehearsal passed. Browser coverage includes the public introduction, empty domain browsing, Physics publication/acquisition, images and absence of the password form. GitHub live authorization was not exercised. No migration or image service is needed; deploy the merged release to update the public website.

## Larger source and ZIP imports

Creator studio accepts a single UTF-8 source file in any programming language or a ZIP-compressed folder. Upload and total expanded content limits are 200,000 bytes, with at most 100 files; generated skills allow 300,000 UTF-8 bytes. ZIP contents are decoded locally, bounded and previewed before explicit sharing consent; scripts are never executed and publication still requires review. AI settings and the importer visibly explain personal-key transit through BioSkillsHub to OpenAI, non-storage, and the hosted-key alternative.

Typecheck, build, PostgreSQL tests, sixteen Python tests and desktop/mobile browser rehearsal passed. Coverage includes Java, ZIPs, corrupt/encrypted/oversized archives, symlinks, excluded files, consent, source retention, and saving/publishing/retrieving a large converted skill. No paid provider calls were made. Deploy the merged release with `npm ci` and rebuild; no database migration is required.

### Landing navigation and complete authoring verification

`/` and `/about` now render the same project landing page even for signed-in users. The authenticated app is at `/workspace`, the brand links home, signed-out workspace visits return to the sign-in panel, and GitHub callbacks open the workspace. No OAuth callback registration change is required. Direct Markdown upload accepts `.md`/`.MD`, reports encoding problems, and explicitly explains that no AI key is needed. Browser coverage now includes each creator path: guided template, guided AI, conversation, single Java import, ZIP import, and large direct Markdown upload/edit/save/review/publication without AI. Model responses remain fixtures; live provider availability is not implied.

## Functional and bounded-load audit

Completed the isolated audit described in [the QA report](qa/overnight-audit.md), with recoverable [checkpoints](qa/overnight-checkpoint.md). Fixed non-object JSON returning server errors and unexpected trailing skill-route segments invoking valid operations. Fourteen Node/PostgreSQL checks, sixteen Python tests, typecheck, production build, extended desktop/mobile flows, 335 measured local HTTP requests, restart persistence and synthetic backup/restore passed. Bounded load now runs in CI. Live public deployment, real OAuth/provider access and scientific validation remain separate gates; no production writes or paid calls were made.

## Creator studio authoring and upload compatibility — 20 September 2026

All four authoring methods retain their selected interface after generating/applying a draft, with a common review editor and save/review/publish controls. Suggested headings are visible. Custom-heading Markdown can be saved and published unchanged without AI; optional YAML metadata fills empty title/description fields. An unchecked adaptation checkbox offers explicit-consent AI conversion into the suggested structure within the Markdown interface. Failures preserve the source for retry; publication always requires review.

ZIP containers allow 1 MB / 1,000 entries while eligible source content remains capped at 200 KB / 100 files. Excluded Git history, macOS metadata and private paths are skipped without decompression before source budgets are counted. The supplied Fiji archive contains 13 usable text files (120,314 bytes). Its content stays in private test evidence and is not seeded into the public catalogue or executed.

Typecheck, production build, 18 Node/PostgreSQL checks and 16 Python tests passed. Browser regressions cover each method retaining its interface, unchanged direct publication, optional adaptation, consent, conversion failure/retry and reviewed publication. The actual attachment is used locally with fixture model responses; no live AI conversion or scientific execution is claimed. Deployment requires latest merged main, npm ci and a rebuild; no migration.

## BioNeMo Ramachandran case-study preparation

Prepared the [paired backbone-audit protocol](../science/bionemo/ramachandran-case-study/README.md), shared task plus arm-specific suffixes, scoring rubric, incomplete study manifest and empty results worksheet. One frozen prediction is shared; both arms have CCTBX, and only the treatment receives the custom instruction/script package. The proposed Q9I1F6 identity, runtime compatibility, confidence encoding, reference artifacts and execution authorization remain outstanding. Attachment hashes are recorded without publishing its contents. No GPU, prediction, dependency installation, attached-script execution, scientific score or public skill import occurred. The user's no-run instruction remains in force.

## iPhone dialog and creator recovery — 20 September 2026

Skill details now use a viewport-fixed native dialog with a persistent touch close control and backdrop dismissal. Creator studio removes the redundant top New skill button; its bottom Start a blank skill action confirms before discarding editor answers/chat. Other is supported throughout the shared domain list. Price input retains the user's editable text, including an empty value, and validates pounds/pence at save time.

Save/publish errors and success feedback appear beside the submission controls. The review requirement and guided-answer-to-instructions step are explicit; missing guided answers return a useful client error. Saved drafts are identified as private contributions; My library remains the acquired-skill collection. Per-user sessionStorage recovery retains editor fields, guided answers and chat through refresh/navigation, excluding credentials and review consent. Explicit sign-out clears recovery; saved server drafts remain. Unconverted file selections are not recovered.

Validation: typecheck, production build, 19 Node/PostgreSQL checks, 16 Python tests, full Chromium rehearsal and iPhone-sized WebKit touch regression passed. Tests used disposable schemas in Wojtek's localhost database and synthetic provider responses only. WebKit regression is included in CI. Physical iPhone Safari and public deployment remain unverified. Integration administrator: deploy the merged release and rebuild/restart; no migration, credential change or catalogue re-import is required.

## Community feedback, Agent Skills format and eval indicators — 20 September 2026

Acquired-skill users can submit/update one 1–5-star rating per skill; creators cannot rate their own entries. Real averages/counts appear on public and signed-in cards and details. A separate dry-run/apply importer provides 6–14 labelled synthetic scores (3.5–5) for existing published skills. Demo feedback is excluded from community aggregates and pinned to the seeded version. The user explicitly approved demo labelling.

New publication and catalogue imports validate Agent Skills frontmatter. Manual Markdown bodies can keep custom headings; the editor can add missing metadata without AI or explicitly convert uploads with AI. Guided/template/chat/import output includes the format metadata. Entitled session and token clients can download a ZIP containing the matching skill folder, SKILL.md and original/exported hashes. Historical release bytes are preserved; plain-Markdown legacy exports add metadata. Malformed existing frontmatter requires a corrected release. Scripts remain embedded as untrusted source text; none execute in the app.

Eval indicators distinguish creator-reported passes from demo-only badges. The importer selects Rosalind/BioNeMo entries through ID/owner/title/summary and adds a clearly labelled demo badge, without modifying their existing releases or scientific validation statements. No harness, scientific study or live AI provider was run.

Checks passed: typecheck, production build, 21 Node/PostgreSQL checks, 16 Python tests, full Chromium rehearsal, WebKit mobile regression, and the 335-request bounded-load/restart audit. Migration tests covered an old immutable release and repeat application; feedback tests cover permissions, upsert, separate demo aggregates, eval immutability and ZIP hashes. All database/browser work used disposable localhost schemas. Physical iPhone and public deployment remain integration checks.

Deployment requires the additive migration, rebuild/restart and optional labelled demo import in docs/team/wojtek.md. PR #17 is merged; PR #18 targets main and includes those mobile fixes. Its WebKit regression waits for asynchronous recovery/reset state and catalogue prefetch completion before deliberate refresh, with all recovery/security assertions retained. Deployment remains gated on green CI for the latest revision. No integration database, credentials, tunnel or compute configuration was changed here.
