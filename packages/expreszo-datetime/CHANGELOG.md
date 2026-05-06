# Changelog

All notable changes to `@pro-fa/expreszo-datetime` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.2.0

### Added

42 new functions, bringing the total to ~72.

- **Construction:** `yesterday`, `tomorrow`, `date`, `time`, `fromUnix`.
- **Inspection — calendar parts:** `quarter`, `isoWeekYear`, `isLeapYear`, `daysInYear`, `weeksInYear`, `isDST`, `offsetMinutes`, `offsetHours`, `zoneName`, `isWeekday`.
- **Inspection — relative-to-now:** `isToday`, `isYesterday`, `isTomorrow`, `isThisWeek`, `isThisMonth`, `isThisYear`, `isInPast`, `isInFuture`, `age`.
- **Arithmetic:** `clampDate`, `minDate` (variadic), `maxDate` (variadic).
- **Comparison:** `isBetween`, `compareDates`, `overlapsRange`, `containsDate`.
- **Range / sequence:** `dateRange`, `businessDaysBetween`, `weekdaysBetween` — all use a half-open `[start, end)` interval.
- **Distance from now:** `daysUntil`, `daysSince`, `hoursUntil`, `hoursSince`, `minutesUntil`, `minutesSince`. Whole numbers, truncated toward zero.
- **Formatting / zone:** `toRelative`, `toRelativeCalendar`, `toUnix`, `toUTC`, `toLocal`.

### Notes

- Relative-to-now predicates (`isToday`, `isThisWeek`, …, `daysUntil`, …) are marked `pure: false` because their result depends on `DateTime.now()`. The simplifier won't constant-fold calls to them.
- Relative-to-now predicates use the **local zone** by default. Convert with `setZone(d, 'utc')` first if you need UTC truth.
- `fromUnix` / `toUnix` deal in **whole seconds**. Use `fromMillis` / `toMillis` if you need sub-second precision.

## 0.1.0

Initial release. 30 Luxon-backed datetime functions exposed via the `dateTimePlugin` for `parser.use(...)` and the `withDateTime` ParserPreset.
