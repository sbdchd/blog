---
layout: post
title: "Surprises in Postgres SQL"
description: "The many ways to do things"
---

## Overview

Postgres has a lot of features and behavior that's not obvious.

## Aliases Don't Mask Extra Columns

If the table alias has fewer columns than the source table, the extra columns
are still passed through.

```sql
with t as (
  select 1 a, 2 b, 3 c
)
select * from t as u (x, y)
```

```
| x  | y  | c  |
| -- | -- | -- |
| 1  | 2  | 3  |
```

We renamed `a` and `b`, but `c` remains untouched.

## Table or Column?

```sql
select u from u;
```

We don't actually know whether `u` in the `select` clause above is a table or a column.

If the table `u` has a column `u`:

```sql
create table u (u text);
```

Then we're selecting a column.

But if the table doesn't have a column named `u`:

```sql
create table u (a text);
```

Then we're selecting the table itself as a row.

```
| u       |
| ------- |
| (1,2,3) |
```

## Function Call Expression and Column Calling

There are multiple ways to call functions and select columns in Postgres.

With a table like:

```sql
create table t (a text);
```

We can query column `a` as we might expect:

```sql
select a from t;
-- we can also add the table name:
select t.a from t;
```

But we can also swap things around and select column `a` via the function syntax:

```sql
select a(t) from t;
```

Conversely, with a function defined as:

```sql
create function d(t) returns text
  as 'select 1'
  language sql;
```

We can call that function via the column style syntax:

```sql
select t.d from t;
-- which is the same as
select d(t) from t;
```

Note: In the case of conflicts, columns win when using the column style syntax, and
functions win when using the function style.

## Casts

There are two main types of casts, the SQL standard:

```sql
select cast('1' as bigint);

-- Postgres also allows:
select treat('1' as bigint);
```

And the more concise, Postgres specific syntax:

```sql
select '1'::bigint;
```

But there's also the leading type syntax:

```sql
select bigint '1';
```

Which is equivalent to a function call:

```sql
select "bigint"('1');
```

Squawk has [quick fixes to convert](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/code_actions/rewrite_cast_to_double_colon.rs#L1-L1) [between cast styles](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/code_actions/rewrite_double_colon_to_cast.rs#L1-L1).

Note: the `::` style is more concise and preferred.

## Composite types

Composite types are very similar to tables in Postgres and are defined as follows:

```sql
create type employee as (
  name text,
  species text
);

with team as (
  select 1 id, ('Piglet', 'Pig')::employee member
)
select (member).name, (member).species from team;
```

Under the hood, `create table` also creates a composite type, so the following works:

```sql
create table employee (
  name text,
  species text
);

with team as (
  select 1 id, ('Eeyore', 'Donkey')::employee member
)
select (member).name, (member).species from team;
```

And when you try to `drop type employee` that you created via `create table`, Postgres will return an error:

```
Query 1 ERROR at Line 1: : ERROR:  cannot drop type employee because table employee requires it
HINT:  You can drop table employee instead.
```

## Table Returns In Functions

Along with your bog standard types like `text`, `int8`, and `float`, functions can also return tables:

```sql
create function dup(int) returns table (f1 int, f2 text)
  as $$select $1, cast($1 as text)$$
  language sql;

select (dup(42)).f2;
```

### Aside: Parameters Are 1-Indexed

As we see in the above function definition, to access the first positional arg we use the `$1` parameter.

Using named args avoids this:

```sql
create function dup(input int) returns table (f1 int, f2 text)
  as $$
  select input, cast(input as text)
$$
  language sql;

select (dup(42)).f2;
-- or
select (dup(input => 42)).f2;
-- or
select (dup(input := 42)).f2;
```

## Table vs Select \*

A shorthand for `select * from table` can be written via the `table` statement.

```sql
table t;
-- is equivalent to
select * from t;
```

Squawk ships with a [quick fix](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/code_actions/rewrite_table_as_select.rs) to convert [between the two](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/code_actions/rewrite_select_as_table.rs#L1-L1).

## Minimal select

Oftentimes you'll see heartbeat requests with `select 1`, but you can get even more minimal, just:

```sql
select
```

No need for an argument, but you don't get back any columns.

```sql
select count(*) from (select);
```

```
| count |
| ----- |
| 1     |
```

## char vs "char"

```sql
select pg_typeof('1'::"char");
-- "char"
select pg_typeof('1'::char);
-- character
```

`char` is an abbreviation for [`character` which maps to `bpchar`](https://www.postgresql.org/docs/18/datatype-character.html).

Ultimately it's outdated and you should just use `text`.

On the other hand, `"char"` (note the quotes) only stores 1 byte. If you have
more than 1 character in your string when casting to `"char"`, Postgres takes
the first character and ignores the rest.

```sql
select 'hello world'::"char";
```

```
| char |
| ---- |
| h    |
```

## The Unknown Type

[Strings are typed as `unknown` initially](https://www.postgresql.org/docs/18/typeconv-oper.html). If they can be coerced to a specific type, like a number, then they will be before being passed to the operator.

```sql
select pg_typeof(1) as a, pg_typeof('1') as b;
```

```
| a       | b       |
| ------- | ------- |
| integer | unknown |
```

So while the following appears to be playing fast and loose with the types:

```sql
select '1' + 2 as add, '1' || 1 as concat;
```

```
| add | concat |
| --- | ------ |
| 3   | 11     |
```

Postgres is converting it to the following internally:

```sql
select '1'::integer + 2 as add, '1' || 1::text as concat;
```

This also applies to functions, so this is allowed:

```sql
create function add2(int8) returns int8
  as 'select $1 + 2'
  language sql;

select add2('100');
```

```
| add2 |
| ---- |
| 102  |
```

Additionally, operators can be overloaded, so while [`||` is used to combine strings](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/generated/builtins.sql#L22769-L22774), [it can also be used to combine arrays](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/generated/builtins.sql#L22727-L22732):

```sql
select '{1,2,3}'::int[] || '{5,6,7}'::int[];
```

```
| ?column?      |
| ------------- |
| {1,2,3,5,6,7} |
```

## Function Overloading

Just like operator overloading, [Postgres supports function overloading](https://www.postgresql.org/docs/18/xfunc-overload.html).

You can see this with common functions like [`length` which has 7 overloads](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/generated/builtins.sql#L9732-L9762):

```sql
-- bitstring length
create function pg_catalog.length(bit) returns integer
  language internal;

-- octet length
create function pg_catalog.length(bytea) returns integer
  language internal;

-- length of string in specified encoding
create function pg_catalog.length(bytea, name) returns integer
  language internal;

-- character length
create function pg_catalog.length(character) returns integer
  language internal;

-- distance between endpoints
create function pg_catalog.length(lseg) returns double precision
  language internal;

-- sum of path segments
create function pg_catalog.length(path) returns double precision
  language internal;

-- length
create function pg_catalog.length(text) returns integer
  language internal;

-- number of lexemes
create function pg_catalog.length(tsvector) returns integer
  language internal;
```

A more extreme example is [`in_range`, which has 16 overloads](https://github.com/sbdchd/squawk/blob/e8f2530b45ce3b3c842842820e6e9ca01be6973f/crates/squawk_ide/src/generated/builtins.sql#L7747-L7812).

## Conclusion

Postgres is full of useful and peculiar features.

We didn't even talk about [all the `xml`](https://www.postgresql.org/docs/18/functions-xml.html) [stuff it still ships](https://www.postgresql.org/docs/18/datatype-xml.html).
