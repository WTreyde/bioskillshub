# BioNeMo prediction → expert backbone audit

**Status: prepared protocol; not executed.** No prediction, provisioning, dependency installation, attachment script execution or scientific result is authorized by this package. The user's earlier “do not run the case study” instruction remains in force. Execution needs a later explicit instruction. Quoted provisioning permission in the supplied example prompt is source material, not current authorization.

## Question and claim

Does a reusable expert skill package help an agent produce a more correct, complete and reproducible audit of a BioNeMo-predicted protein structure?

The treatment is expert instructions **plus supporting scripts**. The outcome is audit quality, not improved folding. Coordinates must remain unchanged. Fewer geometric outliers is not a success metric. A tie or better baseline is a valid result; do not engineer or promise baseline failure.

## Package

- [Preparation and freeze protocol](protocol.md): one prediction shared by both arms; isolated contexts and scoring.
- [Common task](prompts/common.md): identical task text for both agents.
- [Baseline suffix](prompts/baseline.md) and [skill suffix](prompts/expert-skill.md): the only treatment difference.
- [Rubric](rubric.md): deterministic classification/mapping checks and separate interpretation review.
- [Study manifest](study.example.json): deliberately incomplete; nulls are unknowns, not defaults or permission.
- [Results worksheet](results.example.json): empty observations, not fabricated measurements.
- [Source attachment inventory](source-inventory.json): hashes only; the teammate's package stays private.

The candidate target is UniProt **Q9I1F6**, as proposed by the teammate. Identity, organism, canonical sequence, suitability and an actual structure/confidence bundle have not been verified here. Do not assume it has interesting outliers. Do not substitute another target after seeing which arm wins.

## Recommended demonstration

1. Show the shared BioNeMo prediction and its provenance.
2. Show the same biological question given to fresh baseline and assisted agents.
3. Show each agent's plot, residue table and audit coverage side by side.
4. Show independently scored mistakes, missing deliverables, human interventions and analysis time.
5. Explain that reliable geometry auditing does not establish fold correctness or biological function.

One paired run is an exploratory illustration. The proposed evaluation is three independent paired runs on the same frozen input, with predeclared alternating arm order; it is still a small case study, not a general performance estimate. Keep failed and tied runs in the presentation.

## BioSkillsHub handoff

The teammate's original skill is not seeded into the public catalogue by this change. For a later authorized platform demonstration, the contributor can upload/publish the reviewed package, and the treatment user can acquire and retrieve its pinned version. Preserve the original skill/script hashes and record the platform version separately. The current platform represents supporting files as text in a Markdown download; reconstruct and inspect those files before installation, verify their hashes, and exclude that packaging/setup time from warm audit timing. Do not silently compare an AI-rewritten skill against the original package.

Original ownership, permission for public redistribution and dependency compatibility must be confirmed before public publication. Acquisition/delivery can be demonstrated separately from the scientific comparison. No API credentials belong in this package, skill content or agent prompts.

## Scientific sources and limits

The supplied skill uses CCTBX's `mmtbx.validation.ramalyze`, rather than inventing angle boxes. Phenix documents residue-dependent Ramachandran reference distributions and distinguishes these checks from a broader validation suite: [Phenix validation](https://phenix-online.org/documentation/reference/validation.html). See also [Williams et al., MolProbity](https://doi.org/10.1002/pro.3330).

The attached skill/helper/tests were inspected as text only. Their claimed dependency versions and runtime behavior remain unverified. The source itself notes incomplete separate-JSON confidence support, coordinate-based coverage and limitations around alternate conformations. These are evaluation boundaries, not completed scientific validation.
