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
      "url": "https://s.eus/api/mcp/pfs"
    }
  }
}
```

Restart Cursor, enable `pfs` under **Customize > MCPs**, and complete the SEUS sign-in when prompted. Do not add an `Authorization` header: this server uses OAuth, and a fixed header prevents the sign-in flow.

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

SEUS currently advertises authorization-code, refresh-token, and device-code grants with PKCE S256. Its discovery document does **not** advertise dynamic client registration or Client ID Metadata Documents. A client that requires either of those may stop with an error such as "does not support dynamic client registration" or complain about a missing client ID. In that case, use a client that accepts a pre-registered client ID or device-code sign-in, or ask SEUS for a client configuration. Do not put a bearer token in a fixed `Authorization` header to work around it.

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
