---
name: expert-admet-assessment
description: Prepare and interpret endpoint-specific BioNeMo KERMT molecular property predictions.
---
# Expert-guided ADMET assessment

Prototype: blocked on verification of an endpoint-specific checkpoint and reference dataset.

## Use cases
Assess a defined ADMET endpoint for a small, explicitly identified molecule set using a model trained for that endpoint. This skill supplements the existing BioNeMo KERMT setup and inference skills; it does not replace them or constitute a newly trained predictor.

## Inputs
A CSV with stable molecule IDs and SMILES; an endpoint-specific fine-tuned checkpoint; its licence, provenance, endpoint definition, output units or class labels, preprocessing, feature settings and calibration documentation. Require a separate evaluation dataset with known labels if predictive accuracy will be measured.

## Outputs
Input validation report, endpoint-labelled predictions keyed to original molecule IDs, model/checkpoint provenance, applicability limitations and an execution manifest. Report model predictions as predictions, never as measured safety or clinical evidence.

## Procedure
1. Verify the selected checkpoint is fine-tuned for the requested endpoint. General pretrained KERMT weights provide representations, not arbitrary ADMET outputs. Stop if endpoint provenance is missing.
2. Follow the installed BioNeMo kermt-setup and kermt-infer instructions at a recorded commit. Confirm a supported NVIDIA GPU and preprocessing dependencies.
3. Parse SMILES without dropping stereochemistry or silently stripping salts. Follow the checkpoint's training-time standardisation and feature scaling. Preserve the original input and mappings for rejected or transformed structures.
4. Execute the documented inference command on a small smoke-test set. Verify output count, ID alignment, units, missing values and finite numeric values.
5. Compare against the checkpoint's documented reference behaviour. Only assess predictive accuracy with separate labelled data and a frozen metric appropriate to the endpoint.
6. Explain endpoint scope, uncertainty and applicability limits. If no calibrated uncertainty is supplied, say so rather than inventing confidence intervals.

## Expert decisions
Wojtek must approve endpoint choice, salt/tautomer/protonation handling, stereochemistry policy, appropriate labels and decision thresholds. Do not rank across incomparable endpoints. Similarity is only an applicability heuristic unless validated against the model's training domain.

## Limitations
No usable endpoint checkpoint has yet been verified for this project. No prediction or accuracy claim is currently supported. KERMT requires GPU resources per its documentation. Model suitability and licensing must be checked against the actual artefact selected by the NVIDIA mentor.

## Examples
Use science/admet/preflight.py to validate an endpoint manifest and local checkpoint before launch. An unconfigured or general pretrained model must fail preflight. Preserve BioNeMo's existing skill in both benchmark conditions, adding this expert skill only in the treatment condition.
