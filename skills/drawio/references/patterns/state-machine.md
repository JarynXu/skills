# State machines

States represent durable conditions; transitions represent events or triggers. Label transitions as `event [guard] / action` when those parts matter. Use explicit initial and final states where the lifecycle has them.

Do not model ordinary activities as states merely because a flowchart step has a box. Keep mutually exclusive states distinct, represent self-transitions and recovery transitions honestly, and avoid inventing terminal states.

Lay primary progression consistently; place error/recovery branches to one side. Cycles are normal. Use dashed lines only for a defined semantic convention, not decoration.