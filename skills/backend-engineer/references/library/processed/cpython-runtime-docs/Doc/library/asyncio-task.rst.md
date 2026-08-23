> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/asyncio-task.rst`  
> Upstream Git blob: `689a6a6d2e0bd924ac90c89571e459661a56d95c`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Coroutines and tasks

This section outlines high-level asyncio APIs to work with coroutines
and Tasks.

## [Coroutines](#toc-entry-1)

**Source code:** :source:`Lib/asyncio/coroutines.py`

---

:term:`Coroutines <coroutine>` declared with the async/await syntax is the
preferred way of writing asyncio applications. For example, the following
snippet of code prints "hello", waits 1 second,
and then prints "world":

```
>>> import asyncio

>>> async def main():
...     print('hello')
...     await asyncio.sleep(1)
...     print('world')

>>> asyncio.run(main())
hello
world
```

Note that simply calling a coroutine will not schedule it to
be executed:

```
>>> main()
<coroutine object main at 0x1053bb7c8>
```

To actually run a coroutine, asyncio provides the following mechanisms:

- The :func:`asyncio.run` function to run the top-level
  entry point "main()" function (see the above example.)
- Awaiting on a coroutine. The following snippet of code will
  print "hello" after waiting for 1 second, and then print "world"
  after waiting for *another* 2 seconds:

  ```
  import asyncio
  import time

  async def say_after(delay, what):
      await asyncio.sleep(delay)
      print(what)

  async def main():
      print(f"started at {time.strftime('%X')}")

      await say_after(1, 'hello')
      await say_after(2, 'world')

      print(f"finished at {time.strftime('%X')}")

  asyncio.run(main())
  ```

  Expected output:

  ```
  started at 17:13:52
  hello
  world
  finished at 17:13:55
  ```
- The :func:`asyncio.create\_task` function to run coroutines
  concurrently as asyncio :class:`Tasks <Task>`.

  Let's modify the above example and run two say\_after coroutines
  *concurrently*:

  ```
  async def main():
      task1 = asyncio.create_task(
          say_after(1, 'hello'))

      task2 = asyncio.create_task(
          say_after(2, 'world'))

      print(f"started at {time.strftime('%X')}")

      # Wait until both tasks are completed (should take
      # around 2 seconds.)
      await task1
      await task2

      print(f"finished at {time.strftime('%X')}")
  ```

  Note that expected output now shows that the snippet runs
  1 second faster than before:

  ```
  started at 17:14:32
  hello
  world
  finished at 17:14:34
  ```
- The :class:`asyncio.TaskGroup` class provides a more modern
  alternative to :func:`create\_task`.
  Using this API, the last example becomes:

  ```
  async def main():
      async with asyncio.TaskGroup() as tg:
          task1 = tg.create_task(
              say_after(1, 'hello'))

          task2 = tg.create_task(
              say_after(2, 'world'))

          print(f"started at {time.strftime('%X')}")

      # The await is implicit when the context manager exits.

      print(f"finished at {time.strftime('%X')}")
  ```

  The timing and output should be the same as for the previous version.

## [Awaitables](#toc-entry-2)

We say that an object is an **awaitable** object if it can be used
in an :keyword:`await` expression. Many asyncio APIs are designed to
accept awaitables.

There are three main types of *awaitable* objects:
**coroutines**, **Tasks**, and **Futures**.

Coroutines

Python coroutines are *awaitables* and therefore can be awaited from
other coroutines:

```
import asyncio

async def nested():
    return 42

async def main():
    # Nothing happens if we just call "nested()".
    # A coroutine object is created but not awaited,
    # so it *won't run at all*.
    nested()  # will raise a "RuntimeWarning".

    # Let's do it differently now and await it:
    print(await nested())  # will print "42".

asyncio.run(main())
```

Important

In this documentation the term "coroutine" can be used for
two closely related concepts:

- a *coroutine function*: an :keyword:`async def` function;
- a *coroutine object*: an object returned by calling a
  *coroutine function*.

Tasks

*Tasks* are used to schedule coroutines *concurrently*.

When a coroutine is wrapped into a *Task* with functions like
:func:`asyncio.create\_task` the coroutine is automatically
scheduled to run soon:

```
import asyncio

async def nested():
    return 42

async def main():
    # Schedule nested() to run soon concurrently
    # with "main()".
    task = asyncio.create_task(nested())

    # "task" can now be used to cancel "nested()", or
    # can simply be awaited to wait until it is complete:
    await task

asyncio.run(main())
```

Futures

A :class:`Future` is a special **low-level** awaitable object that
represents an **eventual result** of an asynchronous operation.

When a Future object is *awaited* it means that the coroutine will
wait until the Future is resolved in some other place.

Future objects in asyncio are needed to allow callback-based code
to be used with async/await.

Normally **there is no need** to create Future objects at the
application level code.

Future objects, sometimes exposed by libraries and some asyncio
APIs, can be awaited:

```
async def main():
    await function_that_returns_a_future_object()

    # this is also valid:
    await asyncio.gather(
        function_that_returns_a_future_object(),
        some_python_coroutine()
    )
```

A good example of a low-level function that returns a Future object
is :meth:`loop.run\_in\_executor`.

## [Creating tasks](#toc-entry-3)

**Source code:** :source:`Lib/asyncio/tasks.py`

---

## [Task cancellation](#toc-entry-4)

Tasks can easily and safely be cancelled.
When a task is cancelled, :exc:`asyncio.CancelledError` will be raised
in the task at the next opportunity.

It is recommended that coroutines use try/finally blocks to robustly
perform clean-up logic. In case :exc:`asyncio.CancelledError`
is explicitly caught, it should generally be propagated when
clean-up is complete. :exc:`asyncio.CancelledError` directly subclasses
:exc:`BaseException` so most code will not need to be aware of it.

The asyncio components that enable structured concurrency, like
:class:`asyncio.TaskGroup` and :func:`asyncio.timeout`,
are implemented using cancellation internally and might misbehave if
a coroutine swallows :exc:`asyncio.CancelledError`. Similarly, user code
should not generally call :meth:`uncancel <asyncio.Task.uncancel>`.
However, in cases when suppressing :exc:`asyncio.CancelledError` is
truly desired, it is necessary to also call uncancel() to completely
remove the cancellation state.

## [Task groups](#toc-entry-5)

Task groups combine a task creation API with a convenient
and reliable way to wait for all tasks in the group to finish.

An :ref:`asynchronous context manager <async-context-managers>`
holding a group of tasks.
Tasks can be added to the group using :meth:`create\_task`.
All tasks are awaited when the context manager exits.

Example:

```
async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(some_coro(...))
        task2 = tg.create_task(another_coro(...))
    print(f"Both tasks have completed now: {task1.result()}, {task2.result()}")
```

A few points to keep in mind when using task groups:

- The async with statement will wait for all tasks in the group
  to finish. While waiting, new tasks may still be added to the group
  (for example, by passing tg into one of the coroutines and
  calling tg.create\_task() in that coroutine); once the last task
  has finished and the async with block is exited, no new tasks
  may be added.
- Termination of the entire task group may be requested with
  tg.cancel(), based on some condition.
- If the group is shut down (e.g. because another task failed) before
  a newly created task has started running, the task is cancelled
  without its coroutine executing at all, not even to its first
  await. To guarantee that the coroutine starts, create the task
  eagerly with eager\_start=True or use
  :func:`asyncio.eager\_task\_factory`. For example:

  ```
  async def job():
      print("job started")  # never printed
      try:
          await asyncio.sleep(1)
      finally:
          print("job cleaned up")  # never printed

  async def main():
      async with asyncio.TaskGroup() as tg:
          tg.create_task(job())
          raise RuntimeError  # shuts down the group before job() runs
  ```

  With tg.create\_task(job(), eager\_start=True), job() runs up
  to the await, is cancelled there, and both messages are printed.

When any of the tasks belonging to the group fails with an exception
other than :exc:`asyncio.CancelledError` (or the body of the
async with statement exits with an exception, which is treated
the same way):

- The first time this happens, the remaining tasks in the group are
  cancelled and then waited for, and no further tasks can be added to
  the group. If the body of the async with statement is still
  active (i.e., :meth:`~object.\_\_aexit\_\_` hasn't been called yet),
  the task directly containing the async with statement is also
  cancelled. The resulting :exc:`asyncio.CancelledError` will
  interrupt an await, but it will not bubble out of the containing
  async with statement.
- Once all tasks have finished, the non-cancellation exceptions --
  including the exception the body exited with, unless it is
  :exc:`asyncio.CancelledError` -- are combined in an
  :exc:`ExceptionGroup` or :exc:`BaseExceptionGroup`
  (as appropriate; see their documentation), which is then raised.
- Some exceptions are treated specially: if any task fails with
  :exc:`KeyboardInterrupt` or :exc:`SystemExit`, the task group still
  cancels the remaining tasks and waits for them, but then the initial
  :exc:`KeyboardInterrupt` or :exc:`SystemExit` is re-raised instead
  of :exc:`ExceptionGroup` or :exc:`BaseExceptionGroup`.
  Additionally, if the body of the async with statement raises
  :exc:`GeneratorExit` and none of the other tasks raise exceptions
  that would be reported, the :exc:`GeneratorExit` is re-raised.

Task groups are careful not to mix up the internal cancellation used
to "wake up" their :meth:`~object.\_\_aexit\_\_` with cancellation
requests for the task in which they are running made by other parties.
In particular, when one task group is syntactically nested in another,
and both experience an exception in one of their child tasks
simultaneously, the inner task group will process its exceptions, and
then the outer task group will receive another cancellation and
process its own exceptions.

In the case where a task group is cancelled externally and also must
raise an :exc:`ExceptionGroup`, it will call the parent task's
:meth:`~asyncio.Task.cancel` method. This ensures that a
:exc:`asyncio.CancelledError` will be raised at the next
:keyword:`await`, so the cancellation is not lost. Task groups also
preserve the cancellation count reported by
:meth:`asyncio.Task.cancelling`.

## [Sleeping](#toc-entry-6)

## [Running tasks concurrently](#toc-entry-7)

## [Eager task factory](#toc-entry-8)

## [Shielding from cancellation](#toc-entry-9)

## [Timeouts](#toc-entry-10)

## [Waiting primitives](#toc-entry-11)

## [Running in threads](#toc-entry-12)

## [Scheduling from other threads](#toc-entry-13)

## [Introspection](#toc-entry-14)

## [Task object](#toc-entry-15)
