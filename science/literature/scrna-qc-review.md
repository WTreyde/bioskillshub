---
name: bp-scrna-qc-review
description: Plan and review quality control for single-cell RNA sequencing.
---
# Single-cell RNA-seq QC review

BioSkillsHub literature adaptation; not authored or endorsed by the paper's authors. Expert review pending; not experimentally validated.

## Use cases
Audit an exploratory scRNA-seq preprocessing plan.

## Inputs
Count matrix, feature annotations, sample metadata, library technology and biological question; a versioned single-cell analysis environment.

## Outputs
QC plots, exclusion rationale and a reproducible preprocessing plan.

## Procedure
1. Distinguish UMI counts from read counts and identify sample structure.
2. Examine count depth, detected genes and mitochondrial fraction jointly.
3. Investigate potential low-quality cells and doublets; consider biological explanations for unusual QC values.
4. Select dataset-specific filtering and normalization, documenting choices.
5. Inspect downstream structure and revisit exclusions when evidence suggests valid populations were removed.

## Expert decisions
Explain thresholds rather than copying another dataset's values. Separate technical variation from the biological signal of interest.

## Limitations
This 2019 tutorial is a foundation, not a current software benchmark or universal threshold recipe. Obtain expert input before inferential analysis.

## Examples
If one population has elevated mitochondrial counts, investigate its biology before applying blanket exclusion.

## Sources
Luecken and Theis (2019), [Molecular Systems Biology](https://doi.org/10.15252/msb.20188746). Source: CC BY 4.0. This condensed adaptation omits the original tutorial's code and numerical settings.
