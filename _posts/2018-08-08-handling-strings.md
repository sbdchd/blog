---
layout: post
---

## background

Through the trials and tribulations of debugging a broken zsh setup, I found a
[nice blog post about unicode][blog-post] — It's the inspiration for
this post.

The goal of this post is to explore how various languages measure string
length by default or with a built-in helper function. Generally, if a language
doesn't implement the latest unicode standards in its string implementation,
there is a library that will. The point here is to find languages that provide
unicode-friendly string length _without_ the use of 3rd party libraries.

We will use the emoji family `"👨‍👩‍👧‍👦"` in our tests,
which is a bit more tricky than some äccénts or Сyrilliс сhars.

## definitions

**Code Point** — any character in a Unicode set

**Zero Width Joiner (ZWJ)** — an invisible character that joins surrounding characters

**Grapheme Base** — almost any character including most spacing

**Extended Grapheme Cluster** (**EGC**) — a user-perceived character.
The emoji family (👨‍👩‍👧‍👦) is good example of this.

The family we are using to test is made up of multiple grapheme base
characters with some joiners, but to the user it's a single character.


Note: There are both legacy grapheme clusters and extend grapheme clusters,
but to quote a [unicode report][unicode-report], "the legacy grapheme cluster boundaries are
maintained primarily for backwards compatibility with earlier versions of this
specification."

for more rigorous definitions, see:

- <https://unicode.org/glossary/#extended_grapheme_cluster>
- <http://unicode.org/reports/tr29/>
- <http://www.unicode.org/versions/Unicode11.0.0/ch03.pdf#G30602>

## measuring string length

Languages break down into those that:

1. understand EGCs
2. know about codepoints
  - some count joiners, some don't
3. just return the number of bytes in a string


**1. Languages that understand EGCs**


```swift
     Swift version 4.0.3
  1> "👨‍👩‍👧‍👦".count
$R0: String.IndexDistance = 1

  2> String("👨‍👩‍👧‍👦".reversed())
$R1: String = "👨‍👩‍👧‍👦"
```

```shell
perl6 -e 'print elems "👨‍👩‍👧‍👦"'
1
```

```ruby
# ruby --version
# ruby 2.5.1p57 (2018-03-29 revision 63029) [x86_64-darwin16]

irb(main):001:0> "👨‍👩‍👧‍👦".length
=> 7
irb(main):002:0> "👨‍👩‍👧‍👦".each_grapheme_cluster.to_a.size
=> 1
```

```julia
               _
   _       _ _(_)_     |  A fresh approach to technical computing
  (_)     | (_) (_)    |  Documentation: https://docs.julialang.org
   _ _   _| |_  __ _   |  Type "?help" for help.
  | | | | | | |/ _` |  |
  | | |_| | | | (_| |  |  Version 0.6.2 (2017-12-13 18:08 UTC)
 _/ |\__'_|_|_|\__'_|  |
|__/                   |  x86_64-apple-darwin16.6.0

julia> length("👨‍👩‍👦‍👦")
25

julia> length(graphemes("👨‍👩‍👦‍👦"))
1
```

**2. Languages that understand code points**


```python
# python --version
# Python 3.6.4

In [1]: len("👨‍👩‍👧‍👦")
Out[1]: 7
```

```scala
Welcome to Scala 2.12.1 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_66).
Type in expressions for evaluation. Or try :help.

scala> val s = "👨‍👩‍👧‍👦"
x: String = 👨‍👩‍👧‍👦

scala> s.length
res0: Int = 11

scala> x.codePointCount(0, s.length)
res1: Int = 7
```

`ghci` was not happy with me pasting the family, and would delete every family member except the father.

As a workaround, we can just paste each family member individually and write
out the zero width joiners (ZWJ) using their hex escape sequences.

```haskell
GHCi, version 8.0.1: http://www.haskell.org/ghc/  :? for help
Prelude> length "👨\x200D👩\x200D👧\x200D👦"
7
```

```shell
# zsh 5.5.1 (x86_64-apple-darwin16.7.0)
echo -n "👨‍👩‍👧‍👦" | wc -m

       7
```

```erlang
Erlang/OTP 18 [erts-7.3] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

Eshell V7.3  (abort with ^G)
1> length("👨‍👩‍👧‍👦").
7
```

As we see below, Elixir doesn't count ZWJs when they are joining
something, which results in our family being 4 in length.

```elixir
Erlang/OTP 18 [erts-7.3] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

Interactive Elixir (1.2.4) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> String.length "👨‍👩‍👧‍👦"
4
iex(2)> String.length "👨\u{200D}👩\u{200D}👧\u{200D}👦"
4
iex(3)> String.length "👨"
1
iex(4)> String.length "\u{200D}"
1
iex(5)> String.length "👨\u{200D}"
1
```

```go
// go version go1.8 darwin/amd64
package main

import "unicode/utf8"
import "fmt"

func main() {
	s := "👨‍👩‍👧‍👦"
	fmt.Println(len(s), utf8.RuneCountInString(s))
}

go run main.go

25 7
```

JavaScript will use one or two utf-16 codepoints to represent characters ([see
mdn][js-str]). So when we take the length of our family, we have one codepoint
for each ZWJ, and two codepoints for each person.

```javascript
// node --version
// v9.5.0
> "👨‍👩‍👧‍👦".length
11
```

**3. Languages that return the number of bytes**

OCaml's `String` [module][ocaml-string] uses single byte characters. This
results in each of our ZWJs becoming 3 single-byte characters, and each emoji
family member being represented as 4 single-byte characters.

```ocaml
  OCaml version 4.03.0+dev11-2015-10-19
# let s = "👨‍👩‍👧‍👦";;
val s : string =
  "\240\159\145\168\226\128\141\240\159\145\169\226\128\141\240\159\145\167\226\128\141\240\159\145\166"

# String.length s;;
- : int = 25
```

```shell
perl -e 'print length "👨‍👩‍👧‍👦"'
25
```

```c
# Apple LLVM version 9.0.0 (clang-900.0.39.2)
clang -xc - <<-EOF
  #include <stdio.h>
  #include <string.h>

  int main(void) {

    const char* s = "👨‍👩‍👧‍👦";

    int length = strlen(s);

    printf("%d", length);

    return 0;
  }
EOF

./a.out

25
```

```rust
// rustc 1.23.0
// emoji.rs
fn main() {
  println!("{}", String::from("👨‍👩‍👧‍👦").len());
}

rustc emoji.rs

./emoji.rs
25
```


## does it matter?

It depends. Most of the time you aren't deciding where to break text, but you
might in the future, so keep EGCs in mind.

Also, if you find yourself doing string reversals, test with an emoji family.
If your language or library doesn't understand EGCs, you're going to have a bad
time.

## tl;dr

When calculating string length:
- Some languages return the number of bytes
- Most languages with unicode strings will return the number of code
  points. Some count the zero width joiners, some don't.
- A select few, I've only found Swift, Perl6, and Ruby (with a special method)
  will return the number of Extended Grapheme Clusters, or human perceived
  characters. This is usually what you want, unless you are after a string's
  size in memory.

[blog-post]: https://manishearth.github.io/blog/2017/01/14/stop-ascribing-meaning-to-unicode-code-points/
[unicode-report]: <http://unicode.org/reports/tr29/>
[js-str]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
[ocaml-string]: http://caml.inria.fr/pub/docs/manual-ocaml/libref/String.html
