/* Bag-only demo repository. Replace list() with an API without sharing ERP records. */
window.SEVAGO_BAG_DATA=(()=>{
 const statuses=['Chờ sản xuất','Đang sản xuất','Hoàn thành sản xuất','Chờ hủy','Đã hủy','Chờ cấp nguyên vật liệu','Chờ nhập kho','Thiếu nguyên liệu','Đánh giá kỹ thuật','Chờ lên kế hoạch','Chờ kiểm tra'];
 const secondaryStatuses=['Chờ điều phối','Đã điều phối','Chờ SETUP','Đang SETUP','Chờ ON','Đang ON','Chờ OUT','Đã OUT','PAUSE','PENDING'];
 const secondaryByPrimary=Object.freeze({'Chờ sản xuất':Object.freeze(['Chờ điều phối','Đã điều phối']),'Đang sản xuất':Object.freeze([...secondaryStatuses])});
 const sites=[{id:'site-main',name:'Khu sản xuất chính',allowed:true},{id:'site-hitech',name:'Khu công nghệ cao',allowed:true},{id:'site-restricted',name:'Cơ sở chưa được cấp quyền',allowed:false}];
 const workshops=sites.flatMap(site=>['A','B'].map(code=>({id:`${site.id}-workshop-${code}`,name:`Xưởng ${code}`,site:site.id})));
 const lines=workshops.flatMap(w=>['01','02'].map(code=>({id:`${w.id}-line-${code}`,name:`Line ${code}`,workshop:w.id,site:w.site})));
 const workcenters=lines.flatMap(line=>['01','02','03'].map(code=>({id:`${line.id}-wc-${code}`,name:`WC-${code}`,line:line.id,workshop:line.workshop,site:line.site})));
 const people=['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Nam','Phạm Ngọc Mai','Võ Minh Quân','Đặng Thị Lan'];
 const accessible=workcenters.filter(w=>sites.find(s=>s.id===w.site)?.allowed);
 const records=Array.from({length:60},(_,i)=>{const wc=accessible[i%accessible.length],status=statuses[i%statuses.length];return {id:`bag-${i+1}`,code:`BAG-${String(i+1).padStart(5,'0')}`,priority:['Bình thường','Cao','Khẩn','Thấp'][i%4],status,execution:status==='Đang sản xuất'?'Đang thực hiện':status==='Hoàn thành sản xuất'?'Hoàn thành':status==='Đã hủy'?'Đã hủy':'Chưa thực hiện',currentModule:['Đúc','Chế tác','Gắn đá','Hoàn thiện'][i%4],operation:['Kiểm tra phôi','Chế tác bề mặt','Gắn đá','Đánh bóng và kiểm tra chất lượng thành phẩm'][i%4],assignedTo:people[i%people.length],holder:people[(i+2)%people.length],orderGroup:['OG-2026-001','OG-2026-002','OG-2026-003'][i%3],orderType:['Sales Order','Group Purchase Order'][i%2],site:wc.site,workshop:wc.workshop,line:wc.line,workcenter:wc.id};});
 // Preserve 60 IDs/scope assignments; redistribute eight demo records to cover every substatus.
 for(const i of [2,3,4,5])records[i].status='Chờ sản xuất';
 for(const i of [6,7,8,9])records[i].status='Đang sản xuất';
 for(const [primary,substatuses]of Object.entries(secondaryByPrimary))records.filter(r=>r.status===primary).forEach((r,i)=>r.execution=substatuses[i%substatuses.length]);
 const schema=[
 {
  "key": "code",
  "label": "Mã bag",
  "group": "",
  "type": "text",
  "width": 150,
  "figmaNode": "I30175:31908;30216:49534"
 },
 {
  "key": "priority",
  "label": "Ưu tiên",
  "group": "",
  "type": "select",
  "width": 108,
  "figmaNode": "I30175:31908;30203:34832"
 },
 {
  "key": "status",
  "label": "TT hiện tại",
  "group": "Trạng thái",
  "type": "select",
  "width": 104,
  "figmaNode": "I30175:31908;30175:32011"
 },
 {
  "key": "execution",
  "label": "TT thực thi",
  "group": "Trạng thái",
  "type": "select",
  "width": 107,
  "figmaNode": "I30175:31908;30203:34902"
 },
 {
  "key": "currentModule",
  "label": "Module điều phối",
  "group": "Trạng thái",
  "type": "select",
  "width": 149,
  "figmaNode": "I30175:31908;30175:31988"
 },
 {
  "key": "operation",
  "label": "Công đoạn hiện tại",
  "group": "Trạng thái",
  "type": "text",
  "width": 159,
  "figmaNode": "I30175:31908;30203:34913"
 },
 {
  "key": "assignedTo",
  "label": "Người được điều phối",
  "group": "Trạng thái",
  "type": "person",
  "width": 177,
  "figmaNode": "I30175:31908;30203:34924"
 },
 {
  "key": "holder",
  "label": "Người giữ bag",
  "group": "Trạng thái",
  "type": "person",
  "width": 127,
  "figmaNode": "I30175:31908;30203:34935"
 },
 {
  "key": "orderGroup",
  "label": "Order group",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 118,
  "figmaNode": "I30175:31908;30208:18898"
 },
 {
  "key": "orderType",
  "label": "Order Type",
  "group": "Đơn hàng / sản phẩm",
  "type": "select",
  "width": 108,
  "figmaNode": "I30175:31908;30203:35044"
 },
 {
  "key": "unit",
  "label": "Unit",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35045"
 },
 {
  "key": "productionLine",
  "label": "Line Wax / Line SX",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 157,
  "figmaNode": "I30175:31908;30203:35046"
 },
 {
  "key": "orderCode",
  "label": "Mã Order",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 96,
  "figmaNode": "I30175:31908;30203:35047"
 },
 {
  "key": "customerCode",
  "label": "Mã KH",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35048"
 },
 {
  "key": "mpsCode",
  "label": "Mã MPS",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35049"
 },
 {
  "key": "castingOrderCode",
  "label": "Mã Casting Order",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 151,
  "figmaNode": "I30175:31908;30203:35116"
 },
 {
  "key": "productCode",
  "label": "Mã sản phẩm",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 122,
  "figmaNode": "I30175:31908;30203:35127"
 },
 {
  "key": "designCode",
  "label": "Mã thiết kế",
  "group": "Đơn hàng / sản phẩm",
  "type": "text",
  "width": 108,
  "figmaNode": "I30175:31908;30203:35138"
 },
 {
  "key": "plannedQuantity",
  "label": "SL dự kiến",
  "group": "Số lượng",
  "type": "number",
  "width": 103,
  "figmaNode": "I30175:31908;30203:35153"
 },
 {
  "key": "actualQuantity",
  "label": "SL thực tế",
  "group": "Số lượng",
  "type": "number",
  "width": 102,
  "figmaNode": "I30175:31908;30203:35154"
 },
 {
  "key": "inputWeight",
  "label": "TL IN",
  "group": "Trọng lượng",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35274"
 },
 {
  "key": "metalWeight",
  "label": "TL metal",
  "group": "Trọng lượng",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35275"
 },
 {
  "key": "stoneWeight",
  "label": "TL đá",
  "group": "Trọng lượng",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35276"
 },
 {
  "key": "materialType",
  "label": "Loại NL",
  "group": "Nguyên liệu",
  "type": "select",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35379"
 },
 {
  "key": "goldContent",
  "label": "Hàm lượng vàng",
  "group": "Nguyên liệu",
  "type": "number",
  "width": 142,
  "figmaNode": "I30175:31908;30203:35380"
 },
 {
  "key": "materialAge",
  "label": "Tuổi NL",
  "group": "Nguyên liệu",
  "type": "select",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35381"
 },
 {
  "key": "materialColor",
  "label": "Màu NL",
  "group": "Nguyên liệu",
  "type": "select",
  "width": 95,
  "figmaNode": "I30175:31908;30203:35422"
 },
 {
  "key": "outWeight",
  "label": "OUT",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30208:18941"
 },
 {
  "key": "carotWeight",
  "label": "Carot",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30208:18947"
 },
 {
  "key": "scrapWeight",
  "label": "Vụn phế phẩm",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 133,
  "figmaNode": "I30175:31908;30208:18953"
 },
 {
  "key": "fragmentWeight",
  "label": "TL vụn",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30208:18959"
 },
 {
  "key": "dustWeight",
  "label": "TL bụi",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 95,
  "figmaNode": "I30175:31908;30208:18965"
 },
 {
  "key": "castingScrapCAS",
  "label": "Dẻ đúc casting (CAS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 180,
  "figmaNode": "I30175:31908;30208:18971"
 },
 {
  "key": "castingScrapFCS",
  "label": "Dẻ đúc HTJ (FCS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 156,
  "figmaNode": "I30175:31908;30208:18977"
 },
 {
  "key": "scrap24K",
  "label": "Dẻ 24K (24K)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 127,
  "figmaNode": "I30175:31908;30208:18983"
 },
 {
  "key": "fragmentHPS",
  "label": "TL Vụn HTJ (HPS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 156,
  "figmaNode": "I30175:31908;30208:18989"
 },
 {
  "key": "fragmentDCS",
  "label": "TL Vụn đúc (DCS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 156,
  "figmaNode": "I30175:31908;30208:18995"
 },
 {
  "key": "fragmentSHS",
  "label": "TL Vụn trứng cá (SHS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 187,
  "figmaNode": "I30175:31908;30208:19001"
 },
 {
  "key": "fragmentDFS",
  "label": "TL Vụn findings (DFS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 183,
  "figmaNode": "I30175:31908;30208:19007"
 },
 {
  "key": "fragmentRFS",
  "label": "TL Vụn REJ (RFS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 154,
  "figmaNode": "I30175:31908;30208:19013"
 },
 {
  "key": "dustHPD",
  "label": "TL Bụi HTJ (HPD)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 152,
  "figmaNode": "I30175:31908;30208:19019"
 },
 {
  "key": "dustDCD",
  "label": "TL Bụi móc máy (DCD)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 188,
  "figmaNode": "I30175:31908;30208:19025"
 },
 {
  "key": "dustSPD",
  "label": "TL Bụi sprue (SPD)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 163,
  "figmaNode": "I30175:31908;30208:19031"
 },
 {
  "key": "productionScrapPPS",
  "label": "TL Vụn sản xuất (PPS)",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 186,
  "figmaNode": "I30175:31908;30208:19037"
 },
 {
  "key": "totalOutWeight",
  "label": "Tổng OUT",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 104,
  "figmaNode": "I30175:31908;30208:19043"
 },
 {
  "key": "lossContent",
  "label": "Hàm lượng",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 109,
  "figmaNode": "I30175:31908;30208:19049"
 },
 {
  "key": "remainingQuantity",
  "label": "SL còn lại",
  "group": "Trọng lượng hao hụt",
  "type": "number",
  "width": 101,
  "figmaNode": "I30175:31908;30208:19055"
 },
 {
  "key": "plannedStart",
  "label": "Ngày bắt đầu dự kiến",
  "group": "Thời gian dự kiến",
  "type": "datetime",
  "width": 180,
  "figmaNode": "I30175:31908;30208:19098"
 },
 {
  "key": "plannedSync",
  "label": "Ngày đồng bộ dự kiến",
  "group": "Thời gian dự kiến",
  "type": "datetime",
  "width": 184,
  "figmaNode": "I30175:31908;30208:19104"
 },
 {
  "key": "plannedEnd",
  "label": "Ngày hoàn thành dự kiến",
  "group": "Thời gian dự kiến",
  "type": "datetime",
  "width": 204,
  "figmaNode": "I30175:31908;30208:19110"
 },
 {
  "key": "pauseReasons",
  "label": "Số lý do Pause",
  "group": "Pause",
  "type": "number",
  "width": 135,
  "figmaNode": "I30175:31908;30208:19153"
 },
 {
  "key": "pauseDuration",
  "label": "Thời gian Pause",
  "group": "Pause",
  "type": "text",
  "width": 143,
  "figmaNode": "I30175:31908;30208:19159"
 },
 {
  "key": "pendingInternalReasons",
  "label": "Số lý do Pending chủ quan",
  "group": "Pending",
  "type": "number",
  "width": 215,
  "figmaNode": "I30175:31908;30208:19202"
 },
 {
  "key": "pendingInternalDuration",
  "label": "Thời gian Pending chủ quan",
  "group": "Pending",
  "type": "text",
  "width": 222,
  "figmaNode": "I30175:31908;30208:19208"
 },
 {
  "key": "pendingExternalReasons",
  "label": "Số lý do Pending khách quan",
  "group": "Pending",
  "type": "number",
  "width": 231,
  "figmaNode": "I30175:31908;30208:19214"
 },
 {
  "key": "pendingExternalDuration",
  "label": "Thời gian Pending khách quan",
  "group": "Pending",
  "type": "text",
  "width": 238,
  "figmaNode": "I30175:31908;30208:19220"
 }
].map(c=>({...c,hidden:false}));
 // Illustrative, page-owned values. No production calculation or API contract is inferred.
 records.forEach((r,i)=>{
  const n=i+1,planned=3+i%18,actual=r.status==='Hoàn thành sản xuất'?planned:i%planned,age=[24,18,14][i%3];
  Object.assign(r,{unit:['Cái','Đôi'][i%2],productionLine:lines.find(l=>l.id===r.line).name,orderCode:`MO-2026-${String(n).padStart(5,'0')}`,customerCode:`KH-${String(i%8+1).padStart(4,'0')}`,mpsCode:`MPS-2026-${String(i%12+1).padStart(4,'0')}`,castingOrderCode:`CAS-2026-${String(i%15+1).padStart(4,'0')}`,productCode:`SP-AU-${String(n).padStart(5,'0')}`,designCode:`GY11RG${String(n).padStart(8,'0')}A00A000000000000012`,plannedQuantity:planned,actualQuantity:actual,inputWeight:+(planned*2.5).toFixed(2),metalWeight:+(planned*2.2).toFixed(2),stoneWeight:+(planned*.3).toFixed(2),materialType:'AU',goldContent:[99.99,75,58.5][i%3],materialAge:age+'K',materialColor:['Y','W','R'][i%3],remainingQuantity:planned-actual,lossContent:[99.99,75,58.5][i%3],plannedStart:`2026-11-${String(i%20+1).padStart(2,'0')}T08:00:00`,plannedSync:`2026-11-${String(i%20+2).padStart(2,'0')}T12:00:00`,plannedEnd:`2026-11-${String(i%20+3).padStart(2,'0')}T17:00:00`,pauseReasons:i%3,pauseDuration:`${i%3*120} giây`,pendingInternalReasons:i%2,pendingInternalDuration:`${i%2*300} giây`,pendingExternalReasons:i%4,pendingExternalDuration:`${i%4*180} giây`});
  for(const key of ['outWeight','carotWeight','scrapWeight','fragmentWeight','dustWeight','castingScrapCAS','castingScrapFCS','scrap24K','fragmentHPS','fragmentDCS','fragmentSHS','fragmentDFS','fragmentRFS','dustHPD','dustDCD','dustSPD','productionScrapPPS','totalOutWeight'])r[key]=+(i%7*.013*(1+schema.findIndex(c=>c.key===key)%5)).toFixed(3);
 });
 const repository={async list(){return records.map(r=>({...r}));},sites:sites.filter(s=>s.allowed),workshops,lines,workcenters,statuses,secondaryByPrimary,schema,authorized(r){return sites.some(s=>s.id===r.site&&s.allowed);},inScope(r,scope){return ['site','workshop','line','workcenter'].every(k=>!scope[k]||r[k]===scope[k]);},path(scope){return [['site',sites],['workshop',workshops],['line',lines],['workcenter',workcenters]].map(([key,items])=>items.find(x=>x.id===scope[key])?.name).filter(Boolean).join(' / ')||'Tất cả phạm vi sản xuất';}};
 return Object.freeze(repository);
})();
