> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/multiprocessing.rst`  
> Upstream Git blob: `bedea46cb16d60d58a797d16743c914617571f98`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!multiprocessing` --- Process-based parallelism

**Source code:** :source:`Lib/multiprocessing/`

---

## Introduction

:mod:`!multiprocessing` is a package that supports spawning processes using an
API similar to the :mod:`threading` module. The :mod:`!multiprocessing` package
offers both local and remote concurrency, effectively side-stepping the
:term:`Global Interpreter Lock <global interpreter lock>` by using
subprocesses instead of threads. Due
to this, the :mod:`!multiprocessing` module allows the programmer to fully
leverage multiple processors on a given machine. It runs on both POSIX and
Windows.

The :mod:`!multiprocessing` module also introduces the
:class:`~multiprocessing.pool.Pool` object which offers a convenient means of
parallelizing the execution of a function across multiple input values,
distributing the input data across processes (data parallelism). The following
example demonstrates the common practice of defining such functions in a module
so that child processes can successfully import that module. This basic example
of data parallelism using :class:`~multiprocessing.pool.Pool`,

```
from multiprocessing import Pool

def f(x):
    return x*x

if __name__ == '__main__':
    with Pool(5) as p:
        print(p.map(f, [1, 2, 3]))
```

will print to standard output

```
[1, 4, 9]
```

The :mod:`!multiprocessing` module also introduces APIs which do not have
analogs in the :mod:`threading` module, like the ability to :meth:`terminate
<Process.terminate>`, :meth:`interrupt <Process.interrupt>` or :meth:`kill
<Process.kill>` a running process.

### The :class:`Process` class

In :mod:`!multiprocessing`, processes are spawned by creating a :class:`Process`
object and then calling its :meth:`~Process.start` method. :class:`Process`
follows the API of :class:`threading.Thread`. A trivial example of a
multiprocess program is

```
from multiprocessing import Process

def f(name):
    print('hello', name)

if __name__ == '__main__':
    p = Process(target=f, args=('bob',))
    p.start()
    p.join()
```

To show the individual process IDs involved, here is an expanded example:

```
from multiprocessing import Process
import os

def info(title):
    print(title)
    print('module name:', __name__)
    print('parent process:', os.getppid())
    print('process id:', os.getpid())

def f(name):
    info('function f')
    print('hello', name)

if __name__ == '__main__':
    info('main line')
    p = Process(target=f, args=('bob',))
    p.start()
    p.join()
```

For an explanation of why the if \_\_name\_\_ == '\_\_main\_\_' part is
necessary, see :ref:`multiprocessing-programming`.

The arguments to :class:`Process` usually need to be picklable so they can be
passed to the child process. If you tried typing the above example directly
into a REPL it could lead to an :exc:`AttributeError` in the child process
trying to locate the *f* function in the \_\_main\_\_ module.

### Contexts and start methods

Depending on the platform, :mod:`!multiprocessing` supports three ways
to start a process. These *start methods* are

> *spawn*
> :   The parent process starts a fresh Python interpreter process. The
>     child process will only inherit those resources necessary to run
>     the process object's :meth:`~Process.run` method. In particular,
>     unnecessary file descriptors and handles from the parent process
>     will not be inherited. Starting a process using this method is
>     rather slow compared to using *fork* or *forkserver*.
>
>     Available on POSIX and Windows platforms. The default on Windows and macOS.
>
> *fork*
> :   The parent process uses :func:`os.fork` to fork the Python
>     interpreter. The child process, when it begins, is effectively
>     identical to the parent process. All resources of the parent are
>     inherited by the child process. Note that safely forking a
>     multithreaded process is problematic.
>
>     Available on POSIX systems.
>
> *forkserver*
> :   When the program starts and selects the *forkserver* start method,
>     a server process is spawned. From then on, whenever a new process
>     is needed, the parent process connects to the server and requests
>     that it fork a new process. The fork server process is single threaded
>     unless system libraries or preloaded imports spawn threads as a
>     side-effect so it is generally safe for it to use :func:`os.fork`.
>     No unnecessary resources are inherited.
>
>     Available on POSIX platforms which support passing file descriptors over
>     Unix pipes such as Linux. The default on those.

On POSIX using the *spawn* or *forkserver* start methods will also
start a *resource tracker* process which tracks the unlinked named
system resources (such as named semaphores or
:class:`~multiprocessing.shared\_memory.SharedMemory` objects) created
by processes of the program. When all processes
have exited the resource tracker unlinks any remaining tracked object.
Usually there should be none, but if a process was killed by a signal
there may be some "leaked" resources. (Neither leaked semaphores nor shared
memory segments will be automatically unlinked until the next reboot. This is
problematic for both objects because the system allows only a limited number of
named semaphores, and shared memory segments occupy some space in the main
memory.)

To select a start method you use the :func:`set\_start\_method` in
the if \_\_name\_\_ == '\_\_main\_\_' clause of the main module. For
example:

```
import multiprocessing as mp

def foo(q):
    q.put('hello')

if __name__ == '__main__':
    mp.set_start_method('spawn')
    q = mp.Queue()
    p = mp.Process(target=foo, args=(q,))
    p.start()
    print(q.get())
    p.join()
```

:func:`set\_start\_method` should not be used more than once in the
program.

Alternatively, you can use :func:`get\_context` to obtain a context
object. Context objects have the same API as the multiprocessing
module, and allow one to use multiple start methods in the same
program.

```
import multiprocessing as mp

def foo(q):
    q.put('hello')

if __name__ == '__main__':
    ctx = mp.get_context('spawn')
    q = ctx.Queue()
    p = ctx.Process(target=foo, args=(q,))
    p.start()
    print(q.get())
    p.join()
```

Note that objects related to one context may not be compatible with
processes for a different context. In particular, locks created using
the *fork* context cannot be passed to processes started using the
*spawn* or *forkserver* start methods.

Libraries using :mod:`!multiprocessing` or
:class:`~concurrent.futures.ProcessPoolExecutor` should be designed to allow
their users to provide their own multiprocessing context. Using a specific
context of your own within a library can lead to incompatibilities with the
rest of the library user's application. Always document if your library
requires a specific start method.

Warning

The 'spawn' and 'forkserver' start methods generally cannot
be used with "frozen" executables (i.e., binaries produced by
packages like **PyInstaller** and **cx\_Freeze**) on POSIX systems.
The 'fork' start method may work if code does not use threads.

### Exchanging objects between processes

:mod:`!multiprocessing` supports two types of communication channel between
processes:

**Queues**

> The :class:`Queue` class is a near clone of :class:`queue.Queue`. For
> example:
>
> ```
> from multiprocessing import Process, Queue
>
> def f(q):
>     q.put([42, None, 'hello'])
>
> if __name__ == '__main__':
>     q = Queue()
>     p = Process(target=f, args=(q,))
>     p.start()
>     print(q.get())    # prints "[42, None, 'hello']"
>     p.join()
> ```
>
> Queues are thread and process safe.
> Any object put into a :mod:`!multiprocessing` queue will be serialized.

**Pipes**

> The :func:`Pipe` function returns a pair of connection objects connected by a
> pipe which by default is duplex (two-way). For example:
>
> ```
> from multiprocessing import Process, Pipe
>
> def f(conn):
>     conn.send([42, None, 'hello'])
>     conn.close()
>
> if __name__ == '__main__':
>     parent_conn, child_conn = Pipe()
>     p = Process(target=f, args=(child_conn,))
>     p.start()
>     print(parent_conn.recv())   # prints "[42, None, 'hello']"
>     p.join()
> ```
>
> The two connection objects returned by :func:`Pipe` represent the two ends of
> the pipe. Each connection object has :meth:`~Connection.send` and
> :meth:`~Connection.recv` methods (among others). Note that data in a pipe
> may become corrupted if two processes (or threads) try to read from or write
> to the *same* end of the pipe at the same time. Of course there is no risk
> of corruption from processes using different ends of the pipe at the same
> time.
>
> The :meth:`~Connection.send` method serializes the object and
> :meth:`~Connection.recv` re-creates the object.

### Synchronization between processes

:mod:`!multiprocessing` contains equivalents of all the synchronization
primitives from :mod:`threading`. For instance one can use a lock to ensure
that only one process prints to standard output at a time:

```
from multiprocessing import Process, Lock

def f(l, i):
    l.acquire()
    try:
        print('hello world', i)
    finally:
        l.release()

if __name__ == '__main__':
    lock = Lock()

    for num in range(10):
        Process(target=f, args=(lock, num)).start()
```

Without using the lock output from the different processes is liable to get all
mixed up.

### Sharing state between processes

As mentioned above, when doing concurrent programming it is usually best to
avoid using shared state as far as possible. This is particularly true when
using multiple processes.

However, if you really do need to use some shared data then
:mod:`!multiprocessing` provides a couple of ways of doing so.

**Shared memory**

> Data can be stored in a shared memory map using :class:`Value` or
> :class:`Array`. For example, the following code
>
> ```
> from multiprocessing import Process, Value, Array
>
> def f(n, a):
>     n.value = 3.1415927
>     for i in range(len(a)):
>         a[i] = -a[i]
>
> if __name__ == '__main__':
>     num = Value('d', 0.0)
>     arr = Array('i', range(10))
>
>     p = Process(target=f, args=(num, arr))
>     p.start()
>     p.join()
>
>     print(num.value)
>     print(arr[:])
> ```
>
> will print
>
> ```
> 3.1415927
> [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
> ```
>
> The 'd' and 'i' arguments used when creating num and arr are
> typecodes of the kind used by the :mod:`array` module: 'd' indicates a
> double precision float and 'i' indicates a signed integer. These shared
> objects will be process and thread-safe.
>
> For more flexibility in using shared memory one can use the
> :mod:`multiprocessing.sharedctypes` module which supports the creation of
> arbitrary ctypes objects allocated from shared memory.

**Server process**

> A manager object returned by :func:`Manager` controls a server process which
> holds Python objects and allows other processes to manipulate them using
> proxies.
>
> A manager returned by :func:`Manager` will support types
> :class:`list`, :class:`dict`, :class:`set`, :class:`~managers.Namespace`, :class:`Lock`,
> :class:`RLock`, :class:`Semaphore`, :class:`BoundedSemaphore`,
> :class:`Condition`, :class:`Event`, :class:`Barrier`,
> :class:`Queue`, :class:`Value` and :class:`Array`. For example,
>
> ```
> from multiprocessing import Process, Manager
>
> def f(d, l, s):
>     d[1] = '1'
>     d['2'] = 2
>     d[0.25] = None
>     l.reverse()
>     s.add('a')
>     s.add('b')
>
> if __name__ == '__main__':
>     with Manager() as manager:
>         d = manager.dict()
>         l = manager.list(range(10))
>         s = manager.set()
>
>         p = Process(target=f, args=(d, l, s))
>         p.start()
>         p.join()
>
>         print(d)
>         print(l)
>         print(s)
> ```
>
> will print
>
> ```
> {0.25: None, 1: '1', '2': 2}
> [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
> {'a', 'b'}
> ```
>
> Server process managers are more flexible than using shared memory objects
> because they can be made to support arbitrary object types. Also, a single
> manager can be shared by processes on different computers over a network.
> They are, however, slower than using shared memory.

### Using a pool of workers

The :class:`~multiprocessing.pool.Pool` class represents a pool of worker
processes. It has methods which allows tasks to be offloaded to the worker
processes in a few different ways.

For example:

```
from multiprocessing import Pool, TimeoutError
import time
import os

def f(x):
    return x*x

if __name__ == '__main__':
    # start 4 worker processes
    with Pool(processes=4) as pool:

        # print "[0, 1, 4,..., 81]"
        print(pool.map(f, range(10)))

        # print same numbers in arbitrary order
        for i in pool.imap_unordered(f, range(10)):
            print(i)

        # evaluate "f(20)" asynchronously
        res = pool.apply_async(f, (20,))      # runs in *only* one process
        print(res.get(timeout=1))             # prints "400"

        # evaluate "os.getpid()" asynchronously
        res = pool.apply_async(os.getpid, ()) # runs in *only* one process
        print(res.get(timeout=1))             # prints the PID of that process

        # launching multiple evaluations asynchronously *may* use more processes
        multiple_results = [pool.apply_async(os.getpid, ()) for i in range(4)]
        print([res.get(timeout=1) for res in multiple_results])

        # make a single worker sleep for 10 seconds
        res = pool.apply_async(time.sleep, (10,))
        try:
            print(res.get(timeout=1))
        except TimeoutError:
            print("We lacked patience and got a multiprocessing.TimeoutError")

        print("For the moment, the pool remains available for more work")

    # exiting the 'with'-block has stopped the pool
    print("Now the pool is closed and no longer available")
```

Note that the methods of a pool should only ever be used by the
process which created it.

Note

Functionality within this package requires that the \_\_main\_\_ module be
importable by the children. This is covered in :ref:`multiprocessing-programming`
however it is worth pointing out here. This means that some examples, such
as the :class:`multiprocessing.pool.Pool` examples will not work in the
interactive interpreter. For example:

```
>>> from multiprocessing import Pool
>>> p = Pool(5)
>>> def f(x):
...     return x*x
...
>>> with p:
...     p.map(f, [1,2,3])
Process PoolWorker-1:
Process PoolWorker-2:
Process PoolWorker-3:
Traceback (most recent call last):
Traceback (most recent call last):
Traceback (most recent call last):
AttributeError: Can't get attribute 'f' on <module '__main__' (<class '_frozen_importlib.BuiltinImporter'>)>
AttributeError: Can't get attribute 'f' on <module '__main__' (<class '_frozen_importlib.BuiltinImporter'>)>
AttributeError: Can't get attribute 'f' on <module '__main__' (<class '_frozen_importlib.BuiltinImporter'>)>
```

(If you try this it will actually output three full tracebacks
interleaved in a semi-random fashion, and then you may have to
stop the parent process somehow.)

## Reference

The :mod:`!multiprocessing` package mostly replicates the API of the
:mod:`threading` module.

### Global start method

Python supports several ways to create and initialize a process.
The global start method sets the default mechanism for creating a process.

Several multiprocessing functions and methods that may also instantiate
certain objects will implicitly set the global start method to the system's default,
if it hasn’t been set already. The global start method can only be set once.
If you need to change the start method from the system default, you must
proactively set the global start method before calling functions or methods,
or creating these objects.

### :class:`Process` and exceptions

### Pipes and Queues

When using multiple processes, one generally uses message passing for
communication between processes and avoids having to use any synchronization
primitives like locks.

For passing messages one can use :func:`Pipe` (for a connection between two
processes) or a queue (which allows multiple producers and consumers).

The :class:`Queue`, :class:`SimpleQueue` and :class:`JoinableQueue` types
are multi-producer, multi-consumer :abbr:`FIFO (first-in, first-out)`
queues modelled on the :class:`queue.Queue` class in the
standard library. They differ in that :class:`Queue` lacks the
:meth:`~queue.Queue.task\_done` and :meth:`~queue.Queue.join` methods introduced
into Python 2.5's :class:`queue.Queue` class.

If you use :class:`JoinableQueue` then you **must** call
:meth:`JoinableQueue.task\_done` for each task removed from the queue or else the
semaphore used to count the number of unfinished tasks may eventually overflow,
raising an exception.

One difference from other Python queue implementations, is that :mod:`!multiprocessing`
queues serializes all objects that are put into them using :mod:`pickle`.
The object returned by the get method is a re-created object that does not share
memory with the original object.

Note that one can also create a shared queue by using a manager object -- see
:ref:`multiprocessing-managers`.

Note

:mod:`!multiprocessing` uses the usual :exc:`queue.Empty` and
:exc:`queue.Full` exceptions to signal a timeout. They are not available in
the :mod:`!multiprocessing` namespace so you need to import them from
:mod:`queue`.


Note

When an object is put on a queue, the object is pickled and a
background thread later flushes the pickled data to an underlying
pipe. This has some consequences which are a little surprising,
but should not cause any practical difficulties -- if they really
bother you then you can instead use a queue created with a
:ref:`manager <multiprocessing-managers>`.

1. After putting an object on an empty queue there may be an
   infinitesimal delay before the queue's :meth:`~Queue.empty`
   method returns :const:`False` and :meth:`~Queue.get\_nowait` can
   return without raising :exc:`queue.Empty`.
2. If multiple processes are enqueuing objects, it is possible for
   the objects to be received at the other end out-of-order.
   However, objects enqueued by the same process will always be in
   the expected order with respect to each other.


Warning

If a process is killed using :meth:`Process.terminate` or :func:`os.kill`
while it is trying to use a :class:`Queue`, then the data in the queue is
likely to become corrupted. This may cause any other process to get an
exception when it tries to use the queue later on.


Warning

As mentioned above, if a child process has put items on a queue (and it has
not used :meth:`JoinableQueue.cancel\_join\_thread
<multiprocessing.Queue.cancel\_join\_thread>`), then that process will
not terminate until all buffered items have been flushed to the pipe.

This means that if you try joining that process you may get a deadlock unless
you are sure that all items which have been put on the queue have been
consumed. Similarly, if the child process is non-daemonic then the parent
process may hang on exit when it tries to join all its non-daemonic children.

Note that a queue created using a manager does not have this issue. See
:ref:`multiprocessing-programming`.

For an example of the usage of queues for interprocess communication see
:ref:`multiprocessing-examples`.

Returns a process shared queue implemented using a pipe and a few
locks/semaphores. When a process first puts an item on the queue a feeder
thread is started which transfers objects from a buffer into the pipe.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

The usual :exc:`queue.Empty` and :exc:`queue.Full` exceptions from the
standard library's :mod:`queue` module are raised to signal timeouts.

:class:`Queue` implements all the methods of :class:`queue.Queue` except for
:meth:`~queue.Queue.task\_done`, :meth:`~queue.Queue.join`, and
:meth:`~queue.Queue.shutdown`.

:class:`multiprocessing.Queue` has a few additional methods not found in
:class:`queue.Queue`. These methods are usually unnecessary for most
code:

Note

This class's functionality requires a functioning shared semaphore
implementation on the host operating system. Without one, the
functionality in this class will be disabled, and attempts to
instantiate a :class:`Queue` will result in an :exc:`ImportError`. See
:issue:`3770` for additional information. The same holds true for any
of the specialized queue types listed below.

It is a simplified :class:`Queue` type, very close to a locked :class:`Pipe`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

:class:`JoinableQueue`, a :class:`Queue` subclass, is a queue which
additionally has :meth:`task\_done` and :meth:`join` methods.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

### Miscellaneous

Note

:mod:`!multiprocessing` contains no analogues of
:func:`threading.active\_count`, :func:`threading.enumerate`,
:func:`threading.settrace`, :func:`threading.setprofile`,
:class:`threading.Timer`, or :class:`threading.local`.

### Connection Objects

Connection objects allow the sending and receiving of picklable objects or
strings. They can be thought of as message oriented connected sockets.

Connection objects are usually created using
:func:`Pipe <multiprocessing.Pipe>` -- see also
:ref:`multiprocessing-listeners-clients`.

For example:

Warning

The :meth:`Connection.recv` method automatically unpickles the data it
receives, which can be a security risk unless you can trust the process
which sent the message.

Therefore, unless the connection object was produced using :func:`Pipe` you
should only use the :meth:`~Connection.recv` and :meth:`~Connection.send`
methods after performing some sort of authentication. See
:ref:`multiprocessing-auth-keys`.


Warning

If a process is killed while it is trying to read or write to a pipe then
the data in the pipe is likely to become corrupted, because it may become
impossible to be sure where the message boundaries lie.

### Synchronization primitives

Generally synchronization primitives are not as necessary in a multiprocess
program as they are in a multithreaded program. See the documentation for
:mod:`threading` module.

Note that one can also create synchronization primitives by using a manager
object -- see :ref:`multiprocessing-managers`.

A barrier object: a clone of :class:`threading.Barrier`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

A bounded semaphore object: a close analog of
:class:`threading.BoundedSemaphore`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

A solitary difference from its close analog exists: its acquire method's
first argument is named *block*, as is consistent with :meth:`Lock.acquire`.

Note

On macOS, this is indistinguishable from :class:`Semaphore` because
sem\_getvalue() is not implemented on that platform.

A condition variable: an alias for :class:`threading.Condition`.

If *lock* is specified then it should be a :class:`Lock` or :class:`RLock`
object from :mod:`!multiprocessing`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

A clone of :class:`threading.Event`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

A non-recursive lock object: a close analog of :class:`threading.Lock`.
Once a process or thread has acquired a lock, subsequent attempts to
acquire it from any process or thread will block until it is released;
any process or thread may release it. The concepts and behaviors of
:class:`threading.Lock` as it applies to threads are replicated here in
:class:`multiprocessing.Lock` as it applies to either processes or threads,
except as noted.

Note that :class:`Lock` is actually a factory function which returns an
instance of multiprocessing.synchronize.Lock initialized with a
default context.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

:class:`Lock` supports the :term:`context manager` protocol and thus may be
used in :keyword:`with` statements.

A recursive lock object: a close analog of :class:`threading.RLock`. A
recursive lock must be released by the process or thread that acquired it.
Once a process or thread has acquired a recursive lock, the same process
or thread may acquire it again without blocking; that process or thread
must release it once for each time it has been acquired.

Note that :class:`RLock` is actually a factory function which returns an
instance of multiprocessing.synchronize.RLock initialized with a
default context.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

:class:`RLock` supports the :term:`context manager` protocol and thus may be
used in :keyword:`with` statements.

A semaphore object: a close analog of :class:`threading.Semaphore`.

Instantiating this class may set the global start method. See
:ref:`global-start-method` for more details.

A solitary difference from its close analog exists: its acquire method's
first argument is named *block*, as is consistent with :meth:`Lock.acquire`.

Note

On macOS, sem\_timedwait is unsupported, so calling acquire() with
a timeout will emulate that function's behavior using a sleeping loop.


Note

Some of this package's functionality requires a functioning shared semaphore
implementation on the host operating system. Without one, the
:mod:`multiprocessing.synchronize` module will be disabled, and attempts to
import it will result in an :exc:`ImportError`. See
:issue:`3770` for additional information.

### Shared :mod:`ctypes` Objects

It is possible to create shared objects using shared memory which can be
inherited by child processes.

#### The :mod:`!multiprocessing.sharedctypes` module

The :mod:`!multiprocessing.sharedctypes` module provides functions for allocating
:mod:`ctypes` objects from shared memory which can be inherited by child
processes.

Note

Although it is possible to store a pointer in shared memory remember that
this will refer to a location in the address space of a specific process.
However, the pointer is quite likely to be invalid in the context of a second
process and trying to dereference the pointer from the second process may
cause a crash.

The table below compares the syntax for creating shared ctypes objects from
shared memory with the normal ctypes syntax. (In the table MyStruct is some
subclass of :class:`ctypes.Structure`.)

| ctypes | sharedctypes using type | sharedctypes using typecode |
| --- | --- | --- |
| c\_double(2.4) | RawValue(c\_double, 2.4) | RawValue('d', 2.4) |
| MyStruct(4, 6) | RawValue(MyStruct, 4, 6) |  |
| (c\_short \* 7)() | RawArray(c\_short, 7) | RawArray('h', 7) |
| (c\_int \* 3)(9, 2, 8) | RawArray(c\_int, (9, 2, 8)) | RawArray('i', (9, 2, 8)) |

Below is an example where a number of ctypes objects are modified by a child
process:

```
from multiprocessing import Process, Lock
from multiprocessing.sharedctypes import Value, Array
from ctypes import Structure, c_double

class Point(Structure):
    _fields_ = [('x', c_double), ('y', c_double)]

def modify(n, x, s, A):
    n.value **= 2
    x.value **= 2
    s.value = s.value.upper()
    for a in A:
        a.x **= 2
        a.y **= 2

if __name__ == '__main__':
    lock = Lock()

    n = Value('i', 7)
    x = Value(c_double, 1.0/3.0, lock=False)
    s = Array('c', b'hello world', lock=lock)
    A = Array(Point, [(1.875,-6.25), (-5.75,2.0), (2.375,9.5)], lock=lock)

    p = Process(target=modify, args=(n, x, s, A))
    p.start()
    p.join()

    print(n.value)
    print(x.value)
    print(s.value)
    print([(a.x, a.y) for a in A])
```

The results printed are

```
49
0.1111111111111111
HELLO WORLD
[(3.515625, 39.0625), (33.0625, 4.0), (5.640625, 90.25)]
```

### Managers

Managers provide a way to create data which can be shared between different
processes, including sharing over a network between processes running on
different machines. A manager object controls a server process which manages
*shared objects*. Other processes can access the shared objects by using
proxies.

Manager processes will be shutdown as soon as they are garbage collected or
their parent process exits. The manager classes are defined in the
:mod:`multiprocessing.managers` module:

A subclass of :class:`BaseManager` which can be used for the synchronization
of processes. Objects of this type are returned by
:func:`multiprocessing.Manager`.

Its methods create and return :ref:`multiprocessing-proxy\_objects` for a
number of commonly used data types to be synchronized across processes.
This notably includes shared lists and dictionaries.

A type that can register with :class:`SyncManager`.

A namespace object has no public methods, but does have writable attributes.
Its representation shows the values of its attributes.

However, when using a proxy for a namespace object, an attribute beginning
with '\_' will be an attribute of the proxy and not an attribute of the
referent:

#### Customized managers

To create one's own manager, one creates a subclass of :class:`BaseManager` and
uses the :meth:`~BaseManager.register` classmethod to register new types or
callables with the manager class. For example:

```
from multiprocessing.managers import BaseManager

class MathsClass:
    def add(self, x, y):
        return x + y
    def mul(self, x, y):
        return x * y

class MyManager(BaseManager):
    pass

MyManager.register('Maths', MathsClass)

if __name__ == '__main__':
    with MyManager() as manager:
        maths = manager.Maths()
        print(maths.add(4, 3))         # prints 7
        print(maths.mul(7, 8))         # prints 56
```

#### Using a remote manager

It is possible to run a manager server on one machine and have clients use it
from other machines (assuming that the firewalls involved allow it).

Running the following commands creates a server for a single shared queue which
remote clients can access:

```
>>> from multiprocessing.managers import BaseManager
>>> from queue import Queue
>>> queue = Queue()
>>> class QueueManager(BaseManager): pass
>>> QueueManager.register('get_queue', callable=lambda:queue)
>>> m = QueueManager(address=('', 50000), authkey=b'abracadabra')
>>> s = m.get_server()
>>> s.serve_forever()
```

One client can access the server as follows:

```
>>> from multiprocessing.managers import BaseManager
>>> class QueueManager(BaseManager): pass
>>> QueueManager.register('get_queue')
>>> m = QueueManager(address=('foo.bar.org', 50000), authkey=b'abracadabra')
>>> m.connect()
>>> queue = m.get_queue()
>>> queue.put('hello')
```

Another client can also use it:

```
>>> from multiprocessing.managers import BaseManager
>>> class QueueManager(BaseManager): pass
>>> QueueManager.register('get_queue')
>>> m = QueueManager(address=('foo.bar.org', 50000), authkey=b'abracadabra')
>>> m.connect()
>>> queue = m.get_queue()
>>> queue.get()
'hello'
```

Local processes can also access that queue, using the code from above on the
client to access it remotely:

```
>>> from multiprocessing import Process, Queue
>>> from multiprocessing.managers import BaseManager
>>> class Worker(Process):
...     def __init__(self, q):
...         self.q = q
...         super().__init__()
...     def run(self):
...         self.q.put('local hello')
...
>>> queue = Queue()
>>> w = Worker(queue)
>>> w.start()
>>> class QueueManager(BaseManager): pass
...
>>> QueueManager.register('get_queue', callable=lambda: queue)
>>> m = QueueManager(address=('', 50000), authkey=b'abracadabra')
>>> s = m.get_server()
>>> s.serve_forever()
```

### Proxy Objects

A proxy is an object which *refers* to a shared object which lives (presumably)
in a different process. The shared object is said to be the *referent* of the
proxy. Multiple proxy objects may have the same referent.

A proxy object has methods which invoke corresponding methods of its referent
(although not every method of the referent will necessarily be available through
the proxy). In this way, a proxy can be used just like its referent can:

Notice that applying :func:`str` to a proxy will return the representation of
the referent, whereas applying :func:`repr` will return the representation of
the proxy.

An important feature of proxy objects is that they are picklable so they can be
passed between processes. As such, a referent can contain
:ref:`multiprocessing-proxy\_objects`. This permits nesting of these managed
lists, dicts, and other :ref:`multiprocessing-proxy\_objects`:

Similarly, dict and list proxies may be nested inside one another:

```
>>> l_outer = manager.list([ manager.dict() for i in range(2) ])
>>> d_first_inner = l_outer[0]
>>> d_first_inner['a'] = 1
>>> d_first_inner['b'] = 2
>>> l_outer[1]['c'] = 3
>>> l_outer[1]['z'] = 26
>>> print(l_outer[0])
{'a': 1, 'b': 2}
>>> print(l_outer[1])
{'c': 3, 'z': 26}
```

If standard (non-proxy) :class:`list` or :class:`dict` objects are contained
in a referent, modifications to those mutable values will not be propagated
through the manager because the proxy has no way of knowing when the values
contained within are modified. However, storing a value in a container proxy
(which triggers a \_\_setitem\_\_ on the proxy object) does propagate through
the manager and so to effectively modify such an item, one could re-assign the
modified value to the container proxy:

```
# create a list proxy and append a mutable object (a dictionary)
lproxy = manager.list()
lproxy.append({})
# now mutate the dictionary
d = lproxy[0]
d['a'] = 1
d['b'] = 2
# at this point, the changes to d are not yet synced, but by
# updating the dictionary, the proxy is notified of the change
lproxy[0] = d
```

This approach is perhaps less convenient than employing nested
:ref:`multiprocessing-proxy\_objects` for most use cases but also
demonstrates a level of control over the synchronization.

Note

The proxy types in :mod:`!multiprocessing` do nothing to support comparisons
by value. So, for instance, we have:

One should just use a copy of the referent instead when making comparisons.

Proxy objects are instances of subclasses of :class:`BaseProxy`.

#### Cleanup

A proxy object uses a weakref callback so that when it gets garbage collected it
deregisters itself from the manager which owns its referent.

A shared object gets deleted from the manager process when there are no longer
any proxies referring to it.

### Process Pools

One can create a pool of processes which will carry out tasks submitted to it
with the :class:`Pool` class.

The class of the result returned by :meth:`Pool.apply\_async` and
:meth:`Pool.map\_async`.

The following example demonstrates the use of a pool:

```
from multiprocessing import Pool
import time

def f(x):
    return x*x

if __name__ == '__main__':
    with Pool(processes=4) as pool:         # start 4 worker processes
        result = pool.apply_async(f, (10,)) # evaluate "f(10)" asynchronously in a single process
        print(result.get(timeout=1))        # prints "100" unless your computer is *very* slow

        print(pool.map(f, range(10)))       # prints "[0, 1, 4,..., 81]"

        it = pool.imap(f, range(10))
        print(next(it))                     # prints "0"
        print(next(it))                     # prints "1"
        print(it.next(timeout=1))           # prints "4" unless your computer is *very* slow

        result = pool.apply_async(time.sleep, (10,))
        print(result.get(timeout=1))        # raises multiprocessing.TimeoutError
```

### Listeners and Clients

Usually message passing between processes is done using queues or by using
:class:`~Connection` objects returned by
:func:`~multiprocessing.Pipe`.

However, the :mod:`!multiprocessing.connection` module allows some extra
flexibility. It basically gives a high level message oriented API for dealing
with sockets or Windows named pipes. It also has support for *digest
authentication* using the :mod:`hmac` module, and for polling
multiple connections at the same time.

A wrapper for a bound socket or Windows named pipe which is 'listening' for
connections.

*address* is the address to be used by the bound socket or named pipe of the
listener object.

Note

If an address of '0.0.0.0' is used, the address will not be a connectable
end point on Windows. If you require a connectable end-point,
you should use '127.0.0.1'.

*family* is the type of socket (or named pipe) to use. This can be one of
the strings 'AF\_INET' (for a TCP socket), 'AF\_UNIX' (for a Unix
domain socket) or 'AF\_PIPE' (for a Windows named pipe). Of these only
the first is guaranteed to be available. If *family* is None then the
family is inferred from the format of *address*. If *address* is also
None then a default is chosen. This default is the family which is
assumed to be the fastest available. See
:ref:`multiprocessing-address-formats`. Note that if *family* is
'AF\_UNIX' and address is None then the socket will be created in a
private temporary directory created using :func:`tempfile.mkstemp`.

If the listener object uses a socket then *backlog* (1 by default) is passed
to the :meth:`~socket.socket.listen` method of the socket once it has been
bound.

If *authkey* is given and not None, it should be a byte string and will be
used as the secret key for an HMAC-based authentication challenge. No
authentication is done if *authkey* is None.
:exc:`~multiprocessing.AuthenticationError` is raised if authentication fails.
See :ref:`multiprocessing-auth-keys`.

Listener objects have the following read-only properties:

**Examples**

The following server code creates a listener which uses 'secret password' as
an authentication key. It then waits for a connection and sends some data to
the client:

```
from multiprocessing.connection import Listener
from array import array

address = ('localhost', 6000)     # family is deduced to be 'AF_INET'

with Listener(address, authkey=b'secret password') as listener:
    with listener.accept() as conn:
        print('connection accepted from', listener.last_accepted)

        conn.send([2.25, None, 'junk', float])

        conn.send_bytes(b'hello')

        conn.send_bytes(array('i', [42, 1729]))
```

The following code connects to the server and receives some data from the
server:

```
from multiprocessing.connection import Client
from array import array

address = ('localhost', 6000)

with Client(address, authkey=b'secret password') as conn:
    print(conn.recv())                  # => [2.25, None, 'junk', float]

    print(conn.recv_bytes())            # => 'hello'

    arr = array('i', [0, 0, 0, 0, 0])
    print(conn.recv_bytes_into(arr))    # => 8
    print(arr)                          # => array('i', [42, 1729, 0, 0, 0])
```

The following code uses :func:`~multiprocessing.connection.wait` to
wait for messages from multiple processes at once:

```
from multiprocessing import Process, Pipe, current_process
from multiprocessing.connection import wait

def foo(w):
    for i in range(10):
        w.send((i, current_process().name))
    w.close()

if __name__ == '__main__':
    readers = []

    for i in range(4):
        r, w = Pipe(duplex=False)
        readers.append(r)
        p = Process(target=foo, args=(w,))
        p.start()
        # We close the writable end of the pipe now to be sure that
        # p is the only process which owns a handle for it.  This
        # ensures that when p closes its handle for the writable end,
        # wait() will promptly report the readable end as being ready.
        w.close()

    while readers:
        for r in wait(readers):
            try:
                msg = r.recv()
            except EOFError:
                readers.remove(r)
            else:
                print(msg)
```

#### Address Formats

- An 'AF\_INET' address is a tuple of the form (hostname, port) where
  *hostname* is a string and *port* is an integer.
- An 'AF\_UNIX' address is a string representing a filename on the
  filesystem.
- An 'AF\_PIPE' address is a string of the form
  :samp:`r'\\\\\\.\\pipe\\\\{PipeName}'`. To use :func:`Client` to connect to a named
  pipe on a remote computer called *ServerName* one should use an address of the
  form :samp:`r'\\\\\\\\{ServerName}\\pipe\\\\{PipeName}'` instead.

Note that any string beginning with two backslashes is assumed by default to be
an 'AF\_PIPE' address rather than an 'AF\_UNIX' address.

### Authentication keys

When one uses :meth:`Connection.recv <Connection.recv>`, the
data received is automatically
unpickled. Unfortunately unpickling data from an untrusted source is a security
risk. Therefore :class:`Listener` and :func:`Client` use the :mod:`hmac` module
to provide digest authentication.

An authentication key is a byte string which can be thought of as a
password: once a connection is established both ends will demand proof
that the other knows the authentication key. (Demonstrating that both
ends are using the same key does **not** involve sending the key over
the connection.)

If authentication is requested but no authentication key is specified then the
return value of current\_process().authkey is used (see
:class:`~multiprocessing.Process`). This value will be automatically inherited by
any :class:`~multiprocessing.Process` object that the current process creates.
This means that (by default) all processes of a multi-process program will share
a single authentication key which can be used when setting up connections
between themselves.

Suitable authentication keys can also be generated by using :func:`os.urandom`.

This authentication protects :class:`Listener` and :func:`Client` connections,
which are reachable by address. It is not applied to the anonymous pipes
created by :func:`~multiprocessing.Pipe` or used internally by
:class:`~multiprocessing.Queue`.
:mod:`multiprocessing` treats all local processes running as the same user as
trusted; on most operating systems such processes can access each other's pipe
file descriptors regardless. Applications that require isolation between
processes of the same user must arrange it at the operating-system level --
for example, by running workers under a different user account or in a sandbox.

### Logging

Some support for logging is available. Note, however, that the :mod:`logging`
package does not use process shared locks so it is possible (depending on the
handler type) for messages from different processes to get mixed up.

Below is an example session with logging turned on:

```
>>> import multiprocessing, logging
>>> logger = multiprocessing.log_to_stderr()
>>> logger.setLevel(logging.INFO)
>>> logger.warning('doomed')
[WARNING/MainProcess] doomed
>>> m = multiprocessing.Manager()
[INFO/SyncManager-...] child process calling self.run()
[INFO/SyncManager-...] created temp directory /.../pymp-...
[INFO/SyncManager-...] manager serving at '/.../listener-...'
>>> del m
[INFO/MainProcess] sending shutdown message to manager
[INFO/SyncManager-...] manager exiting with exitcode 0
```

For a full table of logging levels, see the :mod:`logging` module.

### The :mod:`!multiprocessing.dummy` module

:mod:`!multiprocessing.dummy` replicates the API of :mod:`!multiprocessing` but is
no more than a wrapper around the :mod:`threading` module.

In particular, the Pool function provided by :mod:`!multiprocessing.dummy`
returns an instance of :class:`ThreadPool`, which is a subclass of
:class:`Pool` that supports all the same method calls but uses a pool of
worker threads rather than worker processes.

A thread pool object which controls a pool of worker threads to which jobs
can be submitted. :class:`ThreadPool` instances are fully interface
compatible with :class:`Pool` instances, and their resources must also be
properly managed, either by using the pool as a context manager or by
calling :meth:`~multiprocessing.pool.Pool.close` and
:meth:`~multiprocessing.pool.Pool.terminate` manually.

*processes* is the number of worker threads to use. If *processes* is
None then the number returned by :func:`os.process\_cpu\_count` is used.

If *initializer* is not None then each worker process will call
initializer(\*initargs) when it starts.

Unlike :class:`Pool`, *maxtasksperchild* and *context* cannot be provided.

Note

A :class:`ThreadPool` shares the same interface as :class:`Pool`, which
is designed around a pool of processes and predates the introduction of
the :class:`concurrent.futures` module. As such, it inherits some
operations that don't make sense for a pool backed by threads, and it
has its own type for representing the status of asynchronous jobs,
:class:`AsyncResult`, that is not understood by any other libraries.

Users should generally prefer to use
:class:`concurrent.futures.ThreadPoolExecutor`, which has a simpler
interface that was designed around threads from the start, and which
returns :class:`concurrent.futures.Future` instances that are
compatible with many other libraries, including :mod:`asyncio`.

## Programming guidelines

There are certain guidelines and idioms which should be adhered to when using
:mod:`!multiprocessing`.

### All start methods

The following applies to all start methods.

Avoid shared state

> As far as possible one should try to avoid shifting large amounts of data
> between processes.
>
> It is probably best to stick to using queues or pipes for communication
> between processes rather than using the lower level synchronization
> primitives.

Picklability

> Ensure that the arguments to the methods of proxies are picklable.

Thread safety of proxies

> Do not use a proxy object from more than one thread unless you protect it
> with a lock.
>
> (There is never a problem with different processes using the *same* proxy.)

Joining zombie processes

> On POSIX when a process finishes but has not been joined it becomes a zombie.
> There should never be very many because each time a new process starts (or
> :func:`~multiprocessing.active\_children` is called) all completed processes
> which have not yet been joined will be joined. Also calling a finished
> process's :meth:`Process.is\_alive <multiprocessing.Process.is\_alive>` will
> join the process. Even so it is probably good
> practice to explicitly join all the processes that you start.

Better to inherit than pickle/unpickle

> When using the *spawn* or *forkserver* start methods many types
> from :mod:`!multiprocessing` need to be picklable so that child
> processes can use them. However, one should generally avoid
> sending shared objects to other processes using pipes or queues.
> Instead you should arrange the program so that a process which
> needs access to a shared resource created elsewhere can inherit it
> from an ancestor process.

Avoid terminating processes

> Using the :meth:`Process.terminate <multiprocessing.Process.terminate>`
> method to stop a process is liable to
> cause any shared resources (such as locks, semaphores, pipes and queues)
> currently being used by the process to become broken or unavailable to other
> processes.
>
> Therefore it is probably best to only consider using
> :meth:`Process.terminate <multiprocessing.Process.terminate>` on processes
> which never use any shared resources.

Joining processes that use queues

> Bear in mind that a process that has put items in a queue will wait before
> terminating until all the buffered items are fed by the "feeder" thread to
> the underlying pipe. (The child process can call the
> :meth:`Queue.cancel\_join\_thread <multiprocessing.Queue.cancel\_join\_thread>`
> method of the queue to avoid this behaviour.)
>
> This means that whenever you use a queue you need to make sure that all
> items which have been put on the queue will eventually be removed before the
> process is joined. Otherwise you cannot be sure that processes which have
> put items on the queue will terminate. Remember also that non-daemonic
> processes will be joined automatically.
>
> An example which will deadlock is the following:
>
> ```
> from multiprocessing import Process, Queue
>
> def f(q):
>     q.put('X' * 1000000)
>
> if __name__ == '__main__':
>     queue = Queue()
>     p = Process(target=f, args=(queue,))
>     p.start()
>     p.join()                    # this deadlocks
>     obj = queue.get()
> ```
>
> A fix here would be to swap the last two lines (or simply remove the
> p.join() line).

Explicitly pass resources to child processes

> On POSIX using the *fork* start method, a child process can make
> use of a shared resource created in a parent process using a
> global resource. However, it is better to pass the object as an
> argument to the constructor for the child process.
>
> Apart from making the code (potentially) compatible with Windows
> and the other start methods this also ensures that as long as the
> child process is still alive the object will not be garbage
> collected in the parent process. This might be important if some
> resource is freed when the object is garbage collected in the
> parent process.
>
> So for instance
>
> ```
> from multiprocessing import Process, Lock
>
> def f():
>     ... do something using "lock" ...
>
> if __name__ == '__main__':
>     lock = Lock()
>     for i in range(10):
>         Process(target=f).start()
> ```
>
> should be rewritten as
>
> ```
> from multiprocessing import Process, Lock
>
> def f(l):
>     ... do something using "l" ...
>
> if __name__ == '__main__':
>     lock = Lock()
>     for i in range(10):
>         Process(target=f, args=(lock,)).start()
> ```

Beware of replacing :data:`sys.stdin` with a "file like object"

> :mod:`!multiprocessing` originally unconditionally called:
>
> ```
> os.close(sys.stdin.fileno())
> ```
>
> in the :meth:`multiprocessing.Process.\_bootstrap` method --- this resulted
> in issues with processes-in-processes. This has been changed to:
>
> ```
> sys.stdin.close()
> sys.stdin = open(os.open(os.devnull, os.O_RDONLY), closefd=False)
> ```
>
> Which solves the fundamental issue of processes colliding with each other
> resulting in a bad file descriptor error, but introduces a potential danger
> to applications which replace :func:`sys.stdin` with a "file-like object"
> with output buffering. This danger is that if multiple processes call
> :meth:`~io.IOBase.close` on this file-like object, it could result in the same
> data being flushed to the object multiple times, resulting in corruption.
>
> If you write a file-like object and implement your own caching, you can
> make it fork-safe by storing the pid whenever you append to the cache,
> and discarding the cache when the pid changes. For example:
>
> ```
> @property
> def cache(self):
>     pid = os.getpid()
>     if pid != self._pid:
>         self._pid = pid
>         self._cache = []
>     return self._cache
> ```
>
> For more information, see :issue:`5155`, :issue:`5313` and :issue:`5331`

### The *spawn* and *forkserver* start methods

There are a few extra restrictions which don't apply to the *fork*
start method.

More picklability

> Ensure that all arguments to :class:`~multiprocessing.Process` are
> picklable. Also, if you subclass Process.\_\_init\_\_, you must make sure
> that instances will be picklable when the
> :meth:`Process.start <multiprocessing.Process.start>` method is called.

Global variables

> Bear in mind that if code run in a child process tries to access a global
> variable, then the value it sees (if any) may not be the same as the value
> in the parent process at the time that :meth:`Process.start
> <multiprocessing.Process.start>` was called.
>
> However, global variables which are just module level constants cause no
> problems.

Safe importing of main module

> Make sure that the main module can be safely imported by a new Python
> interpreter without causing unintended side effects (such as starting a new
> process).
>
> For example, using the *spawn* or *forkserver* start method
> running the following module would fail with a
> :exc:`RuntimeError`:
>
> ```
> from multiprocessing import Process
>
> def foo():
>     print('hello')
>
> p = Process(target=foo)
> p.start()
> ```
>
> Instead one should protect the "entry point" of the program by using if \_\_name\_\_ == '\_\_main\_\_': as follows:
>
> ```
> from multiprocessing import Process, freeze_support, set_start_method
>
> def foo():
>     print('hello')
>
> if __name__ == '__main__':
>     freeze_support()
>     set_start_method('spawn')
>     p = Process(target=foo)
>     p.start()
> ```
>
> (The freeze\_support() line can be omitted if the program will be run
> normally instead of frozen.)
>
> This allows the newly spawned Python interpreter to safely import the module
> and then run the module's foo() function.
>
> Similar restrictions apply if a pool or manager is created in the main
> module.

## Examples

Demonstration of how to create and use customized managers and proxies:

Using :class:`~multiprocessing.pool.Pool`:

An example showing how to use queues to feed tasks to a collection of worker
processes and collect the results:
