> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/logging.rst`  
> Upstream Git blob: `a3d117c107024143fd0cdbe0c310fdcfc7603817`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!logging` --- Logging facility for Python

**Source code:** :source:`Lib/logging/\_\_init\_\_.py`

Important

This page contains the API reference information. For tutorial
information and discussion of more advanced topics, see

- :ref:`Basic Tutorial <logging-basic-tutorial>`
- :ref:`Advanced Tutorial <logging-advanced-tutorial>`
- :ref:`Logging Cookbook <logging-cookbook>`


---

This module defines functions and classes which implement a flexible event
logging system for applications and libraries.

The key benefit of having the logging API provided by a standard library module
is that all Python modules can participate in logging, so your application log
can include your own messages integrated with messages from third-party
modules.

Here's a simple example of idiomatic usage:

```
# myapp.py
import logging
import mylib
logger = logging.getLogger(__name__)

def main():
    logging.basicConfig(filename='myapp.log', level=logging.INFO)
    logger.info('Started')
    mylib.do_something()
    logger.info('Finished')

if __name__ == '__main__':
    main()
```

```
# mylib.py
import logging
logger = logging.getLogger(__name__)

def do_something():
    logger.info('Doing something')
```

If you run *myapp.py*, you should see this in *myapp.log*:

```
INFO:__main__:Started
INFO:mylib:Doing something
INFO:__main__:Finished
```

The key feature of this idiomatic usage is that the majority of code is simply
creating a module level logger with getLogger(\_\_name\_\_), and using that
logger to do any needed logging. This is concise, while allowing downstream
code fine-grained control if needed. Logged messages to the module-level logger
get forwarded to handlers of loggers in higher-level modules, all the way up to
the highest-level logger known as the root logger; this approach is known as
hierarchical logging.

For logging to be useful, it needs to be configured: setting the levels and
destinations for each logger, potentially changing how specific modules log,
often based on command-line arguments or application configuration. In most
cases, like the one above, only the root logger needs to be so configured, since
all the lower level loggers at module level eventually forward their messages to
its handlers. :func:`~logging.basicConfig` provides a quick way to configure
the root logger that handles many use cases.

The module provides a lot of functionality and flexibility. If you are
unfamiliar with logging, the best way to get to grips with it is to view the
tutorials (**see the links above and on the right**).

The basic classes defined by the module, together with their attributes and
methods, are listed in the sections below.

- Loggers expose the interface that application code directly uses.
- Handlers send the log records (created by loggers) to the appropriate
  destination.
- Filters provide a finer grained facility for determining which log records
  to output.
- Formatters specify the layout of log records in the final output.

## Logger Objects

Loggers have the following attributes and methods. Note that Loggers should
*NEVER* be instantiated directly, but always through the module-level function
logging.getLogger(name). Multiple calls to :func:`getLogger` with the same
name will always return a reference to the same Logger object.

The name is potentially a period-separated hierarchical value, like
foo.bar.baz (though it could also be just plain foo, for example).
Loggers that are further down in the hierarchical list are children of loggers
higher up in the list. For example, given a logger with a name of foo,
loggers with names of foo.bar, foo.bar.baz, and foo.bam are all
descendants of foo. In addition, all loggers are descendants of the root
logger. The logger name hierarchy is analogous to the Python package hierarchy,
and identical to it if you organise your loggers on a per-module basis using
the recommended construction logging.getLogger(\_\_name\_\_). That's because
in a module, \_\_name\_\_ is the module's name in the Python package namespace.

## Logging Levels

The numeric values of logging levels are given in the following table. These are
primarily of interest if you want to define your own levels, and need them to
have specific values relative to the predefined levels. If you define a level
with the same numeric value, it overwrites the predefined value; the predefined
name is lost.

| Level | Numeric value | What it means / When to use it |
| --- | --- | --- |
|  | 0 | When set on a logger, indicates that ancestor loggers are to be consulted to determine the effective level. If that still resolves to :const:`!NOTSET`, then all events are logged. When set on a handler, all events are handled. |
|  | 10 | Detailed information, typically only of interest to a developer trying to diagnose a problem. |
|  | 20 | Confirmation that things are working as expected. |
|  | 30 | An indication that something unexpected happened, or that a problem might occur in the near future (e.g. 'disk space low'). The software is still working as expected. |
|  | 40 | Due to a more serious problem, the software has not been able to perform some function. |
|  | 50 | A serious error, indicating that the program itself may be unable to continue running. |

## Handler Objects

Handlers have the following attributes and methods. Note that :class:`Handler`
is never instantiated directly; this class acts as a base for more useful
subclasses. However, the :meth:`!\_\_init\_\_` method in subclasses needs to call
:meth:`Handler.\_\_init\_\_`.

For a list of handlers included as standard, see :mod:`logging.handlers`.

## Formatter Objects

A base formatter class suitable for subclassing when you want to format a
number of records. You can pass a :class:`Formatter` instance which you want
to use to format each line (that corresponds to a single record). If not
specified, the default formatter (which just outputs the event message) is
used as the line formatter.

## Filter Objects

Filters can be used by Handlers and Loggers for more sophisticated
filtering than is provided by levels. The base filter class only allows events
which are below a certain point in the logger hierarchy. For example, a filter
initialized with 'A.B' will allow events logged by loggers 'A.B', 'A.B.C',
'A.B.C.D', 'A.B.D' etc. but not 'A.BB', 'B.A.B' etc. If initialized with the
empty string, all events are passed.

Returns an instance of the :class:`Filter` class. If *name* is specified, it
names a logger which, together with its children, will have its events allowed
through the filter. If *name* is the empty string, allows every event.

Note that filters attached to handlers are consulted before an event is
emitted by the handler, whereas filters attached to loggers are consulted
whenever an event is logged (using :meth:`debug`, :meth:`info`,
etc.), before sending an event to handlers. This means that events which have
been generated by descendant loggers will not be filtered by a logger's filter
setting, unless the filter has also been applied to those descendant loggers.

You don't actually need to subclass Filter: you can pass any instance
which has a filter method with the same semantics.

Although filters are used primarily to filter records based on more
sophisticated criteria than levels, they get to see every record which is
processed by the handler or logger they're attached to: this can be useful if
you want to do things like counting how many records were processed by a
particular logger or handler, or adding, changing or removing attributes in
the :class:`LogRecord` being processed. Obviously changing the LogRecord needs
to be done with some care, but it does allow the injection of contextual
information into logs (see :ref:`filters-contextual`).

## LogRecord Objects

:class:`LogRecord` instances are created automatically by the :class:`Logger`
every time something is logged, and can be created manually via
:func:`makeLogRecord` (for example, from a pickled event received over the
wire).

Contains all the information pertinent to the event being logged.

The primary information is passed in *msg* and *args*,
which are combined using msg % args to create
the :attr:`!message` attribute of the record.

param name:
:   The name of the logger used to log the event
    represented by this :class:`!LogRecord`.
    Note that the logger name in the :class:`!LogRecord`
    will always have this value,
    even though it may be emitted by a handler
    attached to a different (ancestor) logger.

type name:
:   str

param level:
:   The :ref:`numeric level <levels>` of the logging event
    (such as 10 for DEBUG, 20 for INFO, etc).
    Note that this is converted to *two* attributes of the LogRecord:
    :attr:`!levelno` for the numeric value
    and :attr:`!levelname` for the corresponding level name.

type level:
:   int

param pathname:
:   The full string path of the source file
    where the logging call was made.

type pathname:
:   str

param lineno:
:   The line number in the source file
    where the logging call was made.

type lineno:
:   int

param msg:
:   The event description message,
    which can be a %-format string with placeholders for variable data,
    or an arbitrary object (see :ref:`arbitrary-object-messages`).

type msg:
:   typing.Any

param args:
:   Variable data to merge into the *msg* argument
    to obtain the event description.

type args:
:   tuple | dict[str, typing.Any]

param exc\_info:
:   An exception tuple with the current exception information,
    as returned by :func:`sys.exc\_info`,
    or None if no exception information is available.

type exc\_info:
:   tuple[type[BaseException], BaseException, types.TracebackType] | None

param func:
:   The name of the function or method
    from which the logging call was invoked.

type func:
:   str | None

param sinfo:
:   A text string representing stack information
    from the base of the stack in the current thread,
    up to the logging call.

type sinfo:
:   str | None

This functionality can be used to inject your own values into a
:class:`LogRecord` at creation time. You can use the following pattern:

```
old_factory = logging.getLogRecordFactory()

def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.custom_attribute = 0xdecafbad
    return record

logging.setLogRecordFactory(record_factory)
```

With this pattern, multiple factories could be chained, and as long
as they don't overwrite each other's attributes or unintentionally
overwrite the standard attributes listed above, there should be no
surprises.

## LogRecord attributes

The LogRecord has a number of attributes, most of which are derived from the
parameters to the constructor. (Note that the names do not always correspond
exactly between the LogRecord constructor parameters and the LogRecord
attributes.) These attributes can be used to merge data from the record into
the format string. The following table lists (in alphabetical order) the
attribute names, their meanings and the corresponding placeholder in a %-style
format string.

If you are using {}-formatting (:func:`str.format`), you can use
{attrname} as the placeholder in the format string. If you are using
$-formatting (:class:`string.Template`), use the form ${attrname}. In
both cases, of course, replace attrname with the actual attribute name
you want to use.

In the case of {}-formatting, you can specify formatting flags by placing them
after the attribute name, separated from it with a colon. For example: a
placeholder of {msecs:03.0f} would format a millisecond value of 4 as
004. Refer to the :meth:`str.format` documentation for full details on
the options available to you.

| Attribute name | Format | Description |
| --- | --- | --- |
| args | You shouldn't need to format this yourself. | The tuple of arguments merged into msg to produce message, or a dict whose values are used for the merge (when there is only one argument, and it is a dictionary). |
| asctime | %(asctime)s | Human-readable time when the :class:`LogRecord` was created. By default this is of the form '2003-07-08 16:49:45,896' (the numbers after the comma are millisecond portion of the time). |
| created | %(created)f | Time when the :class:`LogRecord` was created (as returned by :func:`time.time\_ns` / 1e9). |
| exc\_info | You shouldn't need to format this yourself. | Exception tuple (à la sys.exc\_info) or, if no exception has occurred, None. |
| exc\_text | You shouldn't need to format this yourself. | Exception information formatted as a string. This is set when :meth:`Formatter.format` is invoked, or None if no exception has occurred. |
| filename | %(filename)s | Filename portion of pathname. |
| funcName | %(funcName)s | Name of function containing the logging call. |
| levelname | %(levelname)s | Text logging level for the message ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'). |
| levelno | %(levelno)s | Numeric logging level for the message (:const:`DEBUG`, :const:`INFO`, :const:`WARNING`, :const:`ERROR`, :const:`CRITICAL`). |
| lineno | %(lineno)d | Source line number where the logging call was issued (if available). |
| message | %(message)s | The logged message, computed as msg % args. This is set when :meth:`Formatter.format` is invoked. |
| module | %(module)s | Module (name portion of filename). |
| msecs | %(msecs)d | Millisecond portion of the time when the :class:`LogRecord` was created. |
| msg | You shouldn't need to format this yourself. | The format string passed in the original logging call. Merged with args to produce message, or an arbitrary object (see :ref:`arbitrary-object-messages`). |
| name | %(name)s | Name of the logger used to log the call. |
| pathname | %(pathname)s | Full pathname of the source file where the logging call was issued (if available). |
| process | %(process)d | Process ID (if available). |
| processName | %(processName)s | Process name (if available). |
| relativeCreated | %(relativeCreated)d | Time in milliseconds when the LogRecord was created, relative to the time the logging module was loaded. |
| stack\_info | You shouldn't need to format this yourself. | Stack frame information (where available) from the bottom of the stack in the current thread, up to and including the stack frame of the logging call which resulted in the creation of this record. |
| thread | %(thread)d | Thread ID (if available). |
| threadName | %(threadName)s | Thread name (if available). |
| taskName | %(taskName)s | :class:`asyncio.Task` name (if available). |

## LoggerAdapter Objects

:class:`LoggerAdapter` instances are used to conveniently pass contextual
information into logging calls. For a usage example, see the section on
:ref:`adding contextual information to your logging output <context-info>`.

Returns an instance of :class:`LoggerAdapter` initialized with an
underlying :class:`Logger` instance, an optional dict-like object (*extra*),
and an optional boolean (*merge\_extra*) indicating whether or not
the *extra* argument of individual log calls should be merged with
the :class:`LoggerAdapter` extra.
The default behavior is to ignore the *extra* argument of individual log
calls and only use the one of the :class:`LoggerAdapter` instance

In addition to the above, :class:`LoggerAdapter` supports the following
methods of :class:`Logger`: :meth:`~Logger.debug`, :meth:`~Logger.info`,
:meth:`~Logger.warning`, :meth:`~Logger.error`, :meth:`~Logger.exception`,
:meth:`~Logger.critical`, :meth:`~Logger.log`, :meth:`~Logger.isEnabledFor`,
:meth:`~Logger.getEffectiveLevel`, :meth:`~Logger.setLevel` and
:meth:`~Logger.hasHandlers`. These methods have the same signatures as their
counterparts in :class:`Logger`, so you can use the two types of instances
interchangeably.

## Thread Safety

The logging module is intended to be thread-safe without any special work
needing to be done by its clients. It achieves this through using threading
locks; there is one lock to serialize access to the module's shared data, and
each handler also creates a lock to serialize access to its underlying I/O.

If you are implementing asynchronous signal handlers using the :mod:`signal`
module, you may not be able to use logging from within such handlers. This is
because lock implementations in the :mod:`threading` module are not always
re-entrant, and so cannot be invoked from such signal handlers.

## Module-Level Functions

In addition to the classes described above, there are a number of module-level
functions.

## Module-Level Attributes

## Integration with the warnings module

The :func:`captureWarnings` function can be used to integrate :mod:`!logging`
with the :mod:`warnings` module.
