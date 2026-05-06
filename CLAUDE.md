# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a **yarn workspace monorepo** with three published packages:

```
/
├── packages/
│   ├── expreszo/             # @pro-fa/expreszo — core expression evaluator
│   ├── expreszo-datetime/    # @pro-fa/expreszo-datetime — optional Luxon plugin
│   └── expreszo-mcp-server/  # @pro-fa/expreszo-mcp-server — MCP server CLI
├── eslint.config.js          # shared eslint config
├── tsconfig.base.json        # shared TS compiler options (each package extends this)
└── package.json              # private workspace root
```

The core never depends on Luxon or `@modelcontextprotocol/sdk` — those live only in their respective companion packages.

## Commands

Run from the **workspace root** to fan out across all three packages:

```bash
yarn install --frozen-lockfile      # install all workspaces
yarn workspaces run lint            # eslint all packages
yarn workspaces run type-check      # TS type-check all packages
yarn workspaces run test            # build + vitest in each package
yarn workspaces run build           # build dist/ for each package
```

Run from a **single package** for tighter loops:

```bash
cd packages/expreszo
yarn test:watch                     # vitest watch mode
npx vitest run test/core/evaluate.ts  # one file
yarn coverage                       # 80% threshold required
yarn bench                          # parser benchmarks
```

## Core architecture (`@pro-fa/expreszo`)

Safe, extensible expression evaluator — a configurable alternative to `eval()`. Uses a **Pratt parser** and an **immutable AST**:

```
Expression string → TokenStream (lexer) → Pratt Parser → AST (immutable) → Evaluator (AST walker) → Result
```

### Key classes

- **`Parser`** (`packages/expreszo/src/parsing/parser.ts`) — entry point; configurable with custom operators, functions, and variable resolvers; produces `Expression` objects. Carries the runtime `use(plugin)` method.
- **`Expression`** (`packages/expreszo/src/core/expression.ts`) — compiled expression with methods: `evaluate()`, `simplify()`, `substitute()`, `toString()`, `variables()`, `symbols()`.
- **`Evaluator`** (`packages/expreszo/src/eval/sync-evaluator.ts`, `async-evaluator.ts`) — AST walker; supports async (Promise) evaluation.
- **`TokenStream`** (`packages/expreszo/src/parsing/token-stream.ts`) — lexer.
- **`AST Nodes`** (`packages/expreszo/src/ast/nodes.ts`) — immutable AST node types with a visitor pattern (`visitor.ts`).

### Core source layout

```
packages/expreszo/src/
├── ast/              # AST node types and visitor pattern
├── core/             # Expression, logical operations
├── eval/             # Sync and async evaluators (AST walkers)
├── parsing/          # Pratt parser, TokenStream, token types, parser-state + utils
├── operators/        # Binary (arithmetic, comparison, logical, utility) and unary operators
├── functions/        # Built-ins split by domain: math/, array/, string/, object/, utility/
├── api/              # defineParser, presets, Plugin interface
├── registry/         # FunctionDescriptor / OperatorDescriptor catalog
├── language-service/ # IDE completions, hover, diagnostics
├── validation/       # Expression validation
├── types/            # Shared TypeScript types and type guards
├── errors/           # Error context helpers
├── utils/            # Shared utilities
└── entries/          # Subpath export entry points (./core, ./math, ./string, …)
```

## Plugin API

Companion packages expose a `Plugin` (`packages/expreszo/src/api/plugin.ts`):

```ts
interface Plugin {
  readonly name: string;
  readonly version?: string;
  readonly operators?: readonly OperatorDescriptor[];
  readonly functions?: readonly FunctionDescriptor[];
  readonly constants?: Readonly<Record<string, Value>>;
}
```

Consumers wire one in with a single call:

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';

const parser = defineParser({ ...fullParser }).use(dateTimePlugin);
```

`Parser.use()` merges plugin entries into `unaryOps` / `binaryOps` / `ternaryOps` / `functions` / `numericConstants`, throwing on name collision unless `{ override: true }` is passed.

## Adding a new built-in function

Inside `packages/expreszo/src/functions/<category>/`:

1. Write the implementation as a plain function in the appropriate domain file.
2. Export it from `packages/expreszo/src/functions/index.ts`.
3. Add a `FunctionDescriptor` in `packages/expreszo/src/registry/builtin/functions.ts` (`{ name, impl, category, pure, safe, async, docs? }`).
4. Wire the descriptor into the matching preset under `packages/expreszo/src/registry/presets/<category>.ts`.
5. Add tests under `packages/expreszo/test/functions/<category>/`.

For functions that need a heavy dependency (e.g., Luxon), keep them out of core and ship a companion package that exports a `Plugin` (see `packages/expreszo-datetime/` for the canonical example).

## Build targets

Each package's `vite.config.ts` is invoked via `BUILD_TARGET` env var:

- `esm` (default) — ES module with `.d.ts` declarations → `dist/<entry>.mjs`
- `umd` — universal bundle (core only) → `dist/bundle.js`
- `umd-min` — minified UMD (core only) → `dist/bundle.min.js`

## Code style

ESLint at the workspace root (`eslint.config.js`) enforces: semicolons, single quotes, 2-space indentation. TypeScript strict mode is on. `@typescript-eslint/no-explicit-any` is relaxed.

## README convention

The repo-root `README.md` is the canonical README for `@pro-fa/expreszo` — it's what GitHub shows on the repo home and what the npm registry shows on the package page. Edit it there.

`packages/expreszo/README.md` is a stub that points back at the root README. The publish workflow (`publish.yml`) copies the root README into `packages/expreszo/` right before `npm publish`, so the npm tarball always carries the full content. **Do not edit the stub** — make changes at the root.

The other two packages (`@pro-fa/expreszo-datetime`, `@pro-fa/expreszo-mcp-server`) have their own self-contained READMEs in their package directories.
