> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/enabling.adoc`  
> Upstream Git blob: `42de3196240ce5883d5235f3658a261fca29a13f`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[actuator.enabling]]
# Enabling Production-ready Features

The {code-spring-boot}/module/spring-boot-actuator[`spring-boot-actuator`] module provides all of Spring Boot's production-ready features.
The recommended way to enable the features is to add a dependency on the `spring-boot-starter-actuator` starter.

.Definition of Actuator
****
An actuator is a manufacturing term that refers to a mechanical device for moving or controlling something.
Actuators can generate a large amount of motion from a small change.
****

To add the actuator to a Maven-based project, add the following starter dependency:

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-actuator</artifactId>
	</dependency>
</dependencies>
```

For Gradle, use the following declaration:

```gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-actuator'
}
```
