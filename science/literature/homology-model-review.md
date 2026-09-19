---
name: bp-homology-model-review
description: Review comparative protein modelling templates and local model quality.
---
# Comparative protein model review

BioSkillsHub literature adaptation; not authored or endorsed by the paper's authors. Expert review pending; not experimentally validated.

## Use cases
Assess a template-based protein modelling plan before downstream interpretation.

## Inputs
Target sequence, candidate templates, original structure publications, alignment and proposed models; alignment, visualization and validation tools.

## Outputs
Template rationale, alignment concerns and regional quality report.

## Procedure
1. Check template coverage and relevance to the intended biological question.
2. Read the template's experimental publication and inspect missing or altered regions.
3. Review alignment gaps, insertions and residue numbering.
4. Document treatment of ligands, ions and waters; retain functionally necessary components.
5. Evaluate geometry and local quality using complementary methods; inspect clashes, backbone and side-chain outliers.
6. Revisit modelling decisions where validation exposes problems.

## Expert decisions
Distinguish well-supported regions from uncertain loops and domains. Do not trust a single global score.

## Limitations
This 2020 comparative-modelling guide is not an AlphaFold validation protocol. Model quality does not prove function.

## Examples
Flag an uncertain loop near a binding site and defer mechanistic conclusions pending expert review.

## Sources
Haddad, Adam and Heger (2020), [PLOS Computational Biology](https://doi.org/10.1371/journal.pcbi.1007449). Source: CC BY. Condensed adaptation with independently written instructions; no original figures or parameter recipes reproduced.
