# Platform closeout review — 20 September 2026

Reviewed the PR #19 platform baseline (`6565d91`) and the closeout documentation/removal change. No application behavior or production credentials were changed for closeout.

## Checks completed

- Reviewed the session/OAuth and read-only agent boundaries, ownership/entitlement checks, immutable publishing/restoration, catalogue hiding, synthetic-versus-real feedback, bounded imports and optional AI consent/credential transport.
- `npm ci` reported no known dependency vulnerabilities at review time. This is a point-in-time package check, not a security certification.
- Type checking, production build, 22 Node/PostgreSQL tests and 16 Python tests passed.
- Full Chromium and mobile WebKit rehearsals passed using an isolated disposable PostgreSQL container and fixture AI. Covered save/publish, success dialog/reset, refresh recovery, failed-operation input retention, hiding, ratings and downloads.
- Fresh `db:setup` succeeded on the disposable database, creating four accounts and two prototype skills. It was not run against integration.
- A live integration snapshot was dumped and restored into a temporary database; every application table matched the same exported source snapshot and the immutable-version trigger was enabled. The temporary database was removed. The dump and private environment copy were saved off-instance; SHA-256 matched.
- Public website and database-backed health endpoint still returned success after infrastructure cleanup. The CPU and public tunnel were left running.

## Boundaries to retain for a future deployment

1. Keep database backups/configuration private. A code clone is not a backup of the 33 BioNeMo uploads or other user contributions. Restore instructions are in [restart](../restart.md).
2. The current Compose setup uses the PostgreSQL bootstrap role for the app. Before sustained public operation, separate migration/backup administration from a least-privilege application role.
3. Current request quotas are not a monetary spending ceiling. Provider billing controls and actual usage monitoring are still needed for hosted AI. No paid provider call was made in this review.
4. Hidden skills remain accessible by known pinned version to already-entitled users. Hiding is not revocation or erasure.
5. Scientific validation, eval badges and community ratings are different signals. Synthetic feedback remains explicitly labelled. Format validation does not establish scientific correctness or safe execution.
6. The temporary hostname and OAuth callback must be reconfigured on restart. The prototype has no durable public hosting/backup service or automated account-erasure workflow.
7. The abandoned study was removed from the active source tree and managed private working directories. Historical Git commits and previously exported human handoff notes are not rewritten by this change.

No new functional blocker was identified within this review and test coverage. Physical-device behavior, a full penetration test and live AI-provider validation are not established by these checks.
