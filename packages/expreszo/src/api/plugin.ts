/**
 * `Plugin` — a named bundle of operators, functions, and constants a caller
 * can register on a `Parser` with `parser.use(plugin)`. Structurally a
 * superset of `ParserPreset`: presets remain valid for the spread-into-
 * `defineParser` style, while plugins add a discoverable identity (`name`,
 * `version`) and an optional `constants` block.
 *
 * Companion packages such as `@pro-fa/expreszo-datetime` export a single
 * `Plugin` object so consumers wire them up in one line:
 *
 * ```ts
 * import { defineParser, fullParser } from '@pro-fa/expreszo';
 * import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';
 *
 * const parser = defineParser({ ...fullParser }).use(dateTimePlugin);
 * ```
 */
import type { OperatorDescriptor } from '../registry/operator-descriptor.js';
import type { FunctionDescriptor } from '../registry/function-descriptor.js';
import type { Value } from '../types/values.js';

export interface Plugin {
  /** Identifier shown in error messages when a registration fails. */
  readonly name: string;
  /** Optional semver of the plugin. Informational; not enforced. */
  readonly version?: string;
  readonly operators?: readonly OperatorDescriptor[];
  readonly functions?: readonly FunctionDescriptor[];
  readonly constants?: Readonly<Record<string, Value>>;
}

/** Options controlling how `parser.use(plugin)` handles name collisions. */
export interface UsePluginOptions {
  /**
   * If `true`, plugin entries silently overwrite existing operators,
   * functions, or constants with the same name. Default `false` — collisions
   * throw to surface unintended shadowing.
   */
  readonly override?: boolean;
}
