import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateTime } from 'luxon';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin } from '../src/index.js';

function parser() {
  return defineParser({ ...fullParser }).use(dateTimePlugin);
}

// ---------------------------------------------------------------------------
// Construction additions
// ---------------------------------------------------------------------------

describe('construct: yesterday / tomorrow / date / time / fromUnix', () => {
  const FIXED_NOW = new Date('2026-04-15T10:30:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('yesterday is the start of the day before now', () => {
    const r = parser().evaluate('yesterday()') as unknown as DateTime;
    const expected = DateTime.now().startOf('day').minus({ days: 1 });
    expect(r.toMillis()).toBe(expected.toMillis());
  });

  it('tomorrow is the start of the day after now', () => {
    const r = parser().evaluate('tomorrow()') as unknown as DateTime;
    const expected = DateTime.now().startOf('day').plus({ days: 1 });
    expect(r.toMillis()).toBe(expected.toMillis());
  });

  it('date(y, m, d) builds a DateTime at midnight', () => {
    const r = parser().evaluate('date(2026, 1, 15)') as unknown as DateTime;
    expect(r.year).toBe(2026);
    expect(r.month).toBe(1);
    expect(r.day).toBe(15);
    expect(r.hour).toBe(0);
    expect(r.minute).toBe(0);
  });

  it('time(h, m) sets today at the given clock time', () => {
    const r = parser().evaluate('time(13, 45)') as unknown as DateTime;
    expect(r.hour).toBe(13);
    expect(r.minute).toBe(45);
    expect(r.second).toBe(0);
  });

  it('time accepts optional second and millisecond', () => {
    const r = parser().evaluate('time(13, 45, 30, 500)') as unknown as DateTime;
    expect(r.second).toBe(30);
    expect(r.millisecond).toBe(500);
  });

  it('time rejects non-numeric hour or minute', () => {
    expect(() => parser().evaluate("time('a', 'b')")).toThrow();
  });

  it('fromUnix builds a DateTime from a Unix-seconds number', () => {
    const r = parser().evaluate('fromUnix(1767225600)') as unknown as DateTime;
    expect(r.toUTC().toISODate()).toBe('2026-01-01');
  });

  it('fromUnix throws on a non-number argument', () => {
    expect(() => parser().evaluate("fromUnix('1767225600')")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Inspection — calendar parts
// ---------------------------------------------------------------------------

describe('inspect: extra calendar parts', () => {
  it('quarter', () => {
    expect(parser().evaluate("quarter('2026-01-15')")).toBe(1);
    expect(parser().evaluate("quarter('2026-04-15')")).toBe(2);
    expect(parser().evaluate("quarter('2026-09-15')")).toBe(3);
    expect(parser().evaluate("quarter('2026-12-15')")).toBe(4);
  });

  it('isoWeekYear differs from year around the boundary', () => {
    // 2026-01-01 is Thursday; ISO week 1 of 2026.
    expect(parser().evaluate("isoWeekYear('2026-01-01')")).toBe(2026);
    // 2025-12-29 is Monday; ISO week 1 of 2026 already.
    expect(parser().evaluate("isoWeekYear('2025-12-29')")).toBe(2026);
  });

  it('isLeapYear', () => {
    expect(parser().evaluate("isLeapYear('2024-06-15')")).toBe(true);
    expect(parser().evaluate("isLeapYear('2026-06-15')")).toBe(false);
  });

  it('daysInYear', () => {
    expect(parser().evaluate("daysInYear('2024-01-01')")).toBe(366);
    expect(parser().evaluate("daysInYear('2026-01-01')")).toBe(365);
  });

  it('weeksInYear', () => {
    const r = parser().evaluate("weeksInYear('2026-06-01')");
    expect(r === 52 || r === 53).toBe(true);
  });

  it('isDST returns a boolean', () => {
    const r = parser().evaluate("isDST('2026-07-15T12:00:00')");
    expect(typeof r).toBe('boolean');
  });

  it('offsetMinutes / offsetHours', () => {
    // UTC date — offset is always 0 minutes.
    const utc = "setZone('2026-01-15T00:00:00Z', 'utc')";
    expect(parser().evaluate(`offsetMinutes(${utc})`)).toBe(0);
    expect(parser().evaluate(`offsetHours(${utc})`)).toBe(0);
  });

  it('zoneName', () => {
    const r = parser().evaluate("zoneName(setZone('2026-01-15T00:00:00Z', 'America/New_York'))");
    expect(r).toBe('America/New_York');
  });
});

// ---------------------------------------------------------------------------
// Inspection — relative-to-now predicates
// ---------------------------------------------------------------------------

describe('inspect: relative-to-now predicates', () => {
  // 2026-04-15 is a Wednesday at 12:00 UTC.
  const FIXED_NOW = new Date('2026-04-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isToday / isYesterday / isTomorrow', () => {
    expect(parser().evaluate('isToday(now())')).toBe(true);
    expect(parser().evaluate('isYesterday(yesterday())')).toBe(true);
    expect(parser().evaluate('isTomorrow(tomorrow())')).toBe(true);

    expect(parser().evaluate('isToday(yesterday())')).toBe(false);
    expect(parser().evaluate('isYesterday(now())')).toBe(false);
    expect(parser().evaluate('isTomorrow(now())')).toBe(false);
  });

  it('isThisWeek / isThisMonth / isThisYear', () => {
    expect(parser().evaluate('isThisWeek(now())')).toBe(true);
    expect(parser().evaluate('isThisMonth(now())')).toBe(true);
    expect(parser().evaluate('isThisYear(now())')).toBe(true);

    expect(parser().evaluate("isThisYear('2025-04-15')")).toBe(false);
    expect(parser().evaluate("isThisMonth('2026-03-15')")).toBe(false);
  });

  it('isInPast / isInFuture', () => {
    expect(parser().evaluate("isInPast('2026-01-01')")).toBe(true);
    expect(parser().evaluate("isInFuture('2027-01-01')")).toBe(true);
    expect(parser().evaluate("isInPast('2027-01-01')")).toBe(false);
    expect(parser().evaluate("isInFuture('2026-01-01')")).toBe(false);
  });

  it('isWeekday / isWeekend', () => {
    // 2026-04-15 (now) is Wednesday.
    expect(parser().evaluate('isWeekday(now())')).toBe(true);
    expect(parser().evaluate('isWeekend(now())')).toBe(false);
    // 2026-04-18 is Saturday.
    expect(parser().evaluate("isWeekday('2026-04-18')")).toBe(false);
  });

  it('age returns whole years; floors fractional differences; clamps to 0 for the future', () => {
    expect(parser().evaluate("age('2000-04-15')")).toBe(26);
    // Birthday hasn't quite happened yet (one day shy):
    expect(parser().evaluate("age('2000-04-16')")).toBe(25);
    // Future date → 0.
    expect(parser().evaluate("age('2030-01-01')")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Arithmetic additions
// ---------------------------------------------------------------------------

describe('arithmetic: clampDate / minDate / maxDate', () => {
  it('clampDate clamps within bounds', () => {
    const lo = "'2026-01-10'";
    const hi = "'2026-01-20'";
    expect((parser().evaluate(`clampDate('2026-01-15', ${lo}, ${hi})`) as unknown as DateTime).toISODate()).toBe('2026-01-15');
    expect((parser().evaluate(`clampDate('2026-01-05', ${lo}, ${hi})`) as unknown as DateTime).toISODate()).toBe('2026-01-10');
    expect((parser().evaluate(`clampDate('2026-01-25', ${lo}, ${hi})`) as unknown as DateTime).toISODate()).toBe('2026-01-20');
  });

  it('minDate / maxDate handle 2+ inputs', () => {
    const r1 = parser().evaluate("minDate('2026-03-01', '2026-01-01', '2026-02-01')") as unknown as DateTime;
    const r2 = parser().evaluate("maxDate('2026-03-01', '2026-01-01', '2026-02-01')") as unknown as DateTime;
    expect(r1.toISODate()).toBe('2026-01-01');
    expect(r2.toISODate()).toBe('2026-03-01');
  });

  it('minDate / maxDate throw on no arguments', () => {
    expect(() => parser().evaluate('minDate()')).toThrow();
    expect(() => parser().evaluate('maxDate()')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Comparison additions
// ---------------------------------------------------------------------------

describe('compare: isBetween / compareDates / overlapsRange / containsDate', () => {
  it('isBetween defaults to inclusive', () => {
    expect(parser().evaluate("isBetween('2026-01-15', '2026-01-01', '2026-01-31')")).toBe(true);
    expect(parser().evaluate("isBetween('2026-01-01', '2026-01-01', '2026-01-31')")).toBe(true);
    expect(parser().evaluate("isBetween('2026-02-01', '2026-01-01', '2026-01-31')")).toBe(false);
  });

  it('isBetween becomes exclusive when inclusive=false', () => {
    expect(parser().evaluate("isBetween('2026-01-01', '2026-01-01', '2026-01-31', false)")).toBe(false);
    expect(parser().evaluate("isBetween('2026-01-15', '2026-01-01', '2026-01-31', false)")).toBe(true);
  });

  it('compareDates returns -1/0/1', () => {
    expect(parser().evaluate("compareDates('2026-01-01', '2026-01-02')")).toBe(-1);
    expect(parser().evaluate("compareDates('2026-01-02', '2026-01-01')")).toBe(1);
    expect(parser().evaluate("compareDates('2026-01-01', '2026-01-01')")).toBe(0);
  });

  it('overlapsRange detects overlapping intervals', () => {
    expect(parser().evaluate("overlapsRange('2026-01-01', '2026-01-10', '2026-01-05', '2026-01-15')")).toBe(true);
    expect(parser().evaluate("overlapsRange('2026-01-01', '2026-01-10', '2026-02-01', '2026-02-10')")).toBe(false);
  });

  it('containsDate', () => {
    expect(parser().evaluate("containsDate('2026-01-01', '2026-01-31', '2026-01-15')")).toBe(true);
    expect(parser().evaluate("containsDate('2026-01-01', '2026-01-31', '2026-02-15')")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Format / zone additions
// ---------------------------------------------------------------------------

describe('format: toRelative / toRelativeCalendar / toUnix / toUTC / toLocal', () => {
  const FIXED_NOW = new Date('2026-04-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toRelative produces a relative-time string', () => {
    const r = parser().evaluate("toRelative('2026-04-20T12:00:00Z')") as unknown as string;
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  it('toRelative accepts an explicit base date', () => {
    const r = parser().evaluate(
      "toRelative('2026-04-20T12:00:00Z', '2026-04-15T12:00:00Z')"
    ) as unknown as string;
    expect(r).toContain('5');
    expect(r).toContain('day');
  });

  it('toRelativeCalendar produces a calendar-style string', () => {
    const r = parser().evaluate('toRelativeCalendar(tomorrow())') as unknown as string;
    expect(r).toBe('tomorrow');
  });

  it('toUnix returns whole seconds', () => {
    expect(parser().evaluate("toUnix('2026-01-01T00:00:00Z')")).toBe(1767225600);
  });

  it('toUTC sets the zone to UTC', () => {
    const r = parser().evaluate("toUTC('2026-01-01T00:00:00Z')") as unknown as DateTime;
    expect(r.zoneName).toBe('UTC');
  });

  it('toLocal sets the zone to local', () => {
    const r = parser().evaluate("toLocal('2026-01-01T00:00:00Z')") as unknown as DateTime;
    expect(r.zoneName).toBe(DateTime.local().zoneName);
  });
});
