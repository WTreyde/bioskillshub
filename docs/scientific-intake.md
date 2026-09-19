# Scientific artifact intake

The platform and software checks can be completed without scientific data. Domain-specific protocols, permissions, reference labels and interpretations require their owners' evidence. Do not fill these gaps with invented parameters or surrogate predictions.

## ImageJ handoff

Copy `science/imagej/dataset.example.json` into a private data directory. Fill it with the owner's reviewed protocol, permission statement, biological question, independent replicate definition and frozen metric definitions/acceptance rules. For every development or held-out image, provide:

- Nuclear/foci image paths and SHA-256 hashes; channel definitions, pixel size, bit depth and 2D scope.
- Biological replicate and condition; keep a replicate within one split.
- Reference per-nucleus counts and labelled masks/ROIs with hashes. Document how predicted objects match reference objects before calculating count error.
- Protocol file/hash with exact ImageJ/Fiji/plugin versions, recorded menu/macro commands, background/threshold/separation choices, exclusions, foci rules, zero-count handling and manual interventions.

Run `python3 science/imagej/preflight.py PRIVATE_MANIFEST.json`. It verifies provenance fields/hashes and split separation, not microscopy accuracy. The actual runner remains a prototype until Leandre's method and parameters are reviewed. Do not change the seeded validation badge merely because preflight passes.

## ADMET mentor handoff

Copy `science/admet/endpoint.example.json` into a private directory and request the following as one concrete package:

| Artifact | Required information |
|---|---|
| Endpoint-specific fine-tuned checkpoint | File, SHA-256, source/version and redistribution/use licence |
| Endpoint definition | What is predicted; regression units or class meanings |
| Inference recipe | BioNeMo/tool commit, container/runtime, exact preprocessing, features/scalers and flags |
| Reference inputs | Molecule IDs/SMILES with permitted usage and applicability restrictions |
| Reference outputs | Known expected output for those IDs and numerical/class tolerances |
| Reviewer | Mentor/domain owner who approved the package and scope |

Run `python3 science/admet/preflight.py PRIVATE_MANIFEST.json`. General pretrained weights are rejected as an endpoint predictor. Passing provenance checks does not verify numerical predictions. Plan a GPU only after the complete package, measured price and bounded execution estimate are available. Keep existing BioNeMo instructions in both comparison conditions.

## Paired evaluation

Copy `science/evaluation/run.example.json` per run. Freeze the reference protocol and rubric before evaluation. Match model/runtime/tools, input hashes, seed and time budget; record the pinned expert skill only in the treatment, and preserve every failed run and human intervention.

After genuine runs are reviewed, run:

```sh
python3 science/evaluation/compare.py results/private/baseline.json results/private/expert.json --output results/private/comparison.json
```

The comparator rejects mismatched settings and missing/non-finite metrics, retains failures and reports raw differences. It makes no significance or generalized improvement claim. Metric direction and scientific meaning come from the frozen rubric. A single pair is exploratory. Never use the synthetic test fixtures as scientific evidence.
