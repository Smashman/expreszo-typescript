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

function step(input: unknown): number {
  if (input === undefined || input === null) return 1;
  if (typeof input !== 'number' || !Number.isFinite(input) || input <= 0) {
    throw new Error(`step must be a positive number; got ${String(input)}`);
  }
  return input;
}

/**
 * Stepped sequence of dates from `start` to `end` (half-open: start ≤ d < end).
 * `step` defaults to 1 unit.
 */
export function dateRange(
  start: unknown,
  end: unknown,
  u: unknown,
  s?: unknown
): DateTime[] {
  const lo  = toDateTime(start);
  const hi  = toDateTime(end);
  const un  = unit(u);
  const st  = step(s);
  const dur: DurationLike = { [un]: st } as DurationLike;

  const out: DateTime[] = [];
  let cursor = lo;
  while (cursor < hi) {
    out.push(cursor);
    cursor = cursor.plus(dur);
  }
  return out;
}

/**
 * Count of weekdays (Mon–Fri) in the half-open interval [start, end).
 */
export function businessDaysBetween(start: unknown, end: unknown): number {
  let cursor = toDateTime(start).startOf('day');
  const stop = toDateTime(end).startOf('day');
  if (cursor >= stop) return 0;
  let count = 0;
  while (cursor < stop) {
    if (cursor.weekday < 6) count++;
    cursor = cursor.plus({ days: 1 });
  }
  return count;
}

/**
 * Count of a given weekday (1=Mon … 7=Sun) in the half-open interval [start, end).
 */
export function weekdaysBetween(
  start: unknown,
  end: unknown,
  weekdayNum: unknown
): number {
  if (typeof weekdayNum !== 'number' || weekdayNum < 1 || weekdayNum > 7 || !Number.isInteger(weekdayNum)) {
    throw new Error(`weekdaysBetween() weekday must be an integer 1..7; got ${String(weekdayNum)}`);
  }
  let cursor = toDateTime(start).startOf('day');
  const stop = toDateTime(end).startOf('day');
  if (cursor >= stop) return 0;
  let count = 0;
  while (cursor < stop) {
    if (cursor.weekday === weekdayNum) count++;
    cursor = cursor.plus({ days: 1 });
  }
  return count;
}
