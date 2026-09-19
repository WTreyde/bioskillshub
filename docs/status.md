# Delivery status

## Implemented

- Next.js scientific catalogue, pre-created team accounts, creator drafts, upload/guided forms, immutable releases and restoration.
- Simulated acquisition, persistent buyer library, token creation/revocation, protected pinned-version API and provenance-verifying Python client.
- LLM recommendation and draft-generation adapters; honest keyword/template fallback without configuration.
- Docker Compose PostgreSQL deployment, local setup, API contract and individual team instructions.
- Descriptive microscopy summarisation and fail-closed ADMET checkpoint provenance checks.

## External gates — not complete

- Brev: `bioskillshub-cpu` is running at $0.32/hour including storage. SSH, production deployment and remote agent smoke test passed. Separate team clones/databases are ready; all four SSH public keys are installed; personal login verification and Codex authentication remain pending. See docs/team/ssh-access.md.
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
