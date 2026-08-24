# Motion and physicality

Use this reference when transitions, gestures, overlays, direct manipulation, loading feedback, animated data, or perceived responsiveness materially affect the experience. Motion must explain state, causality, continuity, or feedback; it is not a mandatory layer of polish.

## Decide whether to animate

Start with frequency and purpose.

- Very frequent or keyboard-driven actions should usually be instant or nearly instant.
- Frequent navigation and hover feedback should be restrained.
- Occasional overlays, state transitions, and task milestones can use standard motion.
- Rare onboarding, celebration, or explanatory moments may support more expressive motion when it does not obstruct progress.

Every animation should have a job such as preserving spatial continuity, showing cause and effect, confirming input, explaining a transformation, softening a disruptive state change, or supporting direct manipulation. Remove motion whose only defense is that it looks impressive.

## Match timing to the interaction

Interactive UI should respond immediately. Prefer short transitions for small controls and local overlays, and allow more time only when distance, scale, physicality, or explanatory content requires it.

As a starting range rather than a universal token:

- press and local feedback: roughly 100–160 ms;
- tooltip and small popover transitions: roughly 125–200 ms;
- dropdown/select transitions: roughly 150–250 ms;
- modal, sheet, or drawer transitions: roughly 200–500 ms depending on distance and physics.

Use the product's existing motion tokens when they exist. Judge perceived speed from the beginning of the response, not only total duration.

## Choose easing by motion role

- Entrances and exits usually benefit from a decisive ease-out so response begins immediately.
- Movement or morphing between visible states often benefits from ease-in-out or a suitable spring.
- Small color or hover transitions can use a conventional ease.
- Constant-rate progress or continuous motion may require linear timing.
- Avoid slow-starting ease-in for direct UI response unless the physical model specifically requires acceleration from rest.

Prefer a coherent set of strong, tested curves or springs over inventing a new easing for every component.

## Preserve origin and causality

Motion should appear to come from the place or action that caused it.

- Anchored popovers and menus should transform from the trigger relationship when the implementation supports it.
- Centered modals need not pretend to originate from a trigger.
- Shared objects should preserve recognizable continuity when moving between states.
- Enter and exit directions should agree with navigation and dismissal models.
- Direct-manipulation gestures should hand off velocity and direction naturally rather than snapping into an unrelated canned animation.

Do not animate from impossible geometry merely because it is easy. For example, scaling an object from nothing can feel less physical than beginning from a subtle scale and opacity offset.

## Design for interruption

Users can reverse, dismiss, drag, navigate, or trigger another state before an animation finishes. Prefer mechanisms that can retarget smoothly for dynamic UI.

Use springs or interruptible transitions for gesture-driven and rapidly changing interactions when appropriate. Avoid long keyframe sequences for controls whose state may change mid-flight unless the implementation explicitly handles interruption.

## Animate inexpensive properties by default

Prefer transform and opacity for frequent motion. Treat blur, filters, large shadows, layout-triggering properties, and large translucent regions as performance-sensitive. Validate on representative hardware and browsers when motion is important to the product.

Do not trade semantic layout or accessibility for animation performance. Change the animation strategy instead.

## Make controls feel responsive

Pressable controls should acknowledge input immediately through a coherent state change: color, surface, scale, depth, or another system-consistent signal. A subtle scale change can work for tactile controls, but it is not mandatory and should not distort tightly aligned layouts or violate the product language.

Hover is not press. Focus is not hover. Selected is not pressed. Keep the states related but visually distinguishable.

## Respect reduced motion

When motion is not essential to understanding, reduce or remove it under reduced-motion preferences. When motion communicates a necessary relationship, replace it with a less vestibular alternative such as opacity, instant state change, or a shorter/smaller transition while preserving the information.

Never make motion the only carrier of state or progress.

## Judge motion in context

Code values alone cannot prove that motion feels right. Inspect the rendered interaction at normal speed, and use slow motion or frame-by-frame inspection when diagnosing origin, clipping, velocity handoff, or sequencing.

Check:

- immediate response to input;
- correct origin and direction;
- continuity when interrupted;
- no accidental animation on high-frequency actions;
- no content flash or layout jump hidden by the transition;
- reduced-motion behavior;
- performance on representative targets;
- consistency with neighboring components and the product's overall motion personality.

A motion system is successful when users understand and feel the interface responding without having to notice the animation itself.