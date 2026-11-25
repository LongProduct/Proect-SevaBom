/* Bag page composes the existing table factory. Scope and business data stay here. */
window.SEVAGO_BAG_PAGE=Object.freeze({create({section,state,data}){
 const repository=SEVAGO_BAG_DATA;state.appliedScope??={};state.status??='';state.secondaryStatus??='';
 const secondaryOptions=()=>repository.secondaryByPrimary[state.status]||[];
 const hasSecondary=()=>secondaryOptions().length>0;
 section.classList.add('bag-page');section.replaceChildren();const heading=document.createElement('h1');heading.textContent='Danh sách bag';
 const panel=document.createElement('section');panel.className='bag-panel';const tabs=document.createElement('nav');tabs.className='tabs bag-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Trạng thái Bag');
 for(const status of ['Tất cả',...repository.statuses]){const button=document.createElement('button');button.className='tab';button.type='button';button.dataset.bagStatus=status==='Tất cả'?'':status;button.setAttribute('role','tab');button.textContent=status;tabs.append(button);}
 const secondaryTabs=document.createElement('nav');secondaryTabs.className='bag-secondary-tabs';secondaryTabs.setAttribute('role','tablist');secondaryTabs.setAttribute('aria-label','Trạng thái thực thi Bag');
 let renderedPrimary=null;
 function renderSecondaryTabs(){if(renderedPrimary===state.status)return;renderedPrimary=state.status;secondaryTabs.replaceChildren();for(const status of ['',...secondaryOptions()]){const button=document.createElement('button');button.type='button';button.dataset.bagSecondary=status;button.setAttribute('role','tab');button.textContent=status||'Tất cả';secondaryTabs.append(button);}}
 const slot=document.createElement('div');slot.className='bag-grid-slot';const loading=document.createElement('p');loading.className='bag-loading';loading.setAttribute('role','status');loading.textContent='Đang tải danh sách Bag…';slot.append(loading);panel.append(tabs,secondaryTabs,slot);section.append(heading,panel);
 let host=null,visible=true,ready=false;
 const scope=SEVAGO_BAG_SCOPE.create({getApplied:()=>state.appliedScope,onApply(applied){state.appliedScope={...applied};updateData();}});
 scope.trigger.hidden=true;document.querySelector('.app-header>strong').after(scope.trigger);
 const authorizedRows=()=>data.records.filter(repository.authorized);
 const scopedRows=()=>authorizedRows().filter(r=>repository.inScope(r,state.appliedScope)&&(!state.status||r.status===state.status)&&(!hasSecondary()||!state.secondaryStatus||r.execution===state.secondaryStatus));
 function updateTabs(){if(state.secondaryStatus&&!secondaryOptions().includes(state.secondaryStatus))state.secondaryStatus='';renderSecondaryTabs();secondaryTabs.hidden=!hasSecondary();secondaryTabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.bagSecondary===state.secondaryStatus;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});tabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.bagStatus===state.status;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});}
 function updateData(){updateTabs();if(host)host.api.setData(scopedRows());}
 tabs.onclick=e=>{const b=e.target.closest('[data-bag-status]');if(!b||state.status===b.dataset.bagStatus)return;state.status=b.dataset.bagStatus;state.secondaryStatus='';secondaryTabs.scrollLeft=0;updateData();};
 secondaryTabs.onclick=e=>{const b=e.target.closest('[data-bag-secondary]');if(!b||!hasSecondary()||(b.dataset.bagSecondary&&!secondaryOptions().includes(b.dataset.bagSecondary))||state.secondaryStatus===b.dataset.bagSecondary)return;state.secondaryStatus=b.dataset.bagSecondary;updateData();};
 function navigateTabs(e){if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...e.currentTarget.querySelectorAll('button')];let index=buttons.indexOf(document.activeElement);index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].click();buttons[index].scrollIntoView({block:'nearest',inline:'nearest'});}
 tabs.onkeydown=navigateTabs;secondaryTabs.onkeydown=navigateTabs;
 scope.trigger.addEventListener('click',()=>host?.api.dismissTransient());
 function exportRows(api){let rows=api.getRows();const q=api.snapshot().query.toLocaleLowerCase('vi');if(q)rows=rows.filter(r=>repository.schema.some(c=>String(r[c.key]).toLocaleLowerCase('vi').includes(q)));SEVAGO_BAG_EXPORT.download(rows,repository.schema);}
 // Page-only group band above the engine's unmodified 36px header.
 // It reads actual rendered widths/order, including pin/hide/reorder changes.
 function mountColumnGroups(doc){
  const scroll=doc.querySelector('#table-scroll'),region=scroll.parentElement,head=doc.querySelector('#head-row');
  const band=doc.createElement('div');band.className='bag-column-groups';band.setAttribute('aria-label','Nhóm cột');region.insertBefore(band,scroll);
  const style=doc.createElement('style');style.textContent='.grid-region{flex-direction:column}.bag-column-groups{position:relative;flex:0 0 24px;height:24px;overflow:hidden;background:#f3f3f6;border-bottom:1px solid var(--grid-border);user-select:none}.bag-column-group{position:absolute;top:0;height:24px;box-sizing:border-box;border-right:1px solid var(--grid-border);background:#f3f3f6;line-height:24px;font-size:12px;font-weight:500;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px}.bag-column-group.pinned{z-index:2}';doc.head.append(style);
  const definitions=new Map(repository.schema.map(c=>[c.key,c]));let raf=0;
  function paint(){raf=0;const origin=band.getBoundingClientRect();band.style.width=scroll.clientWidth+'px';const segments=[];
   for(const th of head.children){const key=th.dataset.key,definition=definitions.get(key),group=definition?.group||'',pin=th.classList.contains('pinned')?'pinned':th.classList.contains('right-pinned')?'right':'normal',r=th.getBoundingClientRect(),last=segments.at(-1);th.setAttribute('aria-label',group?group+' / '+definition.label:definition?.label||(th.classList.contains('row-check')?'Chọn bản ghi':'Thao tác'));if(last&&last.group===group&&last.pin===pin&&Math.abs(last.right-r.left)<2){last.right=r.right;}else segments.push({group,pin,left:r.left,right:r.right});}
   band.replaceChildren(...segments.map(s=>{const el=doc.createElement('div');el.className='bag-column-group'+(s.pin!=='normal'?' pinned':'');el.textContent=s.group;el.title=s.group;el.style.left=(s.left-origin.left)+'px';el.style.width=(s.right-s.left)+'px';return el;}));
  }
  const schedule=()=>{if(!raf)raf=doc.defaultView.requestAnimationFrame(paint);};
  new doc.defaultView.MutationObserver(schedule).observe(head,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  new doc.defaultView.ResizeObserver(schedule).observe(scroll);scroll.addEventListener('scroll',schedule,{passive:true});paint();
 }
 // Bag-only composition: preserve engine controls/listeners, group them for layout.
 function mountToolbar(doc){
  const toolbar=doc.querySelector('.toolbar'),right=toolbar.querySelector('.toolbar-right'),left=doc.createElement('div');left.className='bag-toolbar-left';left.setAttribute('aria-label','Công cụ và bộ lọc Bag');
  const search=toolbar.querySelector('.search'),sort=doc.querySelector('#sort'),group=doc.querySelector('#group');
  // Keep the reference's Filter → Search → quick filters together.
  toolbar.insertBefore(search,sort);
  toolbar.insertBefore(sort,doc.querySelector('#columns'));toolbar.insertBefore(group,doc.querySelector('#columns'));
  for(const control of [...toolbar.children])if(control!==right)left.append(control);toolbar.insertBefore(left,right);
  const status=doc.querySelector('#status'),date=doc.querySelector('#date'),dateLabel=date.closest('label');
  status.closest('label').classList.add('bag-quick-filter');dateLabel.classList.add('bag-quick-filter');
  status.replaceChildren(...['',...repository.statuses].map(value=>{const option=doc.createElement('option');option.value=value;option.textContent=value||'Tất cả trạng thái';return option;}));
  status.onchange=()=>{const filters=host.api.snapshot().config.filters.filter(f=>!(f.field==='status'&&f.op==='eq'));if(status.value)filters.push({field:'status',op:'eq',value:status.value});host.api.configure({filters});};
  const hasCreated=data.records.some(r=>r.created&&Number.isFinite(Date.parse(r.created)));
  date.disabled=!hasCreated;dateLabel.classList.toggle('bag-date-unavailable',!hasCreated);dateLabel.title=hasCreated?'Lọc theo ngày tạo Bag':'Chưa có dữ liệu Ngày tạo của Bag';
  if(!hasCreated)date.setAttribute('aria-description','Chưa có dữ liệu Ngày tạo của Bag. Không dùng ngày dự kiến thay thế.');
  const count=doc.querySelector('#filter-count');
  const sync=()=>{const current=host.api.snapshot().config.filters.find(f=>f.field==='status'&&f.op==='eq');status.value=current?.value||'';};
  new doc.defaultView.MutationObserver(sync).observe(count,{childList:true,attributes:true,attributeFilter:['hidden']});sync();
  const style=doc.createElement('style');style.textContent=`
   .toolbar{gap:12px;overflow:visible;align-items:center;flex:0 0 32px}
   .bag-toolbar-left{display:flex;align-items:center;gap:12px;flex:0 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;height:32px}
   .bag-toolbar-left::-webkit-scrollbar{display:none}
   .bag-toolbar-left>button,.bag-toolbar-left>label{flex-shrink:0}
   .toolbar .search{flex:0 0 320px;width:320px;min-width:320px;max-width:320px;padding:6px 10px;font-size:14px}
   .toolbar .search input{font-size:14px}.toolbar .bag-quick-filter{display:flex!important}
   .toolbar .date{width:202px;gap:8px;font-size:14px;padding:4px 10px}.toolbar .date input{width:120px;font-size:13px}
   .toolbar .select-wrap{width:151px;font-size:14px}.toolbar .toolbar-right{margin-left:auto;flex:0 0 auto;gap:12px}
   .toolbar #create{font-size:14px;font-weight:500;padding:6px 12px;gap:8px}.toolbar #create .ico{width:20px;height:20px}
   .bag-date-unavailable{background:#f9fafb;color:#737676}.bag-date-unavailable input:disabled{opacity:.6;cursor:not-allowed}
   @media(max-width:850px){.toolbar #create span{display:none}.toolbar #create{width:32px;padding:6px}.toolbar #create .ico{width:20px;height:20px}}
  `;doc.head.append(style);
 }
 async function initialize(){try{data.records=await repository.list();host=await SEVAGO_GRID_HOST.create(slot,{
  id:'manufacturing-execution-bags',title:'Danh sách Bag · Shared Advanced Data Table',storageKey:'sevago-me-bags-grid-v1',schema:repository.schema,primaryKey:'code',data:scopedRows(),totalCount:()=>authorizedRows().length,selectionLabel:'Bag',searchPlaceholder:'Tìm kiếm Bag / Công nhân…',primaryTitle:'Xuất Excel phân công bag',primaryLabel:'<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/></svg><span>Xuất Excel phân công bag</span>',actions:{selection:false,primary:exportRows},toolIds:['refresh','rules','states','reset'],
  hostCSS:'.cell-chip.bag-warning{background:#fffaeb;color:#93370d;border-color:#fedf89}.toolbar #create{white-space:nowrap}.floating-selection #selection-count{display:flex;gap:6px;align-items:center}.floating-selection #selection-count::before{content:"";width:18px;height:18px;display:inline-block;background:center/18px 18px no-repeat url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2718%27 height=%2718%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2307554b%27 stroke-width=%271.6%27%3E%3Cpath d=%27m5 12 4 4L19 6%27/%3E%3C/svg%3E")}.floating-selection #copy-codes{font-size:13px}.floating-selection #copy-codes .ico{display:inline-block}.grid-footer{white-space:nowrap}.grid-state p{max-width:360px}',
  renderCell(record,column,{value,marked,esc}){if(!['priority','status','execution'].includes(column.key))return null;const color=/hủy|Thiếu|Khẩn/.test(value)?'red':/Hoàn thành/.test(value)?'green':/Đang/.test(value)?'blue':/Cao|Chờ|Đánh giá/.test(value)?'bag-warning':'neutral';return `<span class="cell-chip ${color}" title="${esc(value)}">${marked(value)}</span>`;},
  onOpenRecord(record,{showDialog,esc}){if(!record)return;showDialog('Thông tin Bag · '+record.code,`<div class="detail-grid">${repository.schema.map(c=>`<div class="field-label">${esc(c.label)}<div class="detail-value">${esc(record[c.key])}</div></div>`).join('')}<div class="field-label wide">Phạm vi sản xuất<div class="detail-value">${esc(repository.path(record))}</div></div></div>`);}
 });mountColumnGroups(host.iframe.contentDocument);mountToolbar(host.iframe.contentDocument);loading.remove();host.iframe.contentDocument.querySelector('#copy-codes').lastChild.textContent='Sao chép mã';ready=true;updateTabs();if(visible){scope.show();host.api.resume();}else host.api.suspend();
 // Close page-owned overlays on interactions in the isolated table document.
 host.iframe.contentDocument.addEventListener('pointerdown',()=>scope.close(),true);
 return host;
 }catch(error){loading.textContent='Không thể tải danh sách Bag. Nhấn để thử lại.';loading.tabIndex=0;loading.onclick=()=>{slot.querySelector('iframe')?.remove();initialize();};return null;}}
 const promise=initialize();
 updateTabs();
 const controller={ready:promise,activate(){visible=true;scope.show();host?.api.resume();},deactivate(){visible=false;scope.hide();host?.api.suspend();},snapshot:()=>({scope:scope.snapshot(),status:state.status,secondaryStatus:state.secondaryStatus,ready,records:data.records?.length||0,table:host?.api.snapshot()}),getHost:()=>host};
 return controller;
}});
