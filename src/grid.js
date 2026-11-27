/* SEVAGO grid: one controller; records are separate from view configuration. */
(() => {
'use strict';
const instanceRoots=new WeakMap();
function createTableInstance(instanceOptions={}){
const document=instanceOptions.root||globalThis.document,window=document.defaultView||globalThis.window;
if(document.nodeType!==9)throw new TypeError('Table root phải là Document; dùng SEVAGO_GRID_HOST.create cho DOM container.');
if(instanceRoots.has(document))throw new Error('DOM root này đã có một Table instance.');
const location=window.location,history=window.history;
const custom=Boolean(instanceOptions.schema);
let sourceRecords=instanceOptions.data?JSON.parse(JSON.stringify(instanceOptions.data)):null;
const $ = (s, root=document) => root.querySelector(s), $$ = (s,root=document) => [...root.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = v => JSON.parse(JSON.stringify(v));
const fmt = v => Number(v).toLocaleString('vi-VN',{maximumFractionDigits:2});
const paths = {
 filter:'<path d="M4 4h16l-6 7v7l-4 2v-9z"/>', sort:'<path d="M8 4v16m-3-3 3 3 3-3M15 4h5m-5 5h4m-4 5h3m-3 5h2"/>',group:'<rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/><rect x="14" y="13" width="7" height="8" rx="1"/>',
 columns:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v16"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',down:'<path d="m6 9 6 6 6-6"/>',up:'<path d="m6 15 6-6 6 6"/>',left:'<path d="m15 6-6 6 6 6"/>',right:'<path d="m9 6 6 6-6 6"/>',first:'<path d="m17 6-6 6 6 6M6 6v12"/>',last:'<path d="m7 6 6 6-6 6M18 6v12"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',pin:'<path d="m16 3 5 5-4 1-4 5-1 4-3-3-5 5m5-5-3-3 4-1 5-4z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',refresh:'<path d="M20 7V3l-4 4A8 8 0 1 0 3 12M20 3v5h-5"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',save:'<path d="M5 3h12l4 4v14H3V3h2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',edit:'<path d="m16 3 5 5-12 12-6 1 1-6Z M14 5l5 5"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',text:'<path d="M4 5h16M8 5v14m8-14v14M5 19h6m2 0h6"/>',number:'<path d="m10 3-4 18M18 3l-4 18M3 8h18M2 16h18"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',file:'<path d="M14 2H4v20h16V8Z M14 2v6h6M8 13h8m-8 4h6"/>',link:'<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',phone:'<path d="M5 3h4l2 6-3 2a12 12 0 0 0 5 5l2-3 6 2v4c0 2-2 2-3 2A19 19 0 0 1 3 6c0-1 0-3 2-3Z"/>',tag:'<path d="M3 3h8l10 10-8 8L3 11Z"/><circle cx="7" cy="7" r="1"/>',star:'<path d="m12 3 3 6 6 1-4 5 1 7-6-3-6 3 1-7-4-5 6-1Z"/>',location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',flow:'<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5H5v5m7-5h7v5"/>',alert:'<path d="m12 3 10 18H2Z M12 9v5m0 3h.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',barcode:'<path d="M3 4v16m4-16v16m3-16v16m4-16v16m3-16v16m4-16v16"/>',grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',chevrons:'<path d="m8 5 7 7-7 7"/>',external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>'
};
const icon=(name,cls='')=>`<svg class="ico ${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.text}</svg>`;
const types = [
 ['text','Text','Văn bản',170],['longtext','Long Text','Ghi chú dài',220],['number','Number','Số lượng',110],['currency','Currency','Giá trị',150],['select','Single Select','Trạng thái',145],['multiselect','Multi Select','Nhiều nhãn',210],['person','Person','Người phụ trách',175],['group','Group','Nhóm phụ trách',170],['date','Date','Ngày',140],['datetime','DateTime','Ngày giờ',180],['checkbox','Checkbox','Đã duyệt',110],['image','Image','Ảnh',100],['images','Multiple Images','Nhiều ảnh',140],['attachment','Attachment','Tệp đính kèm',180],['url','URL','Website',185],['email','Email','Email',185],['phone','Phone','Điện thoại',155],['barcode','Barcode','Mã vạch',170],['formula','Formula','Thành tiền',160],['lookup','Lookup','Tra cứu',180],['relation','Relation','Bản ghi liên quan',180],['oneway','One-way Link','Liên kết một chiều',180],['twoway','Two-way Link','Liên kết hai chiều',180],['progress','Progress','Tiến độ',150],['rating','Rating','Đánh giá',145],['location','Location','Vị trí',180],['signature','Signature','Chữ ký',180],['flow','Flow','Luồng duyệt',165],['button','Button','Hành động',150],['numbering','Numbering','Số thứ tự',145],['createdby','Created By','Người tạo',175],['modifiedby','Modified By','Người sửa',175],['createdtime','Created Time','Thời gian tạo',180],['modifiedtime','Modified Time','Thời gian sửa',180]
];
const typeIcon={number:'number',currency:'number',numbering:'number',formula:'number',person:'person',createdby:'person',modifiedby:'person',group:'group',date:'calendar',datetime:'clock',createdtime:'clock',modifiedtime:'clock',image:'image',images:'image',attachment:'file',url:'link',email:'mail',phone:'phone',barcode:'barcode',select:'tag',multiselect:'tag',relation:'link',oneway:'right',twoway:'link',lookup:'search',progress:'flow',rating:'star',location:'location',signature:'edit',flow:'flow',button:'external',checkbox:'check'};
const ERP_SCHEMA=[
 ['maOrder','Mã Order','text',135],['orderType','Order Type','select',165],['maKH','Mã khách hàng','text',135],['tenKH','Tên khách hàng','person',200],['khuVuc','Khu vực giao hàng','multiselect',190],['tuoiVang','Tuổi vàng','select',105],['maItem','Mã Item','relation',150],['tenItem','Tên Item','text',190],['tongSL','Tổng SL sản phẩm','number',145],['ngayGH','Ngày giao hàng yêu cầu','datetime',190],['ghiChu','Ghi chú','longtext',220],['ttOrder','Trạng thái Order','select',150],['ttKeHoach','Trạng thái kế hoạch','select',165],['ttSanXuat','Trạng thái sản xuất','select',170],['nguoiTao','Người tạo','createdby',175]
].map(([key,label,type,width])=>({key,label,type,width}));
const GAL_SCHEMA=[{key:'maOrder',label:'Mã Order',type:'text',width:135},{key:'cellState',label:'Trạng thái Cell',type:'select',width:140},...types.map(([type,en,label,width])=>({key:'g_'+type,label:`${label} · ${en}`,type,width}))];
const RC_SCHEMA=[['maOrder','Mã phiếu nhập','text',140],['tenKH','Nguồn','person',220],['image','Ảnh','image',100],['created','Ngày tạo','date',150],['ttOrder','Trạng thái','select',150],['ghiChu','Ghi chú','longtext',220]].map(([key,label,type,width])=>({key,label,type,width}));
const schema = mode => instanceOptions.schema|| (mode==='gallery'?GAL_SCHEMA:mode==='receipts'?RC_SCHEMA:ERP_SCHEMA);
const customers=[['KH-01234','Jewelry Co. Ltd'],['KH-01235','Golden Star Co.'],['KH-01236','Diamond House'],['KH-01237','Luxury Gems Ltd'],['KH-01238','Bright Jewelry']];
const items=[['SP-AU-0012','Nhẫn kim cương'],['SP-AU-0045','Dây chuyền vàng'],['SP-AU-0078','Vòng tay bạc'],['SP-AU-0091','Hoa tai ngọc trai'],['SP-AU-0102','Lắc tay vàng 18K']];
const people=['Nguyễn Văn A','Trần Thị B','Lê Văn C','Phạm Thị D'];
const orderStates=['Mới','Đang xử lý','Hoàn thành','Đã huỷ'];
const tagList=['TP.HCM','Hà Nội','Đà Nẵng','Cần Thơ','Hải Phòng','Đồng Nai','Bình Dương','Khu vực giao hàng có tên rất dài cần kiểm tra và xác nhận','Quảng Ninh','Huế','Nha Trang','Quy Nhơn','Vũng Tàu'];
const STORAGE=instanceOptions.storageKey||'sevago-grid-v2';
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
let saved=readStore(STORAGE,{});
const dataKey='sevago-records-v2';
function sampleRecords(){return Array.from({length:1200},(_,i)=>{
 const c=customers[i%5],item=items[i%5],n=i+1;
 return {id:`order-${n}`,maOrder:`SO-${String(n).padStart(5,'0')}`,orderType:i%5===0?'Group Purchase Order':'Sales Order',maKH:c[0],tenKH:c[1],khuVuc:tagList.slice(0,[1,2,13,0,10][i%5]),tuoiVang:['18K','14K','24K','10K'][i%4],maItem:item[0],tenItem:item[1],tongSL:i%23===0?0:(i%80)+2,ngayGH:`2026-${String(i%12+1).padStart(2,'0')}-${String(i%28+1).padStart(2,'0')}T09:30`,ghiChu:i%7===0?'Đối chiếu thông số kỹ thuật, kiểm tra bề mặt và trọng lượng vàng trước khi đóng gói. Liên hệ khách hàng để xác nhận địa chỉ giao hàng và thời gian nghiệm thu.':i%3===0?'Giao trước 10h sáng':'',ttOrder:orderStates[i%4],ttKeHoach:i%3?'Chưa lập KH':'Đã lập KH',ttSanXuat:['Chưa SX','Đang SX','Hoàn tất SX'][i%3],nguoiTao:people[i%4],created:'2026-11-01T09:30',modified:'2026-11-25T14:25',locked:i%47===46,category:i%3};
 });}
const initialData=()=>{if(sourceRecords)return JSON.parse(JSON.stringify(sourceRecords));const d=sampleRecords(),custom=readStore(dataKey,[]);if(Array.isArray(custom))custom.forEach(r=>{const idx=d.findIndex(x=>x.id===r.id);if(idx>=0)d[idx]=r;else d.unshift(r);});return d;};
const initialReceipts=()=>{if(custom)return [];const a=readStore('seva-receipts-v1',[]);return Array.isArray(a)?a.map((r,i)=>({...r,id:String(r.id||i).startsWith('receipt-')?r.id:`receipt-${r.id||i}`,maOrder:r.code,tenKH:r.source,ttOrder:r.state,ghiChu:r.note,created:r.created,tongSL:0,receipt:true})):[];};
function defaultConfig(mode){const fields=schema(mode);return {columns:fields.map(c=>({key:c.key,width:c.width,hidden:Boolean(c.hidden),pinned:c.key===(instanceOptions.primaryKey||'maOrder')})),filters:[],logic:'and',sorts:[],groups:[],rules:[],status:'',statusChip:'',tab:0,date:'',aggregate:mode==='gallery'?'g_number':'tongSL',scope:'filtered'};}
let moduleSuspended=false;
const S={records:initialData(),receipts:initialReceipts(),mode:'erp',config:{...defaultConfig('erp'),...(instanceOptions.config||{})},views:Array.isArray(saved.views)?saved.views:[],viewId:'default',working:{},role:['viewer','editor','admin'].includes(saved.role)?saved.role:'admin',selected:new Set(),anchorRow:null,focus:null,range:null,copied:null,dragging:false,page:1,size:50,collapsed:new Set(),query:'',searchField:'all',hits:[],hit:-1,filtered:[],pageRows:[],flat:[],state:'normal',menu:null,detail:null,lastRefresh:new Date().toISOString(),category:0,version:0};
const H={row:36,head:36};
const fields=()=>schema(S.mode),field=k=>fields().find(c=>c.key===k), configCol=k=>S.config.columns.find(c=>c.key===k);
// Base/user widths live in config; computed widths exist only in these clones.
function displayColumns(){
 const flexibleTypes=new Set(['text','longtext','person','createdby','modifiedby','relation','oneway','twoway','lookup','url','email','phone','location','attachment','multiselect','group']);
 const columns=S.config.columns.map(c=>({...field(c.key),...c})).filter(c=>field(c.key)&&!c.hidden).map(c=>{
  const definition=field(c.key),min=Math.max(72,Number(c.minWidth)||72),max=Math.max(min,Number(c.maxWidth)||Infinity);
  const width=Math.max(min,Math.min(max,Number(c.width)||definition.width||min));
  return {...c,width,baseWidth:width,userWidth:c.widthCustomized===true||(c.widthCustomized!==false&&c.width!==definition.width),fixedWidth:c.fixedWidth===true||c.widthLocked===true,grow:c.flexGrow===undefined?(flexibleTypes.has(c.type)?(c.type==='longtext'?2:1):0):Math.max(0,Number(c.flexGrow)||0)};
 });
 let extra=Math.max(0,($('#table-scroll')?.clientWidth||0)-92-columns.reduce((sum,c)=>sum+c.width,0));
 const capacity=c=>Math.max(0,(Number(c.maxWidth)||Infinity)-c.width);
 function distribute(candidates){
  let active=candidates.filter(c=>capacity(c)>0);
  while(extra>0.001&&active.length){const total=active.reduce((sum,c)=>sum+c.baseWidth*(c.grow||1),0),budget=extra;let used=0;
   for(const c of active){const add=Math.min(capacity(c),budget*c.baseWidth*(c.grow||1)/total);c.width+=add;used+=add;}
   extra=Math.max(0,extra-used);if(used<0.001)break;active=active.filter(c=>capacity(c)>0.001);
  }
 }
 distribute(columns.filter(c=>!c.fixedWidth&&!c.userWidth&&c.grow>0));
 // Explicit fallback key wins; otherwise the last non-fixed business column fills.
 // This changes display only, including for customized widths when no grow capacity remains.
 if(extra>0.001){const candidates=columns.filter(c=>!c.fixedWidth),preferred=candidates.find(c=>c.key===instanceOptions.adaptiveWidth?.fallbackColumn);const fallbacks=[...new Set([preferred,...candidates.reverse()].filter(Boolean))];for(const fallback of fallbacks){distribute([fallback]);if(extra<=0.001)break;}}
 return columns;
}
function allColumns(){let fixed=46;const budget=Math.max(46,($('#table-scroll')?.clientWidth||1400)-118);const base=displayColumns().map(c=>{if(c.pinned){if(fixed+c.width>budget)return {...c,pinned:false,suspended:true};fixed+=c.width;}return c;});return [{key:'_select',width:46,pinned:true,type:'selection',label:''},...base,{key:'_actions',width:46,right:true,type:'actions',label:''}];}
const dataColumns=()=>allColumns().filter(c=>!c.key.startsWith('_'));
const recordById=id=>[...S.records,...S.receipts].find(r=>r.id===id);
function value(r,key){
 if(key.startsWith('g_')&&S.mode==='gallery'&&value(r,'cellState')==='Empty')return '';
 if(!key.startsWith('g_'))return key==='cellState'?['Default','Read-only','Empty','Error','Locked','Loading'][((Number(r.id.split('-').pop())||1)-1)%6]:key==='image'?PRODUCT:r[key]??'';
 const t=key.slice(2),n=Number(r.id.split('-').pop())||1;
 switch(t){case'text':return r.tenItem;case'longtext':return r.ghiChu||'Kiểm tra bề mặt, kích thước và trọng lượng vàng theo tài liệu kỹ thuật trước khi bàn giao sản phẩm cho khách hàng.';case'number':return r.tongSL;case'currency':return 1200000+n%7*345000;case'select':return r.ttOrder;case'multiselect':return tagList.slice(0,[0,1,2,13,10][(n-1)%5]);case'person':case'createdby':return r.nguoiTao;case'modifiedby':return people[n%4];case'group':return ['Xưởng đúc','QC','Chế tác','Đóng gói'][n%4];case'date':return r.ngayGH.slice(0,10);case'datetime':return r.ngayGH;case'createdtime':return r.created;case'modifiedtime':return r.modified;case'checkbox':return n%3===0;case'image':return n%11===0?'':PRODUCT;case'images':return n%11===0?[]:[PRODUCT,PRODUCT,PRODUCT];case'attachment':return `Thong-so-${r.maOrder}.txt`;case'url':return 'https://example.com/orders/'+encodeURIComponent(r.maOrder);case'email':return `order${n}@example.com`;case'phone':return '090'+String(3000000+n*137).slice(-7);case'barcode':return '893'+String(1000000000+n*1997);case'formula':return r.tongSL*(1200000+n%7*345000);case'lookup':return `${r.maKH} · ${r.tenKH}`;case'relation':return `SO-${String(n%1200+1).padStart(5,'0')}`;case'oneway':return `MO-${String(n+3010)}`;case'twoway':return `PO-${String(n+4002)}`;case'progress':return n*17%101;case'rating':return n%6;case'location':return '10.8231, 106.6297 · TP.HCM';case'signature':return 'Đã ký · '+r.nguoiTao;case'flow':return ['Chờ duyệt','Đang duyệt','Đã duyệt'][n%3];case'button':return 'Xem chi tiết';case'numbering':return 'SEQ-'+String(20260000+n);default:return '';}
}
const text=v=>Array.isArray(v)?v.join(', '):typeof v==='boolean'?(v?'Có':'Không'):String(v??'');
const raw=(r,k)=>{const v=value(r,k),t=field(k)?.type;if(t==='image')return v?`Trang-suc-${r.maOrder}.png`:'';if(t==='images')return Array.isArray(v)&&v.length?`${v.length} ảnh · ${r.maOrder}`:'';return text(v);};
function searchText(r,k){const v=value(r,k),t=field(k)?.type,a=raw(r,k);if(numericTypes.has(t))return a+' '+fmt(v);if(dateTypes.has(t))return a+' '+a.slice(0,10).split('-').reverse().join('-')+' '+a.slice(11,16);return a;}
const numericTypes=new Set(['number','currency','formula','progress','rating']);
const dateTypes=new Set(['date','datetime','createdtime','modifiedtime']);
function operators(k){const t=field(k)?.type;return numericTypes.has(t)?[['eq','Bằng'],['neq','Khác'],['gt','Lớn hơn'],['gte','Lớn hơn hoặc bằng'],['lt','Nhỏ hơn'],['lte','Nhỏ hơn hoặc bằng'],['empty','Trống'],['notempty','Có dữ liệu']]:dateTypes.has(t)?[['eq','Đúng ngày'],['before','Trước ngày'],['after','Sau ngày'],['empty','Trống'],['notempty','Có dữ liệu']]:t==='checkbox'?[['eq','Bằng'],['neq','Khác']]:[['contains','Chứa'],['notcontains','Không chứa'],['eq','Bằng'],['neq','Khác'],['starts','Bắt đầu bằng'],['empty','Trống'],['notempty','Có dữ liệu']];}
function matches(r,f){const v=value(r,f.field),a=raw(r,f.field).toLocaleLowerCase('vi'),b=String(f.value??'').toLocaleLowerCase('vi'),type=field(f.field)?.type;switch(f.op){case'empty':return v==null||a===''||(Array.isArray(v)&&!v.length);case'notempty':return a!=='';case'contains':return a.includes(b);case'notcontains':return !a.includes(b);case'starts':return a.startsWith(b);case'eq':return dateTypes.has(type)?a.slice(0,10)===b.slice(0,10):numericTypes.has(type)?Number(v)===Number(b):a===b;case'neq':return numericTypes.has(type)?Number(v)!==Number(b):a!==b;case'gt':return Number(v)>Number(b);case'gte':return Number(v)>=Number(b);case'lt':return Number(v)<Number(b);case'lte':return Number(v)<=Number(b);case'before':return a.slice(0,10)<b;case'after':return a.slice(0,10)>b;default:return true;}}
function baseRows(){return S.mode==='receipts'?S.receipts:S.records;}
function compute(){
 let rows=S.state==='empty'?[]:baseRows().filter(r=>(!S.config.tab||Number(r.category||0)===S.config.tab-1)&&(!S.config.status||r.ttOrder===S.config.status)&&(!S.config.date||(r.created||'').slice(0,10)===S.config.date));
 const filters=S.config.filters;
 if(filters.length)rows=rows.filter(r=>S.config.logic==='or'?filters.some(f=>matches(r,f)):filters.every(f=>matches(r,f)));
 S.filtered=rows.slice().sort((a,b)=>{for(const s of S.config.sorts){const type=field(s.field)?.type,x=value(a,s.field),y=value(b,s.field),cmp=numericTypes.has(type)?Number(x)-Number(y):text(x).localeCompare(text(y),'vi',{numeric:true});if(cmp)return s.dir==='desc'?-cmp:cmp;}return 0;});
 const total=Math.max(1,Math.ceil(S.filtered.length/(S.size==='all'?Math.max(1,S.filtered.length):S.size)));S.page=Math.max(1,Math.min(S.page,total));
 S.recordNumbers=new Map(S.filtered.map((r,i)=>[r.id,i+1]));
 S.pageRows=S.size==='all'?S.filtered:S.filtered.slice((S.page-1)*S.size,S.page*S.size);
 S.flat=[];
 function grouped(rows,depth=0,parent='',scope=S.filtered){
  if(depth>=S.config.groups.length){rows.forEach(r=>S.flat.push({kind:'record',r}));return;}
  const k=S.config.groups[depth],buckets=new Map();rows.forEach(r=>{const v=raw(r,k)||'Trống';if(!buckets.has(v))buckets.set(v,[]);buckets.get(v).push(r);});
  for(const [v,rs]of buckets){const id=parent+JSON.stringify([k,v]);const scopeRows=scope.filter(r=>(raw(r,k)||'Trống')===v);S.flat.push({kind:'group',key:id,label:v,field:k,count:rs.length,total:scopeRows.length,depth,rows:rs});if(!S.collapsed.has(id))grouped(rs,depth+1,id,scopeRows);}
 }
 grouped(S.pageRows);
 searchHits();
}
function searchHits(){const prev=S.hits[S.hit];S.hits=[];if(S.query){const keys=S.searchField==='all'?dataColumns().map(c=>c.key):[S.searchField],q=S.query.toLocaleLowerCase('vi');S.filtered.forEach(r=>keys.forEach(key=>{if(searchText(r,key).toLocaleLowerCase('vi').includes(q))S.hits.push({id:r.id,key});}));}S.hit=Math.max(-1,Math.min(S.hit,S.hits.length-1));if(prev){const pos=S.hits.findIndex(h=>h.id===prev.id&&h.key===prev.key);if(pos>=0)S.hit=pos;}$('#search-count').textContent=S.query?`${S.hit<0?0:S.hit+1} / ${S.hits.length}`:'';$('#search-count').hidden=!S.query;['#search-prev','#search-next','#search-close'].forEach(s=>$(s).hidden=!S.query);renderRecordSummary();}
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3200);}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({views:S.views,role:S.role}));return true;}catch{toast('Không thể lưu: dung lượng trình duyệt không đủ.');return false;}}
function saveRecords(){const custom=S.records.filter(r=>r.local);try{localStorage.setItem(dataKey,JSON.stringify(custom));localStorage.setItem('seva-receipts-v1',JSON.stringify(S.receipts.map(r=>({...r,code:r.maOrder,source:r.tenKH,state:r.ttOrder,note:r.ghiChu}))));return true;}catch{toast('Không thể lưu dữ liệu local. Hãy xuất dữ liệu trước.');return false;}}
function configChanged(){S.version++;S.page=1;S.focus=null;S.range=null;S.copied=null;S.collapsed.clear();closePopup();refresh();}
function remember(){S.working[`${S.mode}:${S.viewId}`]=clone(S.config);}
function switchMode(mode,viewId='default'){
 hideRecordPage();remember();S.mode=mode;S.viewId=viewId;const savedView=S.views.find(v=>v.id===viewId&&v.mode===mode);S.config=clone(S.working[`${mode}:${viewId}`]||savedView?.config||defaultConfig(mode));S.page=1;S.collapsed.clear();S.focus=null;S.range=null;S.copied=null;S.state='normal';S.searchField='all';$('#search').value=S.query='';S.hit=-1;closePopup();refresh();
}
function refresh(){compute();renderHeader();renderRows(true);renderFooter();renderSelection();renderToolbar();}

function renderToolbar(){const count=S.config.filters.length+Number(Boolean(S.config.status))+Number(Boolean(S.config.date));$('#filter-count').textContent=count;$('#filter-count').hidden=!count;$('#sort-count').textContent=S.config.sorts.length||'';$('#group-count').textContent=S.config.groups.length||'';$('#status').value=S.config.status;$('#date').value=S.config.date;const activeChip=S.config.statusChip||$$('.status').find(b=>(S.mode==='receipts'?(b.dataset.status==='Tất cả'?'':b.dataset.status):b.dataset.value)===S.config.status)?.dataset.status;$$('.status').forEach(b=>b.classList.toggle('active',b.dataset.status===activeChip));$$('.tab').forEach((b,i)=>{const active=i===(S.config.tab||0);b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});$('#create').disabled=S.role==='viewer';$('#quick-create').disabled=S.role==='viewer';$('#create').title=instanceOptions.primaryTitle||(S.role==='viewer'?'Viewer chỉ xem dữ liệu':'Mở trang chi tiết để tạo phiếu');}
function offsets(){let left=0;const map=new Map();allColumns().forEach(c=>{if(c.pinned){map.set(c.key,left);left+=c.width;}});return map;}
function headerCell(c,off){const fixed=c.pinned?' pinned':c.right?' right-pinned':'';const st=c.pinned?`left:${off.get(c.key)}px;`:c.right?'right:0;':'';if(c.key==='_select')return `<th class="row-check pinned" style="left:0" scope="col"><input type="checkbox" id="select-all" aria-label="Chọn tất cả bản ghi đang hiển thị"></th>`;if(c.key==='_actions')return `<th class="right-pinned" style="right:0" scope="col"><span class="sr-only">Thao tác</span></th>`;
 const sort=S.config.sorts.findIndex(s=>s.field===c.key);
 return `<th scope="col" data-key="${c.key}" class="${fixed}" style="${st}" aria-sort="${sort>=0?(S.config.sorts[sort].dir==='asc'?'ascending':'descending'):'none'}"><div class="th-content" draggable="true" data-drag-column="${c.key}" title="${esc(c.label)} · Kéo để đổi thứ tự"><span class="column-title">${esc(c.label)}</span>${c.pinned?icon('pin','pin-icon'):''}${sort>=0?`<small>${sort+1}${S.config.sorts[sort].dir==='asc'?'↑':'↓'}</small>`:''}<button class="column-action" data-popup-trigger data-column-menu="${c.key}" aria-haspopup="dialog" aria-expanded="false" aria-label="Cài đặt cột ${esc(c.label)}">${icon('down')}</button></div><div class="resize-handle" data-resize="${c.key}" title="Kéo đổi độ rộng · Nhấp đúp tự khớp"></div></th>`;
}
function renderHeader(){const cols=allColumns(),off=offsets(),w=cols.reduce((s,c)=>s+c.width,0);$('#data-table').style.width=w+'px';$('#colgroup').innerHTML=cols.map(c=>`<col data-col="${c.key}" style="width:${c.width}px">`).join('');$('#head-row').innerHTML=cols.map(c=>headerCell(c,off)).join('');syncCheckAll();positionColumnMenu();}
function marked(v){const a=text(v);if(!S.query)return esc(a);const lower=a.toLocaleLowerCase('vi'),q=S.query.toLocaleLowerCase('vi');let out='',p=0,i=lower.indexOf(q);while(i>=0){out+=esc(a.slice(p,i))+`<mark>${esc(a.slice(i,i+q.length))}</mark>`;p=i+q.length;i=lower.indexOf(q,p);}return out+esc(a.slice(p));}
function display(r,c){let v=value(r,c.key),t=c.type;const rendered=instanceOptions.renderCell?.(r,c,{value:v,marked,esc,icon});if(rendered!=null)return rendered;const state=S.mode==='gallery'?value(r,'cellState'):'Default';
 if(c.key.startsWith('g_')&&state==='Empty')v='';
 const isEmpty=v==null||v===''||(Array.isArray(v)&&v.length===0);
 if(c.key.startsWith('g_')&&state==='Loading')return '<span class="skeleton" aria-label="Đang tải"></span>';
 if(c.key.startsWith('g_')&&state==='Error'&&['text','number','formula'].includes(t))return `<span class="error-text">${icon('alert')}<span class="clip">Giá trị không hợp lệ</span></span>`;
 if(isEmpty)return '<span class="empty-cell" aria-label="Trống">—</span>';
 const content=marked(v),chip=(s,cl='')=>`<span class="cell-chip ${cl}">${s}</span>`;
 let html='';
 switch(t){
 case'text':html=c.key===(instanceOptions.primaryKey||'maOrder')?`<button class="record-link clip" data-open-record="${esc(r.id)}">${content}</button>`:`<span class="clip">${content}</span>`;break;
 case'longtext':html=`<span class="clip long-text">${content}</span>`;break;
 case'number':html=`<span class="numeric">${marked(fmt(v))}</span>`;break;
 case'currency':html=`<span class="numeric currency">${marked(fmt(v))}<small> ₫</small></span>`;break;
 case'select':html=chip(content,/huỷ|lỗi/i.test(v)?'red':/hoàn|đã|18K/i.test(v)?'green':/đang|Sales/i.test(v)?'blue':'neutral');break;
 case'multiselect':{const tags=Array.isArray(v)?v:[v];html=`<button class="multi-tags" data-preview="tags"><span class="cell-chip clip">${marked(tags[0])}</span>${tags.length>1?`<span class="tag-count">+${tags.length-1}</span>`:''}</button>`;break;}
 case'person':case'createdby':case'modifiedby':html=`<span class="person-cell">${c.key==='tenKH'?`<img class="avatar" src="${AVATAR}" alt="">`:`<span class="initials">${esc(text(v).split(' ').slice(-1)[0].slice(0,2))}</span>`}<span class="clip">${content}</span>${t!=='person'?icon(t==='createdby'?'plus':'edit','system-icon'):''}</span>`;break;
 case'group':html=`${icon('group')}${chip(content,'blue')}`;break;
 case'date':case'datetime':case'createdtime':case'modifiedtime':{const str=text(v),d=str.slice(0,10).split('-').reverse().join('-');html=`${icon(t==='date'?'calendar':'clock','muted')}<span class="clip">${marked(d+(t==='date'?'':' '+str.slice(11,16)))}</span>`;break;}
 case'checkbox':html=`<span class="readonly-check ${v?'checked':''}" role="checkbox" aria-checked="${Boolean(v)}" aria-readonly="true" title="Chỉ xem">${v?icon('check'):''}</span>`;break;
 case'image':html=`<button class="image-cell" data-preview="image" aria-label="Xem ảnh"><img src="${esc(v)}" alt="Ảnh trang sức" width="28" height="28"></button>`;break;
 case'images':html=`<button class="image-cell" data-preview="images" aria-label="Xem ${v.length} ảnh">${v.slice(0,2).map(src=>`<img src="${esc(src)}" alt="Trang sức" width="28" height="28">`).join('')}<span class="tag-count">+${v.length-2}</span></button>`;break;
 case'attachment':html=`<button class="cell-link clip" data-preview="file">${icon('file')}<span class="clip">${content}</span></button>`;break;
 case'url':case'email':case'phone':html=`<button class="cell-link clip" data-preview="${t}">${icon(typeIcon[t])}<span class="clip">${content}</span></button>`;break;
 case'barcode':html=`<span class="barcode" aria-hidden="true"></span><code class="clip">${content}</code>`;break;
 case'formula':html=`<span class="formula-symbol">ƒx</span><span class="numeric">${marked(fmt(v))}</span>`;break;
 case'lookup':html=`${icon('search','muted')}<span class="lookup clip">${content}</span>`;break;
 case'relation':case'oneway':case'twoway':html=`<button class="cell-link clip" data-preview="relation">${icon(typeIcon[t])}<span class="clip">${content}</span></button>`;break;
 case'progress':html=`<span class="progress" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><i style="width:${v}%"></i></span><small>${v}%</small>`;break;
 case'rating':html=`<span class="rating" aria-label="${v} trên 5">${Array.from({length:5},(_,i)=>icon('star',i<v?'filled':'')).join('')}</span>`;break;
 case'location':html=`<button class="cell-link clip" data-preview="location">${icon('location')}<span class="clip">${content}</span></button>`;break;
 case'signature':html=`${icon('edit','muted')}<span class="signature clip">${content}</span>`;break;
 case'flow':html=`${icon('flow')}${chip(content,'green')}`;break;
 case'button':html=`<button class="cell-action" data-open-record="${esc(r.id)}">${icon('external')}Chi tiết</button>`;break;
 case'numbering':html=`<code class="clip">${content}</code>`;break;
 default:html=`<span class="clip">${content}</span>`;
 }
 if((state==='Locked'||r.locked)&&c.key!=='maOrder')html=icon('lock','locked-icon')+html;
 return html;
}
let lastWindow='',raf=0;
function renderRows(force=false){
 const scroll=$('#table-scroll');const viewport=scroll.clientHeight;const start=Math.max(0,Math.floor(Math.max(0,scroll.scrollTop-H.head)/H.row)-7),end=Math.min(S.flat.length,start+Math.ceil(viewport/H.row)+16);const cols=allColumns(),off=offsets(),key=`${start}:${end}:${S.version}:${S.state}`;
 if(!force&&key===lastWindow)return;lastWindow=key;
 let html=start?`<tr class="spacer" aria-hidden="true"><td colspan="${cols.length}" style="height:${start*H.row}px"></td></tr>`:'';
 for(let i=start;i<end;i++){
  const x=S.flat[i];if(x.kind==='group'){html+=`<tr class="group-row" data-flat="${i}"><td colspan="${cols.length}"><button class="group-toggle" data-toggle-group="${esc(x.key)}" style="padding-left:${x.depth*20+8}px" aria-expanded="${!S.collapsed.has(x.key)}">${icon(S.collapsed.has(x.key)?'right':'down')}<span>${esc(field(x.field)?.label)}: ${esc(x.label)}</span><small title="${x.count} trên trang / ${x.total} sau lọc">${x.count===x.total?x.count:x.count+' / '+x.total} bản ghi</small></button></td></tr>`;continue;}
  const r=x.r,sel=S.selected.has(r.id);html+=`<tr data-id="${esc(r.id)}" data-flat="${i}" aria-rowindex="${i+2}" class="record-row ${sel?'row-selected':''}" aria-selected="${sel}">`;
  for(const c of cols){const pin=c.pinned?'pinned':c.right?'right-pinned':'',style=c.pinned?`left:${off.get(c.key)}px;`:c.right?'right:0;':'';
   if(c.key==='_select'){html+=`<td class="row-check pinned" style="left:0"><label class="row-select-control"><span class="row-number" aria-hidden="true">${S.recordNumbers.get(r.id)}</span><input type="checkbox" data-select-row="${esc(r.id)}" aria-label="Chọn ${esc(r[instanceOptions.primaryKey||'maOrder'])}" ${sel?'checked':''}></label></td>`;continue;}
   if(c.key==='_actions'){html+=`<td class="right-pinned actions" style="right:0"><button data-open-record="${esc(r.id)}" aria-label="Mở chi tiết ${esc(r[instanceOptions.primaryKey||'maOrder'])}">${icon('external')}</button></td>`;continue;}
   const rule=S.config.rules.find(rule=>rule.field===c.key&&matches(r,rule));const found=S.query&&(S.searchField==='all'||S.searchField===c.key)&&searchText(r,c.key).toLocaleLowerCase('vi').includes(S.query.toLocaleLowerCase('vi'));const state=S.mode==='gallery'?value(r,'cellState'):r.locked?'Locked':'Read-only';
   html+=`<td role="gridcell" id="cell-${esc(r.id)}-${c.key}" data-key="${c.key}" data-row="${esc(r.id)}" data-state="${esc(state)}" aria-readonly="true" class="data-cell ${pin} ${found?'search-match':''} ${rule?'conditional-'+rule.color:''}" style="${style}"><div class="cell-inner">${display(r,c)}</div></td>`;
  }html+='</tr>';
 }
 if(end<S.flat.length)html+=`<tr class="spacer" aria-hidden="true"><td colspan="${cols.length}" style="height:${(S.flat.length-end)*H.row}px"></td></tr>`;
 $('#body-rows').innerHTML=html;
 $('#data-table').setAttribute('aria-rowcount',S.filtered.length+1);$('#data-table').setAttribute('aria-colcount',cols.length);
 const mode=S.state==='normal'&&!S.filtered.length?'empty':S.state;$('#grid-state').hidden=mode==='normal';
 if(mode!=='normal'){$('#grid-state').innerHTML=`${icon(mode==='error'?'alert':mode==='loading'?'refresh':'grid',mode==='loading'?'spin':'')}<strong>${{empty:'Không có bản ghi',error:'Không thể tải dữ liệu',loading:'Đang tải dữ liệu…'}[mode]}</strong><p>${mode==='empty'?'Thử thay đổi bộ lọc hoặc tạo bản ghi mới.':mode==='error'?'Lỗi kết nối mô phỏng. Dữ liệu local vẫn được giữ.':'Đang mô phỏng tải dữ liệu local.'}</p>${mode==='loading'?'':`<button class="btn" data-recover-state>${mode==='empty'?'Xóa bộ lọc':'Thử lại'}</button>`}`;}
 if(['error','loading'].includes(mode))$('#body-rows').innerHTML='';
 paintSelection();syncCheckAll();
}
function renderRecordSummary(bounds=rangeBounds()){
 const count=S.query?new Set(S.hits.map(h=>h.id)).size:S.filtered.length;
 const cells=bounds?(bounds.r2-bounds.r1+1)*(bounds.c2-bounds.c1+1):0;
 $('#record-summary').textContent=`${fmt(count)} / ${fmt(instanceOptions.totalCount?.()??baseRows().length)} bản ghi${cells>1?' · '+fmt(cells)+' ô đã chọn':''}`;
}
function renderFooter(){
 renderRecordSummary();
 const total=Math.max(1,Math.ceil(S.filtered.length/(S.size==='all'?Math.max(1,S.filtered.length):S.size)));
 const pageButton=(n,label,content,disabled=false)=>`<button data-page="${n}" aria-label="${label}" ${disabled?'disabled':''} ${n===S.page&&!content?'aria-current="page" class="active"':''}>${content||n}</button>`;
 let nums=total<=7?Array.from({length:total},(_,i)=>i+1):[...new Set([1,Math.max(2,S.page-1),S.page,Math.min(total-1,S.page+1),total])].sort((a,b)=>a-b);let middle='';nums.forEach((n,i)=>{if(i&&n>nums[i-1]+1)middle+='<span class="page-ellipsis">…</span>';middle+=pageButton(n,`Trang ${n}`);});
 $('#pages').innerHTML=pageButton(1,'Trang đầu',icon('first'),S.page===1)+pageButton(S.page-1,'Trang trước',icon('left'),S.page===1)+middle+pageButton(S.page+1,'Trang sau',icon('right'),S.page===total)+pageButton(total,'Trang cuối',icon('last'),S.page===total);
 $('#page-size').value=String(S.size);
}
function visibleRecordIds(){return S.flat.filter(x=>x.kind==='record').map(x=>x.r.id);}
function syncCheckAll(){const b=$('#select-all');if(!b)return;const ids=visibleRecordIds(),count=ids.filter(id=>S.selected.has(id)).length;b.checked=ids.length>0&&count===ids.length;b.indeterminate=count>0&&count<ids.length;b.disabled=!ids.length;}
function renderSelection(){if(instanceOptions.actions?.selection===false)$('#planned-order').hidden=true;const bar=$('#selection-toolbar');bar.hidden=S.selected.size===0;$('#selection-count').textContent=`${S.selected.size} ${instanceOptions.selectionLabel||'bản ghi'} đã chọn`;$('#planned-order').disabled=S.role==='viewer'||S.mode==='receipts';syncCheckAll();}
function selectRow(id,checked,shift){const ids=visibleRecordIds(),index=ids.indexOf(id),anchor=ids.indexOf(S.anchorRow);const target=shift&&anchor>=0?ids.slice(Math.min(index,anchor),Math.max(index,anchor)+1):[id];target.forEach(k=>checked?S.selected.add(k):S.selected.delete(k));S.anchorRow=id;$$('.record-row').forEach(tr=>{const checked=S.selected.has(tr.dataset.id);tr.classList.toggle('row-selected',checked);tr.setAttribute('aria-selected',String(checked));$('input',tr).checked=checked;});renderSelection();renderFooter();}
function clearSelection(){S.selected.clear();S.anchorRow=null;renderRows(true);renderSelection();renderFooter();}
function focusCell(id,key,extend=false){const ids=S.flat.filter(x=>x.kind==='record').map(x=>x.r.id),keys=dataColumns().map(c=>c.key);if(!ids.includes(id)||!keys.includes(key))return;if(extend&&S.range){S.range.end={id,key};}else S.range={start:{id,key},end:{id,key}};S.focus={id,key};$('#table-scroll').setAttribute('aria-activedescendant',`cell-${id}-${key}`);paintSelection();}
function rangeBounds(){if(!S.range)return null;const rows=S.flat.filter(x=>x.kind==='record').map(x=>x.r.id),cols=dataColumns().map(c=>c.key),a=S.range.start,b=S.range.end,ra=rows.indexOf(a.id),rb=rows.indexOf(b.id),ca=cols.indexOf(a.key),cb=cols.indexOf(b.key);if(Math.min(ra,rb,ca,cb)<0)return null;return {rows,cols,r1:Math.min(ra,rb),r2:Math.max(ra,rb),c1:Math.min(ca,cb),c2:Math.max(ca,cb)};}
function paintSelection(){
 const b=rangeBounds(),hit=S.hits[S.hit],active=b?S.range.start:S.focus,copy=S.copied;
 $$('td.data-cell').forEach(td=>{
  const ri=b?.rows.indexOf(td.dataset.row),ci=b?.cols.indexOf(td.dataset.key),selected=b&&ri>=b.r1&&ri<=b.r2&&ci>=b.c1&&ci<=b.c2;
  td.classList.toggle('cell-selected',Boolean(selected));
  td.classList.toggle('cell-focused',Boolean(active&&td.dataset.row===active.id&&td.dataset.key===active.key));
  td.classList.toggle('search-current',Boolean(hit&&hit.id===td.dataset.row&&hit.key===td.dataset.key));
  const cr=copy?.rows.indexOf(td.dataset.row)??-1,cc=copy?.cols.indexOf(td.dataset.key)??-1,copied=cr>=0&&cc>=0;
  td.classList.toggle('cell-copied',copied);
  for(const [edge,on]of Object.entries({top:cr===0,bottom:cr===copy?.rows.length-1,left:cc===0,right:cc===copy?.cols.length-1}))td.classList.toggle('copied-'+edge,copied&&on);
  td.setAttribute('aria-selected',String(Boolean(selected)));
 });
 if(active)$('#table-scroll').setAttribute('aria-activedescendant',`cell-${active.id}-${active.key}`);
 else $('#table-scroll').removeAttribute('aria-activedescendant');
 renderRecordSummary(b);
}
function rangeSnapshot(){const b=rangeBounds();return b?{rows:b.rows.slice(b.r1,b.r2+1),cols:b.cols.slice(b.c1,b.c2+1)}:null;}
async function copySelectedRange(){const snapshot=rangeSnapshot();if(snapshot&&await copyText(selectedText())){S.copied=snapshot;paintSelection();}}

function selectedText(){const b=rangeBounds();if(!b)return '';return b.rows.slice(b.r1,b.r2+1).map(id=>b.cols.slice(b.c1,b.c2+1).map(k=>raw(recordById(id),k).replace(/[\t\n]/g,' ')).join('\t')).join('\n');}
async function copyText(t){if(!t)return;try{await navigator.clipboard.writeText(t);toast('Đã sao chép.');return true;}catch{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-10000px';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();if(ok){toast('Đã sao chép.');return true;}else showDialog('Sao chép nội dung',`<textarea class="copy-fallback" readonly rows="8">${esc(t)}</textarea><p>Chọn nội dung và nhấn Ctrl/Cmd+C.</p>`);}}
function ensureVisible(id,key){let index=S.flat.findIndex(x=>x.kind==='record'&&x.r.id===id);if(index<0&&S.config.groups.length){S.collapsed.clear();compute();index=S.flat.findIndex(x=>x.kind==='record'&&x.r.id===id);}const el=$('#table-scroll');if(index>=0){const top=index*H.row;if(top<el.scrollTop)el.scrollTop=top;else if(top+H.row>el.scrollTop+el.clientHeight-H.head)el.scrollTop=top+H.row-el.clientHeight+H.head;}
 const cols=allColumns(),c=cols.find(c=>c.key===key);if(c&&!c.pinned){let x=0;cols.some(col=>{if(col.key===key)return true;x+=col.width;return false;});const frozen=cols.filter(c=>c.pinned).reduce((a,c)=>a+c.width,0);if(x<el.scrollLeft+frozen)el.scrollLeft=Math.max(0,x-frozen);else if(x+c.width>el.scrollLeft+el.clientWidth-46)el.scrollLeft=x+c.width-el.clientWidth+46;}renderRows(true);}
function goSearch(step=1){if(!S.hits.length)return;S.hit=(S.hit+step+S.hits.length)%S.hits.length;const h=S.hits[S.hit],index=S.filtered.findIndex(r=>r.id===h.id);S.page=S.size==='all'?1:Math.floor(index/S.size)+1;S.collapsed.clear();compute();renderRows(true);renderFooter();focusCell(h.id,h.key);ensureVisible(h.id,h.key);searchHits();paintSelection();}
function clearSearch(){S.query='';S.hit=-1;$('#search').value='';searchHits();renderRows(true);$('#search').blur();}
// One overlay manager. Every panel is clamped to the viewport and outside click/Escape closes it.
let expandedPreviewTimer=0;
function cancelExpandedPreview(){clearTimeout(expandedPreviewTimer);expandedPreviewTimer=0;}
function closePopup(){cancelExpandedPreview();if(S.menu){S.menu.remove();S.menu=null;}hideTooltip();$$('[aria-expanded="true"][data-popup-trigger]').forEach(b=>b.setAttribute('aria-expanded','false'));}
// Resolve the live header on every placement, including sticky and rebuilt headers.
function positionColumnMenu(){
 const el=S.menu,key=el?.dataset.columnKey;if(!key)return;
 const header=$$('th[data-key]',$('#head-row')).find(h=>h.dataset.key===key);
 if(!header){closePopup();return;}
 const b=header.getBoundingClientRect(),grid=$('#table-scroll').getBoundingClientRect(),cols=allColumns(),column=cols.find(c=>c.key===key);
 const pinnedWidth=cols.filter(c=>c.pinned).reduce((sum,c)=>sum+c.width,0);
 const leftEdge=Math.max(8,grid.left+(column?.pinned?0:pinnedWidth));
 const rightEdge=Math.min(window.innerWidth-8,grid.right-cols.filter(c=>c.right).reduce((sum,c)=>sum+c.width,0));
 const left=Math.max(b.left,leftEdge),right=Math.min(b.right,rightEdge);
 if(right<=left||b.bottom<0||b.top>window.innerHeight){closePopup();return;}
 el.style.maxHeight='calc(100vh - 16px)';
 const width=el.offsetWidth,height=el.scrollHeight+2,gap=4;
 let x=left;if(x+width>window.innerWidth-8)x=right-width;
 x=Math.max(8,Math.min(x,window.innerWidth-width-8));
 const below=Math.max(0,window.innerHeight-8-b.bottom-gap),above=Math.max(0,b.top-gap-8);
 const bottom=height<=below||height>above&&below>=above;
 const available=bottom?below:above;
 el.style.maxHeight=Math.min(window.innerHeight-16,available)+'px';
 el.style.left=x+'px';el.style.top=(bottom?b.bottom+gap:Math.max(8,b.top-gap-el.offsetHeight))+'px';
 $('[data-column-menu]',header)?.setAttribute('aria-expanded','true');
}
function placeOverlay(el,anchor){const b=anchor?.getBoundingClientRect?anchor.getBoundingClientRect():{left:anchor?.x||8,bottom:anchor?.y||8,top:anchor?.y||8};el.style.left=Math.max(8,Math.min(b.left,window.innerWidth-el.offsetWidth-8))+'px';let top=b.bottom+5;if(top+el.offsetHeight>window.innerHeight-8)top=Math.max(8,b.top-el.offsetHeight-5);el.style.top=Math.max(8,Math.min(top,window.innerHeight-el.offsetHeight-8))+'px';}
// Expansion is based on rendered overflow, never character count or column width alone.
function isCellTruncated(td){
 if(!td?.isConnected||!td.matches('.data-cell')||td.dataset.state==='Loading'||td.dataset.state==='Empty')return false;
 const type=field(td.dataset.key)?.type;
 if(['multiselect','image','images','attachment','checkbox','progress','rating','button'].includes(type))return false;
 return [...td.querySelectorAll('.clip,.numeric,.cell-chip,code,.record-link')].some(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+1)||Boolean($('.cell-inner',td)?.scrollWidth>$('.cell-inner',td)?.clientWidth+1);
}
function expandedCellText(td){
 const r=recordById(td.dataset.row),c=field(td.dataset.key),v=value(r,c.key);
 if(numericTypes.has(c.type))return fmt(v)+(c.type==='currency'?' ₫':'');
 if(dateTypes.has(c.type)){const a=text(v);return a.slice(0,10).split('-').reverse().join('-')+(c.type==='date'?'':' '+a.slice(11,16));}
 return raw(r,c.key);
}
function openExpandedCell(td){
 if(!isCellTruncated(td))return;
 const c=field(td.dataset.key),content=expandedCellText(td);closePopup();
 const el=document.createElement('section');el.className='expanded-cell-preview';el.setAttribute('role','dialog');el.setAttribute('aria-label',`Nội dung đầy đủ: ${c.label}`);el.setAttribute('aria-readonly','true');el.dataset.sourceRow=td.dataset.row;el.dataset.sourceKey=td.dataset.key;
 const body=document.createElement('div');body.className='expanded-cell-content';body.textContent=content;el.append(body);
 document.body.append(el);S.menu=el;
 const b=td.getBoundingClientRect(),g=$('#table-scroll').getBoundingClientRect();
 const left=Math.max(8,g.left),right=Math.min(window.innerWidth-8,g.right),top=Math.max(8,g.top+H.head),bottom=Math.min(window.innerHeight-8,g.bottom-10);
 el.style.width=Math.min(Math.max(b.width,280),520,Math.max(1,right-left))+'px';
 el.style.maxHeight=Math.max(36,Math.min(420,bottom-top))+'px';
 el.style.left=Math.max(left,Math.min(b.left,right-el.offsetWidth))+'px';
 el.style.top=Math.max(top,Math.min(b.top,bottom-el.offsetHeight))+'px';
}
function scheduleExpandedCell(td){cancelExpandedPreview();expandedPreviewTimer=setTimeout(()=>{expandedPreviewTimer=0;const b=rangeBounds();if(!S.dragging&&b&&b.r1===b.r2&&b.c1===b.c2&&S.focus?.id===td.dataset.row&&S.focus?.key===td.dataset.key)openExpandedCell(td);},230);}
function popup(title,content,anchor,init,width=420){closePopup();const el=document.createElement('section');el.className='popover';el.style.width=Math.min(width,window.innerWidth-16)+'px';el.setAttribute('role','dialog');el.setAttribute('aria-label',title);el.innerHTML=`<div class="popover-head"><strong>${esc(title)}</strong><button data-close-pop aria-label="Đóng">${icon('close')}</button></div><div class="popover-content">${content}</div>`;document.body.append(el);S.menu=el;$('[data-close-pop]',el).onclick=closePopup;init?.(el);placeOverlay(el,anchor);return el;}
function menu(title,items,anchor){return popup(title,items.map(it=>it.line?'<hr>':`<button class="menu-option" data-menu="${it.id}" ${it.disabled?'disabled':''}>${icon(it.icon||'grid')}<span>${esc(it.label)}</span>${it.note?`<small>${esc(it.note)}</small>`:''}</button>`).join(''),anchor,el=>{el.onclick=e=>{const b=e.target.closest('[data-menu]');if(!b)return;const item=items.find(i=>i.id===b.dataset.menu);closePopup();item?.run?.();};},280);}
function options(selected='',includeEmpty=false){return (includeEmpty?'<option value="">Không nhóm</option>':'')+fields().map(c=>`<option value="${c.key}" ${c.key===selected?'selected':''}>${esc(c.label)}</option>`).join('');}
function resizeColumn(key,width,{reset=false}={}){const c=configCol(key),definition=field(key);if(!c)return;const min=Math.max(72,Number(definition.minWidth)||72),max=Math.max(min,Number(definition.maxWidth)||1200);c.width=Math.max(min,Math.min(max,Math.round(width)));c.widthCustomized=!reset;applyWidths();}
function applyWidths(){const cols=allColumns(),off=offsets();$('#data-table').style.width=cols.reduce((a,c)=>a+c.width,0)+'px';$$('#colgroup col').forEach(el=>{const c=cols.find(c=>c.key===el.dataset.col);if(c)el.style.width=c.width+'px';});$$('th[data-key],td[data-key]').forEach(el=>{const c=cols.find(c=>c.key===el.dataset.key);el.classList.toggle('pinned',Boolean(c?.pinned));el.style.left=off.has(el.dataset.key)?off.get(el.dataset.key)+'px':'';const pin=$('.pin-icon',el);if(pin)pin.style.display=c?.pinned?'':'none';});}
function autoFit(key){const c=field(key);const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font='14px Inter, Arial';let width=ctx.measureText(c.label).width+18+(configCol(key)?.pinned?17:0)+(S.config.sorts.some(s=>s.field===key)?20:0);S.filtered.slice(0,1200).forEach(r=>{width=Math.max(width,ctx.measureText(raw(r,key)).width+36);});resizeColumn(key,Math.min(460,width));}
function columnMenu(key,anchor){if(S.menu?.dataset.columnKey===key){closePopup();return;}const c=configCol(key),col=field(key),at=S.config.columns.findIndex(c=>c.key===key);const el=menu(col.label,[
 {id:'asc',label:'Sắp xếp tăng dần',icon:'sort',run:()=>{S.config.sorts=[{field:key,dir:'asc'},...S.config.sorts.filter(s=>s.field!==key)];configChanged();}},
 {id:'desc',label:'Sắp xếp giảm dần',icon:'sort',run:()=>{S.config.sorts=[{field:key,dir:'desc'},...S.config.sorts.filter(s=>s.field!==key)];configChanged();}},
 {line:true},{id:'pin',label:c.pinned?'Bỏ ghim cột':'Ghim cột này',icon:'pin',run:()=>{c.pinned=!c.pinned;configChanged();}},
 {id:'range',label:'Ghim từ đầu đến cột này',icon:'pin',run:()=>{S.config.columns.forEach((x,i)=>x.pinned=i<=at);configChanged();}},
 {id:'unpin',label:'Bỏ ghim tất cả',icon:'pin',run:()=>{S.config.columns.forEach(x=>x.pinned=false);configChanged();}},
 {id:'fit',label:'Tự khớp độ rộng',icon:'columns',run:()=>autoFit(key)},
 {id:'reset',label:'Đặt lại độ rộng cột',icon:'refresh',run:()=>resizeColumn(key,col.width,{reset:true})},
 {id:'hide',label:'Ẩn cột',icon:'eye',disabled:dataColumns().length===1,run:()=>{c.hidden=true;if(S.searchField===key)S.searchField='all';configChanged();}},
 {id:'left',label:'Di chuyển sang trái',icon:'left',disabled:at===0,run:()=>{const cols=S.config.columns;[cols[at-1],cols[at]]=[cols[at],cols[at-1]];configChanged();}},
 {id:'right',label:'Di chuyển sang phải',icon:'right',disabled:at===S.config.columns.length-1,run:()=>{const cols=S.config.columns;[cols[at],cols[at+1]]=[cols[at+1],cols[at]];configChanged();}}
 ],anchor);el.dataset.columnKey=key;const heading=$('.popover-head',el);heading.style.minHeight=heading.offsetHeight+'px';$('[data-close-pop]',heading).remove();positionColumnMenu();}
function customize(anchor){popup('Tùy chỉnh cột',`<input class="control" id="column-query" placeholder="Tìm tên cột"><div id="column-list"></div><div class="panel-actions"><button class="btn" id="show-columns">Hiện tất cả</button><button class="btn" id="reset-widths">Đặt lại độ rộng</button></div>`,anchor,el=>{
 const render=()=>{$('#column-list',el).innerHTML=S.config.columns.filter(c=>field(c.key).label.toLocaleLowerCase('vi').includes($('#column-query',el).value.toLocaleLowerCase('vi'))).map(c=>`<div class="column-option"><label><input type="checkbox" data-show-col="${c.key}" ${!c.hidden?'checked':''}>${icon(typeIcon[field(c.key).type]||'text')}<span class="clip">${esc(field(c.key).label)}</span></label><input type="number" class="column-width" data-width-col="${c.key}" aria-label="Độ rộng ${esc(field(c.key).label)}" value="${c.width}" min="72" max="1200"><button data-pin-col="${c.key}" class="${c.pinned?'active':''}" aria-label="Ghim ${esc(field(c.key).label)}">${icon('pin')}</button></div>`).join('');};render();$('#column-query',el).oninput=render;
 el.onchange=e=>{const key=e.target.dataset.showCol||e.target.dataset.widthCol;if(!key)return;const c=configCol(key);if(e.target.dataset.showCol){if(!e.target.checked&&dataColumns().length===1){e.target.checked=true;return toast('Cần giữ ít nhất một cột hiển thị.');}c.hidden=!e.target.checked;if(c.hidden&&S.searchField===key)S.searchField='all';}else resizeColumn(key,Number(e.target.value)||72);compute();renderHeader();renderRows(true);renderFooter();};
 el.addEventListener('click',e=>{const p=e.target.closest('[data-pin-col]');if(p){configCol(p.dataset.pinCol).pinned=!configCol(p.dataset.pinCol).pinned;renderHeader();renderRows(true);render();}});
 $('#show-columns',el).onclick=()=>{S.config.columns.forEach(c=>c.hidden=false);render();compute();renderHeader();renderRows(true);};$('#reset-widths',el).onclick=()=>{S.config.columns.forEach(c=>{c.width=field(c.key).width;c.widthCustomized=false;});render();applyWidths();};
 },480);}
function filterPanel(anchor){let draft=clone(S.config.filters),logic=S.config.logic;const el=popup('Bộ lọc',`<div class="panel-line"><span>Kết hợp điều kiện</span><select class="control" id="filter-logic"><option value="and">AND · Tất cả</option><option value="or">OR · Bất kỳ</option></select></div><div id="filter-rows"></div><button class="btn" id="add-filter">${icon('plus')}Thêm điều kiện</button><hr><div class="panel-actions"><button class="btn" id="clear-filters">Xóa tất cả</button><button class="primary" id="apply-filters">Áp dụng</button></div>`,anchor,p=>{
 const render=()=>{$('#filter-rows',p).innerHTML=draft.map((f,i)=>{const t=field(f.field)?.type;return `<div class="condition-row" data-condition="${i}"><select class="control f-field" aria-label="Trường lọc ${i+1}">${options(f.field)}</select><select class="control f-op" aria-label="Toán tử ${i+1}">${operators(f.field).map(([v,l])=>`<option value="${v}" ${f.op===v?'selected':''}>${l}</option>`).join('')}</select>${['empty','notempty'].includes(f.op)?'<span class="condition-value"></span>':t==='checkbox'?`<select class="control f-value"><option ${f.value==='Có'?'selected':''}>Có</option><option ${f.value==='Không'?'selected':''}>Không</option></select>`:`<input class="control f-value" aria-label="Giá trị ${i+1}" type="${numericTypes.has(t)?'number':dateTypes.has(t)?'date':'text'}" value="${esc(f.value)}">`}<button data-remove-filter="${i}" aria-label="Xóa điều kiện ${i+1}">${icon('close')}</button></div>`;}).join('')||'<p class="muted">Chưa có điều kiện lọc.</p>';placeOverlay(p,anchor);};
 $('#filter-logic',p).value=logic;$('#filter-logic',p).onchange=e=>logic=e.target.value;
 p.onchange=e=>{const row=e.target.closest('[data-condition]');if(!row)return;const f=draft[+row.dataset.condition];if(e.target.matches('.f-field')){f.field=e.target.value;f.op=operators(f.field)[0][0];f.value='';render();}else if(e.target.matches('.f-op')){f.op=e.target.value;render();}else if(e.target.matches('.f-value'))f.value=e.target.value;};p.oninput=e=>{const row=e.target.closest('[data-condition]');if(row&&e.target.matches('.f-value'))draft[+row.dataset.condition].value=e.target.value;};p.addEventListener('click',e=>{const b=e.target.closest('[data-remove-filter]');if(b){draft.splice(+b.dataset.removeFilter,1);render();}});
 $('#add-filter',p).onclick=()=>{draft.push({field:fields()[0].key,op:'contains',value:''});render();};$('#clear-filters',p).onclick=()=>{draft=[];S.config.status='';S.config.statusChip='';S.config.date='';render();};$('#apply-filters',p).onclick=()=>{S.config.filters=draft;S.config.logic=logic;configChanged();};render();
 },720);return el;}
function sortPanel(anchor){let draft=clone(S.config.sorts);popup('Sắp xếp nhiều cột',`<div id="sort-rows"></div><button class="btn" id="add-sort">${icon('plus')}Thêm cột sắp xếp</button><hr><div class="panel-actions"><button class="btn" id="reset-sort">Đặt lại</button><button class="primary" id="apply-sort">Áp dụng</button></div>`,anchor,el=>{
 const render=()=>{$('#sort-rows',el).innerHTML=draft.map((s,i)=>`<div class="sort-row" data-sort-row="${i}"><small>${i+1}</small><select class="control s-field">${options(s.field)}</select><select class="control s-dir"><option value="asc" ${s.dir==='asc'?'selected':''}>Tăng dần</option><option value="desc" ${s.dir==='desc'?'selected':''}>Giảm dần</option></select><button data-priority="${i}" aria-label="Tăng ưu tiên" ${i===0?'disabled':''}>${icon('up')}</button><button data-remove-sort="${i}" aria-label="Bỏ sắp xếp">${icon('close')}</button></div>`).join('')||'<p class="muted">Theo thứ tự dữ liệu gốc.</p>';placeOverlay(el,anchor);};
 el.onchange=e=>{const row=e.target.closest('[data-sort-row]');if(row)draft[+row.dataset.sortRow][e.target.matches('.s-field')?'field':'dir']=e.target.value;};
 el.addEventListener('click',e=>{const b=e.target.closest('[data-remove-sort],[data-priority]');if(!b)return;if(b.dataset.removeSort!=null)draft.splice(+b.dataset.removeSort,1);else{const i=+b.dataset.priority;[draft[i-1],draft[i]]=[draft[i],draft[i-1]];}render();});
 $('#add-sort',el).onclick=()=>{const next=fields().find(c=>!draft.some(s=>s.field===c.key));if(next)draft.push({field:next.key,dir:'asc'});render();};$('#reset-sort',el).onclick=()=>{draft=[];render();};$('#apply-sort',el).onclick=()=>{S.config.sorts=draft.filter((s,i,a)=>a.findIndex(x=>x.field===s.field)===i);configChanged();};render();
 },620);}
function groupPanel(anchor){popup('Nhóm dữ liệu',`<label class="field-label">Cấp 1<select class="control" id="group-first">${options(S.config.groups[0],true)}</select></label><label class="field-label">Cấp 2<select class="control" id="group-second">${options(S.config.groups[1],true)}</select></label><div class="panel-actions"><button class="btn" id="group-expand">Mở tất cả</button><button class="btn" id="group-collapse">Thu tất cả</button><button class="primary" id="group-apply">Áp dụng</button></div>`,anchor,el=>{$('#group-first',el).value=S.config.groups[0]||'';$('#group-second',el).value=S.config.groups[1]||'';$('#group-apply',el).onclick=()=>{const a=$('#group-first',el).value,b=$('#group-second',el).value;S.config.groups=[a,a&&b!==a?b:''].filter(Boolean);configChanged();};$('#group-expand',el).onclick=()=>{S.collapsed.clear();compute();renderRows(true);closePopup();};$('#group-collapse',el).onclick=()=>{S.collapsed.clear();compute();S.flat.filter(x=>x.kind==='group').forEach(x=>S.collapsed.add(x.key));compute();renderRows(true);closePopup();};});}
function searchPanel(anchor){popup('Phạm vi tìm kiếm',`<label class="field-label">Tìm trong cột<select class="control" id="search-field"><option value="all">Tất cả cột hiển thị</option>${dataColumns().map(c=>`<option value="${c.key}" ${c.key===S.searchField?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label><p class="muted">Enter: tiếp · Shift+Enter: trước · Esc: đóng.<br>Tìm trên toàn bộ dữ liệu đã lọc, gồm các trang khác. Không ẩn hoặc sửa bản ghi.</p>`,anchor,el=>{$('#search-field',el).value=S.searchField;$('#search-field',el).onchange=e=>{S.searchField=e.target.value;S.hit=-1;searchHits();renderRows(true);if(S.hits.length)goSearch();};});}
function viewPanel(anchor){menu('Chế độ xem',[
 {id:'erp',label:'ERP View · Mặc định',icon:'grid',run:()=>switchMode('erp')},
 {id:'gallery',label:'Thư viện Cell · Chỉ xem',icon:'columns',run:()=>switchMode('gallery')},
 {id:'receipts',label:'Phiếu nhập · Dữ liệu hiện có',icon:'file',run:()=>switchMode('receipts')},
 {line:true},...S.views.filter(v=>v.mode===S.mode).map(v=>({id:v.id,label:v.name,icon:'person',note:'Cá nhân',run:()=>switchMode(v.mode,v.id)})),
 {line:true},{id:'new',label:'Lưu thành View cá nhân',icon:'plus',run:()=>nameView()},
 {id:'save',label:'Lưu cấu hình View',icon:'save',disabled:S.viewId==='default',run:()=>{const v=S.views.find(v=>v.id===S.viewId);v.config=clone(S.config);persist();toast('Đã lưu cấu hình View cá nhân.');}},
 {id:'rename',label:'Đổi tên View',icon:'edit',disabled:S.viewId==='default',run:()=>nameView(true)},
 {id:'delete',label:'Xóa View cá nhân',icon:'trash',disabled:S.viewId==='default',run:()=>confirmAction('Xóa View cá nhân?','Chỉ xóa cấu hình hiển thị; dữ liệu bản ghi được giữ.',()=>{S.views=S.views.filter(v=>v.id!==S.viewId);persist();switchMode(S.mode);})},
 {id:'reset',label:'Đặt lại View',icon:'refresh',run:()=>{S.config=defaultConfig(S.mode);configChanged();}}
 ],anchor);}
function nameView(rename=false){const current=S.views.find(v=>v.id===S.viewId);showDialog(rename?'Đổi tên View':'Lưu View cá nhân',`<form id="view-form"><label class="field-label">Tên View<input class="control" name="name" required maxlength="80" value="${esc(rename?current?.name:'View cá nhân '+(S.views.length+1))}"></label><div class="dialog-footer"><button type="button" class="btn" data-close-dialog>Hủy</button><button class="primary" type="submit">Lưu</button></div></form>`,d=>{$('#view-form',d).onsubmit=e=>{e.preventDefault();const name=new FormData(e.target).get('name').trim();if(!name)return;if(S.views.some(v=>v.name===name&&v.id!==current?.id))return toast('Tên View đã tồn tại.');if(rename)current.name=name;else{const id='view-'+Date.now();S.views.push({id,name,mode:S.mode,config:clone(S.config)});S.viewId=id;}persist();closeDialog();toast('Đã lưu View.');};});}
function showDialog(title,html,init){closePopup();const d=$('#main-dialog');if(d.open)d.close();d.classList.remove('wide-dialog');d.innerHTML=`<div class="dialog-header"><h2>${esc(title)}</h2><button data-close-dialog aria-label="Đóng">${icon('close')}</button></div><div class="dialog-content">${html}</div>`;d.showModal();d.onclick=e=>{if(e.target.closest('[data-close-dialog]'))closeDialog();if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog();}};init?.(d);return d;}
function closeDialog(){if($('#main-dialog').open)$('#main-dialog').close();hideRecordPage();S.detail=null;}
function hideRecordPage(updateRoute=true){const page=$('#record-detail-page');if(page){page.hidden=true;$('main').classList.remove('detail-open');}if(updateRoute&&location.hash.startsWith('#record='))history.replaceState(null,'',location.pathname+location.search);S.detail=null;}
function showRecordPage(title,html,init,route){closePopup();if($('#main-dialog').open)$('#main-dialog').close();let page=$('#record-detail-page');if(!page){page=document.createElement('section');page.id='record-detail-page';page.className='record-detail-page';page.setAttribute('aria-label','Record Detail Page');$('main').append(page);}page.innerHTML=`<div class="dialog-header"><h2>${esc(title)}</h2><button class="btn" data-close-dialog aria-label="Quay lại bảng">${icon('left')}Quay lại bảng</button></div><div class="dialog-content">${html}</div>`;page.hidden=false;$('main').classList.add('detail-open');page.onclick=e=>{if(e.target.closest('[data-close-dialog]'))closeDialog();};const hash='#record='+encodeURIComponent(route);if(location.hash!==hash)history.pushState({record:route},'',hash);init?.(page);page.scrollTop=0;return page;}
function confirmAction(title,message,run){showDialog(title,`<p>${message}</p><div class="dialog-footer"><button class="btn" data-close-dialog>Hủy</button><button class="primary" id="confirm-action">Xác nhận</button></div>`,d=>{$('#confirm-action',d).onclick=()=>{closeDialog();run();};});}
function plannedOrder(){const rows=[...S.selected].map(recordById).filter(Boolean);const invalid=rows.filter(r=>r.receipt||r.locked||r.ttOrder==='Đã huỷ'||r.ttOrder==='Hoàn thành'||r.ttKeHoach==='Đã lập KH'||!(r.tongSL>0));const allowed=S.role!=='viewer'&&rows.length>0&&invalid.length===0;
 showDialog('Xác nhận tạo Planned Order',`<p>Đã chọn <b>${rows.length}</b> Order · Hợp lệ <b>${rows.length-invalid.length}</b>.</p><p class="muted">Yêu cầu: Order Mới/Đang xử lý, chưa có kế hoạch, số lượng &gt; 0 và không bị khóa. Toàn bộ lựa chọn phải hợp lệ.</p>${invalid.length?`<div class="validation-error">${invalid.slice(0,12).map(r=>esc(r.maOrder)).join(', ')}${invalid.length>12?'…':''}: không đủ điều kiện.</div>`:''}${S.role==='viewer'?'<div class="validation-error">Viewer không được tạo Planned Order.</div>':''}<div class="dialog-footer"><button class="btn" data-close-dialog>Hủy</button><button class="primary" id="confirm-planned" ${allowed?'':'disabled'}>Xác nhận tạo kế hoạch</button></div>`,d=>{$('#confirm-planned',d).onclick=()=>{const current=[...S.selected].map(recordById);if(S.role==='viewer'||current.some(r=>!r||r.receipt||r.locked||['Đã huỷ','Hoàn thành'].includes(r.ttOrder)||r.ttKeHoach==='Đã lập KH'||r.tongSL<=0))return toast('Lựa chọn không còn hợp lệ.');const batch='PO-'+Date.now().toString().slice(-8);current.forEach(r=>{r.ttKeHoach='Đã lập KH';r.plannedOrder=batch;r.local=true;r.modified=new Date().toISOString();});saveRecords();closeDialog();refresh();toast(`Đã tạo ${batch} cho ${current.length} Order · Mô phỏng local.`);};});}
function openDetail(id,isNew=false,kind='order'){if(instanceOptions.onOpenRecord)return instanceOptions.onOpenRecord(recordById(id),{showDialog,esc,icon});const r=isNew?{id:'order-local-'+Date.now(),maOrder:'',orderType:'Sales Order',maKH:'KH-01234',tenKH:'[0000] - SEVAGO',khuVuc:['TP.HCM'],tuoiVang:'18K',maItem:'SP-AU-0012',tenItem:'Nhẫn kim cương',tongSL:1,ngayGH:'2026-12-01T09:30',ttOrder:'Mới',ttKeHoach:'Chưa lập KH',ttSanXuat:'Chưa SX',nguoiTao:'Admin Demo',created:new Date().toISOString(),ghiChu:'',category:0,receipt:kind==='receipt'||S.mode==='receipts'}:recordById(id);if(!r)return;
 if(isNew&&r.receipt){r.ttOrder='Nháp';r.created=new Date().toISOString().slice(0,10);}const allowed=S.role!=='viewer'&&!r.locked&&(S.mode!=='gallery'||isNew),defs=r.receipt?RC_SCHEMA:ERP_SCHEMA;S.detail=r.id;
 const detailTitle=isNew?'Tạo bản ghi tại trang chi tiết':`Chi tiết ${r.maOrder}`;
 showRecordPage(detailTitle,`<p class="detail-meta">${icon('lock')}Table chỉ xem · ${allowed?'Chỉnh sửa tại Detail':'Bản ghi chỉ xem'} · Vai trò ${esc(S.role)}${r.plannedOrder?' · '+esc(r.plannedOrder):''}</p><form id="detail-form"><div class="detail-grid">${defs.map(c=>{let v=value(r,c.key),opts=c.key==='ttOrder'?(r.receipt?['Nháp','Đang tiếp nhận','Đang thực hiện','Hoàn thành','Trả hàng']:orderStates):c.key==='orderType'?['Sales Order','Group Purchase Order']:c.key==='tuoiVang'?['10K','14K','18K','24K']:null;const readonly=!allowed||['ttKeHoach','ttSanXuat','nguoiTao','image'].includes(c.key);let control=readonly?`<div class="detail-value">${esc(text(v))||'—'}</div>`:opts?`<select name="${c.key}" class="control">${opts.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select>`:c.type==='longtext'?`<textarea class="control" name="${c.key}" rows="3" maxlength="2000">${esc(v)}</textarea>`:`<input class="control" name="${c.key}" value="${esc(Array.isArray(v)?v.join(', '):text(v))}" ${c.key==='maOrder'||c.key==='tenKH'?'required':''} type="${numericTypes.has(c.type)?'number':c.type==='datetime'?'datetime-local':c.type==='date'?'date':'text'}" ${numericTypes.has(c.type)?'min="0" max="1000000" step="1"':''} maxlength="250">`;return `<label class="field-label ${c.type==='longtext'?'wide':''}">${esc(c.label)}${control}</label>`;}).join('')}</div><div class="dialog-footer"><button class="btn" type="button" data-close-dialog>Đóng</button>${allowed?'<button class="primary" type="submit">Lưu tại Detail</button>':''}</div></form>`,d=>{
 $('#detail-form',d).onsubmit=e=>{e.preventDefault();if(S.role==='viewer'||r.locked||(S.mode==='gallery'&&!isNew))return toast('Không được phép sửa bản ghi này.');const data=Object.fromEntries(new FormData(e.target));if(!String(data.maOrder||'').trim()||!String(data.tenKH||'').trim())return toast('Mã và tên/nguồn là bắt buộc.');const all=[...S.records,...S.receipts];if(all.some(x=>x.id!==r.id&&x.maOrder===data.maOrder.trim()))return toast('Mã bản ghi đã tồn tại.');if('tongSL'in data&&(!Number.isInteger(+data.tongSL)||+data.tongSL<0||+data.tongSL>1000000))return toast('Số lượng phải là số nguyên từ 0 đến 1.000.000.');const next={...r,...data,maOrder:data.maOrder.trim(),tenKH:data.tenKH.trim(),local:true,modified:new Date().toISOString()};if('tongSL'in data)next.tongSL=Number(data.tongSL);if('khuVuc'in data)next.khuVuc=data.khuVuc.split(',').map(s=>s.trim()).filter(Boolean);const arr=r.receipt?S.receipts:S.records,idx=arr.findIndex(x=>x.id===r.id);if(idx>=0)arr[idx]=next;else arr.unshift(next);saveRecords();closeDialog();S.page=1;if(isNew&&r.receipt)switchMode('receipts');else refresh();toast('Đã lưu tại Detail · Dữ liệu local.');};
 },isNew?(r.receipt?'new-receipt':'new-order'):r.id);}
let tooltip=null,tooltipTimer;
function hideTooltip(){clearTimeout(tooltipTimer);tooltip?.remove();tooltip=null;}
function tagTooltip(td){hideTooltip();tooltipTimer=setTimeout(()=>{if(S.menu||S.dragging)return;const r=recordById(td.dataset.row),tags=value(r,td.dataset.key);if(!Array.isArray(tags)||!tags.length)return;tooltip=document.createElement('div');tooltip.className='tag-tooltip';tooltip.setAttribute('role','tooltip');tooltip.innerHTML=tags.map(t=>`<div>${esc(t)}</div>`).join('');document.body.append(tooltip);placeOverlay(tooltip,td);},450);}
function attachmentText(r){return `SEVAGO · THÔNG SỐ SẢN PHẨM\nMã Order: ${r.maOrder}\nKhách hàng: ${r.tenKH}\nSản phẩm: ${r.tenItem}\nSố lượng: ${r.tongSL}\nTuổi vàng: ${r.tuoiVang}\nGhi chú: ${r.ghiChu||'Không có'}\n\nTệp mẫu được tạo local để xem trước và tải về.\n`;}
function download(name,body,type='text/plain;charset=utf-8'){const blob=new Blob([body],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function previewCell(td,kind){const r=recordById(td.dataset.row),c=field(td.dataset.key),v=value(r,c.key);if(!r||!c)return;
 if(kind==='tags'){const tags=Array.isArray(v)?v:[];popup(c.label,`<div class="tags-preview">${tags.length?tags.map(t=>`<span class="cell-chip">${esc(t)}</span>`).join(''):'<span class="muted">Không có nhãn</span>'}</div><div class="preview-footer">${tags.length} nhãn · Chỉ xem</div>`,td,null,420);return;}
 if(kind==='image'||kind==='images'){const arr=Array.isArray(v)?v:[v];let n=0;showDialog('Xem ảnh sản phẩm',`<div class="image-preview"><img id="preview-image" src="${esc(arr[0])}" alt="Ảnh sản phẩm ${esc(r[instanceOptions.primaryKey||'maOrder'])}"></div><div class="image-preview-nav"><button class="btn" id="image-prev" aria-label="Ảnh trước" ${arr.length<2?'disabled':''}>${icon('left')}</button><span id="image-count">1 / ${arr.length}</span><button class="btn" id="image-next" aria-label="Ảnh sau" ${arr.length<2?'disabled':''}>${icon('right')}</button></div>`,d=>{const set=()=>{$('#preview-image',d).src=arr[n];$('#image-count',d).textContent=`${n+1} / ${arr.length}`;};$('#image-prev',d).onclick=()=>{n=(n-1+arr.length)%arr.length;set();};$('#image-next',d).onclick=()=>{n=(n+1)%arr.length;set();};});return;}
 if(kind==='file'){showDialog(text(v),`<pre class="file-preview">${esc(attachmentText(r))}</pre><div class="dialog-footer"><button class="btn" data-close-dialog>Đóng</button><button class="primary" id="download-file">${icon('download')}Tải tệp</button></div>`,d=>$('#download-file',d).onclick=()=>download(text(v),attachmentText(r)));return;}
 if(kind==='relation'){let related=S.records.find(x=>x.maOrder===v);popup(c.label,`<div class="preview-value">${esc(v)}</div><p class="muted">${related?esc(related.tenKH)+' · '+esc(related.tenItem):'Chứng từ liên kết mô phỏng, chỉ xem thông tin.'}</p><button class="btn" id="relation-detail">${icon('external')}${related?'Mở bản ghi liên quan':'Xem Order nguồn'}</button>`,td,el=>$('#relation-detail',el).onclick=()=>openDetail((related||r).id));return;}
 popup(c.label,`<div class="preview-value">${esc(text(v))||'Trống'}</div><div class="preview-footer">${esc(c.type)} · Chỉ xem</div><div class="panel-actions"><button class="btn" id="preview-copy">${icon('copy')}Sao chép</button><button class="btn" id="preview-detail">${icon('external')}Mở Record Detail</button></div>`,td,el=>{$('#preview-copy',el).onclick=()=>copyText(text(v));$('#preview-detail',el).onclick=()=>openDetail(r.id);},440);
}
function rulesPanel(anchor){if(S.role!=='admin')return toast('Chỉ Admin cấu hình quy tắc tô màu trong mô phỏng.');let draft=clone(S.config.rules);popup('Tô màu theo điều kiện',`<div class="condition-row"><select id="rule-field" class="control">${options()}</select><select id="rule-op" class="control"><option value="contains">Chứa</option><option value="eq">Bằng</option></select><input id="rule-value" class="control" placeholder="Giá trị"></div><div class="panel-line"><select id="rule-color" class="control"><option value="warning">Cảnh báo</option><option value="success">Thành công</option><option value="info">Thông tin</option></select><button class="btn" id="rule-add">${icon('plus')}Thêm quy tắc</button></div><div id="rule-list"></div><div class="panel-actions"><button class="primary" id="rule-save">Áp dụng</button></div>`,anchor,el=>{const render=()=>{$('#rule-list',el).innerHTML=draft.map((r,i)=>`<div class="rule-row"><span>${esc(field(r.field).label)} · ${esc(r.op)} · ${esc(r.value)}</span><button data-rule-remove="${i}" aria-label="Xóa quy tắc">${icon('close')}</button></div>`).join('');};const setOps=()=>$('#rule-op',el).innerHTML=operators($('#rule-field',el).value).map(([v,l])=>`<option value="${v}">${l}</option>`).join('');$('#rule-field',el).onchange=setOps;setOps();$('#rule-add',el).onclick=()=>{draft.push({field:$('#rule-field',el).value,op:$('#rule-op',el).value,value:$('#rule-value',el).value,color:$('#rule-color',el).value});render();};el.addEventListener('click',e=>{const b=e.target.closest('[data-rule-remove]');if(b){draft.splice(+b.dataset.ruleRemove,1);render();}});$('#rule-save',el).onclick=()=>{S.config.rules=draft;configChanged();};render();},660);}
function rolePanel(anchor){popup('Vai trò · Mô phỏng frontend',`<p class="muted">Đây là mô phỏng local, không phải phân quyền backend. Table luôn chỉ xem ở mọi vai trò.</p><label class="field-label">Vai trò<select id="role-select" class="control"><option value="viewer">Viewer · Chỉ xem</option><option value="editor">Editor · Sửa tại Detail</option><option value="admin">Admin · Cấu hình và Detail</option></select></label><p class="muted">Mọi vai trò được lưu View cá nhân. Admin được thiết lập quy tắc tô màu. Editor/Admin được tạo Planned Order khi đủ điều kiện.</p>`,anchor,el=>{$('#role-select',el).value=S.role;$('#role-select',el).onchange=e=>{S.role=e.target.value;persist();renderToolbar();renderSelection();};});}
function refreshData(){closePopup();S.state='loading';renderRows(true);setTimeout(()=>{S.records=initialData();S.receipts=initialReceipts();S.state='normal';S.lastRefresh=new Date().toISOString();refresh();toast('Đã tải lại dữ liệu local.');},450);}
function moreTools(anchor){const items=[
 {id:'new-order',label:'Tạo Order tại Detail',icon:'plus',disabled:S.role==='viewer',run:()=>openDetail(null,true,'order')},
 {id:'refresh',label:'Làm mới dữ liệu',icon:'refresh',run:refreshData},
 {id:'status',label:'Lọc trạng thái / ngày tạo',icon:'filter',run:()=>popup('Trạng thái / Ngày tạo',`<label class="field-label">Trạng thái<select id="more-status" class="control"><option value="">Tất cả trạng thái</option>${[...new Set(baseRows().map(r=>r.ttOrder))].map(v=>`<option ${S.config.status===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label class="field-label">Ngày tạo<input type="date" id="more-date" class="control" value="${esc(S.config.date)}"></label><div class="panel-actions"><button class="btn" id="more-clear">Xóa</button><button class="primary" id="more-apply">Áp dụng</button></div>`,anchor,el=>{$('#more-apply',el).onclick=()=>{S.config.status=$('#more-status',el).value;S.config.statusChip='';S.config.date=$('#more-date',el).value;configChanged();};$('#more-clear',el).onclick=()=>{S.config.status='';S.config.statusChip='';S.config.date='';configChanged();};})},
 {id:'export',label:'Xuất CSV · Dữ liệu đã lọc',icon:'download',run:()=>{const cols=dataColumns(),quote=s=>'"'+String(s).replace(/"/g,'""')+'"';download('sevago-'+S.mode+'.csv','\uFEFF'+[cols.map(c=>quote(c.label)).join(','),...S.filtered.map(r=>cols.map(c=>{let s=raw(r,c.key);if(/^[=+\-@]/.test(s))s="'"+s;return quote(s);}).join(','))].join('\r\n'),'text/csv;charset=utf-8');}},
 {id:'rules',label:'Tô màu theo điều kiện',icon:'tag',disabled:S.role!=='admin',run:()=>rulesPanel(anchor)},
 {id:'permissions',label:'Vai trò và quyền demo',icon:'lock',run:()=>rolePanel(anchor)},
 {id:'states',label:'Trạng thái hiển thị',icon:'eye',run:()=>popup('Trạng thái bảng',`<label class="field-label">Trạng thái<select id="table-state" class="control"><option value="normal">Bình thường</option><option value="empty">Empty · Không dữ liệu</option><option value="loading">Loading · Đang tải</option><option value="error">Error · Lỗi kết nối</option></select></label><p class="muted">Mô phỏng hiển thị, không xóa dữ liệu. Dùng Refresh để trở lại bình thường.</p>`,anchor,el=>{$('#table-state',el).value=S.state;$('#table-state',el).onchange=e=>{S.state=e.target.value;S.version++;compute();renderRows(true);renderFooter();};})},
 {id:'help',label:'Phím tắt và thông tin',icon:'info',run:()=>showDialog('Tương tác Data Grid',`<dl class="help"><dt>Click / Kéo</dt><dd>Focus / chọn vùng cell</dd><dt>Phím mũi tên, Tab</dt><dd>Di chuyển giữa các cell; Shift mở rộng vùng</dd><dt>Ctrl/Cmd+C</dt><dd>Sao chép cell / vùng; dữ liệu dạng TSV</dd><dt>Enter / Double-click</dt><dd>Mở Record Detail</dd><dt>Ctrl/Cmd+F</dt><dd>Tìm toàn bảng đã lọc</dd><dt>Enter / Shift+Enter trong Search</dt><dd>Kết quả tiếp / trước, tự chuyển trang</dd><dt>Esc</dt><dd>Đóng lớp nổi / tìm kiếm / bỏ focus cell</dd></dl><p class="muted">${S.records.length} Order mẫu. Không cập nhật realtime. Lần làm mới: ${esc(new Date(S.lastRefresh).toLocaleString('vi-VN'))}. Phân quyền và nghiệp vụ chỉ mô phỏng trong trình duyệt. Cột ghim vượt bề rộng khả dụng tạm cuộn cùng bảng; cấu hình ghim được giữ khi mở rộng màn hình.</p>`)},
 {id:'reset',label:'Đặt lại cấu hình View',icon:'refresh',run:()=>{S.config=defaultConfig(S.mode);configChanged();}}
 ];menu('Công cụ',instanceOptions.toolIds?items.filter(item=>instanceOptions.toolIds.includes(item.id)):items,anchor);}
// Event delegation: headers, grid and overlays never install per-cell handlers.
let resize=null,dragKey=null,lastPointer=null,autoScrollRaf=0,suppressClick=false;
$('#head-row').addEventListener('pointerdown',e=>{const h=e.target.closest('[data-resize]');if(!h)return;e.preventDefault();e.stopPropagation();closePopup();const key=h.dataset.resize;resize={key,x:e.clientX,width:allColumns().find(c=>c.key===key).width};h.setPointerCapture(e.pointerId);document.body.classList.add('resizing');});
$('#head-row').addEventListener('dblclick',e=>{const h=e.target.closest('[data-resize]');if(h){e.preventDefault();autoFit(h.dataset.resize);}});
$('#head-row').addEventListener('click',e=>{const b=e.target.closest('[data-column-menu]');if(b){columnMenu(b.dataset.columnMenu,b.closest('th'));}});
$('#head-row').addEventListener('contextmenu',e=>{const h=e.target.closest('th[data-key]');if(h){e.preventDefault();columnMenu(h.dataset.key,h);}});
let columnDropIndicator=null,columnDragPreview=null,columnDragStyle=null,columnDragPointer=null;
function clearColumnDropIndicator(){columnDropIndicator?.remove();columnDropIndicator=null;}
function finishColumnDrag(){clearColumnDropIndicator();columnDragPreview?.remove();columnDragStyle?.remove();columnDragPreview=null;columnDragStyle=null;columnDragPointer=null;dragKey=null;}
function columnDropTarget(e){const header=e.target.closest?.('th[data-key]');if(!header||!dragKey||header.dataset.key===dragKey)return null;const rect=header.getBoundingClientRect();return {header,rect,after:e.clientX>=rect.left+rect.width/2};}
function showColumnDropIndicator(target){
 if(!target){clearColumnDropIndicator();return;}
 const {rect,after,header}=target,scroll=$('#table-scroll'),grid=scroll.getBoundingClientRect(),cols=allColumns(),pinned=header.classList.contains('pinned');
 const left=grid.left+scroll.clientLeft+(pinned?0:cols.filter(c=>c.pinned).reduce((n,c)=>n+c.width,0));
 const right=grid.left+scroll.clientLeft+scroll.clientWidth-cols.filter(c=>c.right).reduce((n,c)=>n+c.width,0),x=after?rect.right:rect.left;
 const top=Math.max(rect.top,grid.top+scroll.clientTop,0),bottom=Math.min(grid.top+scroll.clientTop+scroll.clientHeight,window.innerHeight);
 if(x<left||x>right||bottom<=top){clearColumnDropIndicator();return;}
 if(!columnDropIndicator){columnDropIndicator=document.createElement('div');columnDropIndicator.className='column-drop-indicator';columnDropIndicator.setAttribute('aria-hidden','true');document.body.append(columnDropIndicator);}
 Object.assign(columnDropIndicator.style,{left:(x-1)+'px',top:top+'px',height:(bottom-top)+'px'});
}
function updateColumnDrag(){if(!dragKey||!columnDragPointer)return;const {x,y}=columnDragPointer;showColumnDropIndicator(columnDropTarget({target:document.elementFromPoint(x,y)||document.body,clientX:x}));}
$('#head-row').addEventListener('dragstart',e=>{
 const h=e.target.closest('[data-drag-column]');if(!h||resize||e.target.closest('[data-column-menu], [data-resize]')){e.preventDefault();return;}
 closePopup();finishColumnDrag();dragKey=h.dataset.dragColumn;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragKey);
 columnDragPreview=document.createElement('div');columnDragPreview.className='column-drag-preview';columnDragPreview.textContent=field(dragKey).label;document.body.append(columnDragPreview);e.dataTransfer.setDragImage(columnDragPreview,16,18);
 columnDragStyle=document.createElement('style');columnDragStyle.textContent=`#data-table #head-row th[data-key="${dragKey}"],#data-table #body-rows tr.record-row td.data-cell[data-key="${dragKey}"]{background:var(--cell-selection-bg,#EBF1FF)!important}`;document.head.append(columnDragStyle);
});
$('#head-row').addEventListener('dragover',e=>{if(dragKey){e.preventDefault();e.dataTransfer.dropEffect='move';columnDragPointer={x:e.clientX,y:e.clientY};showColumnDropIndicator(columnDropTarget(e));}});
$('#head-row').addEventListener('drop',e=>{
 const target=columnDropTarget(e);e.preventDefault();
 if(target){const cols=S.config.columns,from=cols.findIndex(c=>c.key===dragKey);if(from>=0){const [column]=cols.splice(from,1),to=cols.findIndex(c=>c.key===target.header.dataset.key);cols.splice(to+(target.after?1:0),0,column);configChanged();}}
 finishColumnDrag();
});
document.addEventListener('dragover',e=>{if(dragKey){columnDragPointer={x:e.clientX,y:e.clientY};if(!e.target.closest?.('#head-row'))clearColumnDropIndicator();}});
document.addEventListener('drop',finishColumnDrag);
document.addEventListener('dragend',finishColumnDrag);
document.addEventListener('keydown',e=>{if(e.key==='Escape')finishColumnDrag();});
$('#head-row').addEventListener('dragleave',e=>{if(!e.relatedTarget||!$('#head-row').contains(e.relatedTarget))clearColumnDropIndicator();});
function edgeScroll(){if(!S.dragging||!lastPointer)return;const el=$('#table-scroll'),b=el.getBoundingClientRect(),p=lastPointer;let dx=0,dy=0;if(p.x>b.right-36)dx=18;if(p.x<b.left+50)dx=-18;if(p.y>b.bottom-28)dy=18;if(p.y<b.top+H.head+22)dy=-18;if(dx||dy){el.scrollBy(dx,dy);renderRows();const hit=document.elementFromPoint(Math.max(b.left+48,Math.min(p.x,b.right-50)),Math.max(b.top+H.head+2,Math.min(p.y,b.bottom-2)))?.closest('td.data-cell');if(hit)focusCell(hit.dataset.row,hit.dataset.key,true);}autoScrollRaf=requestAnimationFrame(edgeScroll);}
$('#body-rows').addEventListener('pointerdown',e=>{const td=e.target.closest('td.data-cell');if(!td||e.button!==0||e.target.closest('input'))return;e.preventDefault();closePopup();window.getSelection()?.removeAllRanges();$('#table-scroll').focus({preventScroll:true});S.dragging=true;lastPointer={x:e.clientX,y:e.clientY};S.pointerStart={x:e.clientX,y:e.clientY};focusCell(td.dataset.row,td.dataset.key,e.shiftKey);autoScrollRaf=requestAnimationFrame(edgeScroll);});
$('#body-rows').addEventListener('pointerover',e=>{const td=e.target.closest('td.data-cell');if(!td)return;if(S.dragging){focusCell(td.dataset.row,td.dataset.key,true);return;}if(field(td.dataset.key)?.type==='multiselect')tagTooltip(td);else hideTooltip();});
$('#body-rows').addEventListener('pointerout',e=>{if(!e.relatedTarget?.closest?.('td.data-cell'))hideTooltip();});
let shiftRow=false;
$('#body-rows').addEventListener('click',e=>{
 const cb=e.target.closest('[data-select-row]');if(cb){selectRow(cb.dataset.selectRow,cb.checked,e.shiftKey||shiftRow);return;}
 if(suppressClick){suppressClick=false;return;}
 const group=e.target.closest('[data-toggle-group]');if(group){const key=group.dataset.toggleGroup;S.collapsed.has(key)?S.collapsed.delete(key):S.collapsed.add(key);compute();renderRows(true);syncCheckAll();return;}
 const td=e.target.closest('td.data-cell'),open=e.target.closest('[data-open-record]');
 if(!td){if(open)openDetail(open.dataset.openRecord);return;}
 focusCell(td.dataset.row,td.dataset.key,e.shiftKey);
 // Native double-click keeps its Record Detail action; dragging and Shift selection never expand.
 if(e.detail>1||e.shiftKey)return;
 if(isCellTruncated(td)){scheduleExpandedCell(td);return;}
 if(open){openDetail(open.dataset.openRecord);return;}
 const preview=e.target.closest('[data-preview]');if(preview)previewCell(td,preview.dataset.preview);else if(field(td.dataset.key)?.type==='multiselect')previewCell(td,'tags');
});
$('#body-rows').addEventListener('dblclick',e=>{const td=e.target.closest('td.data-cell');if(td&&!e.target.closest('[data-preview]')){e.preventDefault();cancelExpandedPreview();openDetail(td.dataset.row);}});
$('#body-rows').addEventListener('contextmenu',e=>{const td=e.target.closest('td.data-cell');if(!td)return;e.preventDefault();const bounds=rangeBounds();if(!bounds||!bounds.rows.slice(bounds.r1,bounds.r2+1).includes(td.dataset.row)||!bounds.cols.slice(bounds.c1,bounds.c2+1).includes(td.dataset.key))focusCell(td.dataset.row,td.dataset.key);menu(field(td.dataset.key).label,[{id:'copy',label:'Sao chép cell / vùng',icon:'copy',run:()=>copySelectedRange()},{id:'preview',label:'Xem nội dung đầy đủ',icon:'eye',run:()=>previewCell(td,({multiselect:'tags',attachment:'file',image:'image',images:'images',relation:'relation',oneway:'relation',twoway:'relation'})[field(td.dataset.key).type]||'text')},{id:'detail',label:'Mở Record Detail',icon:'external',run:()=>openDetail(td.dataset.row)}],{x:e.clientX,y:e.clientY});});
$('#head-row').addEventListener('change',e=>{if(e.target.id!=='select-all')return;visibleRecordIds().forEach(id=>e.target.checked?S.selected.add(id):S.selected.delete(id));renderRows(true);renderSelection();renderFooter();});
$('#body-rows').addEventListener('keydown',e=>{if(e.target.matches('[data-select-row]'))shiftRow=e.shiftKey;});
$('#body-rows').addEventListener('pointerdown',e=>{if(e.target.closest('.row-select-control'))shiftRow=e.shiftKey;});
window.addEventListener('pointermove',e=>{if(resize){e.preventDefault();resizeColumn(resize.key,resize.width+e.clientX-resize.x);}if(S.dragging){lastPointer={x:e.clientX,y:e.clientY};if(Math.abs(e.clientX-S.pointerStart.x)>4||Math.abs(e.clientY-S.pointerStart.y)>4)suppressClick=true;}});
window.addEventListener('pointerup',()=>{resize=null;document.body.classList.remove('resizing');S.dragging=false;cancelAnimationFrame(autoScrollRaf);setTimeout(()=>suppressClick=false,0);});
$('#table-scroll').addEventListener('scroll',()=>{cancelExpandedPreview();if(S.menu?.classList.contains('expanded-cell-preview'))closePopup();hideTooltip();positionColumnMenu();updateColumnDrag();if(!raf)raf=requestAnimationFrame(()=>{renderRows();raf=0;});},{passive:true});
$('#table-scroll').addEventListener('copy',e=>{const t=selectedText();if(!t)return;e.preventDefault();e.clipboardData.setData('text/plain',t);S.copied=rangeSnapshot();paintSelection();});
$('#table-scroll').addEventListener('paste',e=>{e.preventDefault();toast('Table chỉ xem. Mở Record Detail để chỉnh sửa.');});
$('#table-scroll').addEventListener('keydown',e=>{if(e.target.matches('input,button'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'){e.preventDefault();copySelectedRange();return;}if(['Delete','Backspace','F2'].includes(e.key)){e.preventDefault();toast('Table chỉ xem. Không sửa hoặc xóa giá trị cell.');return;}if(e.key==='Enter'&&S.focus){e.preventDefault();openDetail(S.focus.id);return;}if(!S.focus)return;const ids=S.flat.filter(x=>x.kind==='record').map(x=>x.r.id),keys=dataColumns().map(c=>c.key);let r=ids.indexOf(S.focus.id),c=keys.indexOf(S.focus.key);if(e.key==='ArrowDown')r++;else if(e.key==='ArrowUp')r--;else if(e.key==='ArrowRight')c++;else if(e.key==='ArrowLeft')c--;else if(e.key==='Tab'){c+=e.shiftKey?-1:1;if(c>=keys.length){c=0;r++;}if(c<0){c=keys.length-1;r--;}}else if(e.key==='Home'){c=0;if(e.ctrlKey)r=0;}else if(e.key==='End'){c=keys.length-1;if(e.ctrlKey)r=ids.length-1;}else return;e.preventDefault();r=Math.max(0,Math.min(ids.length-1,r));c=Math.max(0,Math.min(keys.length-1,c));focusCell(ids[r],keys[c],e.shiftKey&&e.key!=='Tab');ensureVisible(ids[r],keys[c]);});
document.addEventListener('keydown',e=>{if(moduleSuspended)return;if(e.key==='Escape'){cancelExpandedPreview();if(S.menu){closePopup();return;}if($('#main-dialog').open)return;if($('#record-detail-page')&&!$('#record-detail-page').hidden){hideRecordPage();return;}if(S.query){clearSearch();return;}S.range=null;S.focus=null;S.copied=null;paintSelection();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'&&!$('#main-dialog').open&&!$('main').classList.contains('detail-open')){e.preventDefault();$('#search').focus();$('#search').select();}});
document.addEventListener('pointerdown',e=>{cancelExpandedPreview();if(S.menu&&!S.menu.contains(e.target)&&!e.target.closest('[data-popup-trigger]'))closePopup();},true);
window.addEventListener('resize',()=>{if(moduleSuspended)return;closePopup();renderHeader();renderRows(true);});
$('#search').addEventListener('input',e=>{S.query=e.target.value;S.hit=-1;searchHits();renderRows(true);if(S.hits.length)goSearch();});
$('#search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();goSearch(e.shiftKey?-1:1);}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();clearSearch();}});
$('#search-prev').onclick=()=>goSearch(-1);$('#search-next').onclick=()=>goSearch(1);$('#search-close').onclick=clearSearch;$('#search-settings').onclick=e=>searchPanel(e.currentTarget);
$('#filter').onclick=e=>filterPanel(e.currentTarget);$('#sort').onclick=e=>sortPanel(e.currentTarget);$('#group').onclick=e=>groupPanel(e.currentTarget);$('#columns').onclick=e=>customize(e.currentTarget);$('#more-tools').onclick=e=>moreTools(e.currentTarget);
$('#pages').onclick=e=>{const b=e.target.closest('[data-page]');if(b&&!b.disabled){S.page=+b.dataset.page;S.range=null;S.focus=null;$('#table-scroll').scrollTop=0;compute();renderRows(true);renderFooter();syncCheckAll();}};
$('#page-size').onchange=e=>{S.size=e.target.value==='all'?'all':+e.target.value;S.page=1;S.range=null;S.focus=null;$('#table-scroll').scrollTop=0;compute();renderRows(true);renderFooter();};

$('#copy-codes').onclick=()=>copyText([...S.selected].map(id=>recordById(id)?.[instanceOptions.primaryKey||'maOrder']).filter(Boolean).join('\n'));$('#clear-selection').onclick=clearSelection;$('#planned-order').onclick=plannedOrder;
$('#create').onclick=()=>{if(instanceOptions.actions?.primary)return instanceOptions.actions.primary(api);if(S.role!=='viewer')openDetail(null,true,'receipt');};$('#quick-create').onclick=$('#create').onclick;
$('#grid-state').onclick=e=>{if(e.target.closest('[data-recover-state]')){S.state='normal';S.config.filters=[];S.config.status='';S.config.statusChip='';S.config.date='';configChanged();}};
$('#status').onchange=e=>{S.config.status=e.target.value;S.config.statusChip='';configChanged();};$('#date').onchange=e=>{S.config.date=e.target.value;configChanged();};
$$('.status').forEach(b=>b.onclick=()=>{S.config.status=S.mode==='receipts'?(b.dataset.status==='Tất cả'?'':b.dataset.status):b.dataset.value||'';S.config.statusChip=b.dataset.status;configChanged();});
$$('.tab').forEach((b,i)=>b.onclick=()=>{S.config.tab=i;configChanged();});
$('#apps').onclick=()=>$('.workspace').classList.toggle('collapsed');$('#collapse').onclick=$('#apps').onclick;
$('#user').onclick=e=>rolePanel(e.currentTarget);
$('#notifications').onclick=e=>popup('Thông báo',`<div class="notification-item"><strong>Data Grid sẵn sàng</strong><p>${S.records.length} Order mẫu đã được tải. Chỉ cập nhật dữ liệu khi nhấn Refresh.</p></div><button class="btn" id="mark-read">Đánh dấu đã đọc</button>`,e.currentTarget,el=>$('#mark-read',el).onclick=()=>{$('.notification>span').hidden=true;closePopup();});
$$('[data-nav]').forEach(b=>b.onclick=()=>{const name=b.dataset.nav;$$('[data-nav]').forEach(x=>x.classList.toggle('selected',x===b));if(name==='Cấu hình'){rolePanel(b);return;}if(name==='Báo cáo'){showDialog('Báo cáo dữ liệu local',`<p>Order: <b>${S.records.length}</b></p><p>Tổng số lượng: <b>${fmt(S.records.reduce((a,r)=>a+Number(r.tongSL||0),0))}</b></p><p>Đã có kế hoạch: <b>${S.records.filter(r=>r.ttKeHoach==='Đã lập KH').length}</b></p><p>Phiếu nhập: <b>${S.receipts.length}</b></p>`);return;}if(name==='Nhập kho')switchMode('receipts');else if(name==='Đề xuất'){switchMode('erp');S.config.filters=[{field:'ttKeHoach',op:'eq',value:'Chưa lập KH'}];configChanged();}else switchMode('erp');});
// Lifecycle adapter: shell never reads or shares the module's business state.
window.SEVAGO_MODULE=Object.freeze({
 dismissTransient(){closePopup();finishColumnDrag();},
 suspend(){moduleSuspended=true;closePopup();finishColumnDrag();cancelExpandedPreview();S.dragging=false;cancelAnimationFrame(autoScrollRaf);if($('#main-dialog').open)$('#main-dialog').close();},
 resume(){if(!moduleSuspended)return;moduleSuspended=false;renderHeader();renderRows(true);paintSelection();}
});
const api=Object.freeze({
 root:document,
 suspend:()=>window.SEVAGO_MODULE.suspend(),resume:()=>window.SEVAGO_MODULE.resume(),dismissTransient:()=>window.SEVAGO_MODULE.dismissTransient(),
 snapshot:()=>({...window.SEVAGO.snapshot(),query:S.query,range:clone(S.range),scroll:{top:$('#table-scroll').scrollTop,left:$('#table-scroll').scrollLeft}}),
 getRows:()=>clone(S.filtered),getSelection:()=>clone([...S.selected].map(recordById).filter(Boolean)),
 setData(records,{resetPage=true,pruneSelection=true}={}){sourceRecords=clone(records);S.records=clone(records);if(pruneSelection){const valid=new Set(records.map(r=>r.id));S.selected.forEach(id=>{if(!valid.has(id))S.selected.delete(id);});}if(resetPage)S.page=1;S.focus=null;S.range=null;S.copied=null;S.version++;refresh();},
 configure(config){Object.assign(S.config,clone(config));configChanged();},
 setDisplayState(state){if(!['normal','empty','loading','error'].includes(state))return;S.state=state;S.version++;refresh();},
 clearSelection,showDialog
});
// Expose a read-only inspection snapshot for local QA, never mutation APIs.
window.SEVAGO={snapshot:()=>({mode:S.mode,records:S.records.length,filtered:S.filtered.length,selected:[...S.selected],config:clone(S.config),page:S.page,size:S.size,hits:S.hits.length,role:S.role,rendered:$$('.record-row').length,focus:clone(S.focus)})};
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
new ResizeObserver(()=>{if(moduleSuspended)return;cancelExpandedPreview();finishColumnDrag();renderHeader();renderRows(true);}).observe($('#table-scroll'));
refresh();
window.addEventListener('popstate',()=>{if(custom)return;if(location.hash.startsWith('#/apps/')&&!location.hash.startsWith('#/apps/recruitment/'))return;if(location.hash.startsWith('#record=')){const id=decodeURIComponent(location.hash.slice(8));if(id==='new-receipt'||id==='new-order')openDetail(null,true,id==='new-receipt'?'receipt':'order');else if(recordById(id))openDetail(id);}else hideRecordPage(false);});
if(!custom&&location.hash.startsWith('#record=')){const id=decodeURIComponent(location.hash.slice(8));if(recordById(id))openDetail(id);}
instanceRoots.set(document,api);
return api;
}
window.SEVAGO_GRID=Object.freeze({create:createTableInstance});
createTableInstance();
})();
