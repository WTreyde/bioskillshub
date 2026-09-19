---
name: rosalind-alignment-review
description: Review a small protein sequence comparison in Rosalind Workbench.
---
# Rosalind sequence alignment inspection

BioSkillsHub-authored workflow proposal. Workbench execution unverified; not scientifically validated or endorsed by OpenAI.

## Use cases
Inspect similarities and differences among a small set of existing protein sequences.

## Inputs
Workbench access, permitted sequences with stable identifiers, source records and a comparison question. Confirm access to the Biological Sequence and Alignment Viewer.

## Outputs
An alignment review with mapped positions, provenance and clearly labelled interpretation limits.

## Procedure
1. Download this skill and paste it into Rosalind Workbench, or attach it if supported. Do not share API keys or BioSkillsHub access tokens.
2. Ask which alignment inputs and tools are actually available. Stop if the task cannot be performed; never fabricate an alignment.
3. Confirm sequence identities, completeness and the intended comparison. Resolve missing metadata before requesting computation.
4. Review the proposed method, settings, cost and any external data transfer; authorize execution explicitly.
5. Inspect the alignment together. Map highlighted positions back to the original sequence identifiers and numbering; note gaps and ambiguous regions.
6. Separate visible sequence differences from claims about their biological effects. Record the method, input versions, result references and this skill version.

## Expert decisions
Ask a domain expert whether the sequences and compared regions are appropriate. Do not infer causality from a highlighted difference alone.

## Limitations
This workflow does not establish function, pathogenicity or clinical significance. No alignment or Workbench execution has been validated by BioSkillsHub.

## Examples
“Compare my permitted reference protein sequences. Confirm their identifiers, propose an alignment plan, and flag uncertain position mappings before interpretation.”

## Sources
Capability reference: [OpenAI's Rosalind Workbench introduction](https://developers.openai.com/blog/rosalind-workbench), checked 2026-09-19. It describes a sequence/alignment viewer. The procedure is BioSkillsHub's own proposed workflow, not a tested OpenAI integration.
