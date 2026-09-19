# BioSkillsHub functional and bounded-load audit

Scope: merged PR #13 plus audit fixes, in Wojtek's checkout and isolated local PostgreSQL schemas/databases. No public-site load, paid AI requests, real GitHub authentication, production writes or scientific computation. This is a reproducible software audit, not a guarantee that every possible input or deployment works.

## Confirmed defects and fixes

1. **Non-object request bodies could produce HTTP 500.** Reproduced with `null` at the publish endpoint. The shared JSON reader now requires an object, rejects invalid UTF-8, and returns 400 for invalid bodies. Regression cases cover null, arrays, booleans, numbers and strings across seven write endpoints, plus malformed JSON, encoding, content type, origin and cancellation of an oversized chunked body.
2. **Unexpected trailing URL segments still invoked skill operations.** Reproduced with an extra segment after `/draft`, which returned 200 and wrote the draft. Draft read/write, publish, acquire and restore now require exact route length. Regressions verify 404 and no accidental publication.

## Coverage matrix

| Area | Evidence | Result / boundary |
| --- | --- | --- |
| Landing/About, logo, workspace, sign-out | Chromium navigation, authenticated and anonymous sessions | Passed; shared introduction and explicit workspace navigation |
| Catalogue/domains/search metadata | API lifecycle and browser tests | Public metadata excludes instructions; empty Physics category and newly published category tested |
| Guided template and manual Markdown | Browser upload/edit/save/review/publish, uppercase .MD, large source, rejected encoding/size/content and retry | No key or AI call required; failed edits cannot change published content |
| AI guided authoring/chat/recommendation | Browser and server provider fixtures | Request transport, failure/retry, source handling and review gates verified; no live provider claim |
| Source/ZIP import | Java and ZIP browser conversion; source/UTF-8/CRC/header/count/size mutation tests | Stored/deflated ZIP, 100 files, large Unicode source, invalid/truncated/encrypted/link archives and private/binary exclusions covered |
| Ownership/session/CSRF | API lifecycle and adversarial tests | Outsider denial, expired sessions, origin and object validation covered |
| GitHub OAuth | Token/profile fixtures, state replay/expiry, identity mapping, open signup and sanitized provider errors | Passed with fixtures; live OAuth and public callback configuration remain deployment gates |
| Acquisition/library/download/provenance | Browser and API lifecycle, Python helper tests | Review/entitlement gates, pinned content, hashes, existing-file preservation and token revocation covered |
| Versions/concurrency | Concurrent publish/restore/acquire API and HTTP tests; creator restore/readback in browser | One release from concurrent publication; unique restore sequence; one entitlement from repeated acquisition |
| Quotas | Atomic concurrent rate-limit test and HTTP token endpoint | Expected excess requests return 429 without duplicate grants |
| Catalogue imports | PostgreSQL atomic/idempotent/conflict/ownership suites | Existing publications, credentials and acquisitions preserved |
| Mobile/keyboard | Chromium 390px and desktop, dialog focus/Escape, overflow, errors/status | Rehearsal covers all authoring modes; not a full assistive-technology certification |
| Restart/migration/recovery | App restart in load script; schema applied twice; synthetic database dump/restore | Data persisted; all eleven restored tables and immutable-version trigger verified |

## Bounded HTTP load

`npm run test:load` starts a separate production-build Next server, refuses an occupied port, creates ten synthetic actors and a disposable schema, and cleans up. Nominal ceiling 20 requests/second, concurrency 1/5/10, finite scenarios. 335 measured requests; no unexpected errors. Expected 400/404/409/429 responses are intentional assertions, not availability failures. This small local fixture is not a production-capacity benchmark.

| Scenario | Requests | Concurrency | p50 ms | p95 ms | HTTP counts |
| --- | ---: | ---: | ---: | ---: | --- |
| concurrent publish | 10 | 10 | 82 | 91 | 200: 1, 409: 9 |
| public catalogue | 50 | 1 | 5 | 7 | 200: 50 |
| public catalogue | 50 | 5 | 11 | 15 | 200: 50 |
| public catalogue | 50 | 10 | 17 | 21 | 200: 50 |
| authenticated catalogue | 50 | 10 | 22 | 27 | 200: 50 |
| distinct-user draft saves | 30 | 10 | 28 | 31 | 201: 30 |
| malformed JSON | 30 | 10 | 19 | 22 | 400: 30 |
| unknown route suffix | 10 | 5 | 12 | 13 | 404: 10 |
| duplicate acquisition | 20 | 10 | 24 | 29 | 200: 20 |
| concurrent restore | 10 | 10 | 41 | 54 | 200: 10 |
| token quota | 25 | 5 | 14 | 16 | 201: 20, 429: 5 |

After load, the audit verified one buyer entitlement, eleven sequential immutable versions, unchanged pinned content, and retrieval after an actual app-process restart.

## Reproduction and evidence

Run `npm run typecheck`, `npm test`, `npm run build`, `python3 -m unittest discover -s tests -p 'test_*.py'`, `npm run test:browser`, then `npm run test:load`. Database tests require a LOCAL disposable database; browser/load default to port 5442 and use `REHEARSAL_DB_PORT=5432` in CI. The load regression is included in GitHub Actions after browser verification.

Private, synthetic evidence:
- `.local/qa/load_1e8e0a6eb77b4e418bf3ff56a915de12/results.json`
- `.local/recovery/bsh_restore_a6cdb9a603964534be6da0cd6a93154a/verification.json`
- `.local/rehearsal/rehearsal_1789845313365/result.json` (extended negative-case run).

Recovery first failed because `pg_dump`/`pg_restore` were not on PATH. Repeating with the already-installed PostgreSQL 17 tools succeeded. Follow `docs/operations.md` and configure matching `PG_DUMP_BIN` / `PG_RESTORE_BIN` (and their library path if necessary). No application change was needed for that environment issue.

## Remaining deployment gates

- Deploy the merged revision through the integration administrator, then smoke-test the actual public URL and GitHub login. This audit did not modify that deployment.
- Real AI credentials, provider availability, model context limits and billing were not exercised. Fixture success does not verify an actual provider connection.
- Scientific evidence for prototype skills and real Rosalind execution remain outside software-test claims.
- Load results apply to a small local synthetic dataset, not unbounded traffic, large-catalogue capacity, long-duration reliability or a security certification.

No schema migration is required by the fixes. Rebuild/redeploy from main after CI passes and the PR merges. Existing versions, credentials and acquisitions are unchanged.
