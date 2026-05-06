import type { DateTime, DateTimeUnit, DurationLike } from 'luxon';
import { toDateTime } from '../normalize.js';

const UNITS = new Set<DateTimeUnit>([
  'year', 'years' as DateTimeUnit,
  'quarter', 'quarters' as DateTimeUnit,
  'month', 'months' as DateTimeUnit,
  'week', 'weeks' as DateTimeUnit,
  'day', 'days' as DateTimeUnit,
  'hour', 'hours' as DateTimeUnit,
  'minute', 'minutes' as DateTimeUnit,
  'second', 'seconds' as DateTimeUnit,
  'millisecond', 'milliseconds' as DateTimeUnit
]);

function unit(input: unknown): DateTimeUnit {
  if (typeof input !== 'string' || !UNITS.has(input as DateTimeUnit)) {
    throw new Error(
      `unit must be one of: year(s), quarter(s), month(s), week(s), day(s), hour(s), minute(s), second(s), millisecond(s); got ${String(input)}`
    );
  }
  return input as DateTimeUnit;
}

function amount(input: unknown): number {
  if (typeof input !== 'number') {
    throw new Error(`amount must be a number; got ${typeof input}`);
  }
  return input;
}

export function addDuration(d: unknown, n: unknown, u: unknown): DateTime {
  const duration: DurationLike = { [unit(u)]: amount(n) } as DurationLike;
  return toDateTime(d).plus(duration);
}

export function subtractDuration(d: unknown, n: unknown, u: unknown): DateTime {
  const duration: DurationLike = { [unit(u)]: amount(n) } as DurationLike;
  return toDateTime(d).minus(duration);
}

export function startOf(d: unknown, u: unknown): DateTime {
  return toDateTime(d).startOf(unit(u));
}

export function endOf(d: unknown, u: unknown): DateTime {
  return toDateTime(d).endOf(unit(u));
}

export function diff(d1: unknown, d2: unknown, u: unknown): number {
  return toDateTime(d1).diff(toDateTime(d2), unit(u)).as(unit(u));
}

export function clampDate(d: unknown, low: unknown, high: unknown): DateTime {
  const dt   = toDateTime(d);
  const lo   = toDateTime(low);
  const hi   = toDateTime(high);
  if (dt < lo) return lo;
  if (dt > hi) return hi;
  return dt;
}

export function minDate(...args: unknown[]): DateTime {
  if (args.length === 0) {
    throw new Error('minDate() requires at least one argument');
  }
  return args.map(toDateTime).reduce((a, b) => (a < b ? a : b));
}

export function maxDate(...args: unknown[]): DateTime {
  if (args.length === 0) {
    throw new Error('maxDate() requires at least one argument');
  }
  return args.map(toDateTime).reduce((a, b) => (a > b ? a : b));
}
