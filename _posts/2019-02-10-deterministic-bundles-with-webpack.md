---
layout: post
---

When upgrading [Webpack](https://webpack.js.org) to version 4 I noticed that
the generated bundles were not deterministic. The hashes were changing with
each build.

A quick search [turns
up](https://github.com/webpack/webpack/issues/7179#issuecomment-386132702) that
`[chunkhash]` isn't stable and that `[contenthash]` should be used instead.

Easy enough.

Another couple runs of the build script and the JS bundle hashes aren't
changing between runs. Mission accomplished.

Except the css bundle is still changing.

Another search leads to a seemingly relevant issue on
[`mini-css-extract-plugin`](https://github.com/webpack-contrib/mini-css-extract-plugin/issues/342)
about inconsistent `[contenthash]` generation, which links to another issue on
[`css-loader`](https://github.com/webpack-contrib/css-loader/issues/886). But
the issue related to `css-loader` has to do with different `[contenthash]`s
being generated between operating systems. Not what we are looking for.

So what is changing between builds in the css bundle?

A couple builds, a run of [`prettier`](https://prettier.io), and a pinch of `colordiff` produces the following:

```diff
7350,7351c7350,7351
<   animation-delay: 0.76s;
<   animation-duration: 1.27s;
---
>   animation-delay: 0.03s;
>   animation-duration: 1.09s;
7354,7355c7354,7355
<   animation-delay: 0.13s;
<   animation-duration: 1.49s;
---
>   animation-delay: 0.04s;
>   animation-duration: 1.41s;
7358,7359c7358,7359
<   animation-delay: 0.59s;
<   animation-duration: 1.05s;
---
>   animation-delay: 0.28s;
>   animation-duration: 0.94s;
7362,7363c7362,7363
<   animation-delay: 0.06s;
<   animation-duration: 1.4s;
---
>   animation-delay: 0.66s;
>   animation-duration: 1.22s;
7366,7367c7366,7367
<   animation-delay: 0.41s;
<   animation-duration: 0.62s;
---
>   animation-delay: -0.07s;
>   animation-duration: 0.65s;
7370,7371c7370,7371
<   animation-delay: 0.66s;
<   animation-duration: 1.28s;
---
>   animation-delay: 0.41s;
>   animation-duration: 1.57s;
7374,7375c7374,7375
<   animation-delay: 0.05s;
<   animation-duration: 0.98s;
---
>   animation-delay: 0.13s;
>   animation-duration: 0.74s;
7378,7379c7378,7379
<   animation-delay: 0.48s;
<   animation-duration: 1.34s;
---
>   animation-delay: 0.4s;
>   animation-duration: 0.65s;
7382,7383c7382,7383
<   animation-delay: 0.32s;
<   animation-duration: 1.19s;
---
>   animation-delay: 0.03s;
>   animation-duration: 1.42s;
9061c9061
< /*# sourceMappingURL=main.ba6ca5ca.css.map*/
---
> /*# sourceMappingURL=main.e7616c55.css.map*/
```


Yeah, that is for a SCSS based loading spinner lifted from
[loader.css](https://github.com/ConnorAtherton/loaders.css) that uses Sass's
`random()` function.

There is a [closed
issue](https://github.com/ConnorAtherton/loaders.css/issues/37) related to
non-determinism that was never resolved.

No worries, we can probably just set the seed for Sass' random function.

A search of Sass's docs provides
[`random_seed()`](http://sass-lang.com/documentation/Sass/Script/Functions.html#random_seed=-class_method)
method to set the random seed.

```ruby
Sass::Script::Functions.random_seed = 0
```


But that's Ruby Sass, how do we set the random seed from
[node-sass](https://github.com/sass/node-sass)?

Turns out we don't. There is an [open
issue](https://github.com/sass/node-sass/issues/2503) that links to a
[libsass issue](https://github.com/sass/libsass/issues/2705) to add support
for the setting the seed. So while Ruby SASS supports `random_seed()`, it was
never ported to libsass.

Okay, we'll just have to generate the delays and durations.

The current non-deterministic SCSS looks as follows:

```scss
// --snip--
@for $i from 1 through 9 {
  > div:nth-child(#{$i}) {
    animation-delay: ((random(100) / 100) - 0.2) + s;
    animation-duration: ((random(100) / 100) + 0.6) + s;
  }
}
// --snip--
```

So we only need to generate the delay and duration tuples and iterate through
them with their index. Creating the tuples is straightforward, but iterating
through a list with an index isn't supported by Sass. There isn't any
`enumerated()`, `.enumerate()`, or similar, instead we need to use a `@for`
loop and index into the list. Also there isn't any tuple unpacking so we need
to use SCSS's `nth()` function.

```scss
// --snip--
$delays: (0.07s, 1.52s), (-0.16s, 1.32s), (0.57s, 1.25s), (0.7s, 1.41s),
  (0.01s, 1.46s), (0.73s, 0.75s), (0.29s, 0.76s), (0.23s, 0.73s),
  (-0.11s, 0.62s);

@for $i from 1 through length($delays) {
  $val: nth($delays, $i);

  $delay: nth($val, 1);
  $duration: nth($val, 2);

  > div:nth-child(#{$i}) {
    animation-delay: #{$delay};
    animation-duration: #{$duration};
  }
}
// --snip--
```

A couple more runs of the build script to confirm and we are in business.

How do we prevent this from happening again? A lint! A
[cursory](https://github.com/sasstools/sass-lint)
[search](https://stylelint.io/user-guide/rules/)
[of](https://github.com/brigade/scss-lint/) Sass related linters doesn't turn
up any rules for banning arbitrary functions or `random()` itself. Pity.
