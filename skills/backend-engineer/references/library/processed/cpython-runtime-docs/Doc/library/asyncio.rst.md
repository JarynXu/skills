> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/asyncio.rst`  
> Upstream Git blob: `956b00f0873a0d1e1f5944939c60a78fc4345c52`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!asyncio` --- Asynchronous I/O

---


Hello World!

```
import asyncio

async def main():
    print('Hello ...')
    await asyncio.sleep(1)
    print('... World!')

asyncio.run(main())
```

asyncio is a library to write **concurrent** code using
the **async/await** syntax.

asyncio is used as a foundation for multiple Python asynchronous
frameworks that provide high-performance network and web-servers,
database connection libraries, distributed task queues, etc.

asyncio is often a perfect fit for IO-bound and high-level
**structured** network code.

asyncio provides a set of **high-level** APIs to:

- :ref:`run Python coroutines <coroutine>` concurrently and
  have full control over their execution;
- perform :ref:`network IO and IPC <asyncio-streams>`;
- control :ref:`subprocesses <asyncio-subprocess>`;
- distribute tasks via :ref:`queues <asyncio-queues>`;
- :ref:`synchronize <asyncio-sync>` concurrent code;

For **introspection**, asyncio provides APIs and tools for:

- inspecting the :ref:`async call graph <asyncio-graph>` of tasks and futures;
- inspecting tasks in another running Python process with
  :ref:`command-line tools <asyncio-introspection-tools>`;

Additionally, there are **low-level** APIs for
*library and framework developers* to:

- create and manage :ref:`event loops <asyncio-event-loop>`, which
  provide asynchronous APIs for :ref:`networking <loop\_create\_server>`,
  running :ref:`subprocesses <loop\_subprocess\_exec>`,
  handling :ref:`OS signals <loop\_add\_signal\_handler>`, etc;
- implement efficient protocols using
  :ref:`transports <asyncio-transports-protocols>`;
- :ref:`bridge <asyncio-futures>` callback-based libraries and code
  with async/await syntax.

asyncio REPL

You can experiment with an asyncio concurrent context in the :term:`REPL`:

```
$ python -m asyncio
asyncio REPL ...
Use "await" directly instead of "asyncio.run()".
Type "help", "copyright", "credits" or "license" for more information.
>>> import asyncio
>>> await asyncio.sleep(10, result='hello')
'hello'
```

This REPL provides limited compatibility with :envvar:`PYTHON\_BASIC\_REPL`.
It is recommended that the default REPL is used
for full functionality and the latest features.

Reference

Note

The source code for asyncio can be found in :source:`Lib/asyncio/`.
