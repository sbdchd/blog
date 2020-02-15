---
layout: post
title: "Preventing Unindexed Queries in Django"
date: 2020-02-15
---

## Backstory

A while ago I was watching [a talk about
microservices](https://www.infoq.com/presentations/microservices-arch-infrastructure-cd/)
and the presenter brought up an interesting technique where the methods for
accessing data only allowed querying via fields that were indexed. So for
instance, if you wanted to query for users by `age`, there would only be an
`age` parameter in the `findAll` method if the field was indexed.

It seemed like a great idea at the time but I never got around to figuring
out how to achieve something similar in Django.

After someone on HN mentioned building [a solution for preventing unindexed
queries](https://github.com/foursquare/fsqio/blob/5110422a59e5f72ea558445a00ba9dad6a035956/src/jvm/io/fsq/rogue/indexchecker/IndexChecker.scala)
at Foursquare I decided to see what we can do with Django.

The Foursquare implementation is for Mongo but I think the idea is nice.
Instead of creating a strict API around our query API, we can
instead write a linter for the queries. This is nicer for established
projects and it also means that devs that already know how to use Django ORM
don't have to learn a new homegrown query tool.

## The Plan: Building the Query Check

The first step was seeing if we could take a `QuerySet` and check if it is
querying against an unindexed field.

After toying around in an `ipython` session I found some methods that provide
the necessary query data and came up with:

```python
def only_querying_indexed_fields(queryset: QuerySet) -> bool:
    for expr in queryset._has_filters().get_source_expressions():
        if (
            not expr.lhs.output_field.db_index
            and not expr.lhs.output_field.primary_key
        ):
            return False
    return True
```

But we can't just run this function over every queryset before
execution, so my next idea was to monkey patch Django's ORM query
evaluation to add this check to every query before being sent to the
database.

So I wrote a test, set a `breakpoint()`, and started stepping through Django's
evaluation of an ORM query to find a nice spot for patching.

[`django.db.models.sql.compiler.SQLCompiler::execute_sql`](https://github.com/django/django/blob/98f23a8af0be7e87535426c5c83058e2682bfdf8/django/db/models/sql/compiler.py#L1112) seemed like a nice place to insert the check.

We also need to patch the `SQLUpdateCompiler` since it inherits from
`SQLCompiler` and overrides the `execute_sql` method.

Here's what I came up with:

```python
from typing import Callable
from django.db.models.sql.compiler import (
    SQLCompiler,
    SQLUpdateCompiler,
)
from functools import wraps


def patch_execute_sql(original: Callable) -> Callable:
    @wraps(original)
    def inner(*args: object, **kwargs: object) -> None:
        # work with the `query` arg that gets passed in.
        breakpoint()
        original(*args, **kwargs)

    return inner


def patch() -> None:
    for compiler in (SQLCompiler, SQLUpdateCompiler):
        compiler.execute_sql = patch_execute_sql(compiler.execute_sql)

# then in settings.py we call patch()
```

It worked in that we can inspect every
[`Query`](https://github.com/django/django/blob/3259983f569151232d8e3b0c3d0de3a858c2b265/django/db/models/sql/query.py#L138)
before execution. While this works, a `QuerySet` has more information that
makes it easier to implement a solution.

## Model Manager

Forgetting the monkey patching approach, we can instead override the [model
manager](https://docs.djangoproject.com/en/dev/topics/db/managers/). This
requires us to make more code changes but on the up side it's more explicit
than monkey patching.

In the code below, instead of checking the queries before they are sent to
the database, we check the queries when they are constructed, aka when
someone calls `.filter()` on a queryset.

```python
import uuid
from django.db import models
from django.db.models.query import QuerySet

class QueryUnIndexedField(Exception):
    pass

class CheckedQuerySet(QuerySet):
    def filter(self, *args, **kwargs):
        queryset = super().filter(*args, **kwargs)
        for expr in queryset._has_filters().get_source_expressions():
            if (
                not expr.lhs.output_field.db_index
                and not expr.lhs.output_field.primary_key
            ):
                raise QueryUnIndexedField
        return queryset

    def exclude(self, *args: object, **kwargs: object) -> Any:
        queryset = super().exclude(*args, **kwargs)
        for expr in queryset._has_filters().get_source_expressions():
            for child in expr.children:
                if (
                    not child.lhs.output_field.db_index
                    and not child.lhs.output_field.primary_key
                ):
                    raise QueryUnIndexedField
        return queryset

class CheckedManager(models.Manager.from_queryset(CheckedQuerySet)):
    pass

class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    github_id = models.IntegerField(db_index=True)
    github_login = models.CharField(max_length=255)
    github_access_token = models.CharField(max_length=255)
    team = models.ForeignKey("Team", on_delete=models.SET_NULL, null=True)

    objects = CheckedManager()
```

And here's a test which passes with the new check queryset & manager in
place. Note how queries on indexed fields like `id` and `github_id` don't
raise exceptions while the unindexed fields do.

```python
from uuid import uuid4
import pytest
from django.utils import timezone
from core.models import User, Team, QueryUnIndexedField

@pytest.mark.django_db
def test_query_unindexed_fields() -> None:
    User.objects.filter(id=uuid4())

    User.objects.filter(github_id=10)

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(github_login="foo")

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(Q(github_login="foo"))

    with pytest.raises(QueryUnIndexedField):
        User.objects.exclude(github_login="foo")

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(id=uuid4()).filter(github_login="foo").update(github_id=10)

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(id=uuid4()).filter(github_login="foo").delete()

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(modified_at__gt=timezone.now())

    with pytest.raises(QueryUnIndexedField):
        User.objects.filter(github_login__in=["foo"])

    team = Team.objects.create(name="foo bar")
    User.objects.filter(team=team)
```

## Conclusion

While limiting the query API surface to only include indexed fields
would provided quicker feedback, compiler error vs test error, the
queryset approach lends itself to existing code bases.

### Future Work

Django's syntax for [lookups that span
relationships](https://docs.djangoproject.com/en/dev/topics/db/queries/#lookups-that-span-relationships)
needs to be handled. Might need to add more checking for
[`.annotate()`](https://docs.djangoproject.com/en/dev/ref/models/querysets/#annotate)
as well.
