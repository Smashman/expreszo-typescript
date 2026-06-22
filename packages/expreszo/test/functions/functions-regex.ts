import assert from 'assert';
import { Parser } from '../../index';

describe('Regex Functions TypeScript Test', function () {
  describe('regexMatches(str, pattern, flags?)', function () {
    it('should return true when the string matches', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexMatches("abc123", "[0-9]+")'), true);
      assert.strictEqual(parser.evaluate('regexMatches("hello", "^h.*o$")'), true);
    });

    it('should return false when the string does not match', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexMatches("abc", "[0-9]+")'), false);
    });

    it('should honour flags', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexMatches("ABC", "abc")'), false);
      assert.strictEqual(parser.evaluate('regexMatches("ABC", "abc", "i")'), true);
    });

    it('should support backslash classes when double-escaped in source', function () {
      const parser = new Parser();
      // expression source is "\\d+", which the lexer unescapes to \d+
      assert.strictEqual(parser.evaluate('regexMatches("a1", "\\\\d")'), true);
    });

    it('should return undefined if any required argument is undefined', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexMatches(undefined, "x")'), undefined);
      assert.strictEqual(parser.evaluate('regexMatches("x", undefined)'), undefined);
    });

    it('should throw for non-string arguments', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexMatches(123, "x")'), /expects a string/);
    });

    it('should throw a descriptive error for an invalid pattern', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexMatches("x", "(")'), /invalid pattern/);
    });

    it('should throw for a non-string pattern or flags', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexMatches("x", 123)'), /expects a string/);
      assert.throws(() => parser.evaluate('regexMatches("x", "y", 1)'), /expects a string/);
    });
  });

  describe('regexExtract(str, pattern, flags?)', function () {
    it('should return the full match when there are no capture groups', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexExtract("abc123def", "[0-9]+")'), '123');
    });

    it('should return capture groups as an array when present', function () {
      const parser = new Parser();
      assert.deepStrictEqual(parser.evaluate('regexExtract("user-42", "user-([0-9]+)")'), ['42']);
      assert.deepStrictEqual(
        parser.evaluate('regexExtract("2026-06-22", "([0-9]+)-([0-9]+)-([0-9]+)")'),
        ['2026', '06', '22']
      );
    });

    it('should return undefined when there is no match', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexExtract("abc", "[0-9]+")'), undefined);
    });

    it('should return undefined if any required argument is undefined', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexExtract(undefined, "x")'), undefined);
    });

    it('should throw for an invalid pattern', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexExtract("x", "(")'), /invalid pattern/);
    });

    it('should throw for non-string arguments', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexExtract(123, "x")'), /expects a string/);
      assert.throws(() => parser.evaluate('regexExtract("x", 5)'), /expects a string/);
      assert.throws(() => parser.evaluate('regexExtract("x", "y", 5)'), /expects a string/);
    });
  });

  describe('regexReplace(str, pattern, replacement, flags?)', function () {
    it('should replace all matches by default (global)', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexReplace("a-b-c", "-", "_")'), 'a_b_c');
      assert.strictEqual(parser.evaluate('regexReplace("a1b2c3", "[0-9]", "#")'), 'a#b#c#');
    });

    it('should support capture-group references in the replacement', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexReplace("John Smith", "([A-Za-z]+) ([A-Za-z]+)", "$2 $1")'), 'Smith John');
    });

    it('should allow non-global flags to replace only the first match', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexReplace("a-b-c", "-", "_", "")'), 'a_b-c');
    });

    it('should return undefined if any required argument is undefined', function () {
      const parser = new Parser();
      assert.strictEqual(parser.evaluate('regexReplace(undefined, "x", "y")'), undefined);
      assert.strictEqual(parser.evaluate('regexReplace("x", "y", undefined)'), undefined);
    });

    it('should throw for an invalid pattern', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexReplace("x", "(", "y")'), /invalid pattern/);
    });

    it('should throw for non-string arguments', function () {
      const parser = new Parser();
      assert.throws(() => parser.evaluate('regexReplace(1, "y", "z")'), /expects a string/);
      assert.throws(() => parser.evaluate('regexReplace("x", 2, "z")'), /expects a string/);
      assert.throws(() => parser.evaluate('regexReplace("x", "y", 3)'), /expects a string/);
      assert.throws(() => parser.evaluate('regexReplace("x", "y", "z", 4)'), /expects a string/);
    });
  });
});
