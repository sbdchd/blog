---
layout: post
title: "Debugging Performance Issues with Py-Spy"
description: With included SVGs
date: 2020-02-08
---

## Overview

So an API endpoint is slow and you want to fix it.

Where do you start?

You could look at the code for something suspicious, but what would be even
better is to have something tell you exactly where the slowdown is occurring.

[`py-spy`](https://github.com/benfred/py-spy) to the rescue!

Now you might say, "what about [`cProfile`](https://docs.python.org/3/library/profile.html)?". cProfile works but it doesn't produce a pretty flamegraph and isn't as easy to setup.

## Using `py-spy`

With `py-spy`'s `record` command we can create a flamegraph of the python
process's stack info, which will let us see which functions are taking up the
most time.

The command looks like follows:

```
sudo py-spy record --pid $PYTHON_PID --output trace.svg
```

As you can see we need to get our python processes' pid. If you're running a
django server locally it's easy enough to `pstree | grep runserver` which
should give something like the following:

```console
❯ pstree | grep runserver
 | | |   |-+= 59368 steve /usr/local/Cellar/python/3.7.6/Frameworks/Python.framework/Versions/3.7/Resources/Python.app/Contents/MacOS/Python /Users/steve/projects/recipeyak/.venv/bin/yak django runserver
 | | |   | \--- 59371 steve /usr/local/Cellar/python/3.7.6/Frameworks/Python.framework/Versions/3.7/Resources/Python.app/Contents/MacOS/Python /Users/steve/projects/recipeyak/.venv/bin/yak django runserver
 | | |--- 66417 steve grep --color=always runserver
```

note: the project I'm using to test `py-spy` wraps the django commands in a cli, but the output is similar if you use `./manage.py` instead.

Anyways back to the results, there are 3. We can discount our `grep` query, but now
we left with two seemingly identical `runserver` commands. Which one do we
want?

We can see from `pstree` that `59371` is the child process of `59368`. Django
`runserver` creates the file watcher process which reloads the dev server on file
changes. A consequence of server reload is that each time the files change, the dev server process is replaced, meaning you'll need to find the new `pid`.

We want a trace from the dev http server so we'll plug the child process's pid into our call to `py-spy`:

```console
sudo py-spy record --pid 59371 --output trace.svg
```

Now that we have our `py-spy` command, we'll need an easy way to exercise our
problamtic endpoint. `curl` works and if you're using a web ui to call your api you can use `copy as curl` from your browser of choice's network tab.

## Tracing Time

We first start `py-spy` and then call the endpoint via `curl`.

Then we can <kbd>^C</kbd> and `py-spy` will write the flamegraph to the output file, which we can view in a browser.

Here's an example:

<small>Note: it's best to open in another tab so the JS embedded in the svg works.</small>

![trace ](/assets/py-spy-trace.svg)

So in the flamegraph we're looking for our project's code.
Following the `middleware` calls down we find our view
`get_slow_list_view (core/recipes/views.py:243)`, which we can click to take
up the full width of the window.

The view takes `48.62%` of the time of the entire trace, this forms our baseline.

In the view we can see that there is one call taking the majority of the
time, `get_recipe_name (core/recipes/views.py:236)` coming in at `44.95%` of
the entire trace or `44.95% / 48.62% ≈ 92%` of the view.

Now we know we should checkout the `get_recipe_name` function on line 236.

The code is as follows:

```python
class IngredientSerializerListView(serializers.ModelSerializer):
    recipe_name = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = (
            "id",
            "quantity",
            "name",
            "description",
            "position",
            "optional",
            "recipe_name",
        )

    # Hello N+1 query :D
    def get_recipe_name(self, obj):
        return obj.recipe.name


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def get_slow_list_view(request: Request) -> Response:
    queryset = Ingredient.objects.all()[:150]
    return Response(IngredientSerializerListView(queryset, many=True).data)
```

In this example code we're accessing a related tables' column, which django
will load on access by making a database query. Since django will make this database
query for each item of the list view, this is an `N+1` query.

We can reduce these `N` extra database calls to `1` by adding a [`.prefetch_related()`](https://docs.djangoproject.com/en/3.0/ref/models/querysets/#prefetch-related) call to our query:

```diff
diff --git a/backend/core/recipes/views.py b/backend/core/recipes/views.py
index 9b48f728..2f3d7d09 100644
--- a/backend/core/recipes/views.py
+++ b/backend/core/recipes/views.py
@@ -242,7 +242,7 @@ class IngredientSerializerListView(
 @api_view(["GET"])
 @permission_classes((IsAuthenticated,))
 def get_slow_list_view(request: Request) -> Response:
-    queryset = Ingredient.objects.all()[:150]
+    queryset = Ingredient.objects.all().prefetch_related("recipe")[:150]
     return Response(IngredientSerializerListView(queryset, many=True).data)
```

In the resulting flamegraph we can see most of the time is now spent in
serializing the data & the initial database queries:

![trace ](/assets/py-spy-trace-after.svg)

Success! 🥳

## Conclusion

While this example is a little contrived, let's imagine a scenario where one
dev creates the list endpoint and the serializer in a way that doesn't make a
database call for each item it's serializing.

Then another dev comes along looking to fetch a similar structure of data
from the DB for their detail view. But wait, they need an extra related field
so they add the `get_recipe_name` method. The serializer is fast enough for
their detail view, and the time of an extra db query isn't noticeable, but with
this minor change the pre-existing list view performance has tanked.

There must be a better way, some way to stop these queries
in serializers, and there is but that's [another post](/2020/02/09/preventing-n-plus-one-queries/).
