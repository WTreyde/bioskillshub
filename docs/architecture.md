# Architecture and API contract

## Boundaries

Next.js serves a client-side React catalogue and Node route handlers. PostgreSQL is the source of truth for accounts, sessions, skills, drafts, immutable versions, entitlements, token hashes, request counters and AI usage. No instruction execution occurs inside the web app. The scientist's agent retrieves text and runs tools in a separate environment.

The initial deployment is localhost/private through SSH. Published metadata is available anonymously at `/browse` and `/api/public/catalog`; login and acquisition protect instruction content. GitHub OAuth supports open registration when configured; four seeded accounts retain password login. This is a hackathon service, not a production multi-tenant execution platform.

Public catalogue metadata includes title, summary, domain, author, price and creator-reported validation status. Recommendation calls include only this metadata plus the user's question. Guided generation sends the submitted expert answers to OpenAI; no generation starts automatically. No full purchased instructions are sent to the recommender.

## HTTP contract

All responses are JSON with `Cache-Control: no-store`. Errors use `{error: string}`. Browser mutations require `Origin` matching `APP_ORIGIN`. Session cookies are HttpOnly, SameSite Strict, expire after 12 hours and can be made Secure for HTTPS with COOKIE_SECURE=true. Team localhost SSH tunnels use false.

| Method / endpoint | Contract |
|---|---|
| GET /api/public/catalog | Published metadata only; no drafts or instruction text |
| GET /api/auth/github | Begin GitHub authorization using state/browser binding and PKCE |
| GET /api/auth/github/callback | Consume one-use state, verify GitHub identity, create session |
| POST /api/auth/login | `{id,password}` → safe user; sets session cookie |
| GET /api/auth/me | `{user}` or `{user:null}` |
| POST /api/auth/logout | Revokes current session |
| GET /api/catalog | Published metadata, latest version, current user's acquisition state |
| GET /api/creator | Current user's contributions and draft state |
| POST /api/skills | Validated draft fields → `{id}`; not published |
| GET/POST /api/skills/:id/draft | Creator-only draft read/save; read falls back to latest published version |
| POST /api/skills/:id/publish | `{reviewed:true}` → new integer version; removes saved draft |
| POST /api/skills/:id/restore | `{number}` → new release copying that version; leaves draft intact |
| GET /api/skills/:id | Current metadata plus published version history |
| POST /api/skills/:id/acquire | `{confirm:true}` → persistent entitlement, charged=0, mode=demo |
| GET /api/skills/:id/versions/:number | Session + entitlement required; returns selected instructions |
| GET/POST /api/tokens | List safe token metadata / `{name}` creates token shown once |
| DELETE /api/tokens/:id | Revoke only current user's token |
| GET /api/agent/skills | Bearer token → acquired metadata only |
| GET /api/agent/skills/:id/versions/:number | Bearer + entitlement → content, status, version and SHA-256 |
| POST /api/recommend | `{prompt}` → validated catalogue IDs and reasons, explicit mode |
| POST /api/generate | `{title,answers,mode?}` → unsaved draft text; mode=template skips LLM |

Draft fields: title, summary, domain (Imaging/Chemistry/Genomics/Structural biology), integer price_cents, content, validation, release_notes. Required Markdown headings: Use cases, Inputs, Outputs, Procedure, Expert decisions, Limitations, Examples. Limits: JSON 90 KB, content 60,000 characters, uploads 60 KB; the deployment remains private and has no arbitrary file execution.

Entitlements apply to all releases of a skill, with explicit retrieval version selection. Latest metadata is not a pinned scientific dependency. Publish and restore lock the parent skill row; database triggers reject edits/deletes of any published release.

401: missing/invalid/expired/revoked authentication; 403: wrong owner, origin or missing entitlement; 404: unavailable resource/version; 400: invalid fields; 429: quota reached; 503: missing LLM configuration; 502: provider/result failure. No stack traces or provider credentials are returned.

Tokens use 256-bit random values and SHA-256 hashes. Passwords use salted scrypt. API tokens are read-only and expire after seven days; sessions and tokens are distinct. The read client refuses redirects and non-local plaintext HTTP. Skill contents remain readable to authorised users; this is access control, not IP-proof encryption.

## Extending Rosalind

Keep this HTTP contract stable. Ask the OpenAI mentor for the supported skill install/connector surface and model identifier. Run list → retrieve pinned version → execute a harmless fixture → record output provenance. Do not infer verified Rosalind compatibility from Codex success alone.

GitHub identities are keyed by stable numeric provider ID, never email or mutable login. `oauth_states` contains ten-minute, browser-bound authorization attempts. GitHub tokens are not persisted. See [OAuth activation](github-sign-in.md); live provider verification remains pending.
