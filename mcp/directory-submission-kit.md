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

**Console:** https://connected.google.com (sign in with a Google account; the old waitlist has become a self-service console flow)
**Docs:** https://developers.google.com/connected-apps
**Cost:** free. Preview access is still phased, but the console flow below is the documented path.
**Note (2026-11-22):** console pages need a Google login; everything below is pre-filled for paste-in.

### Console steps → what to paste

**Step 1 — Create app**
- Connected app name: `PFS Free Domains` (used as the user's @-mention handle)
- Category: pick the closest to Productivity/Tools — **cannot be changed later**, choose deliberately
- Connection type: **MCP server** (irreversible)

**Step 2 — App details**
- Icon: `assets/logo-512.png` (512×512 PNG, ~8 KB, generated from the repo SVG)
- Description (≤30 words): `Find and register free domains across seven public suffixes, then manage DNS records, WHOIS lookups, SSL certificates, and free hosting.`
- Capabilities (≥3, one per line, no leading numbers):
  - `Search available free domains across all supported suffixes`
  - `Register a free domain and claim it instantly`
  - `Manage DNS records for your registered domains`
  - `Look up WHOIS and SSL certificate details for any domain`
- Example prompts (≥3; at least 2 starting with @mention, at least 1 natural mention, no numbering, no quotes):
  - `@PFS Free Domains search for available free domains under 10 characters ending in bg5.net`
  - `@PFS Free Domains register the domain myproject.fs.kg and point its A record to 93.184.216.34`
  - `Use PFS Free Domains to look up the WHOIS details for tun.re`
  - `Ask PFS Free Domains to list my registered domains and their SSL certificate status`
- Terms of Service URL: `https://publicfreesuffix.org/legal/registration-agreement/`
- Policy URL: `https://publicfreesuffix.org/legal/privacy-policy/`
- Website URL: `https://publicfreesuffix.org`

**Step 3 — MCP endpoint + domain verification**
- MCP server URL: `https://s.eus/api/mcp/pfs`
- Domain verification: the console generates a `google-connected-apps.json` token — host it at `https://s.eus/.well-known/google-connected-apps`, must return HTTP 200 with no redirects. Paste the token to the SEUS operator when it appears.

**Step 4 — Credentials (choose User-delegated / Authorization Code)**
- Google recommends **CIMD or Dynamic Client Registration** — SEUS already supports CIMD, so the URL-type client path aligns; alternatively provide the pre-registered static client ID `nsc_KY87pj5df041ShWTuuN2R_ZR`
- Redirect URIs allowlist: whatever Google's console shows (register them on the SEUS app when listed)

**Step 5 — Test account (User-delegated only)**
- Same reviewer test account as Claude/ChatGPT, **with 2FA disabled**, pre-filled with sample domains

**Steps 6–9 — Tool sync, availability, testers, review**
- Tool sync: sign in with a developer account that has access; tool snapshot locks at publish (new version = new snapshot)
- Products: Gemini app and/or Search (AI Mode); region/language as desired
- Testers: **@gmail.com accounts only**
- Send for review in the Releases card → fix issues → publish when approved

### Prerequisites spot-check (all pass)

- Streamable HTTP + publicly trusted TLS on s.eus ✓
- OAuth 2.1 ✓ (Google's MCP requirement)
- Tool annotations (`title` + hints) — audit on SEUS side before Step 6, same as Claude/ChatGPT ✓ (pending)
- Privacy policy + ToS at public URLs ✓

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
