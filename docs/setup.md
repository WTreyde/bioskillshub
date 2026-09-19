# Brev shared workspace runbook

## Provisioning gate

Credits are activated but no project instance has been created. The accessible Brev browser requires sign-in. Use the private invitation supplied to the team; never copy it into this repository. Select CPU-only Linux, aiming for 8 vCPU / 32 GB RAM, with a disk sized for the web app and Fiji. Inspect available pricing before creation; do not substitute an expensive GPU host silently.

Record instance ID, hourly compute, disk charges, start time and projected time through Sunday in `.local/costs.json`. Start only if projected cumulative spend remains below $100. Reserve worker budget within that cap. Raising it requires Wojtek's explicit decision; $1,000 is an absolute ceiling. OpenAI has a separate $100 cap. Billing alerts are not a shutdown guarantee.

## Machine setup

Install Git, Node 22+, Python 3.10+, Docker and Docker Compose using official distribution packages. Install Codex using official OpenAI instructions. Each teammate authenticates their own Codex account in their own Linux account. Do not share an account's credentials directory.

Create Linux accounts `efe`, `leandre`, `maxim`, `wojtek` and `integration`, with home directories and individual SSH public keys. Share private account credentials out of band. Grant only the permissions needed; Docker group membership is effectively root and must be intentional. Prefer the integration owner managing shared infrastructure.

Each person clones https://github.com/WTreyde/bioskillshub into their own home. Use separate Docker Compose project names, database volumes and app ports:

| Account | App port | Database port | Compose project |
|---|---:|---:|---|
| integration | 3000 | 5438 | bsh-integration |
| efe | 3001 | 5439 | bsh-efe |
| leandre | 3002 | 5440 | bsh-leandre |
| maxim | 3003 | 5441 | bsh-maxim |
| wojtek | 3004 | 5442 | bsh-wojtek |

Set `COMPOSE_PROJECT_NAME`, `APP_PORT`, `DB_PORT`, `DATABASE_URL`, `APP_ORIGIN` and a unique password in each private `.env`. For native Next development use `npm run dev -- --port 3001` (substitute allocated port). Docker Compose reads APP_PORT. For browser access use matching local and remote ports through SSH.

Add a concrete host alias to each laptop's `~/.ssh/config` using the actual host, personal Linux username and SSH key. Confirm `ssh <alias>` and `codex --version` in the remote login shell. In Codex Settings → Connections, enable the SSH host and select the personal clone. Follow [official remote setup](https://learn.chatgpt.com/docs/remote-connections).

Start the integration app with `docker compose up -d --build`, initialise its database, and access through `ssh -N -L 3000:127.0.0.1:3000 <integration-host-alias>`. The app is not exposed publicly. Keep APP_ORIGIN equal to the browser's origin, normally http://localhost:3000.

## GPU workers

Do not launch until the ADMET checkpoint is verified and a concrete command/runtime estimate is available. Use the mentor-recommended GPU, record actual hourly cost and set a maximum lifetime. Copy only needed inputs; keep credentials outside images. Execute one small smoke test before larger runs. Stop/delete the worker through Brev after completion and confirm billing state, including disks. A shell timeout only stops the command, not the billed instance.

## Overnight and recovery

Keep CPU services in Docker with restart policies. Use tmux for a long-lived remote Codex CLI session if the desktop connection may close. A running VM does not itself schedule new agent work. Save progress and status in the repo; authenticate before leaving. Export PostgreSQL backups to a private location before risky migrations. Never run `docker compose down -v` on a shared demo database.
