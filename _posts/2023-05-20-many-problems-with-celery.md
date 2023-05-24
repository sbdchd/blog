---
layout: post
title: "The Many Problems with Celery"
description: "With some possible fixes"
last_modified_at: 2023-05-24
---

Celery is the de facto solution for background workers and cron jobs in the Python ecosystem, but it's full of footguns.

# The Footguns

## Celery prefetches jobs

By default, each [Celery worker prefetches 4 jobs](https://docs.celeryq.dev/en/latest/userguide/configuration.html#std-setting-worker_prefetch_multiplier) from the queue.

This means you could have one job that takes 45 minutes block 3 other jobs that complete in under a second.

#### The fix:

- Disable prefetching
- Setup different queues & workers for different priority jobs

## Celery loses jobs by default

If a task raises an exception, or a worker process dies, [Celery will by default lose the job](https://docs.celeryq.dev/en/latest/faq.html#should-i-use-retry-or-acks-late).

So if you happen to reboot or redeploy, any running jobs with be lost to the sands of time.

#### The fix:

- enable [`task_acks_late`](https://docs.celeryq.dev/en/latest/userguide/configuration.html#task-acks-late) and [`task_reject_on_worker_lost`](https://docs.celeryq.dev/en/latest/userguide/configuration.html#std-setting-task_reject_on_worker_lost)

## Celery's retry defaults are bad

Celery doesn't [default to using exponential backoff](https://docs.celeryq.dev/en/latest/userguide/tasks.html#Task.retry_backoff) for job retries.

#### The fix:

- enable [`Task.retry_backoff`](https://docs.celeryq.dev/en/latest/userguide/tasks.html#Task.retry_backoff)

## No transactional job enqueuing

Sometimes called [transactionally staged jobs](https://brandur.org/job-drain), or the [transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html), but the gist is you can't enqueue a job inside a transaction.

This means you can't have an HTTP request handler that creates a new `User` and schedules a job to send them an email, because the database save might succeed but the job might not persist, or vice versa.

#### The fix:

- Don't use Celery, use a transactional outbox setup.

## Canvas, cords, and friends encourage brittle pipelines

Since Celery doesn't have transactional job enqueuing, [canvas](https://docs.celeryq.dev/en/stable/userguide/canvas.html), [chords](https://docs.celeryq.dev/en/stable/userguide/canvas.html#chords) and [friends](https://docs.celeryq.dev/en/stable/userguide/canvas.html#the-primitives) are a recipe for losing jobs or having broken workflows.

#### The fix:

- Don't use these APIs, do it yourself

## API isn't Pythonic

For example:

```python
@shared_task(name="tasks.add")
def add(a: int, b: int) -> int:
    return a + b

add.signature(args=(1, 2)).delay()
add.s(1, 2).apply_async(countdown=60, expires=120)
signature('tasks.add', args=(1, 2)).delay()
```

Another gripe is [`bind=True`](https://docs.celeryq.dev/en/stable/userguide/tasks.html#example).

If you want to access Celery's builtin retry methods (along with additional context) you need to use the `bind` `kwarg` in your task definition, which causes Celery to pass in a first argument automatically.
This behavior is tricky to type check and results in an inconsistent API.

#### The fix:

- You have to live with it

## Config isn't type safe

When you want to [configure some cron jobs](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html) the config isn't type safe:

```python
app.conf.beat_schedule = {
  'add-every-30-seconds': {
    'task': 'tasks.add',
    'schedule': 30.0,
    'args': (16, 16)
  }
}
app.conf.timezone = 'UTC'
```

#### The fix:

- Write some type safe wrappers

## Doesn't encourage safe evolution of tasks

For example, you write your function and ship it to production.

```python
@shared_task(name="tasks.send_email")
def send_email(to: str) -> None:
    ...
```

It's running for a while and then you realize you want to support `CC`ing, so you update your function signature:

```python
@shared_task(name="tasks.send_email")
def send_email(to: list[str], cc: list[str]) -> None:
    ...
```

and you deploy to production and immediately start getting runtime exceptions.

The problem is you have existing workers running with the old task version, and existing jobs serialized in the queue, which are incompatible with the new task version, so you end up with a bunch of exceptions.

Celery doesn't help you enforce safe evolution of tasks.
The correct way to update the task would be to create a new version or add some optional params.

Also, Celery doesn't enforce defining a `name` for each task so if you let Celery auto-generate it, and then move a task definition to a different file, you'll end up with runtime exceptions.

#### The fix:

- Build tooling to generate schemas for your tasks and ensure they are safely updated.
- Ensure you always pass a consistent `name` to your task definitions.

## Jobs aren't interruptible

If your jobs aren't interruptible and you have a job that takes 45 minutes to complete, then you have to wait 45 minutes before deploying a new version.

Celery doesn't have any builtin functionality to support this so you have to [roll your own](https://dev.37signals.com/making-export-jobs-more-reliable/).

#### The fix:

- Handle the complexity yourself

## Difficult to disable jobs gone haywire

Whether it's a cron job or a manually scheduled job, there isn't a builtin way to disable a job.

#### The fix:

- Develop [a solution](https://planetscale.com/blog/how-to-kill-sidekiq-jobs-in-ruby-on-rails) yourself

## Doesn't support async

[Celery doesn't support asyncio](https://github.com/celery/celery/issues/3884), so you're out of luck if you're using `async`.

#### The fix:

- Not great, but you could wrap all your `async` calls with `asyncio.run()`.

## Automated testing is difficult

When looking into testing for Celery you'll see the [`task_always_eager`](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_always_eager) option pop up, which shouldn't be used since it skips the Celery specific serialization and job storage.

The docs also suggest relying on mocking which results in brittle tests.

#### The fix:

- Run [Celery workers for your tests](https://docs.celeryq.dev/en/stable/userguide/testing.html#celery-session-worker-embedded-worker-that-lives-throughout-the-session) and ensure the entire flow works.

## Serialization issues are common

It's easy to write a Celery task that takes an argument that isn't serializable and you won't know until runtime.

Another gotcha is using `pickle` instead of `json` for serialization. `pickle` can serialize more objects by default but [comes with its own caveats](https://nedbatchelder.com/blog/202006/pickles_nine_flaws.html).

#### The fix:

- Write automated tests that exercise serialization
- Think about your serialization format

## Monitoring story isn't great

There are docs for monitoring but Celery is pretty limited in what it provides by default.

#### The fix:

- Instrument Celery yourself, especially your queues!

## Type checking

The Celery [internals aren't type checked](https://github.com/celery/celery/blob/e7b47a62d789557cf18ed0e56e2dfb99a51a62f7/celery/app/task.py#L164) and there aren't types for public APIs. You can use [celery-types](https://github.com/sbdchd/celery-types/), but it's limited in strictness.

#### The fix:

- Live with it

## Conclusion

If you're project is heavily invested in Celery, it's tricky to migrate, so implementing the available fixes might be best.

For a new project, I wouldn't use Celery. The biggest issue is how easy it is to lose jobs. Instead I'd use a [transactional outbox setup](https://brandur.org/nanoglyphs/036-queues#batch-wise) [with some workers](https://encore.dev/docs/primitives/pubsub/outbox).

Also worth looking into the new hotness, [Temporal](https://temporal.io), but it has its own learning curve.

In general, be careful how you enqueue your jobs and ensure changes to your tasks are backwards compatible.
