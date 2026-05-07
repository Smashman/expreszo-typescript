import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin, DATETIME_FUNCTIONS } from '../src/index.js';

function parser() {
  return defineParser({ ...fullParser }).use(dateTimePlugin);
}

describe('dateTimePlugin', () => {
  it('declares a Plugin with the expected identity', () => {
    expect(dateTimePlugin.name).toBe('@pro-fa/expreszo-datetime');
    expect(dateTimePlugin.functions).toBeDefined();
    expect(dateTimePlugin.functions!.length).toBe(DATETIME_FUNCTIONS.length);
  });

  it('every descriptor is in the datetime category and safe', () => {
    for (const fn of DATETIME_FUNCTIONS) {
      expect(fn.category).toBe('datetime');
      expect(fn.safe).toBe(true);
      expect(fn.async).toBe(false);
    }
  });

  it('registers every function with parser.use()', () => {
    const p = parser();
    for (const fn of DATETIME_FUNCTIONS) {
      expect(p.functions[fn.name]).toBe(fn.impl);
    }
  });
});

describe('construction', () => {
  it('parseISO returns a DateTime', () => {
    const result = parser().evaluate("parseISO('2026-01-01T00:00:00Z')") as unknown as DateTime;
    expect(result instanceof DateTime).toBe(true);
    expect(result.toUTC().year).toBe(2026);
  });

  it('fromMillis builds a DateTime from a number', () => {
    const ms = Date.UTC(2026, 0, 1);
    const result = parser().evaluate(`fromMillis(${ms})`) as unknown as DateTime;
    expect(result.toUTC().year).toBe(2026);
  });

  it('now() and today() are non-pure (not constant-folded inside expressions)', () => {
    const a = parser().evaluate('now()') as unknown as DateTime;
    expect(a instanceof DateTime).toBe(true);
    const b = parser().evaluate('today()') as unknown as DateTime;
    expect(b instanceof DateTime).toBe(true);
    expect(b.hour).toBe(0);
    expect(b.minute).toBe(0);
  });
});

describe('arithmetic', () => {
  it('addDuration moves the date forward', () => {
    const r = parser().evaluate("addDuration('2026-01-01', 7, 'days')") as unknown as DateTime;
    expect(r.toISODate()).toBe('2026-01-08');
  });

  it('subtractDuration moves the date backward', () => {
    const r = parser().evaluate("subtractDuration('2026-01-08', 7, 'days')") as unknown as DateTime;
    expect(r.toISODate()).toBe('2026-01-01');
  });

  it('diff returns the unit-converted difference', () => {
    const r = parser().evaluate("diff('2026-01-08', '2026-01-01', 'days')") as number;
    expect(r).toBe(7);
  });

  it('startOf truncates to the requested unit', () => {
    const r = parser().evaluate("startOf(setZone('2026-04-15T13:45:30Z', 'utc'), 'month')") as unknown as DateTime;
    expect(r.toUTC().toISODate()).toBe('2026-04-01');
  });

  it('rejects unknown units', () => {
    expect(() => parser().evaluate("addDuration('2026-01-01', 1, 'fortnights')")).toThrow();
  });
});

describe('comparison', () => {
  it('isBefore / isAfter', () => {
    expect(parser().evaluate("isBefore('2026-01-01', '2026-01-02')")).toBe(true);
    expect(parser().evaluate("isAfter('2026-01-02', '2026-01-01')")).toBe(true);
  });

  it('isSame with no unit checks exact equality', () => {
    expect(parser().evaluate("isSame('2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')")).toBe(true);
    expect(parser().evaluate("isSame('2026-01-01T00:00:00Z', '2026-01-01T00:00:01Z')")).toBe(false);
  });

  it('isSame with a unit truncates before comparing', () => {
    expect(parser().evaluate("isSame('2026-01-01', '2026-01-31', 'month')")).toBe(true);
    expect(parser().evaluate("isSame('2026-01-01', '2026-02-01', 'month')")).toBe(false);
  });
});

describe('format and zone', () => {
  it('format applies a Luxon pattern', () => {
    expect(parser().evaluate("format('2026-01-08T00:00:00Z', 'yyyy-MM-dd')")).toBe('2026-01-08');
  });

  it('toISO renders ISO 8601', () => {
    const iso = parser().evaluate("toISO(parseISO('2026-01-01T00:00:00Z'))") as unknown as string;
    expect(iso.startsWith('2026-01-01')).toBe(true);
  });

  it('toMillis returns Unix milliseconds', () => {
    const expected = Date.UTC(2026, 0, 1);
    expect(parser().evaluate("toMillis('2026-01-01T00:00:00Z')")).toBe(expected);
  });
});

describe('inspection', () => {
  it('exposes calendar parts', () => {
    expect(parser().evaluate("year('2026-04-15T00:00:00Z')")).toBe(2026);
    expect(parser().evaluate("month('2026-04-15T00:00:00Z')")).toBe(4);
    expect(parser().evaluate("day('2026-04-15T00:00:00Z')")).toBe(15);
  });

  it('isWeekend recognises Saturday and Sunday', () => {
    // 2026-04-18 is a Saturday, 2026-04-19 a Sunday, 2026-04-20 a Monday.
    expect(parser().evaluate("isWeekend('2026-04-18')")).toBe(true);
    expect(parser().evaluate("isWeekend('2026-04-19')")).toBe(true);
    expect(parser().evaluate("isWeekend('2026-04-20')")).toBe(false);
  });

  it('isValid rejects garbage strings', () => {
    expect(parser().evaluate("isValid('not a date')")).toBe(false);
    expect(parser().evaluate("isValid('2026-01-01')")).toBe(true);
  });
});

// Core's `equal`/`notEqual` are valueOf-aware as of @pro-fa/expreszo 0.6.1,
// so two Luxon DateTime instances at the same instant compare equal via the
// existing `==` and `!=` operators. The plugin doesn't need to override
// anything — it just needs to be the source of the DateTime values.
describe('== and != on DateTime values via core operators', () => {
  it('two DateTimes at the same instant are ==', () => {
    expect(parser().evaluate("parseISO('2026-01-01') == parseISO('2026-01-01')")).toBe(true);
    expect(parser().evaluate("parseISO('2026-01-01') != parseISO('2026-01-01')")).toBe(false);
  });

  it('two DateTimes at different instants are !=', () => {
    expect(parser().evaluate("parseISO('2026-01-01') == parseISO('2026-01-02')")).toBe(false);
    expect(parser().evaluate("parseISO('2026-01-01') != parseISO('2026-01-02')")).toBe(true);
  });

  it('a Luxon DateTime equals an equivalent JS Date', () => {
    const ms = Date.UTC(2026, 0, 1);
    const jsDate = new Date(ms);
    expect(parser().evaluate("parseISO('2026-01-01T00:00:00Z') == d", { d: jsDate as unknown as never })).toBe(true);
  });

  it('relational operators continue to work as before', () => {
    expect(parser().evaluate("parseISO('2026-01-01') <  parseISO('2026-02-01')")).toBe(true);
    expect(parser().evaluate("parseISO('2026-02-01') >  parseISO('2026-01-01')")).toBe(true);
    expect(parser().evaluate("parseISO('2026-01-01') <= parseISO('2026-01-01')")).toBe(true);
    expect(parser().evaluate("parseISO('2026-01-01') >= parseISO('2026-01-01')")).toBe(true);
  });
});

describe('end-to-end pipeline', () => {
  it('chains construction, arithmetic, and formatting', () => {
    expect(
      parser().evaluate("format(addDuration('2026-01-01', 7, 'days'), 'yyyy-MM-dd')")
    ).toBe('2026-01-08');
  });
});
