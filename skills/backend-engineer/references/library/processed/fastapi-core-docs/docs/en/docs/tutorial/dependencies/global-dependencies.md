> **Offline teaching derivative**  
> Source: `fastapi/fastapi@c3f316b7e814667e8ee81e03a7330d00ee61e45c`  
> Upstream path: `docs/en/docs/tutorial/dependencies/global-dependencies.md`  
> Upstream Git blob: `e02ac14db2e56167ee61f28abade45f082554953`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Global Dependencies { #global-dependencies }

For some types of applications you might want to add dependencies to the whole application.

Similar to the way you can [add `dependencies` to the *path operation decorators*](dependencies-in-path-operation-decorators.md), you can add them to the `FastAPI` application.

In that case, they will be applied to all the *path operations* in the application:

{* ../../docs_src/dependencies/tutorial012_an_py310.py hl[17] *}


And all the ideas in the section about [adding `dependencies` to the *path operation decorators*](dependencies-in-path-operation-decorators.md) still apply, but in this case, to all of the *path operations* in the app.

## Dependencies for groups of *path operations* { #dependencies-for-groups-of-path-operations }

Later, when reading about how to structure bigger applications ([Bigger Applications - Multiple Files](../../tutorial/bigger-applications.md)), possibly with multiple files, you will learn how to declare a single `dependencies` parameter for a group of *path operations*.
