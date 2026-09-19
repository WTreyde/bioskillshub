# Shared pitch and rehearsal script

## Core message

Scientific tools are increasingly accessible to agents. The judgement needed to use them well still lives in experts' heads. BioSkillsHub turns that judgement into versioned, discoverable instructions that researchers can acquire and use in their own workflows.

## Suggested five-slide narrative

1. **The missing method.** A tool manual explains commands; a domain expert knows channel assumptions, exclusions, preparation and interpretation. Use Leandre's actual microscopy example. Speaker: Leandre.
2. **Expertise, executable.** Show catalogue → relevant skill → creator attribution → validation status → simulated acquisition. Speaker: Efe.
3. **From creator to agent.** Show an expert answer becoming a reviewed draft, a published version, and a pinned agent retrieval. Explain access control honestly. Speaker: Wojtek.
4. **Evidence across two domains.** Insert only actual ImageJ and ADMET outputs. Show baseline/skill-assisted conditions and measured quality/time if available. Clearly separate prototype capability from scientific validation. Speakers: Leandre and Wojtek.
5. **A sustainable expert network.** Individuals contribute and maintain expertise; academics and companies can benefit. Payments, academic access, subscriptions and collaboration are the business roadmap. Close with what the team built and what is next. Speaker: Maxim, then shared questions.

## Live demo, 3–4 minutes

Sign in before stage. Describe fluorescence analysis; open the recommended skill and its validation status. Acquire through simulated checkout. Switch to library and show a pinned version retrieval in the agent workspace; never display the token. Open genuine overlay/count outputs if validated. Show a second real ADMET result only if the checkpoint gate passed. Finish with the creator form and version history.

## Evidence placeholders — do not replace with invented numbers

| Claim | Required evidence | Owner |
|---|---|---|
| Skill improves nuclei/foci analysis | Held-out masks/counts, same-tool baseline, frozen rubric | Leandre |
| Expert guidance improves ADMET workflow | Verified checkpoint, comparable runs, documented endpoint checks | Wojtek |
| Acquired skill reaches an agent | Real API retrieval and manifest | Wojtek/Efe |

## Rehearsal and fallback

Sunday 12:00: collect real artefacts and record fallback. 13:00: freeze, backup database privately, stop feature additions. Rehearse all handoffs and verify app/database/SSH tunnel. Keep screenshots or recording of real successful runs; label recorded playback. Do not promise outcomes for experiments that have not completed.

## Evidence and Q&A notes for the existing slide deck

Keep the existing deck; use these notes to check its claims and speaker handoffs.

**Demonstrated:** review-gated publication, immutable versions, simulated acquisition, protected pinned retrieval, SHA-256 provenance and revocation. A headless browser rehearsal exercises the creator-to-buyer flow; its private recording is synthetic software evidence. Public metadata browsing and GitHub sign-in implementation are additional platform capabilities; label GitHub live verification pending until an OAuth App is configured and exercised.

**Not yet demonstrated:** improved microscopy accuracy, ADMET predictions, live model recommendations/draft generation or Rosalind compatibility. Show the actual recorded platform flow if scientific evidence does not arrive. Keep ImageJ and ADMET as explicitly labelled prototype examples.

| Likely question | Grounded answer |
|---|---|
| Why not free BioNeMo skills? | This catalogue packages a contributor's task-specific decisions, provenance and version history alongside existing tool instructions. Demonstrating a measurable advantage still requires paired evaluation. |
| Can a buyer copy the instructions? | Yes. Authorized downloads are readable by the person controlling the agent. This is access control, not DRM. |
| Who validates a skill? | The creator reports its status; domain owners must supply reference evidence. Structural checks and successful download do not establish scientific correctness. |
| What changes when an author updates a skill? | New immutable versions are published. Buyers can retrieve an explicitly pinned version; restoration creates another release. |
| How do contributors earn money? | Purchases are simulated today. Contributor payouts, subscriptions and academic/enterprise access are product hypotheses and roadmap work. |
| Does it run arbitrary uploaded code? | No. Web handlers treat skill content as text. Execution belongs in the researcher's separately controlled environment. |
| What if the provider is unavailable? | Keyword recommendations and structured templates keep the core flow usable; live model calls are an optional configured feature. |
| Is GitHub OAuth already verified? | The state/PKCE and account flows have mocked-provider coverage. Live verification needs a registered OAuth App and private credentials. |

For fallback playback, use the generated `.local/rehearsal/rehearsal_*/` recording only after inspecting it. It ends before any access token is created. Introduce it as a recording of a synthetic platform rehearsal, not scientific results. The frame showing prototype validation status should remain visible.
