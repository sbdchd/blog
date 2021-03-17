---
layout: post
date: 2019-10-24
title: "Arbitrary Precision Decimal Fields with Django ORM"
description: Using Postgres features from Django
---

The [Django ORM's
`DecimalField`](https://docs.djangoproject.com/en/2.2/ref/models/fields/#decimalfield)
requires a user-specified fixed precision via the `max_digits` and `decimal_places` args, which is probably fine for many use cases, but what if you wanted _arbitrary_ precision decimals?

With your search engine of choice, you might find a
particular [Stack Overflow
answer](https://stackoverflow.com/q/30960589/3720597) that claims `max_digits`
and `decimal_places` are required by Django because the SQL spec requires
them.

Do not lose hope, thankfully, this answer is wrong. If we take a look in
[section 8.1.2](https://www.postgresql.org/docs/9.5/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL)
of the Postgres docs we find that by specifying `NUMERIC`, which doesn't list
`decimal_places` or `max_digits`, Postgres "creates a column in which numeric
values of any precision and scale can be stored, up to the implementation
limit on precision."

Okay, so Postgres supports arbitrary precision decimals by not specifying the
precision and size, let's just not pass in the `max_digits` and
`decimal_places` args to the `DecimalField`.

```python
class Post(models.Model):
    text = models.TextField()
    position = models.DecimalField()
```

Now all we need to do is run `makemigrations` and

```shell
poetry run python manage.py makemigrations
SystemCheckError: System check identified some issues:

ERRORS:
core.Post.position: (fields.E130) DecimalFields must define a 'decimal_places' attribute.
core.Post.position: (fields.E132) DecimalFields must define a 'max_digits' attribute.
```

uh oh.

Turns out the docs weren't kidding.

Okay, lets just eliminate the checks. Just need to click into the Django source and figure out how.

[`django.db.models.fields.DecimalField` (src)](https://github.com/django/django/blob/2847d2c760438195c4c71ea9d3fded1ce116ea4e/django/db/models/fields/__init__.py#L1378-L1510)

```python
class DecimalField(Field):
    def __init__(
        self,
        verbose_name=None,
        name=None,
        max_digits=None,
        decimal_places=None,
        **kwargs,
    ):
        self.max_digits, self.decimal_places = max_digits, decimal_places
        super().__init__(verbose_name, name, **kwargs)

    def check(self, **kwargs):
        errors = super().check(**kwargs)

        digits_errors = [*self._check_decimal_places(), *self._check_max_digits()]
        if not digits_errors:
            errors.extend(self._check_decimal_places_and_max_digits(**kwargs))
        else:
            errors.extend(digits_errors)
        return errors

    def _check_decimal_places(self):
        try:
            decimal_places = int(self.decimal_places)
            if decimal_places < 0:
                raise ValueError()
        except TypeError:
            return [
                checks.Error(
                    "DecimalFields must define a 'decimal_places' attribute.",
                    obj=self,
                    id="fields.E130",
                )
            ]
        except ValueError:
            return [
                checks.Error(
                    "'decimal_places' must be a non-negative integer.",
                    obj=self,
                    id="fields.E131",
                )
            ]
        else:
            return []

    def _check_max_digits(self):
        try:
            max_digits = int(self.max_digits)
            if max_digits <= 0:
                raise ValueError()
        except TypeError:
            return [
                checks.Error(
                    "DecimalFields must define a 'max_digits' attribute.",
                    obj=self,
                    id="fields.E132",
                )
            ]
        except ValueError:
            return [
                checks.Error(
                    "'max_digits' must be a positive integer.",
                    obj=self,
                    id="fields.E133",
                )
            ]
        else:
            return []

    def _check_decimal_places_and_max_digits(self, **kwargs):
        if int(self.decimal_places) > int(self.max_digits):
            return [
                checks.Error(
                    "'max_digits' must be greater or equal to 'decimal_places'.",
                    obj=self,
                    id="fields.E134",
                )
            ]
        return []

    # --snip--
```

We can see that `_check_max_digits`, `_check_decimal_places`, and `_check_decimal_places_and_max_digits` return
empty lists when there are no errors, so we just need to override these
methods with stubs that always return `[]`.

Easy enough.

```python
class ArbitraryDecimalField(models.DecimalField):
    def _check_decimal_places(self):
        return []

    def _check_max_digits(self):
        return []

    def _check_decimal_places_and_max_digits(self):
        return []
```

Let's try running `makemigrations` again.

```shell
poetry run python manage.py makemigrations
Migrations for 'core':
  backend/core/migrations/0003_post_position.py
    - Add field position to post
```

Success!

Now we'll apply the migration:

```shell
poetry run python manage.py migrate
--snip--
django.db.utils.DataError: invalid input syntax for integer: "none"
LINE 1: ...ULL PRIMARY KEY, "text" text NOT NULL, "position" numeric(No...
--snip--
```

`django.db.utils.DataError`!

The output is a bit cutoff, what is with the `numeric(No...)` bit?

The complete SQL statement provides a better picture of what is going wrong:

```sql
ALTER TABLE "core_post" ADD COLUMN "position" numeric(None, None) DEFAULT %s NOT NULL
```

The docs really aren't lying about `max_digits` and `decimal_places`. With
the checks disabled we now have `None` being interpolated into the SQL!

Sadly, `numeric(None, None)` is not the same as `numeric`. So now we need to
override whatever generates that interpolation. A search of the Django
codebase turns up the [`django.db.backends.postgresql.base`
module](https://github.com/django/django/blob/2847d2c760438195c4c71ea9d3fded1ce116ea4e/django/db/backends/postgresql/base.py#L81).

the line in question is show below (trimmed to save on space)

```python
class DatabaseWrapper(BaseDatabaseWrapper):
    data_types = {
        'DecimalField': 'numeric(%(max_digits)s, %(decimal_places)s)',
    }
```

As we saw before, arbitrary precision decimals in Postgres require a declaration like:

```sql
numeric
```

instead of what Django expects

```sql
numeric(precision, scale)
```

So we want the string formatter to just equal `numeric` when `max_digits`
and `decimal_places` aren't provided. Unfortunately from what I can tell,
there isn't an way to define two formatters for the given field type so we'll
need to define our own custom field.

Thankfully the Django docs provide an excellent [example on creating custom
fields](https://docs.djangoproject.com/en/2.2/howto/custom-model-fields/).
For our use case we need to provide a `db_type` method in our custom field `class`.

So we add the method to our custom field, and voilà, it works!

Here is our final custom field in all its glory:

```python
class ArbitraryDecimalField(models.DecimalField):
    def _check_decimal_places(self):
        return []

    def _check_max_digits(self):
        return []

    def _check_decimal_places_and_max_digits(self):
        return []

    def db_type(self, connection):
        # pg or bust
        assert connection.settings_dict["ENGINE"] == "django.db.backends.postgresql"
        return "numeric"
```

So while it isn't as easy as leaving out the args to the built-in
`DecimalField`, we can still use Postgres' arbitrary precision decimal
field.
