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

TypeScript check, native and Docker production builds, PostgreSQL access-control lifecycle test and Python scientific utility tests passed. Real HTTP/Python client smoke tests against development and production servers verified acquired-only listing, pinned retrieval, SHA-256 provenance and immediate revocation. LLM adapter tests use a mocked provider and cover unknown-ID filtering and provider/JSON failures; no live provider verification is implied. The database was restarted to check persistence. The core ImageJ container produced masks, ROI archive, labelled overlay and exactly the expected synthetic counts 0, 2, 3; descriptive replicate summaries were generated. This is a synthetic software check, not scientific validation. Login layout was visually checked in the browser; authenticated UI review awaits team sign-in.

## Wojtek development handoff — 19 September 2026

PR #1 is merged into `main`; new work should branch from `origin/main`, not `codex/platform-review`. Wojtek's personal checkout passed typecheck, production build, the PostgreSQL lifecycle test and three Python tests. A temporary development server on port 3004 passed anonymous HTTP checks and was stopped. See [Wojtek's environment record](team/wojtek.md#development-environment-verified--19-september-2026) for configuration and verification limits. Wojtek completed personal GitHub authentication and pushed the setup branch; its commits use Wojtek's existing public merge-commit identity without changing Git configuration. No other checkout or credentials were changed.
