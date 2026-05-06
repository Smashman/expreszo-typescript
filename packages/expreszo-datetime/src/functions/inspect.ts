import { DateTime } from 'luxon';
import { toDateTime } from '../normalize.js';

export const year        = (d: unknown): number => toDateTime(d).year;
export const month       = (d: unknown): number => toDateTime(d).month;
export const day         = (d: unknown): number => toDateTime(d).day;
export const hour        = (d: unknown): number => toDateTime(d).hour;
export const minute      = (d: unknown): number => toDateTime(d).minute;
export const second      = (d: unknown): number => toDateTime(d).second;
export const millisecond = (d: unknown): number => toDateTime(d).millisecond;
export const dayOfWeek   = (d: unknown): number => toDateTime(d).weekday;
export const dayOfYear   = (d: unknown): number => toDateTime(d).ordinal;
export const weekOfYear  = (d: unknown): number => toDateTime(d).weekNumber;
export const daysInMonth = (d: unknown): number => toDateTime(d).daysInMonth ?? 0;

export function isWeekend(d: unknown): boolean {
  const wd = toDateTime(d).weekday;
  return wd === 6 || wd === 7;
}

export function isValid(d: unknown): boolean {
  if (d instanceof DateTime) return d.isValid;
  if (d instanceof Date)     return !Number.isNaN(d.getTime());
  if (typeof d === 'number') return Number.isFinite(d);
  if (typeof d === 'string') return DateTime.fromISO(d).isValid;
  return false;
}

// Extra calendar parts.
export const quarter       = (d: unknown): number  => toDateTime(d).quarter;
export const isoWeekYear   = (d: unknown): number  => toDateTime(d).weekYear;
export const isLeapYear    = (d: unknown): boolean => toDateTime(d).isInLeapYear;
export const daysInYear    = (d: unknown): number  => toDateTime(d).daysInYear;
export const weeksInYear   = (d: unknown): number  => toDateTime(d).weeksInWeekYear;
export const isDST         = (d: unknown): boolean => toDateTime(d).isInDST;
export const offsetMinutes = (d: unknown): number  => toDateTime(d).offset;
export const offsetHours   = (d: unknown): number  => toDateTime(d).offset / 60;
export const zoneName      = (d: unknown): string  => toDateTime(d).zoneName ?? 'local';

// Relative-to-now predicates. All compare against DateTime.now() in the
// caller's local zone; convert to UTC first if you need UTC truth.
export const isWeekday = (d: unknown): boolean => !isWeekend(d);

export const isToday     = (d: unknown): boolean => toDateTime(d).hasSame(DateTime.now(), 'day');
export const isYesterday = (d: unknown): boolean =>
  toDateTime(d).hasSame(DateTime.now().minus({ days: 1 }), 'day');
export const isTomorrow  = (d: unknown): boolean =>
  toDateTime(d).hasSame(DateTime.now().plus({ days: 1 }), 'day');

export const isThisWeek  = (d: unknown): boolean => toDateTime(d).hasSame(DateTime.now(), 'week');
export const isThisMonth = (d: unknown): boolean => toDateTime(d).hasSame(DateTime.now(), 'month');
export const isThisYear  = (d: unknown): boolean => toDateTime(d).hasSame(DateTime.now(), 'year');

export const isInPast    = (d: unknown): boolean => toDateTime(d) < DateTime.now();
export const isInFuture  = (d: unknown): boolean => toDateTime(d) > DateTime.now();

export function age(d: unknown): number {
  const dt = toDateTime(d);
  const years = DateTime.now().diff(dt, 'years').years;
  return years < 0 ? 0 : Math.floor(years);
}
