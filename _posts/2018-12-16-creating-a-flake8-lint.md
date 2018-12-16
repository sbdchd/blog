---
layout: post
---

TSLint for TypeScript and Clippy for Rust have lints to warn about code that
assigns and then immediately returns the assignment.

TSLint will warn with an external lint,
[`no-unnecessary-local-variable`](no-unnecessary-local-variable).

```typescript
function foo() {
  const x = "bar"
  return x
}
```

And Clippy will warn us as well with the [`let_and_return`](https://rust-lang.github.io/rust-clippy/master/index.html#let_and_return) lint.

```rust
fn foo() -> String {
    let x = String::from("bar");
    x
}
```

But Python linters Pyflakes and Pylint do not warn about similarly problematic
code.

So let's build a lint for it.

We'll base our lint on Flake8 as Pyflakes doesn't have plugins and Pylint has
performance issues.

## Lint examples

We want the following cases to be true:

```python
# error
def foo() -> str:
    x = "bar"
    return x

# allowed because of tuple unpacking
def foo() -> str:
    x, _ = bar()
    return x

# allowed
def foo() -> str:
    return "bar"
```


## Implementing the lint

First we can inspect the AST for one of our examples.

```python
ast.dump(ast.parse("def foo(): x = 'bar'; return x"))

# if we format the returned string we get this:
Module(body=[
    FunctionDef(
        name="foo",
        args=arguments(
            args=[],
            vararg=None,
            kwonlyargs=[],
            kw_defaults=[],
            kwarg=None,
            defaults=[]
        ),
        body=[
            Assign(
                targets=[Name(id="x", ctx=Store())],
                value=Str(s="bar")
            ),
            Return(value=Name(id="x", ctx=Load()))
        ],
        decorator_list=[],
        returns=None
    )
])
```

Basically, we want to check if the `Return()` statement of a `FunctionDef()` has the
same value `Name()` as the second to last statement. We also want to ensure that we
check that the second to last statement is a `Name()` assignment and not a `Tuple()`.


The lint should look something like this:

```python
def is_assign_and_return(func: ast.FunctionDef) -> Optional[Tuple[int, int, str, str]]:
    # assign and return can only occur with at least two statements
    if len(func.body) >= 2:
        return_stmt = func.body[-1]
        if isinstance(return_stmt, ast.Return):
            assign_stmt = func.body[-2]
            if isinstance(assign_stmt, ast.Assign):
                # only assigned to a single variable
                if len(assign_stmt.targets) == 1 and isinstance(
                    assign_stmt.targets[0], ast.Name
                ):
                    if isinstance(return_stmt.value, ast.Name):
                        # check that assigned variable is the same one being returned
                        if return_stmt.value.id == assign_stmt.targets[0].id:
                            return (
                                return_stmt.lineno,
                                return_stmt.col_offset,
                                "assignment and return is not allowed",
                                "AssignAndReturnCheck"
                            )
    return None


func = ast.parse("def foo(): x = 'bar'; return x").body[0]
assert is_assign_and_return(func) is not None
```

## Creating a Flake8 plugin

So our function works, now we just need to hook into Flake8.

The basic structure of a Flake8 plugin is a `class` with a `run()` method and
some setup in the `setup.py`.

```python
from typing import NamedTuple


class ErrorTuple(NamedTuple):
    lineno: int
    col_offset: int
    message: str
    type: "YourLint"


class YourLint:
    name = "name-of-your-lint"
    version = __version__

    def __init__(self, tree: ast.Module) -> None:
        """
        you can specify more parameters for this and Flake8 will pass them in.
        see: http://flake8.pycqa.org/en/latest/plugin-development/plugin-parameters.html
        """
        self.tree = tree

    def run(self) -> Iterable[ErrorTuple]:
        """
        Flake8 calls this and expects it to `yield` errors
        """
        raise NotImplementedError
```

Now we we just need to create a function to return all the errors from a tree.

Looks like a job for [`ast.NodeVisitor`](https://docs.python.org/3.6/library/ast.html#ast.NodeVisitor).


```python
class AssignAndReturnVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.errors: List[ErrorLoc] = []

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """
        run checker function and track error if found
        """
        error = is_assign_and_return(node)
        if error is not None:
            self.errors.append(error)
```

This allows us to keep track of all the errors that occur in the entire
`ast.Module` and means we don't need to search the AST ourselves to find
`FunctionDef()`s.

All we have to do is just hook it up to the Flake8 lint class.


```python
class AssignAndReturnCheck:
    name = "flake8-assign-and-return"
    version = __version__

    def __init__(self, tree: ast.Module) -> None:
        self.tree = tree

    def run(self) -> Iterable[Tuple]:
        visitor = AssignAndReturnVisitor()

        visitor.visit(self.tree)

        yield from visitor.errors
```


## Putting it all together


```python
from typing import Optional, List, NamedTuple, Iterable, Tuple
from functools import partial
import ast


class ErrorLoc(NamedTuple):
    """
    location of the lint infraction
    """

    lineno: int
    col_offset: int

    message: str
    type: "AssignAndReturnCheck"


class AssignAndReturnVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.errors: List[ErrorLoc] = []

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """
        run checker function and track error if found
        """
        error = is_assign_and_return(node)
        if error is not None:
            self.errors.append(error)


def is_assign_and_return(func: ast.FunctionDef) -> Optional[ErrorLoc]:
    """
    check a FunctionDef for assignment and return where a user assigns to a
    variable and returns that variable instead of just returning
    """
    # assign and return can only occur with at least two statements
    if len(func.body) >= 2:
        return_stmt = func.body[-1]
        if isinstance(return_stmt, ast.Return):
            assign_stmt = func.body[-2]
            if isinstance(assign_stmt, ast.Assign):
                # only assigned to a single variable
                if len(assign_stmt.targets) == 1 and isinstance(
                    assign_stmt.targets[0], ast.Name
                ):
                    if isinstance(return_stmt.value, ast.Name):
                        # check that assigned variable is the same one being returned
                        if return_stmt.value.id == assign_stmt.targets[0].id:
                            return B781(
                                lineno=return_stmt.lineno,
                                col_offset=return_stmt.col_offset,
                            )
    return None


class AssignAndReturnCheck:
    name = "flake8-assign-and-return"
    version = __version__

    def __init__(self, tree: ast.Module) -> None:
        self.tree = tree

    def run(self) -> Iterable[Tuple]:
        visitor = AssignAndReturnVisitor()

        visitor.visit(self.tree)

        yield from visitor.errors


B781 = partial(
    ErrorLoc,
    message="B781: You are assinging to a variable and then returning. Instead remove the assignment and return.",
    type=AssignAndReturnCheck,
)
```

Then in the `setup.py` we just need to specify the `entry_points` for flake8.


```python
setup(
    # --snip--
    keywords="flake8, lint",
    entry_points={
        "flake8.extension": ["B = flake8_assign_and_return:AssignAndReturnCheck"]
    },
    install_requires=["flake8"],
    provides=["flake8_assign_and_return"],
    py_modules=["flake8_assign_and_return"],
)
```

## Conclusion

And that is it. Just `python setup.py install` and `Flake8` will see the plugin.

I've put this lint, along with some tests, into a
[repo](https://github.com/sbdchd/flake8-assign-and-return). The package is also available
on [pypi](https://pypi.org/project/flake8-assign-and-return/).
