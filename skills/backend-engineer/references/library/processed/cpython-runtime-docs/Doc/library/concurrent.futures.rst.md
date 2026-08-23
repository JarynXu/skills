> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/concurrent.futures.rst`  
> Upstream Git blob: `1f34dc66228e30858035fbde7b648cdbcb36e419`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!concurrent.futures` --- Launching parallel tasks

**Source code:** :source:`Lib/concurrent/futures/thread.py`,
:source:`Lib/concurrent/futures/process.py`,
and :source:`Lib/concurrent/futures/interpreter.py`

---

The :mod:`!concurrent.futures` module provides a high-level interface for
asynchronously executing callables.

The asynchronous execution can be performed with threads, using
:class:`ThreadPoolExecutor` or :class:`InterpreterPoolExecutor`,
or separate processes, using :class:`ProcessPoolExecutor`.
Each implements the same interface, which is defined
by the abstract :class:`Executor` class.

:class:`concurrent.futures.Future` must not be confused with
:class:`asyncio.Future`, which is designed for use with :mod:`asyncio`
tasks and coroutines. See the :doc:`asyncio's Future <asyncio-future>`
documentation for a detailed comparison of the two.

## Executor Objects

An abstract class that provides methods to execute calls asynchronously. It
should not be used directly, but through its concrete subclasses.

## ThreadPoolExecutor

:class:`ThreadPoolExecutor` is an :class:`Executor` subclass that uses a pool of
threads to execute calls asynchronously.

Deadlocks can occur when the callable associated with a :class:`Future` waits on
the results of another :class:`Future`. For example:

```
import time
def wait_on_b():
    time.sleep(5)
    print(b.result())  # b will never complete because it is waiting on a.
    return 5

def wait_on_a():
    time.sleep(5)
    print(a.result())  # a will never complete because it is waiting on b.
    return 6


executor = ThreadPoolExecutor(max_workers=2)
a = executor.submit(wait_on_b)
b = executor.submit(wait_on_a)
```

And:

```
def wait_on_future():
    f = executor.submit(pow, 5, 2)
    # This will never complete because there is only one worker thread and
    # it is executing this function.
    print(f.result())

executor = ThreadPoolExecutor(max_workers=1)
future = executor.submit(wait_on_future)
# Note: calling future.result() would also cause a deadlock because
# the single worker thread is already waiting for wait_on_future().
```

An :class:`Executor` subclass that uses a pool of at most *max\_workers*
threads to execute calls asynchronously.

All threads enqueued to ThreadPoolExecutor will be joined before the
interpreter can exit. Note that the exit handler which does this is
executed *before* any exit handlers added using atexit. This means
exceptions in the main thread must be caught and handled in order to
signal threads to exit gracefully. For this reason, it is recommended
that ThreadPoolExecutor not be used for long-running tasks.

*initializer* is an optional callable that is called at the start of
each worker thread; *initargs* is a tuple of arguments passed to the
initializer. Should *initializer* raise an exception, all currently
pending jobs will raise a :exc:`~concurrent.futures.thread.BrokenThreadPool`,
as well as any attempt to submit more jobs to the pool.

### ThreadPoolExecutor Example

```
import concurrent.futures
import urllib.request

URLS = ['http://www.foxnews.com/',
        'http://www.cnn.com/',
        'http://europe.wsj.com/',
        'http://www.bbc.co.uk/',
        'http://nonexistent-subdomain.python.org/']

# Retrieve a single page and report the URL and contents
def load_url(url, timeout):
    with urllib.request.urlopen(url, timeout=timeout) as conn:
        return conn.read()

# We can use a with statement to ensure threads are cleaned up promptly
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    # Start the load operations and mark each future with its URL
    future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}
    for future in concurrent.futures.as_completed(future_to_url):
        url = future_to_url[future]
        try:
            data = future.result()
        except Exception as exc:
            print('%r generated an exception: %s' % (url, exc))
        else:
            print('%r page is %d bytes' % (url, len(data)))
```

## InterpreterPoolExecutor

The :class:`InterpreterPoolExecutor` class uses a pool of interpreters
to execute calls asynchronously. It is a :class:`ThreadPoolExecutor`
subclass, which means each worker is running in its own thread.
The difference here is that each worker has its own interpreter,
and runs each task using that interpreter.

The biggest benefit to using interpreters instead of only threads
is true multi-core parallelism. Each interpreter has its own
:term:`Global Interpreter Lock <global interpreter lock>`, so code
running in one interpreter can run on one CPU core, while code in
another interpreter runs unblocked on a different core.

The tradeoff is that writing concurrent code for use with multiple
interpreters can take extra effort. However, this is because it
forces you to be deliberate about how and when interpreters interact,
and to be explicit about what data is shared between interpreters.
This results in several benefits that help balance the extra effort,
including true multi-core parallelism, For example, code written
this way can make it easier to reason about concurrency. Another
major benefit is that you don't have to deal with several of the
big pain points of using threads, like race conditions.

Each worker's interpreter is isolated from all the other interpreters.
"Isolated" means each interpreter has its own runtime state and
operates completely independently. For example, if you redirect
:data:`sys.stdout` in one interpreter, it will not be automatically
redirected to any other interpreter. If you import a module in one
interpreter, it is not automatically imported in any other. You
would need to import the module separately in interpreter where
you need it. In fact, each module imported in an interpreter is
a completely separate object from the same module in a different
interpreter, including :mod:`sys`, :mod:`builtins`,
and even \_\_main\_\_.

Isolation means a mutable object, or other data, cannot be used
by more than one interpreter at the same time. That effectively means
interpreters cannot actually share such objects or data. Instead,
each interpreter must have its own copy, and you will have to
synchronize any changes between the copies manually. Immutable
objects and data, like the builtin singletons, strings, and tuples
of immutable objects, don't have these limitations.

Communicating and synchronizing between interpreters is most effectively
done using dedicated tools, like those proposed in [PEP 734](https://peps.python.org/pep-0734). One less
efficient alternative is to serialize with :mod:`pickle` and then send
the bytes over a shared :mod:`socket <socket>` or
:func:`pipe <os.pipe>`.

A :class:`ThreadPoolExecutor` subclass that executes calls asynchronously
using a pool of at most *max\_workers* threads. Each thread runs
tasks in its own interpreter. The worker interpreters are isolated
from each other, which means each has its own runtime state and that
they can't share any mutable objects or other data. Each interpreter
has its own :term:`Global Interpreter Lock <global interpreter lock>`,
which means code run with this executor has true multi-core parallelism.

The optional *initializer* and *initargs* arguments have the same
meaning as for :class:`!ThreadPoolExecutor`: the initializer is run
when each worker is created, though in this case it is run in
the worker's interpreter. The executor serializes the *initializer*
and *initargs* using :mod:`pickle` when sending them to the worker's
interpreter.

Note

The executor may replace uncaught exceptions from *initializer*
with :class:`~concurrent.interpreters.ExecutionFailed`.

Other caveats from parent :class:`ThreadPoolExecutor` apply here.

:meth:`~Executor.submit` and :meth:`~Executor.map` work like normal,
except the worker serializes the callable and arguments using
:mod:`pickle` when sending them to its interpreter. The worker
likewise serializes the return value when sending it back.

When a worker's current task raises an uncaught exception, the worker
always tries to preserve the exception as-is. If that is successful
then it also sets the \_\_cause\_\_ to a corresponding
:class:`~concurrent.interpreters.ExecutionFailed`
instance, which contains a summary of the original exception.
In the uncommon case that the worker is not able to preserve the
original as-is then it directly preserves the corresponding
:class:`~concurrent.interpreters.ExecutionFailed`
instance instead.

## ProcessPoolExecutor

The :class:`ProcessPoolExecutor` class is an :class:`Executor` subclass that
uses a pool of processes to execute calls asynchronously.
:class:`ProcessPoolExecutor` uses the :mod:`multiprocessing` module, which
allows it to side-step the :term:`Global Interpreter Lock
<global interpreter lock>` but also means that
only picklable objects can be executed and returned.

The \_\_main\_\_ module must be importable by worker subprocesses. This means
that :class:`ProcessPoolExecutor` will not work in the interactive interpreter.

Calling :class:`Executor` or :class:`Future` methods from a callable submitted
to a :class:`ProcessPoolExecutor` will result in deadlock.

Note that the restrictions on functions and arguments needing to picklable as
per :class:`multiprocessing.Process` apply when using :meth:`~Executor.submit`
and :meth:`~Executor.map` on a :class:`ProcessPoolExecutor`. A function defined
in a REPL or a lambda should not be expected to work.

An :class:`Executor` subclass that executes calls asynchronously using a pool
of at most *max\_workers* processes. If *max\_workers* is None or not
given, it will default to :func:`os.process\_cpu\_count`.
If *max\_workers* is less than or equal to 0, then a :exc:`ValueError`
will be raised.
On Windows, *max\_workers* must be less than or equal to 61. If it is not
then :exc:`ValueError` will be raised. If *max\_workers* is None, then
the default chosen will be at most 61, even if more processors are
available.
*mp\_context* can be a :mod:`multiprocessing` context or None. It will be
used to launch the workers. If *mp\_context* is None or not given, the
default :mod:`multiprocessing` context is used.
See :ref:`multiprocessing-start-methods`.

*initializer* is an optional callable that is called at the start of
each worker process; *initargs* is a tuple of arguments passed to the
initializer. Should *initializer* raise an exception, all currently
pending jobs will raise a :exc:`~concurrent.futures.process.BrokenProcessPool`,
as well as any attempt to submit more jobs to the pool.

*max\_tasks\_per\_child* is an optional argument that specifies the maximum
number of tasks a single process can execute before it will exit and be
replaced with a fresh worker process. By default *max\_tasks\_per\_child* is
None which means worker processes will live as long as the pool. When
a max is specified, the "spawn" multiprocessing start method will be used by
default in absence of a *mp\_context* parameter. This feature is incompatible
with the "fork" start method.

### ProcessPoolExecutor Example

```
import concurrent.futures
import math

PRIMES = [
    112272535095293,
    112582705942171,
    112272535095293,
    115280095190773,
    115797848077099,
    1099726899285419]

def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False

    sqrt_n = int(math.floor(math.sqrt(n)))
    for i in range(3, sqrt_n + 1, 2):
        if n % i == 0:
            return False
    return True

def main():
    with concurrent.futures.ProcessPoolExecutor() as executor:
        for number, prime in zip(PRIMES, executor.map(is_prime, PRIMES)):
            print('%d is prime: %s' % (number, prime))

if __name__ == '__main__':
    main()
```

## Future Objects

The :class:`Future` class encapsulates the asynchronous execution of a callable.
:class:`Future` instances are created by :meth:`Executor.submit`.

Encapsulates the asynchronous execution of a callable. :class:`Future`
instances are created by :meth:`Executor.submit` and should not be created
directly except for testing.

The following :class:`Future` methods are meant for use in unit tests and
:class:`Executor` implementations.

## Module Functions

## Exception classes
