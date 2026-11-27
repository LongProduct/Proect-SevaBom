# SEVAGO Master Layout v1.0

Status: adopted as the shared development baseline. Reference: the existing approved
Advanced Data Table and Bag page, including the latest explicit tab-padding correction.
This is architectural standardization, not a visual redesign. The latest request did
not include new image attachments; the checked-in approved UI is the executable reference.

## Component hierarchy

| Order | Component | Owner / implementation |
| --- | --- | --- |
| 1 | Global Header | Existing shell DOM, `src/shared-header.js` configuration/slot facade |
| 2 | Module Sidebar | `src/shared-sidebar.js`, module menu configuration |
| 3 | Main Content | Existing shell sizing + `.sevago-data-content` for new modules |
| 4 | Page Title | `SEVAGO_UI.createDataPage`, title string |
| 5 | Primary Tabs, optional | Shared data-page composition; module supplies keys/labels |
| 6 | Secondary Tabs, optional | Shared composition; page supplies list and active key |
| 7 | Table Toolbar | Shared adapter reuses the engine's actual controls/listeners |
| 8 | Advanced Data Table | Single `SEVAGO_GRID` factory via isolated DOM host |
| 9 | Contextual Selection Bar | Existing engine bar, optional configured business actions |
| 10 | Footer & Pagination | Existing engine components, unchanged |

Table state/records are not part of global shell state. Shared components do not own
production scope, order validation, status transition rules, or API authorization.

## Stable visual measurements

| Surface | v1.0 baseline |
| --- | --- |
| Brand | Existing `--brand`, #07554B |
| Font | Embedded Inter, existing type scale |
| Global Header | 56px, existing 8px/12px padding and 12px gap |
| Sidebar | 240px, collapsed 64px; existing 50px menu items and nested states |
| Main content | Existing 24px desktop inset; responsive rules preserved |
| Page Title | Existing 56px title area, 20px/24px desktop, weight 600 |
| Primary Tabs | White, hug width, max-width 100%, 48px, top radii 8px, active underline |
| Primary items | Hug, 12px/16px item padding, 14px/20px, weight 500 |
| Secondary Tabs | White, fill width, padding 12px on all sides, 56px total |
| Secondary items | 32px, hug/left, 6px/12px padding, 10px gap, radius 6px |
| Secondary divider | Inset 1px divider; does not add height |
| Toolbar | 32px, one row, 12px gaps; content inset remains 12px |
| Search | Fixed 320px in the shared data-page adapter; never the flexible spacer |
| Quick filters | Existing date 202px / status 151px when configured |
| Grid | 36px rows/leaf headers, 9px horizontal padding, existing grid lines |
| Grouped column band | Optional 24px above unchanged leaf header; reads actual column geometry |
| Utility columns | Engine STT and Actions remain 46px |
| Footer | Existing 48px area, secondary text, counts left/pagination right |
| Page sizes | 50 default, 100, Show All; virtualization retained |

The secondary item bottom inset is 12px; toolbar retains its own 12px top inset,
with the divider between the two surfaces. No extra margins are inserted.
Primary and secondary tab strips scroll horizontally independently when needed.
No primary/secondary configuration means hidden elements of zero layout height.

## Global shell and extensions

The original header is never replaced. `SEVAGO_SHARED_HEADER.configure` supplies
module name/icon. `setSlot(owner, element)` attaches optional module content next to
the title without adding a wrapper or changing header geometry. Owners hide/close
slot overlays when their page/module deactivates. Production Scope remains Bag-owned.

App Launcher stays in `src/shell.js` / `src/shell.css`: full-height left drawer,
4-column catalog grid, search, categories, active item, 60px normalized icons,
fixed header/footer, scrolling body, 300ms entry/240ms exit. Register catalog metadata
rather than rebuilding its DOM/CSS/animations.

Sidebar menu data contains `id`, `label`, optional `children`/`expandable`. Its state
is per module: active item, expanded groups, collapsed width and scroll position.

## Toolbar order and compatibility

New adapters default to Filter → Sort → Group → Search → Quick Filters → Columns → More.
Right actions remain separate with an auto spacer. Search stays fixed width.
Narrow screens scroll the tools independently; primary action stays accessible at right.

The existing Bag page explicitly retains its previously approved reference order:
Filter → Search → Date → Status → Sort → Group → Columns → More. This is a recorded
compatibility override, not a new default. Its filters and disabled missing-date state
are unchanged. The legacy ERP page retains its original DOM/toolbar presentation.
Changing either established appearance would require a separate explicit UI request.

## Current architecture audit

- `src/grid.js`: one factory, per-Document instances. No algorithm edits in this task.
- `src/grid.css`: existing interactions/tokens. No edits in this task.
- `src/grid-host.js`: same-origin iframe document isolation, same parent factory; no engine copy.
- `src/shared-data-page.js/.css`: extracted shared page, tabs, toolbar, grouped band,
  selection/action adapters and configuration-driven module helper.
- `src/shared-header.js`: facade over the original global header and optional slots.
- `src/shared-sidebar.js`: existing shared sidebar, unchanged.
- `src/shell.js`: existing routing/catalog/launcher; header updates now use shared facade.
- `src/modules/bags-page.js`: data/filter/scope/business config, custom cells and detail content.
- `src/modules/bags.css`: only production-scope-specific styles remain.
- Bag's 60 IDs, 56 data fields/58 total columns and status distributions are unchanged.

The engine still contains its pre-existing ERP schema/demo fallback for the legacy
bootstrap. This task does not remove that code: doing so would change engine startup
beyond adapter extraction. Custom instances receive explicit schema/data and do not
use that fallback. New module data/business rules must never be added to the engine.

Legacy compatibility surfaces are intentionally retained: the root ERP/Planned Order
page is catalogued under `recruitment`; `planning` remains a placeholder in the existing
catalog. This task does not relabel modules or claim that an unimplemented module exists.
Pending modules keep their existing placeholder presentation; newly implemented data
pages use the shared data-page/module helper. Do not clone the legacy root as a new engine.

## State and filtering

Keep source records separate from view configuration. Each module/page owns its data,
applied/draft scope, active primary/secondary keys and business logic. Each mounted
Table keeps filters, sorts, groups, search, widths/order/pins/hidden columns, page size,
selection and scroll. The module helper retains mounted page DOM and suspends inactive
controllers. No shared record array or singleton active-grid state is introduced.

Bag filter order stays access → applied scope → primary → secondary → advanced filters
→ search navigation/count → sort/group → pagination/render. Search retains the existing
engine's navigation semantics: it does not rewrite records or replace the engine's
filter pipeline. Changing status resets secondary and pagination and prunes row
selection outside the new source; changing module does not reset table configuration.

## Scope and change control

`PAGE_ONLY`: config/data/business callbacks/renderers of one page.
`MODULE_ONLY`: module-owned navigation/pages/business extensions.
`SHARED_ADAPTER`: minimal configuration/initialization extensions with backward checks.
`GLOBAL_SHARED`: explicitly authorized changes to core layout/components/tokens/behavior.

This v1.0 extraction is authorized by the standardization request. No deep engine
changes are required or performed. Future algorithm changes need an impact report
before implementation. Routine authorized configuration work can proceed directly.

## Regression procedure

Create a Git checkpoint and capture the old UI before shared refactors. Serve the
repository from a free port (for example `python3 -m http.server 6173 --bind 127.0.0.1`).
Run `python3 build.py` after source edits. Existing static HTML continues to run offline.

Set `SEVAGO_TEST_URL=http://127.0.0.1:6173` when testing on a non-default port. The `.cjs`
files currently import Playwright from the local Codex runtime, so another development
machine must update that import to its installed Playwright package. No npm install
is needed to run the application itself. This task does not claim portable CI setup.

Required suites after shared adapter work:

- `node tests/master-layout-api.cjs`: config-only modules/pages, isolated roots/state,
  toolbar defaults, feature flags, actions, optional slots/tabs and cleanup.
- `node tests/grid-ui-refinements.cjs`: focus/range/copy/overflow/header/preview/row geometry.
- `node tests/module-business-regression.cjs`: row checks/Shift/select-all, validation,
  roles, column drag feedback/cancel, loading/empty/error and refresh.
- `node tests/grid-adapter.cjs`: multiple roots, copy/shortcuts, resizing, pointer release.
- `node tests/module-shell.cjs`: routes/Back/Forward, all state persistence, legacy parity,
  show-all/virtualization, launcher and offline standalone HTML.
- `node tests/manufacturing-execution.cjs`: sidebar, all existing pages, module isolation.
- `node tests/launcher-drawer.cjs`: drawer geometry, animation, backdrop, scrolling and tablet.
- `node tests/bags-page.cjs`: source/scope/status/table interactions/export/state preservation.
- `node tests/bag-nested-tabs.cjs`: independent status config, scope/filter combinations,
  footer/selection/reset, keyboard and 56px secondary geometry.
- `node tests/bag-toolbar.cjs`, `node tests/bag-fields.cjs`: toolbar/filters, all verified
  columns, grouped headers, widths, horizontal scrolling and XLSX.

`tests/master-layout-visual.cjs before|after` compares the local ignored checkpoint HTML
with the current artifact in seven states. Wait for font/image decoding, use the same
Chrome/viewport, and inspect any mismatch. Tiny corner raster differences are recorded
explicitly (not hidden by a broad pixel tolerance). Do not recreate the old baseline
from the refactored source. Results/report: `MASTER_LAYOUT_TEST_REPORT.html`.

## Adaptive column width — Flexible Width, Fixed Height

The shared engine computes horizontal display widths independently of records and
stored widths. A real container ResizeObserver updates header/body, pinned offsets and
grouped header measurements. Hidden columns do not consume width. Narrow containers
retain base widths and scroll horizontally; wide containers distribute surplus by
base width × flexGrow. STT/checkbox and Actions remain 46px, with Actions at the right
edge when fill capacity exists. No layout wrappers, spacer columns or fake cells.

User resize and auto-fit retain a separate customized flag. Reset removes that priority;
computed growth is never saved to a View. Legacy widths differing from schema defaults
are conservatively recognized as customized. Fallback may grow a customized column's
display without changing its stored width. Hard fixed/locked widths and maxWidth win;
if every visible column is fixed or capped, filling is mathematically impossible.
Configure a non-fixed fallback with sufficient headroom for pages requiring full fill.

Actual data row/body height stays exactly 36px, leaf headers 36px and optional grouped
band 24px. Content remains one line with ellipsis; full content wraps only in the
existing floating preview. Adaptive width never changes fonts, padding, badges,
avatars, icons, row count, virtualization math or vertical density.

Validation: `tests/adaptive-width.cjs` checks rendered dimensions, base-width isolation,
resize/reset, overflow, hidden/fixed columns, sparse/empty data and grouped bands.
