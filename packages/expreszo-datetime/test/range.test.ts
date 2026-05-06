import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin } from '../src/index.js';

function parser() {
  return defineParser({ ...fullParser }).use(dateTimePlugin);
}

describe('dateRange', () => {
  it('produces a half-open daily sequence', () => {
    const r = parser().evaluate("dateRange('2026-01-01', '2026-01-04', 'days')") as unknown as DateTime[];
    expect(r.map((d) => d.toISODate())).toEqual([
      '2026-01-01', '2026-01-02', '2026-01-03'
    ]);
  });

  it('honours a custom step', () => {
    const r = parser().evaluate("dateRange('2026-01-01', '2026-01-10', 'days', 3)") as unknown as DateTime[];
    expect(r.map((d) => d.toISODate())).toEqual([
      '2026-01-01', '2026-01-04', '2026-01-07'
    ]);
  });

  it('supports hours', () => {
    const r = parser().evaluate("dateRange('2026-01-01T00:00:00Z', '2026-01-01T03:00:00Z', 'hours')") as unknown as DateTime[];
    expect(r).toHaveLength(3);
  });

  it('returns an empty array when start >= end', () => {
    const r = parser().evaluate("dateRange('2026-01-10', '2026-01-01', 'days')") as unknown as DateTime[];
    expect(r).toEqual([]);
  });

  it('rejects an invalid step', () => {
    expect(() => parser().evaluate("dateRange('2026-01-01', '2026-01-04', 'days', -1)")).toThrow();
    expect(() => parser().evaluate("dateRange('2026-01-01', '2026-01-04', 'days', 0)")).toThrow();
  });
});

describe('businessDaysBetween', () => {
  it('counts Mon-Fri in [start, end)', () => {
    // 2026-01-05 (Mon) through 2026-01-12 (Mon, exclusive) = Mon, Tue, Wed, Thu, Fri = 5
    expect(parser().evaluate("businessDaysBetween('2026-01-05', '2026-01-12')")).toBe(5);
  });

  it('skips weekends inside the range', () => {
    // 2026-01-02 (Fri) through 2026-01-06 (Tue, exclusive) = Fri, Mon = 2
    expect(parser().evaluate("businessDaysBetween('2026-01-02', '2026-01-06')")).toBe(2);
  });

  it('returns 0 for empty or reversed ranges', () => {
    expect(parser().evaluate("businessDaysBetween('2026-01-01', '2026-01-01')")).toBe(0);
    expect(parser().evaluate("businessDaysBetween('2026-01-10', '2026-01-01')")).toBe(0);
  });
});

describe('weekdaysBetween', () => {
  it('counts a single weekday across a month', () => {
    // 2026-01-05 (Mon) through 2026-02-02 (Mon, exclusive) = 4 Mondays
    expect(parser().evaluate("weekdaysBetween('2026-01-05', '2026-02-02', 1)")).toBe(4);
  });

  it('returns 0 for empty ranges', () => {
    expect(parser().evaluate("weekdaysBetween('2026-01-01', '2026-01-01', 3)")).toBe(0);
  });

  it('rejects an invalid weekday number', () => {
    expect(() => parser().evaluate("weekdaysBetween('2026-01-01', '2026-01-31', 0)")).toThrow();
    expect(() => parser().evaluate("weekdaysBetween('2026-01-01', '2026-01-31', 8)")).toThrow();
    expect(() => parser().evaluate("weekdaysBetween('2026-01-01', '2026-01-31', 1.5)")).toThrow();
  });
});
