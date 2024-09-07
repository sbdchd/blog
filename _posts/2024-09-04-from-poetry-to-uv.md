---
layout: post
title: "From poetry to uv"
description: "Faster installs for python"
---

Now that [`uv`](https://docs.astral.sh/uv/) supports lock files, we can finally migrate from [`poetry`](https://python-poetry.org).

## Attempt 1: poetry_to_uv

Having installed `uv` using `pipx`:

```shell
pipx install uv
```

```shell
uv pip install poetry_to_uv
uv run poetry_to_uv
```

This failed with:

```
❯ uv run poetry_to_uv
error: No `project` table found in: `~/recipeyak/backend/pyproject.toml`
```

then I tried:

```shell
trash pyproject.toml
uv init
uv run poetry_to_uv
```

and got a different error:

```
❯ uv run poetry_to_uv
   Built backend @ file:///~/recipeyak/backend
Uninstalled 1 package in 1ms
Installed 1 package in 1ms
Traceback (most recent call last):
  File "~/recipeyak/backend/.venv/bin/poetry_to_uv", line 5, in <module>
    from poetry_to_uv.__main__ import cli_entrypoint
  File "~/recipeyak/backend/.venv/lib/python3.11/site-packages/poetry_to_uv/__main__.py", line 4, in <module>
    from poetry_to_uv.convertor import PoetryToUv
  File "~/recipeyak/backend/.venv/lib/python3.11/site-packages/poetry_to_uv/convertor.py", line 8, in <module>
    from packaging.utils import NormalizedName, canonicalize_name
ImportError: cannot import name 'NormalizedName' from 'packaging.utils' (~/recipeyak/backend/.venv/lib/python3.11/site-packages/packaging/utils.py)
```

## Attempt 2: Poetry export

```shell
poetry export -f requirements.txt --output requirements.txt
trash pyproject.toml
uv init
uv add -r requirements.txt
```

but this output some pretty gnarly looking dependencies in the `pyproject.toml`:

```toml
[project]
name = "backend"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "ably==2.0.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "advocate==1.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "aiohttp==3.9.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "aiosignal==1.3.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "algoliasearch==3.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "annotated-types==0.6.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "anyio==3.6.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "asgiref==3.4.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "async-timeout==4.0.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "asyncpg-stubs==0.27.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "asyncpg==0.27.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "attrs==21.4.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "beautifulsoup4==4.11.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "boto3==1.24.44 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "botocore==1.27.44 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "certifi==2019.3.9 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "cffi==1.15.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "charset-normalizer==2.1.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "click==8.1.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "colorama==0.4.1 ; python_full_version >= '3.10' and python_full_version < '4.0' and platform_system == 'Windows'",
    "cryptography==35.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "dj-database-url==0.4.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "django-user-sessions==1.6.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "django==3.2.9 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "djangorestframework-types==0.2.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "dnspython==2.4.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "email-validator==2.1.0.post1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "extruct==0.13.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "filelock==3.9.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "frozenlist==1.4.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "gunicorn==20.1.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "h11==0.14.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "h2==4.1.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "hpack==4.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "html-text==0.5.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "html5lib==1.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "httpcore==0.16.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "httpx==0.23.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "hyperframe==6.0.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "idna==2.8 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "isodate==0.6.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "jmespath==1.0.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "jsonref==1.1.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "jstyleson==0.0.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "lxml==4.9.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "methoddispatch==3.0.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "mf2py==1.1.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "msgpack==1.0.5 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "multidict==6.0.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "ndg-httpsclient==0.5.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "netifaces==0.11.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "orjson==3.8.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pillow-heif==0.9.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pillow==9.3.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "psycopg2-binary==2.9.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pyasn1==0.4.8 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pycparser==2.21 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pydantic-core==2.14.6 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pydantic-settings==2.1.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pydantic[email]==2.5.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pyee==9.1.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pyopenssl==22.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pyparsing==2.4.7 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pyrdfa3==3.5.3 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "python-dateutil==2.8.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "python-dotenv==0.21.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pytz==2018.9 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "pywatchman==2.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "rdflib-jsonld==0.6.2 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "rdflib==6.2.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "recipe-scrapers==14.52.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "requests-file==1.5.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "requests==2.28.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "rfc3986[idna2008]==1.5.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "ruamel-yaml-clib==0.2.8 ; python_full_version >= '3.10' and python_full_version < '3.13' and platform_python_implementation == 'CPython'",
    "ruamel-yaml==0.18.5 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "s3transfer==0.6.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "sentry-sdk==1.35.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "setuptools==69.0.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "six==1.12.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "sniffio==1.3.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "soupsieve==2.3.2.post1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "sqlparse==0.2.4 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "structlog==22.3.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "tldextract==3.4.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "typer==0.7.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "types-pillow==9.3.0.4 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "typing-extensions==4.9.0 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "urllib3==1.26.11 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "w3lib==2.0.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "webencodings==0.5.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "websockets==10.4 ; python_full_version >= '3.10' and python_full_version < '4.0'",
    "yarl==1.8.1 ; python_full_version >= '3.10' and python_full_version < '4.0'",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

## Attempt 3: Manually add dependencies

0. clean slate

   ```shell
   trash pyproject.toml
   uv init
   ```

1. copy `[tool.poetry.dependencies]`

   ```toml
   [tool.poetry.dependencies]
   python = "^3.10"
   Django = "^3.2.9"
   dj-database-url = "0.4.2"
   gunicorn = "20.1.0"
   django-user-sessions = "^1.6"
   python-dotenv = "0.21.0"
   djangorestframework-types = "^0.2.0"
   orjson = "3.8.1"
   psycopg2-binary = "^2.9.3"
   boto3 = "^1.24.44"
   yarl = "^1.8.1"
   advocate = "^1.0.0"
   Pillow = "^9.3.0"
   httpx = "^0.23.1"
   asyncpg = "^0.27.0"
   asyncpg-stubs = "^0.27.0"
   typer = "^0.7.0"
   structlog = "^22.3.0"
   types-Pillow = "^9.3.0"
   pillow-heif = "^0.9.0"
   tldextract = "^3.4.0"
   sentry-sdk = "^1.35.0"
   ably = "^2.0.1"
   recipe-scrapers = "^14.52.0"
   algoliasearch = "^3.0.0"
   async-timeout = "^4.0.3"
   aiohttp = "^3.9.1"
   ruamel-yaml = "^0.18.5"
   pydantic = {extras = ["email"], version = "^2.5.3"}
   pydantic-settings = "^2.1.0"
   jsonref = "^1.1.0"
   pywatchman = "^2.0.0"
   ```

2. set aside any dependencies that install `extras` and remove `python`

   ```
   pydantic = {extras = ["email"], version = "^2.5.3"}
   ```

3. update formatting from `poetry` to `uv`

   - `recipe-scrapers = "^14.52.0"` becomes `recipe-scrapers~=14.52.0`
   - `python-dotenv = "0.21.0"` becomes `python-dotenv==0.21.0`

   a little vim to help:

   ```
   :%s/="^/\~=/g
   :%s/="/==/g
   :%s/"//g
   :%s/\n/ /gE
   iuv run
   ```

   giving:

   ```shell
   uv run Django~=3.2.9 dj-database-url==0.4.2 gunicorn==20.1.0 django-user-sessions~=1.6 python-dotenv==0.21.0 djangorestframework-types~=0.2.0 orjson==3.8.1 psycopg2-binary~=2.9.3 boto3~=1.24.44 yarl~=1.8.1 advocate~=1.0.0 Pillow~=9.3.0 httpx~=0.23.1 asyncpg~=0.27.0 asyncpg-stubs~=0.27.0 typer~=0.7.0 structlog~=22.3.0 types-Pillow~=9.3.0 pillow-heif~=0.9.0 tldextract~=3.4.0 sentry-sdk~=1.35.0 ably~=2.0.1 recipe-scrapers~=14.52.0 algoliasearch~=3.0.0 async-timeout~=4.0.3 aiohttp~=3.9.1 ruamel-yaml~=0.18.5 pydantic-settings~=2.1.0 jsonref~=1.1.0 pywatchman~=2.0.0
   ```

   which runs successfully!

4. repeat steps 1-3 for the dev dependencies

   ```toml
   [tool.poetry.dev-dependencies]
   pytest = "7.2.0"
   pytest-django = "4.5.2"
   ipdb = "^0.13.9"
   django-types = "^0.19.1"
   types-PyYAML = "^6.0.0"
   types-requests = "^2.25.11"
   syrupy = "^3.0.5"
   boto3-stubs = {extras = ["s3"], version = "^1.24.44"}
   types-urllib3 = "^1.26.23"
   types-dj-database-url = "^1.0.0"
   mypy = "^1.7.0"

   [tool.poetry.group.dev.dependencies]
   bpython = "^0.24"
   ruff = "^0.3.5"
   pytest-xdist = "^3.5.0"
   ```

   But update the run command to include the `--dev` flag:

   ```shell
   uv add --dev pytest==7.2.0 pytest-django==4.5.2 ipdb~=0.13.9 django-types~=0.19.1 types-PyYAML~=6.0.0 types-requests~=2.25.11 syrupy~=3.0.5 types-urllib3~=1.26.23 types-dj-database-url~=1.0.0 mypy~=1.7.0 bpython~=0.24 ruff~=0.3.5 pytest-xdist~=3.5.0
   ```

5. handle the dependencies with `extras`

   ```shell
   uv add pydantic~=2.5.3 --extra email
   uv add --dev boto3-stubs~=1.24.44 --extra s3
   ```

6. add back the existing stuff to `pyproject.toml` deleted in the first part

7. update authors syntax

   I ran `uv sync` and hit:

   ```shell
   Resolved 143 packages in 2ms
   error: Failed to prepare distributions
     Caused by: Failed to fetch wheel: backend @ file://~/projects/recipeyak/backend
     Caused by: Build backend failed to build editable through `build_editable()` with exit status: 1
   --- stdout:

   --- stderr:
   Traceback (most recent call last):
     File "<string>", line 11, in <module>
     File "~/.cache/uv/builds-v0/.tmp0olTuB/lib/python3.11/site-packages/hatchling/build.py", line 83, in build_editable
       return os.path.basename(next(builder.build(directory=wheel_directory, versions=['editable'])))
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmp0olTuB/lib/python3.11/site-packages/hatchling/builders/plugin/interface.py", line 90, in build
       self.metadata.validate_fields()
     File "~/.cache/uv/builds-v0/.tmp0olTuB/lib/python3.11/site-packages/hatchling/metadata/core.py", line 266, in validate_fields
       self.core.validate_fields()
     File "~/.cache/uv/builds-v0/.tmp0olTuB/lib/python3.11/site-packages/hatchling/metadata/core.py", line 1376, in validate_fields
       getattr(self, attribute)
     File "~/.cache/uv/builds-v0/.tmp0olTuB/lib/python3.11/site-packages/hatchling/metadata/core.py", line 833, in authors
       raise TypeError(message)
   TypeError: Author #1 of field `project.authors` must be an inline table
   ```

   Turns out poetry and [pep-0621](https://peps.python.org/pep-0621/#authors-maintainers)/[`hatchling`](https://github.com/pypa/packaging.python.org/issues/1134) differ in how they want authors structured.

   So I updated them from:

   ```toml
   authors = ["Person1 <person1@example.org>", "Person2 <person2@example.org>"]
   ```

   to:

   ```toml
   authors = [
     { name="Person1", email="person1@example.org" },
     { name="Person2", email="person2@example.org" },
   ]
   ```

   then I ran `uv sync` again and hit:

   ```
   ❯ uv sync
   Resolved 143 packages in 5ms
   error: Failed to prepare distributions
     Caused by: Failed to fetch wheel: backend @ file://~/projects/recipeyak/backend
     Caused by: Build backend failed to build wheel through `build_editable()` with exit status: 1
   --- stdout:

   --- stderr:
   Traceback (most recent call last):
     File "<string>", line 11, in <module>
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/build.py", line 83, in build_editable
       return os.path.basename(next(builder.build(directory=wheel_directory, versions=['editable'])))
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/plugin/interface.py", line 155, in build
       artifact = version_api[version](directory, **build_data)
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/wheel.py", line 494, in build_editable
       return self.build_editable_detection(directory, **build_data)
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/wheel.py", line 505, in build_editable_detection
       for included_file in self.recurse_selected_project_files():
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/plugin/interface.py", line 180, in recurse_selected_project_files
       if self.config.only_include:
          ^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/config.py", line 806, in only_include
       only_include = only_include_config.get('only-include', self.default_only_include()) or self.packages
                                                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/wheel.py", line 260, in default_only_include
       return self.default_file_selection_options.only_include
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File "~/.pyenv/versions/3.11.0/lib/python3.11/functools.py", line 1001, in __get__
       val = self.func(instance)
             ^^^^^^^^^^^^^^^^^^^
     File "~/.cache/uv/builds-v0/.tmpttjUsj/lib/python3.11/site-packages/hatchling/builders/wheel.py", line 248, in default_file_selection_options
       raise ValueError(message)
   ValueError: Unable to determine which files to ship inside the wheel using the following heuristics: https://hatch.pypa.io/latest/plugins/builder/wheel/#default-file-selection

   The most likely cause of this is that there is no directory that matches the name of your project (backend).

   At least one file selection option must be defined in the `tool.hatch.build.targets.wheel` table, see: https://hatch.pypa.io/latest/config/build/

   As an example, if you intend to ship a directory named `foo` that resides within a `src` directory located at the root of your project, you can define the following:

   [tool.hatch.build.targets.wheel]
   packages = ["src/foo"]
   ---
   ```

   I then removed the build system settings:

   ```toml
   [build-system]
   requires = ["hatchling"]
   build-backend = "hatchling.build"
   ```

   and ran `uv sync` giving:

   ```
   Resolved 143 packages in 10ms
   error: Failed to prepare distributions
     Caused by: Failed to fetch wheel: backend @ file://~/projects/recipeyak/backend
     Caused by: Build backend failed to determine extra requires with `build_editable()` with exit status: 1
   --- stdout:

   --- stderr:
   error: Multiple top-level packages discovered in a flat-layout: ['s', 'typings', 'recipeyak', 'node_modules'].

   To avoid accidental inclusion of unwanted files or directories,
   setuptools will not proceed with this build.

   If you are trying to create a single distribution with multiple packages
   on purpose, you should not rely on automatic discovery.
   Instead, consider the following options:

   1. set up custom discovery (`find` directive with `include` or `exclude`)
   2. use a `src-layout`
   3. explicitly set `py_modules` or `packages` with a list of names

   To find more information, look for "package discovery" on setuptools docs.
   ---
   ```

   after checking out the docs, I updated the `pyproject.toml` with:

   ```toml
   [tool.setuptools]
   packages = ["recipeyak"]
   ```

   This project doesn't really "build" like a library, there's no wheel we're pushing up to `pypi`. Instead [we run `gunicorn` pointed at `recipeyak/api/base/wsgi.py`](https://github.com/recipeyak/recipeyak/blob/457b2840cdbd22ee9495b9805085bef2568ae693/backend/entrypoint.sh#L7C33-L7C97). So I don't think our "build" setup matters that much.

8. Update GitHub Actions

   **Install uv**

   ```yaml
   - name: Install poetry
     run: |
       pipx install poetry==1.7.1
       poetry config virtualenvs.in-project true
   ```

   becomes:

   ```yaml
   - name: Install uv
     uses: astral-sh/setup-uv@v1
     with:
       version: "0.4.5"
       enable-cache: true
       cache-dependency-glob: "backend/uv.lock"
   ```

   **Setup python**

   ```yaml
   - uses: actions/setup-python@v4
     with:
       python-version-file: "./backend/.python-version"
       cache: poetry
       cache-dependency-path: "./backend/poetry.lock"
   ```

   becomes:

   ```yaml
   - uses: actions/setup-python@v4
     with:
       python-version-file: "./backend/.python-version"
   ```

   **Install Dependencies**

   ```yaml
   - name: Install dependencies
     working-directory: "./backend"
     run: poetry install
   ```

   becomes:

   ```yaml
   - name: Install dependencies
     working-directory: "./backend"
     run: uv sync --locked
   ```

9. Merge the PR

   [infra: move from poetry to uv #1496](https://github.com/recipeyak/recipeyak/pull/1496)

## Conclusion

Wasn't too hard to migrate and now CI is a bit faster, rough estimate:

### poetry

| Step                 | Time    |
| -------------------- | ------- |
| Setup python         | 11s     |
| Install poetry       | 6s      |
| Install dependencies | 26s     |
| **Total**            | **43s** |

### uv

| Step                 | Time    |
| -------------------- | ------- |
| Setup python         | 8s      |
| Install uv           | 6s      |
| Install dependencies | 2s      |
| **Total**            | **16s** |
