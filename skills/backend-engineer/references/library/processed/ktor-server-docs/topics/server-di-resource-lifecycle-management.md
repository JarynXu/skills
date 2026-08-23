> **Offline teaching derivative**  
> Source: `ktorio/ktor-documentation@5803616c32b5f16050a8b1ae4653afa21603796e`  
> Upstream path: `topics/server-di-resource-lifecycle-management.md`  
> Upstream Git blob: `25661b3791dd68235998cef719f498bc25d3f2fb`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[//]: # (title: Resource lifecycle management)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>Required dependencies</b>: <code>io.ktor:ktor-server-di</code>
</p>
<var name="example_name" value="server-di"/>
<include from="lib.topic" element-id="download_example" />
</tldr>

The [dependency injection (DI) plugin](server-dependency-injection.md) handles lifecycle and cleanup automatically when the application shuts down.

### AutoCloseable support

By default, any dependency that implements `AutoCloseable` is automatically closed when your application stops:

```kotlin
class DatabaseConnection : AutoCloseable {
  override fun close() {
    // Close connections, release resources
  }
}

dependencies {
  provide<DatabaseConnection> { DatabaseConnection() }
}
```

### Custom cleanup logic

You can define custom cleanup logic by specifying a `cleanup` function:

```kotlin
dependencies {
  provide<ResourceManager> { ResourceManagerImpl() } cleanup { manager ->
    manager.releaseResources()
  }
}
```

### Scoped cleanup with key

Use `key` to manage named resources and their cleanup:

```kotlin
dependencies {
  key<Closer>("second") {
    provide { CustomCloser() }
    cleanup { it.closeMe() }
  }
}
```

Dependencies are cleaned up in reverse order of declaration to ensure proper teardown.
