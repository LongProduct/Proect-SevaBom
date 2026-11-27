# SEVAGO shared table sizing specification

This document supplements MASTER_LAYOUT.md and SHARED_COMPONENTS.md. Existing tokens,
layout and interaction specifications continue to apply to all modules and pages.

- Flexible column width; fixed row height; one shared grid engine.
- Data rows and body cells render at exactly 36px in default, hover, focus, range,
  checkbox selection, search, column resize/reorder/pin/hide and preview states.
- Leaf header stays 36px. Optional grouped header band stays 24px.
- No auto row height, row wrapping, vertical stretch or content-based density changes.
- Text stays on one line with ellipsis. Expanded content uses the current read-only
  floating overlay; it never reflows rows or widens the source column.
- Padding, typography, line height, badge/avatar/image/icon/checkbox sizes stay unchanged.
- Sparse data leaves blank container background below real rows; footer stays in place.
  Empty data retains headers and uses the existing empty component, with no fake rows.
- Horizontal surplus is distributed by base width × flexGrow among eligible columns.
  User base widths remain separate from display widths. STT and Actions stay 46px.
- Oversized tables retain widths and horizontal scroll. Headers/body/sticky positions
  share the same display widths; no spacer/fake columns are permitted.
- ResizeObserver follows actual container size, including sidebar and page transitions.
- Hard fixed/locked/max constraints take priority. Configure a non-fixed fallback with
  available growth capacity when full fill must be guaranteed for all visible sets.

Public sizing options, backward compatibility and fallback policy are documented in
SHARED_COMPONENTS.md. Regression entry point: `tests/adaptive-width.cjs`, followed by
the existing matrix in MASTER_LAYOUT.md. Verify actual rendered heights and alignment,
not only CSS declarations. These rules are mandatory for future modules/pages.
