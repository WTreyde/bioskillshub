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

## Personal AI and acquired-skill handoff

The client holds optional personal OpenAI credentials in tab memory only. Only recommend/generate/skill-chat requests include the `ai: {apiKey, model, confirmed: true}` object. The server validates consent and HTTPS/localhost, forwards credentials to the fixed Responses endpoint with redirects refused, and sanitizes provider errors. It records token/model usage under `personal:<task>`, never credentials or request text. Hosted credentials remain server-side; personal requests never fall back to them. Structured templates bypass AI entirely.

Entitled session version retrieval includes SHA-256 for direct download provenance. `GET /api/downloads/agent-client` is a public source-code attachment (text, not JSON); it does not expose purchased content. The helper accepts `--url` and interactive `--prompt-token` without putting secrets in command history. See [usage guide](using-skills.md).

## Conversational skill builder

`POST /api/skill-chat` takes `{messages: [{role: "user" | "assistant", content}], action: "interview" | "draft", ai?}` and returns `{message, draft}`. Interview responses must have a null draft; explicit draft requests must contain valid title/summary/domain and Markdown with every required section. Authentication, same-origin checks and the existing AI quotas apply. Client-supplied system roles, invalid ordering, oversized transcripts and malformed provider outputs are rejected. Neither transcript nor generated draft is persisted by this endpoint; explicit existing save/publish endpoints retain their ownership and review gates.

The full bounded transcript is passed as untrusted input to a stateless Responses request with `store:false`, without provider conversation IDs or tools. This follows the [manual conversation-state approach](https://developers.openai.com/api/docs/guides/conversation-state). The browser holds the chat only while its editor is mounted. Personal credentials are sent separately and never embedded in model input. Usage is recorded as `skill-chat` or `personal:skill-chat`.

## AI file conversion

`POST /api/skill-import` accepts `{files:[{path,content}], notes?, confirmed:true, ai?}` from an authenticated same-origin session. Shared validation bounds selection (20 UTF-8 text files, 16 KB each / 40 KB total), rejects unsafe/private paths and control characters, and rejects duplicates. The existing 90 KB JSON limit also applies. Unsupported filesystem formats are never parsed on the server. The request is sent to the fixed model endpoint as untrusted input with no execution tools; credentials are separate from model input.

The model proposes metadata, review notes and the required Markdown sections. The server validates the response before appending unchanged source files as text, then enforces the 60,000-character skill limit. No draft, uploaded-file store or publication is created by conversion. Only the existing explicit save/publish endpoints persist the reviewed content. Usage is recorded under skill-import (or personal:skill-import). The browser previews/removes files and requires explicit data-sharing consent before sending them.

## Public introduction and catalogue presentation

Unauthenticated visitors see the project introduction at `/`; `/about` remains available to everyone. Both share the same content. `/browse?domain=Physics` filters public metadata without exposing instruction text. `lib/domains.ts` is the shared domain list for validation, catalogue filters, creator selection and AI conversion prompts. Empty domains remain discoverable. Each skill receives stable, original abstract SVG artwork derived from its ID in both public and signed-in cards, without remote image requests or a database migration. Artwork is illustrative, not scientific evidence.
