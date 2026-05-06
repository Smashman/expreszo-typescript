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
