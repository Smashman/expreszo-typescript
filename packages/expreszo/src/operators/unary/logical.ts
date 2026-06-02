/**
 * Unary logical operators
 * Handles logical negation and utility operations
 */

export function not(a: any): boolean {
  return !a;
}

export function length(s: any[] | string | number | null | undefined): number | undefined {
  if (s === undefined) {
    return undefined;
  }

  // `null` is an explicit empty value — its length is 0, not `String(null).length` (4).
  if (s === null) {
    return 0;
  }

  if (Array.isArray(s)) {
    return s.length;
  }

  return String(s).length;
}
