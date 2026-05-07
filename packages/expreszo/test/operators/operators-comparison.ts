import { expect, describe, it } from 'vitest';
import { Parser } from '../../index.js';

// Comparison Operators Tests - Converted from operators.js
// Tests for ==, !=, >, >=, <, <= operators

const parser = new Parser();

describe('Comparison Operators TypeScript Test', () => {
  describe('== operator', () => {
    it('2 == 3', () => {
      expect(parser.evaluate('2 == 3')).toBe(false);
    });

    it('3 * 1 == 2', () => {
      expect(parser.evaluate('3 == 2')).toBe(false);
    });

    it('3 == 3', () => {
      expect(parser.evaluate('3 == 3')).toBe(true);
    });

    it('\'3\' == 3', () => {
      expect(parser.evaluate('\'3\' == 3')).toBe(false);
    });

    it('\'string 1\' == \'string 2\'', () => {
      expect(parser.evaluate('\'string 1\' == \'string 2\'')).toBe(false);
    });

    it('\'string 1\' == "string 1"', () => {
      expect(parser.evaluate('\'string 1\' == \'string 1\'')).toBe(true);
    });

    it('\'3\' == \'3\'', () => {
      expect(parser.evaluate('\'3\' == \'3\'')).toBe(true);
    });

    it('null == null (variables)', () => {
      expect(parser.evaluate('null == alsoNull', { null: null, alsoNull: null })).toBe(true);
    });
    it('null == null (single variable)', () => {
      expect(parser.evaluate('null == alsoNull', { alsoNull: null })).toBe(true);
    });
    it('null == null (no variables)', () => {
      expect(parser.evaluate('null == null')).toBe(true);
    });
    it('null cannot be overridden', () => {
      expect(parser.evaluate('null == alsoNull', { null: 100, alsoNull: null })).toBe(true);
    });
    it('null differs from 0', () => {
      expect(parser.evaluate('null == zero', { zero: 0 })).toBe(false);
    });
  });

  describe('!= operator', () => {
    it('2 != 3', () => {
      expect(parser.evaluate('2 != 3')).toBe(true);
    });

    it('3 != 2', () => {
      expect(parser.evaluate('3 != 2')).toBe(true);
    });

    it('3 != 3', () => {
      expect(parser.evaluate('3 != 3')).toBe(false);
    });

    it('\'3\' != 3', () => {
      expect(parser.evaluate('\'3\' != 3')).toBe(true);
    });

    it('\'3\' != \'3\'', () => {
      expect(parser.evaluate('\'3\' != \'3\'')).toBe(false);
    });

    it('\'string 1\' != \'string 1\'', () => {
      expect(parser.evaluate('\'string 1\' != \'string 1\'')).toBe(false);
    });

    it('\'string 1\' != \'string 2\'', () => {
      expect(parser.evaluate('\'string 1\' != \'string 2\'')).toBe(true);
    });
  });

  describe('> operator', () => {
    it('2 > 3', () => {
      expect(parser.evaluate('2 > 3')).toBe(false);
    });

    it('3 > 2', () => {
      expect(parser.evaluate('3 > 2')).toBe(true);
    });

    it('3 > 3', () => {
      expect(parser.evaluate('3 > 3')).toBe(false);
    });
  });

  describe('>= operator', () => {
    it('2 >= 3', () => {
      expect(parser.evaluate('2 >= 3')).toBe(false);
    });

    it('3 >= 2', () => {
      expect(parser.evaluate('3 >= 2')).toBe(true);
    });

    it('3 >= 3', () => {
      expect(parser.evaluate('3 >= 3')).toBe(true);
    });
  });

  describe('< operator', () => {
    it('2 < 3', () => {
      expect(parser.evaluate('2 < 3')).toBe(true);
    });

    it('3 < 2', () => {
      expect(parser.evaluate('3 < 2')).toBe(false);
    });

    it('3 < 3', () => {
      expect(parser.evaluate('3 < 3')).toBe(false);
    });
  });

  describe('<= operator', () => {
    it('2 <= 3', () => {
      expect(parser.evaluate('2 <= 3')).toBe(true);
    });

    it('3 <= 2', () => {
      expect(parser.evaluate('3 <= 2')).toBe(false);
    });

    it('3 <= 3', () => {
      expect(parser.evaluate('3 <= 3')).toBe(true);
    });
  });

  // Equality is valueOf-aware: any two non-null objects whose `.valueOf()`
  // returns a primitive distinct from themselves compare by that primitive.
  // This makes `==` and `!=` line up with how `<`/`>`/`<=`/`>=` already
  // behave (via ToPrimitive), and lets values like JS `Date` and Luxon
  // `DateTime` work without core knowing about either type.
  describe('== / != on objects with a meaningful valueOf', () => {
    const ms = Date.UTC(2026, 0, 1);

    it('two JS Date instances at the same instant are ==', () => {
      const d1 = new Date(ms);
      const d2 = new Date(ms);
      expect(parser.evaluate('a == b', { a: d1 as never, b: d2 as never })).toBe(true);
      expect(parser.evaluate('a != b', { a: d1 as never, b: d2 as never })).toBe(false);
    });

    it('two JS Date instances at different instants are !=', () => {
      const d1 = new Date(ms);
      const d2 = new Date(ms + 1);
      expect(parser.evaluate('a == b', { a: d1 as never, b: d2 as never })).toBe(false);
      expect(parser.evaluate('a != b', { a: d1 as never, b: d2 as never })).toBe(true);
    });

    it('two custom objects with the same numeric valueOf are ==', () => {
      const a = { valueOf: () => 42 };
      const b = { valueOf: () => 42 };
      expect(parser.evaluate('a == b', { a: a as never, b: b as never })).toBe(true);
    });

    it('a JS Date and a custom valueOf object compare by their primitive', () => {
      const a = new Date(ms);
      const b = { valueOf: () => ms };
      expect(parser.evaluate('a == b', { a: a as never, b: b as never })).toBe(true);
    });

    it('plain objects without an overridden valueOf still use reference equality', () => {
      const a = { x: 1 };
      const b = { x: 1 };
      expect(parser.evaluate('a == b', { a: a as never, b: b as never })).toBe(false);
      expect(parser.evaluate('a != b', { a: a as never, b: b as never })).toBe(true);
      // Same reference is still ==
      expect(parser.evaluate('a == a', { a: a as never })).toBe(true);
    });

    it('arrays still use reference equality', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      expect(parser.evaluate('a == b', { a: a as never, b: b as never })).toBe(false);
    });

    it('two invalid Dates (NaN-valued) are not ==', () => {
      const a = new Date(NaN);
      const b = new Date(NaN);
      expect(parser.evaluate('a == b', { a: a as never, b: b as never })).toBe(false);
      expect(parser.evaluate('a != b', { a: a as never, b: b as never })).toBe(true);
    });

    it('object compared to a primitive is not ==', () => {
      const a = new Date(ms);
      expect(parser.evaluate('a == ms', { a: a as never, ms })).toBe(false);
      expect(parser.evaluate('a != ms', { a: a as never, ms })).toBe(true);
    });

    it('null still equals only null', () => {
      const a = new Date(ms);
      expect(parser.evaluate('a == n', { a: a as never, n: null })).toBe(false);
      expect(parser.evaluate('n == n', { n: null })).toBe(true);
    });
  });
});
