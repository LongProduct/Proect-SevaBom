# SEVAGO Master Layout v1.0 — Development Contract

This repository is a frontend ERP/MES prototype. Read `MASTER_LAYOUT.md` and
`SHARED_COMPONENTS.md` before adding or changing a module/page. User instructions
and explicitly granted exceptions take precedence over this contract.

## Fixed architecture

Global Header → Module Sidebar → Main Content → Page Title → optional Primary
Tabs → optional Secondary Tabs → Toolbar → shared Grid → conditional floating
Selection Bar → Footer/Pagination. Do not insert new wrappers, cards or summary
bars into this hierarchy without a concrete requirement.

Use `SEVAGO_UI.defineDataModule` for new configuration-driven data modules;
`SEVAGO_UI.createDataPage` + `SEVAGO_UI.createTable` for a custom module lifecycle.
Reuse `SEVAGO_SHARED_HEADER`, `SEVAGO_SHARED_SIDEBAR` and `SEVAGO_SHELL`.
Do not copy a table engine, sidebar, tabs, toolbar, footer or launcher into a module.
No new framework, project or independent HTML replacement is needed.

## Scope

- `PAGE_ONLY`: active page configuration, data, business logic, approved renderers/slots.
- `MODULE_ONLY`: active module's independent pages/navigation/business rules.
- `SHARED_ADAPTER`: minimal reuse/initialization adapter, backward compatible.
- `GLOBAL_SHARED`: explicit request/authorization for a core component or layout change.

The standardization task explicitly authorized adapter extraction and documentation.
It did not authorize redesigning existing pages or rewriting grid algorithms.
If a later task requires deep engine/interaction changes, report the concrete
impact before doing them. Do not infer that routine page configuration needs approval.

## Protected behavior and data

- Keep `src/grid.js` algorithms and `src/grid.css` interactions stable.
- 36px rows and leaf headers; read-only grid; full-value copy; ellipsis/overlay preview.
- Primary tabs: hug width, 48px. Secondary: width 100%, padding 12px all sides,
  32px buttons, total 56px; no reserved space when absent.
- Fixed 320px search, one-line toolbar, left tools and right business actions.
- Preserve launcher 4-column drawer, animation, geometry, header and sidebar.
- Preserve both legacy ERP/Planned Order and Bag data, IDs and schemas.
- Each table owns its root Document, configuration, records, selection and shortcuts.
- Keep mounted DOM/state on module/page switches; no reload or unnecessary resets.
- Business actions, authorization rules and production scope belong to the page/module.
  Never inject Bag/Order-specific filters or records into a shared adapter.
- Do not wire a control to a fake action. Hide unavailable business actions; disabled
  controls must explain their real unavailable state. Frontend permissions are a demo.
- Keep existing IDs/compatibility class hooks until an explicit migration allows removal.

## Work and verification

1. Inspect current components/configuration and Git status. Create a backup or checkpoint.
2. Change only necessary source/configuration. Use shared APIs; do not edit generated HTML.
3. Run `python3 build.py`; it produces `index.html` and `SEVAGO_Advanced_Data_Table.html`.
   `backups/figma-v1/` is a required build input, not disposable history.
4. Run relevant regression suites and compare existing pages before/after any adapter work.
   See the commands and full matrix in `MASTER_LAYOUT.md`.
5. Verify no JS errors, no state/data leakage, no layout shift, and width/row-height alignment.
6. Report changed behavior, checks, and actual limitations. Do not label historical test
   reports as freshly rerun. Keep docs aligned with public configuration APIs.

Tests accept `SEVAGO_TEST_URL`. Use a free local port instead of stopping another app.
Playwright test imports currently use the local development runtime; see docs for portability.
Do not publish/deploy or send messages beyond user authorization. Existing GitHub Pages is
served from `main` at repository root; pushing `main` changes the public prototype.
