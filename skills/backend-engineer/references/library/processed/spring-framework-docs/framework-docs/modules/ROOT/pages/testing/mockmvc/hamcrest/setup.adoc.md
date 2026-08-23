> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/setup.adoc`  
> Upstream Git blob: `eeaa1951bd38b51e4646f1666a3cfb57ae323cdf`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-setup]]
# Configuring MockMvc

MockMvc can be setup in one of two ways. One is to point directly to the controllers you
want to test and programmatically configure Spring MVC infrastructure. The second is to
point to Spring configuration with Spring MVC and controller infrastructure in it.

TIP: For a comparison of those two modes, check [Setup Options](testing/mockmvc/setup-options.adoc).

To set up MockMvc for testing a specific controller, use the following:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	class MyWebTests {

		MockMvc mockMvc;

		@BeforeEach
		void setup() {
			this.mockMvc = MockMvcBuilders.standaloneSetup(new AccountController()).build();
		}

		// ...

	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	class MyWebTests {

		lateinit var mockMvc : MockMvc

		@BeforeEach
		fun setup() {
			mockMvc = MockMvcBuilders.standaloneSetup(AccountController()).build()
		}

		// ...

	}
```
======

Or you can also use this setup when testing through the
[WebTestClient](testing/webtestclient.adoc#webtestclient-controller-config) which delegates to the same builder
as shown above.

To set up MockMvc through Spring configuration, use the following:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	@SpringJUnitWebConfig(locations = "my-servlet-context.xml")
	class MyWebTests {

		MockMvc mockMvc;

		@BeforeEach
		void setup(WebApplicationContext wac) {
			this.mockMvc = MockMvcBuilders.webAppContextSetup(wac).build();
		}

		// ...

	}
```

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@SpringJUnitWebConfig(locations = ["my-servlet-context.xml"])
	class MyWebTests {

		lateinit var mockMvc: MockMvc

		@BeforeEach
		fun setup(wac: WebApplicationContext) {
			mockMvc = MockMvcBuilders.webAppContextSetup(wac).build()
		}

		// ...

	}
```
======

Or you can also use this setup when testing through the
[WebTestClient](testing/webtestclient.adoc#webtestclient-context-config)
which delegates to the same builder as shown above.
