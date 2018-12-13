---
layout: post
---

I was doing some recursive stuff in python and thought it might be neat to see
if you can detect recursion at runtime in python. It turned out to be pretty
simple with the help of the standard library's
[`inspect`](https://docs.python.org/3/library/inspect.html) module.


```python
from functools import wraps
import inspect

class RecursionDetected(RuntimeError):
    """function has been detected to be recursing"""

def not_recursive(f):
    """
    raise an exception if recursive
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        for frame in inspect.stack():
            if f.__name__ == frame.function:
                raise RecursionDetected(
                    f"function '{f.__name__}' is recursive"
                )

        return f(*args, **kwargs)
    return wrapper

# Examples

@not_recursive
def foo():
    pass

foo()
# works

@not_recursive
def bar(x = 10):
    if x == 0:
        return
    bar(x - 1)

bar()
# RecursionDetected: function 'bar' is recursive

# even works when the function doesn't directly call itself
def call_thunk(thunk):
    thunk()

@not_recursive
def buzz(x = 10):
    if x == 0:
        return
    call_thunk(lambda: buzz(x-1))

buzz()
# RecursionDetected: function 'buzz' is recursive
```
