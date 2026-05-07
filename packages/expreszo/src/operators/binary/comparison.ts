/**
 * Binary comparison operators
 * Handles equality and relational comparisons: ==, !=, <, >, <=, >=
 */

export function equal(a: any, b: any): boolean {
  if (a === b) return true;
  // Two non-null objects with a meaningful `valueOf()` (i.e. one that
  // returns something *other than* the object itself) are compared by
  // their primitive form. This mirrors what the relational operators
  // (`<`, `>`, `<=`, `>=`) already do via JS's `ToPrimitive`, and lets
  // values like Luxon `DateTime` and JS `Date` compare by instant
  // without the core ever knowing about either type.
  // Plain objects and arrays return themselves from `valueOf()`, so
  // they still fall through to reference-equality semantics.
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    const av = a.valueOf();
    const bv = b.valueOf();
    if (av !== a && bv !== b) {
      return av === bv;
    }
  }
  return false;
}

export function notEqual(a: any, b: any): boolean {
  return !equal(a, b);
}

export function greaterThan(a: any, b: any): boolean | undefined {
  if (a === undefined || b === undefined) return undefined;
  return a > b;
}

export function lessThan(a: any, b: any): boolean | undefined {
  if (a === undefined || b === undefined) return undefined;
  return a < b;
}

export function greaterThanEqual(a: any, b: any): boolean | undefined {
  if (a === undefined || b === undefined) return undefined;
  return a >= b;
}

export function lessThanEqual(a: any, b: any): boolean | undefined {
  if (a === undefined || b === undefined) return undefined;
  return a <= b;
}

export function greaterThanLegacy(a: any, b: any): boolean {
  return a > b;
}

export function lessThanLegacy(a: any, b: any): boolean {
  return a < b;
}

export function greaterThanEqualLegacy(a: any, b: any): boolean {
  return a >= b;
}

export function lessThanEqualLegacy(a: any, b: any): boolean {
  return a <= b;
}
