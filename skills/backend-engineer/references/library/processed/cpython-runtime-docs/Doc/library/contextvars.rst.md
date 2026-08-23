> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/library/contextvars.rst`  
> Upstream Git blob: `b0cc0be8e911bf0066461d63678146ab81cefe96`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# :mod:`!contextvars` --- Context Variables

---

This module provides APIs to manage, store, and access context-local
state. The :class:`~contextvars.ContextVar` class is used to declare
and work with *Context Variables*. The :func:`~contextvars.copy\_context`
function and the :class:`~contextvars.Context` class should be used to
manage the current context in asynchronous frameworks.

Context managers that have state should use Context Variables
instead of :func:`threading.local` to prevent their state from
bleeding to other code unexpectedly, when used in concurrent code.

See also [PEP 567](https://peps.python.org/pep-0567) for additional details.

## Context Variables

*Token* objects are returned by the :meth:`ContextVar.set` method.
They can be passed to the :meth:`ContextVar.reset` method to revert
the value of the variable to what it was before the corresponding
*set*. A single token cannot reset a context variable more than once.

Tokens support the :ref:`context manager protocol <context-managers>`
to automatically reset context variables. See :meth:`ContextVar.set`.

Tokens are :ref:`generic <generics>` over the same type as the
:class:`ContextVar` which created them.

## Manual Context Management

A mapping of :class:`ContextVars <ContextVar>` to their values.

Context() creates an empty context with no values in it.
To get a copy of the current context use the
:func:`~contextvars.copy\_context` function.

Each thread has its own effective stack of :class:`!Context` objects. The
:term:`current context` is the :class:`!Context` object at the top of the
current thread's stack. All :class:`!Context` objects in the stacks are
considered to be *entered*.

*Entering* a context, which can be done by calling its :meth:`~Context.run`
method, makes the context the current context by pushing it onto the top of
the current thread's context stack.

*Exiting* from the current context, which can be done by returning from the
callback passed to the :meth:`~Context.run` method, restores the current
context to what it was before the context was entered by popping the context
off the top of the context stack.

Since each thread has its own context stack, :class:`ContextVar` objects
behave in a similar fashion to :func:`threading.local` when values are
assigned in different threads.

Attempting to enter an already entered context, including contexts entered in
other threads, raises a :exc:`RuntimeError`.

After exiting a context, it can later be re-entered (from any thread).

Any changes to :class:`ContextVar` values via the :meth:`ContextVar.set`
method are recorded in the current context. The :meth:`ContextVar.get`
method returns the value associated with the current context. Exiting a
context effectively reverts any changes made to context variables while the
context was entered (if needed, the values can be restored by re-entering the
context).

Context implements the :class:`collections.abc.Mapping` interface.

## asyncio support

Context variables are natively supported in :mod:`asyncio` and are
ready to be used without any extra configuration. For example, here
is a simple echo server, that uses a context variable to make the
address of a remote client available in the Task that handles that
client:

```
import asyncio
import contextvars

client_addr_var = contextvars.ContextVar('client_addr')

def render_goodbye():
    # The address of the currently handled client can be accessed
    # without passing it explicitly to this function.

    client_addr = client_addr_var.get()
    return f'Good bye, client @ {client_addr}\r\n'.encode()

async def handle_request(reader, writer):
    addr = writer.transport.get_extra_info('socket').getpeername()
    client_addr_var.set(addr)

    # In any code that we call, it is now possible to get the
    # client's address by calling 'client_addr_var.get()'.

    while True:
        line = await reader.readline()
        print(line)
        if not line.strip():
            break

    writer.write(b'HTTP/1.1 200 OK\r\n')  # status line
    writer.write(b'\r\n')  # headers
    writer.write(render_goodbye())  # body
    writer.close()

async def main():
    srv = await asyncio.start_server(
        handle_request, '127.0.0.1', 8081)

    async with srv:
        await srv.serve_forever()

asyncio.run(main())

# To test it you can use telnet or curl:
#     telnet 127.0.0.1 8081
#     curl 127.0.0.1:8081
```
