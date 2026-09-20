# Frozen audit rubric (draft for domain-owner review)

Score the same immutable input, not the apparent beauty of each plot. Record all metrics separately; do not invent a weighted overall winner. The reference is independently invoked, pinned CCTBX plus reviewed input/sequence/confidence provenance. Both prompts specify the same CCTBX reference method to isolate workflow/package effects. A different classifier is a protocol deviation, not evidence that one scientific method is universally wrong.

## Deterministic evaluation

| Metric | Definition / direction |
|---|---|
| Complete submission | Report, readable plot, residue table, outlier table (header-only is valid if none), coverage accounting, provenance and commands all present within budget. Binary; report which items are absent. |
| Classification correctness | Exact correctly classified reference-assessed records / all reference-assessed records. A missing, duplicate or ambiguously mapped submission record does not earn credit. Higher is better. If no reference records are assessable, metric is unavailable, not 100%. |
| Extra/invalid records | Count emitted classification keys absent from the agreed reference-assessed inventory. Lower is better; report alongside correctness so spurious extra rows cannot hide behind high recall. |
| Outlier detection | Report TP, FP and FN against the reference outlier keys. Precision = TP/(TP+FP), recall = TP/(TP+FN); zero denominators are null with their reason. A clean reference cannot demonstrate outlier recall. |
| Mapping errors | Count incorrect/ambiguous model, author chain, residue number, insertion code and alternate identifiers after a reviewed normalization. Do not silently collapse alternates. |
| Coordinate coverage | Compare reported unique assessed and unassessed coordinate-present residue sets with the reference sets; report missing and extra members, not just totals. Missing angles are not favorable classifications. |
| Sequence coverage | Compare canonical positions represented/missing in coordinates to an independently reviewed sequence mapping. Report absent mapping separately rather than treating coordinate coverage as full-length coverage. |
| Confidence fidelity | Count wrong provenance/scale/mapping claims. For verified mapped numeric confidence, compare values using a tolerance frozen from source precision before scoring. Unsupported confidence left unavailable is correct, not a missing result. |
| Coordinate integrity | Original input SHA-256 unchanged. Any alteration invalidates comparison on that input. |

Reference classification keys are `(selected model, author chain, author residue identifier, insertion code, alternate identifier)`. Preserve string identities rather than coercing residue IDs to integers. Inventory unique-residue coverage without alternate duplication. Freeze shared-backbone/alternate normalization with the reference implementation; acknowledge the supplied wrapper's limited alternate-specific missing-atom diagnosis. An evaluator must inspect differing denominators, not mix native CCTBX counts with wrapper records.

With no output, complete submission is false, correctly classified records are zero when the reference denominator is nonzero, and the reference outliers remain false negatives. Record failure reason and time-to-failure separately; a crashed run's short time is not a speed win. Confidence and interpretation are unassessable if absent, not automatically correct.

## Interpretation review

A blinded domain reviewer marks each item supported / unsupported / absent, quotes the relevant statement and records the supporting artifact:

1. Distinguishes prediction confidence, Ramachandran reference score and structural correctness.
2. Identifies actual residue/region issues and respects uncertainty and assessment gaps.
3. Does not infer correct folding, binding, affinity or activity from a clean plot.
4. Does not declare every outlier an error or silently repair coordinates.
5. Keeps confidence unavailable when its encoding or mapping is unverified.
6. Limits local claims appropriately; domain arrangement/contact claims need additional evidence.

“Suitable for cautious local inspection” is not experimental validation. Record disagreements and adjudication; do not convert subjective judgments into a novel universal quality score.

## Operational evaluation and reporting

Record warm analysis wall time, completion, tool calls, human interventions and errors for every repeat. Record setup/provisioning/prediction/transfer separately, outside the paired audit score. A speed comparison requires both valid complete outputs at comparable correctness; otherwise report completion/failure rather than a speedup percentage.

Show paired raw results and the range across repeats. Pre-register correctness/completeness as the main question and timing as secondary; do not swap the headline metric after results arrive. Ties and worse skill results remain visible. There are no measured scores yet. No test here supports a claim that the skill improves Boltz2 prediction accuracy.
