# Network and protocol diagnosis

Use this reference when a backend failure involves DNS, routing, TCP, TLS, HTTP/1.1, HTTP/2, gRPC, proxies, WebSocket, connection reuse, timeouts or packet-level behavior. Start at the highest layer that can distinguish the hypothesis; descend only when evidence requires it.

## Reconstruct the path

Identify the exact client, destination name, resolved address, port, proxy/load balancer/gateway, TLS termination point, protocol version and backend instance. One hostname may resolve differently by VPC, container, cluster, VPN or split DNS; one public request may cross several independently timed hops.

Preserve request/trace/correlation identity where available:

```text
client
-> DNS
-> route/NAT/firewall
-> TCP connection
-> TLS handshake
-> HTTP/gRPC/WebSocket protocol
-> proxy/gateway
-> service
-> downstream dependency
```

Do not call a problem “network” merely because the application reports a timeout.

## DNS

Use read-only resolution tools such as `getent ahosts <host>`, `dig`, `host`, `nslookup` or `resolvectl query` according to the environment. Inspect `/etc/resolv.conf`, search domains, ndots behavior, resolver configuration and container/cluster DNS only when relevant.

Compare answers from the same network namespace as the failing process. Check record type, TTL, CNAME chain, split-horizon behavior, IPv4/IPv6 choice and whether the application caches DNS beyond the resolver TTL. `dig +trace` queries the public delegation path and may not represent internal/private DNS.

## Routing, sockets and connection state

Use `ip addr`, `ip route`, `ss`, `lsof` and platform equivalents to inspect local addresses, routes, listeners, established connections, SYN states, retransmission/queue indicators and socket ownership. `ss -lntp` or process metadata may require elevated permissions.

Connection counts require context: keep-alive pools, HTTP/2 multiplexing, TIME_WAIT, NAT, retry storms, load balancing and pool limits can all change the expected number.

## TLS

Use `openssl s_client -connect host:port -servername host` or equivalent to inspect certificate chain, SNI, protocol/cipher negotiation and handshake failures. Compare system time, trust store, hostname, certificate validity, intermediates, mTLS client credentials and proxy termination.

Do not paste private keys or bearer credentials into diagnostic transcripts. `-k`/insecure client options can isolate certificate verification as a hypothesis but must not become the fix.

## HTTP

Use `curl -v`, `curl --http1.1`, `curl --http2`, HTTPie or a project client to inspect resolution, connection, TLS, request/response headers, redirect, status, transfer and timing. Use `--connect-timeout`/`--max-time` deliberately when recreating timeout behavior.

Check Host/authority, proxy headers, forwarded scheme/client IP, body limits, compression, chunking/content length, keep-alive, redirects, caching and retry semantics. A `200` from a health endpoint does not prove the failing business request path.

For timing, separate name lookup, connect, TLS, time-to-first-byte and transfer. A slow TTFB can originate in service/database/dependency work rather than the network.

## HTTP/2 and gRPC

Use `grpcurl` or project-native clients when server reflection/descriptors/auth allow it. Inspect authority/SNI, deadlines, status/details, metadata, message limits, streaming lifecycle and keepalive. HTTP/2 connection-level behavior means one unhealthy connection can affect many streams differently from HTTP/1.1 pools.

Use packet/HTTP2 tooling only when higher-level evidence cannot distinguish framing, resets, flow control or intermediary behavior. Do not confuse gRPC application status with HTTP transport success.

## WebSocket and streaming

Inspect the HTTP upgrade/handshake, proxy support, idle/read/write timeouts, ping/pong/heartbeat policy, frame/message limits, backpressure and disconnect/reconnect semantics. Tools such as `websocat`/`wscat` can reproduce a protocol path, but long-lived production streams require workload-aware evidence.

## Packet capture

Use `tcpdump`, Wireshark, tshark or eBPF networking tools only when authorized. Packet captures can contain credentials, cookies, payloads and customer data, and may be high volume. Prefer narrow interface/host/port/time filters and encrypted-metadata analysis where payload inspection is unnecessary.

Packet evidence can distinguish SYN loss, resets, retransmission, handshake timing and connection teardown. It usually cannot explain encrypted application semantics without keys or higher-layer telemetry.

## Proxies, gateways and service meshes

Align timeout, retry, circuit, body/header, connection and TLS settings across client -> proxy -> service -> dependency. Retry multiplication is a common failure amplifier. Inspect gateway/mesh access logs, cluster/upstream health, route match and config version before changing application retries blindly.

## Diagnostic conclusions

A useful conclusion names the failing layer and evidence, for example:

- DNS returns an unreachable private address only inside one namespace;
- TCP connect succeeds but TLS fails hostname verification;
- HTTP gateway returns 413 before the request reaches the service;
- gRPC deadline expires after a downstream database wait;
- client pool exhaustion prevents new connections despite healthy server capacity.

If the evidence only narrows the problem to two layers, keep both hypotheses explicit and choose the next observation that distinguishes them.