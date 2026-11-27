# SEVAGO Shared Components v1.0

This API is a composition layer around the existing stable components. It does not
replace the grid renderer, algorithms, event dispatch, record model or global shell.
Visual and interaction rules are in `MASTER_LAYOUT.md`; scope rules are in `AGENTS.md`.

## Inventory

| Component | Implementation | Supported extension |
| --- | --- | --- |
| Header | `SEVAGO_SHARED_HEADER` | name, icon, iconSize, optional slot node |
| App Launcher / router | `SEVAGO_SHELL` | registerModule metadata, navigate, route/page config |
| Sidebar | `SEVAGO_SHARED_SIDEBAR.create` | menu, active/expanded/collapsed state, onNavigate |
| Page / title / tabs | `SEVAGO_UI.createDataPage` | title, tab keys/labels/callbacks, optional tabs |
| Data-module lifecycle | `SEVAGO_UI.defineDataModule` | pages, independent sources, selectRows callbacks |
| Table host | `SEVAGO_UI.createTable` → `SEVAGO_GRID_HOST.create` | schema, source, config, toolbar, actions |
| Toolbar | `SEVAGO_UI.mountToolbar` | tools/order/quick-filter bindings, feature visibility |
| Grouped Header band | `SEVAGO_UI.mountColumnGroups` | schema `group`; optional visibility |
| Selection Bar | `SEVAGO_UI.mountSelection` + existing engine | copy label, selection label, actions |
| Grid + Footer + Pagination | existing `SEVAGO_GRID.create` | existing instance options / public controller |
| Dialog/Popover/Tooltip/Checkbox | existing engine component system | public callbacks/renderers only |

No new modal, pagination, checkbox, table engine or launcher is created by v1.0.
All adapter-managed selectors/styles are shared or scoped to an isolated table Document.
Bag compatibility class hooks/attributes remain available for existing tests/integrations.

## Add a data module using configuration

Call this after shared helpers load, before shell startup via
`SEVAGO_MODULE_DEFINITIONS`, or register the returned definition at runtime using
`SEVAGO_SHELL.registerModule`. Do not add this example as real business data.

```js
const definition = SEVAGO_UI.defineDataModule({
  id: 'example-module',
  name: 'Tên ứng dụng',
  description: 'Tên nghiệp vụ',
  group: 'Vận hành sản xuất',
  icon: moduleIconDataURL,
  sidebar: [{id: 'records', label: 'Danh sách'}],
  pages: [{
    id: 'records', name: 'Danh sách', title: 'Danh sách',
    // Fetch once on first mount; no realtime polling.
    dataSource: async () => repository.list(),
    tabs: {
      primary: [{key: '', label: 'Tất cả'}, {key: 'waiting', label: 'Chờ xử lý'}],
      secondaryByPrimary: {
        waiting: [{key: '', label: 'Tất cả'}, {key: 'assigned', label: 'Đã điều phối'}]
      }
    },
    // Data policy belongs here, not in a shared widget or engine.
    selectRows: (records, state) => records.filter(record =>
      (!state.primary || record.status === state.primary) &&
      (!state.secondary || record.execution === state.secondary)),
    table: {
      primaryKey: 'code',
      schema: [
        {key: 'code', label: 'Mã', type: 'text', width: 150},
        {key: 'status', label: 'Trạng thái', type: 'select', width: 150, group: 'Thông tin'}
      ],
      defaultPinnedColumns: ['code'],
      defaultHiddenColumns: [],
      toolbar: {features: {group: true}},
      primaryTitle: 'Xuất dữ liệu', primaryLabel: 'Xuất dữ liệu',
      actions: {primary: api => exportRecords(api.getRows())},
      selection: {copyLabel: 'Sao chép mã', actions: []}
    }
  }]
});
window.SEVAGO_MODULE_DEFINITIONS = [
  ...(window.SEVAGO_MODULE_DEFINITIONS || []), definition
];
```

Each definition owns its navigation state and a separate page state/data context.
Each page source is cloned into its own records; each table is a separate Document/root.
Switching primary resets secondary; a module/page roundtrip preserves active tabs and
table state because the DOM/controller stays mounted. Page-specific state can be added
to the supplied state object. Loading/error/retry stay local to the page. Placeholders
and non-table pages can continue using an independent custom `mount` lifecycle while
reusing the global Header/Sidebar and design system.

Module `headerSlot({state,data})` can return an element or `{element, show, hide}`.
The helper attaches it with `SEVAGO_SHARED_HEADER.setSlot`, shows it while that module
is active, and hides it on module exit. Complex page-specific availability (as with Bag
scope) stays in that module's custom lifecycle.

## Compose a page in an existing module

`SEVAGO_UI.createDataPage({section, title, primaryTabs, secondaryTabs, compatibility})`
returns `section`, `panel`, `primary`, `secondary`, `slot`, `setTabs`, `destroy`.

- Tab item: `{key, label}`. Primary items are configured once on creation.
- Tab options: `{items, label, attribute, onChange}`; `attribute` is an optional
  compatibility data attribute, not a new grid identifier.
- `setTabs({primary, secondary, secondaryItems, secondaryGroup})` paints state only.
  Filtering and business state changes remain caller-owned.
- `secondaryItems: []` hides the entire secondary area. No primary items hides primary.
- Horizontal keyboard navigation uses arrows/Home/End, one tab stop per active strip.
- `compatibility` can retain legacy page/panel/primary/secondary/slot classes. New pages
  should use the canonical `.sevago-*` classes rather than copying Bag classes.

```js
const page = SEVAGO_UI.createDataPage({
  section, title: 'Danh sách',
  primaryTabs: {items: [{key: '', label: 'Tất cả'}], onChange: applyPrimary},
  secondaryTabs: {onChange: applySecondary}
});
page.setTabs({primary: '', secondary: '', secondaryItems: []});
const table = await SEVAGO_UI.createTable(page.slot, tableOptions);
// On module/page exit: table.api.suspend(); on return: table.api.resume().
// On permanent removal: table.destroy(); page.destroy().
```

## Table composition options

`await SEVAGO_UI.createTable(container, options)` returns the original host shape
`{iframe, api, destroy}` with composed-adapter cleanup. It uses exactly the existing
`SEVAGO_GRID` factory, once per isolated Document. Do not instantiate another engine
or duplicate grid source in the child document.

Existing options are forwarded: `id`, `title`, `storageKey`, `schema`, `primaryKey`,
`data`, `config`, `totalCount`, `selectionLabel`, `searchPlaceholder`, `primaryTitle`,
`primaryLabel`, `actions`, `toolIds`, `renderCell`, `onOpenRecord`, `hostCSS`.

Additional composition options:

| Option | Meaning |
| --- | --- |
| `dataSource()` | Optional async initial source; caller may instead supply `data` |
| `defaultColumnOrder` | Ordered field keys; missing schema fields appended |
| `defaultColumnWidths` | Object keyed by field key |
| `defaultPinnedColumns` | Field keys; utility columns keep engine behavior |
| `defaultHiddenColumns` | Field keys hidden initially |
| `config.columns` | Existing complete column config wins over the above defaults |
| `columnGroups: false` | Disable optional group band; otherwise use schema `group` |
| `toolbar` | Toolbar config or function of `api` returning config |
| `selection` | Copy label and configured selection business actions |
| `additionalActions` | Optional right-side actions `{id,label,run(api)}` |
| `compatibility` | Retain legacy grouped-header selector hooks when true |

`schema` entries keep existing `{key,label,type,width,hidden,group}`. `type` selects the
existing shared cell display. `renderCell(record,column,helpers)` may return custom
markup for a specific field or `null` to retain the standard renderer. It must stay
read-only and fit a 36px row. Escape untrusted values with supplied helpers. `group`
is presentation metadata, not the engine's record-grouping configuration.

`config` supports the engine's existing `columns`, `filters`, `logic`, `sorts`, `groups`,
`rules` etc. Filter/sort entries use `field`, not `key`. Numeric/date values must have
correct source types. Do not hide columns just to make the grid fit the viewport.

The returned controller retains existing `snapshot`, `getRows`, `getSelection`, `setData`,
`configure`, `setDisplayState`, `clearSelection`, `showDialog`, `dismissTransient`,
`suspend`, `resume`. `setData` defaults to resetting page and pruning row selection
outside the new source, while preserving table configuration. It does not persist
records to a backend or turn on realtime updates. Source refresh/API integration is
owned by the caller. State persists in the mounted instance across navigation; full
reload persistence remains limited to the engine's existing localStorage behavior.

No primary callback means no primary business button in new composed tables. Shared
composition disables legacy Planned Order selection action by default. A page must
supply its own business actions rather than inheriting an unrelated module's action.
The root legacy page retains its own original behavior unchanged.

## Toolbar configuration

```js
{
  label: 'Công cụ bảng',
  // Omit order for the v1.0 default.
  order: ['filter','sort','group','search','date','status','columns','more'],
  features: {sort: true, group: true, columns: true, more: true},
  quickFilters: [{
    key: 'status', options: [{key: 'open', label: 'Đang mở'}],
    allLabel: 'Tất cả trạng thái',
    getValue: api => getStatusFromConfig(api.snapshot().config),
    onChange: (value, api) => applyStatusConfig(value, api),
    disabled: false, title: 'Trạng thái'
  }]
}
```

Controls keep original IDs and event handlers. Generic engine controls are not
reimplemented. Keys `filter/sort/group/search/date/status/columns/more` refer to the
existing engine DOM. Quick filters may identify an existing control by `selector` or
provide an extension `element`, and support `options`, `allLabel`, `getValue`,
`onChange`, `disabled`, `title`, `description`. An extension must provide real binding;
there is no inferred business filter. The default native date control uses engine
`config.date` against record `created`; do not substitute another date field.

`features` controls toolbar visibility only. v1.0 does not introduce switches that
rewrite/disable grid algorithms or security guarantees. Permissions must be checked
by business handlers; UI disable/hide is not backend authorization.

Bag keeps its explicit legacy tool order. Missing Bag creation dates remain disabled
with their explanation; this task does not invent metadata or change demo records.

## Grouped Header adapter

`mountColumnGroups(doc,{schema,compatibility})` adds a 24px presentation band outside
the existing scroll container/36px leaf header. It measures live rendered widths,
order, pin offsets and scroll positions; it watches header changes. Reorder/hide may
split a logical group into contiguous segments. Resize/pin behavior and virtual row
math are still owned by the unchanged engine. Cleanup removes observers/listeners.
This is not a rewritten multi-row table renderer.

## Contextual selection actions

```js
selection: {
  copyLabel: 'Sao chép mã',
  actions: [{
    id: 'validate', label: 'Xác nhận', primary: true,
    enabled: rows => rows.length > 0 && canConfirm(rows),
    run: async (rows, api) => confirmThenExecute(rows, api),
    onError: error => showBusinessError(error)
  }]
}
```

The engine owns visibility: checkbox-selected records show the bar, cell/range-only
selection does not. Actions receive only that instance's selected records. Page
handlers own confirmations, eligibility checks and effects. Do not treat the example
as authorization to add a new business operation. Existing Bag currently has only
copy/deselect, while legacy Planned Order behavior remains protected.

## Header API

`configure({name,icon,iconSize,logoHTML,legacy})` changes only title/logo content in the
existing header. `logoHTML/legacy` support the preserved original shell; new modules
should provide `icon`/`iconSize`. `setSlot(owner,element)`, `getSlot(owner)` and
`clearSlot(owner)` manage optional content with no wrapper. Slot content must fit the
fixed 56px header, truncate long paths and own its overlay dismissal/lifecycle.

## Extension boundaries

New module files supply independent repository/data access, business rules, approved
custom cells, routing/menu metadata and page configuration. Shared files must not
import module repositories, status lists, source records or Planned Order/Bag logic.
Default layout/style values come from the existing design system; no new token values
or frameworks were introduced. Existing compatibility roots are not silently migrated
through a new renderer. Use the regression matrix before changing public adapters.
