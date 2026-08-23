> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/mockmvc/hamcrest/async-requests.adoc`  
> Upstream Git blob: `1defcfbc866146f303b2fef386b880e65a0c8cd3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[mockmvc-async-requests]]
# Async Requests

This section shows how to use MockMvc on its own to test asynchronous request handling.
If using MockMvc through the [WebTestClient](testing/webtestclient.adoc), there is nothing special to do to make
asynchronous requests work as the `WebTestClient` automatically does what is described
in this section.

Servlet asynchronous requests, [supported in Spring MVC](web/webmvc/mvc-ann-async.adoc),
work by exiting the Servlet container thread and allowing the application to compute
the response asynchronously, after which an async dispatch is made to complete
processing on a Servlet container thread.

In Spring MVC Test, async requests can be tested by asserting the produced async value
first, then manually performing the async dispatch, and finally verifying the response.
Below is an example test for controller methods that return `DeferredResult`, `Callable`,
or reactive type such as Reactor `Mono`:

[tabs]
======
Java::
+
```java,indent=0,subs="verbatim,quotes"
	// static import of MockMvcRequestBuilders.* and MockMvcResultMatchers.*

	@Test
	void test() throws Exception {
		MvcResult mvcResult = this.mockMvc.perform(get("/path"))
				.andExpect(status().isOk()) <1>
				.andExpect(request().asyncStarted()) <2>
				.andExpect(request().asyncResult("body")) <3>
				.andReturn();

		this.mockMvc.perform(asyncDispatch(mvcResult)) <4>
				.andExpect(status().isOk()) <5>
				.andExpect(content().string("body"));
	}
```
<1> Check response status is still unchanged
<2> Async processing must have started
<3> Wait and assert the async result
<4> Manually perform an ASYNC dispatch (as there is no running container)
<5> Verify the final response

Kotlin::
+
```kotlin,indent=0,subs="verbatim,quotes"
	@Test
	fun test() {
		var mvcResult = mockMvc.get("/path").andExpect {
			status { isOk() } // <1>
			request { asyncStarted() } // <2>
			// TODO Remove unused generic parameter
			request { asyncResult<Nothing>("body") } // <3>
		}.andReturn()


		mockMvc.perform(asyncDispatch(mvcResult)) // <4>
				.andExpect {
					status { isOk() } // <5>
					content().string("body")
				}
	}
```
<1> Check response status is still unchanged
<2> Async processing must have started
<3> Wait and assert the async result
<4> Manually perform an ASYNC dispatch (as there is no running container)
<5> Verify the final response
======
