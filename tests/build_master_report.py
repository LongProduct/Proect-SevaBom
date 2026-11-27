from pathlib import Path
import json, html, hashlib, subprocess
root=Path(__file__).resolve().parent.parent
files=['module-results.json','module-business-results.json','ui-results.json','drawer-results.json','manufacturing-results.json','adapter-results.json','bags-results.json','bag-nested-tabs-results.json','bag-toolbar-results.json','bag-fields-results.json','master-layout-api-results.json','master-layout-visual-results.json']
rows=[]
for file in files:
    data=json.loads((root/'tests'/file).read_text())
    for result in data['results']:
        rows.append((file,data.get('at',''),result))
failed=[r for _,_,r in rows if r['status']!='PASS']
if failed: raise SystemExit('Regression failures: '+json.dumps(failed,ensure_ascii=False))
protected=['src/grid.js','src/grid.css','src/grid-host.js','src/shell.css','src/shared-sidebar.js','src/modules/bags-data.js','src/modules/bags-scope.js','src/modules/bags-export.js']
for name in protected:
    baseline=subprocess.check_output(['git','show','checkpoint/sevago-before-master-layout-v1:'+name],cwd=root)
    assert hashlib.sha256(baseline).digest()==hashlib.sha256((root/name).read_bytes()).digest(),name
assert (root/'index.html').read_bytes()==(root/'SEVAGO_Advanced_Data_Table.html').read_bytes()
body=''.join('<tr><td>'+html.escape(f)+'</td><td>'+html.escape(at)+'</td><td>'+html.escape(r['name'])+'</td><td>PASS</td><td>'+html.escape(json.dumps({k:v for k,v in r.items() if k not in ['name','status']},ensure_ascii=False) if len(r)>2 else '')+'</td></tr>' for f,at,r in rows)
visual=json.loads((root/'tests/master-layout-visual-results.json').read_text())['results']
notes=[r for r in visual if 'differentPixels' in r]
sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
(root/'MASTER_LAYOUT_TEST_REPORT.html').write_text('''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEVAGO Master Layout v1.0 Regression</title><style>body{font:14px/1.6 system-ui;padding:28px;color:#344054}h1{color:#07554b}table{border-collapse:collapse;width:100%;font-size:12px}th,td{padding:8px;border:1px solid #e5e7eb;text-align:left;vertical-align:top}th{background:#f4f6f5}code{word-break:break-all}</style><h1>SEVAGO Master Layout v1.0 — '''+str(len(rows))+''' / '''+str(len(rows))+''' PASS</h1><p>Audit và shared adapter extraction; không viết lại Grid Engine hoặc đổi nghiệp vụ/dữ liệu. Git checkpoint: checkpoint/sevago-before-master-layout-v1.</p><p>SHA-256 không đổi: '''+html.escape(', '.join(protected))+'''. Hai artifact HTML khớp nhau. Artifact SHA-256: <code>'''+sha+'''</code>.</p><p>Kiểm tra bảy trạng thái: legacy ERP, Bag mặc định, Chờ sản xuất, Đang sản xuất, tablet, Launcher và Module chưa triển khai. So sánh hình học và Computed Style của Header, slot, title, tabs, toolbar, grid và footer; đối chiếu ảnh chụp trước/sau trên cùng Chrome và viewport, chờ giải mã font/ảnh.</p><p>Chi tiết sai khác raster được phép (mép anti-alias, hình học/style vẫn khớp): '''+html.escape(json.dumps(notes,ensure_ascii=False))+'''. Không dùng dung sai để bỏ qua thay đổi bố cục.</p><p>Module QA hai Page được đăng ký chỉ trong kiểm thử: config tạo menu, nguồn dữ liệu độc lập, Tabs, Table và business callbacks; chuyển Page/Module giữ state. Không thêm Module QA vào catalog thật. Đã kiểm tra toàn bộ Bag interactions và regression legacy, drawer, sidebar, routing, offline HTML, copy, drag, pin, search/filter/sort/group, pagination, footer và multi-instance isolation.</p><p>Giới hạn được giữ nguyên: prototype frontend, không có backend authorization; Ngày tạo Bag vẫn disabled do thiếu dữ liệu; các Module chưa triển khai vẫn placeholder; không bổ sung toàn bộ state persistence sau reload. Không deploy/push trong lần chuẩn hóa này.</p><table><thead><tr><th>Suite</th><th>Thời điểm</th><th>Kiểm tra</th><th>Kết quả</th><th>Chi tiết</th></tr></thead><tbody>'''+body+'</tbody></table></html>')
print(f'{len(rows)}/{len(rows)} PASS; protected hashes unchanged; report generated.')
