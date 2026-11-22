# PFS Free Domains MCP

Use the Public Free Suffix service from an MCP client that supports remote Streamable HTTP and OAuth. The server provides PFS domain availability, registration, DNS management, WHOIS, SSL certificates, and SEUS free hosting.

## Connection

| Setting | Value |
| --- | --- |
| Transport | Streamable HTTP |
| URL | `https://s.eus/api/mcp/pfs` |
| Authentication | SEUS OAuth |
| Registry name | `io.github.publicfreesuffix/free-domains` |

The URL is the planned public endpoint. Once deployed, add it in your MCP client and follow the SEUS sign-in prompt. An MCP Registry listing helps clients discover the endpoint. The client still needs to support SEUS OAuth for account operations.

## Registry publishing

The root [server.json](../server.json) describes the remote service. The **Publish PFS to MCP Registry** workflow uses the GitHub organization identity through OIDC. Run it manually from `main` after the endpoint serves its OAuth challenge and discovery metadata. After the run, verify the matching name and version in the [official registry](https://registry.modelcontextprotocol.io/). Update the manifest version for a subsequent entry.

Learn more at [Public Free Suffix](https://publicfreesuffix.org/) and in the [SEUS MCP documentation](https://s.eus/docs/integrations/mcp).
