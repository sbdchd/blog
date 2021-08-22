---
layout: post
title: "Are Parser Generators Common? No."
description: Handwritten vs generated language parsers
last_modified_at: 2021-08-22
---

So there are parser generators like Yacc, Bison, and friends, and
there are also handwritten parsers.

How often are parser generators used in mainstream languages compared to
handwritten ones?

After looking through some languages/implementations, I found 16/55 used generated
parsers.

| Language                    | Parser Type                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWK                         | [Generated](https://github.com/onetrueawk/awk/blob/f9affa922c5e074990a999d486d4bc823590fd93/awkgram.y)                                                                                   |
| Bash                        | [Generated](https://github.com/bminor/bash/blob/ce23728687ce9e584333367075c9deef413553fa/parse.y)                                                                                        |
| C# (Mono)                   | [Generated](https://github.com/mono/mono/blob/5bfe7a5d1bf980206e952fbc52b5c1deec342177/mcs/ilasm/parser/ILParser.jay)                                                                    |
| C# (Rosyln)                 | [Handwritten](https://github.com/dotnet/roslyn/blob/990f487dd477db0fecb14ab5aa4f0e66f416a437/src/Compilers/CSharp/Portable/Parser/LanguageParser.cs)                                     |
| C, C++, ObjC (Clang)        | [Handwritten](https://github.com/llvm-mirror/clang/blob/16f27fb3e9a4d061864859279b62392d602d2698/lib/Parse/Parser.cpp)                                                                   |
| C, C++, ObjC (GCC)          | [Handwritten](https://github.com/gcc-mirror/gcc/blob/9c66b1e3a61119eb7cb762ff72c40e7309c16d55/gcc/c/c-parser.c)                                                                          |
| CPython                     | [Handwritten](https://github.com/python/cpython/blob/d0f49d2f5085ca68e3dc8725f1fb1c9674bfb5ed/Parser/parser.c)                                                                           |
| Clojure                     | [Handwritten](https://github.com/clojure/clojure/blob/16ebe679e6a5fd1c7c24df5f9b9b5056bc18d2ec/src/jvm/clojure/lang/Compiler.java)                                                       |
| CQL                         | [Generated](https://github.com/apache/cassandra/blob/4b3f07fc74089151efeff7a8fdfa9c414a1f0d6a/src/antlr/Parser.g)                                                                        |
| CSS (Blink)                 | [Handwritten](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/css/parser/css_parser_impl.cc;drc=972fd182e6de46dbfbccfa22a9cc37f07b13feb1)       |
| CSS (Stylo)                 | [Handwritten](https://github.com/servo/rust-cssparser/blob/2bb4986383753a2e57c7a7e592337ed9c54cda15/src/parser.rs)                                                                       |
| CSS (Webkit)                | [Handwritten](https://github.com/WebKit/WebKit/blob/cd2a40978774593c76d3fb962eec5c468eb1ae84/Source/WebCore/css/parser/CSSParserImpl.cpp)                                                |
| Dart                        | [Handwritten](https://github.com/dart-lang/sdk/blob/86898c2ee6ad46758a43a197bcdc374591f2c5a5/pkg/_fe_analyzer_shared/lib/src/parser/parser_impl.dart)                                    |
| Elixir                      | [Generated](https://github.com/elixir-lang/elixir/blob/40180f0f4a9085705f32f440d3f579479fe07d47/lib/elixir/src/elixir_parser.yrl)                                                        |
| Elm                         | [Handwritten](https://github.com/elm/compiler/tree/fc503351bd0d1a0b8933ead01793d46e1baea37c/compiler/src/Parse)                                                                          |
| Erlang                      | [Generated](https://github.com/erlang/otp/blob/b2c338cb8d84567204765db87c7299519f1e1ad6/lib/compiler/src/core_parse.yrl)                                                                 |
| Fish                        | [Handwritten](https://github.com/fish-shell/fish-shell/blob/a9b4127f6851d825715492dfd36ca4ac73c42412/src/parser.cpp)                                                                     |
| Fortran (GNU)               | [Handwritten](https://github.com/gcc-mirror/gcc/blob/44eaa2dbff06529b6300b56fe5df4ff88b56a32c/gcc/fortran/parse.c)                                                                       |
| Fortran (LLVM)              | [Handwritten](https://github.com/llvm/llvm-project/blob/a83d99c55ebb14532c414066a5aa3bdb65389965/flang/lib/Parser/Fortran-parsers.cpp)                                                   |
| F#                          | [Generated](https://github.com/fsharp/fsharp/blob/8a897723b74b5dbcfacbaef86e46755fb403074b/src/fsharp/pars.fsy)                                                                          |
| Go                          | [Handwritten](https://github.com/golang/go/blob/37db664c6cd480b578d6114854bc20c2bc3cddcd/src/go/parser/parser.go)                                                                        |
| Hack                        | [Handwritten](https://github.com/facebook/hhvm/tree/d6131da93eef6a03ac485a6b2e0fdc0cfed253ff/hphp/hack/src/parser)                                                                       |
| Haskell                     | [Generated](https://github.com/ghc/ghc/blob/4edc6d64d1bc1898c0974cf26c5713a3b2724a0b/compiler/parser/Parser.y)                                                                           |
| HTML (Blink)                | [Handwritten](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/parser/html_document_parser.cc;drc=fda12c2b89e75eac9def8a15b7d18c8148b4e0e9) |
| HTML (Gecko)                | [Handwritten](https://hg.mozilla.org/mozilla-central/file/tip/parser/htmlparser/nsParser.cpp)                                                                                            |
| HTML (Webkit)               | [Handwritten](https://github.com/WebKit/WebKit/blob/cd2a40978774593c76d3fb962eec5c468eb1ae84/Source/WebCore/html/parser/HTMLDocumentParser.cpp)                                          |
| Java (OpenJDK)              | [Handwritten](http://hg.openjdk.java.net/jdk/jdk/file/c93f14a4ae29/src/jdk.compiler/share/classes/com/sun/source/)                                                                       |
| JavaScript (JavascriptCore) | [Handwritten](https://github.com/WebKit/WebKit/blob/cd2a40978774593c76d3fb962eec5c468eb1ae84/Source/JavaScriptCore/parser/Parser.cpp)                                                    |
| JavaScript (Spidermonkey)   | [Handwritten](https://searchfox.org/mozilla-central/rev/a3124addd11cbcf665ed6a37c88484eefe5dab5b/js/src/frontend/Parser.cpp)                                                             |
| JavaScript (V8)             | [Handwritten](https://github.com/v8/v8/blob/5cfe1a6b121ad004ec3d73b137f84f558aac0efd/src/parsing/parser.cc)                                                                              |
| JQ                          | [Generated](https://github.com/stedolan/jq/blob/d18b2d078c2383d9472d0a0a226e07009025574f/src/parser.y)                                                                                   |
| Kotlin                      | [Handwritten](https://github.com/JetBrains/kotlin/blob/5dea245a37f6258bdc9ab14225a61ffbf76324f4/compiler/psi/src/org/jetbrains/kotlin/parsing/KotlinParsing.java)                        |
| Lua (C)                     | [Handwritten](https://www.lua.org/source/5.3/lparser.c.html)                                                                                                                             |
| Lua (LuaJit)                | [Handwritten](https://github.com/LuaJIT/LuaJIT/blob/8ff09d9f5ad5b037926be2a50dc32b681c5e7597/src/lj_parse.c)                                                                             |
| Nim                         | [Handwritten](https://github.com/nim-lang/Nim/blob/5b26f2bd81d6fc7d48befbfb4fa3317f713af787/compiler/parser.nim)                                                                         |
| OCaml                       | [Generated](https://github.com/ocaml/ocaml/blob/8c75b5f1d6133585bc6c9d96ac5af04b0624892a/parsing/parser.mly)                                                                             |
| PHP                         | [Handwritten](https://github.com/php/php-src/blob/cdde07d059101a05bc43b79932b01d8228bcee40/Zend/zend_ast.c)                                                                              |
| Perl5                       | [Generated](https://github.com/Perl/perl5/blob/5feab405f7eeeed2157687018ee9aad3088b4a64/perly.y)                                                                                         |
| Perl6                       | [Handwritten](https://github.com/rakudo/rakudo/blob/19edeafd1cafc52d757e63fe1119ce5b7a5e34f9/src/Perl6/Actions.nqp)                                                                      |
| PyPy                        | [Handwritten](https://bitbucket.org/pypy/pypy/src/314ddd2d83c5e467aed4f64ab4b8b2fc0047540b/pypy/interpreter/pyparser/parser.py?at=default&fileviewer=file-view-default)                  |
| Ruby                        | [Generated](https://github.com/ruby/ruby/blob/e7db9df9820fd891742dba7ca977754e5d0c14ca/parse.y)                                                                                          |
| Rust                        | [Handwritten](https://github.com/rust-lang/rust/blob/79fcc58b24d85743d025fd880fca55748662ed3e/src/libsyntax/parse/parser.rs)                                                             |
| Scala                       | [Handwritten](https://github.com/scala/scala/blob/b75bfc3b78dbc1b4f254c86d68c2289f2833ecd9/src/compiler/scala/tools/nsc/ast/parser/Parsers.scala)                                        |
| Scss                        | [Handwritten](https://github.com/sass/dart-sass/blob/fd7eec9eacb3ac1b8c46388a66220c8f7a77ae2b/lib/src/parse/stylesheet.dart)                                                             |
| Sed                         | [Handwritten](https://github.com/mirror/sed/blob/07c9c74c6bffe92e856ba77789736b2a1d7f478e/sed/compile.c)                                                                                 |
| SQL (Clickhouse)            | [Handwritten](https://github.com/ClickHouse/ClickHouse/blob/e620ea15bdb08ebf3e9a580b0072350c9b3aeb9e/src/Parsers/parseQuery.cpp)                                                         |
| SQL (Cockroach)             | [Generated](https://github.com/cockroachdb/cockroach/blob/d18da6c092bf1522e7a6478fe3973817e318c247/pkg/sql/parser/sql.y)                                                                 |
| SQL (MySQL)                 | [Generated](https://github.com/mysql/mysql-server/blob/beb865a960b9a8a16cf999c323e46c5b0c67f21f/sql/sql_yacc.yy)                                                                         |
| SQL (Postgres)              | [Generated](https://github.com/postgres/postgres/blob/26ae66090398082c54ce046936fc41633dbfc41e/src/backend/parser/gram.y)                                                                |
| SQL (SQLite)                | [Generated](https://github.com/sqlite/sqlite/blob/2a0eefd66536fea7ac7f57d67ce97aa0b1da7338/src/parse.y)                                                                                  |
| Swift                       | [Handwritten](https://github.com/apple/swift/blob/3f787a1ad2d6774dfb9bf231e443fd771085efd4/lib/Parse/Parser.cpp)                                                                         |
| TCL                         | [Handwritten](https://github.com/tcltk/tcl/blob/efefa25af43d126bf9b2396c5d4879f02035f2fb/generic/tclParse.c)                                                                             |
| TypeScript                  | [Handwritten](https://github.com/Microsoft/TypeScript/blob/c57ff087d6b72f1ef5ffe54ab5c1b2710481bb94/src/compiler/parser.ts)                                                              |
| Visual Basic (Rosyln)       | [Handwritten](https://github.com/dotnet/roslyn/blob/990f487dd477db0fecb14ab5aa4f0e66f416a437/src/Compilers/VisualBasic/Portable/Parser/Parser.vb)                                        |
| Zsh                         | [Handwritten](https://github.com/zsh-users/zsh/blob/54d2c4fe5d4ea44dc6212f7c7dd119c4690c481e/Src/parse.c)                                                                                |
