# @pro-fa/expreszo-datetime

Optional [Luxon](https://moment.github.io/luxon/)-backed date/time functions for [`@pro-fa/expreszo`](../expreszo).

The core `@pro-fa/expreszo` package never depends on Luxon. Install this companion only when your expressions need date math.

## Install

```bash
npm install @pro-fa/expreszo @pro-fa/expreszo-datetime
```

## Usage

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { dateTimePlugin }            from '@pro-fa/expreszo-datetime';

const parser = defineParser({ ...fullParser })
  .use(dateTimePlugin);

parser.parse("format(addDuration(now(), 7, 'days'), 'yyyy-MM-dd')").evaluate();
```

## Polymorphic inputs

Every datetime function accepts any of these shapes for date arguments and normalises internally:

- A Luxon `DateTime`
- A JavaScript `Date`
- An ISO 8601 string (`'2026-01-01T00:00:00Z'`)
- A millisecond Unix timestamp

Functions that produce a date return a Luxon `DateTime` — chain freely:

```ts
parser.parse("format(addDuration('2026-01-01', 7, 'days'), 'yyyy-MM-dd')").evaluate();
// => '2026-01-08'
```

## Function reference

~70 functions across the categories below. Full reference with examples in the [Date / Time docs page](https://pro-fa.github.io/expreszo-typescript/datetime/).

- **Construction**: `now`, `today`, `yesterday`, `tomorrow`, `parseISO`, `parseDate`, `fromMillis`, `fromUnix`, `dateTime`, `date`, `time`
- **Inspection — calendar parts**: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `quarter`, `dayOfWeek`, `dayOfYear`, `weekOfYear`, `isoWeekYear`, `daysInMonth`, `daysInYear`, `weeksInYear`, `offsetMinutes`, `offsetHours`, `zoneName`, `isLeapYear`, `isDST`, `isWeekend`, `isWeekday`, `isValid`
- **Inspection — relative-to-now**: `isToday`, `isYesterday`, `isTomorrow`, `isThisWeek`, `isThisMonth`, `isThisYear`, `isInPast`, `isInFuture`, `age`
- **Arithmetic**: `addDuration`, `subtractDuration`, `startOf`, `endOf`, `diff`, `clampDate`, `minDate`, `maxDate`
- **Comparison**: `isBefore`, `isAfter`, `isSame`, `isBetween`, `compareDates`, `overlapsRange`, `containsDate`
- **Range / sequence**: `dateRange`, `businessDaysBetween`, `weekdaysBetween`
- **Distance from now**: `daysUntil`, `daysSince`, `hoursUntil`, `hoursSince`, `minutesUntil`, `minutesSince`
- **Format / zone**: `format`, `toISO`, `toMillis`, `toUnix`, `toRelative`, `toRelativeCalendar`, `setZone`, `toUTC`, `toLocal`

`unit` arguments accept `'year'(s)`, `'quarter'(s)`, `'month'(s)`, `'week'(s)`, `'day'(s)`, `'hour'(s)`, `'minute'(s)`, `'second'(s)`, `'millisecond'(s)` — same vocabulary Luxon uses.

## Spread-into-`defineParser` form

If you prefer the legacy preset composition:

```ts
import { defineParser, fullParser } from '@pro-fa/expreszo';
import { withDateTime }              from '@pro-fa/expreszo-datetime';

const parser = defineParser({
  operators: [...fullParser.operators],
  functions: [...fullParser.functions, ...withDateTime.functions]
});
```
