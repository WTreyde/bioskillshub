# Wojtek — integration, infrastructure and ADMET

Read AGENTS.md, docs/architecture.md and docs/setup.md. Own server-side access control, PostgreSQL, agent retrieval and deployment. Efe owns primary UI edits. Keep all credentials private.

## Mentor questions to resolve now

- OpenAI: Is Rosalind API access actually active, what exact model ID works, and how can Workbench load custom instructions? Verify an end-to-end harmless example before claiming compatibility.
- NVIDIA: Which KERMT endpoint-specific fine-tuned checkpoint can we run today? What endpoint, output units/classes, licence, preprocessing, scaling, features, reference inputs and expected outputs apply? Is there a ready container and GPU recommendation?
- If no appropriate ADMET checkpoint is available, report the exact missing artefact to the mentor and team immediately. Do not substitute general pretrained weights or invent predictions. Agree a replacement scientific example explicitly.

Fill science/admet/endpoint.example.json into a private real manifest, run preflight, then run documented inference. Do not train a broad model this weekend. Freeze a small evaluation set and metric. Keep existing BioNeMo instructions in both conditions, adding our expert guidance only in the treatment condition.

Provision CPU workspace only after Brev login and price verification. Initial cumulative Brev cap $100, absolute $1,000; OpenAI $100 separate. Install per-user Codex and SSH setup. The CPU host can remain up overnight; bound and stop all GPU workers. Keep the integration clone separate from active development.

Run npm test against the isolated test schema before integration. Test real provider calls only after environment credentials are configured, with limited requests. Record provider/model and token usage.
