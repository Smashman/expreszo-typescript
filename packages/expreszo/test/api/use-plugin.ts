import { describe, it, expect } from 'vitest';
import {
  defineParser,
  coreParser,
  fullParser
} from '../../index.js';
import type { Plugin } from '../../index.js';
import { Precedence } from '../../index.js';

const greet: Plugin = {
  name: 'greet',
  version: '0.0.1',
  functions: [
    {
      name: 'greet',
      impl: (name: unknown) => `hello ${String(name)}`,
      category: 'utility',
      pure: true,
      safe: true,
      async: false
    }
  ]
};

const doublePrefix: Plugin = {
  name: 'doublePrefix',
  operators: [
    {
      symbol: 'double',
      kind: 'prefix',
      arity: 1,
      precedence: Precedence.Prefix,
      associativity: 'right',
      optionName: 'double',
      pure: true,
      impl: (x: unknown) => (typeof x === 'number' ? x * 2 : NaN)
    }
  ]
};

const constants: Plugin = {
  name: 'constants',
  constants: { ANSWER: 42 }
};

describe('Parser.use', () => {
  it('returns the parser for fluent chaining', () => {
    const parser = defineParser({ ...coreParser });
    const returned = parser.use(greet);
    expect(returned).toBe(parser);
  });

  it('registers functions a plugin declares', () => {
    const parser = defineParser({ ...coreParser }).use(greet);
    expect(parser.evaluate("greet('world')")).toBe('hello world');
  });

  it('registers prefix operators a plugin declares', () => {
    const parser = defineParser({ ...coreParser }).use(doublePrefix);
    expect(parser.evaluate('double 5')).toBe(10);
  });

  it('registers constants a plugin declares', () => {
    const parser = defineParser({ ...coreParser }).use(constants);
    expect(parser.evaluate('ANSWER')).toBe(42);
  });

  it('throws on collision by default', () => {
    const parser = defineParser({ ...fullParser });
    const collide: Plugin = {
      name: 'collide',
      functions: [
        {
          name: 'max',
          impl: () => 0,
          category: 'utility',
          pure: true,
          safe: true,
          async: false
        }
      ]
    };
    expect(() => parser.use(collide)).toThrow(/already registered/);
  });

  it('overrides existing entries when override is true', () => {
    const parser = defineParser({ ...fullParser });
    const override: Plugin = {
      name: 'override',
      functions: [
        {
          name: 'max',
          impl: () => 'replaced',
          category: 'utility',
          pure: true,
          safe: true,
          async: false
        }
      ]
    };
    parser.use(override, { override: true });
    expect(parser.evaluate('max(1, 2)')).toBe('replaced');
  });

  it('chains multiple plugins', () => {
    const parser = defineParser({ ...coreParser })
      .use(greet)
      .use(constants);
    expect(parser.evaluate("greet('world')")).toBe('hello world');
    expect(parser.evaluate('ANSWER')).toBe(42);
  });
});
