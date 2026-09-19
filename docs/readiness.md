# Readiness ledger — 19 September 2026

## Completed in Wojtek's checkout

| Workstream | Deliverable and evidence |
|---|---|
| Recovery | Snapshot-consistent backup restored into a disposable database; all eleven application tables matched and immutability trigger was enabled. Backup/evidence remain private. |
| Agent transport | Expired/revoked token coverage; refused redirects, malformed/oversized/interrupted responses, wrong identity/version/hash, and existing-output preservation. Downloads and provenance files are staged with private permissions. |
| Public browsing | `/browse` and `/api/public/catalog` show only published metadata; protected instructions still require acquisition. This does not expose the localhost deployment to the internet. |
| GitHub sign-in | Open registration supported, state/browser binding, expiry/replay protection and PKCE implemented; provider errors are sanitized. Mocked-provider tests pass. Live activation remains gated below. |
| Accessibility/mobile | Native modal plus keyboard focus wrap/Escape/focus restoration; narrow layout verified and mobile sign-out restored. |
| Rehearsal | Reproducible `npm run test:browser` covers the full synthetic creator/buyer/client flow, public browsing and keyboard/mobile checks. Token-free fallback video and screenshots saved privately. |
| Scientific intake | ImageJ dataset/review/hash/split preflight, ADMET artifact checklist and paired-run comparison tooling. No scientific results manufactured. |
| Pitch | Existing deck preserved; evidence boundaries and Q&A notes added to `docs/pitch.md`. |
| Access | `npm run env:check` passes for Wojtek; reusable by each teammate in their own checkout. |
| Shutdown | Helper and administrator instructions prepared for Monday 21 September 12:00 BST (11:00 UTC); execution is not yet scheduled here. |

## External actions still required

1. **Integration administrator:** deploy this merged release and run the additive database migration. The previous deployment and sign-in were confirmed by local Codex and Wojtek; this newer release needs redeployment. Follow `docs/rehearsal.md` and `docs/github-sign-in.md`.
2. **GitHub OAuth App owner:** register the app and configure the client ID/secret privately, enable `GITHUB_ALLOW_SIGNUP=true`, then verify a real callback. Do not claim live OAuth validation from mocked tests.
3. **Local Brev administrator:** register/verify the Monday stop schedule on an available administrator machine, preserve an off-instance backup and confirm stopped state/disk billing afterwards. `docs/operations.md` contains the helper and schedule details.
4. **Brev organization admin/owner:** confirm actual spend; the local task reported billing visibility restricted to these roles. No GPU workers were reported running. The quoted CPU rate is not a cumulative spend total.
5. **Each teammate:** personally confirm SSH key possession and browser login. A local automated environment check does not establish these.
6. **Domain owners/mentors:** supply permitted ImageJ references and a verified endpoint-specific ADMET checkpoint/reference package, then review actual protocol/evaluation outputs. `docs/scientific-intake.md` defines the inputs. No scientific accuracy/speedup or ADMET prediction claim is justified yet.
7. **Provider owner:** configure mentor-confirmed live API credentials/model privately and run bounded verification. Rosalind remains unverified.

## Reproduce checks

Run the required typecheck, build, PostgreSQL tests and Python tests in README. For browser verification, install Chromium using `npx playwright install --with-deps chromium` on a suitable developer machine, then run `npm run build` and `npm run test:browser`. It requires the assigned localhost app port to be free and defaults to Wojtek's database port 5442; another owner must set `REHEARSAL_DB_PORT` to their allocated personal database port after verifying `.env`. The script creates disposable identities/schema, disables live providers, closes the server and drops that schema. Evidence stays in `.local/rehearsal/`.

Run `npm run db:recovery -- --confirm-local` with matching PostgreSQL tools to independently verify the chosen personal database. It never restores over the source. Private backups are retained for review.
