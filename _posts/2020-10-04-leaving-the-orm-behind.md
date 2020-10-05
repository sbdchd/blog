---
layout: post
title: Leaving the ORM Behind
date: 2020-10-04
---

Django ORM handles the simple things, but at a certain point either the ORM
becomes too verbose or doesn't support necessary features for your query such
as `LATERAL` joins or Postgres specific features like `json_agg` and
related operators.

So you have to write the SQL in a string literal and use the [`psycopg`
cursor](https://www.psycopg.org/docs/cursor.html) exposed by [Django's
connection](https://docs.djangoproject.com/en/3.1/topics/db/sql/#executing-custom-sql-directly)
object.

This works fine until you need to modify the query slightly, not a big
change, just a small tweak like an extra condition in the where clause that
you only add sometimes.

With an ORM, this is easy to handle since we can manipulate the query in
code, e.g.:

```python
complicated_query: QuerySet = ...
more_specific_query = complicated_query.filter(name__startswith="foo")
```

But with a string literal we're forced to concat strings together manually,
which is error prone and annoying.

So we can't use Django ORM, because it isn't expressive enough, but we still
want an easy way to manipulate the queries in Python land.

How about a Python SQL DSL?

## Pypika and its Problems

The first result I landed on was [Pypika](https://pypika.readthedocs.io/),
which seemed decent, but I quickly ran into problems when trying to convert
more substantial SQL queries into the DSL.

### `LATERAL` join

Pypika doesn't have built-in support for `LATERAL` joins; however, with some
tweaking it can work:

```sql
SELECT m.name
FROM manufacturers m
LEFT JOIN LATERAL get_product_names(m.id) pname ON true
WHERE pname IS NULL;
```

I end up needing to define a new enum (can't extend the existing
`JoinType` enum) with the `LATERAL` variants.

```python
from pypika import Table, Query, CustomFunction
from pypika.enums import JoinType
from enum import Enum

get_product_names = CustomFunction("get_product_names", ["column"])
tbl = Table("alpha")
beta = Table("beta")

class PGJoinType(Enum):
    left_join_lateral = "LEFT JOIN LATERAL"
    right_join_lateral = "RIGHT JOIN LATERL"

query = (
    Query.from_(tbl)
    .join(beta, how=PGJoinType.left_join_lateral)
    .on(beta.id == tbl.foo)
    .select("*")
)
```

### ordering inside of aggregations

Pypika can't express an `ORDER BY` inside of an aggregation.

```sql
SELECT
    answer_group.id,
    array_agg(answer.body ORDER BY answer.created DESC) answers
FROM answer_group
JOIN answer ON answer.answer_group_id = answer_group.id
GROUP BY
    answer_group.id;
```

### lack of built-in `tsvector` support

```sql
SELECT
    t.id,
    t.title,
    ts_rank(tb.document, to_tsquery('tomato')) "rank"
FROM
    table_beta tb
    JOIN table_alpha t ON t.id = tb.table_alpha_id
WHERE
    tb.document @@ to_tsquery('tomato')
    AND tb.institution_id = 190
```

becomes rather verbose:

```python
import enum

from pypika import CustomFunction, Field, Order, Parameter, Query, Table
from pypika import Query
from pypika.terms import BasicCriterion

to_tsvector = CustomFunction("to_tsvector", ["text"])
to_tsquery = CustomFunction("to_tsquery", ["text"])
ts_rank = CustomFunction("ts_rank", ["column", "query"])

tb = Table("table_beta")
t = Table("table_alpha")

class Comp(enum.Enum):
    match = "@@"

query = (
    Query.from_(tb)
    .join(t)
    .on(t.id == tb.table_alpha_id)
    .select(
        t.id,
        t.title,
        ts_rank(tb.document, to_tsquery("tomato")).as_("rank"),
    )
    .where(BasicCriterion(Comp.match, tb.document, to_tsquery("tomato")))
    .where(tb.institution_id == 190)
    .orderby(Field("rank"), order=Order.desc)
)
```

### json indexing

```sql
SELECT id, json_agg(column_name) ->> 0 new_col_name
FROM table_name
GROUP BY id;
```

With no built-in support `json_agg` I defined a custom function but that
didn't work when I wanted to use the indexing operator `->>`.

### doesn't handle concatenation

```python
from pypika import Query, Table

table = Table("table")
concat_query = (
    Query.from_(table)
    .where(table.first_name + table.last_name == "j person")
    .select(table.id, table.email)
)
```

Generates an invalid query because Pypika doesn't have column types:

```sql
SELECT "id", "email"
FROM "table"
WHERE "first_name" + "last_name" = 'j person'
```

### escaping

Pypika doesn't handle escaping queries properly:

```python
from pypika import Query, Table

table = Table("table_name")

class SomeType:
    def __str__(self):
        return "true; drop table foo --"

query = (
    Query.from_(table)
    .where(table.name == SomeType())
    .select(table.id, table.name)
)
# SELECT "id","name" FROM "table_name" WHERE "name"=true; drop tables foo --
```

So you need to replace any user provided data with a `Parameter`.

```python
from pypika import Query, Table

table = Table("table_name")

query = (
    Query.from_(table)
    .where(table.name == Parameter("%s"))
    .select(table.id, table.name)
)
# SELECT "id","name" FROM "table_name" WHERE "name"=%s
```

And then substitute using [your client library](https://www.psycopg.org/docs/usage.html#passing-parameters-to-sql-queries).

## SQLAlchemy - Core

Although SQLAlchemy has an ORM, we only need the DSL provided by the Core.

Unlike Pypika, SQLAlchemy's Python DSL supports all the necessary idioms to
fully convert an arbitrary, Postgres flavored SQL query.

### So Many Features

Supports all the non-trivial features used in the queries I tested:

- [JSON](https://docs.sqlalchemy.org/en/13/dialects/postgresql.html#sqlalchemy.dialects.postgresql.JSON)
- [tsvector (full text search)](https://docs.sqlalchemy.org/en/13/dialects/postgresql.html#full-text-search)
- [`ON CONFLICT`](https://docs.sqlalchemy.org/en/13/dialects/postgresql.html#insert-on-conflict-upsert)
- [`FOR UPDATE OF table_name SKIP LOCKED`](https://docs.sqlalchemy.org/en/13/core/selectable.html#sqlalchemy.sql.expression.Select.with_for_update)
- [CTE](https://docs.sqlalchemy.org/en/13/core/tutorial.html#common-table-expressions-cte)
- [`LATERAL` joins](https://docs.sqlalchemy.org/en/13/core/tutorial.html#lateral-selects)
- proper escaping of user data to prevent SQL injection
  - [separates your query from the data it uses](https://docs.sqlalchemy.org/en/13/core/tutorial.html#insert-expressions) so the data can be safely substituted via your database client
- [ordering in an aggregation](https://docs.sqlalchemy.org/en/13/dialects/postgresql.html#sqlalchemy.dialects.postgresql.aggregate_order_by)
- working concatenation since columns have proper types

## Conclusion

If you need an SQL DSL in Python, use SQLAlchemy Core.
