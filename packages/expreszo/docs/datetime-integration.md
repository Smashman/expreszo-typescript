# Date / Time integration

> **Audience:** Developers wiring an ExpresZo parser into a project that needs date/time support.

The core `@pro-fa/expreszo` ships with no date/time functions — dates are not part of the value type system, and Luxon (~70 KB minified+gzipped) is too heavy to inline into the core bundle. Date support lives in a separate package, [`@pro-fa/expreszo-datetime`](https://www.npmjs.com/package/@pro-fa/expreszo-datetime), that registers ~70 functions on a parser when you opt in.

For the function reference itself — names, signatures, recipes — see the [Date / Time functions](datetime.md) page.

## Install

```bash
npm install @pro-fa/expreszo @pro-fa/expreszo-datetime
```

`@pro-fa/expreszo` is a peer dependency of `@pro-fa/expreszo-datetime`. `luxon` is a regular dependency of the companion and is pulled in transitively. Consumers who do not install `@pro-fa/expreszo-datetime` get zero Luxon code in their bundle.

## Wiring it up

Companion packages ship a `Plugin` object you register in one call:

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';

const parser = defineParser({ ...fullParser })
  .use(dateTimePlugin);

parser.parse("format(addDuration('2026-01-01', 7, 'days'), 'yyyy-MM-dd')").evaluate();
// => '2026-01-08'
```

`parser.use(plugin)` returns the parser, so you can chain multiple registrations. It throws on a name collision with an already-registered operator, function, or constant (pass `{ override: true }` to silently replace). Full semantics on the [Parser](parser.md#using-plugins) page.

## Polymorphic input contract

Every datetime function accepts any of these shapes for date arguments:

| Shape | Example |
| --- | --- |
| Luxon `DateTime` | `DateTime.fromISO('2026-01-01')` |
| JavaScript `Date` | `new Date('2026-01-01')` |
| ISO 8601 string | `'2026-01-01T00:00:00Z'` |
| Unix millisecond number | `1767225600000` |

A single `toDateTime()` helper inside the package normalises at the boundary, so callers can mix shapes freely:

```ts
parser.parse("format(addDuration(d, 7, 'days'), 'yyyy-MM-dd')")
  .evaluate({ d: new Date('2026-01-01') });
// => '2026-01-08'
```

Functions that **produce** a date return a Luxon `DateTime` so chains stay efficient — no repeated parse/format. Functions that produce text (`format`, `toISO`, `toRelative`) or numbers (`year`, `diff`, `toMillis`) return those shapes directly.

The full normaliser lives at [`packages/expreszo-datetime/src/normalize.ts`](https://github.com/Pro-Fa/expreszo-typescript/blob/main/packages/expreszo-datetime/src/normalize.ts) and is exported as `toDateTime` / `toDateTimeOrUndefined` for callers who want to do their own conversions outside an expression.

## Spread-into-`defineParser` form

`parser.use(plugin)` is the recommended path, but the package also exports a `ParserPreset` for callers who prefer the spread-composition style consistent with the built-in `withMath`, `withString`, etc.:

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { withDateTime }              from '@pro-fa/expreszo-datetime';

const parser = defineParser({
  operators: [...fullParser.operators],
  functions: [...fullParser.functions, ...withDateTime.functions]
});
```

Both forms produce the same parser; pick whichever matches the rest of your codebase.

## Bundle hygiene

The companion package marks both `@pro-fa/expreszo` and `luxon` as external in its build (`packages/expreszo-datetime/vite.config.ts`). Consumers' bundlers resolve them once at the application boundary, so importing `@pro-fa/expreszo-datetime` adds:

- ~10 KB of plugin code
- Whatever Luxon code your usage actually pulls in (typically 30-50 KB after tree-shaking)

The core `@pro-fa/expreszo` bundle (`dist/bundle.min.js`) contains zero references to Luxon — verified at build time and asserted in the workspace sandbox install test.

## Source

- npm: [`@pro-fa/expreszo-datetime`](https://www.npmjs.com/package/@pro-fa/expreszo-datetime)
- Source: [`packages/expreszo-datetime/src/`](https://github.com/Pro-Fa/expreszo-typescript/tree/main/packages/expreszo-datetime/src)
- Plugin definition: [`packages/expreszo-datetime/src/plugin.ts`](https://github.com/Pro-Fa/expreszo-typescript/blob/main/packages/expreszo-datetime/src/plugin.ts)
- Changelog: [`packages/expreszo-datetime/CHANGELOG.md`](https://github.com/Pro-Fa/expreszo-typescript/blob/main/packages/expreszo-datetime/CHANGELOG.md)
