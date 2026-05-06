import { DateTime } from 'luxon';

export type DateInput = DateTime | Date | string | number;

/**
 * Single normalisation point for every datetime function. Accepts the four
 * shapes a user might pass through an expression and yields a Luxon
 * `DateTime` for downstream Luxon calls.
 *
 * Throws when the value isn't a recognised date shape so the function call
 * surfaces a useful error inside the expression engine instead of returning
 * an `Invalid` Luxon DateTime that propagates silently.
 */
export function toDateTime(value: unknown): DateTime {
  if (value instanceof DateTime) return value;
  if (value instanceof Date)     return DateTime.fromJSDate(value);
  if (typeof value === 'number') return DateTime.fromMillis(value);
  if (typeof value === 'string') return DateTime.fromISO(value);
  throw new Error(`Cannot convert value of type ${typeof value} to DateTime`);
}

/** Same as `toDateTime` but returns `undefined` when the input is missing. */
export function toDateTimeOrUndefined(value: unknown): DateTime | undefined {
  if (value === undefined || value === null) return undefined;
  return toDateTime(value);
}
