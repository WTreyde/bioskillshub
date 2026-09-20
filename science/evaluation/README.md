# Frozen evaluation contract

Use two conditions: baseline and expert_skill. Same model/runtime version, input files, tools, compute, task prompt, time limit and existing tool instructions. Use fresh contexts and record seeds where supported. BioNeMo skills stay available in both ADMET conditions. Do not tune expert instructions on held-out evaluation outputs.

Before running, domain owners freeze the reference dataset, allowed exclusions, output metrics and acceptance tolerances. ImageJ: segmentation agreement and per-nucleus count error with overlays, not merely successful execution. ADMET: input preparation, correct endpoint/units/output alignment and task completion; predictive metrics only when reference labels support them. Avoid treating correlated nuclei as independent replicates.

Copy run.example.json per run into a private results directory. Retain unsuccessful runs, stderr (after credential redaction), outputs, input/checkpoint/skill hashes and agent tool-call counts. Measure total wall time consistently, distinguish setup from inference, and document any human intervention. Run repeated paired trials when time permits; otherwise label the comparison exploratory and avoid generalised accuracy claims.

Scientific owners must sign off the references and acceptance thresholds. The platform's seed validation labels remain pending until then.

Use `compare.py BASELINE.json EXPERT.json --output PRIVATE_COMPARISON.json` to check paired settings and report recorded timing/metric differences while retaining failures. It does not establish significance or scientific validity. See [artifact intake](../../docs/scientific-intake.md).

## BioNeMo backbone-audit case study
