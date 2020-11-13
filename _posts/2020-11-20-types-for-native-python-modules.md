---
layout: post
title: Type Stubs for Native Python Modules
date: 2020-11-20
---

For [Kodiak](https://kodiakhq.com) we needed to find html comment positions
inside a string of markdown. All the existing Python markdown parsers didn't
expose the necessary AST node positions, but the Rust package,
[pulldown-cmark](https://github.com/raphlinus/pulldown-cmark) did.

With a little more Rust code and [pyo3](https://github.com/PyO3/PyO3), we get
a working Python module as a [`.whl`](https://github.com/pypa/wheel).

The only downside is that [pyo3 doesn't generate type stubs (`.pyi`
files)](https://github.com/PyO3/pyo3/issues/510) for the package and since the module
is a binary, using the module can't be type checked.

So what can we do?

1. Write the type stub by hand

   For `markdown-html-finder` it looks like this:

   `markdown_html_finder/__init__.pyi`

   ```python
   from typing import List, Tuple

   def find_html_positions(markdown: str) -> List[Tuple[int, int]]: ...
   ```

2. Add the type stub to the generated `.whl`

   Wheel provides a CLI for
   [unpacking](https://wheel.readthedocs.io/en/stable/reference/wheel_unpack.html)
   and
   [packing](https://wheel.readthedocs.io/en/stable/reference/wheel_pack.html)
   wheels.

   ```
   ./.venv/bin/wheel unpack markdown_html_finder-0.1.0.whl
   # need the py.typed file so type checkers will use types
   # see: https://www.python.org/dev/peps/pep-0561/#packaging-type-information
   touch markdown_html_finder/py.typed
   cp -R ./markdown_html_finder markdown_html_finder-0.1.0
   ./.venv/bin/wheel pack markdown_html_finder-0.1.0
   ```

3. Install the updated `.whl` and using the module will now be type checked. 🎉

For a more extensive example, checkout the [build script in the
`markdown-html-finder`
repo](https://github.com/chdsbd/markdown-html-finder/blob/master/s/build).
