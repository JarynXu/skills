> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/process-monitoring.adoc`  
> Upstream Git blob: `2a0f73b5cc478803926c163e72a25eb213c0edd0`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[actuator.process-monitoring]]
# Process Monitoring

In the `spring-boot` module, you can find two classes to create files that are often useful for process monitoring:

* javadoc:org.springframework.boot.context.ApplicationPidFileWriter[] creates a file that contains the application PID (by default, in the application directory with a file name of `application.pid`).
* javadoc:org.springframework.boot.web.server.context.WebServerPortFileWriter[] creates a file (or files) that contain the ports of the running web server (by default, in the application directory with a file name of `application.port`).

By default, these writers are not activated, but you can enable them:

* [actuator/process-monitoring.adoc#actuator.process-monitoring.configuration](actuator/process-monitoring.adoc#actuator.process-monitoring.configuration)
* [actuator/process-monitoring.adoc#actuator.process-monitoring.programmatically](actuator/process-monitoring.adoc#actuator.process-monitoring.programmatically)


[[actuator.process-monitoring.configuration]]
## Extending Configuration

In the `META-INF/spring.factories` file, you can activate the listener (or listeners) that writes a PID file:

```
org.springframework.context.ApplicationListener=\
org.springframework.boot.context.ApplicationPidFileWriter,\
org.springframework.boot.web.server.context.WebServerPortFileWriter
```


[[actuator.process-monitoring.programmatically]]
## Programmatically Enabling Process Monitoring

You can also activate a listener by invoking the `SpringApplication.addListeners(...)` method and passing the appropriate javadoc:java.io.Writer[] object.
This method also lets you customize the file name and path in the javadoc:java.io.Writer[] constructor.
