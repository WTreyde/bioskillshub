# Preparation, freeze and execution handoff

**Preparation only. Do not execute this protocol until the user separately authorizes running the case study.** No document here authorizes payment or changes another person's credentials/checkouts.

## 1. Establish the shared prediction, once

After execution is authorized, a coordinator verifies Q9I1F6 identity/organism, retrieves the canonical sequence with provenance, and confirms this is a suitable full-length single-chain target. Record the sequence and its hash. Choose the exact installed BioNeMo Boltz2 NIM/toolkit version and verify its supported request schema and hardware requirements; do not reuse a developer's absolute plugin path or guess an endpoint.

The teammate proposed three recycling steps, 50 sampling steps, one diffusion sample and mmCIF output. Treat these as proposed settings pending the pinned runtime's API check. Record the full effective request, MSA configuration/data provenance, seed if supported, model/container identifiers and actual settings. Unsupported seeds remain null with an explanation, not a claim of determinism.

Prefer an already saved suitable prediction when one exists. Otherwise, an approved operator generates **one** prediction, not one per arm. GPU type, current price, maximum runtime, spend cap, cache/storage plan and shutdown owner must be agreed before paid provisioning. Nothing in the attached example overrides current budgets or the no-run instruction. Separate provisioning, environment setup, prediction, transfer and audit timing. Stop only task-owned resources under the agreed plan and record residual storage costs. Audit itself is CPU-only; no refolding or new GPU is needed.

Preserve the canonical FASTA, effective request, raw response, original mmCIF, confidence files, sequence-to-coordinate mapping and their hashes. Do not repair or relax coordinates. Shared prediction costs are reported once, not credited as an advantage to either arm.

## 2. Prepare common inputs and independent reference

Prepare an input-only bundle with the same paths and bytes in each isolated workspace:

- `input/model.cif`: the unmodified single prediction.
- `input/sequence.fasta`: canonical sequence with the verified accession/version.
- `input/prediction-request.json` and `input/prediction-response.json`: credential-free request/response artifacts.
- `input/provenance.json`: hashes, runtime/model/MSA details, model selection, chain mapping and any unavailable fields.
- Confidence artifacts, if actually returned, plus documented units and mapping. A global score is not a per-residue score.

The coordinator prepares an independent CCTBX reference invocation on these same coordinates, without using the treatment wrapper. Pin its backend to the same version available to both arms. Record commands, output hashes, reference records and assumptions privately. An expert reviews the expected mappings and the interpretation rubric. Reference outputs and rubric answer keys are never visible to either agent. Agreement here is agreement with a reference implementation, not independent proof of the protein's biological correctness.

Inventory two kinds of coverage separately: (a) coordinate-present protein-like residues with/without assessable angles; (b) canonical sequence positions represented/missing from coordinates. The supplied helper reports (a), not automatically (b). Do not call terminal residues failures merely because both phi and psi cannot be computed.

Verify actual confidence encoding before enabling the helper's B-factor option. If confidence is separate JSON, either supply both arms an identical, reviewed mapping adapter or restrict the claim to geometry and mark residue-level confidence unavailable. Do not give a confidence adapter only to the treatment and attribute its effect to the unchanged skill. Do not rewrite B factors in the scored coordinate file.

For the initial one-chain case, freeze the region of interest using biological reasoning and validated numbering before running agents. A region is optional: leave it absent rather than invent significance. Complex domain orientation/contact claims require evidence beyond local geometry and local confidence.

## 3. Freeze the comparison

Complete `study.example.json` privately; unresolved nulls block execution readiness. Freeze file hashes, common prompt, two suffixes, scoring rubric, agent model/settings, tools, environment, budget and treatment package hash before collecting outcomes. Use three paired repeats if feasible; label a single pair exploratory. Proposed warm audit limit: 1,800 seconds per arm, subject to pre-run review. Record the actual agreed limit and equal agent token/reasoning limits; no unstated unlimited retries.

Preinstall the same public tools (including CCTBX, plotting and parsing libraries) and provide identical vendor documentation to both arms. The attached package pins Python >=3.11,<3.13, cctbx-base 2025.11 and matplotlib 3.11.2; these pins have not been installed or verified here. Resolve compatibility using a separate development fixture before freezing, record any change, then freeze and hash the skill again. Environment setup failure is a setup result, not scientific inferiority.

Construct each prompt by concatenating `prompts/common.md` with exactly one arm suffix. Only replace the same predeclared path/budget placeholders in both. Neither arm may access this repository's case-study directory, coordinator notes, earlier transcripts, sibling workspaces or held-out reference outputs. A baseline session must not auto-load the treatment through a globally installed skill, cached context or shared search directory. Materially identical base tool instructions, including any BioNeMo toolkit skill, remain available in both arms.

The treatment receives the exact private package at `skill/ramachandran-audit/`; the baseline does not. Underlying CCTBX and public documentation are available in both. This tests the value of a reusable instruction-and-software package. A separate third arm would be needed to isolate prose-only effects; do not imply that the two-arm experiment does so.

## 4. Later execution and scoring

Start fresh isolated sessions. Order pairs baseline→skill, skill→baseline, baseline→skill, as frozen beforehand. Keep input mounts read-only and provide separate empty writable output directories. Match CPU/RAM and network/documentation policy. Neither audit arm can provision infrastructure, invoke prediction endpoints or alter the input coordinates.

Timing starts when the common task is delivered in the already prepared environment and ends at a valid complete submission or the common timeout. Preserve failed attempts, all outputs, redacted logs and manual interventions. Do not rerun only the losing arm. Verify input hashes after each run; changed inputs invalidate the matched comparison and must be disclosed, not silently repaired.

An evaluator blinded to arm labels scores outputs using `rubric.md`, resolves mapping conventions before comparison and records observations in `results.example.json`. Preserve individual runs; do not select the best example as if representative. Report uncomputable metrics as null with reasons, never zero by default.

The generic `science/evaluation/compare.py` can summarize compatible recorded numeric run fields later, but it is not a residue-level scorer and does not assess scientific correctness. Do not feed it this protocol or empty worksheet as if they were completed runs.

## 5. Optional robustness suite

After separately freezing its fixture provenance and rubric, include a clean reference, missing-backbone/chain-break cases, insertion codes, alternate conformations and multiple models. Keep synthetic perturbations explicitly separate from genuine BioNeMo predictions; they test software robustness, not biological realism. Do not select or modify fixtures after observing an arm's performance. The attachment's 1CRN tests are unexecuted development checks, not proof of advantage on Q9I1F6.
