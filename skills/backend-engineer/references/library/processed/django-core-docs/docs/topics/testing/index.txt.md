> **Offline teaching derivative**  
> Source: `django/django@03988c5a5ba248c3b9b11ea96fd4fda5e98849aa`  
> Upstream path: `docs/topics/testing/index.txt`  
> Upstream Git blob: `ef96895fb722a384f02a262dac2dc2f678a54d74`  
> Transform: `plain-text-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

=================
Testing in Django
=================

Automated testing is an extremely useful bug-killing tool for the modern
web developer. You can use a collection of tests -- a **test suite** -- to
solve, or avoid, a number of problems:

* When you're writing new code, you can use tests to validate your code
  works as expected.

* When you're refactoring or modifying old code, you can use tests to
  ensure your changes haven't affected your application's behavior
  unexpectedly.

Testing a web application is a complex task, because a web application is made
of several layers of logic -- from HTTP-level request handling, to form
validation and processing, to template rendering. With Django's test-execution
framework and assorted utilities, you can simulate requests, insert test data,
inspect your application's output and generally verify your code is doing what
it should be doing.

The preferred way to write tests in Django is using the :mod:`unittest` module
built-in to the Python standard library. This is covered in detail in the
:doc:`/topics/testing/overview` document.

You can also use any *other* Python test framework; Django provides an API and
tools for that kind of integration. They are described in the
:ref:`other-testing-frameworks` section of :doc:`/topics/testing/advanced`.

.. toctree::
   :maxdepth: 1

   overview
   tools
   advanced
