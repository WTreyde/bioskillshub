# Paired scientific workflow evaluation

These utilities support future, expert-reviewed evaluations; they do not run a scientific tool or validate a skill by themselves. The original hackathon comparison study has been retired. No current evaluation result or improvement claim is supplied.

Use the same model/runtime, input files, tools, task prompt, compute and time limit across baseline and skill-assisted conditions. Freeze the reference data, exclusions, metrics and acceptance tolerances before running. Keep failures and human interventions. For microscopy, preserve biological replicate structure and use overlays plus reference agreement, not just successful execution. For molecular predictions, use a documented endpoint and reference labels before calculating predictive metrics.

Copy `run.example.json` into a private results folder for each run. Keep private inputs, outputs and credentials outside Git. `compare.py` checks paired settings and reports raw differences; it does not establish significance, scientific validity or a generalized improvement. Do not treat synthetic fixtures as scientific evidence.
