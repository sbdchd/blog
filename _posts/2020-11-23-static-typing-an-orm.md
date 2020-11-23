---
layout: post
date: 2020-11-23
title: Static Typing an ORM
---

At \$WORK we use [mongoengine](https://github.com/MongoEngine/mongoengine)
which is untyped. To get proper autocomplete and some static typing I wrote
[some type stubs](https://github.com/sbdchd/mongo-types) for the library.

Here are some of the lessons learned:

## use lots of [overloads](https://mypy.readthedocs.io/en/stable/more_types.html#runtime-behavior)

- overload `__get__` and `__set__` to allow a type to accept other types

  - allows assigning `str` to `StringField()`

- with nested types, overloads start to multiply

  - `fields.MapField(field=fields.MapField(field=fields.BooleanField()))`,
    need overloads for each "layer"

- can use overloads to handle nullability: `fields.StringField(null=True)` would have a `__get__` return type of `Optional[str]`
  - checkout overloading `self` in [`__init__` and
    `__new__`](https://github.com/python/mypy/issues/4236#issuecomment-521628880)
    methods for correctly typing based off `__init__`/`__new__` args

## type `self` and `cls` for better return types

```python
from typing import TypeVar, Type

from .queryset import QuerySet
from .base import BaseTable

_U = TypeVar("_U", bound="Table")

class Table(BaseTable):
    @classmethod
    def objects(cls: Type[_U]) -> QuerySet[_U]:
        ...

    def save(
        self: _U,
        validate: bool = ...,
        clean: bool = ...,
    ) -> _U: ...

class Post(Table): pass

reveal_type(Post.objects().filter(id__gt=10))
# QuerySet[Post]

reveal_type(Post().save())
# Post
```

## you can leave out default values

instead of making an argument `Optional[T]` and providing `None` as a
default, use `= ...`.

```python
class Foo:
    def bar(self, fizz: bool, buzz: str = ...) -> None: ...
```

## embrace `Any`

It's okay to start off with a lot of things as `Any`, you can gradually
dial up the strictness.

## embrace strictness

Static types may require changes to your code.

For instance, mongoengine has the ability to index into models to access
properties, `user_post["title"]`

Typing this you'd end up with:

```python
from typing import Any

class Document:
    def __getitem__(self, key: str) -> Any: ...
```

Ideally getting an item would be typed such that each key used would
return the type of the corresponding property value, something like:

```python
from typing import Any

U = TypeVar("U", bound="Document")
T = TypeVar("T", bound=KeyOf[U])

class Document:
    def __getitem__(self: U, key: T) -> U[T]: ...
```

But we don't have `KeyOf`, which I'm not even sure how that would work
because there are a bunch of properties on the class that you don't want to
include, and we don't have the ability to index into other types.

Maybe we could code gen the `overload`s with a bunch of
`Literal["field_name"]` and their respective return types.

An easier fix is to remove the functionality and require users access the
properties directly.

## you may need to monkey patch the underlying library

If you have a container type, you'll probably need to monkey patch a no-op
`__class_getitem__` method so that you can write the type with a generic at
runtime, e.g., `QuerySet[T]`.

```python
import types

def no_op(self: object, x: object) -> object:
    return self

QuerySet.__class_getitem__ = types.MethodType(no_op, QuerySet) # type: ignore
```

## use `__all__` to reexport types

[`mypy` doesn't implicitly re-export
types in stubs](https://mypy.readthedocs.io/en/stable/config_file.html?highlight=__all__#confval-implicit_reexport),
so if in your `__init__.pyi` you want to export a bunch of types that you
imported from other modules, be sure to include them in `__all__`.
