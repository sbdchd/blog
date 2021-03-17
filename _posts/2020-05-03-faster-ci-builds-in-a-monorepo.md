---
title: "Faster CI Builds in a Monorepo"
description: A little bash goes a long way
layout: post
date: 2020-05-03
---

As of writing this post Kodiak has [13 CI jobs](https://github.com/chdsbd/kodiak/blob/80d33a025e850b8ee16445b7e5c643eece0ddc94/.circleci/config.yml) that run on every commit.

The longest of these jobs takes about 2 mins 45 seconds with many taking less
than a minute. Overall they aren't obnoxiously long or anything but it would
be nice if a change to the `docs/` didn't require running the checks on the `web_ui`,
`web_api`, and `bot` code.

Since each of these subdirectories are independent from their siblings we can be sure
that the failure of the lints, tests, and builds are only affected by the
items in the subdirectory.

## Only Running Jobs when Necessary

Essentially we want a setup where we only run a job if a file in its
respective directory has changed.

GitHub Actions has [`on.push.paths`](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths) such that jobs are only triggered when a file in the path has been changed.

Kodiak's using [CircleCI](https://circleci.com) which doesn't have a similar
feature built-in, but it isn't too hard to replicate with some shell scripts.

`kodiak/scripts/dir_changed.sh`

```bash
#!/bin/bash

# circle's built in git checkout code clobbers the `master` ref so we do the
# following to make it not point to the current ref.
# https://discuss.circleci.com/t/git-checkout-of-a-branch-destroys-local-reference-to-master/23781/7
if [ "${CIRCLECI}" ]; then
  git branch -f master origin/master
fi


dir_changed() {
  # when the script fails in an unexpected way we default to exit code 0 so
  # that the dir will be considered changed.
  local -r dir="${1}" || exit 0
  local changed_files
  changed_files="$(git --no-pager diff --name-only FETCH_HEAD master)" || exit 0
  grep -q "^${dir}" <<< "${changed_files}"
}
```

There are some caveats around how Circle fetches code but overall it's
straightforward.

To use this function we `source` `dir_changed.sh` and check if anything has
changed in a dir before running tests, lints, builds, etc.

```bash
source ./scripts/dir_changed.sh

if dir_changed "backend"; then
  echo "dir changed backend"
else
  echo "backend did not change"
fi

if dir_changed "frontend"; then
  echo "dir changed frontend"
else
  echo "frontend did not change"
fi

if dir_changed; then
  echo "fail open"
fi
```

## Caveats

This should _just_ work, but if the versions for your lints, compilers,
test runners, etc. aren't defined in the directories they act on, then changes to
these tools will not re-run the CI jobs. Which means a change in a lint could
error on a dev machine but pass in CI.

A more robust setup would involve configuring a
[sophisticated](https://bazel.build) [build](https://buck.build)
[system](https://www.pantsbuild.org) that can properly cache builds so it
only runs the test/lints/builds when necessary. This would also help if your
directories have shared dependencies like protobufs.
