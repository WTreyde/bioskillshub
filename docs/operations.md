# Retired service and private data

## Current state

The Brev CPU and GPU instances and the temporary Cloudflare URL have been retired. The GitHub Pages site is a static showcase; it does not use GitHub OAuth or connect to the former application database. There is no active cloud shutdown job or Brev stop script in this repository.

## Backups and credentials

Private database backups, checksums, restore records, environment files and account credentials are local operational data, not source files. Keep them outside Git and outside any unencrypted/shared sync folder. `.gitignore` is not an encryption or cloud-sync boundary. Preserve at least one verified backup until you have confirmed whether the old catalogue data is still needed; a code clone cannot reconstruct it.

If the GitHub OAuth App was used only for the retired full application, confirm that no other service depends on it, then remove its old callback or retire the app in GitHub settings. GitHub Pages does not need this OAuth app.

## Restore

To bring back the functional application, choose a new host and stable HTTPS origin, then follow [the restart guide](restart.md). Restore the private database and configure fresh host-specific secrets privately. Do not reuse a retired host's SSH connection details or publish a database dump to GitHub.
