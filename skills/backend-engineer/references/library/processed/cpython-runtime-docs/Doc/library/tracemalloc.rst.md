> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/tracemalloc.rst`  
> Upstream Git blob: `0fa70389f1f5771937dfc696025117c6b19fea2b`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!tracemalloc` --- Trace memory allocations

**Source code:** :source:`Lib/tracemalloc.py`

---

The tracemalloc module is a debug tool to trace memory blocks allocated by
Python. It provides the following information:

- Traceback where an object was allocated
- Statistics on allocated memory blocks per filename and per line number:
  total size, number and average size of allocated memory blocks
- Compute the differences between two snapshots to detect memory leaks

To trace most memory blocks allocated by Python, the module should be started
as early as possible by setting the :envvar:`PYTHONTRACEMALLOC` environment
variable to 1, or by using :option:`-X` tracemalloc command line
option. The :func:`tracemalloc.start` function can be called at runtime to
start tracing Python memory allocations.

By default, a trace of an allocated memory block only stores the most recent
frame (1 frame). To store 25 frames at startup: set the
:envvar:`PYTHONTRACEMALLOC` environment variable to 25, or use the
:option:`-X` tracemalloc=25 command line option.

## Examples

### Display the top 10

Display the 10 files allocating the most memory:

```
import tracemalloc

tracemalloc.start()

# ... run your application ...

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

print("[ Top 10 ]")
for stat in top_stats[:10]:
    print(stat)
```

Example of output of the Python test suite:

```
[ Top 10 ]
<frozen importlib._bootstrap>:716: size=4855 KiB, count=39328, average=126 B
<frozen importlib._bootstrap>:284: size=521 KiB, count=3199, average=167 B
/usr/lib/python3.4/collections/__init__.py:368: size=244 KiB, count=2315, average=108 B
/usr/lib/python3.4/unittest/case.py:381: size=185 KiB, count=779, average=243 B
/usr/lib/python3.4/unittest/case.py:402: size=154 KiB, count=378, average=416 B
/usr/lib/python3.4/abc.py:133: size=88.7 KiB, count=347, average=262 B
<frozen importlib._bootstrap>:1446: size=70.4 KiB, count=911, average=79 B
<frozen importlib._bootstrap>:1454: size=52.0 KiB, count=25, average=2131 B
<string>:5: size=49.7 KiB, count=148, average=344 B
/usr/lib/python3.4/sysconfig.py:411: size=48.0 KiB, count=1, average=48.0 KiB
```

We can see that Python loaded 4855 KiB data (bytecode and constants) from
modules and that the :mod:`collections` module allocated 244 KiB to build
:class:`~collections.namedtuple` types.

See :meth:`Snapshot.statistics` for more options.

### Compute differences

Take two snapshots and display the differences:

```
import tracemalloc
tracemalloc.start()
# ... start your application ...

snapshot1 = tracemalloc.take_snapshot()
# ... call the function leaking memory ...
snapshot2 = tracemalloc.take_snapshot()

top_stats = snapshot2.compare_to(snapshot1, 'lineno')

print("[ Top 10 differences ]")
for stat in top_stats[:10]:
    print(stat)
```

Example of output before/after running some tests of the Python test suite:

```
[ Top 10 differences ]
<frozen importlib._bootstrap>:716: size=8173 KiB (+4428 KiB), count=71332 (+39369), average=117 B
/usr/lib/python3.4/linecache.py:127: size=940 KiB (+940 KiB), count=8106 (+8106), average=119 B
/usr/lib/python3.4/unittest/case.py:571: size=298 KiB (+298 KiB), count=589 (+589), average=519 B
<frozen importlib._bootstrap>:284: size=1005 KiB (+166 KiB), count=7423 (+1526), average=139 B
/usr/lib/python3.4/mimetypes.py:217: size=112 KiB (+112 KiB), count=1334 (+1334), average=86 B
/usr/lib/python3.4/http/server.py:848: size=96.0 KiB (+96.0 KiB), count=1 (+1), average=96.0 KiB
/usr/lib/python3.4/inspect.py:1465: size=83.5 KiB (+83.5 KiB), count=109 (+109), average=784 B
/usr/lib/python3.4/unittest/mock.py:491: size=77.7 KiB (+77.7 KiB), count=143 (+143), average=557 B
/usr/lib/python3.4/urllib/parse.py:476: size=71.8 KiB (+71.8 KiB), count=969 (+969), average=76 B
/usr/lib/python3.4/contextlib.py:38: size=67.2 KiB (+67.2 KiB), count=126 (+126), average=546 B
```

We can see that Python has loaded 8173 KiB of module data (bytecode and
constants), and that this is 4428 KiB more than had been loaded before the
tests, when the previous snapshot was taken. Similarly, the :mod:`linecache`
module has cached 940 KiB of Python source code to format tracebacks, all
of it since the previous snapshot.

If the system has little free memory, snapshots can be written on disk using
the :meth:`Snapshot.dump` method to analyze the snapshot offline. Then use the
:meth:`Snapshot.load` method reload the snapshot.

### Get the traceback of a memory block

Code to display the traceback of the biggest memory block:

```
import tracemalloc

# Store 25 frames
tracemalloc.start(25)

# ... run your application ...

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('traceback')

# pick the biggest memory block
stat = top_stats[0]
print("%s memory blocks: %.1f KiB" % (stat.count, stat.size / 1024))
for line in stat.traceback.format():
    print(line)
```

Example of output of the Python test suite (traceback limited to 25 frames):

```
903 memory blocks: 870.1 KiB
  File "<frozen importlib._bootstrap>", line 716
  File "<frozen importlib._bootstrap>", line 1036
  File "<frozen importlib._bootstrap>", line 934
  File "<frozen importlib._bootstrap>", line 1068
  File "<frozen importlib._bootstrap>", line 619
  File "<frozen importlib._bootstrap>", line 1581
  File "<frozen importlib._bootstrap>", line 1614
  File "/usr/lib/python3.4/doctest.py", line 101
    import pdb
  File "<frozen importlib._bootstrap>", line 284
  File "<frozen importlib._bootstrap>", line 938
  File "<frozen importlib._bootstrap>", line 1068
  File "<frozen importlib._bootstrap>", line 619
  File "<frozen importlib._bootstrap>", line 1581
  File "<frozen importlib._bootstrap>", line 1614
  File "/usr/lib/python3.4/test/support/__init__.py", line 1728
    import doctest
  File "/usr/lib/python3.4/test/test_pickletools.py", line 21
    support.run_doctest(pickletools)
  File "/usr/lib/python3.4/test/regrtest.py", line 1276
    test_runner()
  File "/usr/lib/python3.4/test/regrtest.py", line 976
    display_failure=not verbose)
  File "/usr/lib/python3.4/test/regrtest.py", line 761
    match_tests=ns.match_tests)
  File "/usr/lib/python3.4/test/regrtest.py", line 1563
    main()
  File "/usr/lib/python3.4/test/__main__.py", line 3
    regrtest.main_in_temp_cwd()
  File "/usr/lib/python3.4/runpy.py", line 73
    exec(code, run_globals)
  File "/usr/lib/python3.4/runpy.py", line 160
    "__main__", fname, loader, pkg_name)
```

We can see that the most memory was allocated in the :mod:`importlib` module to
load data (bytecode and constants) from modules: 870.1 KiB. The traceback is
where the :mod:`importlib` loaded data most recently: on the import pdb
line of the :mod:`doctest` module. The traceback may change if a new module is
loaded.

### Pretty top

Code to display the 10 lines allocating the most memory with a pretty output,
ignoring <frozen importlib.\_bootstrap> and <unknown> files:

```
import linecache
import os
import tracemalloc

def display_top(snapshot, key_type='lineno', limit=10):
    snapshot = snapshot.filter_traces((
        tracemalloc.Filter(False, "<frozen importlib._bootstrap>"),
        tracemalloc.Filter(False, "<unknown>"),
    ))
    top_stats = snapshot.statistics(key_type)

    print("Top %s lines" % limit)
    for index, stat in enumerate(top_stats[:limit], 1):
        frame = stat.traceback[0]
        print("#%s: %s:%s: %.1f KiB"
              % (index, frame.filename, frame.lineno, stat.size / 1024))
        line = linecache.getline(frame.filename, frame.lineno).strip()
        if line:
            print('    %s' % line)

    other = top_stats[limit:]
    if other:
        size = sum(stat.size for stat in other)
        print("%s other: %.1f KiB" % (len(other), size / 1024))
    total = sum(stat.size for stat in top_stats)
    print("Total allocated size: %.1f KiB" % (total / 1024))

tracemalloc.start()

# ... run your application ...

snapshot = tracemalloc.take_snapshot()
display_top(snapshot)
```

Example of output of the Python test suite:

```
Top 10 lines
#1: Lib/base64.py:414: 419.8 KiB
    _b85chars2 = [(a + b) for a in _b85chars for b in _b85chars]
#2: Lib/base64.py:306: 419.8 KiB
    _a85chars2 = [(a + b) for a in _a85chars for b in _a85chars]
#3: collections/__init__.py:368: 293.6 KiB
    exec(class_definition, namespace)
#4: Lib/abc.py:133: 115.2 KiB
    cls = super().__new__(mcls, name, bases, namespace)
#5: unittest/case.py:574: 103.1 KiB
    testMethod()
#6: Lib/linecache.py:127: 95.4 KiB
    lines = fp.readlines()
#7: urllib/parse.py:476: 71.8 KiB
    for a in _hexdig for b in _hexdig}
#8: <string>:5: 62.0 KiB
#9: Lib/_weakrefset.py:37: 60.0 KiB
    self.data = set()
#10: Lib/base64.py:142: 59.8 KiB
    _b32tab2 = [a + b for a in _b32tab for b in _b32tab]
6220 other: 3602.8 KiB
Total allocated size: 5303.1 KiB
```

See :meth:`Snapshot.statistics` for more options.

#### Record the current and peak size of all traced memory blocks

The following code computes two sums like 0 + 1 + 2 + ... inefficiently, by
creating a list of those numbers. This list consumes a lot of memory
temporarily. We can use :func:`get\_traced\_memory` and :func:`reset\_peak` to
observe the small memory usage after the sum is computed as well as the peak
memory usage during the computations:

```
import tracemalloc

tracemalloc.start()

# Example code: compute a sum with a large temporary list
large_sum = sum(list(range(100000)))

first_size, first_peak = tracemalloc.get_traced_memory()

tracemalloc.reset_peak()

# Example code: compute a sum with a small temporary list
small_sum = sum(list(range(1000)))

second_size, second_peak = tracemalloc.get_traced_memory()

print(f"{first_size=}, {first_peak=}")
print(f"{second_size=}, {second_peak=}")
```

Output:

```
first_size=664, first_peak=3592984
second_size=804, second_peak=29704
```

Using :func:`reset\_peak` ensured we could accurately record the peak during the
computation of small\_sum, even though it is much smaller than the overall
peak size of memory blocks since the :func:`start` call. Without the call to
:func:`reset\_peak`, second\_peak would still be the peak from the
computation large\_sum (that is, equal to first\_peak). In this case,
both peaks are much higher than the final memory usage, and which suggests we
could optimise (by removing the unnecessary call to :class:`list`, and writing
sum(range(...))).

## API

### Functions

### DomainFilter

Filter traces of memory blocks by their address space (domain).

### Filter

Filter on traces of memory blocks.

See the :func:`fnmatch.fnmatch` function for the syntax of
*filename\_pattern*. The '.pyc' file extension is
replaced with '.py'.

Examples:

- Filter(True, subprocess.\_\_file\_\_) only includes traces of the
  :mod:`subprocess` module
- Filter(False, tracemalloc.\_\_file\_\_) excludes traces of the
  :mod:`!tracemalloc` module
- Filter(False, "<unknown>") excludes empty tracebacks

### Frame

Frame of a traceback.

The :class:`Traceback` class is a sequence of :class:`Frame` instances.

### Snapshot

Snapshot of traces of memory blocks allocated by Python.

The :func:`take\_snapshot` function creates a snapshot instance.

### Statistic

Statistic on memory allocations.

:func:`Snapshot.statistics` returns a list of :class:`Statistic` instances.

See also the :class:`StatisticDiff` class.

### StatisticDiff

Statistic difference on memory allocations between an old and a new
:class:`Snapshot` instance.

:func:`Snapshot.compare\_to` returns a list of :class:`StatisticDiff`
instances. See also the :class:`Statistic` class.

### Trace

Trace of a memory block.

The :attr:`Snapshot.traces` attribute is a sequence of :class:`Trace`
instances.

### Traceback

Sequence of :class:`Frame` instances sorted from the oldest frame to the
most recent frame.

A traceback contains at least 1 frame. If the tracemalloc module
failed to get a frame, the filename "<unknown>" at line number 0 is
used.

When a snapshot is taken, tracebacks of traces are limited to
:func:`get\_traceback\_limit` frames. See the :func:`take\_snapshot` function.
The original number of frames of the traceback is stored in the
:attr:`Traceback.total\_nframe` attribute. That allows one to know if a traceback
has been truncated by the traceback limit.

The :attr:`Trace.traceback` attribute is a :class:`Traceback` instance.
