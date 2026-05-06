import type { DateTimeUnit } from 'luxon';
import { toDateTime } from '../normalize.js';

export function isBefore(d1: unknown, d2: unknown): boolean {
  return toDateTime(d1) < toDateTime(d2);
}

export function isAfter(d1: unknown, d2: unknown): boolean {
  return toDateTime(d1) > toDateTime(d2);
}

export function isSame(d1: unknown, d2: unknown, u?: unknown): boolean {
  const a = toDateTime(d1);
  const b = toDateTime(d2);
  if (u === undefined || u === null) {
    return a.toMillis() === b.toMillis();
  }
  if (typeof u !== 'string') {
    throw new Error(`isSame() unit must be a string; got ${typeof u}`);
  }
  return a.hasSame(b, u as DateTimeUnit);
}

export function isBetween(
  d: unknown,
  start: unknown,
  end: unknown,
  inclusive?: unknown
): boolean {
  const dt    = toDateTime(d);
  const lo    = toDateTime(start);
  const hi    = toDateTime(end);
  const incl  = inclusive === undefined || inclusive === null ? true : Boolean(inclusive);
  return incl ? (dt >= lo && dt <= hi) : (dt > lo && dt < hi);
}

export function compareDates(d1: unknown, d2: unknown): number {
  const a = toDateTime(d1).toMillis();
  const b = toDateTime(d2).toMillis();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function overlapsRange(
  s1: unknown,
  e1: unknown,
  s2: unknown,
  e2: unknown
): boolean {
  const a1 = toDateTime(s1);
  const b1 = toDateTime(e1);
  const a2 = toDateTime(s2);
  const b2 = toDateTime(e2);
  return a1 <= b2 && a2 <= b1;
}

export function containsDate(start: unknown, end: unknown, d: unknown): boolean {
  const lo = toDateTime(start);
  const hi = toDateTime(end);
  const dt = toDateTime(d);
  return dt >= lo && dt <= hi;
}
