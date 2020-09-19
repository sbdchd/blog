---
layout: post
title: Heroku Deployment Deception
date: 2020-09-18
---

While Heroku is
[expensive](https://christopher.xyz/2019/01/23/heroku-dyno-sizes.html), it
does provide a nice UI for deployment.

However, after using Heroku for a while at \$WORK I came to realize
that the deployment UI isn't completely honest about when a release is finished.

I assumed that a release marked as finished meant that the new version of the
code was released and the old version was no longer running. This isn't the
case, instead a release is "finished" once the [release
phase](https://devcenter.heroku.com/articles/release-phase) has run.

## Putting it to the test

### Project

The test project consists of `main.py`, a `Procfile` that calls `main.py`,
and an empty `requirements.txt` so Heroku will detect the project as
being Python (might not be necessary).

```python
# main.py
import time
import subprocess
import os

def main() -> None:
    # bind to the port provided by Heroku so the dyno is marked as having
    # started successfully
    subprocess.Popen(['nc', '-k', '-l', os.getenv('PORT')])
    while True:
        print(f"current version: 3")
        time.sleep(1)

if __name__ == '__main__':
    main()
```

```yaml
# Procfile
web: python3 main.py
```

After connecting a repo on GitHub I enabled enabled
[preboot](https://devcenter.heroku.com/articles/preboot) so
the deploys are zero downtime, mimicking a production setting.

Finally, I spun up 10 dynos for a cool \$250/month.

### Testing

Now that we have a version running in production we can start tailing the
logs from Heroku and then release a new version to monitor the transition
from the current version to the new version.

```shell
heroku logs -t -a release-time-test | tee release-time-test.logs
```

Example snippet from the logs:

```
2020-09-18T23:51:30.746156+00:00 app[web.1]: current version: 2
2020-09-18T23:51:30.789786+00:00 app[web.10]: current version: 2
2020-09-18T23:51:31.032672+00:00 app[web.5]: current version: 2
2020-09-18T23:51:31.141032+00:00 app[web.9]: current version: 2
2020-09-18T23:51:31.359043+00:00 app[web.4]: current version: 2
2020-09-18T23:51:31.392026+00:00 app[web.7]: current version: 2
2020-09-18T23:51:31.409204+00:00 app[web.6]: current version: 2
2020-09-18T23:51:31.404687+00:00 app[web.3]: current version: 2
2020-09-18T23:51:31.481608+00:00 app[web.8]: current version: 2
2020-09-18T23:51:31.544343+00:00 app[web.2]: current version: 2
```

And then we release a new version and watch as Heroku deploys the new version.

In the UI Heroku says the release has completed before the logs even mention a new release.

Using the Heroku API we can check the `created_at` and `updated_at` times to
get the start and end time of the release.

```shell
curl -n https://api.heroku.com/apps/release-time-test/releases/ \
    -H "Accept: application/vnd.heroku+json; version=3" \
    -H 'Range: id; order=desc,max=1' \
    | jq '.[0] | {created_at: .created_at, updated_at: .updated_at}'
```

```json
{
  "created_at": "2020-09-18T23:51:33Z",
  "updated_at": "2020-09-18T23:51:33Z"
}
```

### Release timeline

`2020-09-18T23:51:33Z`: Release started

`2020-09-18T23:51:33Z`: Release "finished" in the UI

`2020-09-18T23:51:38Z`: First dyno on the new version starts running.

`2020-09-18T23:51:41Z`: the last of the 10 dynos starts

`2020-09-18T23:54:44Z`: Heroku starts killing the old dynos

`2020-09-18T23:56:41Z`: Heroku finishes killing the last of the 10 dynos

So it takes a little over **5 minutes** after Heroku claims the release is
finished for all of previous dynos to be killed.

## Conclusion

You can't trust Heroku's release info, it doesn't actually say when the new
version is running or when the old version is no longer running.

Also I think the disparity between the release being marked as finished in
the UI and actually being finished will be larger in proper production
scenarios due to slug sizes, longer dyno boot times, and a larger number of
dynos.
