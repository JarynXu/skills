> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/asyncio-eventloop.rst`  
> Upstream Git blob: `41abb2d7d0a53eb4b906485c8a94cc803d911f85`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Event loop

**Source code:** :source:`Lib/asyncio/events.py`,
:source:`Lib/asyncio/base\_events.py`

---

Preface

The event loop is the core of every asyncio application.
Event loops run asynchronous tasks and callbacks, perform network
IO operations, and run subprocesses.

Application developers should typically use the high-level asyncio functions,
such as :func:`asyncio.run`, and should rarely need to reference the loop
object or call its methods. This section is intended mostly for authors
of lower-level code, libraries, and frameworks, who need finer control over
the event loop behavior.

Obtaining the Event Loop

The following low-level functions can be used to get, set, or create
an event loop:

Contents

This documentation page contains the following sections:

- The [Event Loop Methods](#event-loop-methods) section is the reference documentation of
  the event loop APIs;
- The [Callback Handles](#callback-handles) section documents the :class:`Handle` and
  :class:`TimerHandle` instances which are returned from scheduling
  methods such as :meth:`loop.call\_soon` and :meth:`loop.call\_later`;
- The [Server Objects](#server-objects) section documents types returned from
  event loop methods like :meth:`loop.create\_server`;
- The [Event Loop Implementations](#event-loop-implementations) section documents the
  :class:`SelectorEventLoop` and :class:`ProactorEventLoop` classes;
- The [Examples](#examples) section showcases how to work with some event
  loop APIs.

## Event loop methods

Event loops have **low-level** APIs for the following:

### [Running and stopping the loop](#toc-entry-1)

### [Scheduling callbacks](#toc-entry-2)

Note

Most :mod:`asyncio` scheduling functions don't allow passing
keyword arguments. To do that, use :func:`functools.partial`:

```
# will schedule "print("Hello", flush=True)"
loop.call_soon(
    functools.partial(print, "Hello", flush=True))
```

Using partial objects is usually more convenient than using lambdas,
as asyncio can render partial objects better in debug and error
messages.

### [Scheduling delayed callbacks](#toc-entry-3)

Event loop provides mechanisms to schedule callback functions
to be called at some point in the future. Event loop uses monotonic
clocks to track time.

Note

### [Creating futures and tasks](#toc-entry-4)

### [Opening network connections](#toc-entry-5)

### [Creating network servers](#toc-entry-6)

### [Transferring files](#toc-entry-7)

### [TLS upgrade](#toc-entry-8)

### [Watching file descriptors](#toc-entry-9)

See also :ref:`Platform Support <asyncio-platform-support>` section
for some limitations of these methods.

### [Working with socket objects directly](#toc-entry-10)

In general, protocol implementations that use transport-based APIs
such as :meth:`loop.create\_connection` and :meth:`loop.create\_server`
are faster than implementations that work with sockets directly.
However, there are some use cases when performance is not critical, and
working with :class:`~socket.socket` objects directly is more
convenient.

### [DNS](#toc-entry-11)

Note

Both *getaddrinfo* and *getnameinfo* internally utilize their synchronous
versions through the loop's default thread pool executor.
When this executor is saturated, these methods may experience delays,
which higher-level networking libraries may report as increased timeouts.
To mitigate this, consider using a custom executor for other user tasks,
or setting a default executor with a larger number of workers.

### [Working with pipes](#toc-entry-12)

Supported pipe objects

These methods only work with objects the operating system can poll for
readiness or perform overlapped I/O on. Regular files on disk are **not**
supported on any platform. There is no asynchronous file I/O in asyncio;
use :meth:`loop.run\_in\_executor` to read and write regular files without
blocking the event loop.

On Unix, with :class:`SelectorEventLoop`, *pipe* must wrap one of the
following:

- a pipe, such as an end of an :func:`os.pipe` pair or a FIFO created with
  :func:`os.mkfifo`;
- a socket;
- a character device, such as a terminal.

On Windows, where only :class:`ProactorEventLoop` implements these methods,
*pipe* must wrap a handle opened for overlapped I/O (that is, created with the
FILE\_FLAG\_OVERLAPPED flag), since the handle has to be associated with an
I/O completion port. Handles that were not opened for overlapped I/O are
rejected. In particular, the standard streams (:data:`sys.stdin`,
:data:`sys.stdout` and :data:`sys.stderr`), console handles, and the pipes
created by :func:`os.pipe` are **not** opened for overlapped I/O and therefore
cannot be used with these methods.

Note

:class:`SelectorEventLoop` does not support the above methods on
Windows. Use :class:`ProactorEventLoop` instead for Windows.

### [Unix signals](#toc-entry-13)

### [Executing code in thread or process pools](#toc-entry-14)

### [Error handling API](#toc-entry-15)

Allows customizing how exceptions are handled in the event loop.

### [Enabling debug mode](#toc-entry-16)

### [Running subprocesses](#toc-entry-17)

Methods described in this subsections are low-level. In regular
async/await code consider using the high-level
:func:`asyncio.create\_subprocess\_shell` and
:func:`asyncio.create\_subprocess\_exec` convenience functions instead.

Note

On Windows, the default event loop :class:`ProactorEventLoop` supports
subprocesses, whereas :class:`SelectorEventLoop` does not. See
:ref:`Subprocess Support on Windows <asyncio-windows-subprocess>` for
details.


Note

It is the application's responsibility to ensure that all whitespace
and special characters are quoted appropriately to avoid [shell injection](https://en.wikipedia.org/wiki/Shell_injection#Shell_injection)
vulnerabilities. The :func:`shlex.quote` function can be used to
properly escape whitespace and special characters in strings that
are going to be used to construct shell commands.

## Callback handles

A callback wrapper object returned by :meth:`loop.call\_soon`,
:meth:`loop.call\_soon\_threadsafe`.

A callback wrapper object returned by :meth:`loop.call\_later`,
and :meth:`loop.call\_at`.

This class is a subclass of :class:`Handle`.

## Server objects

Server objects are created by :meth:`loop.create\_server`,
:meth:`loop.create\_unix\_server`, :func:`start\_server`,
and :func:`start\_unix\_server` functions.

Do not instantiate the :class:`Server` class directly.

*Server* objects are asynchronous context managers. When used in an
async with statement, it's guaranteed that the Server object is
closed and not accepting new connections when the async with
statement is completed:

```
srv = await loop.create_server(...)

async with srv:
    # some code

# At this point, srv is closed and no longer accepts new connections.
```

## Event loop implementations

asyncio ships with two different event loop implementations:
:class:`SelectorEventLoop` and :class:`ProactorEventLoop`.

By default asyncio is configured to use :class:`EventLoop`.

A subclass of :class:`AbstractEventLoop` based on the
:mod:`selectors` module.

Uses the most efficient *selector* available for the given
platform. It is also possible to manually configure the
exact selector implementation to be used:

```
import asyncio
import selectors

async def main():
   ...

loop_factory = lambda: asyncio.SelectorEventLoop(selectors.SelectSelector())
asyncio.run(main(), loop_factory=loop_factory)
```

A subclass of :class:`AbstractEventLoop` for Windows that uses "I/O Completion Ports" (IOCP).

> An alias to the most efficient available subclass of :class:`AbstractEventLoop` for the given
> platform.
>
> It is an alias to :class:`SelectorEventLoop` on Unix and :class:`ProactorEventLoop` on Windows.

Abstract base class for asyncio-compliant event loops.

The :ref:`asyncio-event-loop-methods` section lists all
methods that an alternative implementation of AbstractEventLoop
should have defined.

## Examples

Note that all examples in this section **purposefully** show how
to use the low-level event loop APIs, such as :meth:`loop.run\_forever`
and :meth:`loop.call\_soon`. Modern asyncio applications rarely
need to be written this way; consider using the high-level functions
like :func:`asyncio.run`.

### Hello World with call\_soon()

An example using the :meth:`loop.call\_soon` method to schedule a
callback. The callback displays "Hello World" and then stops the
event loop:

```
import asyncio

def hello_world(loop):
    """A callback to print 'Hello World' and stop the event loop"""
    print('Hello World')
    loop.stop()

loop = asyncio.new_event_loop()

# Schedule a call to hello_world()
loop.call_soon(hello_world, loop)

# Blocking call interrupted by loop.stop()
try:
    loop.run_forever()
finally:
    loop.close()
```

### Display the current date with call\_later()

An example of a callback displaying the current date every second. The
callback uses the :meth:`loop.call\_later` method to reschedule itself
after 5 seconds, and then stops the event loop:

```
import asyncio
import datetime as dt

def display_date(end_time, loop):
    print(dt.datetime.now())
    if (loop.time() + 1.0) < end_time:
        loop.call_later(1, display_date, end_time, loop)
    else:
        loop.stop()

loop = asyncio.new_event_loop()

# Schedule the first call to display_date()
end_time = loop.time() + 5.0
loop.call_soon(display_date, end_time, loop)

# Blocking call interrupted by loop.stop()
try:
    loop.run_forever()
finally:
    loop.close()
```

### Watch a file descriptor for read events

Wait until a file descriptor received some data using the
:meth:`loop.add\_reader` method and then close the event loop:

```
import asyncio
from socket import socketpair

# Create a pair of connected file descriptors
rsock, wsock = socketpair()

loop = asyncio.new_event_loop()

def reader():
    data = rsock.recv(100)
    print("Received:", data.decode())

    # We are done: unregister the file descriptor
    loop.remove_reader(rsock)

    # Stop the event loop
    loop.stop()

# Register the file descriptor for read event
loop.add_reader(rsock, reader)

# Simulate the reception of data from the network
loop.call_soon(wsock.send, 'abc'.encode())

try:
    # Run the event loop
    loop.run_forever()
finally:
    # We are done. Close sockets and the event loop.
    rsock.close()
    wsock.close()
    loop.close()
```

### Set signal handlers for SIGINT and SIGTERM

(This signal example only works on Unix.)

Register handlers for signals :const:`~signal.SIGINT` and :const:`~signal.SIGTERM`
using the :meth:`loop.add\_signal\_handler` method:

```
import asyncio
import functools
import os
import signal

def ask_exit(signame, loop):
    print("got signal %s: exit" % signame)
    loop.stop()

async def main():
    loop = asyncio.get_running_loop()

    for signame in {'SIGINT', 'SIGTERM'}:
        loop.add_signal_handler(
            getattr(signal, signame),
            functools.partial(ask_exit, signame, loop))

    await asyncio.sleep(3600)

print("Event loop running for 1 hour, press Ctrl+C to interrupt.")
print(f"pid {os.getpid()}: send SIGINT or SIGTERM to exit.")

asyncio.run(main())
```
