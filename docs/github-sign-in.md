# Public catalogue and GitHub sign-in

`/browse` and `GET /api/public/catalog` expose published metadata without a session. Drafts, instruction text, tokens, acquisitions and mutations stay protected. Anonymous browsing does not publish the localhost deployment to the internet; external hosting/routing is a separate infrastructure decision.

Any GitHub account can join when `GITHUB_ALLOW_SIGNUP=true`, as requested by Wojtek. New users receive a distinct account based on GitHub's numeric identity. Existing team accounts are never linked by email or username. If a team member wants their existing library, configure `GITHUB_TEAM_MAP` privately before their first GitHub sign-in, for example `{"NUMERIC_GITHUB_ID":"wojtek"}`. Obtain each numeric ID from that person's verified GitHub profile/API. An already-linked identity cannot silently switch accounts.

## Administrator activation

1. Create a GitHub OAuth App in the owning account's developer settings. Use the exact app origin as the Homepage URL, and `APP_ORIGIN/api/auth/github/callback` as the Authorization callback URL. For the localhost integration tunnel this is `http://localhost:3000/api/auth/github/callback`.
2. Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_ALLOW_SIGNUP=true` and optional `GITHUB_TEAM_MAP` in the integration host's private `.env`. Never paste the secret into a task, shell command, screenshot or repository.
3. Back up the database, apply `npm run db:migrate` (or `docker compose run --rm --no-deps app node --import tsx scripts/migrate.ts` after building the new image), then restart the app with the new environment. Do not run setup to replace credentials. The migration adds identity and short-lived OAuth-state tables without altering existing releases.
4. Through the browser tunnel, choose **Continue with GitHub**. Confirm a successful callback, logout and repeat sign-in. Verify the account's existing library if mapped; for a new account, verify an empty library until simulated acquisition.
5. Test a cancelled authorization and confirm an understandable retry message. Record the provider verification date only after a real successful flow.

The implementation follows GitHub's [authorization-code flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps): single-use, ten-minute server-side state bound to an HttpOnly browser cookie, S256 PKCE and identity revalidation with `/user`. The temporary browser cookie uses SameSite=Lax for the cross-site callback; application sessions remain HttpOnly/SameSite=Strict. Provider tokens are used only to identify the user and are not stored or returned to the browser. No repository/email scopes are requested. Use HTTPS and `COOKIE_SECURE=true` for an externally hosted deployment.

Mocked-provider tests cover success, repeat login, expired/wrong/replayed state, closed registration, conflicting mappings and provider failures. **Live GitHub authorization is pending OAuth App creation and private configuration.**
