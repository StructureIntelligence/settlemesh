# SettleMesh

**The launch layer for agent-built apps.** One command turns an app an agent wrote into a paid product — SettleMesh OAuth login, a managed database, usage-based billing, and end-user payments built in. It's agent-native: a coding agent (Claude Code, Codex, Cursor) can run the whole deploy / auth / billing flow itself.

This repository is the **open client-integration layer** — the MCP server config, Claude Code plugin, Cursor rules, agent docs, and starter templates that let agents and AI tools discover and use SettleMesh. The SettleMesh platform and the CLI binary are proprietary (see [NOTICE](./NOTICE)).

## Quick start

```bash
npm install -g settlemesh
settlemesh login
settlemesh deploy ./my-app --full-stack --wait
```

Returns a live `*.run.settlemesh.io` URL with login, a database, and billing wired in.

## Use as an MCP server

Let any MCP-compatible client (Claude Code, Claude Desktop, Cursor, Codex) call the full SettleMesh capability catalog:

```bash
claude mcp add settlemesh --env SETTLE_API_KEY=sk-settle-... -- npx -y settlemesh mcp
```

(or run `settlemesh login` first and omit the key). Per-client config snippets are in [`cursor/mcp.json`](./cursor/mcp.json) and the Claude Code plugin below.

## What's in this repo

| Path | What |
|---|---|
| [`server.json`](./server.json) · `smithery.yaml` · `glama.json` | MCP registry metadata |
| [`claude-plugin/`](./claude-plugin) | Claude Code plugin (marketplace + plugin + skill + `/deploy` command) |
| [`cursor/`](./cursor) | Cursor rule + MCP config |
| [`agent.md`](./agent.md) | The agent contract (also served at https://settlemesh.io/agent.md) |
| [`llms.txt`](./llms.txt) | AEO discovery file |
| [`templates/`](./templates) | 5 starter templates (MIT) |

## Install the Claude Code plugin

```
/plugin marketplace add StructureIntelligence/settlemesh
/plugin install settlemesh@settlemesh
```

## Links

- Website: https://settlemesh.io
- Docs & API: https://settlemesh.io/docs
- Agent guide: https://settlemesh.io/agent.md
- Pricing: https://settlemesh.io/pricing

## License

The integration layer in this repository is **Apache-2.0** (see [LICENSE](./LICENSE)); `templates/` is **MIT**. The SettleMesh **CLI binary** (npm package `settlemesh`) and the **platform** are proprietary — see [NOTICE](./NOTICE).

© StructureIntelligence Inc.
