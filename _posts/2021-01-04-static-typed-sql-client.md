---
layout: post
title: "Typed SQL Client & Query DSL in Python"
description: Pushing Python's static typing to the limits
date: 2021-01-04
---

The current SQL database clients in the Python ecosystem either [lack static
types completely](https://www.psycopg.org/docs/cursor.html#fetch) or [use](https://www.psycopg.org/psycopg3/docs/cursor.html#psycopg3.Cursor.fetchone) `Any` in their [return types](https://magicstack.github.io/asyncpg/current/api/index.html#asyncpg.connection.Connection.fetch).

In this post I'm going to explore an API for a statically typed db client.

### Plain SQL w/ Shape Argument

> Related: [Dapper](https://dapper-tutorial.net), [`sqlx`](https://github.com/launchbadge/sqlx), [norm](https://github.com/dieselpoint/norm)

Using strings with our SQL client is the most basic and straightforward
approach, but composing SQL strings is tricky.

```python
result = db.sql(
    "SELECT id, name FROM table_name;", shape=List[Tuple[int, str]]
)
```

### Query Builder w/ Shape Argument

> Related: [SQLAlchemy Core](http://docs.sqlalchemy.org/en/latest/core/), [deuterium](https://github.com/s-panferov/deuterium), [ObjectiveSql](https://github.com/braisdom/ObjectiveSql)

Instead of using strings, it would be better if we had some in language DSL
for defining queries, [like SQLAlchemy
core](https://steve.dignam.xyz/2020/10/04/leaving-the-orm-behind/#sqlalchemy---core),
but with static typing, to make queries easier to manipulate.

Defining the table schema is easy enough in Python with static types:

```python
class Post:
    id = BigSerial(primary_key=True)
    name = Text()
    description = Text()
    created = Datetime()
    karma = Integer()
```

And then we can use the class attributes in the query DSL:

```python
query = (
    select(Post.id, Post.name)
    .where((Post.id >= 25) & (Post.name == "foo"))
    .where(Post.karma >= 25)
    .order_by(Post.name, desc(Post.description))
    .limit(5)
    .skip(10)
)
if has_lots_of_karma:
    # easier than messing around with SQL strings
    query = query.where(Post.karma > 10_000)

result = db.query(query, shape=List[Tuple[int, str]])
```

Compared to the strings, SQL executed with the query DSL isn't always
obvious, so we can watch the database logs or
have the db client write the generated queries to the console.

### Query Builder w/o Specific Shape Argument

The query DSL approach is more flexible than the string approach, but can we
remove the need to provide a type entirely?

Django's ORM uses the table definition class for the output type of the
queries, which alleviates the need to specify the query's result type.

However, things get a little tricky once you select specific columns with
[`.only()`](https://docs.djangoproject.com/en/3.1/ref/models/querysets/#only)
as the same table class is used, with the missing fields replaced by their
zero/empty values.

```python
# only Post.id, and Post.name are populated with actual values.
# Post.karam, Post.description, and Post.created are set to their empty
# values.
result = Post.objects.filter(karam__gte=10).only("id", "name")
```

While this functionality can be confusing, it type checks, but the pattern
doesn't transfer to more complicated queries that can't be expressed in the
ORM. For those we'll need to use the underlying [psycopg
`cursor`](https://www.psycopg.org/docs/cursor.html#cursor) with SQL strings.

So how can we avoid having to write out the type of the query result?

We could try making the argument generic with a
[`TypeVar`](https://docs.python.org/3/library/typing.html#typing.TypeVar) so
that `select(T)` returns `Query[T]`.

The problem with this approach is that the types are wrong. In
`select(Post.id, Post.name)` the types of `Post.id` and `Post.name` aren't
`int` and `str`, but instead `BigSerial` and `Text`. And we can't change
these types because we use them for building queries.

Another option is adding `@overload`s for the `select()`'s `__init__`, but
that would require an overload for every possible argument count, along with
every argument type used, as we need the overloads to map from the query builder
types, `BigSerial`, `Text`, `Integer`, etc. to their corresponding Python types.
Additionally we'd require even more overloads for things like
[`json_agg`](https://www.postgresql.org/docs/9.5/functions-aggregate.html).

We might be able to cover the functionality with a [mypy
plugin](https://mypy.readthedocs.io/en/stable/extending_mypy.html#extending-mypy-using-plugins),
but this wouldn't transfer to other type checkers like
[Pyright](https://github.com/Microsoft/pyright).

Code gen might work. We could generate the overloads based off the usage in
the project, but that seems tricky to implement.

#### Related

[Prisma](https://www.prisma.io) is a TypeScript ORM that [correctly
types the return result when selecting specific
fields](https://www.prisma.io/docs/concepts/components/prisma-client/field-selection#manipulating-the-selection-set)
a la Django ORM's `.only()` method, but the client is limited in
functionality, so for more more advanced queries you'll need to use
[`prisma.$queryRaw()`](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw)
which returns `any`.

Essentially, Prisma is a better typed Django ORM, but doesn't support
typing the returns of arbitrary SQL queries.

## Conclusion

It seems the best we can do is a query DSL with a specific shape argument to
the db client.

### Code

Basic stubs for the API:

```python
from __future__ import annotations

from typing import Any, Iterable, List, Type, TypeVar, Union, Tuple
from decimal import Decimal


class Field:
    def __ge__(self, other: Union[Any, Field]) -> ComparisionResult:
        ...


class ComparisionResult:
    def __and__(self, other: ComparisionResult) -> ComparisionResult:
        ...


class Integer(Field):
    def __init__(self, *, primary_key: bool = False) -> None:
        ...

    def __ge__(self, other: Union[int, Field]) -> ComparisionResult:
        ...

    def __gt__(self, other: Union[int, Field]) -> ComparisionResult:
        ...


class BigSerial(Field):
    def __init__(self, *, primary_key: bool = False) -> None:
        ...

    def __ge__(self, other: Union[int, Field]) -> ComparisionResult:
        ...


class Text(Field):
    def __eq__(self, other: Union[str, Field]) -> ComparisionResult:
        ...

    def __add__(self, other: Any) -> ComparisionResult:
        ...


class Datetime(Field):
    pass


class Post:
    id = BigSerial(primary_key=True)
    name = Text()
    description = Text()
    created = Datetime()
    karma = Integer()


class Query:
    def __init__(self, *args: Field) -> None:
        ...

    def where(self, *args: ComparisionResult) -> Query:
        ...

    def order_by(self, *args: Union[Field, desc]) -> Query:
        ...

    def limit(self, count: int) -> Query:
        ...

    def count(self) -> Query:
        ...

    def skip(self, count: int) -> Query:
        ...

    def returning(self, *args: Any) -> Query:
        ...

    def label(self, name: str) -> Query:
        ...


class desc:
    def __init__(self, *args: Field) -> None:
        ...


def and_(*args: ComparisionResult) -> ComparisionResult:
    ...


T = TypeVar("T")


class Postgres:
    def query(self, query: Query, shape: Type[T]) -> T:
        ...

    def sql(
        self,
        query: str,
        *,
        args: Iterable[Union[bool, str, int, float, Decimal, None, bytes]] = (),
        shape: Type[T],
    ) -> T:
        ...


select = Query


def example_1(db: Postgres) -> None:
    result = db.sql("SELECT id, name FROM table_name;", shape=List[Tuple[int, str]])


def example_2(db: Postgres, has_lots_of_karma: bool) -> None:
    query = (
        select(Post.id, Post.name)
        .where((Post.id >= 25) & (Post.name == "foo"))
        .where(Post.karma >= 25)
        .order_by(Post.name, desc(Post.description))
        .limit(5)
        .skip(10)
    )
    if has_lots_of_karma:
        # easier than messing around with SQL strings
        query = query.where(Post.karma > 10000)

    result = db.query(query, shape=List[Tuple[int, str]])
```
