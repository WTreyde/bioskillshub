# Recovery, account verification and shutdown

## Post-hackathon status — 20 September 2026

Follow [the restart guide](restart.md) for a new deployment or restore. The current website stays live until NVIDIA retires the CPU host. The coordinator disabled the old local CPU-stop job; the historical timer instructions below are not a request to install it again. The abandoned case study and its dedicated GPU are retired; catalogue skills are retained. A private database snapshot was restore-tested and saved off-instance. Later writes require a later backup.


## Recovery proof

Run `npm run db:recovery -- --confirm-local` only after checking that the private `DATABASE_URL` targets your personal localhost database. Requires matching PostgreSQL `pg_dump` and `pg_restore` binaries in PATH (or `PG_DUMP_BIN` / `PG_RESTORE_BIN`) and permission to create a temporary database.

The script exports a repeatable-read snapshot, saves a private custom-format backup under `.local/recovery/`, restores into a unique `bsh_restore_*` database, compares every application table, verifies the published-version trigger, then removes only that temporary database. Existing source rows and credentials are untouched. The backup contains private data; do not commit or share it. Recovery evidence includes row counts and fingerprints, never plaintext credentials. This proves the personal backup path; rerun as the integration administrator against the integration database to verify its backup independently.

## Team access

Each teammate runs `npm run env:check` in their own checkout. It checks the current account, Node version, private `.env` permissions, assigned localhost ports and a read-only database connection. It does not inspect another account's home or authentication directory. Each person still needs to verify laptop SSH and browser sign-in personally; no one can verify possession of their private SSH key on their behalf.

## Shutdown: Monday 21 September, 12:00 BST

Wojtek requested stopping `bioskillshub-cpu` at **2026-09-21 11:00 UTC**. The stop must use an administrator's existing Brev session on a machine that will remain available. Run `python3 scripts/stop-workspace.py` for a dry check; `--execute` issues a stop only at or after the authorized time and records success privately. It targets exactly `bioskillshub-cpu`, never all instances. A successful command is followed by manual console/billing confirmation.

For an always-on Linux administrator machine, install a timer (substitute absolute paths and the existing administrator Linux account; do not install this as Wojtek on the remote personal workspace):

```sh
sudo systemd-run --unit=bioskillshub-stop --on-calendar='2026-09-21 11:00:00 UTC' \
  --timer-property=Persistent=true --property=User=ADMIN_USER \
  --property=WorkingDirectory=/ABSOLUTE/PATH/TO/bioskillshub \
  /ABSOLUTE/PATH/TO/python3 scripts/stop-workspace.py --execute
systemctl list-timers bioskillshub-stop.timer
```

Ensure the service's PATH includes the installed Brev binary. On a Mac, local Codex should create a LaunchAgent under the already authenticated user that invokes the same script at the deadline (or every minute with the script's UTC guard). Keep the machine awake/available; a sleeping or offline laptop cannot guarantee an on-time cloud stop. Prefer a provider-side scheduled stop if available to the administrator. Preserve a copy of the final database backup outside the instance first.

**Current status: stop helper prepared; no scheduler installed or cloud stop verified from this personal account.** The local administrator must confirm registration and report it. Stopping a VM can leave billable disks; check the console after stopping. Official CLI semantics: [NVIDIA Brev instance management](https://docs.nvidia.com/brev/cli/instance-management).

## Spending

Brev actual spend is visible only to organization admins/owners in this workspace. Obtain their usage total, timestamp, active-instance list and disk charges; update the private `.local/costs.json` operational record. The displayed $0.32/hour rate is an estimate input, not a verified invoice total. Keep the $100 cumulative Brev cap; no GPU worker is needed for platform tests. OpenAI has a separate $100 cap; record provider/model and actual usage if live credentials are later configured. Do not treat request quotas as dollar caps. No provider call was made by the automated tests.
