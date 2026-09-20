# Back up and restart BioSkillsHub

The platform needs a CPU host, Docker Compose and PostgreSQL 17. No GPU or scientific execution environment is required. The abandoned experimental case-study package has been removed; the BioNeMo catalogue skills remain ordinary platform content.

The September 2026 website remains on its existing temporary Cloudflare URL until NVIDIA retires the CPU host. Do not stop the tunnel or change live OAuth credentials during closeout. The old temporary URL cannot be relied on after restart. Prefer a stable HTTPS domain for a future public deployment.

## What to keep

- This Git repository, including `package-lock.json`, and the deployed commit identifier.
- A private PostgreSQL custom-format dump, its SHA-256 and restore-verification record. It contains the real users, published skills, private drafts, versions, acquisitions, feedback, hidden flags and authentication records.
- A separate private copy of the integration `.env`, plus any operational account passwords you need. Never place them in Git or paste them into chat. PostgreSQL dumps do not include `.env`, the OAuth client secret or the database role password.
- Optionally, a built app image for exact runtime reproduction. Docker base-image tags can change; a Git commit and lockfile do not freeze the operating-system image.

On the original coordinator laptop, private closeout backups are under `.local/backups/closeout-20260920/` in the repository checkout. Verify the manifest there. Those files are intentionally ignored by Git. Losing that laptop without another private copy loses the backup.

**Do not upload the real dump to GitHub, even a private repository.** It includes account/password hashes, session/token records, OAuth state and unpublished content. GitHub can host code and reviewed synthetic seed data. An encrypted offsite backup is a separate option; keep the decryption key outside the backup service and repository. `.gitignore` is an accident-prevention measure, not secret scanning or encryption.

## Take a backup while the app remains live

Use the authorized administrator shell on the CPU. These commands do not stop the website. Do not run them inside a shell heredoc without redirecting the Compose command's stdin.

```sh
cd /home/integration/bioskillshub
umask 077
sudo mkdir -p .local/backups
sudo sh -c 'umask 077; docker compose exec -T db pg_dump -U bioskills -d bioskills -Fc --no-owner --no-privileges </dev/null > .local/backups/platform-final.dump'
sudo sha256sum .local/backups/platform-final.dump
```

Choose a new filename each time; do not overwrite a known-good backup. Copy it privately to your laptop and compare SHA-256. A live dump is a consistent snapshot, but cannot include writes made afterward. Take a second final snapshot shortly before provider shutdown if people keep using the site.

The closeout backup was additionally restored into a temporary database and all application tables were compared against the same exported source snapshot. The immutable-version trigger was verified. `scripts/verify-recovery.ts` implements this check; it requires Node dependencies, local PostgreSQL access and matching PostgreSQL 17 client tools. It creates and removes only a uniquely named test database. Never point the normal test suite at production.

## Restore the real catalogue on a new host

### 1. Prepare a clean checkout and private configuration

Install Git, Docker Engine and the Compose plugin. Use a supported CPU host with sufficient disk for PostgreSQL and the app image. No Brev-specific service is required. If running host-side npm commands, install Node 22 and run `npm ci`.

```sh
git clone https://github.com/WTreyde/bioskillshub.git
cd bioskillshub
git switch main
umask 077
cp .env.example .env
chmod 600 .env
mkdir -p .local/backups
```

Edit `.env` privately. For a local smoke test set:

```dotenv
APP_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
APP_PORT=3000
DB_PORT=5438
COMPOSE_PROJECT_NAME=bsh-restored
```

Generate a new random database password, preferably hexadecimal to avoid URL/Compose escaping issues; set it in both `POSTGRES_PASSWORD` and the host-side `DATABASE_URL`. Do not print it in a task or put it in a shell command. Keep GitHub identity mappings from the original private configuration if used. Hosted OpenAI settings may remain empty: downloads, Markdown authoring and structured templates work without them. Paid AI is optional and is not part of restore verification.

Use a fresh Compose project and empty volume. Never restore into an existing live database or use `down -v` to resolve a conflict. The Compose database hostname inside the app is `db`; Compose supplies the correct internal DATABASE_URL automatically.

### 2. Restore before initializing or migrating

Copy the private dump into `.local/backups/platform-final.dump`, verify its checksum against the saved source manifest, and set mode 600. Do **not** run `db:setup` or catalogue importers when restoring a real backup.

```sh
docker compose up -d db
docker compose exec -T db pg_isready -U bioskills -d bioskills
# Wait for readiness before continuing.
docker compose exec -T db pg_restore -U bioskills -d bioskills \
  --exit-on-error --single-transaction --no-owner --no-privileges \
  < .local/backups/platform-final.dump
docker compose build app
docker compose run --rm --no-deps app node --import tsx scripts/migrate.ts
```

The direct Node command is the documented container equivalent of `npm run db:migrate`; Compose injects the environment, while the npm command expects a host `.env` file. Migrations are additive. If restore fails, stop and diagnose in this new environment; do not clear or reseed the original database.

Before exposing the restored app, invalidate restored login sessions, temporary OAuth handshakes and agent tokens. This changes only the restored database, preserving accounts, passwords, skills and acquisitions. Users sign in again and generate new agent tokens.

```sh
docker compose exec -T db psql -U bioskills -d bioskills -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
DELETE FROM sessions;
DELETE FROM oauth_states;
UPDATE api_tokens SET revoked_at=now() WHERE revoked_at IS NULL;
COMMIT;
SQL
docker compose up -d app
curl --fail http://127.0.0.1:3000/api/health
```

### 3. Restore GitHub sign-in and public access

The UI uses GitHub sign-in. A restored database alone does not configure OAuth. Keep or recreate the GitHub OAuth App in your own account, enter its client ID/secret privately, and use:

- Homepage: the new exact app origin.
- Callback: `<APP_ORIGIN>/api/auth/github/callback`.
- `GITHUB_ALLOW_SIGNUP=true` for open registration, or the reviewed team mapping/closed-registration settings described in [GitHub sign-in](github-sign-in.md).

For localhost, use `http://localhost:3000/api/auth/github/callback`. For public use, establish HTTPS, set `APP_ORIGIN` to that exact origin and `COOKIE_SECURE=true`, update the OAuth callback, then run `docker compose up -d --force-recreate app`. Updating `.env` without recreating the app does not change its environment.

The app and database bind to loopback. Use SSH forwarding for private access (`ssh -N -L 3000:127.0.0.1:3000 YOUR_HOST`) or a reverse proxy/tunnel for public HTTPS. Never expose the database port publicly. A new quick Cloudflare tunnel normally has a new URL; update origin and OAuth together. Retained GitHub identity rows use stable numeric IDs and preserve existing account ownership when the same GitHub users return.

### 4. Acceptance checks

- `/api/health`, `/`, `/about` and `/browse` respond successfully.
- Fresh GitHub sign-in opens `/workspace`; the brand returns home.
- Catalogue, creator contributions, versions, acquired library and hidden flags survived restore. The two hidden deployment-verification entries should remain hidden.
- Download an existing acquired version and its Agent Skills ZIP; verify its recorded hash. Check unauthorized retrieval is rejected.
- Use a disposable test environment for draft/save/publish, ratings and recovery regression tests; do not add test reviews to real skills.
- Verify no API keys or tokens are printed, stored in Git or embedded in screenshots.

## Start a fresh demo instead of restoring

Use a new Compose project/volume and configure `.env` as above. Build the app and start the database, then initialize only that empty database:

```sh
docker compose up -d db
# Wait for the database health check.
docker compose build app
mkdir -p .local
chmod 700 .local
docker compose run --rm --no-deps --user "$(id -u):$(id -g)" \
  -v "$PWD/.local:/app/.local" app node --import tsx scripts/setup.ts
docker compose up -d app
```

The setup writes the four new account passwords privately into host `.local/` and seeds two prototype skills. Configure GitHub OAuth separately for browser login. Optional catalogue importers have dry-run/apply workflows in their collection READMEs. The 33 BioNeMo contributions and other user uploads are database content: a code clone or default setup does not recreate them. Restore the private database to recover the real catalogue. Synthetic ratings/eval badges are optional, clearly labelled demo content; never seed them as real evidence.

## When reopening publicly later

Run the repository checks on a disposable database, update dependencies with tests, and recheck OAuth and data-sharing settings before reopening. This is a tested hackathon prototype, not a security certification or a verified scientific execution service. Use a stable origin, routine encrypted backups, cost controls and a defined data-retention policy for continued operation.
