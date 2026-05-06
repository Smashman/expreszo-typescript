import type { FunctionDescriptor, ParserPreset, Plugin } from '@pro-fa/expreszo';
import {
  now, today, parseISO, parseDate, fromMillis, dateTime
} from './functions/construct.js';
import {
  year, month, day, hour, minute, second, millisecond,
  dayOfWeek, dayOfYear, weekOfYear, daysInMonth, isWeekend, isValid
} from './functions/inspect.js';
import {
  addDuration, subtractDuration, startOf, endOf, diff
} from './functions/arithmetic.js';
import {
  isBefore, isAfter, isSame
} from './functions/compare.js';
import {
  format, toISO, toMillis, setZone
} from './functions/format.js';

const fn = (
  name: string,
  impl: (...args: unknown[]) => unknown,
  pure: boolean,
  docs?: FunctionDescriptor['docs']
): FunctionDescriptor => ({
  name,
  impl: impl as FunctionDescriptor['impl'],
  category: 'datetime',
  pure,
  safe: true,
  async: false,
  ...(docs ? { docs } : {})
});

export const DATETIME_FUNCTIONS: readonly FunctionDescriptor[] = [
  // Construction
  fn('now',        now,        false, { description: 'Current date and time as a Luxon DateTime.' }),
  fn('today',      today,      false, { description: 'Start of the current day as a Luxon DateTime.' }),
  fn('parseISO',   parseISO,   true,  { description: 'Parse an ISO 8601 string into a DateTime.', params: [{ name: 'iso', description: 'ISO 8601 timestamp', type: 'string' }] }),
  fn('parseDate',  parseDate,  true,  { description: 'Parse a date string with a Luxon format token.', params: [
    { name: 'input',  description: 'Date string',    type: 'string' },
    { name: 'format', description: 'Luxon format',   type: 'string' },
    { name: 'zone',   description: 'IANA zone name', type: 'string', optional: true }
  ] }),
  fn('fromMillis', fromMillis, true,  { description: 'Build a DateTime from a Unix millisecond timestamp.', params: [{ name: 'ms', description: 'Milliseconds since epoch', type: 'number' }] }),
  fn('dateTime',   dateTime,   true,  { description: 'Build a DateTime from numeric components (UTC).', params: [
    { name: 'year',   description: 'Year',   type: 'number' },
    { name: 'month',  description: 'Month',  type: 'number' },
    { name: 'day',    description: 'Day',    type: 'number' },
    { name: 'hour',   description: 'Hour',   type: 'number', optional: true },
    { name: 'minute', description: 'Minute', type: 'number', optional: true },
    { name: 'second', description: 'Second', type: 'number', optional: true }
  ] }),

  // Inspection
  fn('year',        year,        true),
  fn('month',       month,       true),
  fn('day',         day,         true),
  fn('hour',        hour,        true),
  fn('minute',      minute,      true),
  fn('second',      second,      true),
  fn('millisecond', millisecond, true),
  fn('dayOfWeek',   dayOfWeek,   true, { description: 'Weekday number, 1 (Monday) through 7 (Sunday).' }),
  fn('dayOfYear',   dayOfYear,   true, { description: 'Ordinal day of the year, 1-365 (or 366 in leap years).' }),
  fn('weekOfYear',  weekOfYear,  true, { description: 'ISO week number, 1-53.' }),
  fn('daysInMonth', daysInMonth, true),
  fn('isWeekend',   isWeekend,   true),
  fn('isValid',     isValid,     true, { description: 'Whether the value is a valid date in any accepted shape.' }),

  // Arithmetic
  fn('addDuration',      addDuration,      true, { description: 'Add an amount in the given unit to a date.', params: [
    { name: 'date',   description: 'Date',   type: 'any' },
    { name: 'amount', description: 'Amount', type: 'number' },
    { name: 'unit',   description: 'year(s), month(s), day(s), …', type: 'string' }
  ] }),
  fn('subtractDuration', subtractDuration, true),
  fn('startOf',          startOf,          true),
  fn('endOf',            endOf,            true),
  fn('diff',             diff,             true, { description: 'Difference between two dates in the given unit.', params: [
    { name: 'a',    description: 'First date',  type: 'any' },
    { name: 'b',    description: 'Second date', type: 'any' },
    { name: 'unit', description: 'Unit',        type: 'string' }
  ] }),

  // Comparison
  fn('isBefore', isBefore, true),
  fn('isAfter',  isAfter,  true),
  fn('isSame',   isSame,   true, { description: 'Whether two dates are the same, optionally truncated to a unit.', params: [
    { name: 'a',    description: 'First date',  type: 'any' },
    { name: 'b',    description: 'Second date', type: 'any' },
    { name: 'unit', description: 'Unit',        type: 'string', optional: true }
  ] }),

  // Format / zone
  fn('format',   format,   true),
  fn('toISO',    toISO,    true),
  fn('toMillis', toMillis, true),
  fn('setZone',  setZone,  true)
];

export const dateTimePlugin: Plugin = {
  name: '@pro-fa/expreszo-datetime',
  version: '0.1.0',
  functions: DATETIME_FUNCTIONS
};

/** Spread-into-`defineParser` form for callers who prefer the preset style. */
export const withDateTime: ParserPreset = {
  operators: [],
  functions: DATETIME_FUNCTIONS
};
