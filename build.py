from pathlib import Path
import re,base64,mimetypes,json
root=Path(__file__).resolve().parent
original=(root/'backups/figma-v1/index.html').read_text()
header=re.search(r'<header.*?</header>',original,re.S).group()
aside=re.search(r'<aside.*?</aside>',original,re.S).group()
tabs=re.search(r'<div class="tabs".*?</div>',original,re.S).group()
statuses=re.search(r'<div class="statuses".*?</div>',original,re.S).group()
# Preserve the original labels; map their existing interactions to ERP business states.
values=['','Mới','Đang xử lý','Đang xử lý','Hoàn thành','Đã huỷ']
i=iter(values)
statuses=re.sub(r'data-status="[^"]+"',lambda m:'data-status='+m.group().split('=',1)[1]+' data-value="'+next(i)+'"',statuses)
html=f'''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEVAGO — Advanced Data Table</title><style>__CSS__</style></head><body>
{header}
<div class="workspace">{aside}<main><h1>Quản lý nhân sự</h1><div class="view-row">{tabs}</div><section class="panel">{statuses}<div class="content">
<div class="toolbar" aria-label="Công cụ bảng"><button class="filter" id="filter" data-popup-trigger><img src="assets/29978-21837-942a1.svg" alt=""><span>Bộ lọc</span><b id="filter-count" hidden></b></button><button class="btn" id="sort" data-popup-trigger title="Sắp xếp" aria-label="Sắp xếp"><span data-icon="sort"></span><span class="tool-label">Sắp xếp</span><small class="toolbar-count" id="sort-count"></small></button><button class="btn" id="group" data-popup-trigger title="Nhóm" aria-label="Nhóm"><span data-icon="group"></span><span class="tool-label">Nhóm</span><small class="toolbar-count" id="group-count"></small></button>
<label class="search"><img src="assets/29978-21837-aed8d.svg" alt=""><input id="search" type="text" placeholder="Tìm trong bảng…" aria-label="Tìm trong bảng" autocomplete="off" spellcheck="false"><span id="search-count" aria-live="polite" hidden></span><button id="search-prev" title="Kết quả trước · Shift+Enter" aria-label="Kết quả trước" type="button" hidden><span data-icon="up"></span></button><button id="search-next" title="Kết quả tiếp · Enter" aria-label="Kết quả tiếp" type="button" hidden><span data-icon="down"></span></button><button id="search-close" title="Đóng tìm kiếm" aria-label="Đóng tìm kiếm" type="button" hidden><span data-icon="close"></span></button><button id="search-settings" title="Phạm vi tìm kiếm" aria-label="Phạm vi tìm kiếm" type="button" data-popup-trigger><span data-icon="more"></span></button></label>
<label class="date quick-filter"><span>Ngày tạo</span><input type="date" id="date" aria-label="Ngày tạo"></label><label class="select-wrap quick-filter"><select id="status" aria-label="Trạng thái"><option value="">Tất cả trạng thái</option><option>Mới</option><option>Đang xử lý</option><option>Hoàn thành</option><option>Đã huỷ</option><option>Nháp</option><option>Đang tiếp nhận</option><option>Đang thực hiện</option><option>Trả hàng</option></select><img src="assets/29978-21837-d29bb.svg" alt=""></label>
<button class="btn" id="columns" title="Tùy chỉnh cột" aria-label="Tùy chỉnh cột" data-popup-trigger><span data-icon="columns"></span><span class="tool-label">Cột</span></button><button class="btn" id="more-tools" title="Công cụ khác" aria-label="Công cụ khác" data-popup-trigger><span data-icon="more"></span></button><div class="toolbar-right"><button class="primary" id="create"><img src="assets/29978-21837-1441d.svg" alt="">Tạo phiếu nhập</button><button class="square" id="quick-create" aria-label="Thêm phiếu nhập"><img src="assets/29978-21837-265f1.svg" alt=""></button></div></div>
<div class="grid-region"><div class="table-scroll" id="table-scroll" tabindex="0" aria-label="Bảng dữ liệu chỉ xem. Phím mũi tên để di chuyển, Enter mở chi tiết."><table id="data-table" role="grid" aria-readonly="true" aria-multiselectable="true"><colgroup id="colgroup"></colgroup><thead><tr id="head-row"></tr></thead><tbody id="body-rows"></tbody></table></div><div class="grid-state" id="grid-state" role="status" hidden></div></div>
<footer class="grid-footer"><div class="footer-summary"><span id="record-summary"></span></div><div class="pagination"><nav aria-label="Phân trang" id="pages"></nav><label class="select-wrap page-size"><select id="page-size" aria-label="Số dòng mỗi trang"><option value="50">50 / trang</option><option value="100">100 / trang</option><option value="all">Show All</option></select><img src="assets/29978-21907-d29bb.svg" alt=""></label></div></footer>
</div></section></main></div>
<div id="selection-toolbar" class="floating-selection" role="toolbar" aria-label="Thao tác bản ghi đã chọn" hidden><span id="selection-count"></span><button id="copy-codes" class="btn"><span data-icon="copy"></span>Copy mã</button><button id="planned-order" class="primary"><span data-icon="plus"></span>Tạo Planned Order</button><button id="clear-selection" aria-label="Bỏ chọn tất cả" title="Bỏ chọn tất cả"><span data-icon="close"></span></button></div>
<dialog id="main-dialog" aria-label="Chi tiết thao tác"></dialog><div class="toast" id="toast" role="status" hidden></div><script>__JS__</script></body></html>'''
css=(root/'backups/figma-v1/styles.css').read_text()+'\n'+(root/'src/grid.css').read_text()+'\n'+(root/'src/shell.css').read_text()+'\n'+(root/'src/modules/bags.css').read_text()
assets={}
for p in (root/'assets').rglob('*'):
 if p.suffix in ['.svg','.png','.woff2']:
  mime='font/woff2' if p.suffix=='.woff2' else mimetypes.guess_type(p)[0]
  assets[str(p.relative_to(root))]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
grid_template=html.split('<script>__JS__</script>')[0]+'</body></html>'
grid_template=grid_template.replace('__CSS__',css.replace("url('assets/InterVariable.woff2')","url('"+assets['assets/InterVariable.woff2']+"')"))
for key,url in assets.items():grid_template=grid_template.replace('src="'+key+'"','src="'+url+'"')
js="const PRODUCT="+repr(assets['assets/29978-21861-1bd11.png'])+";\nconst AVATAR="+repr(assets['assets/29978-21861-11360.png'])+";\n"+(root/'src/grid.js').read_text()
js+='\nconst SEVAGO_GRID_TEMPLATE='+json.dumps(grid_template)+';\n'+(root/'src/grid-host.js').read_text()+'\n';
js+='\nconst SHELL_ASSETS='+json.dumps({p.stem:assets[str(p.relative_to(root))] for p in (root/'assets/launcher').glob('*.svg')})+';\n'+(root/'src/shared-sidebar.js').read_text()+'\n'+'\n'.join((root/p).read_text() for p in ['src/modules/bags-data.js','src/modules/bags-scope.js','src/modules/bags-export.js','src/modules/bags-page.js','src/modules/manufacturing-execution.js'])+'\n'+(root/'src/shell.js').read_text()
css=css.replace("url('assets/InterVariable.woff2')","url('"+assets['assets/InterVariable.woff2']+"')")
html=html.replace('__CSS__',css).replace('__JS__',js)
for key,url in assets.items():html=html.replace('src="'+key+'"','src="'+url+'"')
(root/'index.html').write_text(html)
(root/'SEVAGO_Advanced_Data_Table.html').write_text(html)
print('Built standalone HTML:',len(html),'characters')
