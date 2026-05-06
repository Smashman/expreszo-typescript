import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin } from '../src/index.js';

function parser() {
  return defineParser({ ...fullParser }).use(dateTimePlugin);
}

const FIXED_NOW = new Date('2026-04-15T12:00:00Z');

describe('distance-from-now helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('daysUntil returns positive integers for future dates', () => {
    expect(parser().evaluate("daysUntil('2026-04-20T12:00:00Z')")).toBe(5);
  });

  it('daysUntil returns negative integers for past dates', () => {
    expect(parser().evaluate("daysUntil('2026-04-10T12:00:00Z')")).toBe(-5);
  });

  it('daysSince inverts daysUntil', () => {
    expect(parser().evaluate("daysSince('2026-04-10T12:00:00Z')")).toBe(5);
    expect(parser().evaluate("daysSince('2026-04-20T12:00:00Z')")).toBe(-5);
  });

  it('hoursUntil and hoursSince', () => {
    expect(parser().evaluate("hoursUntil('2026-04-15T18:00:00Z')")).toBe(6);
    expect(parser().evaluate("hoursSince('2026-04-15T06:00:00Z')")).toBe(6);
  });

  it('minutesUntil and minutesSince', () => {
    expect(parser().evaluate("minutesUntil('2026-04-15T12:30:00Z')")).toBe(30);
    expect(parser().evaluate("minutesSince('2026-04-15T11:30:00Z')")).toBe(30);
  });

  it('truncates fractional values toward zero', () => {
    // 2026-04-15T18:30 is 6.5 hours away → trunc to 6
    expect(parser().evaluate("hoursUntil('2026-04-15T18:30:00Z')")).toBe(6);
    // 2026-04-15T05:30 is 6.5 hours past → trunc to 6
    expect(parser().evaluate("hoursSince('2026-04-15T05:30:00Z')")).toBe(6);
  });
});
