# Architecture diagrams

Choose the view before drawing: context, container/service, component, deployment, runtime/data-flow, integration, or security. Do not mix every abstraction level on one page.

Represent real boundaries as containers: organization/system, trust zone, network, runtime, region/zone, subsystem. Put external actors outside implementation containers. Use nested containment where hierarchy is meaningful.

Prefer left-to-right for request/data flows, top-down for layered stacks, columns for domains, and nested zones for deployment. Relationships should name protocols, responsibilities, or data/control meaning when that distinction matters. Use a hub/broker/gateway when it is a real architectural component, not merely to beautify crossing edges.

Separate control, data/media, management, optional, and external relationships with consistent line semantics plus a legend when more than one variation is used. Avoid a single giant diagram when multiple views communicate the architecture more truthfully.