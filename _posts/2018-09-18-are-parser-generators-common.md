---
layout: post
title:  "Are Parser Generators Common? No."
---

So there are parser generators like Yacc, Bison, and friends, and
there are also handwritten parsers.

How often are parser generators used in mainstream languages compared to
handwritten ones?

After looking through some languages/implementations, I found 9/26 used generated
parsers, with the remaining 17/26 using handwritten parsers.

| Language             | Parser Type                      |
| -------------------- | -------------------------------- |
| Bash                 | [Generated][zsh-parser]          |
| C# (Mono)            | [Generated][c-sharp-parser]      |
| C, C++, ObjC (Clang) | [Handwritten][clang-parser]      |
| C, C++, ObjC (GCC)   | [Handwritten][gcc-parser]        |
| CPython              | [Handwritten][cpython-parser]    |
| Clojure              | [Handwritten][clojure-parser]    |
| Elixir               | [Generated][elixir-parser]       |
| Erlang               | [Generated][erlang-parser]       |
| F#                   | [Generated][f-sharp-parser]      |
| Go                   | [Handwritten][go-parser]         |
| Haskell              | [Generated][haskell-parser]      |
| Java                 | [Handwritten][java-parser]       |
| JavaScript (V8)      | [Handwritten][js-v8-parser]      |
| Kotlin               | [Handwritten][kotlin-parser]     |
| Lua                  | [Handwritten][lua-parser]        |
| OCaml                | [Generated][ocaml-generated]     |
| PHP                  | [Handwritten][php-parser]        |
| Perl5                | [Generated][perl5-parser]        |
| Perl6                | [Handwritten][perl6-parser]      |
| PyPy                 | [Handwritten][pypy-parser]       |
| Ruby                 | [Generated][ruby-parser]         |
| Rust                 | [Handwritten][rust-parser]       |
| Scala                | [Handwritten][scala-parser]      |
| Swift                | [Handwritten][swift-parser]      |
| TypeScript           | [Handwritten][typescript-parser] |
| Zsh                  | [Handwritten][zsh-parser]        |

[lua-parser]: https://www.lua.org/source/5.3/lparser.c.html

[cpython-parser]: https://github.com/python/cpython/blob/d0f49d2f5085ca68e3dc8725f1fb1c9674bfb5ed/Parser/parser.c

[pypy-parser]: https://bitbucket.org/pypy/pypy/src/314ddd2d83c5e467aed4f64ab4b8b2fc0047540b/pypy/interpreter/pyparser/parser.py?at=default&fileviewer=file-view-default

[rust-parser]: https://github.com/rust-lang/rust/blob/79fcc58b24d85743d025fd880fca55748662ed3e/src/libsyntax/parse/parser.rs

[ocaml-generated]: https://github.com/ocaml/ocaml/blob/8c75b5f1d6133585bc6c9d96ac5af04b0624892a/parsing/parser.mly

[haskell-parser]: https://github.com/ghc/ghc/blob/4edc6d64d1bc1898c0974cf26c5713a3b2724a0b/compiler/parser/Parser.y

[gcc-parser]: https://github.com/gcc-mirror/gcc/blob/9c66b1e3a61119eb7cb762ff72c40e7309c16d55/gcc/c/c-parser.c

[clang-parser]: https://github.com/llvm-mirror/clang/blob/16f27fb3e9a4d061864859279b62392d602d2698/lib/Parse/Parser.cpp

[ruby-parser]: https://github.com/ruby/ruby/blob/e7db9df9820fd891742dba7ca977754e5d0c14ca/parse.y

[java-parser]: http://hg.openjdk.java.net/jdk/jdk/file/c93f14a4ae29/src/jdk.compiler/share/classes/com/sun/source/

[clojure-parser]: https://github.com/clojure/clojure/blob/16ebe679e6a5fd1c7c24df5f9b9b5056bc18d2ec/src/jvm/clojure/lang/Compiler.java

[scala-parser]: https://github.com/scala/scala/blob/b75bfc3b78dbc1b4f254c86d68c2289f2833ecd9/src/compiler/scala/tools/nsc/ast/parser/Parsers.scala

[kotlin-parser]: https://github.com/JetBrains/kotlin/blob/5dea245a37f6258bdc9ab14225a61ffbf76324f4/compiler/psi/src/org/jetbrains/kotlin/parsing/KotlinParsing.java

[c-sharp-parser]: https://github.com/mono/mono/blob/5bfe7a5d1bf980206e952fbc52b5c1deec342177/mcs/ilasm/parser/ILParser.jay

[f-sharp-parser]: https://github.com/fsharp/fsharp/blob/8a897723b74b5dbcfacbaef86e46755fb403074b/src/fsharp/pars.fsy

[php-parser]: https://github.com/php/php-src/blob/cdde07d059101a05bc43b79932b01d8228bcee40/Zend/zend_ast.c

[perl6-parser]: https://github.com/rakudo/rakudo/blob/19edeafd1cafc52d757e63fe1119ce5b7a5e34f9/src/Perl6/Actions.nqp

[zsh-parser]: https://github.com/zsh-users/zsh/blob/54d2c4fe5d4ea44dc6212f7c7dd119c4690c481e/Src/parse.c

[erlang-parser]: https://github.com/erlang/otp/blob/b2c338cb8d84567204765db87c7299519f1e1ad6/lib/compiler/src/core_parse.yrl

[elixir-parser]: https://github.com/elixir-lang/elixir/blob/40180f0f4a9085705f32f440d3f579479fe07d47/lib/elixir/src/elixir_parser.yrl

[swift-parser]: https://github.com/apple/swift/blob/3f787a1ad2d6774dfb9bf231e443fd771085efd4/lib/Parse/Parser.cpp

[js-v8-parser]: https://github.com/v8/v8/blob/5cfe1a6b121ad004ec3d73b137f84f558aac0efd/src/parsing/parser.cc

[typescript-parser]: https://github.com/Microsoft/TypeScript/blob/c57ff087d6b72f1ef5ffe54ab5c1b2710481bb94/src/compiler/parser.ts

[go-parser]: https://github.com/golang/go/blob/37db664c6cd480b578d6114854bc20c2bc3cddcd/src/go/parser/parser.go

[perl5-parser]: https://github.com/Perl/perl5/blob/5feab405f7eeeed2157687018ee9aad3088b4a64/perly.y
