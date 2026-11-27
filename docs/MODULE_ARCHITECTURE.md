# SEVAGO multi-module prototype

## Boundaries

- Global Application Shell: `src/shell.js`, `src/shell.css`. Owns launcher, app registry, hash routing, global header identity and lifecycle navigation. No business records are read or copied into the shell.
- Existing module: `src/grid.js`, `src/grid.css`. Its private controller and original DOM remain intact. A narrow `SEVAGO_MODULE` adapter suspends transient UI and resumes rendering. Existing shared controls, data-grid rendering and design tokens are retained; the grid business controller has not been rewritten into a new generic component.
- New module manifests: catalog in `src/shell.js`. Each definition has ID, name, icon, color, route, sidebar and pages. Each instance receives separate `state`, `data` and a cached DOM host. Pending modules contain no business data.
- Build: `python3 build.py` embeds original assets, downloaded Figma launcher SVGs, font, styles and scripts into both standalone HTML outputs. No runtime package or network connection is required.

## Routing and preservation

- Module route: `#/apps/<module-id>/overview`.
- Existing Detail route `#record=<record-id>` is preserved for compatibility.
- Navigation uses History API, with `popstate` and `hashchange` listeners for Back/Forward and direct URLs.
- The existing workspace is hidden, never reconstructed. Its private records, filter/sort/group config, keyword and search hit, pagination, selected rows, selected range, column state and detail DOM stay alive.
- Scroll offsets are captured before hiding and restored after reactivation. Resize callbacks and global grid keyboard shortcuts are suspended while another module is active.
- Transient popovers/previews close during app switching; business/page state does not reset.
- New modules have independent instance state and no connection to the grid record collection. App launcher count comes from registry size (25 initial entries; 24 pending).
- In-session state preservation is guaranteed by DOM/controller retention. Existing localStorage behavior remains unchanged. The new shell does not promise complete grid state persistence across browser reloads; the current module URL survives reload via its hash.

## Add a module

Register a module after shell initialization using `window.SEVAGO_SHELL.registerModule({...})`, then navigate with `SEVAGO_SHELL.navigate(id)`.

Required metadata: unique lowercase `id`, `name`, `description`, existing `group`, and a durable local/embedded `icon` URL. Optional metadata: `color`, `route`, `pages`, `sidebar`, `implemented`.

A module with no `mount` uses the honest “Chưa triển khai” page. A real module can supply `mount({state, data, navigate})`, returning its own DOM host. Namespace all module styles and code. Do not read or mutate another module's state or reuse grid business records. Keep navigation in the shell so no page reload occurs.

## Backup and verification

Before integration, the standalone files, build script and source were copied to `backups/pre-multi-module/`.

Current regression scripts:

- `node tests/module-shell.cjs`
- `node tests/module-business-regression.cjs`
- `node tests/grid-ui-refinements.cjs`

Requires Chrome and the Playwright path used in the scripts; local server at port 5173. Results are in `MODULE_TEST_REPORT.html` and the corresponding JSON files under `tests/`. Historical test scripts for deleted View controls and 20-row pagination are not used as current acceptance tests.

## Full-height launcher drawer

The native modal drawer covers the viewport from (0, 0), including the global header. Its width remains 604px and its height is 100dvh. Header and footer stay fixed within the flex container; only `.sl-list` scrolls. Native modal inertness and wheel/touch guards block background interaction and scrolling. Focus stays on the dialog when opening, without focusing Search.

CSS transform animations use 300ms for opening and 240ms for closing with `cubic-bezier(.22,1,.36,1)`, plus matching backdrop opacity animations. `closeLauncher()` returns a promise and keeps the dialog in the top layer until animation completion. Module selection waits for this promise before routing. A timeout provides cleanup if animation events are unavailable; reduced motion uses 1ms animations.

Run `node tests/launcher-drawer.cjs` for the focused drawer suite. Rebuild the combined report with `python3 tests/build_module_report.py` after test results are written.

## Manufacturing Execution initialization

`src/modules/manufacturing-execution.js` registers `manufacturing-execution` in Vận hành sản xuất. Its default route is `#/apps/manufacturing-execution/bags`. Twelve top-level items plus six configuration children produce eighteen independent page containers. Configuration and Reports have explicit expansion state; Reports contains an honest empty message rather than invented report types.

`src/shared-sidebar.js` composes the existing `.nav-item`, `.collapse`, original SVG navigation assets and original sidebar design tokens. Each module supplies its own configuration and navigation state. The old sidebar DOM/handlers are unchanged. A module's `mount` returns its cached host; the global shell attaches that host and calls its `activate` hook on routing. Original and custom modules retain their own DOM, selection and scroll state.

Each Manufacturing page reserves a hidden mount slot and separate `data.pages[pageId].records` plus a per-page `state.pages[pageId].table` context (columns, filters, view tabs, business actions and UI state). The context specifies `readOnly: true` and `rowHeight: 36`. No table is rendered, no engine is copied, and no business data is generated in this phase. A generic multi-instance adapter for the existing controller will be implemented when the first concrete table Page is specified; these slots/configurations are the preparation, not a second table implementation.

The green 44×44 SVG logo is downloaded from the supplied Figma header and embedded in the standalone build. Header geometry follows the existing 32px icon slot with a 44px asset extending 6px on each side. The launcher uses a 60px wrapper with a transform rather than changing the SVG's intrinsic dimensions.

Backup before this phase: `backups/pre-manufacturing-execution/`. Focused regression: `node tests/manufacturing-execution.cjs`.

## Bag list and the approved table adapter

The user authorized a minimal multi-instance adapter as an explicit exception to PAGE_ONLY. Backup: `backups/pre-bag-list/` (includes source and standalone output before this phase).

`src/grid.js` now defines one `SEVAGO_GRID.create(options)` factory and invokes it with no options for the legacy module. Defaults retain the legacy data, routes, interactions and business actions. Additional instance options inject a DOM document root, column schema, data, initial configuration, primary record key, storage namespace, cell presentation and action callbacks. `setData` updates the data source while retaining ordinary filters, sorting, grouping and column state; it resets pagination and removes selected IDs absent from the new source when requested. Geometry uses the owning document's viewport.

`src/grid-host.js` is a DOM host, not a second engine. It creates a same-origin internal iframe from the existing markup and the same shared styles, then calls the same factory with that document root. No engine JavaScript is copied into the iframe, and there is no second table implementation or replacement HTML project. The native document boundary isolates IDs, keyboard shortcuts, event listeners, focus, fixed overlays and per-instance inspection globals. It also retains the existing global shell in the parent document. The iframe is cached with the Page, with explicit suspend/resume on Page/module switches. Header/sidebar are hidden inside this internal host; the real global shell remains outside it.

Bag-only sources:

- `src/modules/bags-data.js`: 60 independent demo records, authorized Site hierarchy, schema and API-replaceable `list()` repository.
- `src/modules/bags-scope.js`: 4-level searchable cascading selection; separate draft/applied scope, explicit Apply and cancellation semantics. Overlay is Page-owned and appears only on the Bag page.
- `src/modules/bags-page.js`: original tabs, frame host configuration, status/scoped source selection, read-only record preview and Bag-only selection/export actions. No Planned Order action is exposed.
- `src/modules/bags-export.js`: XLSX ZIP/SpreadsheetML writer; values are inline text, with no formula evaluation. Export uses the filtered scope/status/ordinary-filter set and current search query.
- `src/modules/bags.css`: Page-specific styles. The shared grid CSS is unchanged.

Data pipeline: simulated access restriction → Applied Scope → status tab → existing engine's ordinary filters and sort/group/pagination. Search retains the existing hit-navigation behavior: highlight/next/previous, cross-page navigation and matching-record footer count; it does not remove unmatched records from the underlying table source.

The outer module's other seventeen Pages remain placeholders. The Bag page owns its DOM, demo data, applied scope and cached table controller; no other module's records or configuration are reused. Complete reload persistence is not added. Permissions remain a frontend demonstration.

Regression before integration: original grid UI suite, business suite, module/state routing suite and drag/drop positioning checks passed after the adapter addition. Two independent synthetic instances verified state/data/DOM/keyboard isolation before the Bag Page was connected. Focused commands: `node tests/grid-adapter.cjs` and `node tests/bags-page.cjs`. The generated `.xlsx` was additionally validated with Python zipfile/XML parsing (one header plus sixty records).

## SEVAGO Master Layout v1.0

Các mô tả Page-owned Tabs/Toolbar/Grouped Header ở các giai đoạn trước được thay thế
bởi shared composition trong `src/shared-data-page.js/.css`. Bag chỉ truyền cấu hình
và callback nghiệp vụ. `src/shared-header.js` quản lý title/icon và Header Slot trên
DOM Header hiện tại. Không thay đổi Grid Engine hoặc dữ liệu. Quy chuẩn hiện hành:
`../AGENTS.md`, `../MASTER_LAYOUT.md`, `../SHARED_COMPONENTS.md`.

Các Module mới có thể đăng ký `SEVAGO_UI.defineDataModule({id,name,icon,pages,...})`
với Shared Sidebar và Page Container có sẵn. Page/Table được cache theo từng Module
và Page; không reload hoặc chia sẻ dữ liệu. Module chưa triển khai tiếp tục là placeholder,
không được trình bày như có nghiệp vụ thật.
