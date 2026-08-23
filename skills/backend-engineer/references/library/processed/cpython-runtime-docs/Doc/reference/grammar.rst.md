> **Offline teaching derivative**  
> Source: `python/cpython@526b2e0ede898f219a26014ef97e8914194ea2d7`  
> Upstream path: `Doc/reference/grammar.rst`  
> Upstream Git blob: `0ce8e42ddf3b0c0dd1f4d1e2f9e4b885685e7c00`  
> Transform: `rst-to-html-to-markdown:docutils+markdownify`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Full Grammar specification

This is the full Python grammar, derived directly from the grammar
used to generate the CPython parser (see :source:`Grammar/python.gram`).
The version here omits details related to code generation and
error recovery.

The notation used here is the same as in the preceding docs,
and is described in the :ref:`notation <notation>` section,
except for an extra complication:

- ~ ("cut"): commit to the current alternative; fail the rule
  if the alternative fails to parse

  Python mainly uses cuts for optimizations or improved error
  messages. They often appear to be useless in the listing below.

  Cuts currently don't appear inside parentheses, brackets, lookaheads
  and similar.
  Their behavior in these contexts is deliberately left unspecified.
