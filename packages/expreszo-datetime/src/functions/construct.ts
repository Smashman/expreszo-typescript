import { DateTime } from 'luxon';

export function now(): DateTime {
  return DateTime.now();
}

export function today(): DateTime {
  return DateTime.now().startOf('day');
}

export function parseISO(input: unknown): DateTime {
  if (typeof input !== 'string') {
    throw new Error('parseISO() expects a string');
  }
  return DateTime.fromISO(input);
}

export function parseDate(input: unknown, format: unknown, zone?: unknown): DateTime {
  if (typeof input !== 'string' || typeof format !== 'string') {
    throw new Error('parseDate() expects (string, string, zone?)');
  }
  return DateTime.fromFormat(input, format, zone === undefined ? undefined : { zone: String(zone) });
}

export function fromMillis(input: unknown): DateTime {
  if (typeof input !== 'number') {
    throw new Error('fromMillis() expects a number');
  }
  return DateTime.fromMillis(input);
}

export function dateTime(
  year: unknown,
  month: unknown,
  day: unknown,
  hour?: unknown,
  minute?: unknown,
  second?: unknown
): DateTime {
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
    throw new Error('dateTime() expects numeric year, month, day');
  }
  return DateTime.fromObject({
    year,
    month,
    day,
    hour:   typeof hour   === 'number' ? hour   : 0,
    minute: typeof minute === 'number' ? minute : 0,
    second: typeof second === 'number' ? second : 0
  });
}
