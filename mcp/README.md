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
        "CLIENT_ID": "nsc_pBkFDUTYEOHAOZNmtw9Upagy"
      }
    }
  }
}
```

Prefer the one-click install from the [Cursor Plugin repository](https://github.com/PublicFreeSuffix/pfs-cursor-plugin): open its link in Cursor via **Customize > Plugins > Install from GitHub**. The plugin already carries the endpoint and client ID, so no manual JSON is needed.

SEUS does not auto-register OAuth clients, so the shared public client ID is required in the `auth` block. It is registered for both Cursor callbacks: `https://www.cursor.com/agents/mcp/oauth/callback` (web and Agents) and `http://localhost:8787/callback` (desktop). The client ID is public and safe to commit; no client secret is needed.

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

## Troubleshooting

- **Connected but no tools appear.** Fully quit and restart the client, then start a new chat. Clients cache the tool list at startup.
- **No sign-in prompt, or a 401 loop.** Check that the URL is exactly `https://s.eus/api/mcp/pfs`, uses HTTPS, and has no `Authorization` header.
- **403 with `insufficient_scope`.** Disconnect and reconnect, then approve the write scopes you actually need.
- **Cline cannot connect.** Confirm `"type": "streamableHttp"` is present; otherwise Cline uses legacy SSE.
- **Claude reports the server is unreachable.** Claude connects from its own cloud, so the endpoint must be public. Check the [SEUS MCP documentation](https://s.eus/docs/integrations/mcp) for service status.

Try a read-only prompt first, for example: "Use PFS Free Domains to check whether `example.no.kg` is available."

## Registry publishing

The root [server.json](../server.json) describes the remote service. The **Publish PFS to MCP Registry** workflow uses the GitHub organization identity through OIDC. Run it manually from `main` after the endpoint serves its OAuth challenge and discovery metadata. After the run, verify the matching name and version in the [official registry](https://registry.modelcontextprotocol.io/?q=PublicFreeSuffix). Update the manifest version for a subsequent entry.

Learn more at [Public Free Suffix](https://publicfreesuffix.org/) and in the [SEUS MCP documentation](https://s.eus/docs/integrations/mcp).
