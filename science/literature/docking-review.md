---
name: bp-docking-review
description: Review molecular docking preparation, controls and interpretation.
---
# Molecular docking reproducibility review

BioSkillsHub literature adaptation; not authored or endorsed by the paper's authors. Expert review pending; not experimentally validated.

## Use cases
Plan a small-molecule docking experiment or audit its reported methods.

## Inputs
Target structure and functional state, ligands, reference evidence, preparation records and a versioned docking engine.

## Outputs
Preparation decisions, validation plan and reproducibility checklist.

## Procedure
1. Inspect structural defects and the biological relevance of the chosen receptor state.
2. Review protonation, hydrogen placement and atomic charges.
3. Justify retention or removal of binding-site waters, metals and cofactors.
4. Document ligand preparation, search region and docking settings.
5. Validate the setup against relevant reference evidence and visually inspect proposed interactions.
6. Report settings and interpret rankings cautiously; do not directly equate scores from different scoring functions.

## Expert decisions
Resolve preparation ambiguity with a domain expert before ranking candidates.

## Limitations
Docking does not establish experimental affinity, efficacy or safety. Stop when binding-site chemistry cannot be justified.

## Examples
For a metal-containing site, request the coordination and preparation rationale before proceeding.

## Sources
Martis and Téletchéa (2025), [PLOS Computational Biology](https://doi.org/10.1371/journal.pcbi.1013030). Source: CC BY. Independently worded, abbreviated checklist; consult the full paper.
