> **Offline teaching derivative**  
> Source: `spring-projects/spring-boot@c329ffa25dc160a90ebe5e4b006ad4cdf89d8683`  
> Upstream path: `documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/internationalization.adoc`  
> Upstream Git blob: `a0e15b4862cbd3fad3720cfab9a828d19a586f6c`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[features.internationalization]]
# Internationalization

Spring Boot supports localized messages so that your application can cater to users of different language preferences.
By default, Spring Boot looks for the presence of a `messages` resource bundle at the root of the classpath.

NOTE: The auto-configuration applies when the default properties file for the configured resource bundle is available (`messages.properties` by default).
If your resource bundle contains only language-specific properties files, you are required to add the default.
If no properties file is found that matches any of the configured base names, there will be no auto-configured javadoc:org.springframework.context.MessageSource[].

The basename of the resource bundle as well as several other attributes can be configured using the `spring.messages` namespace, as shown in the following example:

[configprops,yaml]
```
spring:
  messages:
    basename: "messages, config.i18n.messages"
    common-messages: "classpath:my-common-messages.properties"
    fallback-to-system-locale: false
```

TIP: The configprop:spring.messages.basename[] property supports a list of locations, either a package qualifier or a resource resolved from the classpath root.
The configprop:spring.messages.common-messages[] property supports a list of property file resources.

See javadoc:org.springframework.boot.autoconfigure.context.MessageSourceProperties[] for more supported options.
