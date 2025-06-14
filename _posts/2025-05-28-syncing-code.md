---
layout: post
title: "Syncing Code"
description: "LINT.ifChange"
last_modified_at: 2025-06-14
---

Sometimes you have chunks of code you need to sync.

For instance, in your backend you might have some validation that you want to sync with the UI.

So you write:

```tsx
// Please keep in sync with api/routes/create_session.py!
```

and a corresponding:

```py
# Please keep in sync with ui/components/CreateModal.tsx!
```

But nothing enforces users actually update the other file!

So what do you do?

## Codegen

Depending on what you're syncing, e.g., an enum, you might be able [set up codegen]({% post_url 2024-02-11-openapi-and-codegen-for-django %}), but for more complicated things, like validation code, it might be too much work.

## Code Sync Linters

Instead of codegen, we can have a linter that ensures sections of code are updated together!

### LINT.ifChange

Google has `LINT.ifChange` sprinkled [in](https://cs.opensource.google/search?q=LINT.ifChange&ss=bazel) [their](https://cs.android.com/search?q=LINT.ifChange) [codebases](https://source.chromium.org/search?q=LINT.ifChange&ss=chromium&start=41).

For example, in Bazel's [`src/main/cpp/option_processor.cc`][optionprocessorcc]:

```cpp
  // LINT.IfChange
  result.push_back("--rc_source=client");
  rcfile_index["client"] = 0;
  // LINT.ThenChange(src/main/java/com/google/devtools/common/options/GlobalRcUtils.java)
  int cur_index = 1;
```

with a corresponding `LINT.IfChange` in [`src/main/java/com/google/devtools/common/options/GlobalRcUtils.java`][globalrcutilsjava]

```java
  private static final ImmutableList<String> GLOBAL_RC_FILES =
      ImmutableList.of(
          // LINT.IfChange
          "client",
          // LINT.ThenChange(//src/main/cpp/option_processor.cc)
          // LINT.IfChange
          "Invocation policy"
          // LINT.ThenChange(//src/main/java/com/google/devtools/common/options/InvocationPolicyEnforcer.java)
          );
```

So if any change occurs between the `LINT.IfChange` and `LINT.ThenChange`, then the reference in `TheChange` must also have its corresponding section updated.

Also, instead of using a file name, you can provide a name to the `LINT.IfChange` and have sections in the same file be updated together.

For example [`src/main/java/net/starlark/java/eval/Starlark.java`][starlarkjava]:

```java
  public static Object fastcall(
      StarlarkThread thread, StarlarkCallable callable, Object[] positional, Object[] named)
      throws EvalException, InterruptedException {

    // LINT.IfChange(fastcall)
    thread.push(callable);
    try {
      return callable.fastcall(thread, positional, named);
    } catch (UncheckedEvalException | UncheckedEvalError ex) {
      throw ex; // already wrapped
    } catch (RuntimeException ex) {
      throw new UncheckedEvalException(ex, thread);
    } catch (Error ex) {
      throw new UncheckedEvalError(ex, thread);
    } catch (EvalException ex) {
      // If this exception was newly thrown, set its stack.
      throw ex.ensureStack(thread);
    } finally {
      thread.pop();
    }
    // LINT.ThenChange(:positionalOnlyCall)
  }
```

and later in the file:

```java
    // LINT.IfChange(positionalOnlyCall)
    thread.push(callable);
    try {
      return callable.positionalOnlyCall(thread, positional);
    } catch (UncheckedEvalException | UncheckedEvalError ex) {
      throw ex; // already wrapped
    } catch (RuntimeException ex) {
      throw new UncheckedEvalException(ex, thread);
    } catch (Error ex) {
      throw new UncheckedEvalError(ex, thread);
    } catch (EvalException ex) {
      // If this exception was newly thrown, set its stack.
      throw ex.ensureStack(thread);
    } finally {
      thread.pop();
    }
    // LINT.ThenChange(:fastcall)
```

[starlarkjava]: https://cs.opensource.google/bazel/bazel/+/master:src/main/java/net/starlark/java/eval/Starlark.java;drc=6c0f5d831bea63821fe3c308128cdb6235898641;l=804?q=LINT.ifChange%5C(&ss=bazel
[globalrcutilsjava]: https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/common/options/GlobalRcUtils.java;drc=7fe187e7c21a818a9f76f5bcb5085498725a2b4c
[optionprocessorcc]: https://cs.opensource.google/bazel/bazel/+/master:src/main/cpp/option_processor.cc;drc=58e651aada5acd72b5a877f1de9a892c248595e7

### sync-start

Similar to `LINT.IfChange`, [Khan Academy describes their `code_syncing_lint.py` linter](https://blog.khanacademy.org/using-static-analysis-in-python-javascript-and-more-to-make-your-system-safer/) which also uses comments:

```python
# sync-start:<tag> <filename>
# sync-end:<tag>
```

This approach ends up being more verbose and less flexible than `LINT.IfChange` since you can only update between files and have to specify a tag.

## Conclusion

Code syncing linters provide a lightweight solution to keeping bits of code in sync!

## Related

- [How to use LINT.IfChange to keep files in sync](https://www.chromium.org/chromium-os/developer-library/guides/development/keep-files-in-sync/)

- [Fuchia's Presubmit Checks](https://fuchsia.dev/fuchsia-src/development/source_code/presubmit_checks)

- [IfThisThenThat Linter](https://github.com/ebrevdo/ifttt-lint)
