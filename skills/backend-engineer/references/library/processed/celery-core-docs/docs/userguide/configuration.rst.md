> **Offline teaching derivative**  
> Source: `celery/celery@8d2bccca0478cad48f31a75eaebc0ce389f65425`  
> Upstream path: `docs/userguide/configuration.rst`  
> Upstream Git blob: `9f34706df42e6ddacbed649d5ff616d182ed893e`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Configuration and defaults

This document describes the configuration options available.

If you're using the default loader, you must create the :file:`celeryconfig.py`
module and make sure it's available on the Python path.

## [Example configuration file](#toc-entry-1)

This is an example configuration file to get you started.
It should contain all you need to run a basic Celery set-up.

```
## Broker settings.
broker_url = 'amqp://guest:guest@localhost:5672//'

# List of modules to import when the Celery worker starts.
imports = ('myapp.tasks',)

## Using the database to store task state and results.
result_backend = 'db+sqlite:///results.db'

task_annotations = {'tasks.add': {'rate_limit': '10/s'}}
```

## [New lowercase settings](#toc-entry-2)

Version 4.0 introduced new lower case settings and setting organization.

The major difference between previous versions, apart from the lower case
names, are the renaming of some prefixes, like celery\_beat\_ to beat\_,
celeryd\_ to worker\_, and most of the top level celery\_ settings
have been moved into a new task\_ prefix.

Warning

Celery will still be able to read old configuration files until Celery 6.0.
Afterwards, support for the old configuration files will be removed.
We provide the celery upgrade command that should handle
plenty of cases (including :ref:`Django settings with a namespace <conf-django-namespace>`).

Please migrate to the new configuration scheme as soon as possible.

### [Django settings with a namespace](#toc-entry-3)

The configuration names documented here use the new lowercase style, such as
broker\_url and task\_always\_eager.

If you're configuring Celery from Django settings with a namespace:

```
app.config_from_object('django.conf:settings', namespace='CELERY')
```

then those same settings must be written in uppercase and prefixed with
CELERY\_ in settings.py:

```
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_TASK_ALWAYS_EAGER = True
CELERY_WORKER_CONCURRENCY = 4
```

Using the CELERY\_ namespace is recommended in Django projects because it
keeps Celery settings separate from Django settings and settings used by other
apps.

If you're migrating an older Django project to the new setting names, the
celery upgrade command can update the names for you:

```
$ celery upgrade settings proj/settings.py --django
```

For a complete Django example, see :ref:`django-first-steps`.

## [Configuration Directives](#toc-entry-4)

### [General settings](#toc-entry-5)

#### accept\_content

Default: {'json'} (set, list, or tuple).

A white-list of content-types/serializers to allow.

If a message is received that's not in this list then
the message will be discarded with an error.

By default only json is enabled but any content type can be added,
including pickle and yaml; when this is the case make sure
untrusted parties don't have access to your broker.
See :ref:`guide-security` for more.

Example:

```
# using serializer name
accept_content = ['json']

# or the actual content-type (MIME)
accept_content = ['application/json']
```

#### result\_accept\_content

Default: None (can be set, list or tuple).

A white-list of content-types/serializers to allow for the result backend.

If a message is received that's not in this list then
the message will be discarded with an error.

By default it is the same serializer as accept\_content.
However, a different serializer for accepted content of the result backend
can be specified.
Usually this is needed if signed messaging is used and the result is stored
unsigned in the result backend.
See :ref:`guide-security` for more.

Example:

```
# using serializer name
result_accept_content = ['json']

# or the actual content-type (MIME)
result_accept_content = ['application/json']
```

### [Time and date settings](#toc-entry-6)

#### enable\_utc

Default: Enabled by default since version 3.0.

If enabled dates and times in messages will be converted to use
the UTC timezone.

Note that workers running Celery versions below 2.5 will assume a local
timezone for all messages, so only enable if all workers have been
upgraded.

#### timezone

Default: "UTC".

Configure Celery to use a custom time zone.
The timezone value can be any time zone supported by the [ZoneInfo](https://docs.python.org/3/library/zoneinfo.html)
library.

If not set the UTC timezone is used. For backwards compatibility
there's also a :setting:`enable\_utc` setting, and when this is set
to false the system local timezone is used instead.

### [Task settings](#toc-entry-7)

#### task\_annotations

Default: :const:`None`.

This setting can be used to rewrite any task attribute from the
configuration. The setting can be a dict, or a list of annotation
objects that filter for tasks and return a map of attributes
to change.

This will change the rate\_limit attribute for the tasks.add
task:

```
task_annotations = {'tasks.add': {'rate_limit': '10/s'}}
```

or change the same for all tasks:

```
task_annotations = {'*': {'rate_limit': '10/s'}}
```

You can change methods too, for example the on\_failure handler:

```
def my_on_failure(self, exc, task_id, args, kwargs, einfo):
    print('Oh no! Task failed: {0!r}'.format(exc))

task_annotations = {'*': {'on_failure': my_on_failure}}
```

If you need more flexibility then you can use objects
instead of a dict to choose the tasks to annotate:

```
class MyAnnotate:

    def annotate(self, task):
        if task.name.startswith('tasks.'):
            return {'rate_limit': '10/s'}

task_annotations = (MyAnnotate(), {other,})
```

#### task\_compression

Default: :const:`None`

Default compression used for task messages.
Can be gzip, bzip2 (if available), or any custom
compression schemes registered in the Kombu compression registry.

The default is to send uncompressed messages.

#### task\_protocol

Default: 2 (since 4.0).

Set the default task message protocol version used to send tasks.
Supports protocols: 1 and 2.

Protocol 2 is supported by 3.1.24 and 4.x+.

#### task\_serializer

Default: "json" (since 4.0, earlier: pickle).

A string identifying the default serialization method to use. Can be
json (default), pickle, yaml, msgpack, or any custom serialization
methods that have been registered with :mod:`kombu.serialization.registry`.

#### task\_publish\_retry

Default: Enabled.

Decides if publishing task messages will be retried in the case
of connection loss or other connection errors.
See also :setting:`task\_publish\_retry\_policy`.

#### task\_publish\_retry\_policy

Default: See :ref:`calling-retry`.

Defines the default policy when retrying publishing a task message in
the case of connection loss or other connection errors.

### [Task execution settings](#toc-entry-8)

#### task\_always\_eager

Default: Disabled.

If this is :const:`True`, all tasks will be executed locally by blocking until
the task returns. apply\_async() and Task.delay() will return
an :class:`~celery.result.EagerResult` instance, that emulates the API
and behavior of :class:`~celery.result.AsyncResult`, except the result
is already evaluated.

That is, tasks will be executed locally instead of being sent to
the queue.

#### task\_eager\_propagates

Default: Disabled.

If this is :const:`True`, eagerly executed tasks (applied by task.apply(),
or when the :setting:`task\_always\_eager` setting is enabled), will
propagate exceptions.

It's the same as always running apply() with throw=True.

#### task\_store\_eager\_result

Default: Disabled.

If this is :const:`True` and :setting:`task\_always\_eager` is :const:`True`
and :setting:`task\_ignore\_result` is :const:`False`,
the results of eagerly executed tasks will be saved to the backend.

By default, even with :setting:`task\_always\_eager` set to :const:`True`
and :setting:`task\_ignore\_result` set to :const:`False`,
the result will not be saved.

#### task\_remote\_tracebacks

Default: Disabled.

If enabled task results will include the workers stack when re-raising
task errors.

This requires the :pypi:`tblib` library, that can be installed using
:command:`pip`:

```
$ pip install celery[tblib]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

#### task\_ignore\_result

Default: Disabled.

Whether to store the task return values or not (tombstones).
If you still want to store errors, just not successful return values,
you can set :setting:`task\_store\_errors\_even\_if\_ignored`.

#### task\_store\_errors\_even\_if\_ignored

Default: Disabled.

If set, the worker stores all task errors in the result store even if
:attr:`Task.ignore\_result <celery.app.task.Task.ignore\_result>` is on.

#### task\_track\_started

Default: Disabled.

If :const:`True` the task will report its status as 'started' when the
task is executed by a worker. The default value is :const:`False` as
the normal behavior is to not report that level of granularity. Tasks
are either pending, finished, or waiting to be retried. Having a 'started'
state can be useful for when there are long running tasks and there's a
need to report what task is currently running.

#### task\_time\_limit

Default: No time limit.

Task hard time limit in seconds. The worker processing the task will
be killed and replaced with a new one when this is exceeded.

#### task\_allow\_error\_cb\_on\_chord\_header

Default: Disabled.

Enabling this flag will allow linking an error callback to a chord header,
which by default will not link when using `link_error()`, and preventing
from the chord's body to execute if any of the tasks in the header fails.

Consider the following canvas with the flag disabled (default behavior):

```
header = group([t1, t2])
body = t3
c = chord(header, body)
c.link_error(error_callback_sig)
```

If *any* of the header tasks failed (`t1` or `t2`), by default, the chord body (`t3`) would **not execute**, and `error_callback_sig` will be called **once** (for the body).

Enabling this flag will change the above behavior by:

1. `error_callback_sig` will be linked to `t1` and `t2` (as well as `t3`).
2. If *any* of the header tasks failed, `error_callback_sig` will be called **for each** failed header task **and** the `body` (even if the body didn't run).

Consider now the following canvas with the flag enabled:

```
header = group([failingT1, failingT2])
body = t3
c = chord(header, body)
c.link_error(error_callback_sig)
```

If *all* of the header tasks failed (`failingT1` and `failingT2`), then the chord body (`t3`) would **not execute**, and `error_callback_sig` will be called **3 times** (two times for the header and one time for the body).

Lastly, consider the following canvas with the flag enabled:

```
header = group([failingT1, failingT2])
body = t3
upgraded_chord = chain(header, body)
upgraded_chord.link_error(error_callback_sig)
```

This canvas will behave exactly the same as the previous one, since the `chain` will be upgraded to a `chord` internally.

#### task\_soft\_time\_limit

Default: No soft time limit.

Task soft time limit in seconds.

The :exc:`~@SoftTimeLimitExceeded` exception will be
raised when this is exceeded. For example, the task can catch this to
clean up before the hard time limit comes:

```
from celery.exceptions import SoftTimeLimitExceeded

@app.task
def mytask():
    try:
        return do_work()
    except SoftTimeLimitExceeded:
        cleanup_in_a_hurry()
```

#### task\_acks\_late

Default: Disabled.

Late ack means the task messages will be acknowledged **after** the task
has been executed, not *right before* (the default behavior).

#### task\_acks\_on\_failure\_or\_timeout

Default: Enabled

When enabled messages for all tasks will be acknowledged even if they
fail or time out.

Configuring this setting only applies to tasks that are
acknowledged **after** they have been executed and only if
:setting:`task\_acks\_late` is enabled.

#### task\_acks\_on\_failure

Default: :const:`None` (falls back to :setting:`task\_acks\_on\_failure\_or\_timeout`)

When enabled messages for tasks that fail will be acknowledged.
When disabled failed task messages will be rejected without requeue.

Configuring this setting only applies to tasks that are
acknowledged **after** they have been executed and only if
:setting:`task\_acks\_late` is enabled.

#### task\_acks\_on\_timeout

Default: :const:`None` (falls back to :setting:`task\_acks\_on\_failure\_or\_timeout`)

When enabled, messages for tasks that time out will be acknowledged.
When disabled, timed-out task messages will be rejected and requeued.

Configuring this setting only applies to tasks that are
acknowledged **after** they have been executed and only if
:setting:`task\_acks\_late` is enabled.

#### task\_reject\_on\_worker\_lost

Default: Disabled.

Even if :setting:`task\_acks\_late` is enabled, the worker will
acknowledge tasks when the worker process executing them abruptly
exits or is signaled (e.g., :sig:`KILL`/:sig:`INT`, etc).

Setting this to true allows the message to be re-queued instead,
so that the task will execute again by the same worker, or another
worker.

Warning

Enabling this can cause message loops; make sure you know
what you're doing.

#### task\_default\_rate\_limit

Default: No rate limit.

The global default rate limit for tasks.

This value is used for tasks that doesn't have a custom rate limit

### [Task result backend settings](#toc-entry-9)

#### result\_backend

Default: No result backend enabled by default.

The backend used to store task results (tombstones).
Can be one of the following:

- rpc
  :   Send results back as AMQP messages
      See :ref:`conf-rpc-result-backend`.
- database
  :   Use a relational database supported by [SQLAlchemy](http://sqlalchemy.org).
      See :ref:`conf-database-result-backend`.
- redis
  :   Use [Redis](https://redis.io) to store the results.
      See :ref:`conf-redis-result-backend`.
- cache
  :   Use [Memcached](http://memcached.org) to store the results.
      See :ref:`conf-cache-result-backend`.
- mongodb
  :   Use [MongoDB](http://mongodb.org) to store the results.
      See :ref:`conf-mongodb-result-backend`.
- cassandra
  :   Use [Cassandra](http://cassandra.apache.org/) to store the results.
      See :ref:`conf-cassandra-result-backend`.
- elasticsearch
  :   Use [Elasticsearch](https://aws.amazon.com/elasticsearch-service/) to store the results.
      See :ref:`conf-elasticsearch-result-backend`.
- ironcache
  :   Use [IronCache](http://www.iron.io/cache) to store the results.
      See :ref:`conf-ironcache-result-backend`.
- couchbase
  :   Use [Couchbase](https://www.couchbase.com/) to store the results.
      See :ref:`conf-couchbase-result-backend`.
- arangodb
  :   Use [ArangoDB](https://www.arangodb.com/) to store the results.
      See :ref:`conf-arangodb-result-backend`.
- couchdb
  :   Use [CouchDB](http://www.couchdb.com/) to store the results.
      See :ref:`conf-couchdb-result-backend`.
- cosmosdbsql (experimental)
  :   Use the [CosmosDB](https://azure.microsoft.com/en-us/services/cosmos-db/) PaaS to store the results.
      See :ref:`conf-cosmosdbsql-result-backend`.
- filesystem
  :   Use a shared directory to store the results.
      See :ref:`conf-filesystem-result-backend`.
- consul
  :   Use the [Consul](https://consul.io/) K/V store to store the results
      See :ref:`conf-consul-result-backend`.
- azureblockblob
  :   Use the [AzureBlockBlob](https://azure.microsoft.com/en-us/services/storage/blobs/) PaaS store to store the results
      See :ref:`conf-azureblockblob-result-backend`.
- s3
  :   Use the [S3](https://aws.amazon.com/s3/) to store the results
      See :ref:`conf-s3-result-backend`.
- gcs
  :   Use the [GCS](https://cloud.google.com/storage/) to store the results
      See :ref:`conf-gcs-result-backend`.

#### result\_backend\_always\_retry

Default: :const:`False`

If enabled, the backend will try to retry on the event of recoverable
exceptions instead of propagating the exception.
It will use an exponential backoff sleep time between retries.

#### result\_backend\_max\_sleep\_between\_retries\_ms

Default: 10000

This specifies the maximum sleep time between two backend operation retry.

#### result\_backend\_base\_sleep\_between\_retries\_ms

Default: 10

This specifies the base amount of sleep time between two backend operation retry.

#### result\_backend\_max\_retries

Default: Inf

This is the maximum number of retries in case of recoverable exceptions.

#### result\_backend\_thread\_safe

Default: False

If True, then the backend object is shared across threads.
This may be useful for using a shared connection pool instead of creating
a connection for every thread.

#### result\_backend\_transport\_options

Default: {} (empty mapping).

A dict of additional options passed to the underlying transport.

See your transport user manual for supported options (if any).

Example setting the visibility timeout (supported by Redis and SQS
transports):

```
result_backend_transport_options = {'visibility_timeout': 18000}  # 5 hours
```

#### result\_serializer

Default: json since 4.0 (earlier: pickle).

Result serialization format.

See :ref:`calling-serializers` for information about supported
serialization formats.

#### result\_compression

Default: No compression.

Optional compression method used for task results.
Supports the same options as the :setting:`task\_compression` setting.

#### result\_extended

Default: False

Enables extended task result attributes (name, args, kwargs, worker,
retries, queue) to be written to backend.

#### result\_expires

Default: Expire after 1 day.

Time (in seconds, or a :class:`~datetime.timedelta` object) for when after
stored task tombstones will be deleted.

A built-in periodic task will delete the results after this time
(celery.backend\_cleanup), assuming that celery beat is
enabled. The task runs daily at 4am.

A value of :const:`None` or 0 means results will never expire (depending
on backend specifications).

Note

For the moment this only works with the AMQP, database, cache, Couchbase,
filesystem and Redis backends.

When using the database or filesystem backend, celery beat must be
running for the results to be expired.

#### result\_cache\_max

Default: Disabled by default.

Enables client caching of results.

This can be useful for the old deprecated
'amqp' backend where the result is unavailable as soon as one result instance
consumes it.

This is the total number of results to cache before older results are evicted.
A value of 0 or None means no limit, and a value of :const:`-1`
will disable the cache.

Disabled by default.

#### result\_chord\_join\_timeout

Default: 3.0.

The timeout in seconds (int/float) when joining a group's results within a chord.

#### result\_chord\_retry\_interval

Default: 1.0.

Default interval for retrying chord tasks.

#### override\_backends

Default: Disabled by default.

Path to class that implements backend.

Allows to override backend implementation.
This can be useful if you need to store additional metadata about executed tasks,
override retry policies, etc.

Example:

```
override_backends = {"db": "custom_module.backend.class"}
```

### [Database backend settings](#toc-entry-10)

Note

**Retry configuration for the Database backend**

As of Celery 5.7, :class:`~celery.backends.database.DatabaseBackend`
uses the unified retry mechanism provided by
:class:`~celery.backends.base.BaseBackend` for all backend operations
(store\_result, get\_task\_meta, save\_group, delete\_group,
get\_group\_meta, and forget). The database backend preserves
backward-compatible defaults:

- :setting:`result\_backend\_always\_retry` defaults to :const:`True`
- :setting:`result\_backend\_max\_retries` defaults to 3

These defaults can be overridden via the standard configuration settings.
For example, to disable automatic retries:

```
result_backend_always_retry = False
```

Or to increase the retry limit:

```
result_backend_always_retry = True
result_backend_max_retries = 10
```

#### Database URL Examples

To use the database backend you have to configure the
:setting:`result\_backend` setting with a connection URL and the db+
prefix:

```
result_backend = 'db+scheme://user:password@host:port/dbname'
```

Examples:

```
# sqlite (filename)
result_backend = 'db+sqlite:///results.sqlite'

# mysql
result_backend = 'db+mysql://scott:tiger@localhost/foo'

# postgresql
result_backend = 'db+postgresql://scott:tiger@localhost/mydatabase'

# oracle
result_backend = 'db+oracle://scott:tiger@127.0.0.1:1521/sidname'
```

Please see [Supported Databases](http://www.sqlalchemy.org/docs/core/engines.html#supported-databases) for a table of supported databases,
and [Connection String](http://www.sqlalchemy.org/docs/core/engines.html#database-urls) for more information about connection
strings (this is the part of the URI that comes after the db+ prefix).

Note

If you are upgrading from Celery 5.6 or earlier, the date\_done column
in celery\_taskmeta and celery\_tasksetmeta tables does not have a
database index. The built-in periodic task celery.backend\_cleanup
queries on date\_done to delete expired task results, so adding an
index significantly improves cleanup performance on large tables.

Since SQLAlchemy's create\_all() will not alter existing tables, you
will need to update your database schema. If you are using Alembic for
schema migrations, you can generate an empty revision and apply the
following operations:

```
from alembic import op

def upgrade():
    op.create_index('ix_celery_taskmeta_date_done', 'celery_taskmeta', ['date_done'])
    op.create_index('ix_celery_tasksetmeta_date_done', 'celery_tasksetmeta', ['date_done'])

def downgrade():
    op.drop_index('ix_celery_tasksetmeta_date_done', table_name='celery_tasksetmeta')
    op.drop_index('ix_celery_taskmeta_date_done', table_name='celery_taskmeta')
```

Otherwise, you can add the indexes manually using SQL:

```
CREATE INDEX ix_celery_taskmeta_date_done ON celery_taskmeta (date_done);
CREATE INDEX ix_celery_tasksetmeta_date_done ON celery_tasksetmeta (date_done);
```

#### database\_create\_tables\_at\_setup

Default: True by default.

- If True, Celery will create the tables in the database during setup.
- If False, Celery will create the tables lazily, i.e. wait for the first task
  to be executed before creating the tables.

Note

Before celery 5.5, the tables were created lazily i.e. it was equivalent to
database\_create\_tables\_at\_setup set to False.

#### database\_engine\_options

Default: {'pool\_pre\_ping': True, 'pool\_recycle': 3600}

To specify additional SQLAlchemy database engine options you can use
the :setting:`database\_engine\_options` setting:

```
# echo enables verbose logging from SQLAlchemy.
app.conf.database_engine_options = {'echo': True}

# To disable the default pool health options:
app.conf.database_engine_options = {'pool_pre_ping': False, 'pool_recycle': None}
```

#### database\_short\_lived\_sessions

Default: Disabled by default.

Short lived sessions are disabled by default. If enabled they can drastically reduce
performance, especially on systems processing lots of tasks. This option is useful
on low-traffic workers that experience errors as a result of cached database connections
going stale through inactivity. For example, intermittent errors like
(OperationalError) (2006, 'MySQL server has gone away') can be fixed by enabling
short lived sessions. This option only affects the database backend.

#### database\_table\_schemas

Default: {} (empty mapping).

When SQLAlchemy is configured as the result backend, Celery automatically
creates two tables to store result meta-data for tasks. This setting allows
you to customize the schema of the tables:

```
# use custom schema for the database result backend.
database_table_schemas = {
    'task': 'celery',
    'group': 'celery',
}
```

#### database\_table\_names

Default: {} (empty mapping).

When SQLAlchemy is configured as the result backend, Celery automatically
creates two tables to store result meta-data for tasks. This setting allows
you to customize the table names:

```
# use custom table names for the database result backend.
database_table_names = {
    'task': 'myapp_taskmeta',
    'group': 'myapp_groupmeta',
}
```

#### database\_engine\_callback

Default: :const:`None`.

An optional callable (or dotted import path to one) that receives the
SQLAlchemy engine immediately after it's created. Use this to register
event listeners or apply any engine-level customization.

This is useful for deployments that need per-connection authentication,
such as injecting JWT tokens or using IAM-based auth via a do\_connect
listener.

Example configuration:

```
from sqlalchemy import event

def register_do_connect(engine):
    @event.listens_for(engine, 'do_connect')
    def on_connect(dialect, conn_rec, cargs, cparams):
        cparams['password'] = get_auth_token()

app.conf.database_engine_callback = register_do_connect
```

Can also be set as a dotted import path:

```
app.conf.database_engine_callback = 'myapp.db:register_do_connect'
```

### [RPC backend settings](#toc-entry-11)

#### result\_persistent

Default: Disabled by default (transient messages).

If set to :const:`True`, result messages will be persistent. This means the
messages won't be lost after a broker restart.

#### Example configuration

```
result_backend = 'rpc://'
result_persistent = False
```

**Please note**: using this backend could trigger the raise of celery.backends.rpc.BacklogLimitExceeded if the task tombstone is too *old*.

E.g.

```
for i in range(10000):
    r = debug_task.delay()

print(r.state)  # this would raise celery.backends.rpc.BacklogLimitExceeded
```

### [Cache backend settings](#toc-entry-12)

Note

The cache backend supports the :pypi:`pylibmc` and :pypi:`python-memcached`
libraries. The latter is used only if :pypi:`pylibmc` isn't installed.

Using a single Memcached server:

```
result_backend = 'cache+memcached://127.0.0.1:11211/'
```

Using multiple Memcached servers:

```
result_backend = """
    cache+memcached://172.19.26.240:11211;172.19.26.242:11211/
""".strip()
```

The "memory" backend stores the cache in memory only:

```
result_backend = 'cache'
cache_backend = 'memory'
```

#### cache\_backend\_options

Default: {} (empty mapping).

You can set :pypi:`pylibmc` options using the :setting:`cache\_backend\_options`
setting:

```
cache_backend_options = {
    'binary': True,
    'behaviors': {'tcp_nodelay': True},
}
```

#### cache\_backend

This setting is no longer used in celery's builtin backends as it's now possible to specify
the cache backend directly in the :setting:`result\_backend` setting.

Note

The :ref:`django-celery-results` library uses cache\_backend for choosing django caches.

### [MongoDB backend settings](#toc-entry-13)

Note

The MongoDB backend requires the :mod:`pymongo` library:
<http://github.com/mongodb/mongo-python-driver/tree/master>

#### mongodb\_backend\_settings

This is a dict supporting the following keys:

- database
  :   The database name to connect to. Defaults to celery.
- taskmeta\_collection
  :   The collection name to store task meta data.
      Defaults to celery\_taskmeta.
- max\_pool\_size
  :   Passed as max\_pool\_size to PyMongo's Connection or MongoClient
      constructor. It is the maximum number of TCP connections to keep
      open to MongoDB at a given time. If there are more open connections
      than max\_pool\_size, sockets will be closed when they are released.
      Defaults to 10.
- options

  > Additional keyword arguments to pass to the mongodb connection
  > constructor. See the :mod:`pymongo` docs to see a list of arguments
  > supported.

Note

With pymongo>=4.14, options are case-sensitive when they were previously
case-insensitive. See :class:`~pymongo.mongo\_client.MongoClient` to
determine the correct case.

#### Example configuration

```
result_backend = 'mongodb://localhost:27017/'
mongodb_backend_settings = {
    'database': 'mydb',
    'taskmeta_collection': 'my_taskmeta_collection',
}
```

### [Redis backend settings](#toc-entry-14)

#### Configuring the backend URL

Note

The Redis backend requires the :pypi:`redis` library.

To install this package use :command:`pip`:

```
$ pip install celery[redis]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

This backend requires the :setting:`result\_backend`
setting to be set to a Redis or [Redis over TLS](https://www.iana.org/assignments/uri-schemes/prov/rediss) URL:

```
result_backend = 'redis://username:password@host:port/db'
```

For example:

```
result_backend = 'redis://localhost/0'
```

is the same as:

```
result_backend = 'redis://'
```

Use the rediss:// protocol to connect to redis over TLS:

```
result_backend = 'rediss://username:password@host:port/db?ssl_cert_reqs=required'
```

Note that the ssl\_cert\_reqs string should be one of required,
optional, or none (though, for backwards compatibility with older Celery versions, the string
may also be one of CERT\_REQUIRED, CERT\_OPTIONAL, CERT\_NONE, but those values
only work for Celery, not for Redis directly).

If a Unix socket connection should be used, the URL needs to be in the format::

```
result_backend = 'socket:///path/to/redis.sock'
```

The fields of the URL are defined as follows:

1. username

   > Username used to connect to the database.
   >
   > Note that this is only supported in Redis>=6.0 and with py-redis>=3.4.0
   > installed.
   >
   > If you use an older database version or an older client version
   > you can omit the username:
   >
   > ```
   > result_backend = 'redis://:password@host:port/db'
   > ```
2. password

   > Password used to connect to the database.
3. host

   > Host name or IP address of the Redis server (e.g., localhost).
4. port

   > Port to the Redis server. Default is 6379.
5. db

   > Database number to use. Default is 0.
   > The db can include an optional leading slash.

When using a TLS connection (protocol is rediss://), you may pass in all values in :setting:`broker\_use\_ssl` as query parameters. Paths to certificates must be URL encoded, and ssl\_cert\_reqs is required. Example:

```
result_backend = 'rediss://:password@host:port/db?\
    ssl_cert_reqs=required\
    &ssl_ca_certs=%2Fvar%2Fssl%2Fmyca.pem\                  # /var/ssl/myca.pem
    &ssl_certfile=%2Fvar%2Fssl%2Fredis-server-cert.pem\     # /var/ssl/redis-server-cert.pem
    &ssl_keyfile=%2Fvar%2Fssl%2Fprivate%2Fworker-key.pem'   # /var/ssl/private/worker-key.pem
```

Note that the ssl\_cert\_reqs string should be one of required,
optional, or none (though, for backwards compatibility, the string
may also be one of CERT\_REQUIRED, CERT\_OPTIONAL, CERT\_NONE).

#### redis\_backend\_health\_check\_interval

Default: Not configured

The Redis backend supports health checks. This value must be
set as an integer whose value is the number of seconds between
health checks. If a ConnectionError or a TimeoutError is
encountered during the health check, the connection will be
re-established and the command retried exactly once.

#### redis\_backend\_use\_ssl

Default: Disabled.

The Redis backend supports SSL. This value must be set in
the form of a dictionary. The valid key-value pairs are
the same as the ones mentioned in the redis sub-section
under :setting:`broker\_use\_ssl`.

#### redis\_backend\_credential\_provider

Default: Disabled.

The Redis backend supports credential provider. This value must be set in
the form of a class path string or a class instance. e.g. mymodule.myfile.myclass
check more details in [RedisCredentialProvider](https://redis.readthedocs.io/en/stable/examples/connection_examples.html#Connecting-to-a-redis-instance-with-standard-credential-provider) doc.

#### redis\_max\_connections

Default: No limit.

Maximum number of connections available in the Redis connection
pool used for sending and retrieving results.

Warning

Redis will raise a ConnectionError if the number of concurrent
connections exceeds the maximum.

#### redis\_socket\_connect\_timeout

Default: :const:`None`

Socket timeout for connections to Redis from the result backend
in seconds (int/float)

#### redis\_socket\_timeout

Default: 120.0 seconds.

Socket timeout for reading/writing operations to the Redis server
in seconds (int/float), used by the redis result backend.

#### redis\_retry\_on\_timeout

Default: :const:`False`

To retry reading/writing operations on TimeoutError to the Redis server,
used by the redis result backend. Shouldn't set this variable if using Redis
connection by unix socket.

#### redis\_socket\_keepalive

Default: :const:`False`

Socket TCP keepalive to keep connections healthy to the Redis server,
used by the redis result backend.

#### redis\_client\_name

Default: :const:`None`

Sets the client name for Redis connections used by the result backend.
This can help identify connections in Redis monitoring tools.

### [Cassandra/AstraDB backend settings](#toc-entry-15)

Note

This Cassandra backend driver requires :pypi:`cassandra-driver`.

This backend can refer to either a regular Cassandra installation
or a managed Astra DB instance. Depending on which one, exactly one
between the :setting:`cassandra\_servers` and
:setting:`cassandra\_secure\_bundle\_path` settings must be provided
(but not both).

To install, use :command:`pip`:

```
$ pip install celery[cassandra]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

This backend requires the following configuration directives to be set.

#### cassandra\_servers

Default: [] (empty list).

List of host Cassandra servers. This must be provided when connecting to
a Cassandra cluster. Passing this setting is strictly exclusive
to :setting:`cassandra\_secure\_bundle\_path`. Example:

```
cassandra_servers = ['localhost']
```

#### cassandra\_secure\_bundle\_path

Default: None.

Absolute path to the secure-connect-bundle zip file to connect
to an Astra DB instance. Passing this setting is strictly exclusive
to :setting:`cassandra\_servers`.
Example:

```
cassandra_secure_bundle_path = '/home/user/bundles/secure-connect.zip'
```

When connecting to Astra DB, it is necessary to specify
the plain-text auth provider and the associated username and password,
which take the value of the Client ID and the Client Secret, respectively,
of a valid token generated for the Astra DB instance.
See below for an Astra DB configuration example.

#### cassandra\_port

Default: 9042.

Port to contact the Cassandra servers on.

#### cassandra\_keyspace

Default: None.

The keyspace in which to store the results. For example:

```
cassandra_keyspace = 'tasks_keyspace'
```

#### cassandra\_table

Default: None.

The table (column family) in which to store the results. For example:

```
cassandra_table = 'tasks'
```

#### cassandra\_read\_consistency

Default: None.

The read consistency used. Values can be ONE, TWO, THREE, QUORUM, ALL,
LOCAL\_QUORUM, EACH\_QUORUM, LOCAL\_ONE.

#### cassandra\_write\_consistency

Default: None.

The write consistency used. Values can be ONE, TWO, THREE, QUORUM, ALL,
LOCAL\_QUORUM, EACH\_QUORUM, LOCAL\_ONE.

#### cassandra\_entry\_ttl

Default: None.

Time-to-live for status entries. They will expire and be removed after that many seconds
after adding. A value of :const:`None` (default) means they will never expire.

#### cassandra\_auth\_provider

Default: :const:`None`.

AuthProvider class within cassandra.auth module to use. Values can be
PlainTextAuthProvider or SaslAuthProvider.

#### cassandra\_auth\_kwargs

Default: {} (empty mapping).

Named arguments to pass into the authentication provider. For example:

```
cassandra_auth_kwargs = {
    username: 'cassandra',
    password: 'cassandra'
}
```

#### cassandra\_options

Default: {} (empty mapping).

Named arguments to pass into the cassandra.cluster class.

```
cassandra_options = {
    'cql_version': '3.2.1'
    'protocol_version': 3
}
```

#### Example configuration (Cassandra)

```
result_backend = 'cassandra://'
cassandra_servers = ['localhost']
cassandra_keyspace = 'celery'
cassandra_table = 'tasks'
cassandra_read_consistency = 'QUORUM'
cassandra_write_consistency = 'QUORUM'
cassandra_entry_ttl = 86400
```

#### Example configuration (Astra DB)

```
result_backend = 'cassandra://'
cassandra_keyspace = 'celery'
cassandra_table = 'tasks'
cassandra_read_consistency = 'QUORUM'
cassandra_write_consistency = 'QUORUM'
cassandra_auth_provider = 'PlainTextAuthProvider'
cassandra_auth_kwargs = {
  'username': '<<CLIENT_ID_FROM_ASTRA_DB_TOKEN>>',
  'password': '<<CLIENT_SECRET_FROM_ASTRA_DB_TOKEN>>'
}
cassandra_secure_bundle_path = '/path/to/secure-connect-bundle.zip'
cassandra_entry_ttl = 86400
```

#### Additional configuration

The Cassandra driver, when establishing the connection, undergoes a stage
of negotiating the protocol version with the server(s). Similarly,
a load-balancing policy is automatically supplied (by default
DCAwareRoundRobinPolicy, which in turn has a local\_dc setting, also
determined by the driver upon connection).
When possible, one should explicitly provide these in the configuration:
moreover, future versions of the Cassandra driver will require at least the
load-balancing policy to be specified (using [execution profiles](https://docs.datastax.com/en/developer/python-driver/3.25/execution_profiles/),
as shown below).

A full configuration for the Cassandra backend would thus have the
following additional lines:

```
from cassandra.policies import DCAwareRoundRobinPolicy
from cassandra.cluster import ExecutionProfile
from cassandra.cluster import EXEC_PROFILE_DEFAULT
myEProfile = ExecutionProfile(
  load_balancing_policy=DCAwareRoundRobinPolicy(
    local_dc='datacenter1', # replace with your DC name
  )
)
cassandra_options = {
  'protocol_version': 5,    # for Cassandra 4, change if needed
  'execution_profiles': {EXEC_PROFILE_DEFAULT: myEProfile},
}
```

And similarly for Astra DB:

```
from cassandra.policies import DCAwareRoundRobinPolicy
from cassandra.cluster import ExecutionProfile
from cassandra.cluster import EXEC_PROFILE_DEFAULT
myEProfile = ExecutionProfile(
  load_balancing_policy=DCAwareRoundRobinPolicy(
    local_dc='europe-west1',  # for Astra DB, region name = dc name
  )
)
cassandra_options = {
  'protocol_version': 4,      # for Astra DB
  'execution_profiles': {EXEC_PROFILE_DEFAULT: myEProfile},
}
```

### [S3 backend settings](#toc-entry-16)

Note

This s3 backend driver requires :pypi:`s3`.

To install, use :command:`s3`:

```
$ pip install celery[s3]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

This backend requires the following configuration directives to be set.

#### s3\_access\_key\_id

Default: None.

The s3 access key id. For example:

```
s3_access_key_id = 'access_key_id'
```

#### s3\_secret\_access\_key

Default: None.

The s3 secret access key. For example:

```
s3_secret_access_key = 'access_secret_access_key'
```

#### s3\_bucket

Default: None.

The s3 bucket name. For example:

```
s3_bucket = 'bucket_name'
```

#### s3\_base\_path

Default: None.

A base path in the s3 bucket to use to store result keys. For example:

```
s3_base_path = '/prefix'
```

#### s3\_endpoint\_url

Default: None.

A custom s3 endpoint url. Use it to connect to a custom self-hosted s3 compatible backend (Ceph, Scality...). For example:

```
s3_endpoint_url = 'https://.s3.custom.url'
```

#### s3\_region

Default: None.

The s3 aws region. For example:

```
s3_region = 'us-east-1'
```

#### Example configuration

```
s3_access_key_id = 's3-access-key-id'
s3_secret_access_key = 's3-secret-access-key'
s3_bucket = 'mybucket'
s3_base_path = '/celery_result_backend'
s3_endpoint_url = 'https://endpoint_url'
```

### [Azure Block Blob backend settings](#toc-entry-17)

To use [AzureBlockBlob](https://azure.microsoft.com/en-us/services/storage/blobs/) as the result backend you simply need to
configure the :setting:`result\_backend` setting with the correct URL.

The required URL format is azureblockblob:// followed by the storage
connection string. You can find the storage connection string in the
Access Keys pane of your storage account resource in the Azure Portal.

#### Example configuration

```
result_backend = 'azureblockblob://DefaultEndpointsProtocol=https;AccountName=somename;AccountKey=Lou...bzg==;EndpointSuffix=core.windows.net'
```

#### azureblockblob\_container\_name

Default: celery.

The name for the storage container in which to store the results.

#### azureblockblob\_base\_path

Default: None.

A base path in the storage container to use to store result keys. For example:

```
azureblockblob_base_path = 'prefix/'
```

#### azureblockblob\_retry\_initial\_backoff\_sec

Default: 2.

The initial backoff interval, in seconds, for the first retry.
Subsequent retries are attempted with an exponential strategy.

#### azureblockblob\_retry\_increment\_base

Default: 2.

#### azureblockblob\_retry\_max\_attempts

Default: 3.

The maximum number of retry attempts.

#### azureblockblob\_connection\_timeout

Default: 20.

Timeout in seconds for establishing the azure block blob connection.

#### azureblockblob\_read\_timeout

Default: 120.

Timeout in seconds for reading of an azure block blob.

### [GCS backend settings](#toc-entry-18)

Note

This gcs backend driver requires :pypi:`google-cloud-storage` and :pypi:`google-cloud-firestore`.

To install, use :command:`gcs`:

```
$ pip install celery[gcs]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

GCS could be configured via the URL provided in :setting:`result\_backend`, for example:

```
result_backend = 'gs://mybucket/some-prefix?gcs_project=myproject&ttl=600'
result_backend = 'gs://mybucket/some-prefix?gcs_project=myproject?firestore_project=myproject2&ttl=600'
```

This backend requires the following configuration directives to be set:

#### gcs\_bucket

Default: None.

The gcs bucket name. For example:

```
gcs_bucket = 'bucket_name'
```

#### gcs\_project

Default: None.

The gcs project name. For example:

```
gcs_project = 'test-project'
```

#### gcs\_base\_path

Default: None.

A base path in the gcs bucket to use to store all result keys. For example:

```
gcs_base_path = '/prefix'
```

#### gcs\_ttl

Default: 0.

The time to live in seconds for the results blobs.
Requires a GCS bucket with "Delete" Object Lifecycle Management action enabled.
Use it to automatically delete results from Cloud Storage Buckets.

For example to auto remove results after 24 hours:

```
gcs_ttl = 86400
```

#### gcs\_threadpool\_maxsize

Default: 10.

Threadpool size for GCS operations. Same value defines the connection pool size.
Allows to control the number of concurrent operations. For example:

```
gcs_threadpool_maxsize = 20
```

#### firestore\_project

Default: gcs\_project.

The Firestore project for Chord reference counting. Allows native chord ref counts.
If not specified defaults to :setting:`gcs\_project`.
For example:

```
firestore_project = 'test-project2'
```

#### Example configuration

```
gcs_bucket = 'mybucket'
gcs_project = 'myproject'
gcs_base_path = '/celery_result_backend'
gcs_ttl = 86400
```

### [Elasticsearch backend settings](#toc-entry-19)

To use [Elasticsearch](https://aws.amazon.com/elasticsearch-service/) as the result backend you simply need to
configure the :setting:`result\_backend` setting with the correct URL.

#### Example configuration

```
result_backend = 'elasticsearch://example.com:9200/index_name/doc_type'
```

#### elasticsearch\_retry\_on\_timeout

Default: :const:`False`

Should timeout trigger a retry on different node?

#### elasticsearch\_max\_retries

Default: 3.

Maximum number of retries before an exception is propagated.

#### elasticsearch\_timeout

Default: 10.0 seconds.

Global timeout,used by the elasticsearch result backend.

#### elasticsearch\_save\_meta\_as\_text

Default: :const:`True`

Should meta saved as text or as native json.
Result is always serialized as text.

### [AWS DynamoDB backend settings](#toc-entry-20)

Note

The Dynamodb backend requires the :pypi:`boto3` library.

To install this package use :command:`pip`:

```
$ pip install celery[dynamodb]
```

See :ref:`bundles` for information on combining multiple extension
requirements.


Warning

The Dynamodb backend is not compatible with tables that have a sort key defined.

If you want to query the results table based on something other than the partition key,
please define a global secondary index (GSI) instead.

This backend requires the :setting:`result\_backend`
setting to be set to a DynamoDB URL:

```
result_backend = 'dynamodb://aws_access_key_id:aws_secret_access_key@region:port/table?read=n&write=m'
```

For example, specifying the AWS region and the table name:

```
result_backend = 'dynamodb://@us-east-1/celery_results'
```

or retrieving AWS configuration parameters from the environment, using the default table name (celery)
and specifying read and write provisioned throughput:

```
result_backend = 'dynamodb://@/?read=5&write=5'
```

or using the [downloadable version](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
of DynamoDB
[locally](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.Endpoint.html):

```
result_backend = 'dynamodb://@localhost:8000'
```

or using downloadable version or other service with conforming API deployed on any host:

```
result_backend = 'dynamodb://@us-east-1'
dynamodb_endpoint_url = 'http://192.168.0.40:8000'
```

The fields of the DynamoDB URL in result\_backend are defined as follows:

1. aws\_access\_key\_id & aws\_secret\_access\_key

   > The credentials for accessing AWS API resources. These can also be resolved
   > by the :pypi:`boto3` library from various sources, as
   > described [here](http://boto3.readthedocs.io/en/latest/guide/configuration.html#configuring-credentials).
2. region

   > The AWS region, e.g. us-east-1 or localhost for the [Downloadable Version](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).
   > See the :pypi:`boto3` library [documentation](http://boto3.readthedocs.io/en/latest/guide/configuration.html#environment-variable-configuration)
   > for definition options.
3. port

   The listening port of the local DynamoDB instance, if you are using the downloadable version.
   If you have not specified the region parameter as localhost,
   setting this parameter has **no effect**.
4. table

   > Table name to use. Default is celery.
   > See the [DynamoDB Naming Rules](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-naming-rules)
   > for information on the allowed characters and length.
5. read & write

   > The Read & Write Capacity Units for the created DynamoDB table. Default is 1 for both read and write.
   > More details can be found in the [Provisioned Throughput documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html).
6. ttl\_seconds

   > Time-to-live (in seconds) for results before they expire. The default is to
   > not expire results, while also leaving the DynamoDB table's Time to Live
   > settings untouched. If ttl\_seconds is set to a positive value, results
   > will expire after the specified number of seconds. Setting ttl\_seconds
   > to a negative value means to not expire results, and also to actively
   > disable the DynamoDB table's Time to Live setting. Note that trying to
   > change a table's Time to Live setting multiple times in quick succession
   > will cause a throttling error. More details can be found in the
   > [DynamoDB TTL documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)

### [IronCache backend settings](#toc-entry-21)

Note

The IronCache backend requires the :pypi:`iron\_celery` library:

To install this package use :command:`pip`:

```
$ pip install iron_celery
```

IronCache is configured via the URL provided in :setting:`result\_backend`, for example:

```
result_backend = 'ironcache://project_id:token@'
```

Or to change the cache name:

```
ironcache:://project_id:token@/awesomecache
```

For more information, see: <https://github.com/iron-io/iron_celery>

### [Couchbase backend settings](#toc-entry-22)

Note

The Couchbase backend requires the :pypi:`couchbase` library.

To install this package use :command:`pip`:

```
$ pip install celery[couchbase]
```

See :ref:`bundles` for instructions how to combine multiple extension
requirements.

This backend can be configured via the :setting:`result\_backend`
set to a Couchbase URL:

```
result_backend = 'couchbase://username:password@host:port/bucket'
```

#### couchbase\_backend\_settings

Default: {} (empty mapping).

This is a dict supporting the following keys:

- host

  > Host name of the Couchbase server. Defaults to localhost.
- port

  > The port the Couchbase server is listening to. Defaults to 8091.
- bucket

  > The default bucket the Couchbase server is writing to.
  > Defaults to default.
- username

  > User name to authenticate to the Couchbase server as (optional).
- password

  > Password to authenticate to the Couchbase server (optional).

### [ArangoDB backend settings](#toc-entry-23)

Note

The ArangoDB backend requires the :pypi:`pyArango` library.

To install this package use :command:`pip`:

```
$ pip install celery[arangodb]
```

See :ref:`bundles` for instructions how to combine multiple extension
requirements.

This backend can be configured via the :setting:`result\_backend`
set to a ArangoDB URL:

```
result_backend = 'arangodb://username:password@host:port/database/collection'
```

#### arangodb\_backend\_settings

Default: {} (empty mapping).

This is a dict supporting the following keys:

- host

  > Host name of the ArangoDB server. Defaults to localhost.
- port

  > The port the ArangoDB server is listening to. Defaults to 8529.
- database

  > The default database in the ArangoDB server is writing to.
  > Defaults to celery.
- collection

  > The default collection in the ArangoDB servers database is writing to.
  > Defaults to celery.
- username

  > User name to authenticate to the ArangoDB server as (optional).
- password

  > Password to authenticate to the ArangoDB server (optional).
- http\_protocol

  > HTTP Protocol in ArangoDB server connection.
  > Defaults to http.
- verify

  > HTTPS Verification check while creating the ArangoDB connection.
  > Defaults to False.

### [CosmosDB backend settings (experimental)](#toc-entry-24)

To use [CosmosDB](https://azure.microsoft.com/en-us/services/cosmos-db/) as the result backend, you simply need to configure the
:setting:`result\_backend` setting with the correct URL.

#### Example configuration

```
result_backend = 'cosmosdbsql://:{InsertAccountPrimaryKeyHere}@{InsertAccountNameHere}.documents.azure.com'
```

#### cosmosdbsql\_database\_name

Default: celerydb.

The name for the database in which to store the results.

#### cosmosdbsql\_collection\_name

Default: celerycol.

The name of the collection in which to store the results.

#### cosmosdbsql\_consistency\_level

Default: Session.

Represents the consistency levels supported for Azure Cosmos DB client operations.

Consistency levels by order of strength are: Strong, BoundedStaleness, Session, ConsistentPrefix and Eventual.

#### cosmosdbsql\_max\_retry\_attempts

Default: 9.

Maximum number of retries to be performed for a request.

#### cosmosdbsql\_max\_retry\_wait\_time

Default: 30.

Maximum wait time in seconds to wait for a request while the retries are happening.

### [CouchDB backend settings](#toc-entry-25)

Note

The CouchDB backend requires the :pypi:`pycouchdb` library:

To install this Couchbase package use :command:`pip`:

```
$ pip install celery[couchdb]
```

See :ref:`bundles` for information on combining multiple extension
requirements.

This backend can be configured via the :setting:`result\_backend`
set to a CouchDB URL:

```
result_backend = 'couchdb://username:password@host:port/container'
```

The URL is formed out of the following parts:

- username

  > User name to authenticate to the CouchDB server as (optional).
- password

  > Password to authenticate to the CouchDB server (optional).
- host

  > Host name of the CouchDB server. Defaults to localhost.
- port

  > The port the CouchDB server is listening to. Defaults to 8091.
- container

  > The default container the CouchDB server is writing to.
  > Defaults to default.

### [File-system backend settings](#toc-entry-26)

This backend can be configured using a file URL, for example:

```
CELERY_RESULT_BACKEND = 'file:///var/celery/results'
```

The configured directory needs to be shared and writable by all servers using
the backend.

If you're trying Celery on a single system you can simply use the backend
without any further configuration. For larger clusters you could use NFS,
[GlusterFS](http://www.gluster.org/), CIFS, [HDFS](http://hadoop.apache.org/) (using FUSE), or any other file-system.

### [Consul K/V store backend settings](#toc-entry-27)

Note

The Consul backend requires the :pypi:`python-consul2` library:

To install this package use :command:`pip`:

```
$ pip install python-consul2
```

The Consul backend can be configured using a URL, for example:

```
CELERY_RESULT_BACKEND = 'consul://localhost:8500/'
```

or:

```
result_backend = 'consul://localhost:8500/'
```

The backend will store results in the K/V store of Consul
as individual keys. The backend supports auto expire of results using TTLs in
Consul. The full syntax of the URL is:

```
consul://host:port[?one_client=1]
```

The URL is formed out of the following parts:

- host

  > Host name of the Consul server.
- port

  > The port the Consul server is listening to.
- one\_client

  > By default, for correctness, the backend uses a separate client connection
  > per operation. In cases of extreme load, the rate of creation of new
  > connections can cause HTTP 429 "too many connections" error responses from
  > the Consul server when under load. The recommended way to handle this is to
  > enable retries in python-consul2 using the patch at
  > <https://github.com/poppyred/python-consul2/pull/31>.
  >
  > Alternatively, if one\_client is set, a single client connection will be
  > used for all operations instead. This should eliminate the HTTP 429 errors,
  > but the storage of results in the backend can become unreliable.

### [Message Routing](#toc-entry-28)

#### task\_queues

Default: :const:`None` (queue taken from default queue settings).

Most users will not want to specify this setting and should rather use
the :ref:`automatic routing facilities <routing-automatic>`.

If you really want to configure advanced routing, this setting should
be a list of :class:`kombu.Queue` objects the worker will consume from.

Note that workers can be overridden this setting via the
:option:`-Q <celery worker -Q>` option, or individual queues from this
list (by name) can be excluded using the :option:`-X <celery worker -X>`
option.

Also see :ref:`routing-basics` for more information.

The default is a queue/exchange/binding key of celery, with
exchange type direct.

See also :setting:`task\_routes`

#### task\_routes

Default: :const:`None`.

A list of routers, or a single router used to route tasks to queues.
When deciding the final destination of a task the routers are consulted
in order.

A router can be specified as either:

- A function with the signature (name, args, kwargs, options, task=None, \*\*kwargs)
- A string providing the path to a router function.
- A dict containing router specification:
  :   Will be converted to a :class:`celery.routes.MapRoute` instance.
- A list of (pattern, route) tuples:
  :   Will be converted to a :class:`celery.routes.MapRoute` instance.

Examples:

```
task_routes = {
    'celery.ping': 'default',
    'mytasks.add': 'cpu-bound',
    'feed.tasks.*': 'feeds',                           # <-- glob pattern
    re.compile(r'(image|video)\.tasks\..*'): 'media',  # <-- regex
    'video.encode': {
        'queue': 'video',
        'exchange': 'media',
        'routing_key': 'media.video.encode',
    },
}

task_routes = ('myapp.tasks.route_task', {'celery.ping': 'default'})
```

Where myapp.tasks.route\_task could be:

```
def route_task(self, name, args, kwargs, options, task=None, **kw):
    if task == 'celery.ping':
        return {'queue': 'default'}
```

route\_task may return a string or a dict. A string then means
it's a queue name in :setting:`task\_queues`, a dict means it's a custom route.

When sending tasks, the routers are consulted in order. The first
router that doesn't return None is the route to use. The message options
is then merged with the found route settings, where the task's settings
have priority.

Example if :func:`~celery.execute.apply\_async` has these arguments:

```
Task.apply_async(immediate=False, exchange='video',
                 routing_key='video.compress')
```

and a router returns:

```
{'immediate': True, 'exchange': 'urgent'}
```

the final message options will be:

```
immediate=False, exchange='video', routing_key='video.compress'
```

(and any default message options defined in the
:class:`~celery.app.task.Task` class)

Values defined in :setting:`task\_routes` have precedence over values defined in
:setting:`task\_queues` when merging the two.

With the follow settings:

```
task_queues = {
    'cpubound': {
        'exchange': 'cpubound',
        'routing_key': 'cpubound',
    },
}

task_routes = {
    'tasks.add': {
        'queue': 'cpubound',
        'routing_key': 'tasks.add',
        'serializer': 'json',
    },
}
```

The final routing options for tasks.add will become:

```
{'exchange': 'cpubound',
 'routing_key': 'tasks.add',
 'serializer': 'json'}
```

See :ref:`routers` for more examples.

#### task\_queue\_max\_priority

brokers:
:   RabbitMQ

Default: :const:`None`.

See :ref:`routing-options-rabbitmq-priorities`.

#### task\_default\_priority

brokers:
:   RabbitMQ, Redis

Default: :const:`None`.

The interpretation of the priority value is broker-specific. With RabbitMQ,
higher numbers denote higher priority; with Redis, priority 0 is the
highest priority. See :ref:`routing-options-rabbitmq-priorities` and
:ref:`redis-message-priorities`.

#### task\_inherit\_parent\_priority

brokers:
:   RabbitMQ

Default: :const:`False`.

If enabled, child tasks will inherit priority of the parent task.

```
# The last task in chain will also have priority set to 5.
chain = celery.chain(add.s(2) | add.s(2).set(priority=5) | add.s(3))
```

Priority inheritance also works when calling child tasks from a parent task
with delay or apply\_async.

See :ref:`routing-options-rabbitmq-priorities`.

#### worker\_direct

Default: Disabled.

This option enables so that every worker has a dedicated queue,
so that tasks can be routed to specific workers.

The queue name for each worker is automatically generated based on
the worker hostname and a .dq suffix, using the C.dq2 exchange.

For example the queue name for the worker with node name w1@example.com
becomes:

```
w1@example.com.dq
```

Then you can route the task to the worker by specifying the hostname
as the routing key and the C.dq2 exchange:

```
task_routes = {
    'tasks.add': {'exchange': 'C.dq2', 'routing_key': 'w1@example.com'}
}
```

#### task\_create\_missing\_queues

Default: Enabled.

If enabled (default), any queues specified that aren't defined in
:setting:`task\_queues` will be automatically created. See
:ref:`routing-automatic`.

#### task\_create\_missing\_queue\_type

Default: "classic"

When Celery needs to declare a queue that doesn’t exist (i.e., when
task\_create\_missing\_queues is enabled), this setting defines what type
of RabbitMQ queue to create.

- "classic" (default): declares a standard classic queue.
- "quorum": declares a RabbitMQ quorum queue (adds x-queue-type: quorum).

#### task\_create\_missing\_queue\_exchange\_type

Default: None

If this option is None or the empty string (the default), Celery leaves the
exchange exactly as returned by your :attr:`app.amqp.Queues.autoexchange`
hook.

You can set this to a specific exchange type, such as "direct", "topic", or
"fanout", to create the missing queue with that exchange type.

Combine this setting with task\_create\_missing\_queue\_type = "quorum"
to create quorum queues bound to a topic exchange, for example:

```
app.conf.task_create_missing_queues=True
app.conf.task_create_missing_queue_type="quorum"
app.conf.task_create_missing_queue_exchange_type="topic"
```

Like the queue-type setting above, this option does not affect queues
that you define explicitly in :setting:`task\_queues`; it applies only to
queues created implicitly at runtime.

#### task\_default\_queue

Default: "celery".

The name of the default queue used by .apply\_async if the message has
no route or no custom queue has been specified.

This queue must be listed in :setting:`task\_queues`.
If :setting:`task\_queues` isn't specified then it's automatically
created containing one queue entry, where this name is used as the name of
that queue.

#### task\_default\_queue\_type

Default: "classic".

This setting is used to allow changing the default queue type for the
:setting:`task\_default\_queue` queue. The other viable option is "quorum" which
is only supported by RabbitMQ and sets the queue type to quorum using the x-queue-type
queue argument.

If the :setting:`worker\_detect\_quorum\_queues` setting is enabled, the worker will
automatically detect the queue type and disable the global QoS accordingly.

Warning

Quorum queues require confirm publish to be enabled.
Use :setting:`broker\_transport\_options` to enable confirm publish by setting:

```
broker_transport_options = {"confirm_publish": True}
```

For more information, see [RabbitMQ documentation](https://www.rabbitmq.com/docs/quorum-queues#use-cases).

#### task\_default\_exchange

Default: Uses the value set for :setting:`task\_default\_queue`.

Name of the default exchange to use when no custom exchange is
specified for a key in the :setting:`task\_queues` setting.

#### task\_default\_exchange\_type

Default: "direct".

Default exchange type used when no custom exchange type is specified
for a key in the :setting:`task\_queues` setting.

#### task\_default\_routing\_key

Default: Uses the value set for :setting:`task\_default\_queue`.

The default routing key used when no custom routing key
is specified for a key in the :setting:`task\_queues` setting.

#### task\_default\_delivery\_mode

Default: "persistent".

Can be transient (messages not written to disk) or persistent (written to
disk).

### [Broker Settings](#toc-entry-29)

#### broker\_url

Default: "amqp://"

Default broker URL. This must be a URL in the form of:

```
transport://userid:password@hostname:port/virtual_host
```

Only the scheme part (transport://) is required, the rest
is optional, and defaults to the specific transports default values.

The transport part is the broker implementation to use, and the
default is amqp, (uses librabbitmq if installed or falls back to
pyamqp). There are also other choices available, including;
redis://, sqs://, and qpid://.

The scheme can also be a fully qualified path to your own transport
implementation:

```
broker_url = 'proj.transports.MyTransport://localhost'
```

More than one broker URL, of the same transport, can also be specified.
The broker URLs can be passed in as a single string that's semicolon delimited:

```
broker_url = 'transport://userid:password@hostname:port//;transport://userid:password@hostname:port//'
```

Or as a list:

```
broker_url = [
    'transport://userid:password@localhost:port//',
    'transport://userid:password@hostname:port//'
]
```

The brokers will then be used in the :setting:`broker\_failover\_strategy`.

See :ref:`kombu:connection-urls` in the Kombu documentation for more
information.

#### broker\_read\_url / broker\_write\_url

Default: Taken from :setting:`broker\_url`.

These settings can be configured, instead of :setting:`broker\_url` to specify
different connection parameters for broker connections used for consuming and
producing.

Example:

```
broker_read_url = 'amqp://user:pass@broker.example.com:56721'
broker_write_url = 'amqp://user:pass@broker.example.com:56722'
```

Both options can also be specified as a list for failover alternates, see
:setting:`broker\_url` for more information.

#### broker\_failover\_strategy

Default: "round-robin".

Default failover strategy for the broker Connection object. If supplied,
may map to a key in 'kombu.connection.failover\_strategies', or be a reference
to any method that yields a single item from a supplied list.

Example:

```
# Random failover strategy
def random_failover_strategy(servers):
    it = list(servers)  # don't modify callers list
    shuffle = random.shuffle
    for _ in repeat(None):
        shuffle(it)
        yield it[0]

broker_failover_strategy = random_failover_strategy
```

#### broker\_heartbeat

transports supported:
:   pyamqp

Default: 120.0 (negotiated by server).

Note: This value is only used by the worker, clients do not use
a heartbeat at the moment.

It's not always possible to detect connection loss in a timely
manner using TCP/IP alone, so AMQP defines something called heartbeats
that's is used both by the client and the broker to detect if
a connection was closed.

If the heartbeat value is 10 seconds, then
the heartbeat will be monitored at the interval specified
by the :setting:`broker\_heartbeat\_checkrate` setting (by default
this is set to double the rate of the heartbeat value,
so for the 10 seconds, the heartbeat is checked every 5 seconds).

#### broker\_heartbeat\_checkrate

transports supported:
:   pyamqp

Default: 2.0.

At intervals the worker will monitor that the broker hasn't missed
too many heartbeats. The rate at which this is checked is calculated
by dividing the :setting:`broker\_heartbeat` value with this value,
so if the heartbeat is 10.0 and the rate is the default 2.0, the check
will be performed every 5 seconds (twice the heartbeat sending rate).

#### broker\_use\_ssl

transports supported:
:   pyamqp, redis

Default: Disabled.

Toggles SSL usage on broker connection and SSL settings.

The valid values for this option vary by transport.

##### pyamqp

If True the connection will use SSL with default SSL settings.
If set to a dict, will configure SSL connection according to the specified
policy. The format used is Python's :func:`ssl.wrap\_socket` options.

Note that SSL socket is generally served on a separate port by the broker.

Example providing a client cert and validating the server cert against a custom
certificate authority:

```
import ssl

broker_use_ssl = {
  'keyfile': '/var/ssl/private/worker-key.pem',
  'certfile': '/var/ssl/amqp-server-cert.pem',
  'ca_certs': '/var/ssl/myca.pem',
  'cert_reqs': ssl.CERT_REQUIRED
}
```

##### redis

The setting must be a dict with the following keys:

- ssl\_cert\_reqs (required): one of the SSLContext.verify\_mode values:
  :   - ssl.CERT\_NONE
      - ssl.CERT\_OPTIONAL
      - ssl.CERT\_REQUIRED
- ssl\_ca\_certs (optional): path to the CA certificate
- ssl\_certfile (optional): path to the client certificate
- ssl\_keyfile (optional): path to the client key

#### broker\_pool\_limit

Default: 10.

The maximum number of connections that can be open in the connection pool.

The pool is enabled by default since version 2.5, with a default limit of ten
connections. This number can be tweaked depending on the number of
threads/green-threads (eventlet/gevent) using a connection. For example
running eventlet with 1000 greenlets that use a connection to the broker,
contention can arise and you should consider increasing the limit.

If set to :const:`None` or 0 the connection pool will be disabled and
connections will be established and closed for every use.

#### broker\_pool\_acquire\_timeout

Default: :const:`None` (block indefinitely).

The maximum number of seconds Celery will wait when high-level sending APIs
such as :meth:`~celery.app.base.Celery.send\_task` or
:meth:`~celery.app.task.Task.apply\_async` acquire a connection or producer
from the broker pool. When all :setting:`broker\_pool\_limit` connections are in
use, such calls will block up to this many seconds before raising
:exc:`~celery.exceptions.OperationalError`.

Set this to a positive number (e.g. 120) to prevent these calls from
blocking indefinitely under high concurrency. When :const:`None`, the
previous behavior of blocking without a timeout is preserved.

#### broker\_connection\_timeout

Default: 4.0.

The default timeout in seconds before we give up establishing a connection
to the AMQP server. This setting is disabled when using
gevent.

Note

The broker connection timeout only applies to a worker attempting to
connect to the broker. It does not apply to producer sending a task, see
:setting:`broker\_transport\_options` for how to provide a timeout for that
situation.

#### broker\_connection\_retry

Default: Enabled.

Automatically try to re-establish the connection to the AMQP broker if lost
after the initial connection is made.

The time between retries is increased for each retry, and is
not exhausted before :setting:`broker\_connection\_max\_retries` is
exceeded.

Warning

The broker\_connection\_retry configuration setting will no longer determine
whether broker connection retries are made during startup in Celery 6.0 and above.
If you wish to refrain from retrying connections on startup,
you should set broker\_connection\_retry\_on\_startup to False instead.

#### broker\_connection\_retry\_on\_startup

Default: Enabled.

Automatically try to establish the connection to the AMQP broker on Celery startup if it is unavailable.

The time between retries is increased for each retry, and is
not exhausted before :setting:`broker\_connection\_max\_retries` is
exceeded.

#### broker\_connection\_max\_retries

Default: 100.

Maximum number of retries before we give up re-establishing a connection
to the AMQP broker.

If this is set to :const:`None`, we'll retry forever.

#### broker\_channel\_error\_retry

Default: Disabled.

Automatically try to re-establish the connection to the AMQP broker
if any invalid response has been returned.

The retry count and interval is the same as that of broker\_connection\_retry.
Also, this option doesn't work when broker\_connection\_retry is False.

#### broker\_login\_method

Default: "AMQPLAIN".

Set custom amqp login method.

#### broker\_native\_delayed\_delivery\_queue\_type

transports supported:
:   pyamqp

Default: "quorum".

This setting is used to allow changing the default queue type for the
native delayed delivery queues. The other viable option is "classic" which
is only supported by RabbitMQ and sets the queue type to classic using the x-queue-type
queue argument.

#### broker\_transport\_options

Default: {} (empty mapping).

A dict of additional options passed to the underlying transport.

See your transport user manual for supported options (if any).

Example setting the visibility timeout (supported by Redis and SQS
transports):

```
broker_transport_options = {'visibility_timeout': 18000}  # 5 hours
```

Example setting the producer connection maximum number of retries (so producers
won't retry forever if the broker isn't available at the first task execution):

```
broker_transport_options = {'max_retries': 5}
```

Example enabling publisher confirms (supported by the pyamqp transport).
Without this, messages can be silently dropped when the broker hits resource
limits:

```
broker_transport_options = {'confirm_publish': True}
```

### [Worker](#toc-entry-30)

#### imports

Default: [] (empty list).

A sequence of modules to import when the worker starts.

This is used to specify the task modules to import, but also
to import signal handlers and additional remote control commands, etc.

The modules will be imported in the original order.

#### include

Default: [] (empty list).

Exact same semantics as :setting:`imports`, but can be used as a means
to have different import categories.

The modules in this setting are imported after the modules in
:setting:`imports`.

#### worker\_deduplicate\_successful\_tasks

Default: False

Before each task execution, instruct the worker to check if this task is
a duplicate message.

Deduplication occurs only with tasks that have the same identifier,
enabled late acknowledgment, were redelivered by the message broker
and their state is SUCCESS in the result backend.

To avoid overflowing the result backend with queries, a local cache of
successfully executed tasks is checked before querying the result backend
in case the task was already successfully executed by the same worker that
received the task.

This cache can be made persistent by setting the :setting:`worker\_state\_db`
setting.

If the result backend is not [persistent](https://github.com/celery/celery/blob/main/celery/backends/base.py#L102)
(the RPC backend, for example), this setting is ignored.

#### worker\_concurrency

Default: Number of CPU cores.

The number of concurrent worker processes/threads/green threads executing
tasks.

If you're doing mostly I/O you can have more processes,
but if mostly CPU-bound, try to keep it close to the
number of CPUs on your machine. If not set, the number of CPUs/cores
on the host will be used.

#### worker\_prefetch\_multiplier

Default: 4.

How many messages to prefetch at a time multiplied by the number of
concurrent processes. The default is 4 (four messages for each
process). The default setting is usually a good choice, however -- if you
have very long running tasks waiting in the queue and you have to start the
workers, note that the first worker to start will receive four times the
number of messages initially. Thus the tasks may not be fairly distributed
to the workers.

To limit the broker to only deliver one message per process at a time,
set :setting:`worker\_prefetch\_multiplier` to 1. Changing that setting to 0
will allow the worker to keep consuming as many messages as it wants.

If you need to completely disable broker prefetching while still using
early acknowledgments, enable :setting:`worker\_disable\_prefetch`.
When this option is enabled the worker only fetches a task from the broker
when one of its processes is available.

Note

This feature is currently only supported when using Redis as the broker.

You can also enable this via the :option:`--disable-prefetch <celery worker --disable-prefetch>`
command line flag.

For more on prefetching, including how this setting interacts with late
acknowledgment when reserving one task at a time, read
:ref:`optimizing-prefetch-limit`.

#### worker\_eta\_task\_limit

Default: No limit (None).

The maximum number of ETA/countdown tasks that a worker can hold in memory at once.
When this limit is reached, the worker will not receive new tasks from the broker
until some of the existing ETA tasks are executed.

This setting helps prevent memory exhaustion when a queue contains a large number
of tasks with ETA/countdown values, as these tasks are held in memory until their
execution time. Without this limit, workers may fetch thousands of ETA tasks into
memory, potentially causing out-of-memory issues.

Note

Tasks with ETA/countdown are fetched into memory and scheduled on an internal
timer, so they are not constrained by the per-process prefetch window derived
from :setting:`worker\_prefetch\_multiplier` in the same way as immediately
executed tasks. This is why --prefetch-multiplier=1 can appear to have no
effect when many ETA/countdown tasks are present.

:setting:`worker\_eta\_task\_limit` configures the maximum number of ETA/countdown
tasks a worker will hold in memory and also sets an overall cap on
unacknowledged messages via kombu's QoS max\_prefetch. If the prefetch count
implied by :setting:`worker\_prefetch\_multiplier` would exceed this cap, the
worker will stop consuming new messages until previously received tasks have
been acknowledged.

#### worker\_disable\_prefetch

Default: False.

When enabled, a worker will only consume messages from the broker when it
has an available process to execute them. This disables prefetching while
still using early acknowledgments, ensuring that tasks are fairly
distributed between workers.

Note

This feature is currently only supported when using Redis as the broker.
Using this setting with other brokers will result in a warning and the
setting will be ignored.

#### worker\_enable\_prefetch\_count\_reduction

Default: Enabled.

The worker\_enable\_prefetch\_count\_reduction setting governs the restoration behavior of the
prefetch count to its maximum allowable value following a connection loss to the message
broker. By default, this setting is enabled.

Upon a connection loss, Celery will attempt to reconnect to the broker automatically,
provided the :setting:`broker\_connection\_retry\_on\_startup` or :setting:`broker\_connection\_retry`
is not set to False. During the period of lost connection, the message broker does not keep track
of the number of tasks already fetched. Therefore, to manage the task load effectively and prevent
overloading, Celery reduces the prefetch count based on the number of tasks that are
currently running.

The prefetch count is the number of messages that a worker will fetch from the broker at
a time. The reduced prefetch count helps ensure that tasks are not fetched excessively
during periods of reconnection.

With worker\_enable\_prefetch\_count\_reduction set to its default value (Enabled), the prefetch
count will be gradually restored to its maximum allowed value each time a task that was
running before the connection was lost is completed. This behavior helps maintain a
balanced distribution of tasks among the workers while managing the load effectively.

To disable the reduction and restoration of the prefetch count to its maximum allowed value on
reconnection, set worker\_enable\_prefetch\_count\_reduction to False. Disabling this setting might
be useful in scenarios where a fixed prefetch count is desired to control the rate of task
processing or manage the worker load, especially in environments with fluctuating connectivity.

The worker\_enable\_prefetch\_count\_reduction setting provides a way to control the
restoration behavior of the prefetch count following a connection loss, aiding in
maintaining a balanced task distribution and effective load management across the workers.

#### worker\_lost\_wait

Default: 10.0 seconds.

In some cases a worker may be killed without proper cleanup,
and the worker may have published a result before terminating.
This value specifies how long we wait for any missing results before
raising a :exc:`@WorkerLostError` exception.

#### worker\_max\_tasks\_per\_child

Maximum number of tasks a pool worker process can execute before
it's replaced with a new one. Default is no limit.

#### worker\_max\_memory\_per\_child

Default: No limit.
Type: int (kilobytes)

Maximum amount of resident memory, in kilobytes (1024 bytes), that may be
consumed by a worker before it will be replaced by a new worker. If a single
task causes a worker to exceed this limit, the task will be completed, and the
worker will be replaced afterwards.

Example:

```
worker_max_memory_per_child = 12288  # 12 * 1024 = 12 MB
```

#### worker\_disable\_rate\_limits

Default: Disabled (rate limits enabled).

Disable all rate limits, even if tasks has explicit rate limits set.

#### worker\_state\_db

Default: :const:`None`.

Name of the file used to stores persistent worker state (like revoked tasks).
Can be a relative or absolute path, but be aware that the suffix .db
may be appended to the file name (depending on Python version).

Can also be set via the :option:`celery worker --statedb` argument.

#### worker\_timer\_precision

Default: 1.0 seconds.

Set the maximum time in seconds that the ETA scheduler can sleep between
rechecking the schedule.

Setting this value to 1 second means the schedulers precision will
be 1 second. If you need near millisecond precision you can set this to 0.1.

#### worker\_enable\_remote\_control

Default: Enabled by default.

Specify if remote control of the workers is enabled.

#### worker\_proc\_alive\_timeout

Default: 4.0.

The timeout in seconds (int/float) when waiting for a new worker process to start up.

#### worker\_cancel\_long\_running\_tasks\_on\_connection\_loss

Default: Disabled by default.

Kill all long-running tasks with late acknowledgment enabled on connection loss.

Tasks which have not been acknowledged before the connection loss cannot do so
anymore since their channel is gone and the task is redelivered back to the queue.
This is why tasks with late acknowledged enabled must be idempotent as they may be executed more than once.
In this case, the task is being executed twice per connection loss (and sometimes in parallel in other workers).

When turning this option on, those tasks which have not been completed are
cancelled and their execution is terminated.
Tasks which have completed in any way before the connection loss
are recorded as such in the result backend as long as :setting:`task\_ignore\_result` is not enabled.

Warning

This feature was introduced as a future breaking change.
If it is turned off, Celery will emit a warning message.

In Celery 6.0, the :setting:`worker\_cancel\_long\_running\_tasks\_on\_connection\_loss`
will be set to True by default as the current behavior leads to more
problems than it solves.

#### worker\_detect\_quorum\_queues

Default: Enabled.

Automatically detect if any of the queues in :setting:`task\_queues` are quorum queues
(including the :setting:`task\_default\_queue`) and disable the global QoS if any quorum queue is detected.

#### worker\_soft\_shutdown\_timeout

Default: 0.0.

The standard :ref:`warm shutdown <worker-warm-shutdown>` will wait for all tasks to finish before shutting down
unless the cold shutdown is triggered. The :ref:`soft shutdown <worker-soft-shutdown>` will add a waiting time
before the cold shutdown is initiated. This setting specifies how long the worker will wait before the cold shutdown
is initiated and the worker is terminated.

This will apply also when the worker initiate :ref:`cold shutdown <worker-cold-shutdown>` without doing a warm shutdown first.

If the value is set to 0.0, the soft shutdown will be practically disabled. Regardless of the value, the soft shutdown
will be disabled if there are no tasks running (unless :setting:`worker\_enable\_soft\_shutdown\_on\_idle` is enabled).

Experiment with this value to find the optimal time for your tasks to finish gracefully before the worker is terminated.
Recommended values can be 10, 30, 60 seconds. Too high value can lead to a long waiting time before the worker is terminated
and trigger a :sig:`KILL` signal to forcefully terminate the worker by the host system.

#### worker\_enable\_soft\_shutdown\_on\_idle

Default: False.

If the :setting:`worker\_soft\_shutdown\_timeout` is set to a value greater than 0.0, the worker will skip
the :ref:`soft shutdown <worker-soft-shutdown>` anyways if there are no tasks running. This setting will
enable the soft shutdown even if there are no tasks running.

Tip

When the worker received ETA tasks, but the ETA has not been reached yet, and a shutdown is initiated,
the worker will **skip** the soft shutdown and initiate the cold shutdown immediately if there are no
tasks running. This may lead to failure in re-queueing the ETA tasks during worker teardown. To mitigate
this, enable this configuration to ensure the worker waits regadless, which gives enough time for a
graceful shutdown and successful re-queueing of the ETA tasks.

### [Events](#toc-entry-31)

#### worker\_send\_task\_events

Default: Disabled by default.

Send task-related events so that tasks can be monitored using tools like
flower. Sets the default value for the workers
:option:`-E <celery worker -E>` argument.

#### task\_send\_sent\_event

Default: Disabled by default.

If enabled, a :event:`task-sent` event will be sent for every task so tasks can be
tracked before they're consumed by a worker.

#### event\_queue\_ttl

transports supported:
:   amqp

Default: 5.0 seconds.

Message expiry time in seconds (int/float) for when messages sent to a monitor clients
event queue is deleted (x-message-ttl)

For example, if this value is set to 10 then a message delivered to this queue
will be deleted after 10 seconds.

#### event\_queue\_expires

transports supported:
:   amqp

Default: 60.0 seconds.

Expiry time in seconds (int/float) for when after a monitor clients
event queue will be deleted (x-expires).

#### event\_queue\_durable

transports supported:
:   amqp

Default: False

If enabled, the event receiver's queue will be marked as *durable*, meaning it will survive broker restarts.

#### event\_queue\_exclusive

transports supported:
:   amqp

Default: True

If enabled, the event queue will be *exclusive* to the current connection and automatically deleted when the connection closes.

Warning

You **cannot** set both event\_queue\_durable and event\_queue\_exclusive to True at the same time.
Celery will raise an :exc:`ImproperlyConfigured` error if both are set.

#### event\_queue\_prefix

Default: "celeryev".

The prefix to use for event receiver queue names.

#### event\_exchange

Default: "celeryev".

Name of the event exchange.

Warning

This option is in experimental stage, please use it with caution.

#### event\_serializer

Default: "json".

Message serialization format used when sending event messages.

#### events\_logfile

Default: :const:`None`

An optional file path for :program:`celery events` to log into (defaults to stdout).

#### events\_pidfile

Default: :const:`None`

An optional file path for :program:`celery events` to create/store its PID file (default to no PID file created).

#### events\_uid

Default: :const:`None`

An optional user ID to use when events :program:`celery events` drops its privileges (defaults to no UID change).

#### events\_gid

Default: :const:`None`

An optional group ID to use when :program:`celery events` daemon drops its privileges (defaults to no GID change).

#### events\_umask

Default: :const:`None`

An optional umask to use when :program:`celery events` creates files (log, pid...) when daemonizing.

#### events\_executable

Default: :const:`None`

An optional python executable path for :program:`celery events` to use when deaemonizing (defaults to :data:`sys.executable`).

### [Remote Control Commands](#toc-entry-32)

Note

To disable remote control commands see
the :setting:`worker\_enable\_remote\_control` setting.

#### control\_queue\_ttl

Default: 300.0

Time in seconds, before a message in a remote control command queue
will expire.

If using the default of 300 seconds, this means that if a remote control
command is sent and no worker picks it up within 300 seconds, the command
is discarded.

This setting also applies to remote control reply queues.

#### control\_queue\_expires

Default: 10.0

Time in seconds, before an unused remote control command queue is deleted
from the broker.

This setting also applies to remote control reply queues.

#### control\_exchange

Default: "celery".

Name of the control command exchange.

Warning

This option is in experimental stage, please use it with caution.

### [control\_queue\_durable](#toc-entry-33)

- **Default:** False
- **Type:** bool

If set to True, the control exchange and queue will be durable — they will survive broker restarts.

### [control\_queue\_exclusive](#toc-entry-34)

- **Default:** True
- **Type:** bool

If set to True, the control queue will be exclusive to a single connection.

Warning

Setting both control\_queue\_durable and control\_queue\_exclusive to True is not supported and will raise an error.

### [Logging](#toc-entry-35)

#### worker\_hijack\_root\_logger

Default: Enabled by default (hijack root logger).

By default any previously configured handlers on the root logger will be
removed. If you want to customize your own logging handlers, then you
can disable this behavior by setting
worker\_hijack\_root\_logger = False.

Note

Logging can also be customized by connecting to the
:signal:`celery.signals.setup\_logging` signal.

#### worker\_log\_color

Default: Enabled if app is logging to a terminal.

Enables/disables colors in logging output by the Celery apps.

#### worker\_log\_format

Default:

```
"[%(asctime)s: %(levelname)s/%(processName)s] %(message)s"
```

The format to use for log messages.

See the Python :mod:`logging` module for more information about log
formats.

#### worker\_log\_datefmt

Default: :const:`None`.

The format to use for the %(asctime)s field of log messages, for example
"%Y-%m-%d %H:%M:%S". When unset, the :mod:`logging` module default is
used, which appends milliseconds after a comma.

See :meth:`logging.Formatter.formatTime` for the accepted directives.

#### worker\_task\_log\_format

Default:

```
"[%(asctime)s: %(levelname)s/%(processName)s]
    %(task_name)s[%(task_id)s]: %(message)s"
```

The format to use for log messages logged in tasks.

See the Python :mod:`logging` module for more information about log
formats.

#### worker\_task\_log\_datefmt

Default: :const:`None`.

The format to use for the %(asctime)s field of log messages logged in
tasks. Behaves like :setting:`worker\_log\_datefmt`.

#### worker\_redirect\_stdouts

Default: Enabled by default.

If enabled stdout and stderr will be redirected
to the current logger.

Used by :program:`celery worker` and :program:`celery beat`.

#### worker\_redirect\_stdouts\_level

Default: :const:`WARNING`.

The log level output to stdout and stderr is logged as.
Can be one of :const:`DEBUG`, :const:`INFO`, :const:`WARNING`,
:const:`ERROR`, or :const:`CRITICAL`.

### [Security](#toc-entry-36)

#### security\_key

Default: :const:`None`.

The relative or absolute path to a file containing the private key
used to sign messages when :ref:`message-signing` is used.

#### security\_key\_password

Default: :const:`None`.

The password used to decrypt the private key when :ref:`message-signing`
is used.

#### security\_certificate

Default: :const:`None`.

The relative or absolute path to an X.509 certificate file
used to sign messages when :ref:`message-signing` is used.

#### security\_cert\_store

Default: :const:`None`.

The directory containing X.509 certificates used for
:ref:`message-signing`. Can be a glob with wild-cards,
(for example :file:`/etc/certs/\*.pem`).

#### security\_digest

Default: :const:`sha256`.

A cryptography digest used to sign messages
when :ref:`message-signing` is used.
<https://cryptography.io/en/latest/hazmat/primitives/cryptographic-hashes/#module-cryptography.hazmat.primitives.hashes>

### [Custom Component Classes (advanced)](#toc-entry-37)

#### worker\_pool

Default: "prefork" (celery.concurrency.prefork:TaskPool).

Name of the pool class used by the worker.

Eventlet/Gevent

Never use this option to select the eventlet or gevent pool.
You must use the :option:`-P <celery worker -P>` option to
:program:`celery worker` instead, to ensure the monkey patches
aren't applied too late, causing things to break in strange ways.

#### worker\_pool\_restarts

Default: Disabled by default.

If enabled the worker pool can be restarted using the
:control:`pool\_restart` remote control command.

#### worker\_autoscaler

Default: "celery.worker.autoscale:Autoscaler".

Name of the autoscaler class to use.

#### worker\_consumer

Default: "celery.worker.consumer:Consumer".

Name of the consumer class used by the worker.

#### worker\_timer

Default: "kombu.asynchronous.hub.timer:Timer".

Name of the ETA scheduler class used by the worker.
Default is or set by the pool implementation.

#### worker\_logfile

Default: :const:`None`

An optional file path for :program:`celery worker` to log into (defaults to stdout).

#### worker\_pidfile

Default: :const:`None`

An optional file path for :program:`celery worker` to create/store its PID file (defaults to no PID file created).

#### worker\_uid

Default: :const:`None`

An optional user ID to use when :program:`celery worker` daemon drops its privileges (defaults to no UID change).

#### worker\_gid

Default: :const:`None`

An optional group ID to use when :program:`celery worker` daemon drops its privileges (defaults to no GID change).

#### worker\_umask

Default: :const:`None`

An optional umask to use when :program:`celery worker` creates files (log, pid...) when daemonizing.

#### worker\_executable

Default: :const:`None`

An optional python executable path for :program:`celery worker` to use when deaemonizing (defaults to :data:`sys.executable`).

### [Beat Settings (:program:`celery beat`)](#toc-entry-38)

#### beat\_schedule

Default: {} (empty mapping).

The periodic task schedule used by :mod:`~celery.bin.beat`.
See :ref:`beat-entries`.

#### beat\_scheduler

Default: "celery.beat:PersistentScheduler".

The default scheduler class. May be set to
"django\_celery\_beat.schedulers:DatabaseScheduler" for instance,
if used alongside :pypi:`django-celery-beat` extension.

Can also be set via the :option:`celery beat -S` argument.

#### beat\_schedule\_filename

Default: "celerybeat-schedule".

Name of the file used by PersistentScheduler to store the last run times
of periodic tasks. Can be a relative or absolute path, but be aware that the
suffix .db may be appended to the file name (depending on Python version).

Can also be set via the :option:`celery beat --schedule` argument.

#### beat\_sync\_every

Default: 0.

The number of periodic tasks that can be called before another database sync
is issued.
A value of 0 (default) means sync based on timing - default of 3 minutes as determined by
scheduler.sync\_every. If set to 1, beat will call sync after every task
message sent.

#### beat\_max\_loop\_interval

Default: 0.

The maximum number of seconds :mod:`~celery.bin.beat` can sleep
between checking the schedule.

The default for this value is scheduler specific.
For the default Celery beat scheduler the value is 300 (5 minutes),
but for the :pypi:`django-celery-beat` database scheduler it's 5 seconds
because the schedule may be changed externally, and so it must take
changes to the schedule into account.

Also when running Celery beat embedded (:option:`-B <celery worker -B>`)
on Jython as a thread the max interval is overridden and set to 1 so
that it's possible to shut down in a timely manner.

#### beat\_cron\_starting\_deadline

Default: None.

When using cron, the number of seconds :mod:`~celery.bin.beat` can look back
when deciding whether a cron schedule is due. When set to None, cronjobs that
are past due will always run immediately.

Warning

Setting this higher than 3600 (1 hour) is highly discouraged.

#### beat\_logfile

Default: :const:`None`

An optional file path for :program:`celery beat` to log into (defaults to stdout).

#### beat\_pidfile

Default: :const:`None`

An optional file path for :program:`celery beat` to create/store it PID file (defaults to no PID file created).

#### beat\_uid

Default: :const:`None`

An optional user ID to use when beat :program:`celery beat` drops its privileges (defaults to no UID change).

#### beat\_gid

Default: :const:`None`

An optional group ID to use when :program:`celery beat` daemon drops its privileges (defaults to no GID change).

#### beat\_umask

Default: :const:`None`

An optional umask to use when :program:`celery beat` creates files (log, pid...) when daemonizing.

#### beat\_executable

Default: :const:`None`

An optional python executable path for :program:`celery beat` to use when deaemonizing (defaults to :data:`sys.executable`).
