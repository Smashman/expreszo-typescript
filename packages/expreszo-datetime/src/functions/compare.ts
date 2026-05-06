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
