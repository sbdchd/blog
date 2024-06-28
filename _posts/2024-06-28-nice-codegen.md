---
layout: post
title: "Nice Codegen"
description: "Smooth DX"
---

[Codegen is helpful](https://steve.dignam.xyz/2024/02/11/openapi-and-codegen-for-django/), but there some requirements to make it nice to use:

1. Generated File Headers

   Generated files should [have](https://github.com/facebook/hhvm/blob/408405cc72c41ee1943063072da7a62b0cde5b16/hphp/hack/src/oxidized_by_ref/gen/xhp_attribute.rs#L8-L9) [a header](https://github.com/facebook/hhvm/blob/408405cc72c41ee1943063072da7a62b0cde5b16/hphp/hack/src/parser/syntax_type.rs#L11-L16) [with the command](https://github.com/astral-sh/ruff/blob/47b227394ee03a13f6d0ef0fd89667dbbc8c0b4f/crates/ruff_python_formatter/src/generated.rs#L1-L2) [to run to](https://github.com/rust-lang/rust-analyzer/blob/9463d9eea4b87e651e7d8ed8425a9c92f23b1cdf/crates/syntax/src/ast/generated/nodes.rs#L1) [regenerate the file](https://github.com/microsoft/pyright/blob/3c70b4e0d14546511a6a7b567be69bf46dc5a533/packages/pyright-internal/src/parser/unicode.ts#L9-L10):

   ```rust
   // To regenerate this file, run:
   //   hphp/hack/src/oxidized_regen.sh
   ```

2. CI Check

   CI should have a check to ensure the files are up to date.

   The command to generate the file should have an [option to pass a flag (`--check`)](https://github.com/recipeyak/recipeyak/blob/793d5ea3c7ed7c36452a8bc9ca464647b3b3660c/backend/s/check_missing_api_schema_changes#L4) to check if the file is up to date.

3. Readonly in VSCode

   Generated files should be [marked readonly](https://github.com/recipeyak/recipeyak/blob/3c6dc6dfbb493b281d26c307c8406667e7833cb9/.vscode/settings.json#L115-L117) in the repo's VSCode config:

   ```json
   {
     "files.readonlyInclude": {
       "frontend/src/api/*": true
     }
   }
   ```

4. Generated in GitHub

   Generated files should be marked as generated in the [`.gitattributes`](https://github.com/recipeyak/recipeyak/blob/3c6dc6dfbb493b281d26c307c8406667e7833cb9/.gitattributes#L1) so GitHub collapses them by default in PRs:

   ```
   frontend/src/api/* linguist-generated=true
   ```
