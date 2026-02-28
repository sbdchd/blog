---
layout: post
title: "Postgres Column Naming"
description: Where "?column?" comes from
---

This is a follow-up to [Interesting Bits of Postgres Grammar]({% post_url 2025-06-20-interesting-bits-of-postgres-grammar %}).

Since then, I've been continuing my work on the [Squawk](https://github.com/sbdchd/squawk) language server and column naming became one of the many rabbit holes.

## Overview

If you label your columns with an alias, `select 1 as id`, then the name is obvious.

Postgres' behavior gets more complicated once you start leaving off labels.

## Examples

### Values

Without an alias, Postgres is happy to assign the column names for you.

For each column, Postgres uses the format `column{column_number}` where `column_number` is 1-indexed.

```sql
values (1, 2), (3, 4);
```

| column1 | column2 |
| ------- | ------- |
| 1       | 2       |
| 3       | 4       |

### Rows

Always called `row`:

```sql
select (1, 2, 3), row(4, 5, 6);
```

| row     | row     |
| ------- | ------- |
| (1,2,3) | (4,5,6) |

### Case Expressions

`case` is used for the column name.

```sql
select case
  when true then
    1
  end;
```

| case |
| ---- |
| 1    |

But if we have an `else` clause and the expression in that clause has a name, then we use that for the output column.

```sql
select case
  when true then
    1
  else
    random()
  end;
```

| random |
| ------ |
| 1      |

But when we have an unnamed expression in the `else`, we still get `case` as the column name.

```sql
select case
  when true then
    1
  else
    2
  end;
```

| case |
| ---- |
| 1    |

### Expressions

If you run a simple select statement:

```sql
select 1;
```

the column you get back is:

```sql
"?column?"
```

This is the inferred column name for expressions when there isn't a "better" one.

And even though it looks a little odd, you can use it in your queries like any other name:

```sql
with x as (select 1)
select "?column?" from x;
```

| ?column? |
| -------- |
| 1        |

### Composite Types

Composite types always use the field name as the column name:

```sql
create type employee as (name text, species text);
with team as (
  select 1 id, ('Piglet', 'Pig')::employee member
)
select (member).name, (member).species from team;
```

| name   | species |
| ------ | ------- |
| Piglet | Pig     |

### Functions

When calling a function, Postgres uses the function name:

```sql
select random();
```

| random              |
| ------------------- |
| 0.33110471315863976 |

But if your function is nested in another expression, then the function name is ignored:

```sql
select random() + random();
```

| ?column?           |
| ------------------ |
| 1.8801120515159815 |

There are caveats to this. Some functions in the Postgres grammar are [translated by the parser into an underlying Postgres function](https://github.com/postgres/postgres/blob/aecc558666ad62fbecb08ff7af1394656811a581/src/backend/parser/gram.y#L16181-L16210).

```sql
select trim('  hi  ');
```

| btrim |
| ----- |
| hi    |

Additionally, some operators get translated by the Postgres parser into function calls:

```sql
select 'foo' is normalized;
```

| is_normalized |
| ------------- |
| TRUE          |

```sql
select collation for ('foo');
-- pg_collation_for
```

| pg_collation_for |
| ---------------- |
| NULL             |

### Casts

The destination type is used as the column name, unless the expression being cast already has a name:

```sql
select cast(1 as int8);
```

| int8 |
| ---- |
| 1    |

```sql
with t as (select 1 a)
select a::int8 from t;
```

| a   |
| --- |
| 1   |

In the case of casting to an array, the element type of the array is used:

```sql
select '{1,2,3}'::int4[];
```

| int4    |
| ------- |
| {1,2,3} |

Additionally, like with functions and operators, Postgres will translate SQL types into Postgres specific types during parsing.

So in the following, we get `timetz` as the column:

```sql
select cast('12:00:00' as time(6) with time zone);
```

| timetz      |
| ----------- |
| 12:00:00-05 |

This behavior occurs for [many other types:](https://github.com/sbdchd/squawk/blob/c1f6c7c499ec1d0de475c14d73a017ad149841ec/crates/squawk_ide/src/column_name.rs#L501-L642)

| sql type                         | postgres type |
| -------------------------------- | ------------- |
| `bigint`                         | `int8`        |
| `int`/`integer`                  | `int4`        |
| `smallint`                       | `int2`        |
| `double precision`               | `float8`      |
| `real`                           | `float4`      |
| `decimal`                        | `numeric`     |
| `boolean`                        | `bool`        |
| `char`/`character`               | `bpchar`      |
| `char varying/character varying` | `varchar`     |
| `bit varying`                    | `varbit`      |
| `time(6) without time zone`      | `time`        |
| `time(6) with time zone`         | `timetz`      |
| `timestamp(6) without time zone` | `timestamp`   |
| `timestamp(6) with time zone`    | `timestamptz` |

## Conclusion

Without an explicit label/alias, it's hard to know what Postgres will call a column, so label your columns!
