---
layout: post
title: "Preventing N+1 Queries in Django"
date: 2020-02-09
---

## Overview

Quick refresher, an `N+1` query is where you fetch a list of `N` items from a
database and then for each item you make another database query, so `N`
queries plus the initial query.

`N+1` queries can be difficult to spot since Django isn't explicit about when
it will query the database.

## Example: Serializers in Django Rest Framework

[Django Rest Framework](https://www.django-rest-framework.org) has a concept
of serializers which are classes that handle a few tasks such as validating
user data and taking python classes and converting them to JSON.

Here is an example of using a serializer to convert a python object into JSON
that has an N+1 query:

```python
from django.db import connection
from core.models import Ingredient
from django.db import connection
from rest_framework import serializers


class IngredientSerializerListView(serializers.ModelSerializer):
    recipe_name = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = (
            "id",
            "name",
            "description",
            "recipe_name",
        )

    # N+1 query D;
    def get_recipe_name(self, obj):
        return obj.recipe.name


@api_view(["GET"])
def get_list_view(request):
    queryset = Ingredient.objects.all()[:150]
    return Response(IngredientSerializerListView(queryset, many=True).data)
```

If you're only fetching say 10 items in your test environment it might
be hard to notice any slowness from the `N+1` querying.

So how do we prevent N+1 queries? We could hope that someone spots the problem in code review, but there's a better way.

Instead we can block database access inside serializers. But before blocking
db access in a serializer we need to figure out how to block database access
in general.

Fortunately for Django's docs are quite thorough and have an example blocking db access:
<https://docs.djangoproject.com/en/dev/topics/db/instrumentation/>

Translating that to our code we get:

```python
from django.db import connection
from core.models import Ingredient
from django.db import connection
from rest_framework import serializers

def blocker(*args):
    raise Exception("No database access allowed here.")

class IngredientSerializerListView(serializers.ModelSerializer):
    recipe_name = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = (
            "id",
            "name",
            "description",
            "recipe_name",
        )

    # N+1 query D;
    def get_recipe_name(self, obj):
        return obj.recipe.name


@api_view(["GET"])
def get_list_view(request):
    # force django to make the query via `list()`
    queryset = list(Ingredient.objects.all()[:150])
    with connection.execute_wrapper(blocker):
        return Response(IngredientSerializerListView(queryset, many=True).data)
```

And when we call the endpoint we get a stack trace instead of an `N+1` query.

Now we can move this database blocker into the base class for all of our serializers so we don't have to remember to use the `connection.execute_wrapper(blocker)`.

```python
from django.db import connection
from rest_framework import serializers


def blocker(*args):
    raise Exception("No database access allowed here.")


class DBBlockerSerializerMixin:
    @property
    def data(self):
        if hasattr(self, "initial_data") or self.dangerously_allow_db:
            return super().data
        with connection.execute_wrapper(blocker):
            return super().data

    def __init__(self, *args, dangerously_allow_db = False, **kwargs):
        self.dangerously_allow_db = dangerously_allow_db
        super().__init__(*args, **kwargs)


class BaseSerializer(DBBlockerSerializerMixin, serializers.Serializer):
    pass


class BaseModelSerializer(DBBlockerSerializerMixin, serializers.ModelSerializer):
    pass


class BaseRelatedField(DBBlockerSerializerMixin, serializers.RelatedField):
    pass
```

And then when ever we declare a serializer, we inherit from `BaseSerializer` instead of `serializers.Serializer`.

We can also make the using `connection.excute_wrapper(blocker)` easier by
creating a context manager to block the db.

```python
from functools import partial
block_db = partial(connection.execute_wrapper, wrapper=blocker)

@api_view(["GET"])
def get_list_view(request):
    # force django to make the query via `list()`
    queryset = list(Ingredient.objects.all()[:150])
    with block_db():
        return Response(IngredientSerializerListView(queryset, many=True).data)
```

## Conclusion

Django provides some easy to use hooks for database connections that let us
block database access without any monkey patching.

By writing a couple wrappers around these builtins we can avoid some common
sources of N+1 queries and ensure serialization sections in code do not have
access to the database.
