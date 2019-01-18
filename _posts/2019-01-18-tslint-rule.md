---
layout: post
---

In a [previous post]({% post_url 2018-12-16-creating-a-flake8-lint %}) I went
over how to make a [Flake8](http://flake8.pycqa.org/en/latest/) lint. Creating
a [TSLint](https://github.com/palantir/tslint) rule turned out to be [pretty
similar](https://github.com/sbdchd/tslint-cake).

With Flake8 we use the [`ast`
module](https://docs.python.org/3.8/library/ast.html) from Python's standard
library and inherit from
[`ast.NodeVisitor`](https://docs.python.org/3.8/library/ast.html#ast.NodeVisitor).
In TSLint we import and extend TSLint's equivalent, `Lint.RuleWalker`.

Introspection of the TypeScript AST involves flipping between [AST
Explorer](https://astexplorer.net) and your editor trying to get TypeScript to
auto-complete the corresponding type guard, but then realizing that
`TrueKeyword` doesn't have a type guard and that you need to check the `kind`
attribute against the `SyntaxKind` `enum` yourself.

Although AST Explorer is much nicer than `ast.dump(ast.parse("foo()"))`, the
Python AST has greater simplicity in refinement where the Python AST is just
classes and `isinstance()` functions as the universal type guard.

Overall, TSLint's docs for [creating a custom
rule](type-guards-and-differentiating-types) are quite thorough and provide you
with everything you need to create a lint.

A couple minor things I ran into:

1. make sure your rule files end in `Rule`, otherwise you will run into lint
   not found issues.
   ```
   Could not find implementations for the following rules specified in the configuration:
       jsx-no-true-attribute
   Try upgrading TSLint and/or ensuring that you have all necessary custom rules installed.
   If TSLint was recently upgraded, you may have old rules configured which need to be cleaned up.

   No valid rules have been specified for TypeScript files
   ```

2. create a `tslint-$PKG_NAME.json` file so that installing the lint is easier.
   This allows for `extends: ['$PKG_NAME']` in `tslint.json` instead of having
   to configure the rules directories `rulesDirectories:
   ['node_modules/$PKG_NAME/dist/rules']`
