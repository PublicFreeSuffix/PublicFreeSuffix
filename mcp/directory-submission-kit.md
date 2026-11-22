# Big-Vendor Directory Submission Kit

Materials for submitting PFS Free Domains to the first-party directories of major AI vendors. Everything here is pre-filled; each section lists what only the account holder can do.

Shared facts used everywhere below:

| Field | Value |
|---|---|
| Listing name | PFS Free Domains |
| Tagline | Free domains, DNS, WHOIS and SSL through one MCP server |
| Remote endpoint | `https://s.eus/api/mcp/pfs` (Streamable HTTP) |
| Transport | Streamable HTTP, MCP 2025-03-26+ |
| Auth | OAuth 2.1 — authorization code + PKCE S256, device code grant, refresh token; 401 + RFC 9728 `resource_metadata`; CIMD supported |
| Registry entry | `io.github.PublicFreeSuffix/free-domains`, v0.6.1, active on registry.modelcontextprotocol.io |
| Repository | https://github.com/PublicFreeSuffix/PublicFreeSuffix |
| Website | https://publicfreesuffix.org |
| Docs | https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/mcp/README.md |
| Privacy policy | https://publicfreesuffix.org/legal/privacy-policy/ |
| Terms | https://publicfreesuffix.org/legal/registration-agreement/ |
| Acceptable use | https://publicfreesuffix.org/legal/acceptable-use-policy/ |
| Support contact | ethan.walker@fs5.net |
| Description (vendor-safe) | Find and register free domains across seven live public suffixes, then manage DNS records, WHOIS lookups, SSL certificates, and free hosting without leaving the conversation. |

Note: listing copy must not mention prices or promotions, and the name must not end in "MCP" (OpenAI rule; Claude reviewers read the same guideline). "PFS Free Domains" complies.

---

## 1. Claude (Anthropic) — Connectors Directory

**Portal:** https://claude.ai/directory/manage → Submit new → **MCP connector**
**Who submits:** any paid Claude plan (Pro/Max/Ultra/Team/Enterprise); Team/Enterprise needs an Owner. The listing belongs to the submitting organization.
**Cost:** free. New connectors enter as **Community**; Verified is granted by Anthropic, not applied for.

### Before opening the portal

- [ ] Every tool has a human-readable `title` and a correct `readOnlyHint` or `destructiveHint` annotation. The portal flags missing ones during sync. Server source lives on SEUS — audit tool definitions there first if the portal complains.
- [ ] Create a **reviewer test account** on s.eus, populated with several registered domains (read-only data is enough).
- [ ] Confirm OAuth consent screen shows the app name and logo you registered on SEUS.
- [ ] Test each tool from a Claude conversation via a custom connector before submitting (the portal asks you to confirm this).

### Portal fields (pre-filled)

- Server URL: `https://s.eus/api/mcp/pfs`
- Name: `PFS Free Domains`
- Description: see shared table
- Documentation URL: repo docs link above
- Privacy policy URL: see shared table
- Support contact: ethan.walker@fs5.net
- Test account: (paste reviewer credentials — portal-only, never commit them)

### Example prompts (Anthropic wants at least 3)

1. "Find free domains under 8 characters on the pfsdns.org suffix that are still available."
2. "Register example.fs.kg for me and point its A record at 93.184.216.34."
3. "Look up the WHOIS details for tun.re and tell me when it expires."
4. "List every domain on my account and show which ones have SSL certificates."

### After submission

Automated validation → safety scan → Anthropic review (days, not hours). You control when the listing goes live. The dashboard later shows installs by surface (claude.com, Claude Code, mobile) and search queries.

---

## 2. ChatGPT (OpenAI) — Plugin (Connectors) Directory

**Portal:** OpenAI developer platform → Plugins page (https://developers.openai.com/plugins) → upload plugin ZIP
**Who submits:** a **verified developer identity** (business verification; individual verification may not be accepted for the upload dialog). Organization owner, or a member with Apps Management Write.
**Cost:** free.

### Before uploading

- [ ] Complete **individual or business verification** in organization settings (the upload dialog loops without it).
- [ ] **Domain verification** for the MCP server origin: OpenAI serves a challenge file — plan the deploy on `s.eus` before submitting. The origin can never change between versions, so confirm `s.eus` is final.
- [ ] Every tool carries `title` + all three hints (`readOnlyHint`, `destructiveHint`, `openWorldHint`).
- [ ] Record a 2–3 minute **demo video** in ChatGPT using the reviewer account, running the test cases below.
- [ ] Package the plugin ZIP with the MCP server config included (MCP config cannot be added to an existing skills-only plugin later).

### Test cases (OpenAI wants exactly 5 positive + 3 negative)

Positive:
1. "Find available free domains ending in bg5.net shorter than 10 characters." → domain search tool returns available names.
2. "Register myname.fs.kg." → registration flow runs and returns the created domain.
3. "Add an A record for blog.myname.fs.kg pointing to 1.2.3.4." → DNS record created and confirmed.
4. "What is the WHOIS info for is-a.si?" → WHOIS lookup returns registrar/expiry data.
5. "Show all domains on my account with their SSL certificate status." → list tool returns account domains.

Negative (must NOT trigger tools):
1. "What is a domain name?" → conceptual answer, no tool call.
2. "Register the domain mycompany.com" → clarify that .com is not offered; do not call tools.
3. "Send an email to the domain owner of example.bg5.net" → refuse; no messaging capability.

### Listing assets

Icon (1024×1024), name, description (see shared table), screenshots if UI components exist, privacy policy and support URLs (see shared table), country availability.

### Review behavior

Automated checks → review. Tool schema changes are held until they pass; the live definition keeps serving meanwhile. Keep the reviewed version stable during review.

---

## 3. Google — Connected Apps Platform (Gemini + Search)

**Sign-up:** https://developers.google.com/connected-apps (preview waitlist; access opens in phases; early reporting suggests US developers first).
**Console:** Google Connected Console → Create app → connection type **MCP server** → app details, MCP connection, testers → review → choose Search / Gemini app / both.
**Cost:** free. Streamable HTTP + publicly trusted TLS required (s.eus qualifies).

Action now: join the waitlist with the shared table values. Nothing else is possible until access opens.

---

## 4. Microsoft 365 Copilot — Agent Store

No bare-MCP listing path. To reach Copilot users: wrap the server in a declarative agent with Agents Toolkit, submit via **Partner Center** (Apps and Agents for M365 and Copilot), requires a verified publisher account and agent authentication. Any tenant can already self-connect the server in Copilot Studio — no submission needed for that.

Priority: low for a consumer/free-domain tool. Revisit if enterprise demand appears.

---

## 5. Other majors (no submission action)

| Vendor | Status |
|---|---|
| Grok | Custom connectors documented (~644 in catalog); no public catalog-submission route found. Users add `https://s.eus/api/mcp/pfs` as a custom connector. Publish a "Connect to Grok" guide on the website instead. |
| Meta Muse | Connector platform at platform.muse.ai exists, but Meta's own catalog curation is the gate; guides conflict on openness. Revisit. |
| Perplexity | Paid users add custom connectors; email api@perplexity.ai to request catalog listing. Optional. |
| Mistral Le Chat | Admins paste the server URL (auto-detects auth); curated directory is BD-only. No action. |

---

## Recommended order

1. **Claude connector** — highest value, simplest flow, only needs a paid plan + the checklist above.
2. **ChatGPT plugin** — biggest audience, heaviest prep (verification, ZIP, video, test cases).
3. **Google waitlist** — one form now, review later.
4. Grok/Mistral docs pages — write "Connect to X" guides so custom-connector users can self-serve.

---

## Submitted (tracker)

| Directory | Date | Status | Reference |
|---|---|---|---|
| Official MCP Registry | 2026-11 | published | `io.github.PublicFreeSuffix/free-domains` v0.6.1 |
| Cursor Marketplace | 2026-11 | published | repo `PublicFreeSuffix/pfs-cursor-plugin` |
| GitHub MCP Registry onboarding | 2026-11-22 | requested | discussion #1257 comment + email to partnerships@github.com |
| mcpservers.org | 2026-11-22 | in review (~2 weeks) | email notification |
| awesome-remote-mcp-servers (jaw9c) | 2026-11-22 | PR open | PR #2667 |
| Docker MCP Catalog | 2026-11-22 | PR open, awaiting Docker review | docker/mcp-registry#7539 (`servers/pfs-free-domains/`) |

### Docker follow-up

- CI runs only after a Docker maintainer approves the workflow run (first-time contributor) — expected, no action.
- The PR process asks for test credentials via https://forms.gle/6Lw3nsvu2d6nFg8e6 once review starts. Provision the same reviewer test account planned for Claude/ChatGPT and submit it there when Docker requests it.
