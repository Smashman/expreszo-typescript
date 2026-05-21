/**
 * `@pro-fa/expreszo/ast` — public entry for AST consumers that need to
 * traverse the immutable `Node` tree the parser produces.
 *
 * The barrel exposes the discriminated `Node` union, the `Span` source-range
 * type, the `NodeVisitor<T>` interface + its `BaseVisitor<T>` default
 * implementation, and the `walk()` post-order helper. All four are already
 * authored at file-level in `./nodes.ts` / `./visitor.ts`; this entry merely
 * makes them reachable through the package's public `exports` map.
 *
 * @example
 * ```ts
 * import type { Node } from '@pro-fa/expreszo/ast';
 * import { BaseVisitor, walk } from '@pro-fa/expreszo/ast';
 * ```
 */

export type {
  Node,
  Span,
  CaseArm,
  ObjectProperty,
  ObjectSpread,
  ObjectEntry,
  ArraySpread,
  ArrayEntry,
  NumberLit,
  StringLit,
  BoolLit,
  NullLit,
  UndefinedLit,
  RawLit,
  ArrayLit,
  ObjectLit,
  Ident,
  NameRef,
  Member,
  Unary,
  Binary,
  Ternary,
  Call,
  Lambda,
  FunctionDef,
  Case,
  Sequence,
  Paren
} from './nodes.js';

export { NO_SPAN } from './nodes.js';

export type { NodeVisitor } from './visitor.js';
export { BaseVisitor, walk } from './visitor.js';
