/**
 * Regular-expression functions: match, extract, and replace.
 *
 * Patterns are compiled from caller-supplied strings via `new RegExp`. Note
 * that exposing arbitrary regex to untrusted expressions carries a ReDoS
 * (catastrophic backtracking) risk — a hostile pattern can run for a very long
 * time. These functions are nonetheless registered as `safe: true`; hosts that
 * evaluate untrusted expressions should be aware of this.
 */
import { getTypeName } from '../../types/values.js';

/**
 * Compiles a pattern, re-throwing the RegExp constructor error with the
 * calling function's name and the offending pattern for a clearer message.
 */
function compile(fn: string, pattern: string, flags: string | undefined): RegExp {
  try {
    return flags === undefined ? new RegExp(pattern) : new RegExp(pattern, flags);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`${fn}(): invalid pattern '${pattern}': ${reason}`);
  }
}

/**
 * Returns true if the string matches the regular expression pattern.
 */
export function regexMatches(
  str: string | undefined,
  pattern: string | undefined,
  flags?: string
): boolean | undefined {
  if (str === undefined || pattern === undefined) {
    return undefined;
  }
  if (typeof str !== 'string') {
    throw new Error(`regexMatches() expects a string as first argument, got ${getTypeName(str)}`);
  }
  if (typeof pattern !== 'string') {
    throw new Error(`regexMatches() expects a string as second argument, got ${getTypeName(pattern)}`);
  }
  if (flags !== undefined && typeof flags !== 'string') {
    throw new Error(`regexMatches() expects a string as third argument, got ${getTypeName(flags)}`);
  }
  return compile('regexMatches', pattern, flags).test(str);
}

/**
 * Extracts the first match of the pattern. Returns the array of capture groups
 * when the pattern defines any, otherwise the full matched substring. Returns
 * undefined when there is no match.
 */
export function regexExtract(
  str: string | undefined,
  pattern: string | undefined,
  flags?: string
): string | string[] | undefined {
  if (str === undefined || pattern === undefined) {
    return undefined;
  }
  if (typeof str !== 'string') {
    throw new Error(`regexExtract() expects a string as first argument, got ${getTypeName(str)}`);
  }
  if (typeof pattern !== 'string') {
    throw new Error(`regexExtract() expects a string as second argument, got ${getTypeName(pattern)}`);
  }
  if (flags !== undefined && typeof flags !== 'string') {
    throw new Error(`regexExtract() expects a string as third argument, got ${getTypeName(flags)}`);
  }
  const match = str.match(compile('regexExtract', pattern, flags));
  if (match === null) {
    return undefined;
  }
  // match[0] is the full match; match[1..] are capture groups. When the pattern
  // has groups, return them; otherwise return the full match.
  if (match.length > 1) {
    return match.slice(1).map((g) => g ?? '');
  }
  return match[0];
}

/**
 * Replaces matches of the pattern with the replacement string. Defaults to a
 * global replace; pass flags (e.g. 'i') to override — include 'g' to keep
 * replacing all matches.
 */
export function regexReplace(
  str: string | undefined,
  pattern: string | undefined,
  replacement: string | undefined,
  flags?: string
): string | undefined {
  if (str === undefined || pattern === undefined || replacement === undefined) {
    return undefined;
  }
  if (typeof str !== 'string') {
    throw new Error(`regexReplace() expects a string as first argument, got ${getTypeName(str)}`);
  }
  if (typeof pattern !== 'string') {
    throw new Error(`regexReplace() expects a string as second argument, got ${getTypeName(pattern)}`);
  }
  if (typeof replacement !== 'string') {
    throw new Error(`regexReplace() expects a string as third argument, got ${getTypeName(replacement)}`);
  }
  if (flags !== undefined && typeof flags !== 'string') {
    throw new Error(`regexReplace() expects a string as fourth argument, got ${getTypeName(flags)}`);
  }
  return str.replace(compile('regexReplace', pattern, flags ?? 'g'), replacement);
}
