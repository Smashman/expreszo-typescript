import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createLanguageService } from '@pro-fa/expreszo/language-service';
import type { LanguageServiceOptions } from '@pro-fa/expreszo/language-service';
import { registerTools } from './tools.js';

const DEFAULT_MCP_SERVER_VERSION = '0.5.0';

export interface CreateMcpServerOptions {
  operators?: LanguageServiceOptions['operators'];
  name?: string;
  version?: string;
}

export function createMcpServer(options: CreateMcpServerOptions = {}): McpServer {
  const server = new McpServer({
    name: options.name ?? 'expreszo-mcp',
    version: options.version ?? DEFAULT_MCP_SERVER_VERSION
  });

  const ls = createLanguageService({ operators: options.operators });
  registerTools(server, ls);

  return server;
}
