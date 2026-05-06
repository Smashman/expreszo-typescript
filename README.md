# ExpresZo (monorepo)

This repository hosts the ExpresZo expression-evaluator core and its companion packages.

## Packages

| Package | Description |
|---------|-------------|
| [`@pro-fa/expreszo`](packages/expreszo) | Core safe, extensible expression evaluator. Pratt parser + immutable AST + descriptor-based extensibility. |
| [`@pro-fa/expreszo-datetime`](packages/expreszo-datetime) | Optional date/time functions backed by [Luxon](https://moment.github.io/luxon/). Adds `now`, `parseISO`, `addDuration`, `format`, … via a single `dateTimePlugin`. |
| [`@pro-fa/expreszo-mcp-server`](packages/expreszo-mcp-server) | MCP server exposing the parser to AI assistants. Ships its own `expreszo-mcp` CLI. |

## Quick start

```bash
yarn install
yarn workspaces run build
yarn workspaces run test
```

## Adding a date/time plugin to a parser

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';

const parser = defineParser({ ...fullParser })
  .use(dateTimePlugin);

parser.parse("format(addDuration(now(), 7, 'days'), 'yyyy-MM-dd')").evaluate();
```

`@pro-fa/expreszo` itself does not depend on Luxon — it is pulled in only when you install `@pro-fa/expreszo-datetime`.
