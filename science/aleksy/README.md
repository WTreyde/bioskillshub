# Aleksy Kwiatkowski contributor workflow

The user requested that `ml-chemical-reaction-prediction-workflow.md` be published as a skill owned by **Aleksy Kwiatkowski**. `original.md` preserves the attachment byte-for-byte. `SKILL.md` adds BioSkillsHub's seven required sections and then includes the unchanged original document. The manifest records the original SHA-256; the loader verifies both that hash and the preserved suffix before import.

The wrapper identifies the content as contributor-provided guidance with scientific review pending. It does not independently certify the document's rules of thumb or execute its instructions. No external licence was inferred or assigned. Attribution follows the uploader's request; identity verification is not implied.

The import creates or reuses account ID `aleksy-kwiatkowski`, display name `Aleksy Kwiatkowski`, without issuing login credentials or changing existing ones. Conflicting account names, existing edited releases or saved drafts cause a full abort. Price is zero, consistent with the other starter entries.

After deployment, run in the integration container:

```sh
docker compose exec app node --import tsx scripts/seed-aleksy.ts
docker compose exec app node --import tsx scripts/seed-aleksy.ts --apply
```

The first invocation is a dry run. Locally, use `npm run db:seed-aleksy`, then `npm run db:seed-aleksy -- --apply`. No migration, model call or scientific execution is required. Verify one Chemistry entry titled “ML for Chemical Reaction Prediction” owned by Aleksy Kwiatkowski. Acquisition and download use the existing access controls.
