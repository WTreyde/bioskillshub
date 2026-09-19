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

**Find skills** sends your question and public catalogue metadata to OpenAI. **Generate AI draft** sends your title and expert answers. **Chat with AI** sends the conversation so far on each explicit send or draft request. The BioSkillsHub server receives the key for that request and forwards it only to OpenAI's fixed Responses endpoint. It does not record keys or submitted text; it records user, model and token counts. Personal requests are limited to 20 per user per hour, with at most 2,200 output tokens per request. These are request limits, not dollar caps. Configure and monitor your OpenAI project budget separately.

Your personal key takes precedence over a configured hosted key. Invalid keys, model access and billing limits produce errors; they do not silently use the hosted account. **Use structured template** never calls OpenAI. Without either key, discovery uses labelled keyword matching. Skill purchases are simulated; OpenAI API calls can incur real charges. ChatGPT subscriptions and API usage have separate billing.

The server requests `store: false`; this is not a guarantee of zero provider retention. Consult [OpenAI's data controls](https://developers.openai.com/api/docs/guides/your-data) and [API authentication guidance](https://developers.openai.com/api/reference/overview). A ChatGPT account is not connected to this site by opening its link. No API key or BioSkillsHub token is needed for manual skill download while signed in.

Deployment must use HTTPS (or localhost development). Do not enable request-body logging, session replay, or analytics that capture credential fields. The helper download endpoint serves source text only; it never executes uploaded instructions.

## Create a skill by chatting

1. Enable your key in **AI settings**, or use hosted AI if available.
2. Open **Creator studio → Chat with AI**. Explain your workflow in ordinary language: what you want to achieve and how you currently do it.
3. Choose **Send to skill assistant**. Answer its follow-up questions about inputs, software, steps, parameters, expert decisions, quality checks and limitations. Each request sends the conversation so far to OpenAI and counts against the existing AI limits.
4. Choose **Create skill draft** when ready. You can include a final answer in the message box. Unknown information is marked as needing confirmation; the assistant must not invent validation evidence.
5. Inspect the generated preview. **Download draft SKILL.md** saves a local copy. To host it here, choose **Use draft in editor**. Confirm replacement if you already have editor content. Edit the title, summary, category, instructions and validation status. Save the draft to host it privately; check the review confirmation and publish to make it available in the catalogue.

The chat never saves or publishes automatically. The transcript is temporary and is cleared when leaving the chat editor, changing modes, refreshing or signing out. Save the generated draft before leaving. Failed requests preserve the submitted answer for retry; no automatic retries or duplicate paid calls are made. Conversations are bounded to 20 messages and 24,000 characters per request (6,000 per message); at the limit, create a draft or restart with a concise summary. The final exchange is reserved for draft creation.

Without configured AI, the chat clearly explains how to connect a key; **Guided authoring → Use structured template** still works without paid calls. The chat documents workflows; it does not execute scientific tools or establish scientific validity.

## Import files or a folder with AI

1. Configure personal or hosted AI, then open **Creator studio → Import files with AI**.
2. Upload either a single file or a ZIP-compressed folder. Compress multi-file workflows into `.zip` first. Any programming language is accepted (including Java, C++, Rust and extensionless build files) if its source is UTF-8 text. Limits: 200 KB (200,000 bytes) for the upload, 200 KB total expanded ZIP contents, and 100 files. Hidden/private paths, common secret filenames, dependency folders, nested archives, empty and binary files are skipped. Encrypted, corrupt, ZIP64 and symbolic-link archives are rejected. A new selection replaces the previous one; inspect the selected-file list before sharing.
3. Expand each filename to inspect its contents, remove unwanted files, and add context. Filename checks do not detect all secrets: remove credentials and any private data you cannot share. Selection stays local until you explicitly consent and click **Analyse files with AI**. Leaving the importer discards its temporary selection and preview.
4. Review the AI's notes and converted Markdown. This analysis uses the existing OpenAI settings and quotas and may incur API charges. The server does not execute code, install dependencies, extract archives or follow URLs. Files are treated as untrusted text; analysis is not a security audit or scientific validation.
5. Choose **Use imported draft in editor**. Confirm replacement if the editor already has content. Inspect and edit the complete result, save a private draft, then explicitly confirm review before publishing. Conversion does not save or publish automatically.

Original selected text files are appended unchanged under **Original supporting files**, with their relative paths and safely delimited code blocks. The downloadable artefact remains a single Markdown skill, not a ZIP archive or installed environment. After reviewing it, a user or agent can extract the source text into the listed project files; no extraction is automatic. Saving/publishing includes these files in the skill, so check redistribution permission and remove anything inappropriate before saving. Missing dependencies, data or parameters must be resolved by the researcher.

The information notice in AI settings and the importer explains that a personal OpenAI key passes through the BioSkillsHub server to OpenAI and is not stored by BioSkillsHub. Hosted AI uses the platform key instead; submitted text and files still go to OpenAI. Saved skills can contain up to 300 KB, allowing room for instructions and preserved source files.
