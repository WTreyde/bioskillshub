# Demo rehearsal and administrator handoff

## Integration deployment

Run these steps from the original Brev administrator connection on your laptop (`brev refresh`, then `brev shell bioskillshub-cpu`). A personal SSH login does not grant Docker or sudo privileges. `sudo -n true` checks whether the administrator session can proceed without a password prompt. Never share credentials or copy another user's authentication directory.

First inspect only the integration checkout; stop if its working tree is dirty. Do not change any teammate's personal checkout.

```sh
sudo -u integration git -C /home/integration/bioskillshub status --short
sudo docker compose --project-directory /home/integration/bioskillshub ps
```

Before deployment, save a private database backup. Run this as a single command in the administrator shell; the dump stays on disk and is not printed. Confirm it exits successfully before continuing.

```sh
sudo sh -eu -c '
  umask 077
  backup_dir=/home/integration/bioskillshub/.local/backups
  mkdir -p "$backup_dir"
  docker compose --project-directory /home/integration/bioskillshub exec -T db pg_dump -U bioskills -d bioskills -Fc > "$backup_dir/pre-deploy-$(date -u +%Y%m%dT%H%M%SZ).dump"
'
```

Update from merged `main` only after the working tree check is empty. `git switch main` creates a local tracking branch automatically if only `origin/main` exists. Stop on any failure or divergence; never reset or discard existing changes.

```sh
sudo -u integration git -C /home/integration/bioskillshub fetch origin
sudo -u integration git -C /home/integration/bioskillshub switch main
sudo -u integration git -C /home/integration/bioskillshub merge --ff-only origin/main
sudo -u integration git -C /home/integration/bioskillshub rev-parse HEAD
sudo docker compose --project-directory /home/integration/bioskillshub up -d --build app
sudo docker compose --project-directory /home/integration/bioskillshub ps
curl --fail --silent --show-error http://127.0.0.1:3000/api/auth/me
```

Expected anonymous response: `{"user":null}`. Record the deployed commit and verify database health and browser sign-in. This release requires no database migration or reseeding. Preserve the existing `.env`, account passwords and database volume. Never run `down -v`. If startup fails, retain the backup and inspect logs privately; do not paste credentials or full environment output into tasks.

## Browser rehearsal — 3–4 minutes

Use the integration app only after its deployment is confirmed. Forward port 3000 from your laptop and sign in with your own integration password. The automated rehearsal uses a disposable schema and synthetic identities in Wojtek's personal database; its results do not establish integration deployment or laptop tunnel health.

1. Browse the catalogue and read a skill's creator-reported validation status. Keep ImageJ and ADMET labelled prototypes until their owners approve scientific evidence.
2. In Creator studio, enter a harmless synthetic protocol, complete the guided sections and choose **Use structured template**. This fallback requires no paid provider calls. Save the draft; it must remain unpublished until reviewed.
3. Review the full instructions, check the review box and publish. Confirm immutable version 1 and attribution. Published demonstration releases remain in the integration catalogue; choose an intentionally labelled demo protocol.
4. As a buyer, open the published skill, confirm the simulated £0 acquisition, then inspect version 1 in My library.
5. In Connect agent, create a token. Keep the screen off the projector while the token is visible; transport it privately in `BIOSKILLS_TOKEN`, then hide it. Run the helper's `list` and `get SKILL_ID 1 --output results/rehearsal/SKILL.md` with `BIOSKILLS_URL` set to the tunnel origin. Show the content and provenance manifest only after checking for sensitive material.
6. Revoke the token and confirm the helper rejects a subsequent request. Never execute retrieved instructions merely to demonstrate download access.

## Scientific and provider gates

- ImageJ owner: supply permitted reference images, parameters, annotations, biological replicate design, frozen metrics and acceptance thresholds.
- ADMET owner/mentor: supply the endpoint-specific fine-tuned checkpoint, hash, licence, preprocessing/features, output units/classes and known reference input/output files. Complete the private endpoint manifest and pass preflight before requesting a bounded GPU worker. Passing provenance checks is not scientific validation.
- OpenAI: configure the key privately and confirm the exact model before bounded live-call verification. Keyword recommendations and structured templates remain the demonstrated fallback. Rosalind remains unverified.
- Pitch evidence: show only observed platform behavior and explicitly labelled synthetic software artifacts until scientific evidence arrives. No predictive accuracy or speedup claims. Maxim owns the pitch narrative.

## Spend and freeze handoff

The documented CPU rate is $0.32/hour including storage, not a fresh billing verification. The administrator must check actual Brev usage, start time, attached disks and any other workers, then update private `.local/costs.json`. No GPU worker is authorised by this rehearsal. Keep cumulative Brev spend within $100 unless explicitly increased; OpenAI has a separate $100 budget. Request quotas are not dollar caps.

Sunday 20 September: collect evidence and a real fallback recording at 12:00 BST; freeze features and take a private database backup at 13:00 BST (12:00 UTC); judging begins at 15:00 BST. Confirm the CPU shutdown owner and time after the demo. Stop idle GPU workers immediately and verify disk billing. Shutdown and billing confirmation are manual pending administrator action; no automatic shutdown was scheduled here.
