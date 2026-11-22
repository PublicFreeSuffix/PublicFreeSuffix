# PFS Free Domains MCP

Use the Public Free Suffix service from an MCP client that supports remote Streamable HTTP and OAuth. The server provides PFS domain availability, registration, DNS management, WHOIS, SSL certificates, and SEUS free hosting.

## Connection

| Setting | Value |
| --- | --- |
| Transport | Streamable HTTP |
| URL | `https://s.eus/api/mcp/pfs` |
| Authentication | SEUS OAuth (PKCE, S256) |
| Registry name | `io.github.PublicFreeSuffix/free-domains` |
| Registry version | `0.6.0` |

No local process, package, or API key is needed. The endpoint is hosted by SEUS and is publicly reachable. Add the URL to a compatible client, sign in with SEUS, and the tools become available.

## Install in your MCP client

The steps below are current as of November 2026. If your client asks for a transport, choose **Streamable HTTP** (sometimes called **HTTP**). Use the full URL including `/pfs`, with no query string and no trailing slash.

### Claude (web and Claude Desktop)

1. Open **Customize > Connectors**.
2. Select **Add**, then **Add custom connector**.
3. Name it `PFS Free Domains` and enter `https://s.eus/api/mcp/pfs` as the server URL.
4. Keep the authentication settings Claude detects (OAuth / sign in when needed) unless you have a specific reason to change them.
5. Select **Add**, then **Connect** and sign in with your SEUS account.
6. Enable the connector for a conversation with the **+** button > **Connectors**.

Free accounts can add one custom connector. On Team and Enterprise plans, an Owner must add it in organization settings first, then each member connects with their own account. Claude connects to remote servers from Anthropic's cloud, so the endpoint must be public; this one is.

### Claude Code

```bash
claude mcp add --transport http pfs https://s.eus/api/mcp/pfs
```

Then start Claude Code, run `/mcp`, select `pfs`, choose **Authenticate**, and approve the sign-in in your browser. Add `--scope user` to use it in every project or `--scope project` to share it through the repository.

Equivalent project configuration in `.mcp.json`:

```json
{
  "mcpServers": {
    "pfs": {
      "type": "http",
      "url": "https://s.eus/api/mcp/pfs"
    }
  }
}
```

### Cursor

Add this to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (this project only):

```json
{
  "mcpServers": {
    "pfs": {
      "url": "https://s.eus/api/mcp/pfs",
      "auth": {
        "CLIENT_ID": "nsc_KY87pj5df041ShWTuuN2R_ZR"
      }
    }
  }
}
```

Prefer the one-click install from the [Cursor Plugin repository](https://github.com/PublicFreeSuffix/pfs-cursor-plugin): open its link in Cursor via **Customize > Plugins > Install from GitHub**. The plugin already carries the endpoint and client ID, so no manual JSON is needed.

SEUS does not auto-register OAuth clients, so the shared public client ID is required in the `auth` block. This is the same client ID every client uses. It is registered for both Cursor callbacks: `https://www.cursor.com/agents/mcp/oauth/callback` (web and Agents) and `http://localhost:8787/callback` (desktop). The client ID is public and safe to commit; no client secret is needed. Clients other than Cursor can use the same ID with the device-code flow or a registered callback.

Restart Cursor, enable `pfs` under **Customize > MCPs**, and complete the SEUS sign-in when prompted. Do not add an `Authorization` header: a fixed header prevents the OAuth sign-in flow.

### VS Code with GitHub Copilot

Requires VS Code 1.101 or later for remote MCP and OAuth. Open **Chat: Open Customizations > MCP Servers > Add Server**, choose HTTP, and paste the URL. The first tool call opens the browser for SEUS sign-in.

Manual configuration in a workspace `.mcp.json`:

```json
{
  "mcpServers": {
    "pfs": {
      "type": "http",
      "url": "https://s.eus/api/mcp/pfs"
    }
  }
}
```

### Cline

1. Open **MCP Servers > Remote Servers**.
2. Enter a name such as `pfs`, the URL `https://s.eus/api/mcp/pfs`, and choose **Streamable HTTP** as the transport.
3. Select **Add Server**, then **Authenticate** to sign in with SEUS.

If you edit the JSON instead, set the transport type explicitly. Cline falls back to legacy SSE when `type` is missing:

```json
{
  "mcpServers": {
    "pfs": {
      "type": "streamableHttp",
      "url": "https://s.eus/api/mcp/pfs",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

The extension opens the settings file via **MCP Servers > Configure > Configure MCP Servers**; the CLI uses `~/.cline/data/settings/cline_mcp_settings.json`. CLI equivalent: `cline mcp add pfs https://s.eus/api/mcp/pfs --transport http --yes`, then run `cline mcp` and choose **Authorize OAuth**.

### Windsurf / Devin Desktop

Windsurf is now Devin Desktop. Open **Customize > MCPs > + > New MCP** (or **Settings > Tools > Windsurf Settings > Add Server**), set the transport to **HTTP**, the server URL to `https://s.eus/api/mcp/pfs`, and authentication to **OAuth**. Add the server, sign in, then press refresh in the MCP panel.

Manual configuration in `mcp_config.json`:

```json
{
  "mcpServers": {
    "pfs": {
      "serverUrl": "https://s.eus/api/mcp/pfs"
    }
  }
}
```

Cascade / Devin uses `~/.config/devin/mcp_config.json` (macOS and Linux) or `%AppData%/devin/mcp_config.json` (Windows). Editor discovery uses `~/.codeium/windsurf/mcp_config.json`; `url` is accepted as well as `serverUrl`.

### ChatGPT

In ChatGPT on the web, open **Plugins > + > Add custom MCP server**, enter a name and the URL `https://s.eus/api/mcp/pfs`, configure authentication as OAuth, acknowledge the risk warning, and select **Create as a plugin**. Install the plugin, then mention it with `@` in a conversation. Availability depends on plan and workspace permissions; some accounts need Developer mode.

### Other clients

Any client that supports remote MCP over Streamable HTTP can connect with the same URL. For clients that only support local stdio servers, bridge through `mcp-remote`:

```json
{
  "mcpServers": {
    "pfs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://s.eus/api/mcp/pfs"]
    }
  }
}
```

SEUS matches callbacks exactly and currently rejects unregistered loopback ports, including the random local ports many desktop clients pick. If sign-in stops with "the app is misconfigured", run the bridge in device-code mode with the shared client ID instead:

```json
{
  "mcpServers": {
    "pfs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://s.eus/api/mcp/pfs", "--device-code", "--static-oauth-client-info", "{\"client_id\":\"nsc_KY87pj5df041ShWTuuN2R_ZR\"}"]
    }
  }
}
```

## OAuth and permissions

There is no API key to copy. The first request returns a `401` challenge pointing to SEUS protected resource metadata; the client then opens `https://s.eus/oauth/authorize` for sign-in and uses PKCE with S256. Scopes advertised for this resource are `domains:read`, `domains:write`, `dns:read`, `dns:write`, `ssl:read`, `ssl:write`, `hosting:read`, and `hosting:write`. Read-only questions such as availability checks and WHOIS work with the read scopes; registration and DNS changes need the matching write scopes.

### What you see when you authorize

Authorization takes two steps on your side: click **Connect** (or install the plugin), then sign in to SEUS and approve the request in the browser that opens. You never copy a key, token, or client ID into the client.

Everything else happens automatically. The client probes the endpoint, follows the `401` challenge to the SEUS metadata, opens your browser at the authorization URL with a public client ID and a fresh PKCE challenge, and receives a short-lived code on a registered callback. It exchanges that code for tokens using PKCE — no client secret is involved — then reconnects with the access token and the tools appear.

The grant is persistent. The client stores the tokens securely and renews them automatically, so you normally sign in only once. You will be asked again if you disconnect and reconnect, if you revoke the grant, or if you switch to a client that does not reuse stored tokens.

For a client without a browser callback, such as some terminal tools, SEUS also offers the device-code grant: the client shows a short code and a verification URL, you enter the code there, and the flow completes the same way.

SEUS currently advertises authorization-code, refresh-token, and device-code grants with PKCE S256. Its discovery document does **not** advertise dynamic client registration, so create an OAuth application in your SEUS account to obtain a client ID (SEUS also supports the device-code grant). Clients that require a pre-registered client ID can use that ID; clients that support device-code sign-in can use the device flow. For Cursor's one-click install specifically, put the client ID in the `auth` block (see below) and register Cursor's callback URLs in the SEUS app. Do not put a bearer token in a fixed `Authorization` header to work around it.

### One SEUS app serves every client

The client ID belongs to the OAuth application you create in SEUS, not to a particular MCP client. Create one app and reuse its client ID everywhere. There is no per-client app registration to do.

Browser clients with fixed callbacks, including Cursor, use the callback URLs registered on that same app. Clients with a device-code sign-in need no callback at all, so they work with the same client ID and no extra setup. Clients that can accept a pre-registered client ID use the same ID in their config. A client that only supports automatic client registration cannot use it because SEUS does not advertise a registration endpoint; use its static client ID option or device-code mode instead. The mcp-remote bridge supports both with `--static-oauth-client-info` and `--device-code`.

A second SEUS app is only useful when you want separate revocation control, a different callback allowlist, or separate usage reporting.

To revoke access, disconnect the connector in your client and revoke the SEUS application grant from your SEUS account settings.

### Callback URLs to register on the SEUS app

Every callback below lives on the one shared SEUS application, so register them once. Cloud and web callbacks are fixed by each vendor and verified against their published client metadata documents. Local loopback callbacks depend on how SEUS validates redirect URIs. Once SEUS ignores the port on loopback callbacks per RFC 8252, any local client works as long as one loopback URI with the same path is registered, so the table groups them by path.

Cloud and web callbacks to register exactly:

| Client | Callback URL |
|---|---|
| Cursor web and Cloud Agents | `https://www.cursor.com/agents/mcp/oauth/callback` |
| Claude on the web, Desktop, and mobile custom connectors | `https://claude.ai/api/mcp/auth_callback` |
| Claude (newer claude.com domain) | `https://claude.com/api/mcp/auth_callback` |
| ChatGPT Apps and Connectors | `https://chatgpt.com/connector_platform_oauth_redirect` |
| VS Code on the web | `https://vscode.dev/redirect` |
| Gemini Enterprise cloud agents | `https://vertexaisearch.cloud.google.com/oauth-redirect` |

Local loopback callbacks to register as path anchors. The port is ignored once SEUS applies the RFC 8252 rule, so one entry per path covers every client that uses the same path:

| Client | Callback URL | Path shared with |
|---|---|---|
| Cursor desktop | `http://localhost:8787/callback` | Claude Code, Codex CLI, mcp-remote, ChatGPT Codex (`/callback`) |
| Codex CLI (portless form) | `http://127.0.0.1/callback` and `http://localhost/callback` | same `/callback` path |
| Windsurf desktop | `http://127.0.0.1:8765/auth/callback` | Windsurf uses this fixed port (`/auth/callback`) |
| VS Code desktop | `http://127.0.0.1:33418/` | VS Code fixed port, keep the trailing slash |
| Gemini CLI (pinned) | `http://localhost:7777/oauth/callback` | Gemini CLI default is a random port (`/oauth/callback`) |
| MCP Inspector (testing) | `http://localhost:6274/oauth/callback` and `http://localhost:6274/oauth/callback/debug` | useful for verifying the setup |

Chinese clients need no new cloud callback either. Verified against their public docs in November 2026:

- **Cherry Studio** runs a native OAuth flow for remote streamable HTTP servers and opens a loopback callback in a local browser window (default callback port 12346). Covered by the RFC 8252 loopback rule.
- **Doubao desktop and DoubaoWork** accept remote MCP servers with OAuth and open a loopback callback on a random local port. Covered by the same rule.
- **CodeBuddy** (IDE plugin and Codebuddy Code) does not support remote-URL OAuth yet; Tencent's own docs route users through the `npx mcp-remote` bridge, which pairs with the device-code flow.
- **Tongyi Lingma** only supports STDIO servers, so it needs the `mcp-remote-alibaba-cloud` or `mcp-remote` bridge.
- **Trae** supports remote streamable HTTP servers but publishes no native MCP OAuth sign-in; use the `mcp-remote` device-code bridge.
- **Qoder** adds remote streamable HTTP servers directly, but its documented OAuth path is server-side for cloud agents, so local OAuth also goes through the device-code bridge.
- **Kimi, DeepSeek, and Yuanbao** document no remote MCP OAuth support; token-based access or the device-code bridge applies.

In short: local desktop clients among these rely on loopback callbacks your RFC 8252 rule already covers, and the rest connect through `mcp-remote` with the device flow, which needs no callback at all.

Two caveats from the same client metadata documents. ChatGPT, Codex, and VS Code identify themselves through Client ID Metadata Documents, which SEUS does not advertise yet. VS Code additionally declares the device-code grant in its metadata, so it may fall back to a flow SEUS supports. Codex and ChatGPT also accept a manually entered client ID in their connection forms, which works with the shared SEUS client ID. Test each of the three before promising support.

## Troubleshooting

- **Connected but no tools appear.** Fully quit and restart the client, then start a new chat. Clients cache the tool list at startup.
- **No sign-in prompt, or a 401 loop.** Check that the URL is exactly `https://s.eus/api/mcp/pfs`, uses HTTPS, and has no `Authorization` header.
- **"The app is misconfigured" in a non-Cursor client.** SEUS rejects unregistered loopback ports. Use the `mcp-remote` device-code configuration under [Other clients](#other-clients).
- **403 with `insufficient_scope`.** Disconnect and reconnect, then approve the write scopes you actually need.
- **Cline cannot connect.** Confirm `"type": "streamableHttp"` is present; otherwise Cline uses legacy SSE.
- **Claude reports the server is unreachable.** Claude connects from its own cloud, so the endpoint must be public. Check the [SEUS MCP documentation](https://s.eus/docs/integrations/mcp) for service status.

Try a read-only prompt first, for example: "Use PFS Free Domains to check whether `example.no.kg` is available."

## Registry publishing

The root [server.json](../server.json) describes the remote service. The **Publish PFS to MCP Registry** workflow uses the GitHub organization identity through OIDC. Run it manually from `main` after the endpoint serves its OAuth challenge and discovery metadata. After the run, verify the matching name and version in the [official registry](https://registry.modelcontextprotocol.io/?q=PublicFreeSuffix). Update the manifest version for a subsequent entry.

Learn more at [Public Free Suffix](https://publicfreesuffix.org/) and in the [SEUS MCP documentation](https://s.eus/docs/integrations/mcp).
