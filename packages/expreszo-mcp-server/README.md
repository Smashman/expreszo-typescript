# @pro-fa/expreszo-mcp-server

MCP (Model Context Protocol) server exposing the `@pro-fa/expreszo` language service to AI assistants.

## Install

```bash
npm install @pro-fa/expreszo-mcp-server
```

`@pro-fa/expreszo` is a peer dependency.

## Run as a CLI

```bash
npx expreszo-mcp
```

## Programmatic use

```ts
import { createMcpServer } from '@pro-fa/expreszo-mcp-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```
