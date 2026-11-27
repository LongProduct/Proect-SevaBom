# SEVAGO Advanced Data Table

Bản tích hợp tính năng trên khung UI Figma hiện có: giữ header, sidebar xanh `#07554B`, font Inter, các tab, status bar và hành động tạo phiếu nhập. Grid được nâng lên hàng/header cố định **36px** theo đặc tả mới. Đã đọc file tham khảo `SEVAGO_Table_Pin_Fixed_Contextual_Selection.html`; không đưa các thao tác inline edit, paste ghi dữ liệu, xóa cell hay bulk edit của file đó vào bảng chỉ xem.

## Tiêu chuẩn phát triển

Dự án áp dụng **SEVAGO Master Layout v1.0**. Trước khi bổ sung Module/Page, đọc
[AGENTS.md](AGENTS.md), [MASTER_LAYOUT.md](MASTER_LAYOUT.md) và
[SHARED_COMPONENTS.md](SHARED_COMPONENTS.md). Module mới có thể dùng
`SEVAGO_UI.defineDataModule`; Page có lifecycle riêng dùng `createDataPage` và
`createTable`. Engine, dữ liệu và các tương tác cũ được bảo toàn.

## Phiên bản hiện tại

Prototype SEVAGO gồm App Launcher dạng drawer, routing theo module và Shared Advanced Data Table với state độc lập. Module **Thực thi sản xuất → Danh sách bag** có 60 Bag demo, 56 trường dữ liệu (58 cột kể cả STT/Actions), Production Scope 4 cấp và Status Tabs hai tầng.

- Chờ sản xuất: Tất cả, Chờ điều phối, Đã điều phối.
- Đang sản xuất: Tất cả và 10 trạng thái thực thi.
- Secondary Tabs full width, padding 12px bốn cạnh, cao 56px; tab con cao 32px.
- Quick Filter Ngày tạo hiện bị khóa do demo chưa có dữ liệu ngày tạo.
- Đây là prototype frontend, không có backend hoặc phân quyền backend.

Route Bag: `/#/apps/manufacturing-execution/bags`. Kiến trúc: [MODULE_ARCHITECTURE](docs/MODULE_ARCHITECTURE.md). Mapping Figma: [BAG_FIELD_MAPPING](docs/BAG_FIELD_MAPPING.html). Các báo cáo HTML và JSON trong `docs/` và `tests/` ghi nhận từng lần kiểm thử; một số báo cáo cũ phản ánh phiên bản trước.

Sau khi chỉnh `src/`, chạy `python3 build.py` để tạo lại hai file HTML độc lập. Build dùng Python standard library; cần giữ `backups/figma-v1/` làm shell gốc. Các test `.cjs` dùng Playwright/Chrome; đường dẫn Playwright hiện trỏ runtime máy phát triển, cần đổi đường dẫn khi chạy trên máy khác.

## Chạy

Mở trực tiếp **SEVAGO_Advanced_Data_Table.html** bằng trình duyệt. Đây là một file độc lập, đã nhúng CSS, JavaScript, font, icon và ảnh; không cần mạng, thư viện CDN, npm hay bước build.

Hoặc chạy server local từ thư mục dự án:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Mở http://127.0.0.1:5173. `index.html` và `SEVAGO_Advanced_Data_Table.html` có cùng nội dung.

## Các phần đã triển khai

- 1.200 Order ERP trang sức, 34 kiểu Cell trong View **Thư viện Cell**, và View **Phiếu nhập** kế thừa dữ liệu đã lưu ở bản đầu.
- Một toolbar ngang: lọc, sắp xếp, nhóm, tìm kiếm, tùy chỉnh cột, công cụ khác và hành động chính. Tablet thu gọn nhãn; không wrap toolbar.
- Resize cột (tối thiểu 72px), double-click auto-fit, drag/drop thứ tự, ghim độc lập, ghim dải, bỏ ghim, ẩn/hiện, khôi phục độ rộng, context menu header. Header/colgroup/body lấy cùng một cấu hình độ rộng.
- Checkbox chọn hàng, chọn cả trang đang mở, Shift chọn dải; floating toolbar Copy mã / Planned Order / Clear. Toolbar không xuất hiện trong trang Detail.
- Click focus, kéo chọn vùng cell, bàn phím mũi tên/Tab/Home/End, Shift mở rộng, copy TSV, menu chỉ xem, preview nội dung tràn. Không có inline editor hoặc thao tác ghi dữ liệu từ bàn phím trong grid.
- Multi-tag: một nhãn và `+N`; tooltip tối liệt kê đầy đủ; overlay chỉ xem; xử lý 0/1/2/10/13 tag và nhãn dài; Esc/click ngoài đóng.
- Preview ảnh/nhiều ảnh và tệp TXT có nội dung thật tạo local, tải tệp; các kiểu relation/link/lookup/progress/rating/signature được hiển thị riêng.
- Search theo tất cả cột hiển thị hoặc một cột; highlight, `1 / N`, Enter/Shift+Enter, cuộn ngang/dọc và chuyển trang đến kết quả; tìm không lọc hoặc thay đổi record.
- Nhiều điều kiện AND/OR; toán tử theo kiểu; nhiều cấp sort có ưu tiên; nhóm hai cấp kết hợp virtual scrolling. Số đếm group phân biệt số record trên trang với tổng sau lọc.
- Default View và View cá nhân: lưu/đổi tên/xóa/reset; lưu order, width, hidden/pinned, filter, sort, group và conditional formatting vào localStorage. Cấu hình riêng ERP/Gallery không làm mất lựa chọn cùng tập Order.
- Một footer: tổng/đã lọc/đã chọn, phạm vi thống kê, Count/Sum/Avg/Min/Max theo field số, phân trang và Show All. Footer hẹp cho phép cuộn ngang.
- Virtual rendering luôn bật: chỉ render phần nhìn thấy và vùng đệm, cả khi Show All hoặc nhóm hai cấp. Loading/Empty/Error có thao tác phục hồi.
- **Record Detail Page** có route `#record=...`, hỗ trợ Back và quay lại grid. Tất cả chỉnh sửa nằm tại trang này. Gallery vẫn chỉ xem.
- Viewer / Editor / Admin mô phỏng. Planned Order kiểm tra quyền, khóa, trạng thái, số lượng và kế hoạch hiện có; cần xác nhận; không tạo từng phần khi có Order không hợp lệ.

## Cách dùng nhanh

- Nút **ERP View** ở bên phải các tab: chuyển Gallery/Phiếu nhập, lưu và quản lý View.
- **Công cụ khác** (`…`): Refresh, tạo Order tại Detail, trạng thái/ngày tạo, xuất CSV, conditional formatting, vai trò, trạng thái bảng và phím tắt.
- **Tạo phiếu nhập** vẫn mở luồng tạo phiếu gốc, nay qua Detail và View Phiếu nhập. Tạo Order ERP nằm ở More Tools.
- Click mã hoặc nút ngoài cùng phải để mở Detail. Enter/double-click cell cũng mở Detail; cell có preview riêng vẫn giữ hành vi preview.
- Tất cả vai trò chỉ xem grid. Editor/Admin sửa ở Detail; bản ghi bị khóa và Gallery không sửa. Admin thiết lập tô màu; mọi vai trò có thể quản lý View cá nhân.
- Cột ghim vượt vùng khả dụng sẽ tạm cuộn cùng bảng để không che cột khác; cấu hình ghim được khôi phục khi mở rộng màn hình/sidebar.

## Dữ liệu và giới hạn

Dữ liệu, phân quyền và Planned Order đều mô phỏng frontend, không phải API hay phân quyền máy chủ. Record chỉ tải khi mở trang hoặc Refresh. Lưu localStorage theo origin trình duyệt: mở `file://` và mở qua localhost có vùng lưu riêng. Ảnh trang sức/ảnh đại diện lấy từ asset Figma gốc và dùng làm ảnh mẫu. Preview attachment hiện hỗ trợ tệp TXT tạo local và ảnh; chưa tích hợp bộ đọc PDF/Office/STEP.

## Mã nguồn và build

- `src/grid.js`: controller, state, schema, renderer, overlay, View và nghiệp vụ.
- `src/grid.css`: style bổ sung cho grid, trang Detail và responsive.
- `assets/`: font/ảnh/icon Figma gốc.
- `backups/figma-v1/`: bản UI và chức năng trước khi tích hợp.
- `build.py`: kế thừa shell từ bản gốc, nhúng toàn bộ asset, xuất hai file HTML giống nhau.

Sau khi sửa source:

```bash
python3 build.py
```

Các file `app.js`, `styles.css`, `asset-manifest.js` ở root là nguồn của bản Figma đầu tiên, không được tải bởi HTML mới. Bản chạy mới chỉ có một state/controller trong `src/grid.js` được nhúng vào HTML.

## Kiểm thử

Mở `TEST_REPORT.html` để xem bảng Pass/Fail và phạm vi kiểm thử. Kết quả máy đọc được ở `tests/*results.json`; script Chrome/Playwright ở `tests/`. Bộ smoke ban đầu có thể dùng để chụp nhanh. Acceptance, edge cases và final routing là các bộ kiểm thử chính.

## Cập nhật UI tương tác

- Header bỏ icon loại dữ liệu, dành thêm chỗ cho title; menu xuất hiện khi hover/focus với vị trí cố định. Auto-fit tính lại theo header gọn hơn.
- Cell/range selection dùng interaction blue: `#316BFF`, `#EBF1FF`, `#ADC5FF`. Cell khởi đầu là Active Cell; copy không thêm viền hoặc khung phụ. Row selection bằng checkbox giữ style cũ.
- Click cell text thực sự bị truncate mở Expanded Cell Preview trắng, viền xanh, word wrap tại cell; giới hạn trong table/viewport, không reflow. Drag và Shift chọn vùng không mở preview. Double-click/Enter vẫn mở Detail. Ảnh/tệp/tag giữ preview chuyên dụng.
- Preview đóng bằng Esc, click ngoài, chọn cell khác, scroll hoặc resize. Toàn bộ table vẫn chỉ xem, hàng/header 36px.
- Chạy `node tests/grid-ui-refinements.cjs` cho 16 ca mới; `python3 tests/build_report.py` cập nhật bảng Pass/Fail sau khi chạy các bộ kiểm thử.

- Cột đầu mặc định hiện STT; hover hàng hiện checkbox, hàng đã chọn giữ checkbox. Header checkbox giữ đủ ba trạng thái. STT theo thứ tự dữ liệu đã lọc/sort và offset phân trang, không thay đổi cột 46px hoặc hàng 36px. Kiểm thử riêng: `tests/grid-row-numbers.cjs`.

## Demo Danh sách Cân Bag

Route: `/#/apps/manufacturing-execution/bag-weighing`. Trang dùng shared page/table,
60 bản ghi riêng (40 Chờ Out, 20 Đã điều phối), mặc định Chờ Out. Checkbox và
selection bar hoạt động độc lập với range selection; dữ liệu/state không dùng chung
với Danh sách bag. Trọng lượng là số demo giữ nguyên giá trị, chưa gán đơn vị Production.

Luồng cân và điều kiện nghiệp vụ chưa được đặc tả: hai nút Cân Bag dùng cùng guard,
tạm disabled và có tooltip giải thích. Chế độ xem Production và icon mở rộng chưa
được xác minh nên chưa hiển thị. Search giữ cơ chế điều hướng/highlight của shared
grid; không lọc bỏ bản ghi khi không có kết quả. Không thay đổi engine để xử lý riêng.

Kiểm thử trang: `SEVAGO_TEST_URL=http://127.0.0.1:6187 node tests/bag-weighing.cjs`.
