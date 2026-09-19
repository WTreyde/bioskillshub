---
name: rosalind-structure-review
description: Inspect a protein structure with Rosalind's molecular viewer and record uncertainty.
---
# Rosalind protein structure inspection

BioSkillsHub-authored workflow proposal. Workbench execution unverified; not scientifically validated or endorsed by OpenAI.

## Use cases
Explore an existing protein structure and prepare questions for expert review.

## Inputs
Workbench access, an authorized structure file or public accession, its source publication, and a specific inspection question. Confirm access to the Molecular Structure Viewer.

## Outputs
A structure inspection note linking observations to chains and residues, with unresolved questions recorded.

## Procedure
1. Download this acquired skill. Open Rosalind Workbench and paste the instructions, or attach the file if supported. Keep all tokens and API keys out of the conversation.
2. Ask whether the molecular viewer can open the selected input. Stop if the capability or format is unavailable.
3. Ask Workbench to identify the structure source, model type, assembly and chain labels before interpreting it. Resolve ambiguous mappings with the researcher.
4. Request a view of the specified region and explanations grounded in the actual displayed coordinates. Distinguish observations from hypotheses.
5. Inspect the view yourself. Request clarification where a claim cannot be tied to a chain, residue or source.
6. Record the input identifier, questions, observations, unresolved limitations and skill version. Save a view or report only if that function is available.

## Expert decisions
Choose the biologically relevant assembly and distinguish experimental evidence from predicted coordinates. Defer unsupported functional conclusions.

## Limitations
A visual inspection does not measure affinity, establish mechanism or validate a prediction. No Workbench run has been demonstrated here.

## Examples
“Inspect this public protein structure with me. First confirm the assembly and chain mapping; explain what is visible and what remains uncertain.”

## Sources
Capability reference: [OpenAI's Rosalind Workbench introduction](https://developers.openai.com/blog/rosalind-workbench), checked 2026-09-19. It describes interactive structure inspection. These review instructions are an independent BioSkillsHub proposal; no automatic integration is asserted.
