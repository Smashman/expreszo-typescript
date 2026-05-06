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

**Construction**: `now`, `today`, `parseISO`, `parseDate`, `fromMillis`, `dateTime`
**Inspection**: `year`, `month`, `day`, `hour`, `minute`, `second`, `millisecond`, `dayOfWeek`, `dayOfYear`, `weekOfYear`, `daysInMonth`, `isWeekend`, `isValid`
**Arithmetic**: `addDuration`, `subtractDuration`, `startOf`, `endOf`, `diff`
**Comparison**: `isBefore`, `isAfter`, `isSame`
**Format / zone**: `format`, `toISO`, `toMillis`, `setZone`

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
