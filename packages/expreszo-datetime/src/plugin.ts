import type { FunctionDescriptor, ParserPreset, Plugin } from '@pro-fa/expreszo';
import {
  now, today, parseISO, parseDate, fromMillis, dateTime,
  yesterday, tomorrow, date, time, fromUnix
} from './functions/construct.js';
import {
  year, month, day, hour, minute, second, millisecond,
  dayOfWeek, dayOfYear, weekOfYear, daysInMonth, isWeekend, isValid,
  quarter, isoWeekYear, isLeapYear, daysInYear, weeksInYear, isDST,
  offsetMinutes, offsetHours, zoneName,
  isWeekday, isToday, isYesterday, isTomorrow,
  isThisWeek, isThisMonth, isThisYear,
  isInPast, isInFuture, age
} from './functions/inspect.js';
import {
  addDuration, subtractDuration, startOf, endOf, diff,
  clampDate, minDate, maxDate
} from './functions/arithmetic.js';
import {
  isBefore, isAfter, isSame,
  isBetween, compareDates, overlapsRange, containsDate
} from './functions/compare.js';
import {
  format, toISO, toMillis, setZone,
  toRelative, toRelativeCalendar, toUnix, toUTC, toLocal
} from './functions/format.js';
import {
  dateRange, businessDaysBetween, weekdaysBetween
} from './functions/range.js';
import {
  daysUntil, daysSince, hoursUntil, hoursSince, minutesUntil, minutesSince
} from './functions/distance.js';

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
  fn('yesterday',  yesterday,  false, { description: 'Start of yesterday in the local zone.' }),
  fn('tomorrow',   tomorrow,   false, { description: 'Start of tomorrow in the local zone.' }),
  fn('parseISO',   parseISO,   true,  { description: 'Parse an ISO 8601 string into a DateTime.', params: [{ name: 'iso', description: 'ISO 8601 timestamp', type: 'string' }] }),
  fn('parseDate',  parseDate,  true,  { description: 'Parse a date string with a Luxon format token.', params: [
    { name: 'input',  description: 'Date string',    type: 'string' },
    { name: 'format', description: 'Luxon format',   type: 'string' },
    { name: 'zone',   description: 'IANA zone name', type: 'string', optional: true }
  ] }),
  fn('fromMillis', fromMillis, true,  { description: 'Build a DateTime from a Unix millisecond timestamp.', params: [{ name: 'ms', description: 'Milliseconds since epoch', type: 'number' }] }),
  fn('fromUnix',   fromUnix,   true,  { description: 'Build a DateTime from a Unix seconds timestamp.', params: [{ name: 'seconds', description: 'Seconds since epoch', type: 'number' }] }),
  fn('dateTime',   dateTime,   true,  { description: 'Build a DateTime from numeric components.', params: [
    { name: 'year',   description: 'Year',   type: 'number' },
    { name: 'month',  description: 'Month',  type: 'number' },
    { name: 'day',    description: 'Day',    type: 'number' },
    { name: 'hour',   description: 'Hour',   type: 'number', optional: true },
    { name: 'minute', description: 'Minute', type: 'number', optional: true },
    { name: 'second', description: 'Second', type: 'number', optional: true }
  ] }),
  fn('date',       date,       true,  { description: 'Build a DateTime at midnight from year/month/day.' }),
  fn('time',       time,       false, { description: 'Today at the given clock time.', params: [
    { name: 'hour',        description: 'Hour',        type: 'number' },
    { name: 'minute',      description: 'Minute',      type: 'number' },
    { name: 'second',      description: 'Second',      type: 'number', optional: true },
    { name: 'millisecond', description: 'Millisecond', type: 'number', optional: true }
  ] }),

  // Inspection — calendar parts
  fn('year',           year,           true),
  fn('month',          month,          true),
  fn('day',            day,            true),
  fn('hour',           hour,           true),
  fn('minute',         minute,         true),
  fn('second',         second,         true),
  fn('millisecond',    millisecond,    true),
  fn('dayOfWeek',      dayOfWeek,      true, { description: 'Weekday number, 1 (Monday) through 7 (Sunday).' }),
  fn('dayOfYear',      dayOfYear,      true, { description: 'Ordinal day of the year, 1-365 (or 366 in leap years).' }),
  fn('weekOfYear',     weekOfYear,     true, { description: 'ISO week number, 1-53.' }),
  fn('daysInMonth',    daysInMonth,    true),
  fn('quarter',        quarter,        true, { description: 'Calendar quarter, 1-4.' }),
  fn('isoWeekYear',    isoWeekYear,    true, { description: 'ISO week-numbering year (may differ from calendar year around Jan 1 / Dec 31).' }),
  fn('isLeapYear',     isLeapYear,     true),
  fn('daysInYear',     daysInYear,     true, { description: '365 or 366.' }),
  fn('weeksInYear',    weeksInYear,    true, { description: '52 or 53.' }),
  fn('isDST',          isDST,          true, { description: 'True if the date is in daylight saving in its zone.' }),
  fn('offsetMinutes',  offsetMinutes,  true, { description: 'UTC offset in minutes.' }),
  fn('offsetHours',    offsetHours,    true, { description: 'UTC offset in hours, fractional.' }),
  fn('zoneName',       zoneName,       true, { description: 'IANA zone name.' }),
  fn('isWeekend',      isWeekend,      true),
  fn('isWeekday',      isWeekday,      true, { description: 'Opposite of isWeekend.' }),
  fn('isValid',        isValid,        true, { description: 'Whether the value is a valid date in any accepted shape.' }),

  // Inspection — relative-to-now (impure: depend on the current clock)
  fn('isToday',     isToday,     false, { description: 'True when the date falls on the current calendar day.' }),
  fn('isYesterday', isYesterday, false, { description: 'True when the date falls on yesterday.' }),
  fn('isTomorrow',  isTomorrow,  false, { description: 'True when the date falls on tomorrow.' }),
  fn('isThisWeek',  isThisWeek,  false, { description: 'True when the date is in the current ISO week.' }),
  fn('isThisMonth', isThisMonth, false, { description: 'True when the date is in the current calendar month.' }),
  fn('isThisYear',  isThisYear,  false, { description: 'True when the date is in the current calendar year.' }),
  fn('isInPast',    isInPast,    false, { description: 'True when the date is strictly before now.' }),
  fn('isInFuture',  isInFuture,  false, { description: 'True when the date is strictly after now.' }),
  fn('age',         age,         false, { description: 'Whole years from the date to now (0 for future dates).' }),

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
  fn('clampDate',        clampDate,        true, { description: 'Clamp a date into [low, high].' }),
  fn('minDate',          minDate,          true, { description: 'Earliest of N dates.', params: [
    { name: 'dates', description: 'Two or more dates', type: 'any', isVariadic: true }
  ] }),
  fn('maxDate',          maxDate,          true, { description: 'Latest of N dates.', params: [
    { name: 'dates', description: 'Two or more dates', type: 'any', isVariadic: true }
  ] }),

  // Comparison
  fn('isBefore',     isBefore,     true),
  fn('isAfter',      isAfter,      true),
  fn('isSame',       isSame,       true, { description: 'Whether two dates are the same, optionally truncated to a unit.', params: [
    { name: 'a',    description: 'First date',  type: 'any' },
    { name: 'b',    description: 'Second date', type: 'any' },
    { name: 'unit', description: 'Unit',        type: 'string', optional: true }
  ] }),
  fn('isBetween',    isBetween,    true, { description: 'Whether `d` falls in [start, end]. Pass false for the optional `inclusive` arg to make both ends exclusive.', params: [
    { name: 'd',         description: 'Date',                  type: 'any' },
    { name: 'start',     description: 'Range start',           type: 'any' },
    { name: 'end',       description: 'Range end',             type: 'any' },
    { name: 'inclusive', description: 'Default true',          type: 'boolean', optional: true }
  ] }),
  fn('compareDates', compareDates, true, { description: '-1 if a<b, 1 if a>b, 0 otherwise. Usable as an Array.sort comparator.' }),
  fn('overlapsRange', overlapsRange, true, { description: 'Whether two intervals overlap.' }),
  fn('containsDate', containsDate, true, { description: 'Whether `d` falls inside [start, end].' }),

  // Range / sequence
  fn('dateRange',           dateRange,           true, { description: 'Stepped sequence of dates from start to end (half-open).', params: [
    { name: 'start', description: 'Start date',       type: 'any' },
    { name: 'end',   description: 'End date (excl.)', type: 'any' },
    { name: 'unit',  description: 'Step unit',        type: 'string' },
    { name: 'step',  description: 'Step amount, default 1', type: 'number', optional: true }
  ] }),
  fn('businessDaysBetween', businessDaysBetween, true, { description: 'Count of weekdays (Mon-Fri) in [start, end).' }),
  fn('weekdaysBetween',     weekdaysBetween,     true, { description: 'Count of a given weekday (1=Mon..7=Sun) in [start, end).' }),

  // Distance from now (impure)
  fn('daysUntil',    daysUntil,    false, { description: 'Whole days from now to `d` (negative if past).' }),
  fn('daysSince',    daysSince,    false, { description: 'Whole days from `d` to now (negative if future).' }),
  fn('hoursUntil',   hoursUntil,   false),
  fn('hoursSince',   hoursSince,   false),
  fn('minutesUntil', minutesUntil, false),
  fn('minutesSince', minutesSince, false),

  // Format / zone
  fn('format',             format,             true),
  fn('toISO',              toISO,              true),
  fn('toMillis',           toMillis,           true),
  fn('toUnix',             toUnix,             true, { description: 'Unix seconds (whole number).' }),
  fn('setZone',            setZone,            true),
  fn('toUTC',              toUTC,              true, { description: "Sugar for setZone(d, 'utc')." }),
  fn('toLocal',            toLocal,            true, { description: "Sugar for setZone(d, 'local')." }),
  fn('toRelative',         toRelative,         false, { description: '"in 5 minutes" / "3 days ago". Locale-aware.', params: [
    { name: 'd',    description: 'Target date',                  type: 'any' },
    { name: 'base', description: 'Reference date (default now)', type: 'any', optional: true }
  ] }),
  fn('toRelativeCalendar', toRelativeCalendar, false, { description: 'Calendar-style relative ("yesterday", "tomorrow").' })
];

export const dateTimePlugin: Plugin = {
  name: '@pro-fa/expreszo-datetime',
  version: '0.2.0',
  functions: DATETIME_FUNCTIONS
};

/** Spread-into-`defineParser` form for callers who prefer the preset style. */
export const withDateTime: ParserPreset = {
  operators: [],
  functions: DATETIME_FUNCTIONS
};
