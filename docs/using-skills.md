# Use an acquired skill

1. Sign in, browse a skill and confirm its simulated acquisition. No payment is taken for a skill.
2. Open **My library**, open the skill, and select the published version you want. Versions are immutable.
3. Choose **Download selected skill** and **Download provenance**. Keep both files in your project. Read the skill, especially its prerequisites, validation status and limitations.
4. Attach the Markdown file to your existing ChatGPT conversation, or paste its text if attachments are unavailable. For a local coding agent, put it in your project and ask the agent to read that file. This is a manual handoff, not an automatic ChatGPT connection.
5. Use **Copy task prompt** in the skill's usage guide. Replace the bracketed task and inputs with your own. Ask for missing tools/data and a plan before execution. Never upload credentials or data you lack permission to share.
6. Review the proposed workflow. Install and run its required scientific software in your own environment. A chat assistant might only be able to explain or write code; downloading instructions does not install tools or make them available inside ChatGPT. Check the outputs against reference evidence and save the version and SHA-256 with the results.

ImageJ and ADMET examples remain prototypes. Their availability does not establish scientific validity. Instructions are readable by the acquiring user and must be treated as untrusted guidance.

## Optional terminal retrieval

In **Connect agent**, create a token. Download `agent_client.py` using the page's link. Python 3 is required; no repository clone or additional Python packages are needed. Open a terminal in that folder:

```sh
python3 agent_client.py --url "https://YOUR-DEMO-HOST" --prompt-token list
python3 agent_client.py --url "https://YOUR-DEMO-HOST" --prompt-token get SKILL_ID VERSION --output results/my-skill/SKILL.md
```

The selected skill's guide supplies the real host, ID and version. On Windows, use `python` if needed. Paste the token only at the hidden terminal prompt, never into a chat or command argument. For unattended agents, configure `BIOSKILLS_URL` and `BIOSKILLS_TOKEN` privately in their environment and omit the prompt flag.

The helper checks the returned SHA-256 and writes the instructions plus a `.manifest.json` file. Existing files are preserved: choose a new output location to repeat a download. A revoked/expired token requires replacement. Missing entitlement requires acquiring the skill with the account that created the token. The service must remain running and reachable; a temporary demo URL can change.

## Optional live AI

**AI settings** accepts your own OpenAI API key and an accessible model (the form suggests `gpt-4.1-mini`). Explicitly consent to API billing and data transfer, then enable the key for the current tab. It is held in React memory, not browser storage or the database, and cleared by refresh, sign-out, expired session or **Forget personal key**. Enabling a key does not validate it or make a paid call.

**Find skills** sends your question and public catalogue metadata to OpenAI. **Generate AI draft** sends your title and expert answers. The BioSkillsHub server receives the key for that request and forwards it only to OpenAI's fixed Responses endpoint. It does not record keys or submitted text; it records user, model and token counts. Personal requests are limited to 20 per user per hour, with at most 2,200 output tokens per request. These are request limits, not dollar caps. Configure and monitor your OpenAI project budget separately.

Your personal key takes precedence over a configured hosted key. Invalid keys, model access and billing limits produce errors; they do not silently use the hosted account. **Use structured template** never calls OpenAI. Without either key, discovery uses labelled keyword matching. Skill purchases are simulated; OpenAI API calls can incur real charges. ChatGPT subscriptions and API usage have separate billing.

The server requests `store: false`; this is not a guarantee of zero provider retention. Consult [OpenAI's data controls](https://developers.openai.com/api/docs/guides/your-data) and [API authentication guidance](https://developers.openai.com/api/reference/overview). A ChatGPT account is not connected to this site by opening its link. No API key or BioSkillsHub token is needed for manual skill download while signed in.

Deployment must use HTTPS (or localhost development). Do not enable request-body logging, session replay, or analytics that capture credential fields. The helper download endpoint serves source text only; it never executes uploaded instructions.
