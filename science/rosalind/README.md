# Rosalind Workbench starter skills

Three free BioSkillsHub-authored workflow proposals target capabilities described in the [official Workbench introduction](https://developers.openai.com/blog/rosalind-workbench): NGS analysis, molecular structure inspection and sequence/alignment inspection. Documentation was consulted on 19 September 2026. The procedures are our own proposed workflows, not copied official recipes or endorsements.

All entries say **Workbench execution unverified** and **not scientifically validated**. Documentation establishes intended capability, not access for this account, a working BioSkillsHub connector, file attachment support, or scientific correctness. No tool API names or model endpoint IDs are assumed.

## Use an acquired skill

1. Sign in to BioSkillsHub, acquire a Rosalind entry and download its selected version and provenance.
2. Open Rosalind Workbench in your ChatGPT app and complete its onboarding if available. Workbench access is separate from BioSkillsHub login and its OpenAI API-key settings. Check the official access guidance if Workbench or required tools are absent.
3. Paste the skill instructions into the Workbench conversation, or attach the file if that interface supports it. This is a proposed manual handoff; there is no automatic library synchronization. Never paste BioSkillsHub tokens or API keys.
4. Describe your permitted inputs and question. Ask Workbench to confirm available tools and propose a plan. Approve any data transfer, cost and execution separately. If a tool is missing, stop and record the limitation.
5. Inspect actual outputs and record input identifiers, tools/settings, limitations and skill version. Do not substitute an assistant's narrative for a missing execution result.

The three entries are FASTQ quality review (Genomics), protein structure inspection (Structural biology), and sequence alignment inspection (Genomics). They can be downloaded as instructions even when Workbench access is unavailable, but must not be advertised as verified integrations.

## Import

After deploying this revision, use the existing integration environment and an existing curator account. No migration, credentials, API calls or GPU job is required. Back up using the usual deployment procedure first.

```sh
docker compose exec app node --import tsx scripts/seed-rosalind.ts --owner wojtek
docker compose exec app node --import tsx scripts/seed-rosalind.ts --owner wojtek --apply
```

For Wojtek's personal database, use `npm run db:seed-rosalind -- --owner wojtek` (dry run), then add `--apply`. The shared atomic importer creates only missing version-1 entries and skips exact matches. Conflicting releases or drafts abort the entire import; accounts, credentials, literature skills and existing content remain untouched.

## Verification still needed

An authorized Workbench user must test each manual handoff with harmless public or synthetic input, confirm the named capability is actually available, execute an approved small task and retain its real output/provenance. Record the date, account access scope, tool names and observed limitations without storing credentials or private data in this repository. Until then, retain the unverified label. Successful database/import tests are not Workbench verification.
