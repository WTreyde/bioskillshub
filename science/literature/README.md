# Literature-based starter skills

Four free, independently worded checklists cover the platform's four supported domains. They are short adaptations of openly readable, peer-reviewed guidance, not copies of papers, complete executable protocols, scientific validation, or claims that older recommendations are still the best available methods. No article figures, datasets or code are redistributed. Attribution and source licensing are recorded in `catalog.json` and each skill. The curating platform account is not the author of the source paper; author endorsement is not implied.

| Skill | Domain | Source |
|---|---|---|
| Microscopy figure clarity audit | Imaging | [Jambor et al., 2021](https://doi.org/10.1371/journal.pbio.3001161) |
| Single-cell RNA-seq QC review | Genomics | [Luecken and Theis, 2019](https://doi.org/10.15252/msb.20188746) |
| Molecular docking reproducibility review | Chemistry | [Martis and Téletchéa, 2025](https://doi.org/10.1371/journal.pcbi.1013030) |
| Comparative protein model review | Structural biology | [Haddad, Adam and Heger, 2020](https://doi.org/10.1371/journal.pcbi.1007449) |

Selection: directly relevant practical guidance, retrievable original publication, identifiable authors/DOI, and a narrow task that can be honestly described without fabricating parameters. Original source pages were consulted on 19 September 2026. The scRNA-seq and homology-modelling entries explicitly retain their historical scope. Before using any skill on real data, check newer guidance and obtain a domain expert's review.

## Populate a database

Use the existing private environment for the intended database. Back up the integration database using the established deployment procedure. Choose an existing account that will curate these entries (Wojtek's seeded ID is `wojtek`). No account or credential is created or modified.

```sh
npm run db:seed-literature -- --owner wojtek
npm run db:seed-literature -- --owner wojtek --apply
```

The default is a read-only dry run. `--apply` publishes version 1 of missing entries at a price of zero; it does not acquire them for anyone. Existing matching entries are skipped. Any conflicting owner, content, version history or saved draft aborts the entire import. No existing skill is updated or deleted. The import uses a transaction and serializes parallel imports. Human edits should use the normal editor and publish a new immutable version; never silently rewrite imported releases.

For an existing Docker Compose integration deployment, after deploying this revision:

```sh
docker compose exec app node --import tsx scripts/seed-literature.ts --owner wojtek
docker compose exec app node --import tsx scripts/seed-literature.ts --owner wojtek --apply
```

The container already receives its environment; do not print it or pass database credentials on the command line. This import needs no schema migration, no OpenAI calls and no GPU work. The public catalogue should gain four free entries, each labelled literature-based, expert review pending and not experimentally validated. Sign in and acquire an entry to read/download its cited instructions through the normal entitlement flow.

Wojtek's personal database and the public integration database are separate. Running this locally does not populate the public site. Only the integration administrator can run the container import with their existing access.
