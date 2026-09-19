---
name: rosalind-fastq-review
description: Plan a reviewable FASTQ quality-control task in Rosalind Workbench.
---
# Rosalind FASTQ quality review

BioSkillsHub-authored workflow proposal. Workbench execution unverified; not scientifically validated or endorsed by OpenAI.

## Use cases
Review sequencing input quality before choosing further analysis.

## Inputs
Workbench access, permitted FASTQ files, sample sheet, organism, library type and biological replicate identifiers. Confirm that NGS Analysis Workbench is available.

## Outputs
An approved QC plan, available tool reports, and an issue log with unresolved questions.

## Procedure
1. Download this skill from your acquired library. Open Rosalind Workbench in ChatGPT. Paste its instructions into the conversation, or attach the file if supported. Never include a BioSkillsHub token or API key.
2. Ask Workbench which relevant tools and input formats are available. Stop if required capabilities are absent; do not invent tool names or endpoints.
3. Describe the files and experimental design. Ask for a QC-only plan and any missing metadata before uploading approved data.
4. Review proposed tools, parameters, external data transfers and cost before authorizing execution.
5. Inspect the returned reports. Separate observed findings from suggested follow-up. Do not trim or discard samples without a justified, approved decision.
6. Save input identifiers, actual tool versions, settings, output references and the skill version in your project record.

## Expert decisions
Resolve sample pairing and replicate identity with the researcher. Ask them to approve acceptance criteria; do not guess thresholds.

## Limitations
No test run is supplied. Missing access must be reported, not simulated. QC alone does not establish biological conclusions.

## Examples
“Using this skill, propose a QC-only plan for my permitted test FASTQs. Ask for missing sample metadata and wait for approval before running tools.”

## Sources
Capability reference: [OpenAI's Rosalind Workbench introduction](https://developers.openai.com/blog/rosalind-workbench), checked 2026-09-19. It describes NGS workflows and plan approval. The procedure above is BioSkillsHub's proposed handoff, not an official recipe or verified connector.
