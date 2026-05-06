import { DateTime } from 'luxon';
import { toDateTime } from '../normalize.js';

/**
 * Whole-unit distance from now to `d` (positive for future, negative for past).
 * Internal helper used by all six exports.
 */
function distance(d: unknown, unit: 'days' | 'hours' | 'minutes', sign: 1 | -1): number {
  const target = toDateTime(d);
  const now    = DateTime.now();
  const value  = sign === 1
    ? target.diff(now, unit).as(unit)   // until: target - now
    : now.diff(target, unit).as(unit);  // since: now - target
  return Math.trunc(value);
}

export const daysUntil    = (d: unknown): number => distance(d, 'days',    1);
export const daysSince    = (d: unknown): number => distance(d, 'days',   -1);
export const hoursUntil   = (d: unknown): number => distance(d, 'hours',   1);
export const hoursSince   = (d: unknown): number => distance(d, 'hours',  -1);
export const minutesUntil = (d: unknown): number => distance(d, 'minutes', 1);
export const minutesSince = (d: unknown): number => distance(d, 'minutes',-1);
