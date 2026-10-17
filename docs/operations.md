# Retired service and private data

## Current state

The Brev CPU and GPU instances and the temporary Cloudflare URL have been retired. The GitHub Pages site is a static showcase; it does not use GitHub OAuth or connect to the former application database. There is no active cloud shutdown job or Brev stop script in this repository.

## Backups and credentials

Private database backups, checksums, restore records, environment files and account credentials are local operational data, not source files. Keep them outside Git and outside any unencrypted/shared sync folder. `.gitignore` is not an encryption or cloud-sync boundary. Preserve at least one verified backup until you have confirmed whether the old catalogue data is still needed; a code clone cannot reconstruct it.

GitHub Pages does not need the BioSkillsHub OAuth App. If you have confirmed that no other service uses it, delete the registration:

1. Sign in to the GitHub account that owns the app.
2. Open **Settings → Developer settings → OAuth Apps**, then select the BioSkillsHub app.
3. Open **Advanced → Delete application**.
4. Review the app name, then choose **Delete this OAuth Application** to confirm.

Deleting the app stops OAuth login for every service configured with that app. If you are unsure whether another service uses it, first remove the retired BioSkillsHub callback in **OAuth Apps → BioSkillsHub → Update application**, and leave the registration intact until dependencies are checked. GitHub's [OAuth App deletion guide](https://docs.github.com/en/apps/oauth-apps/maintaining-oauth-apps/deleting-an-oauth-app) has the current controls. After retirement, remove obsolete `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` copies from private configuration stores; never paste or commit them.

## Restore

To bring back the functional application, choose a new host and stable HTTPS origin, then follow [the restart guide](restart.md). Restore the private database and configure fresh host-specific secrets privately. Do not reuse a retired host's SSH connection details or publish a database dump to GitHub.
