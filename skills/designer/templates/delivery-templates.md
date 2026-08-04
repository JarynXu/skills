# Designer Delivery Templates

## 1. Source Index

```markdown
| Source ID | Type | Title or path | Version/date | Authority | Notes |
|---|---|---|---|---|---|
```

## 2. Atomic Requirements

```markdown
| Requirement ID | Source | Atomic requirement | Role | Priority | UI impact |
|---|---|---|---|---|---|
```

## 3. Requirements Traceability Matrix

```markdown
| Requirement ID | Source | Role | Trigger | Preconditions | Design Object IDs | Flow | Success | Failure/Exception | Responsive impact | Design location | Coverage | Open question |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
```

Allowed coverage values:

```text
Covered
Partially Covered
Not Covered
Not Applicable
Blocked
```

## 4. Design Object Inventory

```markdown
| Object ID | Name | Type | Source requirements | Module | Required states | Tool location | Status |
|---|---|---|---|---|---|---|---|
```

Object types may include:

```text
Page
Screen
Component
Pattern
Modal
Drawer
Popover
Dropdown
Tooltip
Toast
Banner
Inline Edit
Loading State
Empty State
Error State
Permission State
Responsive Variant
Prototype
Handoff Note
```

## 5. Canvas Map

### Figma

```markdown
| Page | Section | Contained frames | Layout | Planned bounds | Current status |
|---|---|---|---|---|---|
```

### Pen

```markdown
| Zone ID | Zone | Board | Contained objects | Layout | Top-level position | Planned bounds | Current status |
|---|---|---|---|---|---|---|---|
```

## 6. Issue Closure Matrix

```markdown
| Issue ID | Requirement/Object ID | Severity | Original status | Required change | Exact design location | Created/modified IDs | Verification | New status |
|---|---|---|---|---|---|---|---|---|
```

An issue cannot be marked closed without an exact design location or an explicitly approved `Not Applicable` decision.

## 7. Change Impact Report

```markdown
| Change ID | Source | Change | Direct impact | Indirect impact | Affected objects | Required updates | Risk | Status |
|---|---|---|---|---|---|---|---|---|
```

## 8. Canvas Audit

```markdown
# Canvas Audit

## Structure
- Top-level categories:
- Groups/modules:
- Screens:
- Components:
- States/overlays:

## Collision and bounds
- Overlapping top-level objects:
- Overlapping sibling objects:
- Clipped objects:
- Objects outside parent bounds:

## Classification
- Unclassified objects:
- Objects in the wrong category:
- Current and archived work mixed:

## Layout
- Containers missing explicit layout:
- Unexpected default layout:
- Absolute children in structural layouts:
- Incorrect sizing:

## Naming
- Default names:
- Duplicate names:
- Unclear names:

## Result
- [ ] Pass
- [ ] Requires correction
- [ ] Blocked
```

## 9. Design Review Report

```markdown
# Design Review Report

## Summary
- Score:
- Delivery status:
- P0:
- P1:
- P2:
- P3:

## Strengths

## Critical issues

### Issue
- ID:
- Severity:
- Location:
- Requirement:
- Problem:
- Impact:
- Required fix:
- Verification:
- Status:

## Page/state completeness

## Component completeness

## Handoff risks

## Final decision
- [ ] Ready for development
- [ ] Ready after explicitly accepted limitations
- [ ] Requires another design iteration
- [ ] Not ready
```

## 10. Final delivery decision

```markdown
Core requirements:
- Covered:
- Partially Covered:
- Not Covered:
- Blocked:

Design objects:
- Required:
- Present:
- Missing:

Audit:
- Canvas audit:
- Design review:
- Coverage audit:

Decision:
- Ready / Not ready

Human approvals still required:
-
```
