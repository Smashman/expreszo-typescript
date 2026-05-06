import { toDateTime } from '../normalize.js';
import type { DateTime } from 'luxon';

export function format(d: unknown, pattern: unknown): string {
  if (typeof pattern !== 'string') {
    throw new Error('format() pattern must be a string');
  }
  return toDateTime(d).toFormat(pattern);
}

export function toISO(d: unknown): string {
  const iso = toDateTime(d).toISO();
  if (iso === null) {
    throw new Error('toISO(): invalid DateTime');
  }
  return iso;
}

export function toMillis(d: unknown): number {
  return toDateTime(d).toMillis();
}

export function setZone(d: unknown, zone: unknown): DateTime {
  if (typeof zone !== 'string') {
    throw new Error('setZone() zone must be a string');
  }
  return toDateTime(d).setZone(zone);
}

export function toRelative(d: unknown, base?: unknown): string {
  const opts = base === undefined || base === null
    ? undefined
    : { base: toDateTime(base) };
  const out = toDateTime(d).toRelative(opts);
  if (out === null) {
    throw new Error('toRelative(): invalid DateTime');
  }
  return out;
}

export function toRelativeCalendar(d: unknown, base?: unknown): string {
  const opts = base === undefined || base === null
    ? undefined
    : { base: toDateTime(base) };
  const out = toDateTime(d).toRelativeCalendar(opts);
  if (out === null) {
    throw new Error('toRelativeCalendar(): invalid DateTime');
  }
  return out;
}

export function toUnix(d: unknown): number {
  return toDateTime(d).toUnixInteger();
}

export function toUTC(d: unknown): DateTime {
  return toDateTime(d).setZone('utc');
}

export function toLocal(d: unknown): DateTime {
  return toDateTime(d).setZone('local');
}
