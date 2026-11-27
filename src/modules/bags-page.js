/* Bag page composes the existing table factory. Scope and business data stay here. */
window.SEVAGO_BAG_PAGE=Object.freeze({create({section,state,data}){
 const repository=SEVAGO_BAG_DATA;state.appliedScope??={};state.status??='';state.secondaryStatus??='';
 const secondaryOptions=()=>repository.secondaryByPrimary[state.status]||[];
 const hasSecondary=()=>secondaryOptions().length>0;
 const layout=SEVAGO_UI.createDataPage({section,title:'Danh sách bag',
  compatibility:{page:'bag-page',panel:'bag-panel',primary:'bag-tabs',secondary:'bag-secondary-tabs',slot:'bag-grid-slot'},
  primaryTabs:{label:'Trạng thái Bag',attribute:'data-bag-status',items:['',...repository.statuses].map(key=>({key,label:key||'Tất cả'})),onChange(key){state.status=key;state.secondaryStatus='';layout.secondary.scrollLeft=0;updateData();}},
  secondaryTabs:{label:'Trạng thái thực thi Bag',attribute:'data-bag-secondary',onChange(key){if(key&&!secondaryOptions().includes(key))return;state.secondaryStatus=key;updateData();}}
 });
 const slot=layout.slot,loading=document.createElement('p');loading.className='bag-loading';loading.setAttribute('role','status');loading.textContent='Đang tải danh sách Bag…';slot.append(loading);
 let host=null,visible=true,ready=false;
 const scope=SEVAGO_BAG_SCOPE.create({getApplied:()=>state.appliedScope,onApply(applied){state.appliedScope={...applied};updateData();}});
 scope.trigger.hidden=true;SEVAGO_SHARED_HEADER.setSlot('manufacturing-execution:bags',scope.trigger);
 const authorizedRows=()=>data.records.filter(repository.authorized);
 const scopedRows=()=>authorizedRows().filter(r=>repository.inScope(r,state.appliedScope)&&(!state.status||r.status===state.status)&&(!hasSecondary()||!state.secondaryStatus||r.execution===state.secondaryStatus));
 function updateTabs(){if(state.secondaryStatus&&!secondaryOptions().includes(state.secondaryStatus))state.secondaryStatus='';layout.setTabs({primary:state.status,secondary:state.secondaryStatus,secondaryItems:hasSecondary()?['',...secondaryOptions()].map(key=>({key,label:key||'Tất cả'})):[]});}
 function updateData(){updateTabs();if(host)host.api.setData(scopedRows());}
 scope.trigger.addEventListener('click',()=>host?.api.dismissTransient());
 function exportRows(api){let rows=api.getRows();const q=api.snapshot().query.toLocaleLowerCase('vi');if(q)rows=rows.filter(r=>repository.schema.some(c=>String(r[c.key]).toLocaleLowerCase('vi').includes(q)));SEVAGO_BAG_EXPORT.download(rows,repository.schema);}
 // Page configuration only; shared composition owns geometry and component controls.
 function toolbarConfiguration(){const hasCreated=data.records.some(r=>r.created&&Number.isFinite(Date.parse(r.created)));return {
  compatibility:true,label:'Công cụ và bộ lọc Bag',
  // Approved Bag reference order retained for backward compatibility.
  order:['filter','search','date','status','sort','group','columns','more'],
  quickFilters:[
   {key:'date',disabled:!hasCreated,title:hasCreated?'Lọc theo ngày tạo Bag':'Chưa có dữ liệu Ngày tạo của Bag',description:hasCreated?'':'Chưa có dữ liệu Ngày tạo của Bag. Không dùng ngày dự kiến thay thế.'},
   {key:'status',options:repository.statuses,allLabel:'Tất cả trạng thái',getValue:api=>api.snapshot().config.filters.find(f=>f.field==='status'&&f.op==='eq')?.value||'',onChange(value,api){const filters=api.snapshot().config.filters.filter(f=>!(f.field==='status'&&f.op==='eq'));if(value)filters.push({field:'status',op:'eq',value});api.configure({filters});}}
  ]
 };}
 async function initialize(){try{data.records=await repository.list();host=await SEVAGO_UI.createTable(slot,{
  id:'manufacturing-execution-bags',title:'Danh sách Bag · Shared Advanced Data Table',storageKey:'sevago-me-bags-grid-v1',schema:repository.schema,primaryKey:'code',data:scopedRows(),totalCount:()=>authorizedRows().length,selectionLabel:'Bag',searchPlaceholder:'Tìm kiếm Bag / Công nhân…',primaryTitle:'Xuất Excel phân công bag',primaryLabel:'<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/></svg><span>Xuất Excel phân công bag</span>',actions:{selection:false,primary:exportRows},toolIds:['refresh','rules','states','reset'],compatibility:true,toolbar:toolbarConfiguration,selection:{copyLabel:'Sao chép mã'},
  hostCSS:'.cell-chip.bag-warning{background:#fffaeb;color:#93370d;border-color:#fedf89}',
  renderCell(record,column,{value,marked,esc}){if(!['priority','status','execution'].includes(column.key))return null;const color=/hủy|Thiếu|Khẩn/.test(value)?'red':/Hoàn thành/.test(value)?'green':/Đang/.test(value)?'blue':/Cao|Chờ|Đánh giá/.test(value)?'bag-warning':'neutral';return `<span class="cell-chip ${color}" title="${esc(value)}">${marked(value)}</span>`;},
  onOpenRecord(record,{showDialog,esc}){if(!record)return;showDialog('Thông tin Bag · '+record.code,`<div class="detail-grid">${repository.schema.map(c=>`<div class="field-label">${esc(c.label)}<div class="detail-value">${esc(record[c.key])}</div></div>`).join('')}<div class="field-label wide">Phạm vi sản xuất<div class="detail-value">${esc(repository.path(record))}</div></div></div>`);}
 });loading.remove();ready=true;updateTabs();if(visible){scope.show();host.api.resume();}else host.api.suspend();
 // Close page-owned overlays on interactions in the isolated table document.
 host.iframe.contentDocument.addEventListener('pointerdown',()=>scope.close(),true);
 return host;
 }catch(error){loading.textContent='Không thể tải danh sách Bag. Nhấn để thử lại.';loading.tabIndex=0;loading.onclick=()=>{slot.querySelector('iframe')?.remove();initialize();};return null;}}
 const promise=initialize();
 updateTabs();
 const controller={ready:promise,activate(){visible=true;scope.show();host?.api.resume();},deactivate(){visible=false;scope.hide();host?.api.suspend();},snapshot:()=>({scope:scope.snapshot(),status:state.status,secondaryStatus:state.secondaryStatus,ready,records:data.records?.length||0,table:host?.api.snapshot()}),getHost:()=>host};
 return controller;
}});
