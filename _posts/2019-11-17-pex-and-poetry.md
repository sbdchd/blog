---
layout: post
date: 2019-11-17
title: "Distributing a Python Project with Pex and Poetry"
---

## Overview

[`poetry`](https://github.com/sdispater/poetry) is a Python packaging manager
similar to [`yarn`](https://github.com/yarnpkg/yarn) for the JS ecosystem.

[`pex`](https://github.com/pantsbuild/pex) is a build tool that takes Python
packages (your code and its dependencies) and combines them into a static
executable (zip file).

[Buck](https://buck.build/rule/python_binary.html) and
[Pants](https://www.pantsbuild.org/build_dictionary.html#bdict_python_binary)
both use Pex files for their `python_binary()` rules and Bazel uses an
[equivalent](https://docs.bazel.build/versions/master/be/python.html).

Since the binary includes all of the necessary dependencies, distribution is a
simple `cp`. For CLI tools this is handy, although
[`pipx`](https://github.com/pipxproject/pipx) has obviated the need, but for
web services, this means this means you can use a multi-stage docker build,
similar to a compiled language, where you install dependencies
& compile the project in the first stage, and simply copy over the
build artifact, your binary, in the second stage. The binary serves as the
container entrypoint.

## Creating a `.pex` executable

### First some setup.

We need:

- `pypyproject.toml`
- `poetry.lock`
- `main.py`

Let's create our poetry files:

```shell
poetry init --no-interaction
poetry add uvicorn fastapi
```

And with a little help from the [FastAPI](https://fastapi.tiangolo.com) intro
we have our `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}
```

### A hello world, let's get packaging.

Ideally we'd call `pex` with our `pyproject.toml`, something like:

```
pex \
  --project=pyproject.toml \
  --script=uvicorn \
  --sources-directory=. \
  --output-file=service.pex
```

and `pex` would resolve dependencies according to the `pyproject.toml` and
`poetry.lock`. But we can't, so we have to resort to dumping our `virtualenv`
to a `requirements.txt`, which `pex` knows how to handle.

Instead we run:

```
poetry install
poetry run pip freeze > requirements.txt
pex \
  --requirement=requirements.txt \
  --script=uvicorn \
  --sources-directory=. \
  --output-file=service.pex
```

And out pops an executable, `service.pex`.

Let's move our `service.pex` to a new directory to demonstrate the static
nature of the binary and try running it:

```shell
TMP_DIR=$(mktemp -d)
mv service.pex "$TMP_DIR"
cd "$TMP_DIR"
./service.pex main:app

WARNING:  email-validator not installed, email fields will be treated as str.
To install, run: pip install email-validator
INFO:     Started server process [72194]
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

It works, no venv activation, poetry install or even copying of Python source
files. Everything is in the `.pex` file. 🎉
