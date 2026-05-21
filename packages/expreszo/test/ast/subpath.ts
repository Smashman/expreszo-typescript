import { describe, it, expect } from 'vitest';
import {
  NO_SPAN,
  BaseVisitor,
  walk
} from '../../src/ast/index.js';
import type {
  Node,
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
} from '../../src/ast/index.js';

/**
 * The `@pro-fa/expreszo/ast` subpath must expose `Node`, `Span`, `NO_SPAN`,
 * the per-kind node interfaces, `NodeVisitor<T>` / `BaseVisitor<T>`, and
 * `walk()` so external consumers can traverse the immutable AST.
 *
 * This test exercises the barrel by constructing a tiny AST with the
 * re-exported types + `NO_SPAN`, walking it with `walk()`, and dispatching it
 * through a `BaseVisitor<number>` subclass. We do not touch `Expression.#root`
 * (private) — we build the Node tree directly, which is exactly the surface
 * AST consumers need.
 */
describe('@pro-fa/expreszo/ast public subpath', () => {
  it('re-exports walk and BaseVisitor as callables', () => {
    expect(typeof walk).toBe('function');
    expect(typeof BaseVisitor).toBe('function');
  });

  it('re-exports NO_SPAN with a usable Span shape', () => {
    expect(NO_SPAN).toEqual({ start: 0, end: 0 });
  });

  it('walk() visits every node in a small Binary tree (post-order)', () => {
    const left: NumberLit = { type: 'NumberLit', value: 1, span: NO_SPAN };
    const right: NumberLit = { type: 'NumberLit', value: 2, span: NO_SPAN };
    const ast: Binary = {
      type: 'Binary',
      op: '+',
      left,
      right,
      span: NO_SPAN
    };

    const seen: string[] = [];
    walk(ast, n => seen.push(n.type));

    expect(seen).toEqual(['NumberLit', 'NumberLit', 'Binary']);
  });

  it('BaseVisitor<T> subclass dispatches on the discriminated type field', () => {
    class TypeNamer extends BaseVisitor<string> {
      visitNumberLit(_n: NumberLit): string { return 'num'; }
      visitStringLit(_n: StringLit): string { return 'str'; }
      visitBoolLit(_n: BoolLit): string { return 'bool'; }
      visitNullLit(_n: NullLit): string { return 'null'; }
      visitUndefinedLit(_n: UndefinedLit): string { return 'undef'; }
      visitRawLit(_n: RawLit): string { return 'raw'; }
      visitArrayLit(_n: ArrayLit): string { return 'array'; }
      visitObjectLit(_n: ObjectLit): string { return 'object'; }
      visitIdent(_n: Ident): string { return 'ident'; }
      visitNameRef(_n: NameRef): string { return 'nameref'; }
      visitMember(_n: Member): string { return 'member'; }
      visitUnary(_n: Unary): string { return 'unary'; }
      visitBinary(n: Binary): string {
        return `binary(${this.visit(n.left)},${this.visit(n.right)})`;
      }
      visitTernary(_n: Ternary): string { return 'ternary'; }
      visitCall(_n: Call): string { return 'call'; }
      visitLambda(_n: Lambda): string { return 'lambda'; }
      visitFunctionDef(_n: FunctionDef): string { return 'fn'; }
      visitCase(_n: Case): string { return 'case'; }
      visitSequence(_n: Sequence): string { return 'seq'; }
      visitParen(_n: Paren): string { return 'paren'; }
    }

    const ast: Node = {
      type: 'Binary',
      op: '+',
      left: { type: 'NumberLit', value: 1, span: NO_SPAN },
      right: { type: 'NumberLit', value: 2, span: NO_SPAN },
      span: NO_SPAN
    };

    expect(new TypeNamer().visit(ast)).toBe('binary(num,num)');
  });
});
