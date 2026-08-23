> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/reference/datamodel.rst`  
> Upstream Git blob: `fde3cef63bc6e90abf1fa6caa70fb37600da34e3`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Data model

## Objects, values and types

:dfn:`Objects` are Python's abstraction for data. All data in a Python program
is represented by objects or by relations between objects. Even code is
represented by objects.

Every object has an identity, a type and a value. An object's *identity* never
changes once it has been created; you may think of it as the object's address in
memory. The :keyword:`is` operator compares the identity of two objects; the
:func:`id` function returns an integer representing its identity.

An object's type determines the operations that the object supports (e.g., "does
it have a length?") and also defines the possible values for objects of that
type. The :func:`type` function returns an object's type (which is an object
itself). Like its identity, an object's :dfn:`type` is also unchangeable.
[[1]](#footnote-1)

The *value* of some objects can change. Objects whose value can
change are said to be *mutable*; objects whose value is unchangeable once they
are created are called *immutable*. (The value of an immutable container object
that contains a reference to a mutable object can change when the latter's value
is changed; however the container is still considered immutable, because the
collection of objects it contains cannot be changed. So, immutability is not
strictly the same as having an unchangeable value, it is more subtle.) An
object's mutability is determined by its type; for instance, numbers, strings
and tuples are immutable, while dictionaries and lists are mutable.

Objects are never explicitly destroyed; however, when they become unreachable
they may be garbage-collected. An implementation is allowed to postpone garbage
collection or omit it altogether --- it is a matter of implementation quality
how garbage collection is implemented, as long as no objects are collected that
are still reachable.

Note that the use of the implementation's tracing or debugging facilities may
keep objects alive that would normally be collectable. Also note that catching
an exception with a :keyword:`try`...:keyword:`except` statement may keep
objects alive.

Some objects contain references to "external" resources such as open files or
windows. It is understood that these resources are freed when the object is
garbage-collected, but since garbage collection is not guaranteed to happen,
such objects also provide an explicit way to release the external resource,
usually a :meth:`!close` method. Programs are strongly recommended to explicitly
close such objects. The :keyword:`try`...:keyword:`finally` statement
and the :keyword:`with` statement provide convenient ways to do this.

Some objects contain references to other objects; these are called *containers*.
Examples of containers are tuples, lists and dictionaries. The references are
part of a container's value. In most cases, when we talk about the value of a
container, we imply the values, not the identities of the contained objects;
however, when we talk about the mutability of a container, only the identities
of the immediately contained objects are implied. So, if an immutable container
(like a tuple) contains a reference to a mutable object, its value changes if
that mutable object is changed.

Types affect almost all aspects of object behavior. Even the importance of
object identity is affected in some sense: for immutable types, operations that
compute new values may actually return a reference to any existing object with
the same type and value, while for mutable objects this is not allowed.
For example, after a = 1; b = 1, *a* and *b* may or may not refer to
the same object with the value one, depending on the implementation.
This is because :class:`int` is an immutable type, so the reference to 1
can be reused. This behaviour depends on the implementation used, so should
not be relied upon, but is something to be aware of when making use of object
identity tests.
However, after c = []; d = [], *c* and *d* are guaranteed to refer to two
different, unique, newly created empty lists. (Note that e = f = [] assigns
the *same* object to both *e* and *f*.)

## The standard type hierarchy

Below is a list of the types that are built into Python. Extension modules
(written in C, Java, or other languages, depending on the implementation) can
define additional types. Future versions of Python may add types to the type
hierarchy (e.g., rational numbers, efficiently stored arrays of integers, etc.),
although such additions will often be provided via the standard library instead.

Some of the type descriptions below contain a paragraph listing 'special
attributes.' These are attributes that provide access to the implementation and
are not intended for general use. Their definition may change in the future.

### None

This type has a single value. There is a single object with this value. This
object is accessed through the built-in name None. It is used to signify the
absence of a value in many situations, e.g., it is returned from functions that
don't explicitly return anything. Its truth value is false.

### NotImplemented

This type has a single value. There is a single object with this value. This
object is accessed through the built-in name :data:`NotImplemented`. Numeric methods
and rich comparison methods should return this value if they do not implement the
operation for the operands provided. (The interpreter will then try the
reflected operation, or some other fallback, depending on the operator.) It
should not be evaluated in a boolean context.

See
:ref:`implementing-the-arithmetic-operations`
for more details.

### Ellipsis

This type has a single value. There is a single object with this value. This
object is accessed through the literal ... or the built-in name
Ellipsis. Its truth value is true.

### :class:`numbers.Number`

These are created by numeric literals and returned as results by arithmetic
operators and arithmetic built-in functions. Numeric objects are immutable;
once created their value never changes. Python numbers are of course strongly
related to mathematical numbers, but subject to the limitations of numerical
representation in computers.

The string representations of the numeric classes, computed by
:meth:`~object.\_\_repr\_\_` and :meth:`~object.\_\_str\_\_`, have the following
properties:

- They are valid numeric literals which, when passed to their
  class constructor, produce an object having the value of the
  original numeric.
- The representation is in base 10, when possible.
- Leading zeros, possibly excepting a single zero before a
  decimal point, are not shown.
- Trailing zeros, possibly excepting a single zero after a
  decimal point, are not shown.
- A sign is shown only when the number is negative.

Python distinguishes between integers, floating-point numbers, and complex
numbers:

#### :class:`numbers.Integral`

These represent elements from the mathematical set of integers (positive and
negative).

Note

The rules for integer representation are intended to give the most meaningful
interpretation of shift and mask operations involving negative integers.

There are two types of integers:

Integers (:class:`int`)
:   These represent numbers in an unlimited range, subject to available (virtual)
    memory only. For the purpose of shift and mask operations, a binary
    representation is assumed, and negative numbers are represented in a variant of
    2's complement which gives the illusion of an infinite string of sign bits
    extending to the left.

Booleans (:class:`bool`)
:   These represent the truth values False and True. The two objects representing
    the values False and True are the only Boolean objects. The Boolean type is a
    subtype of the integer type, and Boolean values behave like the values 0 and 1,
    respectively, in almost all contexts, the exception being that when converted to
    a string, the strings "False" or "True" are returned, respectively.

#### :class:`numbers.Real` (:class:`float`)

These represent machine-level double precision floating-point numbers. You are
at the mercy of the underlying machine architecture (and C or Java
implementation) for the accepted range and handling of overflow. Python does not
support single-precision floating-point numbers; the savings in processor and
memory usage that are usually the reason for using these are dwarfed by the
overhead of using objects in Python, so there is no reason to complicate the
language with two kinds of floating-point numbers.

#### :class:`numbers.Complex` (:class:`complex`)

These represent complex numbers as a pair of machine-level double precision
floating-point numbers. The same caveats apply as for floating-point numbers.
The real and imaginary parts of a complex number z can be retrieved through
the read-only attributes z.real and z.imag.

### Sequences

These represent finite ordered sets indexed by non-negative numbers. The
built-in function :func:`len` returns the number of items of a sequence. When
the length of a sequence is *n*, the index set contains the numbers 0, 1,
..., *n*-1. Item *i* of sequence *a* is selected by a[i]. Some sequences,
including built-in sequences, interpret negative subscripts by adding the
sequence length. For example, a[-2] equals a[n-2], the second to last
item of sequence a with length n.

The resulting value must be a nonnegative integer less than the number of items
in the sequence. If it is not, an :exc:`IndexError` is raised.

Sequences also support slicing: a[start:stop] selects all items with index *k* such
that *start* <= *k* < *stop*. When used as an expression, a slice is a
sequence of the same type. The comment above about negative subscripts also applies
to negative slice positions.
Note that no error is raised if a slice position is less than zero or larger
than the length of the sequence.

If *start* is missing or :data:`None`, slicing behaves as if *start* was zero.
If *stop* is missing or None, slicing behaves as if *stop* was equal to
the length of the sequence.

Some sequences also support "extended slicing" with a third "step" parameter:
a[i:j:k] selects all items of *a* with index *x* where x = i + n\*k, *n*
>= 0 and *i* <= *x* < *j*.

Sequences are distinguished according to their mutability:

#### Immutable sequences

An object of an immutable sequence type cannot change once it is created. (If
the object contains references to other objects, these other objects may be
mutable and may be changed; however, the collection of objects directly
referenced by an immutable object cannot change.)

The following types are immutable sequences:

Strings
:   A string (:class:`str`) is a sequence of values that represent
    :dfn:`characters`, or more formally, *Unicode code points*.
    All the code points in the range 0 to 0x10FFFF can be
    represented in a string.

    Python doesn't have a dedicated *character* type.
    Instead, every code point in the string is represented as a string
    object with length 1.

    The built-in function :func:`ord`
    converts a code point from its string form to an integer in the
    range 0 to 0x10FFFF; :func:`chr` converts an integer in the range
    0 to 0x10FFFF to the corresponding length 1 string object.
    :meth:`str.encode` can be used to convert a :class:`str` to
    :class:`bytes` using the given text encoding, and
    :meth:`bytes.decode` can be used to achieve the opposite.

Tuples
:   The items of a :class:`tuple` are arbitrary Python objects. Tuples of two or
    more items are formed by comma-separated lists of expressions. A tuple
    of one item (a 'singleton') can be formed by affixing a comma to an
    expression (an expression by itself does not create a tuple, since
    parentheses must be usable for grouping of expressions). An empty
    tuple can be formed by an empty pair of parentheses.

Bytes
:   A :class:`bytes` object is an immutable array. The items are 8-bit bytes,
    represented by integers in the range 0 <= x < 256. Bytes literals
    (like b'abc') and the built-in :func:`bytes` constructor
    can be used to create bytes objects. Also, bytes objects can be
    decoded to strings via the :meth:`~bytes.decode` method.

#### Mutable sequences

Mutable sequences can be changed after they are created. The subscription and
slicing notations can be used as the target of assignment and :keyword:`del`
(delete) statements.

Note

The :mod:`collections` and :mod:`array` module provide
additional examples of mutable sequence types.

There are currently two intrinsic mutable sequence types:

Lists
:   The items of a list are arbitrary Python objects. Lists are formed by
    placing a comma-separated list of expressions in square brackets. (Note
    that there are no special cases needed to form lists of length 0 or 1.)

Byte Arrays
:   A bytearray object is a mutable array. They are created by the built-in
    :func:`bytearray` constructor. Aside from being mutable
    (and hence unhashable), byte arrays otherwise provide the same interface
    and functionality as immutable :class:`bytes` objects.

### Set types

These represent unordered, finite sets of unique, immutable objects. As such,
they cannot be indexed by any subscript. However, they can be iterated over, and
the built-in function :func:`len` returns the number of items in a set. Common
uses for sets are fast membership testing, removing duplicates from a sequence,
and computing mathematical operations such as intersection, union, difference,
and symmetric difference.

For set elements, the same immutability rules apply as for dictionary keys. Note
that numeric types obey the normal rules for numeric comparison: if two numbers
compare equal (e.g., 1 and 1.0), only one of them can be contained in a
set.

There are currently two intrinsic set types:

Sets
:   These represent a mutable set. They are created by the built-in :func:`set`
    constructor and can be modified afterwards by several methods, such as
    :meth:`~set.add`.

Frozen sets
:   These represent an immutable set. They are created by the built-in
    :func:`frozenset` constructor. As a frozenset is immutable and
    :term:`hashable`, it can be used again as an element of another set, or as
    a dictionary key.

### Mappings

These represent finite sets of objects indexed by arbitrary index sets. The
subscript notation a[k] selects the item indexed by k from the mapping
a; this can be used in expressions and as the target of assignments or
:keyword:`del` statements. The built-in function :func:`len` returns the number
of items in a mapping.

There are two intrinsic mapping types:

#### Dictionaries

These represent finite sets of objects indexed by nearly arbitrary values. The
only types of values not acceptable as keys are values containing lists or
dictionaries or other mutable types that are compared by value rather than by
object identity, the reason being that the efficient implementation of
dictionaries requires a key's hash value to remain constant. Numeric types used
for keys obey the normal rules for numeric comparison: if two numbers compare
equal (e.g., 1 and 1.0) then they can be used interchangeably to index
the same dictionary entry.

Dictionaries preserve insertion order, meaning that keys will be produced
in the same order they were added sequentially over the dictionary.
Replacing an existing key does not change the order, however removing a key
and re-inserting it will add it to the end instead of keeping its old place.

Dictionaries are mutable; they can be created by the {} notation (see
section :ref:`dict`).

The extension modules :mod:`dbm.ndbm` and :mod:`dbm.gnu` provide
additional examples of mapping types, as does the :mod:`collections`
module.

#### Frozen dictionaries

These represent an immutable dictionary. They are created by the built-in
:func:`frozendict` constructor. A frozendict is :term:`hashable` if all of
its keys and values are hashable, in which case it can be used as an element
of a set, or as a key in another mapping. :class:`!frozendict` is not a
subclass of :class:`dict`; it inherits directly from :class:`object`.

### Callable types

These are the types to which the function call operation (see section
:ref:`calls`) can be applied:

#### User-defined functions

A user-defined function object is created by a function definition (see
section :ref:`function`). It should be called with an argument list
containing the same number of items as the function's formal parameter
list.

##### Special read-only attributes

| Attribute | Meaning |
| --- | --- |
|  | A reference to the :class:`dictionary <dict>` that holds the function's builtins namespace. |
|  | A reference to the :class:`dictionary <dict>` that holds the function's :ref:`global variables <naming>` -- the global namespace of the module in which the function was defined. |
|  | None or a :class:`tuple` of cells that contain bindings for the names specified in the :attr:`~codeobject.co\_freevars` attribute of the function's :attr:`code object <function.\_\_code\_\_>`.  A cell object has the attribute cell\_contents. This can be used to get the value of the cell, as well as set the value. |

##### Special writable attributes

Most of these attributes check the type of the assigned value:

| Attribute | Meaning |
| --- | --- |
|  | The function's documentation string, or None if unavailable. |
|  | The function's name. See also: :attr:`\_\_name\_\_ attributes <definition.\_\_name\_\_>`. |
|  | The function's :term:`qualified name`. See also: :attr:`\_\_qualname\_\_ attributes <definition.\_\_qualname\_\_>`. |
|  | The name of the module the function was defined in, or None if unavailable. |
|  | A :class:`tuple` containing default :term:`parameter` values for those parameters that have defaults, or None if no parameters have a default value. |
|  | The :ref:`code object <code-objects>` representing the compiled function body. |
|  | The namespace supporting arbitrary function attributes. See also: :attr:`\_\_dict\_\_ attributes <object.\_\_dict\_\_>`. |
|  | A :class:`dictionary <dict>` containing annotations of :term:`parameters <parameter>`. The keys of the dictionary are the parameter names, and 'return' for the return annotation, if provided. See also: :attr:`object.\_\_annotations\_\_`. |
|  | The :term:`annotate function` for this function, or None if the function has no annotations. See :attr:`object.\_\_annotate\_\_`. |
|  | A :class:`dictionary <dict>` containing defaults for keyword-only :term:`parameters <parameter>`. |
|  | A :class:`tuple` containing the :ref:`type parameters <type-params>` of a :ref:`generic function <generic-functions>`. |

Function objects also support getting and setting arbitrary attributes, which
can be used, for example, to attach metadata to functions. Regular attribute
dot-notation is used to get and set such attributes.

Additional information about a function's definition can be retrieved from its
:ref:`code object <code-objects>`
(accessible via the :attr:`~function.\_\_code\_\_` attribute).

#### Instance methods

An instance method object combines a class, a class instance and any
callable object (normally a user-defined function).

Special read-only attributes:

|  |  |
| --- | --- |
|  | Refers to the class instance object to which the method is :ref:`bound <method-binding>` |
|  | Refers to the original :ref:`function object <user-defined-funcs>` |
|  | The method's documentation (same as :attr:`method.\_\_func\_\_.\_\_doc\_\_ <function.\_\_doc\_\_>`). A :class:`string <str>` if the original function had a docstring, else None. |
|  | The name of the method (same as :attr:`method.\_\_func\_\_.\_\_name\_\_ <function.\_\_name\_\_>`) |
|  | The name of the module the method was defined in, or None if unavailable. |

Methods also support accessing (but not setting) the arbitrary function
attributes on the underlying :ref:`function object <user-defined-funcs>`.

User-defined method objects may be created when getting an attribute of a
class (perhaps via an instance of that class), if that attribute is a
user-defined :ref:`function object <user-defined-funcs>` or a
:class:`classmethod` object.

When an instance method object is created by retrieving a user-defined
:ref:`function object <user-defined-funcs>` from a class via one of its
instances, its :attr:`~method.\_\_self\_\_` attribute is the instance, and the
method object is said to be *bound*. The new method's :attr:`~method.\_\_func\_\_`
attribute is the original function object.

When an instance method object is created by retrieving a :class:`classmethod`
object from a class or instance, its :attr:`~method.\_\_self\_\_` attribute is the
class itself, and its :attr:`~method.\_\_func\_\_` attribute is the function object
underlying the class method.

When an instance method object is called, the underlying function
(:attr:`~method.\_\_func\_\_`) is called, inserting the class instance
(:attr:`~method.\_\_self\_\_`) in front of the argument list. For instance, when
:class:`!C` is a class which contains a definition for a function
:meth:`!f`, and x is an instance of :class:`!C`, calling x.f(1) is
equivalent to calling C.f(x, 1).

When an instance method object is derived from a :class:`classmethod` object, the
"class instance" stored in :attr:`~method.\_\_self\_\_` will actually be the class
itself, so that calling either x.f(1) or C.f(1) is equivalent to
calling f(C,1) where f is the underlying function.

It is important to note that user-defined functions
which are attributes of a class instance are not converted to bound
methods; this *only* happens when the function is an attribute of the
class.

#### Generator functions

A function or method which uses the :keyword:`yield` statement (see section
:ref:`yield`) is called a :dfn:`generator function`. Such a function, when
called, always returns an :term:`iterator` object which can be used to
execute the body of the function: calling the iterator's
:meth:`iterator.\_\_next\_\_` method will cause the function to execute until
it provides a value using the :keyword:`!yield` statement. When the
function executes a :keyword:`return` statement or falls off the end, a
:exc:`StopIteration` exception is raised and the iterator will have
reached the end of the set of values to be returned.

#### Coroutine functions

A function or method which is defined using :keyword:`async def` is called
a :dfn:`coroutine function`. Such a function, when called, returns a
:term:`coroutine` object. It may contain :keyword:`await` expressions,
as well as :keyword:`async with` and :keyword:`async for` statements. See
also the :ref:`coroutine-objects` section.

#### Asynchronous generator functions

A function or method which is defined using :keyword:`async def` and
which uses the :keyword:`yield` statement is called a
:dfn:`asynchronous generator function`. Such a function, when called,
returns an :term:`asynchronous iterator` object which can be used in an
:keyword:`async for` statement to execute the body of the function.

Calling the asynchronous iterator's
:meth:`aiterator.\_\_anext\_\_ <object.\_\_anext\_\_>` method
will return an :term:`awaitable` which when awaited
will execute until it provides a value using the :keyword:`yield`
expression. When the function executes an empty :keyword:`return`
statement or falls off the end, a :exc:`StopAsyncIteration` exception
is raised and the asynchronous iterator will have reached the end of
the set of values to be yielded.

#### Built-in functions

A built-in function object is a wrapper around a C function. Examples of
built-in functions are :func:`len` and :func:`math.sin` (:mod:`math` is a
standard built-in module). The number and type of the arguments are
determined by the C function. Special read-only attributes:

- :attr:`!\_\_doc\_\_` is the function's documentation string, or None if
  unavailable. See :attr:`function.\_\_doc\_\_`.
- :attr:`!\_\_name\_\_` is the function's name. See :attr:`function.\_\_name\_\_`.
- :attr:`!\_\_self\_\_` is set to None (but see the next item).
- :attr:`!\_\_module\_\_` is the name of
  the module the function was defined in or None if unavailable.
  See :attr:`function.\_\_module\_\_`.

#### Built-in methods

This is really a different disguise of a built-in function, this time containing
an object passed to the C function as an implicit extra argument. An example of
a built-in method is alist.append(), assuming *alist* is a list object. In
this case, the special read-only attribute :attr:`!\_\_self\_\_` is set to the object
denoted by *alist*. (The attribute has the same semantics as it does with
:attr:`other instance methods <method.\_\_self\_\_>`.)

#### Classes

Classes are callable. These objects normally act as factories for new
instances of themselves, but variations are possible for class types that
override :meth:`~object.\_\_new\_\_`. The arguments of the call are passed to
:meth:`!\_\_new\_\_` and, in the typical case, to :meth:`~object.\_\_init\_\_` to
initialize the new instance.

#### Class Instances

Instances of arbitrary classes can be made callable by defining a
:meth:`~object.\_\_call\_\_` method in their class.

### Modules

Modules are a basic organizational unit of Python code, and are created by
the :ref:`import system <importsystem>` as invoked either by the
:keyword:`import` statement, or by calling
functions such as :func:`importlib.import\_module` and built-in
:func:`\_\_import\_\_`. A module object has a namespace implemented by a
:class:`dictionary <dict>` object (this is the dictionary referenced by the
:attr:`~function.\_\_globals\_\_`
attribute of functions defined in the module). Attribute references are
translated to lookups in this dictionary, e.g., m.x is equivalent to
m.\_\_dict\_\_["x"]. A module object does not contain the code object used
to initialize the module (since it isn't needed once the initialization is
done).

Attribute assignment updates the module's namespace dictionary, e.g.,
m.x = 1 is equivalent to m.\_\_dict\_\_["x"] = 1.

#### Import-related attributes on module objects

Module objects have the following attributes that relate to the
:ref:`import system <importsystem>`. When a module is created using the machinery associated
with the import system, these attributes are filled in based on the module's
:term:`spec <module spec>`, before the :term:`loader` executes and loads the
module.

To create a module dynamically rather than using the import system,
it's recommended to use :func:`importlib.util.module\_from\_spec`,
which will set the various import-controlled attributes to appropriate values.
It's also possible to use the :class:`types.ModuleType` constructor to create
modules directly, but this technique is more error-prone, as most attributes
must be manually set on the module object after it has been created when using
this approach.

Caution!

With the exception of :attr:`~module.\_\_name\_\_`, it is **strongly**
recommended that you rely on :attr:`~module.\_\_spec\_\_` and its attributes
instead of any of the other individual attributes listed in this subsection.
Note that updating an attribute on :attr:`!\_\_spec\_\_` will not update the
corresponding attribute on the module itself:

#### Other writable attributes on module objects

As well as the import-related attributes listed above, module objects also have
the following writable attributes:

#### Module dictionaries

Module objects also have the following special read-only attribute:

### Custom classes

Custom class types are typically created by class definitions (see section
:ref:`class`). A class has a namespace implemented by a dictionary object.
Class attribute references are translated to lookups in this dictionary, e.g.,
C.x is translated to C.\_\_dict\_\_["x"] (although there are a number of
hooks which allow for other means of locating attributes). When the attribute
name is not found there, the attribute search continues in the base classes.
This search of the base classes uses the C3 method resolution order which
behaves correctly even in the presence of 'diamond' inheritance structures
where there are multiple inheritance paths leading back to a common ancestor.
Additional details on the C3 MRO used by Python can be found at
:ref:`python\_2.3\_mro`.

When a class attribute reference (for class :class:`!C`, say) would yield a
class method object, it is transformed into an instance method object whose
:attr:`~method.\_\_self\_\_` attribute is :class:`!C`.
When it would yield a :class:`staticmethod` object,
it is transformed into the object wrapped by the static method
object. See section :ref:`descriptors` for another way in which attributes
retrieved from a class may differ from those actually contained in its
:attr:`~object.\_\_dict\_\_`.

Class attribute assignments update the class's dictionary, never the dictionary
of a base class.

A class object can be called (see above) to yield a class instance (see below).

#### Special attributes

| Attribute | Meaning |
| --- | --- |
|  | The class's name. See also: :attr:`\_\_name\_\_ attributes <definition.\_\_name\_\_>`. |
|  | The class's :term:`qualified name`. See also: :attr:`\_\_qualname\_\_ attributes <definition.\_\_qualname\_\_>`. |
|  | The name of the module in which the class was defined. |
|  | A :class:`mapping proxy <types.MappingProxyType>` providing a read-only view of the class's namespace. See also: :attr:`\_\_dict\_\_ attributes <object.\_\_dict\_\_>`. |
|  | A :class:`tuple` containing the class's bases. In most cases, for a class defined as class X(A, B, C), X.\_\_bases\_\_ will be exactly equal to (A, B, C). |
|  |  |
|  | The class's documentation string, or None if undefined. Not inherited by subclasses. |
|  | A dictionary containing :term:`variable annotations <variable annotation>` collected during class body execution. See also: :attr:`\_\_annotations\_\_ attributes <object.\_\_annotations\_\_>`.  For best practices on working with :attr:`~object.\_\_annotations\_\_`, please see :mod:`annotationlib`. Use :func:`annotationlib.get\_annotations` instead of accessing this attribute directly.  Warning  Accessing the :attr:`!\_\_annotations\_\_` attribute directly on a class object may return annotations for the wrong class, specifically in certain cases where the class, its base class, or a metaclass is defined under from \_\_future\_\_ import annotations. See :pep:`749 <749#pep749-metaclasses>` for details.  This attribute does not exist on certain builtin classes. On user-defined classes without \_\_annotations\_\_, it is an empty dictionary. |
|  | The :term:`annotate function` for this class, or None if the class has no annotations. See also: :attr:`\_\_annotate\_\_ attributes <object.\_\_annotate\_\_>`. |
|  | A :class:`tuple` containing the :ref:`type parameters <type-params>` of a :ref:`generic class <generic-classes>`. |
|  | A :class:`tuple` containing names of attributes of this class which are assigned through self.X from any function in its body. |
|  | The line number of the first line of the class definition, including decorators. Setting the :attr:`~type.\_\_module\_\_` attribute removes the :attr:`!\_\_firstlineno\_\_` item from the type's dictionary. |
|  | The :class:`tuple` of classes that are considered when looking for base classes during method resolution. |

#### Special methods

In addition to the special attributes described above, all Python classes also
have the following two methods available:

### Class instances

A class instance is created by calling a class object (see above). A class
instance has a namespace implemented as a dictionary which is the first place
in which attribute references are searched. When an attribute is not found
there, and the instance's class has an attribute by that name, the search
continues with the class attributes. If a class attribute is found that is a
user-defined function object, it is transformed into an instance method
object whose :attr:`~method.\_\_self\_\_` attribute is the instance. Static method and
class method objects are also transformed; see above under "Classes". See
section :ref:`descriptors` for another way in which attributes of a class
retrieved via its instances may differ from the objects actually stored in
the class's :attr:`~object.\_\_dict\_\_`. If no class attribute is found, and the
object's class has a :meth:`~object.\_\_getattr\_\_` method, that is called to satisfy
the lookup.

Attribute assignments and deletions update the instance's dictionary, never a
class's dictionary. If the class has a :meth:`~object.\_\_setattr\_\_` or
:meth:`~object.\_\_delattr\_\_` method, this is called instead of updating the instance
dictionary directly.

Class instances can pretend to be numbers, sequences, or mappings if they have
methods with certain special names. See section :ref:`specialnames`.

#### Special attributes

### I/O objects (also known as file objects)

A :term:`file object` represents an open file. Various shortcuts are
available to create file objects: the :func:`open` built-in function, and
also :func:`os.popen`, :func:`os.fdopen`, and the
:meth:`~socket.socket.makefile` method of socket objects (and perhaps by
other functions or methods provided by extension modules).

File objects implement common methods, listed below, to simplify usage in
generic code. They are expected to be :ref:`context-managers`.

The objects sys.stdin, sys.stdout and sys.stderr are
initialized to file objects corresponding to the interpreter's standard
input, output and error streams; they are all open in text mode and
therefore follow the interface defined by the :class:`io.TextIOBase`
abstract class.

### Internal types

A few types used internally by the interpreter are exposed to the user. Their
definitions may change with future versions of the interpreter, but they are
mentioned here for completeness.

#### Code objects

Code objects represent *byte-compiled* executable Python code, or :term:`bytecode`.
The difference between a code object and a function object is that the function
object contains an explicit reference to the function's globals (the module in
which it was defined), while a code object contains no context; also the default
argument values are stored in the function object, not in the code object
(because they represent values calculated at run-time). Unlike function
objects, code objects are immutable and contain no references (directly or
indirectly) to mutable objects.

##### Special read-only attributes

|  |  |
| --- | --- |
|  | The function name |
|  | The fully qualified function name |
|  | The total number of positional :term:`parameters <parameter>` (including positional-only parameters and parameters with default values) that the function has |
|  | The number of positional-only :term:`parameters <parameter>` (including arguments with default values) that the function has |
|  | The number of keyword-only :term:`parameters <parameter>` (including arguments with default values) that the function has |
|  | The number of :ref:`local variables <naming>` used by the function (including parameters) |
|  | A :class:`tuple` containing the names of the local variables in the function (starting with the parameter names) |
|  | A :class:`tuple` containing the names of :ref:`local variables <naming>` that are referenced from at least one :term:`nested scope` inside the function |
|  | A :class:`tuple` containing the names of :term:`free (closure) variables <closure variable>` that a :term:`nested scope` references in an outer scope. See also :attr:`function.\_\_closure\_\_`.  Note: references to global and builtin names are *not* included. |
|  | A string representing the sequence of :term:`bytecode` instructions in the function |
|  | A :class:`tuple` containing the literals used by the :term:`bytecode` in the function |
|  | A :class:`tuple` containing the names used by the :term:`bytecode` in the function |
|  | The name of the file from which the code was compiled |
|  | The line number of the first line of the function |
|  | The required stack size of the code object |
|  | An :class:`integer <int>` encoding a number of flags for the interpreter. |

The following flag bits are defined for :attr:`~codeobject.co\_flags`:
bit 0x04 is set if
the function uses the \*arguments syntax to accept an arbitrary number of
positional arguments; bit 0x08 is set if the function uses the
\*\*keywords syntax to accept arbitrary keyword arguments; bit 0x20 is set
if the function is a generator. See :ref:`inspect-module-co-flags` for details
on the semantics of each flags that might be present.

Future feature declarations (for example, from \_\_future\_\_ import division) also use bits
in :attr:`~codeobject.co\_flags` to indicate whether a code object was compiled with a
particular feature enabled. See :attr:`~\_\_future\_\_.\_Feature.compiler\_flag`.

Other bits in :attr:`~codeobject.co\_flags` are reserved for internal use.

If a code object represents a function and has a docstring,
the :data:`~inspect.CO\_HAS\_DOCSTRING` bit is set in :attr:`~codeobject.co\_flags`
and the first item in :attr:`~codeobject.co\_consts` is
the docstring of the function.

##### Methods on code objects

#### Frame objects

Frame objects represent execution frames. They may occur in
:ref:`traceback objects <traceback-objects>`,
and are also passed to registered trace functions.

##### Special read-only attributes

|  |  |
| --- | --- |
|  | Points to the previous stack frame (towards the caller), or None if this is the bottom stack frame |
|  | The :ref:`code object <code-objects>` being executed in this frame. Accessing this attribute raises an :ref:`auditing event <auditing>` object.\_\_getattr\_\_ with arguments obj and "f\_code". |
|  | The mapping used by the frame to look up :ref:`local variables <naming>`. If the frame refers to an :term:`optimized scope`, this may return a write-through proxy object. |
|  | The dictionary used by the frame to look up :ref:`global variables <naming>` |
|  | The dictionary used by the frame to look up :ref:`built-in (intrinsic) names <naming>` |
|  | The "precise instruction" of the frame object (this is an index into the :term:`bytecode` string of the :ref:`code object <code-objects>`) |
|  | The :term:`generator` or :term:`coroutine` object that owns this frame, or None if the frame is a normal function. |

##### Special writable attributes

|  |  |
| --- | --- |
|  | If not None, this is a function called for various events during code execution (this is used by debuggers). Normally an event is triggered for each new source line (see :attr:`~frame.f\_trace\_lines`). |
|  | Set this attribute to :const:`False` to disable triggering a tracing event for each source line. |
|  | Set this attribute to :const:`True` to allow per-opcode events to be requested. Note that this may lead to undefined interpreter behaviour if exceptions raised by the trace function escape to the function being traced. |
|  | The current line number of the frame -- writing to this from within a trace function jumps to the given line (only for the bottom-most frame). A debugger can implement a Jump command (aka Set Next Statement) by writing to this attribute. |

##### Frame object methods

Frame objects support one method:

#### Traceback objects

Traceback objects represent the stack trace of an :ref:`exception <tut-errors>`.
A traceback object
is implicitly created when an exception occurs, and may also be explicitly
created by calling :class:`types.TracebackType`.

For implicitly created tracebacks, when the search for an exception handler
unwinds the execution stack, at each unwound level a traceback object is
inserted in front of the current traceback. When an exception handler is
entered, the stack trace is made available to the program. (See section
:ref:`try`.) It is accessible as the third item of the
tuple returned by :func:`sys.exc\_info`, and as the
:attr:`~BaseException.\_\_traceback\_\_` attribute
of the caught exception.

When the program contains no suitable
handler, the stack trace is written (nicely formatted) to the standard error
stream; if the interpreter is interactive, it is also made available to the user
as :data:`sys.last\_traceback`.

For explicitly created tracebacks, it is up to the creator of the traceback
to determine how the :attr:`~traceback.tb\_next` attributes should be linked to
form a full stack trace.

Special read-only attributes:

|  |  |
| --- | --- |
|  | Points to the execution :ref:`frame <frame-objects>` of the current level.  Accessing this attribute raises an :ref:`auditing event <auditing>` object.\_\_getattr\_\_ with arguments obj and "tb\_frame". |
|  | Gives the line number where the exception occurred |
|  | Indicates the "precise instruction". |

The line number and last instruction in the traceback may differ from the
line number of its :ref:`frame object <frame-objects>` if the exception
occurred in a
:keyword:`try` statement with no matching except clause or with a
:keyword:`finally` clause.

#### Slice objects

Slice objects are used to represent slices for
:meth:`~object.\_\_getitem\_\_`
methods. They are also created by the built-in :func:`slice` function.

Special read-only attributes: :attr:`~slice.start` is the lower bound;
:attr:`~slice.stop` is the upper bound; :attr:`~slice.step` is the step
value; each is None if omitted. These attributes can have any type.

Slice objects support one method:

#### Static method objects

Static method objects provide a way of defeating the transformation of function
objects to method objects described above. A static method object is a wrapper
around any other object, usually a user-defined method object. When a static
method object is retrieved from a class or a class instance, the object actually
returned is the wrapped object, which is not subject to any further
transformation. Static method objects are also callable. Static method
objects are created by the built-in :func:`staticmethod` constructor.

#### Class method objects

A class method object, like a static method object, is a wrapper around another
object that alters the way in which that object is retrieved from classes and
class instances. The behaviour of class method objects upon such retrieval is
described above, under :ref:`"instance methods" <instance-methods>`. Class method objects are created
by the built-in :func:`classmethod` constructor.

## Special method names

A class can implement certain operations that are invoked by special syntax
(such as arithmetic operations or subscripting and slicing) by defining methods
with special names. This is Python's approach to :dfn:`operator overloading`,
allowing classes to define their own behavior with respect to language
operators. For instance, if a class defines a method named
:meth:`~object.\_\_getitem\_\_`,
and x is an instance of this class, then x[i] is roughly equivalent
to type(x).\_\_getitem\_\_(x, i). Except where mentioned, attempts to execute an
operation raise an exception when no appropriate method is defined (typically
:exc:`AttributeError` or :exc:`TypeError`).

Setting a special method to None indicates that the corresponding
operation is not available. For example, if a class sets
:meth:`~object.\_\_iter\_\_` to None, the class is not iterable, so calling
:func:`iter` on its instances will raise a :exc:`TypeError` (without
falling back to :meth:`~object.\_\_getitem\_\_`). [[2]](#footnote-2)

When implementing a class that emulates any built-in type, it is important that
the emulation only be implemented to the degree that it makes sense for the
object being modelled. For example, some sequences may work well with retrieval
of individual elements, but extracting a slice may not make sense.
(One example of this is the :ref:`NodeList <dom-nodelist-objects>` interface
in the W3C's Document Object Model.)

### Basic customization

### Customizing attribute access

The following methods can be defined to customize the meaning of attribute
access (use of, assignment to, or deletion of x.name) for class instances.

#### Customizing module attribute access

Special names \_\_getattr\_\_ and \_\_dir\_\_ can be also used to customize
access to module attributes. The \_\_getattr\_\_ function at the module level
should accept one argument which is the name of an attribute and return the
computed value or raise an :exc:`AttributeError`. If an attribute is
not found on a module object through the normal lookup, i.e.
:meth:`object.\_\_getattribute\_\_`, then \_\_getattr\_\_ is searched in
the module \_\_dict\_\_ before raising an :exc:`AttributeError`. If found,
it is called with the attribute name and the result is returned.

The \_\_dir\_\_ function should accept no arguments, and return an iterable of
strings that represents the names accessible on module. If present, this
function overrides the standard :func:`dir` search on a module.

For a more fine grained customization of the module behavior (setting
attributes, properties, etc.), one can set the \_\_class\_\_ attribute of
a module object to a subclass of :class:`types.ModuleType`. For example:

```
import sys
from types import ModuleType

class VerboseModule(ModuleType):
    def __repr__(self):
        return f'Verbose {self.__name__}'

    def __setattr__(self, attr, value):
        print(f'Setting {attr}...')
        super().__setattr__(attr, value)

sys.modules[__name__].__class__ = VerboseModule
```

Note

Defining module \_\_getattr\_\_ and setting module \_\_class\_\_ only
affect lookups made using the attribute access syntax -- directly accessing
the module globals (whether by code within the module, or via a reference
to the module's globals dictionary) is unaffected.

#### Implementing Descriptors

The following methods only apply when an instance of the class containing the
method (a so-called *descriptor* class) appears in an *owner* class (the
descriptor must be in either the owner's class dictionary or in the class
dictionary for one of its parents). In the examples below, "the attribute"
refers to the attribute whose name is the key of the property in the owner
class' :attr:`~object.\_\_dict\_\_`. The :class:`object` class itself does not
implement any of these protocols.

Instances of descriptors may also have the :attr:`!\_\_objclass\_\_` attribute
present:

#### Invoking Descriptors

In general, a descriptor is an object attribute with "binding behavior", one
whose attribute access has been overridden by methods in the descriptor
protocol: :meth:`~object.\_\_get\_\_`, :meth:`~object.\_\_set\_\_`, and
:meth:`~object.\_\_delete\_\_`. If any of
those methods are defined for an object, it is said to be a descriptor.

The default behavior for attribute access is to get, set, or delete the
attribute from an object's dictionary. For instance, a.x has a lookup chain
starting with a.\_\_dict\_\_['x'], then type(a).\_\_dict\_\_['x'], and
continuing through the base classes of type(a) excluding metaclasses.

However, if the looked-up value is an object defining one of the descriptor
methods, then Python may override the default behavior and invoke the descriptor
method instead. Where this occurs in the precedence chain depends on which
descriptor methods were defined and how they were called.

The starting point for descriptor invocation is a binding, a.x. How the
arguments are assembled depends on a:

Direct Call
:   The simplest and least common call is when user code directly invokes a
    descriptor method: x.\_\_get\_\_(a).

Instance Binding
:   If binding to an object instance, a.x is transformed into the call:
    type(a).\_\_dict\_\_['x'].\_\_get\_\_(a, type(a)).

Class Binding
:   If binding to a class, A.x is transformed into the call:
    A.\_\_dict\_\_['x'].\_\_get\_\_(None, A).

Super Binding
:   A dotted lookup such as super(A, a).x searches
    a.\_\_class\_\_.\_\_mro\_\_ for a base class B following A and then
    returns B.\_\_dict\_\_['x'].\_\_get\_\_(a, A). If not a descriptor, x is
    returned unchanged.

For instance bindings, the precedence of descriptor invocation depends on
which descriptor methods are defined. A descriptor can define any combination
of :meth:`~object.\_\_get\_\_`, :meth:`~object.\_\_set\_\_` and
:meth:`~object.\_\_delete\_\_`. If it does not
define :meth:`!\_\_get\_\_`, then accessing the attribute will return the descriptor
object itself unless there is a value in the object's instance dictionary. If
the descriptor defines :meth:`!\_\_set\_\_` and/or :meth:`!\_\_delete\_\_`, it is a data
descriptor; if it defines neither, it is a non-data descriptor. Normally, data
descriptors define both :meth:`!\_\_get\_\_` and :meth:`!\_\_set\_\_`, while non-data
descriptors have just the :meth:`!\_\_get\_\_` method. Data descriptors with
:meth:`!\_\_get\_\_` and :meth:`!\_\_set\_\_` (and/or :meth:`!\_\_delete\_\_`) defined
always override a redefinition in an
instance dictionary. In contrast, non-data descriptors can be overridden by
instances.

Python methods (including those decorated with
:deco:`staticmethod` and :deco:`classmethod`) are
implemented as non-data descriptors. Accordingly, instances can redefine and
override methods. This allows individual instances to acquire behaviors that
differ from other instances of the same class.

The :deco:`property` decorator is implemented as a data descriptor. Accordingly,
instances cannot override the behavior of a property.

#### \_\_slots\_\_

*\_\_slots\_\_* allow us to explicitly declare data members (like
properties) and deny the creation of :attr:`~object.\_\_dict\_\_` and *\_\_weakref\_\_*
(unless explicitly declared in *\_\_slots\_\_* or available in a parent.)

The space saved over using :attr:`~object.\_\_dict\_\_` can be significant.
Attribute lookup speed can be significantly improved as well.

Notes on using *\_\_slots\_\_*:

- When inheriting from a class without *\_\_slots\_\_*, the
  :attr:`~object.\_\_dict\_\_` and
  *\_\_weakref\_\_* attribute of the instances will always be accessible.
- Without a :attr:`~object.\_\_dict\_\_` variable, instances cannot be assigned new
  variables not
  listed in the *\_\_slots\_\_* definition. Attempts to assign to an unlisted
  variable name raises :exc:`AttributeError`. If dynamic assignment of new
  variables is desired, then add '\_\_dict\_\_' to the sequence of strings in
  the *\_\_slots\_\_* declaration.
- Without a *\_\_weakref\_\_* variable for each instance, classes defining
  *\_\_slots\_\_* do not support :mod:`weak references <weakref>` to its instances.
  If weak reference
  support is needed, then add '\_\_weakref\_\_' to the sequence of strings in the
  *\_\_slots\_\_* declaration.
- *\_\_slots\_\_* are implemented at the class level by creating :ref:`descriptors <descriptors>`
  for each variable name. As a result, class attributes
  cannot be used to set default values for instance variables defined by
  *\_\_slots\_\_*; otherwise, the class attribute would overwrite the descriptor
  assignment.
- The action of a *\_\_slots\_\_* declaration is not limited to the class
  where it is defined. *\_\_slots\_\_* declared in parents are available in
  child classes. However, instances of a child subclass will get a
  :attr:`~object.\_\_dict\_\_` and *\_\_weakref\_\_* unless the subclass also defines
  *\_\_slots\_\_* (which should only contain names of any *additional* slots).
- If a class defines a slot also defined in a base class, the instance variable
  defined by the base class slot is inaccessible (except by retrieving its
  descriptor directly from the base class). This renders the meaning of the
  program undefined. In the future, a check may be added to prevent this.
- :exc:`TypeError` will be raised if *\_\_slots\_\_* other than *\_\_dict\_\_* and
  *\_\_weakref\_\_* are defined for a class derived from a
  :c:member:`"variable-length" built-in type <PyTypeObject.tp\_itemsize>` such as
  :class:`int`, :class:`bytes`, and :class:`type`, except :class:`tuple`.
- Any non-string :term:`iterable` may be assigned to *\_\_slots\_\_*.
- If a :class:`dictionary <dict>` is used to assign *\_\_slots\_\_*, the dictionary
  keys will be used as the slot names. The values of the dictionary can be used
  to provide per-attribute docstrings that will be recognised by
  :func:`inspect.getdoc` and displayed in the output of :func:`help`.
- :attr:`~object.\_\_class\_\_` assignment works only if both classes have the
  same *\_\_slots\_\_*.
- :ref:`Multiple inheritance <multiple-inheritance>` with multiple slotted parent
  classes can be used,
  but only one parent is allowed to have attributes created by slots
  (the other bases must have empty slot layouts) - violations raise
  :exc:`TypeError`.
- If an :term:`iterator` is used for *\_\_slots\_\_* then a :term:`descriptor` is
  created for each
  of the iterator's values. However, the *\_\_slots\_\_* attribute will be an empty
  iterator.

### Customizing class creation

Whenever a class inherits from another class, :meth:`~object.\_\_init\_subclass\_\_` is
called on the parent class. This way, it is possible to write classes which
change the behavior of subclasses. This is closely related to class
decorators, but where class decorators only affect the specific class they're
applied to, \_\_init\_subclass\_\_ solely applies to future subclasses of the
class defining the method.

When a class is created, :meth:`!type.\_\_new\_\_` scans the class variables
and makes callbacks to those with a :meth:`~object.\_\_set\_name\_\_` hook.

#### Metaclasses

By default, classes are constructed using :func:`type`. The class body is
executed in a new namespace and the class name is bound locally to the
result of type(name, bases, namespace).

The class creation process can be customized by passing the metaclass
keyword argument in the class definition line, or by inheriting from an
existing class that included such an argument. In the following example,
both MyClass and MySubclass are instances of Meta:

```
class Meta(type):
    pass

class MyClass(metaclass=Meta):
    pass

class MySubclass(MyClass):
    pass
```

Any other keyword arguments that are specified in the class definition are
passed through to all metaclass operations described below.

When a class definition is executed, the following steps occur:

- MRO entries are resolved;
- the appropriate metaclass is determined;
- the class namespace is prepared;
- the class body is executed;
- the class object is created.

#### Resolving MRO entries

#### Determining the appropriate metaclass

The appropriate metaclass for a class definition is determined as follows:

- if no bases and no explicit metaclass are given, then :func:`type` is used;
- if an explicit metaclass is given and it is *not* an instance of
  :func:`type`, then it is used directly as the metaclass;
- if an instance of :func:`type` is given as the explicit metaclass, or
  bases are defined, then the most derived metaclass is used.

The most derived metaclass is selected from the explicitly specified
metaclass (if any) and the metaclasses (i.e. type(cls)) of all specified
base classes. The most derived metaclass is one which is a subtype of *all*
of these candidate metaclasses. If none of the candidate metaclasses meets
that criterion, then the class definition will fail with TypeError.

#### Preparing the class namespace

Once the appropriate metaclass has been identified, then the class namespace
is prepared. If the metaclass has a \_\_prepare\_\_ attribute, it is called
as namespace = metaclass.\_\_prepare\_\_(name, bases, \*\*kwds) (where the
additional keyword arguments, if any, come from the class definition). The
\_\_prepare\_\_ method should be implemented as a
:func:`classmethod <classmethod>`. The
namespace returned by \_\_prepare\_\_ is passed in to \_\_new\_\_, but when
the final class object is created the namespace is copied into a new dict.

If the metaclass has no \_\_prepare\_\_ attribute, then the class namespace
is initialised as an empty ordered mapping.

#### Executing the class body

The class body is executed (approximately) as
exec(body, globals(), namespace). The key difference from a normal
call to :func:`exec` is that lexical scoping allows the class body (including
any methods) to reference names from the current and outer scopes when the
class definition occurs inside a function.

However, even when the class definition occurs inside the function, methods
defined inside the class still cannot see names defined at the class scope.
Class variables must be accessed through the first parameter of instance or
class methods, or through the implicit lexically scoped \_\_class\_\_ reference
described in the next section.

#### Creating the class object

Once the class namespace has been populated by executing the class body,
the class object is created by calling
metaclass(name, bases, namespace, \*\*kwds) (the additional keywords
passed here are the same as those passed to \_\_prepare\_\_).

This class object is the one that will be referenced by the zero-argument
form of :func:`super`. \_\_class\_\_ is an implicit closure reference
created by the compiler if any methods in a class body refer to either
\_\_class\_\_ or super. This allows the zero argument form of
:func:`super` to correctly identify the class being defined based on
lexical scoping, while the class or instance that was used to make the
current call is identified based on the first argument passed to the method.

When using the default metaclass :class:`type`, or any metaclass that ultimately
calls type.\_\_new\_\_, the following additional customization steps are
invoked after creating the class object:

1. The type.\_\_new\_\_ method collects all of the attributes in the class
   namespace that define a :meth:`~object.\_\_set\_name\_\_` method;
2. Those \_\_set\_name\_\_ methods are called with the class
   being defined and the assigned name of that particular attribute;
3. The :meth:`~object.\_\_init\_subclass\_\_` hook is called on the
   immediate parent of the new class in its method resolution order.

After the class object is created, it is passed to the class decorators
included in the class definition (if any) and the resulting object is bound
in the local namespace as the defined class.

When a new class is created by type.\_\_new\_\_, the object provided as the
namespace parameter is copied to a new ordered mapping and the original
object is discarded. The new copy is wrapped in a read-only proxy, which
becomes the :attr:`~type.\_\_dict\_\_` attribute of the class object.

#### Uses for metaclasses

The potential uses for metaclasses are boundless. Some ideas that have been
explored include enum, logging, interface checking, automatic delegation,
automatic property creation, proxies, frameworks, and automatic resource
locking/synchronization.

### Customizing instance and subclass checks

The following methods are used to override the default behavior of the
:func:`isinstance` and :func:`issubclass` built-in functions.

In particular, the metaclass :class:`abc.ABCMeta` implements these methods in
order to allow the addition of Abstract Base Classes (ABCs) as "virtual base
classes" to any class or type (including built-in types), including other
ABCs.

Note that these methods are looked up on the type (metaclass) of a class. They
cannot be defined as class methods in the actual class. This is consistent with
the lookup of special methods that are called on instances, only in this
case the instance is itself a class.

### Emulating generic types

When using :term:`type annotations<annotation>`, it is often useful to
*parameterize* a :term:`generic type` using Python's square-brackets notation.
For example, the annotation list[int] might be used to signify a
:class:`list` in which all the elements are of type :class:`int`.

A class can *generally* only be parameterized if it defines the special
class method \_\_class\_getitem\_\_().

#### The purpose of *\_\_class\_getitem\_\_*

The purpose of :meth:`~object.\_\_class\_getitem\_\_` is to allow runtime
parameterization of standard-library generic classes in order to more easily
apply :term:`type hints<type hint>` to these classes.

To implement custom generic classes that can be parameterized at runtime and
understood by static type-checkers, users should either inherit from a standard
library class that already implements :meth:`~object.\_\_class\_getitem\_\_`, or
inherit from :class:`typing.Generic`, which has its own implementation of
\_\_class\_getitem\_\_().

Custom implementations of :meth:`~object.\_\_class\_getitem\_\_` on classes defined
outside of the standard library may not be understood by third-party
type-checkers such as mypy. Using \_\_class\_getitem\_\_() on any class for
purposes other than type hinting is discouraged.

#### *\_\_class\_getitem\_\_* versus *\_\_getitem\_\_*

Usually, the :ref:`subscription<subscriptions>` of an object using square
brackets will call the :meth:`~object.\_\_getitem\_\_` instance method defined on
the object's class. However, if the object being subscribed is itself a class,
the class method :meth:`~object.\_\_class\_getitem\_\_` may be called instead.
\_\_class\_getitem\_\_() should return a :ref:`GenericAlias<types-genericalias>`
object if it is properly defined.

Presented with the :term:`expression` obj[x], the Python interpreter
follows something like the following process to decide whether
:meth:`~object.\_\_getitem\_\_` or :meth:`~object.\_\_class\_getitem\_\_` should be
called:

```
from inspect import isclass

def subscribe(obj, x):
    """Return the result of the expression 'obj[x]'"""

    class_of_obj = type(obj)

    # If the class of obj defines __getitem__,
    # call class_of_obj.__getitem__(obj, x)
    if hasattr(class_of_obj, '__getitem__'):
        return class_of_obj.__getitem__(obj, x)

    # Else, if obj is a class and defines __class_getitem__,
    # call obj.__class_getitem__(x)
    elif isclass(obj) and hasattr(obj, '__class_getitem__'):
        return obj.__class_getitem__(x)

    # Else, raise an exception
    else:
        raise TypeError(
            f"'{class_of_obj.__name__}' object is not subscriptable"
        )
```

In Python, all classes are themselves instances of other classes. The class of
a class is known as that class's :term:`metaclass`, and most classes have the
:class:`type` class as their metaclass. :class:`type` does not define
:meth:`~object.\_\_getitem\_\_`, meaning that expressions such as list[int],
dict[str, float] and tuple[str, bytes] all result in
:meth:`~object.\_\_class\_getitem\_\_` being called:

```
>>> # list has class "type" as its metaclass, like most classes:
>>> type(list)
<class 'type'>
>>> type(dict) == type(list) == type(tuple) == type(str) == type(bytes)
True
>>> # "list[int]" calls "list.__class_getitem__(int)"
>>> list[int]
list[int]
>>> # list.__class_getitem__ returns a GenericAlias object:
>>> type(list[int])
<class 'types.GenericAlias'>
```

However, if a class has a custom metaclass that defines
:meth:`~object.\_\_getitem\_\_`, subscribing the class may result in different
behaviour. An example of this can be found in the :mod:`enum` module:

```
>>> from enum import Enum
>>> class Menu(Enum):
...     """A breakfast menu"""
...     SPAM = 'spam'
...     BACON = 'bacon'
...
>>> # Enum classes have a custom metaclass:
>>> type(Menu)
<class 'enum.EnumMeta'>
>>> # EnumMeta defines __getitem__,
>>> # so __class_getitem__ is not called,
>>> # and the result is not a GenericAlias object:
>>> Menu['SPAM']
<Menu.SPAM: 'spam'>
>>> type(Menu['SPAM'])
<enum 'Menu'>
```

### Emulating callable objects

### Emulating container types

The following methods can be defined to implement container objects. None of them
are provided by the :class:`object` class itself. Containers usually are
:term:`sequences <sequence>` (such as :class:`lists <list>` or
:class:`tuples <tuple>`) or :term:`mappings <mapping>` (like
:term:`dictionaries <dictionary>`),
but can represent other containers as well. The first set of methods is used
either to emulate a sequence or to emulate a mapping; the difference is that for
a sequence, the allowable keys should be the integers *k* for which 0 <= k < N where *N* is the length of the sequence, or :class:`slice` objects, which define a
range of items. It is also recommended that mappings provide the methods
:meth:`!keys`, :meth:`!values`, :meth:`!items`, :meth:`!get`, :meth:`!clear`,
:meth:`!setdefault`, :meth:`!pop`, :meth:`!popitem`, :meth:`!copy`, and
:meth:`!update` behaving similar to those for Python's standard :class:`dictionary <dict>`
objects. The :mod:`collections.abc` module provides a
:class:`~collections.abc.MutableMapping`
:term:`abstract base class` to help create those methods from a base set of
:meth:`~object.\_\_getitem\_\_`, :meth:`~object.\_\_setitem\_\_`,
:meth:`~object.\_\_delitem\_\_`, and :meth:`!keys`.

Mutable sequences should provide methods
:meth:`~sequence.append`, :meth:`~sequence.clear`, :meth:`~sequence.count`,
:meth:`~sequence.extend`, :meth:`~sequence.index`, :meth:`~sequence.insert`,
:meth:`~sequence.pop`, :meth:`~sequence.remove`, and :meth:`~sequence.reverse`,
like Python standard :class:`list` objects.
Finally, sequence types should implement addition (meaning concatenation) and
multiplication (meaning repetition) by defining the methods
:meth:`~object.\_\_add\_\_`, :meth:`~object.\_\_radd\_\_`, :meth:`~object.\_\_iadd\_\_`,
:meth:`~object.\_\_mul\_\_`, :meth:`~object.\_\_rmul\_\_` and :meth:`~object.\_\_imul\_\_`
described below; they should not define other numerical
operators.

It is recommended that both mappings and sequences implement the
:meth:`~object.\_\_contains\_\_` method to allow efficient use of the in
operator; for
mappings, in should search the mapping's keys; for sequences, it should
search through the values. It is further recommended that both mappings and
sequences implement the :meth:`~object.\_\_iter\_\_` method to allow efficient iteration
through the container; for mappings, :meth:`!\_\_iter\_\_` should iterate
through the object's keys; for sequences, it should iterate through the values.

The membership test operators (:keyword:`in` and :keyword:`not in`) are normally
implemented as an iteration through a container. However, container objects can
supply the following special method with a more efficient implementation, which
also does not require the object be iterable.

### Emulating numeric types

The following methods can be defined to emulate numeric objects. Methods
corresponding to operations that are not supported by the particular kind of
number implemented (e.g., bitwise operations for non-integral numbers) should be
left undefined.

### With Statement Context Managers

A :dfn:`context manager` is an object that defines the runtime context to be
established when executing a :keyword:`with` statement. The context manager
handles the entry into, and the exit from, the desired runtime context for the
execution of the block of code. Context managers are normally invoked using the
:keyword:`!with` statement (described in section :ref:`with`), but can also be
used by directly invoking their methods.

Typical uses of context managers include saving and restoring various kinds of
global state, locking and unlocking resources, closing opened files, etc.

For more information on context managers, see :ref:`typecontextmanager`.
The :class:`object` class itself does not provide the context manager methods.

### Customizing positional arguments in class pattern matching

When using a class name in a pattern, positional arguments in the pattern are not
allowed by default, i.e. case MyClass(x, y) is typically invalid without special
support in MyClass. To be able to use that kind of pattern, the class needs to
define a *\_\_match\_args\_\_* attribute.

For example, if MyClass.\_\_match\_args\_\_ is ("left", "center", "right") that means
that case MyClass(x, y) is equivalent to case MyClass(left=x, center=y). Note
that the number of arguments in the pattern must be smaller than or equal to the number
of elements in *\_\_match\_args\_\_*; if it is larger, the pattern match attempt will raise
a :exc:`TypeError`.

### Emulating buffer types

The :ref:`buffer protocol <bufferobjects>` provides a way for Python
objects to expose efficient access to a low-level memory array. This protocol
is implemented by builtin types such as :class:`bytes` and :class:`memoryview`,
and third-party libraries may define additional buffer types.

While buffer types are usually implemented in C, it is also possible to
implement the protocol in Python.

### Annotations

Functions, classes, and modules may contain :term:`annotations <annotation>`,
which are a way to associate information (usually :term:`type hints <type hint>`)
with a symbol.

### Special method lookup

For custom classes, implicit invocations of special methods are only guaranteed
to work correctly if defined on an object's type, not in the object's instance
dictionary. That behaviour is the reason why the following code raises an
exception:

```
>>> class C:
...     pass
...
>>> c = C()
>>> c.__len__ = lambda: 5
>>> len(c)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: object of type 'C' has no len()
```

The rationale behind this behaviour lies with a number of special methods such
as :meth:`~object.\_\_hash\_\_` and :meth:`~object.\_\_repr\_\_` that are implemented
by all objects,
including type objects. If the implicit lookup of these methods used the
conventional lookup process, they would fail when invoked on the type object
itself:

```
>>> 1 .__hash__() == hash(1)
True
>>> int.__hash__() == hash(int)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: descriptor '__hash__' of 'int' object needs an argument
```

Incorrectly attempting to invoke an unbound method of a class in this way is
sometimes referred to as 'metaclass confusion', and is avoided by bypassing
the instance when looking up special methods:

```
>>> type(1).__hash__(1) == hash(1)
True
>>> type(int).__hash__(int) == hash(int)
True
```

In addition to bypassing any instance attributes in the interest of
correctness, implicit special method lookup generally also bypasses the
:meth:`~object.\_\_getattribute\_\_` method even of the object's metaclass:

```
>>> class Meta(type):
...     def __getattribute__(*args):
...         print("Metaclass getattribute invoked")
...         return type.__getattribute__(*args)
...
>>> class C(object, metaclass=Meta):
...     def __len__(self):
...         return 10
...     def __getattribute__(*args):
...         print("Class getattribute invoked")
...         return object.__getattribute__(*args)
...
>>> c = C()
>>> c.__len__()                 # Explicit lookup via instance
Class getattribute invoked
10
>>> type(c).__len__(c)          # Explicit lookup via type
Metaclass getattribute invoked
10
>>> len(c)                      # Implicit lookup
10
```

Bypassing the :meth:`~object.\_\_getattribute\_\_` machinery in this fashion
provides significant scope for speed optimisations within the
interpreter, at the cost of some flexibility in the handling of
special methods (the special method *must* be set on the class
object itself in order to be consistently invoked by the interpreter).

## Coroutines

### Awaitable Objects

An :term:`awaitable` object generally implements an :meth:`~object.\_\_await\_\_` method.
:term:`Coroutine objects <coroutine>` returned from :keyword:`async def` functions
are awaitable.

Note

The :term:`generator iterator` objects returned from generators
decorated with :func:`types.coroutine`
are also awaitable, but they do not implement :meth:`~object.\_\_await\_\_`.

### Coroutine Objects

:term:`Coroutine objects <coroutine>` are :term:`awaitable` objects.
A coroutine's execution can be controlled by calling :meth:`~object.\_\_await\_\_` and
iterating over the result. When the coroutine has finished executing and
returns, the iterator raises :exc:`StopIteration`, and the exception's
:attr:`~StopIteration.value` attribute holds the return value. If the
coroutine raises an exception, it is propagated by the iterator. Coroutines
should not directly raise unhandled :exc:`StopIteration` exceptions.

Coroutines also have the methods listed below, which are analogous to
those of generators (see :ref:`generator-methods`). However, unlike
generators, coroutines do not directly support iteration.

Coroutines are :ref:`generic <generics>` over the types of their yield, send,
and return values, respectively.

### Asynchronous Iterators

An *asynchronous iterator* can call asynchronous code in
its \_\_anext\_\_ method.

Asynchronous iterators can be used in an :keyword:`async for` statement.

The :class:`object` class itself does not provide these methods.

An example of an asynchronous iterable object:

```
class Reader:
    async def readline(self):
        ...

    def __aiter__(self):
        return self

    async def __anext__(self):
        val = await self.readline()
        if val == b'':
            raise StopAsyncIteration
        return val
```

### Asynchronous Context Managers

An *asynchronous context manager* is a *context manager* that is able to
suspend execution in its \_\_aenter\_\_ and \_\_aexit\_\_ methods.

Asynchronous context managers can be used in an :keyword:`async with` statement.

The :class:`object` class itself does not provide these methods.

An example of an asynchronous context manager class:

```
class AsyncContextManager:
    async def __aenter__(self):
        await log('entering context')

    async def __aexit__(self, exc_type, exc, tb):
        await log('exiting context')
```

Footnotes

[[1](#footnote-reference-1)]

It *is* possible in some cases to change an object's type, under certain
controlled conditions. It generally isn't a good idea though, since it can
lead to some very strange behaviour if it is handled incorrectly.


[[2](#footnote-reference-2)]

The :meth:`~object.\_\_hash\_\_`, :meth:`~object.\_\_iter\_\_`,
:meth:`~object.\_\_reversed\_\_`, :meth:`~object.\_\_contains\_\_`,
:meth:`~object.\_\_class\_getitem\_\_` and :meth:`~os.PathLike.\_\_fspath\_\_`
methods have special handling for this. Others
will still raise a :exc:`TypeError`, but may do so by relying on
the behavior that None is not callable.


[3]

"Does not support" here means that the class has no such method, or
the method returns :data:`NotImplemented`. Do not set the method to
None if you want to force fallback to the right operand's reflected
method—that will instead have the opposite effect of explicitly
*blocking* such fallback.


[4]

For operands of the same type, it is assumed that if the non-reflected method
(such as :meth:`~object.\_\_add\_\_`) fails then the operation is not supported, which is why the
reflected method is not called.


[5]

If the right operand's type is a subclass of the left operand's type, the
reflected method having precedence allows subclasses to override their ancestors'
operations.
