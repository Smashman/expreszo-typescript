import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import type { Values } from '@pro-fa/expreszo';
import { dateTimePlugin } from '../src/index.js';

const ISO  = '2026-01-01T00:00:00Z';
const MS   = Date.UTC(2026, 0, 1);
const D    = new Date(MS);
const DT   = DateTime.fromISO(ISO, { zone: 'utc' });

function evaluate(expr: string, vars: Record<string, unknown> = {}): unknown {
  return defineParser({ ...fullParser })
    .use(dateTimePlugin)
    .evaluate(expr, vars as Values);
}

describe('polymorphic inputs produce the same result', () => {
  it('addDuration accepts string, number, JS Date, and Luxon DateTime', () => {
    const expected = '2026-01-08';
    const fromString = evaluate(`addDuration('${ISO}', 7, 'days')`)        as DateTime;
    const fromMillis = evaluate('addDuration(ms, 7, \'days\')', { ms: MS }) as DateTime;
    const fromJSDate = evaluate('addDuration(d,  7, \'days\')', { d:  D })  as DateTime;
    const fromLuxon  = evaluate('addDuration(dt, 7, \'days\')', { dt: DT }) as DateTime;

    expect(fromString.toUTC().toISODate()).toBe(expected);
    expect(fromMillis.toUTC().toISODate()).toBe(expected);
    expect(fromJSDate.toUTC().toISODate()).toBe(expected);
    expect(fromLuxon .toUTC().toISODate()).toBe(expected);
  });

  it('format accepts every input shape', () => {
    const pattern = "'yyyy-MM-dd'";
    expect(evaluate(`format('${ISO}', ${pattern})`)).toBe('2026-01-01');
    expect(evaluate(`format(ms, ${pattern})`, { ms: MS })).toBe('2026-01-01');
    expect(evaluate(`format(d,  ${pattern})`, { d:  D })).toBe('2026-01-01');
    expect(evaluate(`format(dt, ${pattern})`, { dt: DT })).toBe('2026-01-01');
  });
});
