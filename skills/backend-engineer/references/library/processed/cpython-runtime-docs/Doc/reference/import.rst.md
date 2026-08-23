> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/reference/import.rst`  
> Upstream Git blob: `2ff88cb6b1fed5408234fec2dc54dfac96f075c3`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# The import system

Python code in one :term:`module` gains access to the code in another module
by the process of :term:`importing` it. The :keyword:`import` statement is
the most common way of invoking the import machinery, but it is not the only
way. Functions such as :func:`importlib.import\_module` and built-in
:func:`\_\_import\_\_` can also be used to invoke the import machinery.

The :keyword:`import` statement combines two operations; it searches for the
named module, then it binds the results of that search to a name in the local
scope. The search operation of the :keyword:`!import` statement is defined as
a call to the :func:`\_\_import\_\_` function, with the appropriate arguments.
The return value of :func:`\_\_import\_\_` is used to perform the name
binding operation of the :keyword:`!import` statement. See the
:keyword:`!import` statement for the exact details of that name binding
operation.

A direct call to :func:`\_\_import\_\_` performs only the module search and, if
found, the module creation operation. While certain side-effects may occur,
such as the importing of parent packages, and the updating of various caches
(including :data:`sys.modules`), only the :keyword:`import` statement performs
a name binding operation.

When an :keyword:`import` statement is executed, the standard builtin
:func:`\_\_import\_\_` function is called. Other mechanisms for invoking the
import system (such as :func:`importlib.import\_module`) may choose to bypass
:func:`\_\_import\_\_` and use their own solutions to implement import semantics.

When a module is first imported, Python searches for the module and if found,
it creates a module object [[1]](#fnmo), initializing it. If the named module
cannot be found, a :exc:`ModuleNotFoundError` is raised. Python implements various
strategies to search for the named module when the import machinery is
invoked. These strategies can be modified and extended by using various hooks
described in the sections below.

## :mod:`importlib`

The :mod:`importlib` module provides a rich API for interacting with the
import system. For example :func:`importlib.import\_module` provides a
recommended, simpler API than built-in :func:`\_\_import\_\_` for invoking the
import machinery. Refer to the :mod:`importlib` library documentation for
additional detail.

## Packages

Python has only one type of module object, and all modules are of this type,
regardless of whether the module is implemented in Python, C, or something
else. To help organize modules and provide a naming hierarchy, Python has a
concept of :term:`packages <package>`.

You can think of packages as the directories on a file system and modules as
files within directories, but don't take this analogy too literally since
packages and modules need not originate from the file system. For the
purposes of this documentation, we'll use this convenient analogy of
directories and files. Like file system directories, packages are organized
hierarchically, and packages may themselves contain subpackages, as well as
regular modules.

It's important to keep in mind that all packages are modules, but not all
modules are packages. Or put another way, packages are just a special kind of
module. Specifically, any module that contains a \_\_path\_\_ attribute is
considered a package.

All modules have a name. Subpackage names are separated from their parent
package name by a dot, akin to Python's standard attribute access syntax. Thus
you might have a package called :mod:`email`, which in turn has a subpackage
called :mod:`email.mime` and a module within that subpackage called
:mod:`email.mime.text`.

### Regular packages

Python defines two types of packages, :term:`regular packages <regular
package>` and :term:`namespace packages <namespace package>`. Regular
packages are traditional packages as they existed in Python 3.2 and earlier.
A regular package is typically implemented as a directory containing an
\_\_init\_\_.py file. When a regular package is imported, this
\_\_init\_\_.py file is implicitly executed, and the objects it defines are
bound to names in the package's namespace. The \_\_init\_\_.py file can
contain the same Python code that any other module can contain, and Python
will add some additional attributes to the module when it is imported.

For example, the following file system layout defines a top level parent
package with three subpackages:

```
parent/
    __init__.py
    one/
        __init__.py
    two/
        __init__.py
    three/
        __init__.py
```

Importing parent.one will implicitly execute parent/\_\_init\_\_.py and
parent/one/\_\_init\_\_.py. Subsequent imports of parent.two or
parent.three will execute parent/two/\_\_init\_\_.py and
parent/three/\_\_init\_\_.py respectively.

A subdirectory inside a regular package that does not contain an
\_\_init\_\_.py file is treated as an implicit
:ref:`namespace package <reference-namespace-package>` (a "namespace
subpackage") rooted in that parent. See [PEP 420](https://peps.python.org/pep-0420) for the underlying
specification.

### Namespace packages

A namespace package is a composite of various :term:`portions <portion>`,
where each portion contributes a subpackage to the parent package. Portions
may reside in different locations on the file system. Portions may also be
found in zip files, on the network, or anywhere else that Python searches
during import. Namespace packages may or may not correspond directly to
objects on the file system; they may be virtual modules that have no concrete
representation.

Namespace packages do not use an ordinary list for their \_\_path\_\_
attribute. They instead use a custom iterable type which will automatically
perform a new search for package portions on the next import attempt within
that package if the path of their parent package (or :data:`sys.path` for a
top level package) changes.

With namespace packages, there is no parent/\_\_init\_\_.py file. In fact,
there may be multiple parent directories found during import search, where
each one is provided by a different portion. Thus parent/one may not be
physically located next to parent/two. In this case, Python will create a
namespace package for the top-level parent package whenever it or one of
its subpackages is imported.

Namespace packages may also be nested inside a regular package. When the
import system searches a regular package's \_\_path\_\_ and encounters a
subdirectory that does not contain an \_\_init\_\_.py file, that
subdirectory becomes a :term:`portion` contributing to a namespace
subpackage of the enclosing regular package.

See also [PEP 420](https://peps.python.org/pep-0420) for the namespace package specification.

## Searching

To begin the search, Python needs the :term:`fully qualified <qualified name>`
name of the module (or package, but for the purposes of this discussion, the
difference is immaterial) being imported. This name may come from various
arguments to the :keyword:`import` statement, or from the parameters to the
:func:`importlib.import\_module` or :func:`\_\_import\_\_` functions.

This name will be used in various phases of the import search, and it may be
the dotted path to a submodule, e.g. foo.bar.baz. In this case, Python
first tries to import foo, then foo.bar, and finally foo.bar.baz.
If any of the intermediate imports fail, a :exc:`ModuleNotFoundError` is raised.

### The module cache

The first place checked during import search is :data:`sys.modules`. This
mapping serves as a cache of all modules that have been previously imported,
including the intermediate paths. So if foo.bar.baz was previously
imported, :data:`sys.modules` will contain entries for foo, foo.bar,
and foo.bar.baz. Each key will have as its value the corresponding module
object.

During import, the module name is looked up in :data:`sys.modules` and if
present, the associated value is the module satisfying the import, and the
process completes. However, if the value is None, then a
:exc:`ModuleNotFoundError` is raised. If the module name is missing, Python will
continue searching for the module.

:data:`sys.modules` is writable. Deleting a key may not destroy the
associated module (as other modules may hold references to it),
but it will invalidate the cache entry for the named module, causing
Python to search anew for the named module upon its next
import. The key can also be assigned to None, forcing the next import
of the module to result in a :exc:`ModuleNotFoundError`.

Beware though, as if you keep a reference to the module object,
invalidate its cache entry in :data:`sys.modules`, and then re-import the
named module, the two module objects will *not* be the same. By contrast,
:func:`importlib.reload` will reuse the *same* module object, and simply
reinitialise the module contents by rerunning the module's code.

### Finders and loaders

If the named module is not found in :data:`sys.modules`, then Python's import
protocol is invoked to find and load the module. This protocol consists of
two conceptual objects, :term:`finders <finder>` and :term:`loaders <loader>`.
A finder's job is to determine whether it can find the named module using
whatever strategy it knows about. Objects that implement both of these
interfaces are referred to as :term:`importers <importer>` - they return
themselves when they find that they can load the requested module.

Python includes a number of default finders and importers. The first one
knows how to locate built-in modules, and the second knows how to locate
frozen modules. A third default finder searches an :term:`import path`
for modules. The :term:`import path` is a list of locations that may
name file system paths or zip files. It can also be extended to search
for any locatable resource, such as those identified by URLs.

The import machinery is extensible, so new finders can be added to extend the
range and scope of module searching.

Finders do not actually load modules. If they can find the named module, they
return a :dfn:`module spec`, an encapsulation of the module's import-related
information, which the import machinery then uses when loading the module.

The following sections describe the protocol for finders and loaders in more
detail, including how you can create and register new ones to extend the
import machinery.

### Import hooks

The import machinery is designed to be extensible; the primary mechanism for
this are the *import hooks*. There are two types of import hooks: *meta
hooks* and *import path hooks*.

Meta hooks are called at the start of import processing, before any other
import processing has occurred, other than :data:`sys.modules` cache look up.
This allows meta hooks to override :data:`sys.path` processing, frozen
modules, or even built-in modules. Meta hooks are registered by adding new
finder objects to :data:`sys.meta\_path`, as described below.

Import path hooks are called as part of :data:`sys.path` (or
package.\_\_path\_\_) processing, at the point where their associated path
item is encountered. Import path hooks are registered by adding new callables
to :data:`sys.path\_hooks` as described below.

### The meta path

When the named module is not found in :data:`sys.modules`, Python next
searches :data:`sys.meta\_path`, which contains a list of meta path finder
objects. These finders are queried in order to see if they know how to handle
the named module. Meta path finders must implement a method called
:meth:`~importlib.abc.MetaPathFinder.find\_spec` which takes three arguments:
a name, an import path, and (optionally) a target module. The meta path
finder can use any strategy it wants to determine whether it can handle
the named module or not.

If the meta path finder knows how to handle the named module, it returns a
spec object. If it cannot handle the named module, it returns None. If
:data:`sys.meta\_path` processing reaches the end of its list without returning
a spec, then a :exc:`ModuleNotFoundError` is raised. Any other exceptions
raised are simply propagated up, aborting the import process.

The :meth:`~importlib.abc.MetaPathFinder.find\_spec` method of meta path
finders is called with two or three arguments. The first is the fully
qualified name of the module being imported, for example foo.bar.baz.
The second argument is the path entries to use for the module search. For
top-level modules, the second argument is None, but for submodules or
subpackages, the second argument is the value of the parent package's
\_\_path\_\_ attribute. If the appropriate \_\_path\_\_ attribute cannot
be accessed, a :exc:`ModuleNotFoundError` is raised. The third argument
is an existing module object that will be the target of loading later.
The import system passes in a target module only during reload.

The meta path may be traversed multiple times for a single import request.
For example, assuming none of the modules involved has already been cached,
importing foo.bar.baz will first perform a top level import, calling
mpf.find\_spec("foo", None, None) on each meta path finder (mpf). After
foo has been imported, foo.bar will be imported by traversing the
meta path a second time, calling
mpf.find\_spec("foo.bar", foo.\_\_path\_\_, None). Once foo.bar has been
imported, the final traversal will call
mpf.find\_spec("foo.bar.baz", foo.bar.\_\_path\_\_, None).

Some meta path finders only support top level imports. These importers will
always return None when anything other than None is passed as the
second argument.

Python's default :data:`sys.meta\_path` has three meta path finders, one that
knows how to import built-in modules, one that knows how to import frozen
modules, and one that knows how to import modules from an :term:`import path`
(i.e. the :term:`path based finder`).

## Loading

If and when a module spec is found, the import machinery will use it (and
the loader it contains) when loading the module. Here is an approximation
of what happens during the loading portion of import:

```
module = None
if spec.loader is not None and hasattr(spec.loader, 'create_module'):
    # It is assumed 'exec_module' will also be defined on the loader.
    module = spec.loader.create_module(spec)
if module is None:
    module = ModuleType(spec.name)
# The import-related module attributes get set here:
_init_module_attrs(spec, module)

if spec.loader is None:
    # unsupported
    raise ImportError

sys.modules[spec.name] = module
try:
    spec.loader.exec_module(module)
except BaseException:
    try:
        del sys.modules[spec.name]
    except KeyError:
        pass
    raise
return sys.modules[spec.name]
```

Note the following details:

- If there is an existing module object with the given name in
  :data:`sys.modules`, import will have already returned it.
- The module will exist in :data:`sys.modules` before the loader
  executes the module code. This is crucial because the module code may
  (directly or indirectly) import itself; adding it to :data:`sys.modules`
  beforehand prevents unbounded recursion in the worst case and multiple
  loading in the best.
- If loading fails, the failing module -- and only the failing module --
  gets removed from :data:`sys.modules`. Any module already in the
  :data:`sys.modules` cache, and any module that was successfully loaded
  as a side-effect, must remain in the cache. This contrasts with
  reloading where even the failing module is left in :data:`sys.modules`.
- After the module is created but before execution, the import machinery
  sets the import-related module attributes ("\_init\_module\_attrs" in
  the pseudo-code example above), as summarized in a
  :ref:`later section <import-mod-attrs>`.
- Module execution is the key moment of loading in which the module's
  namespace gets populated. Execution is entirely delegated to the
  loader, which gets to decide what gets populated and how.
- The module created during loading and passed to exec\_module() may
  not be the one returned at the end of import [[2]](#fnlo).

### Loaders

Module loaders provide the critical function of loading: module execution.
The import machinery calls the :meth:`importlib.abc.Loader.exec\_module`
method with a single argument, the module object to execute. Any value
returned from :meth:`~importlib.abc.Loader.exec\_module` is ignored.

Loaders must satisfy the following requirements:

- If the module is a Python module (as opposed to a built-in module or a
  dynamically loaded extension), the loader should execute the module's code
  in the module's global name space (module.\_\_dict\_\_).
- If the loader cannot execute the module, it should raise an
  :exc:`ImportError`, although any other exception raised during
  :meth:`~importlib.abc.Loader.exec\_module` will be propagated.

In many cases, the finder and loader can be the same object; in such cases the
:meth:`~importlib.abc.MetaPathFinder.find\_spec` method would just return a
spec with the loader set to self.

Module loaders may opt in to creating the module object during loading
by implementing a :meth:`~importlib.abc.Loader.create\_module` method.
It takes one argument, the module spec, and returns the new module object
to use during loading. create\_module() does not need to set any attributes
on the module object. If the method returns None, the
import machinery will create the new module itself.

### Submodules

When a submodule is loaded using any mechanism (e.g. importlib APIs, the
import or import-from statements, or built-in \_\_import\_\_()) a
binding is placed in the parent module's namespace to the submodule object.
For example, if package spam has a submodule foo, after importing
spam.foo, spam will have an attribute foo which is bound to the
submodule. Let's say you have the following directory structure:

```
spam/
    __init__.py
    foo.py
```

and spam/\_\_init\_\_.py has the following line in it:

```
from .foo import Foo
```

then executing the following puts name bindings for foo and Foo in the
spam module:

```
>>> import spam
>>> spam.foo
<module 'spam.foo' from '/tmp/imports/spam/foo.py'>
>>> spam.Foo
<class 'spam.foo.Foo'>
```

Given Python's familiar name binding rules this might seem surprising, but
it's actually a fundamental feature of the import system. The invariant
holding is that if you have sys.modules['spam'] and
sys.modules['spam.foo'] (as you would after the above import), the latter
must appear as the foo attribute of the former.

### Module specs

The import machinery uses a variety of information about each module
during import, especially before loading. Most of the information is
common to all modules. The purpose of a module's spec is to encapsulate
this import-related information on a per-module basis.

Using a spec during import allows state to be transferred between import
system components, e.g. between the finder that creates the module spec
and the loader that executes it. Most importantly, it allows the
import machinery to perform the boilerplate operations of loading,
whereas without a module spec the loader had that responsibility.

The module's spec is exposed as :attr:`module.\_\_spec\_\_`. Setting
:attr:`!\_\_spec\_\_` appropriately applies equally to
:ref:`modules initialized during interpreter startup <programs>`.
The one exception is \_\_main\_\_, where :attr:`!\_\_spec\_\_` is
:ref:`set to None in some cases <main\_spec>`.

See :class:`~importlib.machinery.ModuleSpec` for details on the contents of
the module spec.

### \_\_path\_\_ attributes on modules

The :attr:`~module.\_\_path\_\_` attribute should be a (possibly empty)
:term:`sequence` of strings enumerating the locations where the package's
submodules will be found. By definition, if a module has a :attr:`!\_\_path\_\_`
attribute, it is a :term:`package`.

A package's :attr:`~module.\_\_path\_\_` attribute is used during imports of its
subpackages.
Within the import machinery, it functions much the same as :data:`sys.path`,
i.e. providing a list of locations to search for modules during import.
However, :attr:`!\_\_path\_\_` is typically much more constrained than
:data:`!sys.path`.

The same rules used for :data:`sys.path` also apply to a package's
:attr:`!\_\_path\_\_`. :data:`sys.path\_hooks` (described below) are
consulted when traversing a package's :attr:`!\_\_path\_\_`.

A package's \_\_init\_\_.py file may set or alter the package's
:attr:`~module.\_\_path\_\_`
attribute, and this was typically the way namespace packages were implemented
prior to [PEP 420](https://peps.python.org/pep-0420). With the adoption of [PEP 420](https://peps.python.org/pep-0420), namespace packages no
longer need to supply \_\_init\_\_.py files containing only :attr:`!\_\_path\_\_`
manipulation code; the import machinery automatically sets :attr:`!\_\_path\_\_`
correctly for the namespace package.

### Module reprs

By default, all modules have a usable repr, however depending on the
attributes set above, and in the module's spec, you can more explicitly
control the repr of module objects.

If the module has a spec (\_\_spec\_\_), the import machinery will try
to generate a repr from it. If that fails or there is no spec, the import
system will craft a default repr using whatever information is available
on the module. It will try to use the module.\_\_name\_\_,
module.\_\_file\_\_, and module.\_\_loader\_\_ as input into the repr,
with defaults for whatever information is missing.

Here are the exact rules used:

- If the module has a \_\_spec\_\_ attribute, the information in the spec
  is used to generate the repr. The "name", "loader", "origin", and
  "has\_location" attributes are consulted.
- If the module has a \_\_file\_\_ attribute, this is used as part of the
  module's repr.
- If the module has no \_\_file\_\_ but does have a \_\_loader\_\_ that is not
  None, then the loader's repr is used as part of the module's repr.
- Otherwise, just use the module's \_\_name\_\_ in the repr.

### Cached bytecode invalidation

Before Python loads cached bytecode from a .pyc file, it checks whether the
cache is up-to-date with the source .py file. By default, Python does this
by storing the source's last-modified timestamp and size in the cache file when
writing it. At runtime, the import system then validates the cache file by
checking the stored metadata in the cache file against the source's
metadata.

Python also supports "hash-based" cache files, which store a hash of the source
file's contents rather than its metadata. There are two variants of hash-based
.pyc files: checked and unchecked. For checked hash-based .pyc files,
Python validates the cache file by hashing the source file and comparing the
resulting hash with the hash in the cache file. If a checked hash-based cache
file is found to be invalid, Python regenerates it and writes a new checked
hash-based cache file. For unchecked hash-based .pyc files, Python simply
assumes the cache file is valid if it exists. Hash-based .pyc files
validation behavior may be overridden with the :option:`--check-hash-based-pycs`
flag.

## The Path Based Finder

As mentioned previously, Python comes with several default meta path finders.
One of these, called the :term:`path based finder`
(:class:`~importlib.machinery.PathFinder`), searches an :term:`import path`,
which contains a list of :term:`path entries <path entry>`. Each path
entry names a location to search for modules.

The path based finder itself doesn't know how to import anything. Instead, it
traverses the individual path entries, associating each of them with a
path entry finder that knows how to handle that particular kind of path.

The default set of path entry finders implement all the semantics for finding
modules on the file system, handling special file types such as Python source
code (.py files), Python byte code (.pyc files) and
shared libraries (e.g. .so files). When supported by the :mod:`zipimport`
module in the standard library, the default path entry finders also handle
loading all of these file types (other than shared libraries) from zipfiles.

Within a single :term:`path entry`, the default path entry finders check for a
:term:`regular package` first, then for extension modules, then for source
files, and finally for bytecode files. For example, if the same directory
contains both spam/\_\_init\_\_.py and spam.py, import spam will
import the package from spam/\_\_init\_\_.py. A directory without an
\_\_init\_\_.py file is treated as a :term:`namespace package` portion only if
no matching module is found. Note that this does not override the order of the
:term:`import path`.

Path entries need not be limited to file system locations. They can refer to
URLs, database queries, or any other location that can be specified as a
string.

The path based finder provides additional hooks and protocols so that you
can extend and customize the types of searchable path entries. For example,
if you wanted to support path entries as network URLs, you could write a hook
that implements HTTP semantics to find modules on the web. This hook (a
callable) would return a :term:`path entry finder` supporting the protocol
described below, which was then used to get a loader for the module from the
web.

A word of warning: this section and the previous both use the term *finder*,
distinguishing between them by using the terms :term:`meta path finder` and
:term:`path entry finder`. These two types of finders are very similar,
support similar protocols, and function in similar ways during the import
process, but it's important to keep in mind that they are subtly different.
In particular, meta path finders operate at the beginning of the import
process, as keyed off the :data:`sys.meta\_path` traversal.

By contrast, path entry finders are in a sense an implementation detail
of the path based finder, and in fact, if the path based finder were to be
removed from :data:`sys.meta\_path`, none of the path entry finder semantics
would be invoked.

### Path entry finders

The :term:`path based finder` is responsible for finding and loading
Python modules and packages whose location is specified with a string
:term:`path entry`. Most path entries name locations in the file system,
but they need not be limited to this.

As a meta path finder, the :term:`path based finder` implements the
:meth:`~importlib.abc.MetaPathFinder.find\_spec` protocol previously
described, however it exposes additional hooks that can be used to
customize how modules are found and loaded from the :term:`import path`.

Three variables are used by the :term:`path based finder`, :data:`sys.path`,
:data:`sys.path\_hooks` and :data:`sys.path\_importer\_cache`. The \_\_path\_\_
attributes on package objects are also used. These provide additional ways
that the import machinery can be customized.

:data:`sys.path` contains a list of strings providing search locations for
modules and packages. It is initialized from the :envvar:`PYTHONPATH`
environment variable and various other installation- and
implementation-specific defaults. Entries in :data:`sys.path` can name
directories on the file system, zip files, and potentially other "locations"
(see the :mod:`site` module) that should be searched for modules, such as
URLs, or database queries. Only strings should be present on
:data:`sys.path`; all other data types are ignored.

The :term:`path based finder` is a :term:`meta path finder`, so the import
machinery begins the :term:`import path` search by calling the path
based finder's :meth:`~importlib.machinery.PathFinder.find\_spec` method as
described previously. When the path argument to
:meth:`~importlib.machinery.PathFinder.find\_spec` is given, it will be a
list of string paths to traverse - typically a package's \_\_path\_\_
attribute for an import within that package. If the path argument is
None, this indicates a top level import and :data:`sys.path` is used.

The path based finder iterates over every entry in the search path, and
for each of these, looks for an appropriate :term:`path entry finder`
(:class:`~importlib.abc.PathEntryFinder`) for the
path entry. Because this can be an expensive operation (e.g. there may be
stat() call overheads for this search), the path based finder maintains
a cache mapping path entries to path entry finders. This cache is maintained
in :data:`sys.path\_importer\_cache` (despite the name, this cache actually
stores finder objects rather than being limited to :term:`importer` objects).
In this way, the expensive search for a particular :term:`path entry`
location's :term:`path entry finder` need only be done once. User code is
free to remove cache entries from :data:`sys.path\_importer\_cache` forcing
the path based finder to perform the path entry search again.

If the path entry is not present in the cache, the path based finder iterates
over every callable in :data:`sys.path\_hooks`. Each of the :term:`path entry
hooks <path entry hook>` in this list is called with a single argument, the
path entry to be searched. This callable may either return a :term:`path
entry finder` that can handle the path entry, or it may raise
:exc:`ImportError`. An :exc:`ImportError` is used by the path based finder to
signal that the hook cannot find a :term:`path entry finder`
for that :term:`path entry`. The
exception is ignored and :term:`import path` iteration continues. The hook
should expect either a string or bytes object; the encoding of bytes objects
is up to the hook (e.g. it may be a file system encoding, UTF-8, or something
else), and if the hook cannot decode the argument, it should raise
:exc:`ImportError`.

If :data:`sys.path\_hooks` iteration ends with no :term:`path entry finder`
being returned, then the path based finder's
:meth:`~importlib.machinery.PathFinder.find\_spec` method will store None
in :data:`sys.path\_importer\_cache` (to indicate that there is no finder for
this path entry) and return None, indicating that this
:term:`meta path finder` could not find the module.

If a :term:`path entry finder` *is* returned by one of the :term:`path entry
hook` callables on :data:`sys.path\_hooks`, then the following protocol is used
to ask the finder for a module spec, which is then used when loading the
module.

The current working directory -- denoted by an empty string -- is handled
slightly differently from other entries on :data:`sys.path`. First, if the
current working directory cannot be determined or is found not to exist, no
value is stored in :data:`sys.path\_importer\_cache`. Second, the value for the
current working directory is looked up fresh for each module lookup. Third,
the path used for :data:`sys.path\_importer\_cache` and returned by
:meth:`importlib.machinery.PathFinder.find\_spec` will be the actual current
working directory and not the empty string.

### Path entry finder protocol

In order to support imports of modules and initialized packages and also to
contribute portions to namespace packages, path entry finders must implement
the :meth:`~importlib.abc.PathEntryFinder.find\_spec` method.

:meth:`~importlib.abc.PathEntryFinder.find\_spec` takes two arguments: the
fully qualified name of the module being imported, and the (optional) target
module. find\_spec() returns a fully populated spec for the module.
This spec will always have "loader" set (with one exception).

To indicate to the import machinery that the spec represents a namespace
:term:`portion`, the path entry finder sets submodule\_search\_locations to
a list containing the portion.

## Replacing the standard import system

The most reliable mechanism for replacing the entire import system is to
delete the default contents of :data:`sys.meta\_path`, replacing them
entirely with a custom meta path hook.

If it is acceptable to only alter the behaviour of import statements
without affecting other APIs that access the import system, then replacing
the builtin :func:`\_\_import\_\_` function may be sufficient.

To selectively prevent the import of some modules from a hook early on the
meta path (rather than disabling the standard import system entirely),
it is sufficient to raise :exc:`ModuleNotFoundError` directly from
:meth:`~importlib.abc.MetaPathFinder.find\_spec` instead of returning
None. The latter indicates that the meta path search should continue,
while raising an exception terminates it immediately.

## Package Relative Imports

Relative imports use leading dots. A single leading dot indicates a relative
import, starting with the current package. Two or more leading dots indicate a
relative import to the parent(s) of the current package, one level per dot
after the first. For example, given the following package layout:

```
package/
    __init__.py
    subpackage1/
        __init__.py
        moduleX.py
        moduleY.py
    subpackage2/
        __init__.py
        moduleZ.py
    moduleA.py
```

In either subpackage1/moduleX.py or subpackage1/\_\_init\_\_.py,
the following are valid relative imports:

```
from .moduleY import spam
from .moduleY import spam as ham
from . import moduleY
from ..subpackage1 import moduleY
from ..subpackage2.moduleZ import eggs
from ..moduleA import foo
```

Absolute imports may use either the import <> or from <> import <>
syntax, but relative imports may only use the second form; the reason
for this is that:

```
import XXX.YYY.ZZZ
```

should expose XXX.YYY.ZZZ as a usable expression, but .moduleY is
not a valid expression.

## Special considerations for \_\_main\_\_

The :mod:`\_\_main\_\_` module is a special case relative to Python's import
system. As noted :ref:`elsewhere <programs>`, the \_\_main\_\_ module
is directly initialized at interpreter startup, much like :mod:`sys` and
:mod:`builtins`. However, unlike those two, it doesn't strictly
qualify as a built-in module. This is because the manner in which
\_\_main\_\_ is initialized depends on the flags and other options with
which the interpreter is invoked.

### \_\_main\_\_.\_\_spec\_\_

Depending on how :mod:`\_\_main\_\_` is initialized, \_\_main\_\_.\_\_spec\_\_
gets set appropriately or to None.

When Python is started with the :option:`-m` option, \_\_spec\_\_ is set
to the module spec of the corresponding module or package. \_\_spec\_\_ is
also populated when the \_\_main\_\_ module is loaded as part of executing a
directory, zipfile or other :data:`sys.path` entry.

In :ref:`the remaining cases <using-on-interface-options>`
\_\_main\_\_.\_\_spec\_\_ is set to None, as the code used to populate the
:mod:`\_\_main\_\_` does not correspond directly with an importable module:

- interactive prompt
- :option:`-c` option
- running from stdin
- running directly from a source or bytecode file

Note that \_\_main\_\_.\_\_spec\_\_ is always None in the last case,
*even if* the file could technically be imported directly as a module
instead. Use the :option:`-m` switch if valid module metadata is desired
in :mod:`\_\_main\_\_`.

Note also that even when \_\_main\_\_ corresponds with an importable module
and \_\_main\_\_.\_\_spec\_\_ is set accordingly, they're still considered
*distinct* modules. This is due to the fact that blocks guarded by
if \_\_name\_\_ == "\_\_main\_\_": checks only execute when the module is used
to populate the \_\_main\_\_ namespace, and not during normal import.

## References

The import machinery has evolved considerably since Python's early days. The
original [specification for packages](https://www.python.org/doc/essays/packages/) is still available to read,
although some details have changed since the writing of that document.

The original specification for :data:`sys.meta\_path` was [PEP 302](https://peps.python.org/pep-0302), with
subsequent extension in [PEP 420](https://peps.python.org/pep-0420).

[PEP 420](https://peps.python.org/pep-0420) introduced :term:`namespace packages <namespace package>` for
Python 3.3. [PEP 420](https://peps.python.org/pep-0420) also introduced the :meth:`!find\_loader` protocol as an
alternative to :meth:`!find\_module`.

[PEP 366](https://peps.python.org/pep-0366) describes the addition of the \_\_package\_\_ attribute for
explicit relative imports in main modules.

[PEP 328](https://peps.python.org/pep-0328) introduced absolute and explicit relative imports and initially
proposed \_\_name\_\_ for semantics [PEP 366](https://peps.python.org/pep-0366) would eventually specify for
\_\_package\_\_.

[PEP 338](https://peps.python.org/pep-0338) defines executing modules as scripts.

[PEP 451](https://peps.python.org/pep-0451) adds the encapsulation of per-module import state in spec
objects. It also off-loads most of the boilerplate responsibilities of
loaders back onto the import machinery. These changes allow the
deprecation of several APIs in the import system and also addition of new
methods to finders and loaders.

Footnotes

[[1](#footnote-reference-1)]

See :class:`types.ModuleType`.


[[2](#footnote-reference-2)]

The importlib implementation avoids using the return value
directly. Instead, it gets the module object by looking the module name up
in :data:`sys.modules`. The indirect effect of this is that an imported
module may replace itself in :data:`sys.modules`. This is
implementation-specific behavior that is not guaranteed to work in other
Python implementations.
