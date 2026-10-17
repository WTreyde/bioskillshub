# Local development and contribution

The shared Brev workspace has been retired. Use a local machine or a host you control; this guide does not provision cloud resources or grant access to any old account.

For prerequisites, environment setup, PostgreSQL initialization, development commands, OAuth and recovery, follow [README.md](../README.md) and [the restart guide](restart.md).

For code changes, start from a clean clone of `main`, create a short-lived `codex/` branch, run the checks listed in [AGENTS.md](../AGENTS.md), and open a focused pull request. Use a disposable database for tests. Never commit `.env`, `.local/`, database dumps, credentials or private scientific inputs.
