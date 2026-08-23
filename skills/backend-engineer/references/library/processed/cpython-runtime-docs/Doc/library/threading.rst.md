> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/threading.rst`  
> Upstream Git blob: `5d9a7b6314b16685d582e4ae4b57351e42f09e17`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!threading` --- Thread-based parallelism

**Source code:** :source:`Lib/threading.py`

---

This module constructs higher-level threading interfaces on top of the lower
level :mod:`\_thread` module.

## Introduction

The :mod:`!threading` module provides a way to run multiple [threads](https://en.wikipedia.org/wiki/Thread_(computing)) (smaller
units of a process) concurrently within a single process. It allows for the
creation and management of threads, making it possible to execute tasks in
parallel, sharing memory space. Threads are particularly useful when tasks are
I/O bound, such as file operations or making network requests,
where much of the time is spent waiting for external resources.

A typical use case for :mod:`!threading` includes managing a pool of worker
threads that can process multiple tasks concurrently. Here's a basic example of
creating and starting threads using :class:`~threading.Thread`:

```
import threading
import time

def crawl(link, delay=3):
    print(f"crawl started for {link}")
    time.sleep(delay)  # Blocking I/O (simulating a network request)
    print(f"crawl ended for {link}")

links = [
    "https://python.org",
    "https://docs.python.org",
    "https://peps.python.org",
]

# Start threads for each link
threads = []
for link in links:
    # Using `args` to pass positional arguments and `kwargs` for keyword arguments
    t = threading.Thread(target=crawl, args=(link,), kwargs={"delay": 2})
    threads.append(t)

# Start each thread
for t in threads:
    t.start()

# Wait for all threads to finish
for t in threads:
    t.join()
```

Note

In the Python 2.x series, this module contained camelCase names
for some methods and functions. These are deprecated as of Python 3.10,
but they are still supported for compatibility with Python 2.5 and lower.

## GIL and performance considerations

Unlike the :mod:`multiprocessing` module, which uses separate processes to
bypass the :term:`global interpreter lock` (GIL), the threading module operates
within a single process, meaning that all threads share the same memory space.
However, the GIL limits the performance gains of threading when it comes to
CPU-bound tasks, as only one thread can execute Python bytecode at a time.
Despite this, threads remain a useful tool for achieving concurrency in many
scenarios.

As of Python 3.13, :term:`free-threaded <free threading>` builds
can disable the GIL, enabling true parallel execution of threads, but this
feature is not available by default (see [PEP 703](https://peps.python.org/pep-0703)).

## Reference

This module defines the following functions:

This module also defines the following constant:

This module defines a number of classes, which are detailed in the sections
below.

The design of this module is loosely based on Java's threading model. However,
where Java makes locks and condition variables basic behavior of every object,
they are separate objects in Python. Python's :class:`Thread` class supports a
subset of the behavior of Java's Thread class; currently, there are no
priorities, no thread groups, and threads cannot be destroyed, stopped,
suspended, resumed, or interrupted. The static methods of Java's Thread class,
when implemented, are mapped to module-level functions.

All of the methods described below are executed atomically.

### Thread-local data

Thread-local data is data whose values are thread specific. If you
have data that you want to be local to a thread, create a
:class:`local` object and use its attributes:

```
>>> mydata = local()
>>> mydata.number = 42
>>> mydata.number
42
```

You can also access the :class:`local`-object's dictionary:

```
>>> mydata.__dict__
{'number': 42}
>>> mydata.__dict__.setdefault('widgets', [])
[]
>>> mydata.widgets
[]
```

If we access the data in a different thread:

```
>>> log = []
>>> def f():
...     items = sorted(mydata.__dict__.items())
...     log.append(items)
...     mydata.number = 11
...     log.append(mydata.number)

>>> import threading
>>> thread = threading.Thread(target=f)
>>> thread.start()
>>> thread.join()
>>> log
[[], 11]
```

we get different data. Furthermore, changes made in the other thread
don't affect data seen in this thread:

```
>>> mydata.number
42
```

Of course, values you get from a :class:`local` object, including their
:attr:`~object.\_\_dict\_\_` attribute, are for whatever thread was current
at the time the attribute was read. For that reason, you generally
don't want to save these values across threads, as they apply only to
the thread they came from.

You can create custom :class:`local` objects by subclassing the
:class:`local` class:

```
>>> class MyLocal(local):
...     number = 2
...     def __init__(self, /, **kw):
...         self.__dict__.update(kw)
...     def squared(self):
...         return self.number ** 2
```

This can be useful to support default values, methods and
initialization. Note that if you define an :py:meth:`~object.\_\_init\_\_`
method, it will be called each time the :class:`local` object is used
in a separate thread. This is necessary to initialize each thread's
dictionary.

Now if we create a :class:`local` object:

```
>>> mydata = MyLocal(color='red')
```

we have a default number:

```
>>> mydata.number
2
```

an initial color:

```
>>> mydata.color
'red'
>>> del mydata.color
```

And a method that operates on the data:

```
>>> mydata.squared()
4
```

As before, we can access the data in a separate thread:

```
>>> log = []
>>> thread = threading.Thread(target=f)
>>> thread.start()
>>> thread.join()
>>> log
[[('color', 'red')], 11]
```

without affecting this thread's data:

```
>>> mydata.number
2
>>> mydata.color
Traceback (most recent call last):
...
AttributeError: 'MyLocal' object has no attribute 'color'
```

Note that subclasses can define :term:`\_\_slots\_\_`, but they are not
thread local. They are shared across threads:

```
>>> class MyLocal(local):
...     __slots__ = 'number'

>>> mydata = MyLocal()
>>> mydata.number = 42
>>> mydata.color = 'red'
```

So, the separate thread:

```
>>> thread = threading.Thread(target=f)
>>> thread.start()
>>> thread.join()
```

affects what we see:

```
>>> mydata.number
11
```

A class that represents thread-local data.

### Thread objects

The :class:`Thread` class represents an activity that is run in a separate
thread of control. There are two ways to specify the activity: by passing a
callable object to the constructor, or by overriding the :meth:`~Thread.run`
method in a subclass. No other methods (except for the constructor) should be
overridden in a subclass. In other words, *only* override the
\_\_init\_\_() and :meth:`~Thread.run` methods of this class.

Once a thread object is created, its activity must be started by calling the
thread's :meth:`~Thread.start` method. This invokes the :meth:`~Thread.run`
method in a separate thread of control.

Once the thread's activity is started, the thread is considered 'alive'. It
stops being alive when its :meth:`~Thread.run` method terminates -- either
normally, or by raising an unhandled exception. The :meth:`~Thread.is\_alive`
method tests whether the thread is alive.

Other threads can call a thread's :meth:`~Thread.join` method. This blocks
the calling thread until the thread whose :meth:`~Thread.join` method is
called is terminated.

A thread has a name. The name can be passed to the constructor, and read or
changed through the :attr:`~Thread.name` attribute.

If the :meth:`~Thread.run` method raises an exception,
:func:`threading.excepthook` is called to handle it. By default,
:func:`threading.excepthook` ignores silently :exc:`SystemExit`.

A thread can be flagged as a "daemon thread". The significance of this flag is
that the entire Python program exits when only daemon threads are left. The
initial value is inherited from the creating thread. The flag can be set
through the :attr:`~Thread.daemon` property or the *daemon* constructor
argument.

Note

Daemon threads are abruptly stopped at shutdown. Their resources (such
as open files, database transactions, etc.) may not be released properly.
If you want your threads to stop gracefully, make them non-daemonic and
use a suitable signalling mechanism such as an :class:`Event`.

There is a "main thread" object; this corresponds to the initial thread of
control in the Python program. It is not a daemon thread.

There is the possibility that "dummy thread objects" are created. These are
thread objects corresponding to "alien threads", which are threads of control
started outside the threading module, such as directly from C code. Dummy
thread objects have limited functionality; they are always considered alive and
daemonic, and cannot be :ref:`joined <meth-thread-join>`. They are never deleted,
since it is impossible to detect the termination of alien threads.

### Lock objects

A primitive lock is a synchronization primitive that is not owned by a
particular thread when locked. In Python, it is currently the lowest level
synchronization primitive available, implemented directly by the :mod:`\_thread`
extension module.

A primitive lock is in one of two states, "locked" or "unlocked". It is created
in the unlocked state. It has two basic methods, :meth:`~Lock.acquire` and
:meth:`~Lock.release`. When the state is unlocked, :meth:`~Lock.acquire`
changes the state to locked and returns immediately. When the state is locked,
:meth:`~Lock.acquire` blocks until a call to :meth:`~Lock.release` in another
thread changes it to unlocked, then the :meth:`~Lock.acquire` call resets it
to locked and returns. The :meth:`~Lock.release` method should only be
called in the locked state; it changes the state to unlocked and returns
immediately. If an attempt is made to release an unlocked lock, a
:exc:`RuntimeError` will be raised.

Locks also support the :ref:`context management protocol <with-locks>`.

When more than one thread is blocked in :meth:`~Lock.acquire` waiting for the
state to turn to unlocked, only one thread proceeds when a :meth:`~Lock.release`
call resets the state to unlocked; which one of the waiting threads proceeds
is not defined, and may vary across implementations.

All methods are executed atomically.

The class implementing primitive lock objects. Once a thread has acquired a
lock, subsequent attempts to acquire it block, until it is released; any
thread may release it.

### RLock objects

A reentrant lock is a synchronization primitive that may be acquired multiple
times by the same thread. Internally, it uses the concepts of "owning thread"
and "recursion level" in addition to the locked/unlocked state used by primitive
locks. In the locked state, some thread owns the lock; in the unlocked state,
no thread owns it.

Threads call a lock's :meth:`~RLock.acquire` method to lock it,
and its :meth:`~Lock.release` method to unlock it.

Note

Reentrant locks support the :ref:`context management protocol <with-locks>`,
so it is recommended to use :keyword:`with` instead of manually calling
:meth:`~RLock.acquire` and :meth:`~RLock.release`
to handle acquiring and releasing the lock for a block of code.

RLock's :meth:`~RLock.acquire`/:meth:`~RLock.release` call pairs may be nested,
unlike Lock's :meth:`~Lock.acquire`/:meth:`~Lock.release`. Only the final
:meth:`~RLock.release` (the :meth:`~Lock.release` of the outermost pair) resets
the lock to an unlocked state and allows another thread blocked in
:meth:`~RLock.acquire` to proceed.

:meth:`~RLock.acquire`/:meth:`~RLock.release` must be used in pairs: each acquire
must have a release in the thread that has acquired the lock. Failing to
call release as many times the lock has been acquired can lead to deadlock.

This class implements reentrant lock objects. A reentrant lock must be
released by the thread that acquired it. Once a thread has acquired a
reentrant lock, the same thread may acquire it again without blocking; the
thread must release it once for each time it has acquired it.

Note that RLock is actually a factory function which returns an instance
of the most efficient version of the concrete RLock class that is supported
by the platform.

### Condition objects

A condition variable is always associated with some kind of lock; this can be
passed in or one will be created by default. Passing one in is useful when
several condition variables must share the same lock. The lock is part of
the condition object: you don't have to track it separately.

A condition variable obeys the :ref:`context management protocol <with-locks>`:
using the with statement acquires the associated lock for the duration of
the enclosed block. The :meth:`~Condition.acquire` and
:meth:`~Condition.release` methods also call the corresponding methods of
the associated lock.

Other methods must be called with the associated lock held. The
:meth:`~Condition.wait` method releases the lock, and then blocks until
another thread awakens it by calling :meth:`~Condition.notify` or
:meth:`~Condition.notify\_all`. Once awakened, :meth:`~Condition.wait`
re-acquires the lock and returns. It is also possible to specify a timeout.

The :meth:`~Condition.notify` method wakes up one of the threads waiting for
the condition variable, if any are waiting. The :meth:`~Condition.notify\_all`
method wakes up all threads waiting for the condition variable.

Note: the :meth:`~Condition.notify` and :meth:`~Condition.notify\_all` methods
don't release the lock; this means that the thread or threads awakened will
not return from their :meth:`~Condition.wait` call immediately, but only when
the thread that called :meth:`~Condition.notify` or :meth:`~Condition.notify\_all`
finally relinquishes ownership of the lock.

The typical programming style using condition variables uses the lock to
synchronize access to some shared state; threads that are interested in a
particular change of state call :meth:`~Condition.wait` repeatedly until they
see the desired state, while threads that modify the state call
:meth:`~Condition.notify` or :meth:`~Condition.notify\_all` when they change
the state in such a way that it could possibly be a desired state for one
of the waiters. For example, the following code is a generic
producer-consumer situation with unlimited buffer capacity:

```
# Consume one item
with cv:
    while not an_item_is_available():
        cv.wait()
    get_an_available_item()

# Produce one item
with cv:
    make_an_item_available()
    cv.notify()
```

The while loop checking for the application's condition is necessary
because :meth:`~Condition.wait` can return after an arbitrary long time,
and the condition which prompted the :meth:`~Condition.notify` call may
no longer hold true. This is inherent to multi-threaded programming. The
:meth:`~Condition.wait\_for` method can be used to automate the condition
checking, and eases the computation of timeouts:

```
# Consume an item
with cv:
    cv.wait_for(an_item_is_available)
    get_an_available_item()
```

To choose between :meth:`~Condition.notify` and :meth:`~Condition.notify\_all`,
consider whether one state change can be interesting for only one or several
waiting threads. E.g. in a typical producer-consumer situation, adding one
item to the buffer only needs to wake up one consumer thread.

This class implements condition variable objects. A condition variable
allows one or more threads to wait until they are notified by another thread.

If the *lock* argument is given and not None, it must be a :class:`Lock`
or :class:`RLock` object, and it is used as the underlying lock. Otherwise,
a new :class:`RLock` object is created and used as the underlying lock.

### Semaphore objects

This is one of the oldest synchronization primitives in the history of computer
science, invented by the early Dutch computer scientist Edsger W. Dijkstra (he
used the names P() and V() instead of :meth:`~Semaphore.acquire` and
:meth:`~Semaphore.release`).

A semaphore manages an internal counter which is decremented by each
:meth:`~Semaphore.acquire` call and incremented by each :meth:`~Semaphore.release`
call. The counter can never go below zero; when :meth:`~Semaphore.acquire`
finds that it is zero, it blocks, waiting until some other thread calls
:meth:`~Semaphore.release`.

Semaphores also support the :ref:`context management protocol <with-locks>`.

This class implements semaphore objects. A semaphore manages an atomic
counter representing the number of :meth:`release` calls minus the number of
:meth:`acquire` calls, plus an initial value. The :meth:`acquire` method
blocks if necessary until it can return without making the counter negative.
If not given, *value* defaults to 1.

The optional argument gives the initial *value* for the internal counter; it
defaults to 1. If the *value* given is less than 0, :exc:`ValueError` is
raised.

Class implementing bounded semaphore objects. A bounded semaphore checks to
make sure its current value doesn't exceed its initial value. If it does,
:exc:`ValueError` is raised. In most situations semaphores are used to guard
resources with limited capacity. If the semaphore is released too many times
it's a sign of a bug. If not given, *value* defaults to 1.

### :class:`Semaphore` example

Semaphores are often used to guard resources with limited capacity, for example,
a database server. In any situation where the size of the resource is fixed,
you should use a bounded semaphore. Before spawning any worker threads, your
main thread would initialize the semaphore:

```
maxconnections = 5
# ...
pool_sema = BoundedSemaphore(value=maxconnections)
```

Once spawned, worker threads call the semaphore's acquire and release methods
when they need to connect to the server:

```
with pool_sema:
    conn = connectdb()
    try:
        # ... use connection ...
    finally:
        conn.close()
```

The use of a bounded semaphore reduces the chance that a programming error which
causes the semaphore to be released more than it's acquired will go undetected.

### Event objects

This is one of the simplest mechanisms for communication between threads: one
thread signals an event and other threads wait for it.

An event object manages an internal flag that can be set to true with the
:meth:`~Event.set` method and reset to false with the :meth:`~Event.clear`
method. The :meth:`~Event.wait` method blocks until the flag is true.

Class implementing event objects. An event manages a flag that can be set to
true with the :meth:`~Event.set` method and reset to false with the
:meth:`clear` method. The :meth:`wait` method blocks until the flag is true.
The flag is initially false.

### Timer objects

This class represents an action that should be run only after a certain amount
of time has passed --- a timer. :class:`Timer` is a subclass of :class:`Thread`
and as such also functions as an example of creating custom threads.

Timers are started, as with threads, by calling their :meth:`Timer.start <Thread.start>`
method. The timer can be stopped (before its action has begun) by calling the
:meth:`~Timer.cancel` method. The interval the timer will wait before
executing its action may not be exactly the same as the interval specified by
the user.

For example:

```
def hello():
    print("hello, world")

t = Timer(30.0, hello)
t.start()  # after 30 seconds, "hello, world" will be printed
```

Create a timer that will run *function* with arguments *args* and keyword
arguments *kwargs*, after *interval* seconds have passed.
If *args* is None (the default) then an empty list will be used.
If *kwargs* is None (the default) then an empty dict will be used.

### Barrier objects

This class provides a simple synchronization primitive for use by a fixed number
of threads that need to wait for each other. Each of the threads tries to pass
the barrier by calling the :meth:`~Barrier.wait` method and will block until
all of the threads have made their :meth:`~Barrier.wait` calls. At this point,
the threads are released simultaneously.

The barrier can be reused any number of times for the same number of threads.

As an example, here is a simple way to synchronize a client and server thread:

```
b = Barrier(2, timeout=5)

def server():
    start_server()
    b.wait()
    while True:
        connection = accept_connection()
        process_server_connection(connection)

def client():
    b.wait()
    while True:
        connection = make_connection()
        process_client_connection(connection)
```

Create a barrier object for *parties* number of threads. An *action*, when
provided, is a callable to be called by one of the threads when they are
released. *timeout* is the default timeout value if none is specified for
the :meth:`wait` method.

## Using locks, conditions, and semaphores in the :keyword:`!with` statement

All of the objects provided by this module that have acquire and
release methods can be used as context managers for a :keyword:`with`
statement. The acquire method will be called when the block is
entered, and release will be called when the block is exited. Hence,
the following snippet:

```
with some_lock:
    # do something...
```

is equivalent to:

```
some_lock.acquire()
try:
    # do something...
finally:
    some_lock.release()
```

Currently, :class:`Lock`, :class:`RLock`, :class:`Condition`,
:class:`Semaphore`, and :class:`BoundedSemaphore` objects may be used as
:keyword:`with` statement context managers.

## Iterator synchronization

By default, Python iterators do not support concurrent access. Most iterators make
no guarantees when accessed simultaneously from multiple threads. Generator
iterators, for example, raise :exc:`ValueError` if one of their iterator methods
is called while the generator is already executing. The tools in this section
allow reliable concurrency support to be added to ordinary iterators and
iterator-producing callables.

The :class:`serialize\_iterator` wrapper lets multiple threads share a single iterator and
take turns consuming from it. While one thread is running \_\_next\_\_(), the
others block until the iterator becomes available. Each value produced by the
underlying iterator is delivered to exactly one caller.

The :func:`concurrent\_tee` function lets multiple threads each receive the full
stream of values from one underlying iterator. It creates independent iterators
that all draw from the same source. Values are buffered until consumed by all
of the derived iterators.

Return an iterator wrapper that serializes concurrent calls to
:meth:`~iterator.\_\_next\_\_` using a lock.

If the wrapped iterator also defines :meth:`~generator.send`,
:meth:`~generator.throw`, or :meth:`~generator.close`, those calls
are serialized as well.

This makes it possible to share a single iterator, including a generator
iterator, between multiple threads. A lock ensures that calls are handled
one at a time. No values are duplicated or skipped by the wrapper itself.
Each item from the underlying iterator is given to exactly one caller.

This wrapper does not copy or buffer values. Threads that call
:func:`next` while another thread is already advancing the iterator will
block until the active call completes.

Example:

```
import threading

def squares(n):
    for x in range(n):
        yield x * x

def consume(name, iterable):
    for item in iterable:
        print(name, item)

source = threading.serialize_iterator(squares(5))

t1 = threading.Thread(target=consume, args=("left", source))
t2 = threading.Thread(target=consume, args=("right", source))
t1.start()
t2.start()
t1.join()
t2.join()
```

In this example, each number is printed exactly once, but the work is shared
between the two threads.
