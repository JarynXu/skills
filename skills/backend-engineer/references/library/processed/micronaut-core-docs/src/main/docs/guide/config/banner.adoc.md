> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/config/banner.adoc`  
> Upstream Git blob: `e9f11f8fb12538b0994d74a00bdf5422c2fc109b`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

Since Micronaut framework 2.3 a banner is shown when the application starts. It is enabled by default, and it also shows the Micronaut version.

```shell,subs="attributes"
$ ./gradlew run
 __  __ _                                  _
|  \/  (_) ___ _ __ ___  _ __   __ _ _   _| |_
| |\/| | |/ __| '__/ _ \| '_ \ / _` | | | | __|
| |  | | | (__| | | (_) | | | | (_| | |_| | |_
|_|  |_|_|\___|_|  \___/|_| |_|\__,_|\__,_|\__|
  Micronaut ({version})

17:07:22.997 [main] INFO  io.micronaut.runtime.Micronaut - Startup completed in 611ms. Server Running: http://localhost:8080
```

To customize the banner with your own ASCII Art (just plain ASCII at this moment), create the file `src/main/resources/micronaut-banner.txt` and it will be used instead.

To disable it, modify your `Application` class:

```java
public class Application {

    public static void main(String[] args) {
        Micronaut.build(args)
                 .banner(false) // <1>
                 .start();
    }
}
```
<1> Disable the banner
