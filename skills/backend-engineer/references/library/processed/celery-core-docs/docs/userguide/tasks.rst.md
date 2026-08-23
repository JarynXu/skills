> **Offline teaching derivative**  
> Source: `celery/celery@8d2bccca0478cad48f31a75eaebc0ce389f65425`  
> Upstream path: `docs/userguide/tasks.rst`  
> Upstream Git blob: `a8bb69f1653b3a948d6be605fb04507804adaa00`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Tasks

Tasks are the building blocks of Celery applications.

A task is a class that can be created out of any callable. It performs
dual roles in that it defines both what happens when a task is
called (sends a message), and what happens when a worker receives that message.

Every task class has a unique name, and this name is referenced in messages
so the worker can find the right function to execute.

A task message is not removed from the queue
until that message has been :term:`acknowledged` by a worker. A worker can reserve
many messages in advance and even if the worker is killed -- by power failure
or some other reason -- the message will be redelivered to another worker.

Ideally task functions should be :term:`idempotent`: meaning
the function won't cause unintended effects even if called
multiple times with the same arguments.
Since the worker cannot detect if your tasks are idempotent, the default
behavior is to acknowledge the message in advance, just before it's executed,
so that a task invocation that already started is never executed again.

If your task is idempotent you can set the :attr:`~Task.acks\_late` option
to have the worker acknowledge the message *after* the task returns
instead. See also the FAQ entry :ref:`faq-acks\_late-vs-retry`.

Note that the worker will acknowledge the message if the child process executing
the task is terminated (either by the task calling :func:`sys.exit`, or by signal)
even when :attr:`~Task.acks\_late` is enabled. This behavior is intentional
as...

1. We don't want to rerun tasks that forces the kernel to send
   a :sig:`SIGSEGV` (segmentation fault) or similar signals to the process.
2. We assume that a system administrator deliberately killing the task
   does not want it to automatically restart.
3. A task that allocates too much memory is in danger of triggering the kernel
   OOM killer, the same may happen again.
4. A task that always fails when redelivered may cause a high-frequency
   message loop taking down the system.

If you really want a task to be redelivered in these scenarios you should
consider enabling the :setting:`task\_reject\_on\_worker\_lost` setting.

Warning

A task that blocks indefinitely may eventually stop the worker instance
from doing any other work.

If your task does I/O then make sure you add timeouts to these operations,
like adding a timeout to a web request using the :pypi:`requests` library:

```
connect_timeout, read_timeout = 5.0, 30.0
response = requests.get(URL, timeout=(connect_timeout, read_timeout))
```

:ref:`Time limits <worker-time-limits>` are convenient for making sure all
tasks return in a timely manner, but a time limit event will actually kill
the process by force so only use them to detect cases where you haven't
used manual timeouts yet.

In previous versions, the default prefork pool scheduler was not friendly
to long-running tasks, so if you had tasks that ran for minutes/hours, it
was advised to enable the :option:`-Ofair <celery worker -O>` command-line
argument to the :program:`celery worker`. However, as of version 4.0,
-Ofair is now the default scheduling strategy. See :ref:`optimizing-prefetch-limit`
for more information, and for the best performance route long-running and
short-running tasks to dedicated workers (:ref:`routing-automatic`).

If your worker hangs then please investigate what tasks are running
before submitting an issue, as most likely the hanging is caused
by one or more tasks hanging on a network operation.

--

In this chapter you'll learn all about defining tasks,
and this is the **table of contents**:

## [Basics](#toc-entry-1)

You can easily create a task from any callable by using
the :meth:`@task` decorator:

```
from .models import User

@app.task
def create_user(username, password):
    User.objects.create(username=username, password=password)
```

There are also many :ref:`options <task-options>` that can be set for the task,
these can be specified as arguments to the decorator:

```
@app.task(serializer='json')
def create_user(username, password):
    User.objects.create(username=username, password=password)
```

### How do I import the task decorator?

> The task decorator is available on your :class:`@Celery` application instance,
> if you don't know what this is then please read :ref:`first-steps`.
>
> If you're using Django (see :ref:`django-first-steps`), or you're the author
> of a library then you probably want to use the :func:`@shared\_task` decorator:
>
> ```
> from celery import shared_task
>
> @shared_task
> def add(x, y):
>     return x + y
> ```

### Multiple decorators

> When using multiple decorators in combination with the task
> decorator you must make sure that the task
> decorator is applied last (oddly, in Python this means it must
> be first in the list):
>
> ```
> @app.task
> @decorator2
> @decorator1
> def add(x, y):
>     return x + y
> ```

### Bound tasks

A task being bound means the first argument to the task will always
be the task instance (self), just like Python bound methods:

```
logger = get_task_logger(__name__)

@app.task(bind=True)
def add(self, x, y):
    logger.info(self.request.id)
```

Bound tasks are needed for retries (using :meth:`Task.retry() <@Task.retry>`),
for accessing information about the current task request, and for any
additional functionality you add to custom task base classes.

### Task inheritance

The base argument to the task decorator specifies the base class of the task:

```
import celery

class MyTask(celery.Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        print('{0!r} failed: {1!r}'.format(task_id, exc))

@app.task(base=MyTask)
def add(x, y):
    raise KeyError()
```

## [Names](#toc-entry-2)

Every task must have a unique name.

If no explicit name is provided the task decorator will generate one for you,
and this name will be based on 1) the module the task is defined in, and 2)
the name of the task function.

Example setting explicit name:

```
>>> @app.task(name='sum-of-two-numbers')
>>> def add(x, y):
...     return x + y

>>> add.name
'sum-of-two-numbers'
```

A best practice is to use the module name as a name-space,
this way names won't collide if there's already a task with that name
defined in another module.

```
>>> @app.task(name='tasks.add')
>>> def add(x, y):
...     return x + y
```

You can tell the name of the task by investigating its .name attribute:

```
>>> add.name
'tasks.add'
```

The name we specified here (tasks.add) is exactly the name that would've
been automatically generated for us if the task was defined in a module
named :file:`tasks.py`:

:file:`tasks.py`:

```
@app.task
def add(x, y):
    return x + y
```

```
>>> from tasks import add
>>> add.name
'tasks.add'
```

Note

You can use the inspect command in a worker to view the names of
all registered tasks. See the inspect registered command in the
:ref:`monitoring-control` section of the User Guide.

### Changing the automatic naming behavior

There are some cases when the default automatic naming isn't suitable.
Consider having many tasks within many different modules:

```
project/
       /__init__.py
       /celery.py
       /moduleA/
               /__init__.py
               /tasks.py
       /moduleB/
               /__init__.py
               /tasks.py
```

Using the default automatic naming, each task will have a generated name
like moduleA.tasks.taskA, moduleA.tasks.taskB, moduleB.tasks.test,
and so on. You may want to get rid of having tasks in all task names.
As pointed above, you can explicitly give names for all tasks, or you
can change the automatic naming behavior by overriding
:meth:`@gen\_task\_name`. Continuing with the example, celery.py
may contain:

```
from celery import Celery

class MyCelery(Celery):

    def gen_task_name(self, name, module):
        if module.endswith('.tasks'):
            module = module[:-6]
        return super().gen_task_name(name, module)

app = MyCelery('main')
```

So each task will have a name like moduleA.taskA, moduleA.taskB and
moduleB.test.

Warning

Make sure that your :meth:`@gen\_task\_name` is a pure function: meaning
that for the same input it must always return the same output.

## [Task Request](#toc-entry-3)

:attr:`Task.request <@Task.request>` contains information and state
related to the currently executing task.

The request defines the following attributes:

id:
:   The unique id of the executing task.

group:
:   The unique id of the task's :ref:`group <canvas-group>`, if this task is a member.

chord:
:   The unique id of the chord this task belongs to (if the task
    is part of the header).

correlation\_id:
:   Custom ID used for things like de-duplication.

args:
:   Positional arguments.

kwargs:
:   Keyword arguments.

origin:
:   Name of host that sent this task.

retries:
:   How many times the current task has been retried.
    An integer starting at 0.

is\_eager:
:   Set to :const:`True` if the task is executed locally in
    the client, not by a worker.

eta:
:   The original ETA of the task (if any).
    This is in UTC time (depending on the :setting:`enable\_utc`
    setting).

expires:
:   The original expiry time of the task (if any).
    This is in UTC time (depending on the :setting:`enable\_utc`
    setting).

hostname:
:   Node name of the worker instance executing the task.

delivery\_info:
:   Additional message delivery information. This is a mapping
    containing the exchange and routing key used to deliver this
    task. Used by for example :meth:`Task.retry() <@Task.retry>`
    to resend the task to the same destination queue.
    Availability of keys in this dict depends on the
    message broker used.

reply-to:
:   Name of queue to send replies back to (used with RPC result
    backend for example).

called\_directly:
:   This flag is set to true if the task wasn't
    executed by the worker.

timelimit:
:   A 2-item sequence (hard, soft) of the current time limits
    active for this task (if any).

time\_limit:
:   The hard time limit (in seconds) active for this task, or :const:`None`
    if no hard limit is set. This value is unpacked from :attr:`timelimit`
    and reflects limits configured via :setting:`task\_time\_limit`,
    task-level time\_limit, or the time\_limit argument passed to
    :meth:`~@Task.apply\_async`.

soft\_time\_limit:
:   The soft time limit (in seconds) active for this task, or :const:`None`
    if no soft limit is set. This value is unpacked from :attr:`timelimit`
    and reflects limits configured via :setting:`task\_soft\_time\_limit`,
    task-level soft\_time\_limit, or the soft\_time\_limit argument
    passed to :meth:`~@Task.apply\_async`.

callbacks:
:   A list of signatures to be called if this task returns successfully.

errbacks:
:   A list of signatures to be called if this task fails.

utc:
:   Set to true the caller has UTC enabled (:setting:`enable\_utc`).

headers:
:   Mapping of message headers sent with this task message
    (may be :const:`None`).

reply\_to:
:   Where to send reply to (queue name).

correlation\_id:
:   Usually the same as the task id, often used in amqp
    to keep track of what a reply is for.

root\_id:
:   The unique id of the first task in the workflow this task
    is part of (if any).

parent\_id:
:   The unique id of the task that called this task (if any).

chain:
:   Reversed list of tasks that form a chain (if any).
    The last item in this list will be the next task to succeed the
    current task. If using version one of the task protocol the chain
    tasks will be in request.callbacks instead.

properties:
:   Mapping of message properties received with this task message
    (may be :const:`None` or :const:`{}`)

replaced\_task\_nesting:
:   How many times the task was replaced, if at all.
    (may be :const:`0`)

### Example

An example task accessing information in the context is:

```
@app.task(bind=True)
def dump_context(self, x, y):
    print('Executing task id {0.id}, args: {0.args!r} kwargs: {0.kwargs!r}'.format(
            self.request))
```

The bind argument means that the function will be a "bound method" so
that you can access attributes and methods on the task type instance.

## [Logging](#toc-entry-4)

The worker will automatically set up logging for you, or you can
configure logging manually.

A special logger is available named "celery.task", you can inherit
from this logger to automatically get the task name and unique id as part
of the logs.

The best practice is to create a common logger
for all of your tasks at the top of your module:

```
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

@app.task
def add(x, y):
    logger.info('Adding {0} + {1}'.format(x, y))
    return x + y
```

Celery uses the standard Python logger library,
and the documentation can be found :mod:`here <logging>`.

You can also use :func:`print`, as anything written to standard
out/-err will be redirected to the logging system (you can disable this,
see :setting:`worker\_redirect\_stdouts`).

Note

The worker won't update the redirection if you create a logger instance
somewhere in your task or task module.

If you want to redirect sys.stdout and sys.stderr to a custom
logger you have to enable this manually, for example:

```
import sys

logger = get_task_logger(__name__)

@app.task(bind=True)
def add(self, x, y):
    old_outs = sys.stdout, sys.stderr
    rlevel = self.app.conf.worker_redirect_stdouts_level
    try:
        self.app.log.redirect_stdouts_to_logger(logger, rlevel)
        print('Adding {0} + {1}'.format(x, y))
        return x + y
    finally:
        sys.stdout, sys.stderr = old_outs
```


Note

If a specific Celery logger you need is not emitting logs, you should
check that the logger is propagating properly. In this example
"celery.app.trace" is enabled so that "succeeded in" logs are emitted:

```
import celery
import logging

@celery.signals.after_setup_logger.connect
def on_after_setup_logger(**kwargs):
    logger = logging.getLogger('celery')
    logger.propagate = True
    logger = logging.getLogger('celery.app.trace')
    logger.propagate = True
```


Note

If you want to completely disable Celery logging configuration,
use the :signal:`setup\_logging` signal:

```
import celery

@celery.signals.setup_logging.connect
def on_setup_logging(**kwargs):
    pass
```

### Argument checking

Celery will verify the arguments passed when you call the task, just
like Python does when calling a normal function:

```
>>> @app.task
... def add(x, y):
...     return x + y

# Calling the task with two arguments works:
>>> add.delay(8, 8)
<AsyncResult: f59d71ca-1549-43e0-be41-4e8821a83c0c>

# Calling the task with only one argument fails:
>>> add.delay(8)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "celery/app/task.py", line 376, in delay
    return self.apply_async(args, kwargs)
  File "celery/app/task.py", line 485, in apply_async
    check_arguments(*(args or ()), **(kwargs or {}))
TypeError: add() takes exactly 2 arguments (1 given)
```

You can disable the argument checking for any task by setting its
:attr:`~@Task.typing` attribute to :const:`False`:

```
>>> @app.task(typing=False)
... def add(x, y):
...     return x + y

# Works locally, but the worker receiving the task will raise an error.
>>> add.delay(8)
<AsyncResult: f59d71ca-1549-43e0-be41-4e8821a83c0c>
```

### Hiding sensitive information in arguments

When using :setting:`task\_protocol` 2 or higher (default since 4.0), you can
override how positional arguments and keyword arguments are represented in logs
and monitoring events using the argsrepr and kwargsrepr calling
arguments:

```
>>> add.apply_async((2, 3), argsrepr='(<secret-x>, <secret-y>)')

>>> charge.s(account, card='1234 5678 1234 5678').set(
...     kwargsrepr=repr({'card': '**** **** **** 5678'})
... ).delay()
```

Warning

Sensitive information will still be accessible to anyone able
to read your task message from the broker, or otherwise able intercept it.

For this reason you should probably encrypt your message if it contains
sensitive information, or in this example with a credit card number
the actual number could be stored encrypted in a secure store that you retrieve
and decrypt in the task itself.

## [Retrying](#toc-entry-5)

:meth:`Task.retry() <@Task.retry>` can be used to re-execute the task,
for example in the event of recoverable errors.

When you call retry it'll send a new message, using the same
task-id, and it'll take care to make sure the message is delivered
to the same queue as the originating task.

When a task is retried this is also recorded as a task state,
so that you can track the progress of the task using the result
instance (see :ref:`task-states`).

Here's an example using retry:

```
@app.task(bind=True)
def send_twitter_status(self, oauth, tweet):
    try:
        twitter = Twitter(oauth)
        twitter.update_status(tweet)
    except (Twitter.FailWhaleError, Twitter.LoginError) as exc:
        raise self.retry(exc=exc)
```

Note

The :meth:`Task.retry() <@Task.retry>` call will raise an exception so any
code after the retry won't be reached. This is the :exc:`~@Retry`
exception, it isn't handled as an error but rather as a semi-predicate
to signify to the worker that the task is to be retried,
so that it can store the correct state when a result backend is enabled.

This is normal operation and always happens unless the
throw argument to retry is set to :const:`False`.

The bind argument to the task decorator will give access to self (the
task type instance).

The exc argument is used to pass exception information that's
used in logs, and when storing task results.
Both the exception and the traceback will
be available in the task state (if a result backend is enabled).

If the task has a max\_retries value the current exception
will be re-raised if the max number of retries has been exceeded,
but this won't happen if:

- An exc argument wasn't given.

  > In this case the :exc:`~@MaxRetriesExceededError`
  > exception will be raised.
- There's no current exception

  > If there's no original exception to re-raise the exc
  > argument will be used instead, so:
  >
  > ```
  > self.retry(exc=Twitter.LoginError())
  > ```
  >
  > will raise the exc argument given.

### Using a custom retry delay

When a task is to be retried, it can wait for a given amount of time
before doing so, and the default delay is defined by the
:attr:`~@Task.default\_retry\_delay`
attribute. By default this is set to 3 minutes. Note that the
unit for setting the delay is in seconds (int or float).

You can also provide the countdown argument to :meth:`~@Task.retry` to
override this default.

```
@app.task(bind=True, default_retry_delay=30 * 60)  # retry in 30 minutes.
def add(self, x, y):
    try:
        something_raising()
    except Exception as exc:
        # overrides the default delay to retry after 1 minute
        raise self.retry(exc=exc, countdown=60)
```

### Automatic retry for known exceptions

Sometimes you just want to retry a task whenever a particular exception
is raised.

Fortunately, you can tell Celery to automatically retry a task using
autoretry\_for argument in the :meth:`@task` decorator:

```
from twitter.exceptions import FailWhaleError

@app.task(autoretry_for=(FailWhaleError,))
def refresh_timeline(user):
    return twitter.refresh_timeline(user)
```

If you want to specify custom arguments for an internal :meth:`~@Task.retry`
call, pass retry\_kwargs argument to :meth:`@task` decorator:

```
@app.task(autoretry_for=(FailWhaleError,),
          retry_kwargs={'max_retries': 5})
def refresh_timeline(user):
    return twitter.refresh_timeline(user)
```

This is provided as an alternative to manually handling the exceptions,
and the example above will do the same as wrapping the task body
in a :keyword:`try` ... :keyword:`except` statement:

```
@app.task
def refresh_timeline(user):
    try:
        twitter.refresh_timeline(user)
    except FailWhaleError as exc:
        raise refresh_timeline.retry(exc=exc, max_retries=5)
```

If you want to automatically retry on any error, simply use:

```
@app.task(autoretry_for=(Exception,))
def x():
    ...
```

If your tasks depend on another service, like making a request to an API,
then it's a good idea to use [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) to avoid overwhelming the
service with your requests. Fortunately, Celery's automatic retry support
makes it easy. Just specify the :attr:`~Task.retry\_backoff` argument, like this:

```
from requests.exceptions import RequestException

@app.task(autoretry_for=(RequestException,), retry_backoff=True)
def x():
    ...
```

By default, this exponential backoff will also introduce random [jitter](https://en.wikipedia.org/wiki/Jitter) to
avoid having all the tasks run at the same moment. It will also cap the
maximum backoff delay to 10 minutes. All these settings can be customized
via options documented below.

You can also set autoretry\_for, max\_retries, retry\_backoff, retry\_backoff\_max and retry\_jitter options in class-based tasks:

```
class BaseTaskWithRetry(Task):
    autoretry_for = (TypeError,)
    max_retries = 5
    retry_backoff = True
    retry_backoff_max = 700
    retry_jitter = False
```

## [Argument validation with Pydantic](#toc-entry-6)

You can use [Pydantic](https://docs.pydantic.dev/) to validate and convert arguments as well as serializing
results based on typehints by passing pydantic=True.

Note

Argument validation only covers arguments/return values on the task side. You still have
serialize arguments yourself when invoking a task with delay() or apply\_async().

For example:

```
from pydantic import BaseModel

class ArgModel(BaseModel):
    value: int

class ReturnModel(BaseModel):
    value: str

@app.task(pydantic=True)
def x(arg: ArgModel) -> ReturnModel:
    # args/kwargs type hinted as Pydantic model will be converted
    assert isinstance(arg, ArgModel)

    # The returned model will be converted to a dict automatically
    return ReturnModel(value=f"example: {arg.value}")
```

The task can then be called using a dict matching the model, and you'll receive
the returned model "dumped" (serialized using BaseModel.model\_dump()):

```
>>> result = x.delay({'value': 1})
>>> result.get(timeout=1)
{'value': 'example: 1'}
```

### Union types, arguments to generics

Union types (e.g. Union[SomeModel, OtherModel]) or arguments to generics (e.g.
list[SomeModel]) are **not** supported.

In case you want to support a list or similar types, it is recommended to use
pydantic.RootModel.

### Optional parameters/return values

Optional parameters or return values are also handled properly. For example, given this task:

```
from typing import Optional

# models are the same as above

@app.task(pydantic=True)
def x(arg: Optional[ArgModel] = None) -> Optional[ReturnModel]:
    if arg is None:
        return None
    return ReturnModel(value=f"example: {arg.value}")
```

You'll get the following behavior:

```
 >>> result = x.delay()
>>> result.get(timeout=1) is None
True
>>> result = x.delay({'value': 1})
>>> result.get(timeout=1)
{'value': 'example: 1'}
```

### Return value handling

Return values will only be serialized if the returned model matches the annotation. If you pass a
model instance of a different type, it will *not* be serialized. mypy should already catch such
errors and you should fix your typehints then.

### Pydantic parameters

There are a few more options influencing Pydantic behavior:

## [List of Options](#toc-entry-7)

The task decorator can take a number of options that change the way
the task behaves, for example you can set the rate limit for a task
using the :attr:`rate\_limit` option.

Any keyword argument passed to the task decorator will actually be set
as an attribute of the resulting task class, and this is a list
of the built-in attributes.

### General

Warning

A rate-limited task still counts against the worker's prefetch count
while it waits to run. Once all of a worker's prefetched slots are occupied
by rate-limited tasks, the worker stops fetching new messages from the broker
entirely, including messages for tasks that have no rate limit of their own.

For example, consider a worker that handles two tasks, A and B,
where A is rate limited and B is not. A burst of A messages
can fill the worker's prefetch slots, and B messages will sit on
the broker untouched until those rate-limited A tasks drain, even
though B has no rate limit of its own.

To avoid this, rate-limited tasks should be routed to their own
dedicated workers (see :ref:`guide-routing`).


Note

**Hard vs soft time limit failure semantics**

When a *soft* time limit fires, a :exc:`~celery.exceptions.SoftTimeLimitExceeded`
exception is raised inside the worker child process. If this exception
propagates and causes the task attempt to fail,
:meth:`~celery.app.task.Task.on\_failure`, errbacks, and the
:signal:`task\_failure` signal are all invoked as for any other task failure.
Task code may also catch :exc:`~celery.exceptions.SoftTimeLimitExceeded`
and exit normally, in which case these failure hooks are not triggered.

When a *hard* time limit fires the child process is killed and the
timeout is handled in the parent (main worker) process.
:meth:`~celery.app.task.Task.on\_failure`, errbacks, and the
:signal:`task\_failure` signal are also invoked from the parent process
so that cleanup hooks fire consistently for both limit types.

## [States](#toc-entry-8)

Celery can keep track of the tasks current state. The state also contains the
result of a successful task, or the exception and traceback information of a
failed task.

There are several *result backends* to choose from, and they all have
different strengths and weaknesses (see :ref:`task-result-backends`).

During its lifetime a task will transition through several possible states,
and each state may have arbitrary meta-data attached to it. When a task
moves into a new state the previous state is
forgotten about, but some transitions can be deduced, (e.g., a task now
in the :state:`FAILED` state, is implied to have been in the
:state:`STARTED` state at some point).

There are also sets of states, like the set of
:state:`FAILURE\_STATES`, and the set of :state:`READY\_STATES`.

The client uses the membership of these sets to decide whether
the exception should be re-raised (:state:`PROPAGATE\_STATES`), or whether
the state can be cached (it can if the task is ready).

You can also define :ref:`custom-states`.

### Result Backends

If you want to keep track of tasks or need the return values, then Celery
must store or send the states somewhere so that they can be retrieved later.
There are several built-in result backends to choose from: SQLAlchemy/Django ORM,
Memcached, RabbitMQ/QPid (rpc), and Redis -- or you can define your own.

No backend works well for every use case.
You should read about the strengths and weaknesses of each backend, and choose
the most appropriate for your needs.

Warning

Backends use resources to store and transmit results. To ensure
that resources are released, you must eventually call
:meth:`~@AsyncResult.get` or :meth:`~@AsyncResult.forget` on
EVERY :class:`~@AsyncResult` instance returned after calling
a task.

#### RPC Result Backend (RabbitMQ/QPid)

The RPC result backend (rpc://) is special as it doesn't actually *store*
the states, but rather sends them as messages. This is an important difference as it
means that a result *can only be retrieved once*, and *only by the client
that initiated the task*. Two different processes can't wait for the same result.

Even with that limitation, it is an excellent choice if you need to receive
state changes in real-time. Using messaging means the client doesn't have to
poll for new states.

The messages are transient (non-persistent) by default, so the results will
disappear if the broker restarts. You can configure the result backend to send
persistent messages using the :setting:`result\_persistent` setting.

#### Database Result Backend

Keeping state in the database can be convenient for many, especially for
web applications with a database already in place, but it also comes with
limitations.

- Polling the database for new states is expensive, and so you should
  increase the polling intervals of operations, such as result.get().
- Some databases use a default transaction isolation level that
  isn't suitable for polling tables for changes.

  In MySQL the default transaction isolation level is REPEATABLE-READ:
  meaning the transaction won't see changes made by other transactions until
  the current transaction is committed.

  Changing that to the READ-COMMITTED isolation level is recommended.

### Built-in States

#### PENDING

Task is waiting for execution or unknown.
Any task id that's not known is implied to be in the pending state.

#### STARTED

Task has been started.
Not reported by default, to enable please see :attr:`@Task.track\_started`.

meta-data:
:   pid and hostname of the worker process executing
    the task.

#### SUCCESS

Task has been successfully executed.

meta-data:
:   result contains the return value of the task.

propagates:
:   Yes

ready:
:   Yes

#### FAILURE

Task execution resulted in failure.

meta-data:
:   result contains the exception occurred, and traceback
    contains the backtrace of the stack at the point when the
    exception was raised.

propagates:
:   Yes

#### RETRY

Task is being retried.

meta-data:
:   result contains the exception that caused the retry,
    and traceback contains the backtrace of the stack at the point
    when the exceptions was raised.

propagates:
:   No

#### REVOKED

Task has been revoked.

propagates:
:   Yes

### Custom states

You can easily define your own states, all you need is a unique name.
The name of the state is usually an uppercase string. As an example
you could have a look at the :mod:`abortable tasks <~celery.contrib.abortable>`
which defines a custom :state:`ABORTED` state.

Use :meth:`~@Task.update\_state` to update a task's state:.

```
@app.task(bind=True)
def upload_files(self, filenames):
    for i, file in enumerate(filenames):
        if not self.request.called_directly:
            self.update_state(state='PROGRESS',
                meta={'current': i, 'total': len(filenames)})
```

Here I created the state "PROGRESS", telling any application
aware of this state that the task is currently in progress, and also where
it is in the process by having current and total counts as part of the
state meta-data. This can then be used to create progress bars for example.

### Creating pickleable exceptions

A rarely known Python fact is that exceptions must conform to some
simple rules to support being serialized by the pickle module.

Tasks that raise exceptions that aren't pickleable won't work
properly when Pickle is used as the serializer.

To make sure that your exceptions are pickleable the exception
*MUST* provide the original arguments it was instantiated
with in its .args attribute. The simplest way
to ensure this is to have the exception call Exception.\_\_init\_\_.

Let's look at some examples that work, and one that doesn't:

```
# OK:
class HttpError(Exception):
    pass

# BAD:
class HttpError(Exception):

    def __init__(self, status_code):
        self.status_code = status_code

# OK:
class HttpError(Exception):

    def __init__(self, status_code):
        self.status_code = status_code
        Exception.__init__(self, status_code)  # <-- REQUIRED
```

So the rule is:
For any exception that supports custom arguments \*args,
Exception.\_\_init\_\_(self, \*args) must be used.

There's no special support for *keyword arguments*, so if you
want to preserve keyword arguments when the exception is unpickled
you have to pass them as regular args:

```
class HttpError(Exception):

    def __init__(self, status_code, headers=None, body=None):
        self.status_code = status_code
        self.headers = headers
        self.body = body

        super(HttpError, self).__init__(status_code, headers, body)
```

## [Semipredicates](#toc-entry-9)

The worker wraps the task in a tracing function that records the final
state of the task. There are a number of exceptions that can be used to
signal this function to change how it treats the return of the task.

### Ignore

The task may raise :exc:`~@Ignore` to force the worker to ignore the
task. This means that no state will be recorded for the task, but the
message is still acknowledged (removed from queue).

This can be used if you want to implement custom revoke-like
functionality, or manually store the result of a task.

Example keeping revoked tasks in a Redis set:

```
from celery.exceptions import Ignore

@app.task(bind=True)
def some_task(self):
    if redis.ismember('tasks.revoked', self.request.id):
        raise Ignore()
```

Example that stores results manually:

```
from celery import states
from celery.exceptions import Ignore

@app.task(bind=True)
def get_tweets(self, user):
    timeline = twitter.get_timeline(user)
    if not self.request.called_directly:
        self.update_state(state=states.SUCCESS, meta=timeline)
    raise Ignore()
```

### Reject

The task may raise :exc:`~@Reject` to reject the task message using
AMQPs basic\_reject method. This won't have any effect unless
:attr:`Task.acks\_late` is enabled.

Rejecting a message has the same effect as acking it, but some
brokers may implement additional functionality that can be used.
For example RabbitMQ supports the concept of [Dead Letter Exchanges](http://www.rabbitmq.com/dlx.html)
where a queue can be configured to use a dead letter exchange that rejected
messages are redelivered to.

When a task raises :exc:`~@Reject` without re-queuing (requeue=False) it
will never run again, so its result is stored in the :state:`FAILURE` state
and the :signal:`task\_failure` signal is sent, just like any other failed
task. This means :meth:`AsyncResult.failed() <celery.result.AsyncResult.failed>`
returns :const:`True` and the rejection reason is available as the result.
This terminal result is recorded regardless of :attr:`Task.acks\_late`; the
broker-level basic\_reject (and therefore re-queuing) is the part that only
takes effect when acks\_late is enabled.

Reject can also be used to re-queue messages, but please be very careful
when using this as it can easily result in an infinite message loop.
Re-queuing (requeue=True) only takes effect when :attr:`Task.acks\_late`
is enabled; the message is then redelivered and executed again, so no terminal
result is stored for it.

Example using reject when a task causes an out of memory condition:

```
import errno
from celery.exceptions import Reject

@app.task(bind=True, acks_late=True)
def render_scene(self, path):
    file = get_file(path)
    try:
        renderer.render_scene(file)

    # if the file is too big to fit in memory
    # we reject it so that it's redelivered to the dead letter exchange
    # and we can manually inspect the situation.
    except MemoryError as exc:
        raise Reject(exc, requeue=False)
    except OSError as exc:
        if exc.errno == errno.ENOMEM:
            raise Reject(exc, requeue=False)

    # For any other error we retry after 10 seconds.
    except Exception as exc:
        raise self.retry(exc, countdown=10)
```

Example re-queuing the message:

```
from celery.exceptions import Reject

@app.task(bind=True, acks_late=True)
def requeues(self):
    if not self.request.delivery_info['redelivered']:
        raise Reject('no reason', requeue=True)
    print('received two times')
```

Consult your broker documentation for more details about the basic\_reject
method.

### Retry

The :exc:`~@Retry` exception is raised by the Task.retry method
to tell the worker that the task is being retried.

## [Custom task classes](#toc-entry-10)

All tasks inherit from the :class:`@Task` class.
The :meth:`~@Task.run` method becomes the task body.

As an example, the following code,

```
@app.task
def add(x, y):
    return x + y
```

will do roughly this behind the scenes:

```
class _AddTask(app.Task):

    def run(self, x, y):
        return x + y
add = app.tasks[_AddTask.name]
```

### Instantiation

A task is **not** instantiated for every request, but is registered
in the task registry as a global instance.

This means that the \_\_init\_\_ constructor will only be called
once per process, and that the task class is semantically closer to an
Actor.

If you have a task,

```
from celery import Task

class NaiveAuthenticateServer(Task):

    def __init__(self):
        self.users = {'george': 'password'}

    def run(self, username, password):
        try:
            return self.users[username] == password
        except KeyError:
            return False
```

And you route every request to the same process, then it
will keep state between requests.

This can also be useful to cache resources,
For example, a base Task class that caches a database connection:

```
from celery import Task

class DatabaseTask(Task):
    _db = None

    @property
    def db(self):
        if self._db is None:
            self._db = Database.connect()
        return self._db
```

#### Per task usage

The above can be added to each task like this:

```
from celery.app import task

@app.task(base=DatabaseTask, bind=True)
def process_rows(self: task):
    for row in self.db.table.all():
        process_row(row)
```

The db attribute of the process\_rows task will then
always stay the same in each process.

#### App-wide usage

You can also use your custom class in your whole Celery app by passing it as
the task\_cls argument when instantiating the app. This argument should be
either a string giving the python path to your Task class or the class itself:

```
from celery import Celery

app = Celery('tasks', task_cls='your.module.path:DatabaseTask')
```

This will make all your tasks declared using the decorator syntax within your
app to use your DatabaseTask class and will all have a db attribute.

The default value is the class provided by Celery: 'celery.app.task:Task'.

### Handlers

Task handlers are methods that execute at specific points in a task's lifecycle.
All handlers run **synchronously** within the same worker process and thread
that executes the task.

#### Execution timeline

The following diagram shows the exact order of execution:

```
Worker Process Timeline
┌───────────────────────────────────────────────────────────────┐
│  1. before_start()      ← Blocks until complete               │
│  2. run()               ← Your task function                  │
│  3. [Result Backend]    ← State + return value persisted      │
│  4. on_success() OR     ← Outcome-specific handler            │
│     on_retry() OR       │                                     │
│     on_failure()        │                                     │
│  5. after_return()      ← Runs last on terminal states        │
│                       (skipped for RETRY/REJECTED/IGNORED)    │
└───────────────────────────────────────────────────────────────┘
```

Important

**Key points:**

- All handlers run in the **same worker process** as your task
- before\_start **blocks** the task - run() won't start until it completes
- Result backend is updated **before** on\_success/on\_failure - other clients can see the task as finished while handlers are still running
- after\_return executes when the task reaches a terminal state.
  It does not run for RETRY, REJECTED, or IGNORED. If you need
  a hook that fires on every attempt, use the :signal:`task\_postrun` signal.

#### Available handlers

#### Example usage

```
import time
from celery import Task

class MyTask(Task):

    def before_start(self, task_id, args, kwargs):
        print(f"Task {task_id} starting with args {args}")
        # This blocks - run() won't start until this returns

    def on_success(self, retval, task_id, args, kwargs):
        print(f"Task {task_id} succeeded with result: {retval}")
        # Result is already visible to clients at this point

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        print(f"Task {task_id} failed: {exc}")
        # Task state is already FAILURE in backend

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        print(f"Task {task_id} finished with status: {status}")
        # Always runs last

@app.task(base=MyTask)
def my_task(x, y):
    return x + y
```

### Requests and custom requests

Upon receiving a message to run a task, the `worker <guide-workers>`:ref:
creates a `request <celery.worker.request.Request>`:class: to represent such
demand.

Custom task classes may override which request class to use by changing the
attribute `celery.app.task.Task.Request`:attr:. You may either assign the
custom request class itself, or its fully qualified name.

The request has several responsibilities. Custom request classes should cover
them all -- they are responsible to actually run and trace the task. We
strongly recommend to inherit from `celery.worker.request.Request`:class:.

When using the `pre-forking worker <worker-concurrency>`:ref:, the methods
`~celery.worker.request.Request.on\_timeout`:meth: and
`~celery.worker.request.Request.on\_failure`:meth: are executed in the main
worker process. An application may leverage this facility to add extra
observability or side-effects around task failures and timeouts beyond what
`celery.app.task.Task.on\_failure`:meth: provides.

As an example, the following custom request detects and logs hard time
limits, and other failures.

```
import logging
from celery import Task
from celery.worker.request import Request

logger = logging.getLogger('my.package')

class MyRequest(Request):
    'A minimal custom request to log failures and hard time limits.'

    def on_timeout(self, soft, timeout):
        super(MyRequest, self).on_timeout(soft, timeout)
        if not soft:
           logger.warning(
               'A hard timeout was enforced for task %s',
               self.task.name
           )

    def on_failure(self, exc_info, send_failed_event=True, return_ok=False):
        super().on_failure(
            exc_info,
            send_failed_event=send_failed_event,
            return_ok=return_ok
        )
        logger.warning(
            'Failure detected for task %s',
            self.task.name
        )

class MyTask(Task):
    Request = MyRequest  # you can use a FQN 'my.package:MyRequest'

@app.task(base=MyTask)
def some_longrunning_task():
    # use your imagination
```

## [How it works](#toc-entry-11)

Here come the technical details. This part isn't something you need to know,
but you may be interested.

All defined tasks are listed in a registry. The registry contains
a list of task names and their task classes. You can investigate this registry
yourself:

```
>>> from proj.celery import app
>>> app.tasks
{'celery.chord_unlock':
    <@task: celery.chord_unlock>,
 'celery.backend_cleanup':
    <@task: celery.backend_cleanup>,
 'celery.chord':
    <@task: celery.chord>}
```

This is the list of tasks built into Celery. Note that tasks
will only be registered when the module they're defined in is imported.

The default loader imports any modules listed in the
:setting:`imports` setting.

The :meth:`@task` decorator is responsible for registering your task
in the applications task registry.

When tasks are sent, no actual function code is sent with it, just the name
of the task to execute. When the worker then receives the message it can look
up the name in its task registry to find the execution code.

This means that your workers should always be updated with the same software
as the client. This is a drawback, but the alternative is a technical
challenge that's yet to be solved.

## [Tips and Best Practices](#toc-entry-12)

### Ignore results you don't want

If you don't care about the results of a task, be sure to set the
:attr:`~@Task.ignore\_result` option, as storing results
wastes time and resources.

```
@app.task(ignore_result=True)
def mytask():
    something()
```

Results can even be disabled globally using the :setting:`task\_ignore\_result`
setting.

Results can be enabled/disabled on a per-execution basis, by passing the ignore\_result boolean parameter,
when calling apply\_async.

```
@app.task
def mytask(x, y):
    return x + y

# No result will be stored
result = mytask.apply_async((1, 2), ignore_result=True)
print(result.get()) # -> None

# Result will be stored
result = mytask.apply_async((1, 2), ignore_result=False)
print(result.get()) # -> 3
```

By default tasks will *not ignore results* (ignore\_result=False) when a result backend is configured.

The option precedence order is the following:

1. Global :setting:`task\_ignore\_result`
2. :attr:`~@Task.ignore\_result` option
3. Task execution option ignore\_result

### More optimization tips

You find additional optimization tips in the
:ref:`Optimizing Guide <guide-optimizing>`.

### Avoid launching synchronous subtasks

Having a task wait for the result of another task is really inefficient,
and may even cause a deadlock if the worker pool is exhausted.

Make your design asynchronous instead, for example by using *callbacks*.

**Bad**:

```
@app.task
def update_page_info(url):
    page = fetch_page.delay(url).get()
    info = parse_page.delay(page).get()
    store_page_info.delay(url, info)

@app.task
def fetch_page(url):
    return myhttplib.get(url)

@app.task
def parse_page(page):
    return myparser.parse_document(page)

@app.task
def store_page_info(url, info):
    return PageInfo.objects.create(url, info)
```

**Good**:

```
def update_page_info(url):
    # fetch_page -> parse_page -> store_page
    chain = fetch_page.s(url) | parse_page.s() | store_page_info.s(url)
    chain()

@app.task()
def fetch_page(url):
    return myhttplib.get(url)

@app.task()
def parse_page(page):
    return myparser.parse_document(page)

@app.task(ignore_result=True)
def store_page_info(info, url):
    PageInfo.objects.create(url=url, info=info)
```

Here I instead created a chain of tasks by linking together
different :func:`~celery.signature`'s.
You can read about chains and other powerful constructs
at :ref:`designing-workflows`.

By default Celery will not allow you to run subtasks synchronously within a task,
but in rare or extreme cases you might need to do so.
**WARNING**:
enabling subtasks to run synchronously is not recommended!

```
@app.task
def update_page_info(url):
    page = fetch_page.delay(url).get(disable_sync_subtasks=False)
    info = parse_page.delay(page).get(disable_sync_subtasks=False)
    store_page_info.delay(url, info)

@app.task
def fetch_page(url):
    return myhttplib.get(url)

@app.task
def parse_page(page):
    return myparser.parse_document(page)

@app.task
def store_page_info(url, info):
    return PageInfo.objects.create(url, info)
```

## [Performance and Strategies](#toc-entry-13)

### Granularity

The task granularity is the amount of computation needed by each subtask.
In general it is better to split the problem up into many small tasks rather
than have a few long running tasks.

With smaller tasks you can process more tasks in parallel and the tasks
won't run long enough to block the worker from processing other waiting tasks.

However, executing a task does have overhead. A message needs to be sent, data
may not be local, etc. So if the tasks are too fine-grained the
overhead added probably removes any benefit.

[AOC1]

Breshears, Clay. Section 2.2.1, "The Art of Concurrency".
O'Reilly Media, Inc. May 15, 2009. ISBN-13 978-0-596-52153-0.

### Data locality

The worker processing the task should be as close to the data as
possible. The best would be to have a copy in memory, the worst would be a
full transfer from another continent.

If the data is far away, you could try to run another worker at location, or
if that's not possible - cache often used data, or preload data you know
is going to be used.

The easiest way to share data between workers is to use a distributed cache
system, like [memcached](http://memcached.org/).

### State

Since Celery is a distributed system, you can't know which process, or
on what machine the task will be executed. You can't even know if the task will
run in a timely manner.

The ancient async sayings tells us that “asserting the world is the
responsibility of the task”. What this means is that the world view may
have changed since the task was requested, so the task is responsible for
making sure the world is how it should be; If you have a task
that re-indexes a search engine, and the search engine should only be
re-indexed at maximum every 5 minutes, then it must be the tasks
responsibility to assert that, not the callers.

Another gotcha is Django model objects. They shouldn't be passed on as
arguments to tasks. It's almost always better to re-fetch the object from
the database when the task is running instead, as using old data may lead
to race conditions.

Imagine the following scenario where you have an article and a task
that automatically expands some abbreviations in it:

```
class Article(models.Model):
    title = models.CharField()
    body = models.TextField()

@app.task
def expand_abbreviations(article):
    article.body.replace('MyCorp', 'My Corporation')
    article.save()
```

First, an author creates an article and saves it, then the author
clicks on a button that initiates the abbreviation task:

```
>>> article = Article.objects.get(id=102)
>>> expand_abbreviations.delay(article)
```

Now, the queue is very busy, so the task won't be run for another 2 minutes.
In the meantime another author makes changes to the article, so
when the task is finally run, the body of the article is reverted to the old
version because the task had the old body in its argument.

Fixing the race condition is easy, just use the article id instead, and
re-fetch the article in the task body:

```
@app.task
def expand_abbreviations(article_id):
    article = Article.objects.get(id=article_id)
    article.body.replace('MyCorp', 'My Corporation')
    article.save()
```

```
>>> expand_abbreviations.delay(article_id)
```

There might even be performance benefits to this approach, as sending large
messages may be expensive.

### Database transactions

Let's have a look at another example:

```
from django.db import transaction
from django.http import HttpResponseRedirect

@transaction.atomic
def create_article(request):
    article = Article.objects.create()
    expand_abbreviations.delay(article.pk)
    return HttpResponseRedirect('/articles/')
```

This is a Django view creating an article object in the database,
then passing the primary key to a task. It uses the transaction.atomic
decorator, that will commit the transaction when the view returns, or
roll back if the view raises an exception.

There is a race condition because transactions are atomic. This means the article object is not persisted to the database until after the view function returns a response. If the asynchronous task starts executing before the transaction is committed, it may attempt to query the article object before it exists. To prevent this, we need to ensure that the transaction is committed before triggering the task.

The solution is to use
:meth:`~celery.contrib.django.task.DjangoTask.delay\_on\_commit` instead:

```
from django.db import transaction
from django.http import HttpResponseRedirect

@transaction.atomic
def create_article(request):
    article = Article.objects.create()
    expand_abbreviations.delay_on_commit(article.pk)
    return HttpResponseRedirect('/articles/')
```

This method was added in Celery 5.4. It's a shortcut that uses Django's
on\_commit callback to launch your Celery task once all transactions
have been committed successfully.

#### With Celery <5.4

If you're using an older version of Celery, you can replicate this behaviour
using the Django callback directly as follows:

```
import functools
from django.db import transaction
from django.http import HttpResponseRedirect

@transaction.atomic
def create_article(request):
    article = Article.objects.create()
    transaction.on_commit(
        functools.partial(expand_abbreviations.delay, article.pk)
    )
    return HttpResponseRedirect('/articles/')
```

Note

on\_commit is available in Django 1.9 and above, if you are using a
version prior to that then the [django-transaction-hooks](https://github.com/carljm/django-transaction-hooks) library
adds support for this.

## [Example](#toc-entry-14)

Let's take a real world example: a blog where comments posted need to be
filtered for spam. When the comment is created, the spam filter runs in the
background, so the user doesn't have to wait for it to finish.

I have a Django blog application allowing comments
on blog posts. I'll describe parts of the models/views and tasks for this
application.

### blog/models.py

The comment model looks like this:

```
from django.db import models
from django.utils.translation import ugettext_lazy as _


class Comment(models.Model):
    name = models.CharField(_('name'), max_length=64)
    email_address = models.EmailField(_('email address'))
    homepage = models.URLField(_('home page'),
                               blank=True, verify_exists=False)
    comment = models.TextField(_('comment'))
    pub_date = models.DateTimeField(_('Published date'),
                                    editable=False, auto_add_now=True)
    is_spam = models.BooleanField(_('spam?'),
                                  default=False, editable=False)

    class Meta:
        verbose_name = _('comment')
        verbose_name_plural = _('comments')
```

In the view where the comment is posted, I first write the comment
to the database, then I launch the spam filter task in the background.

### blog/views.py

```
from django import forms
from django.http import HttpResponseRedirect
from django.template.context import RequestContext
from django.shortcuts import get_object_or_404, render_to_response

from blog import tasks
from blog.models import Comment


class CommentForm(forms.ModelForm):

    class Meta:
        model = Comment


def add_comment(request, slug, template_name='comments/create.html'):
    post = get_object_or_404(Entry, slug=slug)
    remote_addr = request.META.get('REMOTE_ADDR')

    if request.method == 'post':
        form = CommentForm(request.POST, request.FILES)
        if form.is_valid():
            comment = form.save()
            # Check spam asynchronously.
            tasks.spam_filter.delay(comment_id=comment.id,
                                    remote_addr=remote_addr)
            return HttpResponseRedirect(post.get_absolute_url())
    else:
        form = CommentForm()

    context = RequestContext(request, {'form': form})
    return render_to_response(template_name, context_instance=context)
```

To filter spam in comments I use [Akismet](http://akismet.com/faq/), the service
used to filter spam in comments posted to the free blog platform
Wordpress. [Akismet](http://akismet.com/faq/) is free for personal use, but for commercial use you
need to pay. You have to sign up to their service to get an API key.

To make API calls to [Akismet](http://akismet.com/faq/) I use the [akismet.py](http://www.voidspace.org.uk/downloads/akismet.py) library written by
[Michael Foord](http://www.voidspace.org.uk/).

### blog/tasks.py

```
from celery import Celery

from akismet import Akismet

from django.core.exceptions import ImproperlyConfigured
from django.contrib.sites.models import Site

from blog.models import Comment


app = Celery(broker='amqp://')


@app.task
def spam_filter(comment_id, remote_addr=None):
    logger = spam_filter.get_logger()
    logger.info('Running spam filter for comment %s', comment_id)

    comment = Comment.objects.get(pk=comment_id)
    current_domain = Site.objects.get_current().domain
    akismet = Akismet(settings.AKISMET_KEY, 'http://{0}'.format(domain))
    if not akismet.verify_key():
        raise ImproperlyConfigured('Invalid AKISMET_KEY')


    is_spam = akismet.comment_check(user_ip=remote_addr,
                        comment_content=comment.comment,
                        comment_author=comment.name,
                        comment_author_email=comment.email_address)
    if is_spam:
        comment.is_spam = True
        comment.save()

    return is_spam
```
