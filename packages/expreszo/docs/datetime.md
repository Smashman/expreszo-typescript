# Date / Time functions

> **Audience:** People writing ExpresZo expressions and want to do date arithmetic, formatting, parsing, or comparisons.

These ~70 functions cover everything from "what day of the week is this?" to "how many business days until Christmas?". They are exposed by an **optional package** — if `now()`, `format()`, `daysUntil()` and friends don't work in your environment, ask whoever set up your parser to install [`@pro-fa/expreszo-datetime`](https://www.npmjs.com/package/@pro-fa/expreszo-datetime). Integration details for developers live on the [Date / Time integration](datetime-integration.md) page.

## What kind of value is a "date"?

Anywhere these functions ask for a date, you can pass any of:

- A function-produced date (the result of `now()`, `today()`, `parseISO('…')`, `addDuration(…)`, etc.)
- An **ISO 8601 string** like `'2026-01-15'` or `'2026-01-15T13:45:30Z'`
- A variable that someone passed into the parser as a JS `Date` or a Luxon `DateTime`
- A **Unix millisecond** number from another system

Functions that **produce** a date give you back something you can pass straight into the next function — chains just work:

```
format(addDuration('2026-01-01', 7, 'days'), 'yyyy-MM-dd')
// => '2026-01-08'
```

Functions that produce a string (`format`, `toISO`, `toRelative`) or a number (`year`, `diff`, `toMillis`) return that shape directly.

## Function reference

### Construction

| Function | Returns | Description |
|---|---|---|
| `now()` | `DateTime` | Current date and time. |
| `today()` | `DateTime` | Start of the current day (local zone). |
| `yesterday()` | `DateTime` | Start of yesterday in the local zone. |
| `tomorrow()` | `DateTime` | Start of tomorrow in the local zone. |
| `parseISO(iso)` | `DateTime` | Parse an ISO 8601 string. |
| `parseDate(input, format, zone?)` | `DateTime` | Parse using a [Luxon format token](https://moment.github.io/luxon/#/parsing?id=table-of-tokens). Optional IANA zone (e.g. `'America/New_York'`). |
| `fromMillis(ms)` | `DateTime` | Build from a Unix millisecond timestamp. |
| `fromUnix(seconds)` | `DateTime` | Build from a Unix **seconds** timestamp. Companion to `toUnix`. |
| `dateTime(year, month, day, hour?, minute?, second?)` | `DateTime` | Build from numeric components. Time fields default to `0`. |
| `date(year, month, day)` | `DateTime` | Sugar for `dateTime(y, m, d)` with no time. |
| `time(hour, minute, second?, millisecond?)` | `DateTime` | Today at the given clock time. |

```
parseISO('2026-01-15T13:45:30Z')
parseDate('15/01/2026', 'dd/MM/yyyy')
parseDate('2026-01-15 13:45', 'yyyy-MM-dd HH:mm', 'America/New_York')
dateTime(2026, 1, 15)
dateTime(2026, 1, 15, 13, 45, 30)
date(2026, 1, 15)
time(13, 45)
fromUnix(1767225600)
```

### Inspection — calendar parts

| Function | Returns | Description |
|---|---|---|
| `year(d)` | `number` | Calendar year. |
| `month(d)` | `number` | Month, 1–12. |
| `day(d)` | `number` | Day of month, 1–31. |
| `hour(d)` | `number` | Hour, 0–23. |
| `minute(d)` | `number` | Minute, 0–59. |
| `second(d)` | `number` | Second, 0–59. |
| `millisecond(d)` | `number` | Millisecond, 0–999. |
| `quarter(d)` | `number` | Calendar quarter, 1–4. |
| `dayOfWeek(d)` | `number` | Weekday number, 1 (Monday) – 7 (Sunday). |
| `dayOfYear(d)` | `number` | Ordinal day of the year, 1–365 (or 366 in leap years). |
| `weekOfYear(d)` | `number` | ISO week number, 1–53. |
| `isoWeekYear(d)` | `number` | ISO week-numbering year (may differ from calendar year around Jan 1 / Dec 31). |
| `daysInMonth(d)` | `number` | Number of days in the month containing `d`. |
| `daysInYear(d)` | `number` | 365 or 366. |
| `weeksInYear(d)` | `number` | 52 or 53. |
| `offsetMinutes(d)` | `number` | UTC offset in minutes. |
| `offsetHours(d)` | `number` | UTC offset in hours, fractional. |
| `zoneName(d)` | `string` | IANA zone name (e.g. `'America/New_York'`). |
| `isLeapYear(d)` | `boolean` | Whether `d`'s year is a leap year. |
| `isDST(d)` | `boolean` | True if `d` is in daylight saving in its zone. |
| `isWeekend(d)` | `boolean` | `true` for Saturday or Sunday. |
| `isWeekday(d)` | `boolean` | Opposite of `isWeekend`. |
| `isValid(d)` | `boolean` | `true` if the value is recognisable as a valid date. |

```
year('2026-01-15')          // 2026
quarter('2026-04-15')       // 2
dayOfWeek('2026-01-15')     // 4 (Thursday)
isWeekend('2026-01-17')     // true
isValid('not a date')       // false
```

### Inspection — relative-to-now predicates

These compare a date to right now, in the local zone.

| Function | Returns | Description |
|---|---|---|
| `isToday(d)` | `boolean` | Same calendar day as today. |
| `isYesterday(d)` | `boolean` | Falls on yesterday. |
| `isTomorrow(d)` | `boolean` | Falls on tomorrow. |
| `isThisWeek(d)` | `boolean` | Same ISO week as today. |
| `isThisMonth(d)` | `boolean` | Same calendar month as today. |
| `isThisYear(d)` | `boolean` | Same calendar year as today. |
| `isInPast(d)` | `boolean` | Strictly before now. |
| `isInFuture(d)` | `boolean` | Strictly after now. |
| `age(d)` | `number` | Whole years from `d` to now, floored. Returns `0` for future dates. |

### Arithmetic

The `unit` argument accepts singular or plural form:
`'year'(s)`, `'quarter'(s)`, `'month'(s)`, `'week'(s)`, `'day'(s)`, `'hour'(s)`, `'minute'(s)`, `'second'(s)`, `'millisecond'(s)`.

| Function | Returns | Description |
|---|---|---|
| `addDuration(d, amount, unit)` | `DateTime` | `d + amount unit`. |
| `subtractDuration(d, amount, unit)` | `DateTime` | `d - amount unit`. |
| `startOf(d, unit)` | `DateTime` | Truncate `d` to the start of `unit` (e.g. start of the month). |
| `endOf(d, unit)` | `DateTime` | The last instant inside `unit`. |
| `diff(a, b, unit)` | `number` | `a - b`, expressed as the number of `unit`s. May be negative or fractional. |
| `clampDate(d, low, high)` | `DateTime` | Clamp `d` into `[low, high]`. |
| `minDate(d1, d2, …)` | `DateTime` | Earliest of N dates. |
| `maxDate(d1, d2, …)` | `DateTime` | Latest of N dates. |

```
addDuration('2026-01-01', 7, 'days')      // DateTime for 2026-01-08
subtractDuration(now(), 1, 'month')       // DateTime one month ago
startOf('2026-04-15T13:45:30Z', 'month')  // DateTime for the first of April
diff('2026-01-08', '2026-01-01', 'days')  // 7
```

### Comparison

| Function | Returns | Description |
|---|---|---|
| `isBefore(a, b)` | `boolean` | `a < b`. |
| `isAfter(a, b)` | `boolean` | `a > b`. |
| `isSame(a, b, unit?)` | `boolean` | Strict equality on the millisecond, or — when `unit` is supplied — equality after truncating both to that unit. |
| `isBetween(d, start, end, inclusive?)` | `boolean` | Whether `d` falls in `[start, end]`. `inclusive` defaults to `true`. |
| `compareDates(a, b)` | `number` | `-1` / `0` / `1`. |
| `overlapsRange(s1, e1, s2, e2)` | `boolean` | Whether two intervals overlap. |
| `containsDate(start, end, d)` | `boolean` | Whether `d` falls inside `[start, end]`. |

```
isBefore('2026-01-01', '2026-01-02')             // true
isSame('2026-01-01', '2026-01-31', 'month')      // true
isBetween('2026-01-15', '2026-01-01', '2026-01-31') // true
overlapsRange('2026-01-01', '2026-01-10',
              '2026-01-05', '2026-01-15')        // true
```

### Range / sequence

Range helpers use a half-open `[start, end)` interval — the count is 0 when `start == end`, and `dateRange` does not include the upper bound.

| Function | Returns | Description |
|---|---|---|
| `dateRange(start, end, unit, step?)` | `DateTime[]` | Array of dates from `start` to `end` stepping by `step` `unit`s (default 1). |
| `businessDaysBetween(start, end)` | `number` | Count of weekdays (Mon–Fri) in `[start, end)`. |
| `weekdaysBetween(start, end, weekdayNum)` | `number` | Count of a given weekday (1=Mon … 7=Sun) in `[start, end)`. |

```
dateRange('2026-01-01', '2026-01-04', 'days')      // 3 dates: 1, 2, 3 Jan
dateRange('2026-01-01', '2026-01-10', 'days', 3)   // 1, 4, 7 Jan
businessDaysBetween('2026-01-05', '2026-01-12')    // 5 (Mon–Fri of that week)
weekdaysBetween('2026-01-05', '2026-02-02', 1)     // 4 Mondays
```

### Distance from now

These return whole-unit integers, **truncated toward zero**. Negative for the past, positive for the future.

| Function | Returns | Description |
|---|---|---|
| `daysUntil(d)` | `number` | Whole days from now to `d`. |
| `daysSince(d)` | `number` | Whole days from `d` to now. |
| `hoursUntil(d)` | `number` | Hours version. |
| `hoursSince(d)` | `number` | Hours version. |
| `minutesUntil(d)` | `number` | Minutes version. |
| `minutesSince(d)` | `number` | Minutes version. |

### Format and zone

| Function | Returns | Description |
|---|---|---|
| `format(d, pattern)` | `string` | Format using a [Luxon format token](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) (e.g. `'yyyy-MM-dd'`, `'EEE, MMM d'`). |
| `toISO(d)` | `string` | ISO 8601 representation. |
| `toMillis(d)` | `number` | Unix millisecond timestamp. |
| `toUnix(d)` | `number` | Unix **seconds** timestamp (whole number). Companion to `fromUnix`. |
| `toRelative(d, base?)` | `string` | `"in 5 minutes"` / `"3 days ago"`. Locale-aware. Base defaults to now. |
| `toRelativeCalendar(d, base?)` | `string` | Calendar-style relative (`"yesterday"`, `"tomorrow"`, `"in 3 days"`). |
| `setZone(d, zone)` | `DateTime` | Reinterpret in an IANA zone (e.g. `'utc'`, `'Europe/Amsterdam'`). |
| `toUTC(d)` | `DateTime` | Sugar for `setZone(d, 'utc')`. |
| `toLocal(d)` | `DateTime` | Sugar for `setZone(d, 'local')`. |

```
format('2026-01-08T00:00:00Z', 'yyyy-MM-dd')         // '2026-01-08'
format(now(), 'EEE, MMM d, yyyy')                    // e.g. 'Wed, May 6, 2026'
toRelative('2026-01-01')                             // e.g. '4 months ago'
toMillis('2026-01-01T00:00:00Z')                     // 1767225600000
setZone('2026-01-01T00:00:00Z', 'America/New_York')  // DateTime in NY zone
```

## Recipes

### "How many days until the end of the month?"

```
diff(endOf(today(), 'month'), today(), 'days')
```

### "Format a millisecond timestamp from another system"

```
format(fromMillis(eventMs), 'yyyy-MM-dd HH:mm')
```

### "Did this date fall on a weekend?"

```
isWeekend(orderDate)
```

### "Round a timestamp down to the nearest hour"

```
startOf(eventTs, 'hour')
```

### "Was the event in the same calendar week as today?"

```
isSame(eventDate, today(), 'week')
```

### "Was this order placed this month?"

```
isThisMonth(orderDate)
```

### "How many days until the deadline?"

```
daysUntil(deadline)
```

### "Friendly relative timestamp for a comment"

```
toRelative(commentTs)            // "3 hours ago"
toRelativeCalendar(commentTs)    // "today" / "yesterday" / "last Monday"
```

### "Does the user's order fall inside the promotion window?"

```
containsDate(promotionStart, promotionEnd, orderDate)
```

### "Earliest of three candidate ship dates"

```
minDate(estimatedShip, requestedShip, contractedShip)
```

---

Need to wire these into your own parser? See [Date / Time integration](datetime-integration.md).
