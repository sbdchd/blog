---
layout: post
title: "Interesting Bits of Postgres Grammar"
description: "Lessons from building a parser"
---

I've been working on [Squawk](https://squawkhq.com) for a while, it's a linter for PostgreSQL, and it [now](https://github.com/sbdchd/squawk/releases/tag/v2.0.0) uses a [handmade parser](https://github.com/sbdchd/squawk/blob/f68b1a81c03bbc3cc8e84bb2d2e5219ca2b610ac/crates/squawk_parser/src/grammar.rs).

So let's explore some interesting bits from the [Postgres grammar](https://github.com/postgres/postgres/blob/2f6e240d7ac930698995ac608695cb0368f504f2/src/backend/parser/gram.y).

## Custom Operators

[Very few operators are defined in the grammar itself](https://github.com/postgres/postgres/blob/5861b1f343b52ac358912707788214fb8dc981e5/src/backend/parser/gram.y#L824C1-L834C70) and lots of Postgres features rely on custom operators.

For example, Postgres uses [`<->` for comparing geometric types](https://www.postgresql.org/docs/17/functions-geometry.html), along with a whole host of others: `##`, `@-@`, `#`, `@>`, `<@>`, `&<`, `&>`, `|>>`, `|<<`, `<^`, `>^`, `?-`, `?|`, `?||`, `~=`.

Note: custom operators can be prefix or infix, but not postfix.

A neat consequence of custom operators is that the following [lambda expression syntax from Trino](https://trino.io/docs/current/functions/lambda.html) parses natively in Postgres:

```sql
select array_filter(
  array[1, 2, 2, 3],
  e -> (e % 2) = 0
);
```

Albeit with the wrong precedence.

## Precedence with Compound `select`s

The following:

```sql
select foo union select bar order by baz;
```

Parses the same as:

```sql
(select foo union select bar) order by baz;
```

Meaning the `order by` clause is applied to the overall compound select.

## Percent Types

With `create function`, you can [specify types based on a table's column type](https://www.postgresql.org/docs/17/sql-createfunction.html).

For example, using the type of column `c` on table `t`:

```sql
create function f(a t.c%type)
as 'select 1' language plpgsql;
```

## String Continuation

If you have two string literals separated by new lines, then they'll be merged together:

```sql
select 'foo'
'bar';
```

returns `'foobar'`

But if there's a comment in between, it's a syntax error:

```sql
select 'foo' /* hmm */
'bar';
```

```
Query 1 ERROR at Line 2: : ERROR:  syntax error at or near "'bar'"
LINE 2: 'bar';
        ^
```

This behavior is part of the [SQL standard](https://www.postgresql.org/docs/17/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS).

## Quoted Idents

In Postgres you can optionally quote your identifiers, so the following are the same:

```sql
select * from t;
select * from "t";
```

If you want to include a double quote in your identifier name, you can escape it like so:

```sql
select * from "foo "" bar"
```

which will select from the `foo " bar` table.

## Unicode Escapes

You can also prefix quoted identifiers with `U&` and pass unicode escape codes:

```sql
-- `74` is the unicode number for `t`
select * from U&"\0074";
```

And if you want to change the escape character from `\`, you can write:

```sql
-- `74` is the unicode number for `t`
select * from U&"!0074" uescape '!';
```

## Operator Function

Instead of using an operator directly:

```sql
select 1 + 2;
```

You can use the operator function:

```sql
select 1 operator(+) 2;
```

Which allows specifying the operator's schema:

```sql
select 1 operator(pg_catalog.+) 2;
```

It also works as a prefix operator:

```sql
select operator(-) 1;
```

## Conclusion

Overall, I think custom operators diverge the most from other mainstream languages and can be tricky to implement.
