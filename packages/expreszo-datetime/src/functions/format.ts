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
