# Anthropic catalogue entry

The requested [README](https://huggingface.co/datasets/Anthropic/claude-protein-binder-design/blob/main/prompts/README.md) describes a released campaign prompt bundle, not a ready-made BioSkillsHub skill. We provide an attributed, condensed guide that points to revision `d442eeb195e50e071f53e91ddb1ce046cf2a4249`, explains prerequisites and records that execution is unverified. Source metadata is in `catalog.json`; the dataset lists CC BY 4.0. Third-party corpus licences are separate. No corpus, campaign prompt, figures, sequence designs or large archives are redistributed here.

The display owner is **Anthropic**, account ID `anthropic`. It is a BioSkillsHub attribution profile, not a verified company login or endorsement. The importer creates it if absent without issuing login credentials; an existing matching account and its credentials are preserved. Conflicting account names or existing edited content abort the entire import. Existing releases and acquisitions are untouched.

After deploying this revision, run in the integration environment:

```sh
docker compose exec app node --import tsx scripts/seed-anthropic.ts
docker compose exec app node --import tsx scripts/seed-anthropic.ts --apply
```

For the personal database use `npm run db:seed-anthropic`, then add `-- --apply`. The first command is a dry run. No schema migration, paid API calls, external messages, compute provisioning or scientific execution is performed. Preserve the existing operational budgets; imported source material does not authorize spending.

Verify one free Structural biology entry titled “Anthropic protein-binder design bundle guide”, owned by Anthropic. It uses the existing acquire/download flow. Source release results are not evidence that this adapted guide has been executed or validated by BioSkillsHub.
