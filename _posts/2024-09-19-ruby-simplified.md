---
layout: post
title: "Ruby Simplified"
description: "Remove a bunch of stuff"
---

Ruby has a bunch of bespoke syntax that can make it more difficult to read, especially if you spend most of your time in other languages.

Here are some things to [enforce](https://github.com/rubocop/rubocop) to make working in a Ruby codebase easier for non-Rubyists.

## 1. Require parens everywhere

```ruby
puts "hello world", {foo: 1}
# becomes
puts("hello world", {foo: 1})
```

## 2. No unless

[`unless x`](https://docs.ruby-lang.org/en/master/syntax/control_expressions_rdoc.html#top) is equivalent to `if !x`, it's easier to just use negation with an if statement than to have another keyword.

```ruby
unless x
  log_error(data)
end
# becomes
if !x
  log_error(data)
end
```

## 3. No until

[`until` is an inverted `while`](https://docs.ruby-lang.org/en/master/syntax/control_expressions_rdoc.html#label-until+Loop), just like `unless` is an inverted `if`.

```ruby
a = 0
until a > 10 do
  a += 1
end
# becomes
a = 0
while a <= 10 do
  a += 1
end
```

## 4. No modifier control flow

There's various control flow keywords ([`if`, `unless`](https://docs.ruby-lang.org/en/master/syntax/control_expressions_rdoc.html#label-Modifier+if+and+unless), [`while`, `until`](https://docs.ruby-lang.org/en/master/syntax/control_expressions_rdoc.html#label-Modifier+while+and+until)) supported as modifiers.

Each of these can instead be used in their block format:

```ruby
puts("request recieved") if request.ok?
# becomes
if request.ok?
  puts("request recieved")
end
```

## 5. No flip flop

[This isn't really used](https://docs.ruby-lang.org/en/master/syntax/control_expressions_rdoc.html#label-Flip-Flop) that much but might as well skip it.

## 6. No special literals

Ruby has a bunch of special case literal representations:

- [`%w`, `%W` String-Array Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25w+and+-25W-3A+String-Array+Literals)
- [`%q`, Non-Interpolable String Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25q-3A+Non-Interpolable+String+Literals)
- [`%`, `%Q` Interpolable String Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25+and+-25Q-3A+Interpolable+String+Literals)
- [`%I`, `%I` Symbol-Array Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25i+and+-25I-3A+Symbol-Array+Literals)
- [`%s` Symbol Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25s-3A+Symbol+Literals)
- [`%x` Backtick Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25x-3A+Backtick+Literals)
- [`%r` Regexp Literals](https://docs.ruby-lang.org/en/master/syntax/literals_rdoc.html#label-25r-3A+Regexp+Literals)

Just use the normal literals instead.

## 7. No and or

Ruby has both `&&`, `||` and `and`, `or` operators.

`and` and `or` [have weird precedence issues](https://stackoverflow.com/a/1426835/3720597), just use `&&`, `||`.

## 8. Sorbet

Types are helpful, [Sorbet](https://sorbet.org) is Ruby's type checker.

Sorbet's [`T::Struct`](https://sorbet.org/docs/tstruct) is helpful for ad hoc data classes.

## 9. Rubyfmt

Code formatting is nice and [`rubyfmt`](https://github.com/fables-tales/rubyfmt) works well!

## 10. No meta programming

Unless you can get Sorbet to understand it with [Tapioca](https://github.com/Shopify/tapioca). Don't want to break type checking.

## 11. No rspec

[Rspec is fine](https://rspec.info/documentation/3.13/rspec-core/) but don't use `let` and avoid `before` and `after`. They [introduce globals](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing).
