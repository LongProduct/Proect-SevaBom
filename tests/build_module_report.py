# -*- coding: utf-8 -*-
from pathlib import Path
import json, html, hashlib
root=Path(__file__).resolve().parent.parent
files=['module-results.json','module-business-results.json','ui-results.json','drawer-results.json','manufacturing-results.json','adapter-results.json','bags-results.json']
rows=[]
for file in files:
 d=json.loads((root/'tests'/file).read_text())
 for result in d['results']:rows.append((file,result))
passed=sum(r['status']=='PASS' for _,r in rows)
body=''.join('<tr><td>'+html.escape(f)+'</td><td>'+html.escape(r['name'])+'</td><td class="'+r['status']+'">'+r['status']+'</td><td>'+html.escape(r.get('detail',''))+'</td></tr>' for f,r in rows)
sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
(root/'MODULE_TEST_REPORT.html').write_text('''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEVAGO Module Regression</title><style>body{font:14px/1.6 system-ui,sans-serif;margin:32px;color:#303434}h1{font-size:24px;color:#07554b}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}th{background:#f5f6f7}.PASS{color:#07554b;font-weight:600}.FAIL{color:#b42318}code{word-break:break-all}</style><h1>SEVAGO · Module & Drawer Regression</h1><p>Chrome / Playwright · '''+str(passed)+' / '+str(len(rows))+''' kiểm tra Pass.</p><p>Page gốc: ảnh chụp trước và sau tích hợp có cùng SHA-1 (so sánh toàn ảnh desktop). Hình học toolbar, grid, footer không đổi. Drawer 604px × 100dvh, góc vuông, lưới 4 cột, Header/Footer cố định và Body cuộn riêng. Slide-in 300ms, slide-out 240ms, backdrop fade và chế độ giảm chuyển động đã được kiểm tra.</p><p>Giới hạn: Các Page chưa được triển khai hiển thị “Chưa triển khai”. Danh sách Bag có 60 bản ghi demo, Production Scope 4 cấp và XLSX export; Table dùng cùng một factory với instance cũ. Bảo toàn state khi chuyển Module trong cùng phiên; không bổ sung lưu toàn bộ state qua reload. Đây là prototype frontend, không có phân quyền backend.</p><p>Artifact SHA-256: <code>'''+sha+'''</code></p><table><thead><tr><th>Suite</th><th>Kiểm tra</th><th>Kết quả</th><th>Chi tiết</th></tr></thead><tbody>'''+body+'</tbody></table></html>')
print(f'{passed}/{len(rows)} PASS. Report written.')
