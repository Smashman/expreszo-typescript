# Date / Time

> **Audience:** Developers who want to do date arithmetic, formatting, parsing, or comparisons inside an ExpresZo expression.

The core `@pro-fa/expreszo` ships with no date/time functions — dates are not part of the value type system. Date support lives in an **optional companion package**, [`@pro-fa/expreszo-datetime`](https://www.npmjs.com/package/@pro-fa/expreszo-datetime), which adds ~30 functions backed by [Luxon](https://moment.github.io/luxon/). Install only when your expressions need it; the core stays Luxon-free.

## Install

```bash
npm install @pro-fa/expreszo @pro-fa/expreszo-datetime
```

`@pro-fa/expreszo` is a peer dependency of `@pro-fa/expreszo-datetime`. `luxon` is a regular dependency and is pulled in transitively.

## Quick start

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';

const parser = defineParser({ ...fullParser })
  .use(dateTimePlugin);

parser.parse("format(addDuration('2026-01-01', 7, 'days'), 'yyyy-MM-dd')").evaluate();
// => '2026-01-08'
```

`parser.use(plugin)` is the friendly registration entry point — see the [Parser](parser.md#using-plugins) docs for full semantics.

## Polymorphic inputs

Every datetime function accepts any of these shapes for date arguments:

| Shape | Example |
| --- | --- |
| Luxon `DateTime` | `DateTime.fromISO('2026-01-01')` |
| JavaScript `Date` | `new Date('2026-01-01')` |
| ISO 8601 string | `'2026-01-01T00:00:00Z'` |
| Unix millisecond number | `1767225600000` |

A single `toDateTime()` helper normalises at the boundary, so you can mix and match within a chain:

```ts
parser.parse("format(addDuration(d, 7, 'days'), 'yyyy-MM-dd')")
  .evaluate({ d: new Date('2026-01-01') });
// => '2026-01-08'
```

Functions that **produce** a date return a Luxon `DateTime` so chains stay efficient — no repeated parse/format. Functions that produce text (`format`, `toISO`) return strings; functions that return numeric or boolean facts return those shapes directly.

## Function reference

### Construction

| Function | Returns | Description |
|---|---|---|
| `now()` | `DateTime` | Current date and time. |
| `today()` | `DateTime` | Start of the current day (local zone). |
| `parseISO(iso)` | `DateTime` | Parse an ISO 8601 string. |
| `parseDate(input, format, zone?)` | `DateTime` | Parse using a [Luxon format token](https://moment.github.io/luxon/#/parsing?id=table-of-tokens). Optional IANA zone (e.g. `'America/New_York'`). |
| `fromMillis(ms)` | `DateTime` | Build from a Unix millisecond timestamp. |
| `dateTime(year, month, day, hour?, minute?, second?)` | `DateTime` | Build from numeric components. Time fields default to `0`. |

```
parseISO('2026-01-15T13:45:30Z')
parseDate('15/01/2026', 'dd/MM/yyyy')
parseDate('2026-01-15 13:45', 'yyyy-MM-dd HH:mm', 'America/New_York')
dateTime(2026, 1, 15)
dateTime(2026, 1, 15, 13, 45, 30)
```

### Inspection

All inspectors accept any input shape and return a number or boolean.

| Function | Returns | Description |
|---|---|---|
| `year(d)` | `number` | Calendar year. |
| `month(d)` | `number` | Month, 1–12. |
| `day(d)` | `number` | Day of month, 1–31. |
| `hour(d)` | `number` | Hour, 0–23. |
| `minute(d)` | `number` | Minute, 0–59. |
| `second(d)` | `number` | Second, 0–59. |
| `millisecond(d)` | `number` | Millisecond, 0–999. |
| `dayOfWeek(d)` | `number` | Weekday number, 1 (Monday) – 7 (Sunday). |
| `dayOfYear(d)` | `number` | Ordinal day of the year, 1–365 (or 366 in leap years). |
| `weekOfYear(d)` | `number` | ISO week number, 1–53. |
| `daysInMonth(d)` | `number` | Number of days in the month containing `d`. |
| `isWeekend(d)` | `boolean` | `true` for Saturday or Sunday. |
| `isValid(d)` | `boolean` | `true` if the value is recognisable as a valid date in any accepted shape. |

```
year('2026-01-15')          // 2026
dayOfWeek('2026-01-15')     // 4 (Thursday)
isWeekend('2026-01-17')     // true
isValid('not a date')       // false
```

### Arithmetic

The `unit` argument accepts the same vocabulary Luxon uses, in singular or plural form:
`'year'(s)`, `'quarter'(s)`, `'month'(s)`, `'week'(s)`, `'day'(s)`, `'hour'(s)`, `'minute'(s)`, `'second'(s)`, `'millisecond'(s)`.

| Function | Returns | Description |
|---|---|---|
| `addDuration(d, amount, unit)` | `DateTime` | `d + amount unit`. |
| `subtractDuration(d, amount, unit)` | `DateTime` | `d - amount unit`. |
| `startOf(d, unit)` | `DateTime` | Truncate `d` to the start of `unit` (e.g. start of the month). |
| `endOf(d, unit)` | `DateTime` | The last instant inside `unit`. |
| `diff(a, b, unit)` | `number` | `a - b`, expressed as the number of `unit`s. May be negative or fractional. |

```
addDuration('2026-01-01', 7, 'days')     // DateTime for 2026-01-08
subtractDuration(now(), 1, 'month')      // DateTime one month ago
startOf('2026-04-15T13:45:30Z', 'month') // DateTime for the first of April
diff('2026-01-08', '2026-01-01', 'days') // 7
diff('2026-01-08', '2026-01-01', 'hours') // 168
```

### Comparison

| Function | Returns | Description |
|---|---|---|
| `isBefore(a, b)` | `boolean` | `a < b`. |
| `isAfter(a, b)` | `boolean` | `a > b`. |
| `isSame(a, b, unit?)` | `boolean` | Strict equality on the millisecond, or — when `unit` is supplied — equality after truncating both to that unit. |

```
isBefore('2026-01-01', '2026-01-02')             // true
isSame('2026-01-01', '2026-01-31', 'month')      // true
isSame('2026-01-01', '2026-02-01', 'month')      // false
```

### Format and zone

| Function | Returns | Description |
|---|---|---|
| `format(d, pattern)` | `string` | Format using a [Luxon format token](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) (e.g. `'yyyy-MM-dd'`, `'EEE, MMM d'`). |
| `toISO(d)` | `string` | ISO 8601 representation. |
| `toMillis(d)` | `number` | Unix millisecond timestamp. |
| `setZone(d, zone)` | `DateTime` | Reinterpret in an IANA zone (e.g. `'utc'`, `'Europe/Amsterdam'`). |

```
format('2026-01-08T00:00:00Z', 'yyyy-MM-dd')           // '2026-01-08'
format(now(), 'EEE, MMM d, yyyy')                      // e.g. 'Wed, May 6, 2026'
toISO(addDuration('2026-01-01', 7, 'days'))            // '2026-01-08T00:00:00.000Z'
toMillis('2026-01-01T00:00:00Z')                       // 1767225600000
setZone('2026-01-01T00:00:00Z', 'America/New_York')    // DateTime in NY zone
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

## Spread-into-`defineParser` form

`parser.use(plugin)` is the recommended path, but the package also exports a `ParserPreset` for callers who prefer the spread-composition style:

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { withDateTime }              from '@pro-fa/expreszo-datetime';

const parser = defineParser({
  operators: [...fullParser.operators],
  functions: [...fullParser.functions, ...withDateTime.functions]
});
```

Both forms produce the same parser; pick whichever fits the rest of your codebase.

## Source

- Package: [`@pro-fa/expreszo-datetime`](https://www.npmjs.com/package/@pro-fa/expreszo-datetime)
- Source: [`packages/expreszo-datetime/src/`](https://github.com/Pro-Fa/expreszo-typescript/tree/main/packages/expreszo-datetime/src)
