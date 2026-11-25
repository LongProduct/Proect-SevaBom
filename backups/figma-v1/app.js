const $ = (s) => document.querySelector(s);
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset = (key, className = '', alt = '') => `<img src="${ASSETS[key]}" class="${className}" alt="${alt}">`;
const states = ['Nháp','Đang tiếp nhận','Đang thực hiện','Hoàn thành','Trả hàng'];
const storageKey = 'seva-receipts-v1';
let saved = [];
try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (!Array.isArray(saved)) saved = []; } catch {}
let receipts = [...saved, ...Array.from({length:200}, (_, i) => ({id:`demo-${i}`, code:'----------', source:'[0000] - SEVAGO', state:states[i % 5], created:'2025-01-13', category:0, demo:true}))];
let page = 1, category = 0, activeStatus = '', appliedSource = '', fromDate = '', toDate = '', editingId = null;
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 3500); }
function filtered() {
  const q = $('#search').value.trim().toLocaleLowerCase('vi');
  const selectedStatus = $('#status').value || activeStatus;
  return receipts.filter(r => (r.demo || r.category === category) && (!q || `${r.code} ${r.source}`.toLocaleLowerCase('vi').includes(q)) && (!selectedStatus || r.state === selectedStatus) && (!appliedSource || r.source.toLocaleLowerCase('vi').includes(appliedSource)) && (!fromDate || r.created >= fromDate) && (!toDate || r.created <= toDate));
}
function render() {
  const list = filtered(), size = Number($('#page-size').value), total = Math.max(1, Math.ceil(list.length / size));
  page = Math.min(Math.max(page, 1), total);
  $('#rows').innerHTML = list.slice((page-1)*size,page*size).map(r => {
    const cell = (value) => `<td>${value}</td>`;
    const dash = '----------';
    return `<tr data-id="${escapeHTML(r.id)}">${cell(escapeHTML(r.code))}${cell(`<div class="cell-content">${asset('29978-21861:imgUserAvatar','avatar','SEVAGO')}<span>${escapeHTML(r.source)}</span></div>`)}${cell(asset('29978-21861:imgImage4','product','Trang sức'))}${cell(r.demo ? dash : escapeHTML(r.created.split('-').reverse().join('-')))}${cell(dash)}${cell(dash)}${cell(`<div class="cell-content">${asset('29978-21861:imgImage4','product','Trang sức')}<span>${dash}</span></div>`)}${cell(`<span class="badge">${r.demo ? 'Text' : escapeHTML(r.state)}</span>`)}${cell(dash)}${cell(dash)}${cell(r.note ? escapeHTML(r.note) : dash)}<td class="actions"><button data-action="view" aria-label="Xem phiếu nhập">${asset('action:imgPlus')}</button><button data-action="edit" aria-label="Chỉnh sửa phiếu nhập">${asset('action:imgPlus')}</button></td></tr>`;
  }).join('') || '<tr><td colspan="12" class="empty">Không tìm thấy phiếu nhập phù hợp.</td></tr>';
  const button = (label, content, value, active = false) => `<button aria-label="${label}" data-page="${value}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>${content}</button>`;
  const numbers = total <= 8 ? Array.from({length:total},(_,i)=>i+1) : [...new Set([1,2, ...(page>2 ? [page] : []),4,5,6,7])].sort((a,b)=>a-b).filter(n=>n<total);
  $('#pages').innerHTML = button('Trang đầu',asset('29978-21907:imgStyleLine3'),1) + button('Trang trước',asset('29978-21907:imgStyleLine2'),page-1) + numbers.map(n=>button(`Trang ${n}`,n,n,n===page)).join('') + (total>8 ? `<button data-page="${Math.min(total,page+4)}" aria-label="Các trang tiếp theo">...</button>` + button(`Trang ${total}`,total,total,page===total) : '') + button('Trang sau',asset('29978-21907:imgIconArrowsChevronRight'),page+1) + button('Trang cuối',asset('29978-21907:imgStyleLine1'),total);
}
$('#search').addEventListener('input', () => {page=1;render();});
$('#status').addEventListener('change', () => {page=1;render();});
$('#page-size').addEventListener('change', () => {page=1;render();});
$('#pages').addEventListener('click', e => {const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);render();$('.table-scroll').scrollTop=0;}});
document.querySelectorAll('.status').forEach(b => b.addEventListener('click', () => {document.querySelectorAll('.status').forEach(x=>x.classList.toggle('active',x===b));activeStatus=b.dataset.status==='Tất cả'?'':b.dataset.status;$('#status').value='';page=1;render();}));
document.querySelectorAll('.tab').forEach((b,i) => b.addEventListener('click', () => {document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});category=i;page=1;render();}));
$('#filter').addEventListener('click', () => {$('#filter-panel').hidden=!$('#filter-panel').hidden;$('#filter').setAttribute('aria-expanded',String(!$('#filter-panel').hidden));});
$('#apply-filter').addEventListener('click', () => {appliedSource=$('#source-filter').value.trim().toLocaleLowerCase('vi');fromDate=$('#from-date').value;toDate=$('#to-date').value;if(fromDate&&toDate&&fromDate>toDate){toast('Ngày kết thúc phải sau ngày bắt đầu.');return;}$('#filter-count').textContent=[appliedSource,fromDate,toDate].filter(Boolean).length;page=1;render();$('#filter-panel').hidden=true;});
$('#clear-filter').addEventListener('click', () => {['#source-filter','#from-date','#to-date'].forEach(s=>$(s).value='');appliedSource=fromDate=toDate='';$('#status').value='';$('#search').value='';$('#filter-count').textContent='0';page=1;render();});
$('#date').addEventListener('focus', () => {const el=$('#date');if(el.type==='text'){el.type='date';el.value='2025-01-13';}});
$('#date').addEventListener('change', () => {fromDate=toDate=$('#date').value;page=1;render();});
function openReceipt(receipt, view=false) {
  editingId=receipt?.id||null;const form=$('#receipt-form');form.reset();
  $('#dialog-title').textContent=receipt?(view?'Chi tiết phiếu nhập':'Chỉnh sửa phiếu nhập'):'Tạo phiếu nhập';
  for (const name of ['code','source','created','state','note']) {const el=form.elements[name];if(receipt)el.value=receipt[name]||'';el.disabled=view;}
  form.querySelector('[type="submit"]').hidden=view;
  $('#receipt-dialog').showModal();
}
$('#create').addEventListener('click',()=>openReceipt());
$('#quick-create').addEventListener('click',()=>openReceipt());
['#close-dialog','#cancel-dialog'].forEach(s=>$(s).addEventListener('click',()=>$('#receipt-dialog').close()));
$('#receipt-dialog').addEventListener('click', e=>{if(e.target===$('#receipt-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
$('#rows').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const r=receipts.find(x=>x.id===b.closest('tr').dataset.id);openReceipt(r,b.dataset.action==='view');});
$('#receipt-form').addEventListener('submit', e => {
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));
  data.code=data.code.trim();data.source=data.source.trim();
  if(!data.code||!data.source){toast('Vui lòng nhập mã phiếu và nguồn.');return;}
  if(receipts.some(r=>!r.demo&&r.id!==editingId&&r.code===data.code)){toast('Mã phiếu nhập đã tồn tại.');return;}
  const prior=receipts.find(r=>r.id===editingId);
  const next={...data,id:editingId||`local-${Date.now()}`,category:prior?.category??category,demo:false};
  if(editingId)receipts=receipts.map(r=>r.id===editingId?next:r);else receipts.unshift(next);
  try {localStorage.setItem(storageKey,JSON.stringify(receipts.filter(r=>!r.demo)));} catch {toast('Không thể lưu dữ liệu trên trình duyệt.');return;}
  $('#receipt-dialog').close();page=1;$('#search').value='';$('#status').value='';activeStatus='';appliedSource=fromDate=toDate='';document.querySelectorAll('.status').forEach((b,i)=>b.classList.toggle('active',i===0));render();toast('Đã lưu phiếu nhập.');
});
['#collapse','#apps'].forEach(s=>$(s).addEventListener('click',()=>$('.workspace').classList.toggle('collapsed')));
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('selected',x===b));toast(`${b.dataset.nav}: bản demo chỉ triển khai màn hình trong link Figma.`);}));
$('#notifications').addEventListener('click',()=>toast('Bạn có 9+ thông báo mẫu.'));
$('#user').addEventListener('click',()=>toast('Sevago Jewelry · Quản lý'));
render();
