# Team SSH and Codex access

All four supplied public keys are installed in their matching Linux accounts. Password login is disabled. Personal accounts have private home directories and no sudo/Docker privileges.

## Connect from your laptop

Add this to `~/.ssh/config`, replacing `YOUR_USERNAME` with `efe`, `leandre`, `maxim` or `wojtek`. Set `IdentityFile` to the private key corresponding to the public key you supplied (Efe may use `~/.ssh/id_rsa`). Never send that private key to anyone.

```sshconfig
Host bioskills-me
    HostName global.prd.ga.run.brev.nvidia.com
    Port 37675
    User YOUR_USERNAME
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 30
    StrictHostKeyChecking ask
```

Run `ssh bioskills-me`. On first connection, verify the ED25519 host fingerprint is:

```text
SHA256:d6aXwmtvg4lvUoWogI50KkXESuL3fsaj6UfX42QfqdQ
```

The endpoint/port may change if Brev recreates its route. Ask the workspace administrator to check `brev refresh` and the current instance access details if the endpoint stops working. Do not disable host-key checking if a fingerprint changes.

If your private key has a passphrase, unlock it locally. On macOS:

```sh
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

On Linux use `ssh-add ~/.ssh/id_ed25519`. Substitute your actual private-key filename. Enter the passphrase only in your terminal prompt, never in chat.

## Open the project in Codex

On the remote host:

```sh
cd ~/bioskillshub
codex
```

Complete your own Codex authentication. Then in the desktop app go to Settings → Connections → SSH, enable `bioskills-me` and choose `/home/YOUR_USERNAME/bioskillshub`. See [official SSH setup](https://learn.chatgpt.com/docs/remote-connections#connect-to-an-ssh-host).

## Development ports

| Account | App | Database | Original workspace branch |
|---|---:|---:|---|
| efe | 3001 | 5439 | codex/efe-workspace |
| leandre | 3002 | 5440 | codex/leandre-workspace |
| maxim | 3003 | 5441 | codex/maxim-workspace |
| wojtek | 3004 | 5442 | codex/wojtek-workspace |

The branches above describe initial provisioning. PR #1 is merged; start new changes from `origin/main` on a short-lived `codex/<name>-<change>` branch as described in [the setup runbook](../setup.md).

Dependencies and separate databases are ready. Start your server using `npm run dev -- --port YOUR_PORT`. Forward the same port from your laptop using `ssh -N -L YOUR_PORT:127.0.0.1:YOUR_PORT bioskills-me` and open `http://localhost:YOUR_PORT`.

For the shared demo use `ssh -N -L 3000:127.0.0.1:3000 bioskills-me`, then open http://localhost:3000. Its passwords differ from your development database. Wojtek holds the shared demo credentials. Each personal checkout has its own private `.local/team-credentials-*.txt` file.

Read AGENTS.md and your individual workstream document before making changes. Authenticate GitHub separately when you need to push; no shared GitHub credentials have been installed.

## Verification status

All four key formats and file ownership/modes were checked. The SSH server accepts Wojtek's public key, but the local private key still needs unlocking before a full personal login can be verified. The other teammates must verify login from the machines holding their corresponding private keys.
