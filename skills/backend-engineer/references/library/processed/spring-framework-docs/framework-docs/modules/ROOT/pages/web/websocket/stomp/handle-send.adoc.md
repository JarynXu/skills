> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/web/websocket/stomp/handle-send.adoc`  
> Upstream Git blob: `0af57f19037335bac626881c20ae29bad83341bd`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[websocket-stomp-handle-send]]
# Sending Messages

What if you want to send messages to connected clients from any part of the
application? Any application component can send messages to the `brokerChannel`.
The easiest way to do so is to inject a `SimpMessagingTemplate` and
use it to send messages. Typically, you would inject it by
type, as the following example shows:

```java,indent=0,subs="verbatim,quotes"
	@Controller
	public class GreetingController {

		private SimpMessagingTemplate template;

		@Autowired
		public GreetingController(SimpMessagingTemplate template) {
			this.template = template;
		}

		@RequestMapping(path="/greetings", method=POST)
		public void greet(String greeting) {
			String text = "[" + getTimestamp() + "]:" + greeting;
			this.template.convertAndSend("/topic/greetings", text);
		}

	}
```

However, you can also qualify it by its name (`brokerMessagingTemplate`), if another
bean of the same type exists.
