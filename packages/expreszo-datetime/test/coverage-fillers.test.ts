import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin, toDateTime, toDateTimeOrUndefined } from '../src/index.js';

function parser() {
  return defineParser({ ...fullParser }).use(dateTimePlugin);
}

describe('parseDate', () => {
  it('parses with a Luxon format token', () => {
    const r = parser().evaluate("parseDate('20/01/2026', 'dd/MM/yyyy')") as unknown as DateTime;
    expect(r.toISODate()).toBe('2026-01-20');
  });

  it('parses with an explicit IANA zone', () => {
    const r = parser().evaluate(
      "parseDate('2026-01-20 12:00', 'yyyy-MM-dd HH:mm', 'America/New_York')"
    ) as unknown as DateTime;
    expect(r.zoneName).toBe('America/New_York');
  });

  it('throws when the input or format is not a string', () => {
    expect(() => parser().evaluate('parseDate(42, 42)')).toThrow();
  });
});

describe('dateTime constructor', () => {
  it('builds from year/month/day', () => {
    const r = parser().evaluate('dateTime(2026, 1, 20)') as unknown as DateTime;
    expect(r.year).toBe(2026);
    expect(r.month).toBe(1);
    expect(r.day).toBe(20);
  });

  it('accepts optional time components', () => {
    const r = parser().evaluate('dateTime(2026, 1, 20, 13, 45, 30)') as unknown as DateTime;
    expect(r.hour).toBe(13);
    expect(r.minute).toBe(45);
    expect(r.second).toBe(30);
  });

  it('throws when the date components are not numbers', () => {
    expect(() => parser().evaluate("dateTime('a', 'b', 'c')")).toThrow();
  });
});

describe('parseISO and fromMillis edge cases', () => {
  it('parseISO throws on a non-string argument', () => {
    expect(() => parser().evaluate('parseISO(42)')).toThrow();
  });

  it('fromMillis throws on a non-number argument', () => {
    expect(() => parser().evaluate("fromMillis('not a number')")).toThrow();
  });
});

describe('toDateTimeOrUndefined', () => {
  it('returns undefined for null and undefined', () => {
    expect(toDateTimeOrUndefined(null)).toBeUndefined();
    expect(toDateTimeOrUndefined(undefined)).toBeUndefined();
  });

  it('delegates to toDateTime for actual values', () => {
    const r = toDateTimeOrUndefined('2026-01-01');
    expect(r instanceof DateTime).toBe(true);
  });
});

describe('toDateTime rejects unsupported shapes', () => {
  it('throws on objects that are neither DateTime nor Date', () => {
    expect(() => toDateTime({ not: 'a date' })).toThrow();
  });

  it('throws on booleans', () => {
    expect(() => toDateTime(true)).toThrow();
  });
});

describe('format / setZone / isSame error paths', () => {
  it('format() rejects a non-string pattern', () => {
    expect(() => parser().evaluate('format(now(), 42)')).toThrow();
  });

  it('setZone() rejects a non-string zone', () => {
    expect(() => parser().evaluate('setZone(now(), 42)')).toThrow();
  });

  it('isSame() rejects a non-string unit', () => {
    expect(() => parser().evaluate("isSame('2026-01-01', '2026-01-02', 42)")).toThrow();
  });
});

describe('every inspector returns the expected value', () => {
  const D = "'2026-04-15T13:45:30.123Z'";

  it('year/month/day/hour/minute/second/millisecond', () => {
    const p = parser();
    const z = `setZone(${D}, 'utc')`;
    expect(p.evaluate(`year(${z})`)).toBe(2026);
    expect(p.evaluate(`month(${z})`)).toBe(4);
    expect(p.evaluate(`day(${z})`)).toBe(15);
    expect(p.evaluate(`hour(${z})`)).toBe(13);
    expect(p.evaluate(`minute(${z})`)).toBe(45);
    expect(p.evaluate(`second(${z})`)).toBe(30);
    expect(p.evaluate(`millisecond(${z})`)).toBe(123);
  });

  it('dayOfWeek / dayOfYear / weekOfYear / daysInMonth', () => {
    const p = parser();
    expect(p.evaluate("dayOfWeek('2026-04-15')")).toBeGreaterThan(0);
    expect(p.evaluate("dayOfYear('2026-04-15')")).toBeGreaterThan(0);
    expect(p.evaluate("weekOfYear('2026-04-15')")).toBeGreaterThan(0);
    expect(p.evaluate("daysInMonth('2026-04-15')")).toBe(30);
  });
});

describe('isWeekend covers Sunday too', () => {
  it('returns true for Sunday', () => {
    // 2026-04-19 is a Sunday → weekday 7
    expect(parser().evaluate("isWeekend('2026-04-19')")).toBe(true);
  });
});

describe('isValid for additional shapes', () => {
  it('accepts a JS Date', () => {
    expect(parser().evaluate('isValid(d)', { d: new Date('2026-01-01') as unknown as never })).toBe(true);
  });

  it('accepts a Luxon DateTime', () => {
    expect(parser().evaluate('isValid(dt)', { dt: DateTime.fromISO('2026-01-01') as unknown as never })).toBe(true);
  });

  it('accepts a millisecond number', () => {
    expect(parser().evaluate('isValid(1767225600000)')).toBe(true);
  });

  it('rejects NaN', () => {
    expect(parser().evaluate('isValid(n)', { n: NaN })).toBe(false);
  });

  it('rejects an arbitrary object', () => {
    expect(parser().evaluate('isValid(o)', { o: { not: 'a date' } as unknown as never })).toBe(false);
  });
});
