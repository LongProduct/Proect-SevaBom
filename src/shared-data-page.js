/* SEVAGO Master Layout v1.0: composition only; no record state or grid algorithms. */
(()=>{
'use strict';
 function mountColumnGroups(doc,{schema,compatibility=false}){
  const scroll=doc.querySelector('#table-scroll'),region=scroll.parentElement,head=doc.querySelector('#head-row');
  const band=doc.createElement('div');band.className='sevago-column-groups'+(compatibility?' bag-column-groups':'');band.setAttribute('aria-label','Nhóm cột');region.insertBefore(band,scroll);
  const style=doc.createElement('style');style.textContent='.grid-region{flex-direction:column}.sevago-column-groups{position:relative;flex:0 0 24px;height:24px;overflow:hidden;background:#f3f3f6;border-bottom:1px solid var(--grid-border);user-select:none}.sevago-column-group{position:absolute;top:0;height:24px;box-sizing:border-box;border-right:1px solid var(--grid-border);background:#f3f3f6;line-height:24px;font-size:12px;font-weight:500;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px}.sevago-column-group.pinned{z-index:2}';doc.head.append(style);
  const definitions=new Map(schema.map(c=>[c.key,c]));let raf=0;
  function paint(){raf=0;const origin=band.getBoundingClientRect();band.style.width=scroll.clientWidth+'px';const segments=[];
   for(const th of head.children){const key=th.dataset.key,definition=definitions.get(key),group=definition?.group||'',pin=th.classList.contains('pinned')?'pinned':th.classList.contains('right-pinned')?'right':'normal',r=th.getBoundingClientRect(),last=segments.at(-1);th.setAttribute('aria-label',group?group+' / '+definition.label:definition?.label||(th.classList.contains('row-check')?'Chọn bản ghi':'Thao tác'));if(last&&last.group===group&&last.pin===pin&&Math.abs(last.right-r.left)<2){last.right=r.right;}else segments.push({group,pin,left:r.left,right:r.right});}
   band.replaceChildren(...segments.map(s=>{const el=doc.createElement('div');el.className='sevago-column-group'+(compatibility?' bag-column-group':'')+(s.pin!=='normal'?' pinned':'');el.textContent=s.group;el.title=s.group;el.style.left=(s.left-origin.left)+'px';el.style.width=(s.right-s.left)+'px';return el;}));
  }
  const schedule=()=>{if(!raf)raf=doc.defaultView.requestAnimationFrame(paint);};
  const mutation=new doc.defaultView.MutationObserver(schedule);mutation.observe(head,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  const resize=new doc.defaultView.ResizeObserver(schedule);resize.observe(scroll);scroll.addEventListener('scroll',schedule,{passive:true});paint();
  return {destroy(){mutation.disconnect();resize.disconnect();scroll.removeEventListener('scroll',schedule);doc.defaultView.cancelAnimationFrame(raf);band.remove();style.remove();}};
 }

 const DEFAULT_TOOL_ORDER=Object.freeze(['filter','sort','group','search','date','status','columns','more']);
 function mountToolbar(doc,{api,order=DEFAULT_TOOL_ORDER,quickFilters=[],label='Công cụ bảng',features={},compatibility=false}){
  const toolbar=doc.querySelector('.toolbar'),right=toolbar.querySelector('.toolbar-right'),left=doc.createElement('div'),cleanup=[];
  toolbar.classList.add('sevago-toolbar');left.className='sevago-toolbar-left'+(compatibility?' bag-toolbar-left':'');left.setAttribute('aria-label',label);
  const selectors={filter:'#filter',sort:'#sort',group:'#group',search:'.search',date:'.date',status:'#status',columns:'#columns',more:'#more-tools'};
  const controls=new Map(Object.entries(selectors).map(([key,selector])=>{const node=toolbar.querySelector(selector);return [key,key==='status'?node.closest('label'):node];}));
  for(const spec of quickFilters){const node=spec.element||doc.querySelector(spec.selector||'#'+spec.key);if(!node)throw Error('Quick filter control not found: '+spec.key);const control=node.closest('label')||node;controls.set(spec.key,control);control.classList.add('sevago-quick-filter');if(compatibility)control.classList.add('bag-quick-filter');
   if(spec.options){node.replaceChildren(...[{key:'',label:spec.allLabel||'Tất cả'},...spec.options.map(x=>typeof x==='string'?{key:x,label:x}:x)].map(item=>{const option=doc.createElement('option');option.value=item.key;option.textContent=item.label;return option;}));}
   if(spec.onChange)node.onchange=()=>spec.onChange(node.value,api);
   if(spec.disabled!==undefined){node.disabled=Boolean(spec.disabled);control.classList.toggle('sevago-filter-unavailable',node.disabled);if(compatibility)control.classList.toggle('bag-date-unavailable',node.disabled);}
   if(spec.title)control.title=spec.title;if(spec.description)node.setAttribute('aria-description',spec.description);
   if(spec.getValue){const sync=()=>node.value=spec.getValue(api)||'',observer=new doc.defaultView.MutationObserver(sync);observer.observe(doc.querySelector('#filter-count'),{childList:true,attributes:true,attributeFilter:['hidden']});sync();cleanup.push(()=>observer.disconnect());}
  }
  const ordered=[...new Set([...order,...controls.keys()])];for(const key of ordered){const control=controls.get(key);if(!control)continue;left.append(control);if(features[key]===false)control.style.setProperty('display','none','important');}
  // Retain any future engine-provided extension controls and all existing listeners.
  for(const control of [...toolbar.children])if(control!==right&&control!==left)left.append(control);toolbar.insertBefore(left,right);
  const style=doc.createElement('style');style.textContent=`
   .toolbar{gap:12px;overflow:visible;align-items:center;flex:0 0 32px}
   .sevago-toolbar-left{display:flex;align-items:center;gap:12px;flex:0 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;height:32px}
   .sevago-toolbar-left::-webkit-scrollbar{display:none}
   .sevago-toolbar-left>button,.sevago-toolbar-left>label{flex-shrink:0}
   .toolbar .search{flex:0 0 320px;width:320px;min-width:320px;max-width:320px;padding:6px 10px;font-size:14px}
   .toolbar .search input{font-size:14px}.toolbar .sevago-quick-filter{display:flex!important}
   .toolbar .date{width:202px;gap:8px;font-size:14px;padding:4px 10px}.toolbar .date input{width:120px;font-size:13px}
   .toolbar .select-wrap{width:151px;font-size:14px}.toolbar .toolbar-right{margin-left:auto;flex:0 0 auto;gap:12px}
   .toolbar #create{font-size:14px;font-weight:500;padding:6px 12px;gap:8px}.toolbar #create .ico{width:20px;height:20px}
   .sevago-filter-unavailable{background:#f9fafb;color:#737676}.sevago-filter-unavailable input:disabled{opacity:.6;cursor:not-allowed}
   @media(max-width:850px){.toolbar #create span{display:none}.toolbar #create{width:32px;padding:6px}.toolbar #create .ico{width:20px;height:20px}}
  `;doc.head.append(style);  return {element:toolbar,destroy(){cleanup.forEach(fn=>fn());style.remove();}};
 }
 function mountSelection(doc,{copyLabel,actions=[]}={},api){
  const bar=doc.querySelector('#selection-toolbar'),copy=doc.querySelector('#copy-codes'),clear=doc.querySelector('#clear-selection');
  if(copyLabel)copy.lastChild.textContent=copyLabel;
  const buttons=actions.map(action=>{if(typeof action.run!=='function')throw Error('Selection action requires run: '+action.id);const button=doc.createElement('button');button.type='button';button.className=action.primary?'primary':'btn';button.dataset.selectionAction=action.id;button.textContent=action.label;
   button.onclick=async()=>{button.disabled=true;try{await action.run(api.getSelection(),api);}catch(error){if(action.onError)action.onError(error);else api.showDialog('Không thể thực hiện thao tác',String(error.message||error));}finally{sync();}};bar.insertBefore(button,clear);return {button,action};});
  function sync(){for(const {button,action}of buttons)button.disabled=action.enabled?!action.enabled(api.getSelection(),api):false;}
  const observer=new doc.defaultView.MutationObserver(sync);observer.observe(bar,{attributes:true,attributeFilter:['hidden']});observer.observe(doc.querySelector('#selection-count'),{childList:true});sync();
  return {destroy(){observer.disconnect();buttons.forEach(({button})=>button.remove());}};
 }

 function createDataPage({section,title,primaryTabs={},secondaryTabs={},compatibility={}}){
  const doc=section.ownerDocument;section.classList.add('sevago-data-page');if(compatibility.page)section.classList.add(compatibility.page);section.replaceChildren();
  const heading=doc.createElement('h1');heading.textContent=title;
  const panel=doc.createElement('section');panel.className='sevago-data-panel'+(compatibility.panel?' '+compatibility.panel:'');
  const primary=doc.createElement('nav');primary.className='tabs sevago-primary-tabs'+(compatibility.primary?' '+compatibility.primary:'');primary.setAttribute('role','tablist');primary.setAttribute('aria-label',primaryTabs.label||'Nhóm dữ liệu');
  const secondary=doc.createElement('nav');secondary.className='sevago-secondary-tabs'+(compatibility.secondary?' '+compatibility.secondary:'');secondary.setAttribute('role','tablist');secondary.setAttribute('aria-label',secondaryTabs.label||'Trạng thái con');
  const slot=doc.createElement('div');slot.className='sevago-grid-slot'+(compatibility.slot?' '+compatibility.slot:'');
  panel.append(primary,secondary,slot);section.append(heading,panel);let primaryKey='',secondaryKey='',lastGroup=null,lastItems='';
  const primaryAttribute=primaryTabs.attribute||'data-primary-tab',secondaryAttribute=secondaryTabs.attribute||'data-secondary-tab';
  function render(nav,items,attribute,isPrimary=false){nav.replaceChildren(...items.map(item=>{const b=doc.createElement('button');b.type='button';if(isPrimary)b.className='tab';b.setAttribute(attribute,item.key);b.setAttribute('role','tab');b.textContent=item.label;return b;}));}
  function mark(nav,attribute,value){for(const b of nav.children){const active=b.getAttribute(attribute)===value;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}}
  render(primary,primaryTabs.items||[],primaryAttribute,true);primary.hidden=!primary.children.length;secondary.hidden=true;
  function setTabs({primary:nextPrimary='',secondary:nextSecondary='',secondaryItems=[],secondaryGroup=nextPrimary}={}){primaryKey=nextPrimary;secondaryKey=nextSecondary;const serialized=JSON.stringify(secondaryItems);if(lastGroup!==secondaryGroup||lastItems!==serialized){render(secondary,secondaryItems,secondaryAttribute);lastGroup=secondaryGroup;lastItems=serialized;}secondary.hidden=!secondaryItems.length;mark(primary,primaryAttribute,primaryKey);mark(secondary,secondaryAttribute,secondaryKey);}
  primary.onclick=e=>{const b=e.target.closest('['+primaryAttribute+']');if(b&&b.getAttribute(primaryAttribute)!==primaryKey)primaryTabs.onChange?.(b.getAttribute(primaryAttribute));};
  secondary.onclick=e=>{const b=e.target.closest('['+secondaryAttribute+']');if(b&&!secondary.hidden&&b.getAttribute(secondaryAttribute)!==secondaryKey)secondaryTabs.onChange?.(b.getAttribute(secondaryAttribute));};
  const navigate=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...e.currentTarget.children];if(!buttons.length)return;let index=buttons.indexOf(doc.activeElement);index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].click();buttons[index].scrollIntoView({block:'nearest',inline:'nearest'});};primary.onkeydown=navigate;secondary.onkeydown=navigate;
  return Object.freeze({section,panel,primary,secondary,slot,setTabs,destroy(){primary.onclick=secondary.onclick=primary.onkeydown=secondary.onkeydown=null;section.replaceChildren();}});
 }
 const gridPresentationCSS='.toolbar #create{white-space:nowrap}.floating-selection #selection-count{display:flex;gap:6px;align-items:center}.floating-selection #selection-count::before{content:"";width:18px;height:18px;display:inline-block;background:center/18px 18px no-repeat url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2718%27 height=%2718%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2307554b%27 stroke-width=%271.6%27%3E%3Cpath d=%27m5 12 4 4L19 6%27/%3E%3C/svg%3E")}.floating-selection #copy-codes{font-size:13px}.floating-selection #copy-codes .ico{display:inline-block}.grid-footer{white-space:nowrap}.grid-state p{max-width:360px}';
 async function createTable(container,options){
  const config={...options.config},schema=options.schema;
  if(!config.columns&&(options.defaultPinnedColumns||options.defaultHiddenColumns||options.defaultColumnOrder||options.defaultColumnWidths)){
   const order=[...new Set([...(options.defaultColumnOrder||[]),...schema.map(c=>c.key)])];
   config.columns=order.map(key=>schema.find(c=>c.key===key)).filter(Boolean).map(c=>({key:c.key,width:options.defaultColumnWidths?.[c.key]??c.width,hidden:options.defaultHiddenColumns?options.defaultHiddenColumns.includes(c.key):Boolean(c.hidden),pinned:options.defaultPinnedColumns?options.defaultPinnedColumns.includes(c.key):c.key===options.primaryKey}));
  }
  const data=options.dataSource?await options.dataSource():options.data;
  const host=await SEVAGO_GRID_HOST.create(container,{...options,data,config,actions:{selection:false,...options.actions},hostCSS:gridPresentationCSS+(options.hostCSS||'')});
  const doc=host.iframe.contentDocument,mounted=[];
  if(!options.actions?.primary)doc.querySelector('#create').hidden=true;
  try{
   if(options.schema?.some(c=>c.group)&&options.columnGroups!==false)mounted.push(mountColumnGroups(doc,{schema:options.schema,compatibility:options.compatibility===true}));
   const toolbar=typeof options.toolbar==='function'?options.toolbar(host.api):options.toolbar||{};
   mounted.push(mountToolbar(doc,{api:host.api,...toolbar}));mounted.push(mountSelection(doc,options.selection,host.api));
   for(const action of options.additionalActions||[]){if(typeof action.run!=='function')throw Error('Toolbar action requires run: '+action.id);const button=doc.createElement('button');button.type='button';button.className='btn';button.dataset.businessAction=action.id;button.textContent=action.label;button.onclick=()=>action.run(host.api);doc.querySelector('.toolbar-right').append(button);mounted.push({destroy:()=>button.remove()});}
   return Object.freeze({...host,destroy(){mounted.reverse().forEach(component=>component.destroy());host.destroy();}});
  }catch(error){mounted.reverse().forEach(component=>component.destroy());host.destroy();throw error;}
 }
 function defineDataModule(definition){
  const contexts=new Map(),pages=definition.pages||[];
  if(!pages.length)throw Error('Data module requires pages.');
  const module={...definition,implemented:true,defaultPage:definition.defaultPage||pages[0].id,
   mount({state,data,navigate}){
    const doc=document,host=doc.createElement('section');host.className='sevago-module-host';host.dataset.moduleId=definition.id;
    state.navigation??={active:module.defaultPage,expanded:{},collapsed:false};state.pages??={};data.pages??={};
    const nav=SEVAGO_SHARED_SIDEBAR.create({moduleId:definition.id,label:definition.name,items:definition.sidebar||pages.map(p=>({id:p.id,label:p.title||p.name})),state:state.navigation,onNavigate:id=>navigate(definition.id,id)});
    const content=doc.createElement('section');content.className='sm-content sevago-data-content';const mounted=new Map();
    const context={state,data,content,nav,mounted,active:null,slot:null};
    if(definition.headerSlot){context.slot=definition.headerSlot({state,data});const node=context.slot.element||context.slot;node.hidden=true;SEVAGO_SHARED_HEADER.setSlot(definition.id,node);}
    host.append(nav.element,content);contexts.set(host,context);nav.restore();return host;
   },
   activate(host,{page}){
    const ctx=contexts.get(host),spec=pages.find(p=>p.id===page);if(!ctx||!spec)return;
    if(ctx.active&&ctx.active!==page){const previous=ctx.mounted.get(ctx.active);previous.section.hidden=true;previous.table?.api.suspend();}
    let instance=ctx.mounted.get(page);
    if(!instance){
     const state=ctx.state.pages[page]??={primary:spec.defaultPrimary||'',secondary:''},data=ctx.data.pages[page]??={records:[]};
     const section=document.createElement('section');section.className='sevago-config-page';section.dataset.pageId=page;ctx.content.append(section);
     const primary=spec.tabs?.primary||[],secondary=()=>spec.tabs?.secondaryByPrimary?.[state.primary]||[];
     const rows=()=>spec.selectRows?spec.selectRows(data.records,state):data.records;
     const update=()=>{layout.setTabs({primary:state.primary,secondary:state.secondary,secondaryItems:secondary()});instance.table?.api.setData(rows());};
     const layout=createDataPage({section,title:spec.title||spec.name,primaryTabs:{items:primary,onChange(key){state.primary=key;state.secondary='';layout.secondary.scrollLeft=0;update();}},secondaryTabs:{onChange(key){state.secondary=key;update();}}});
     instance={section,layout,table:null,ready:null};ctx.mounted.set(page,instance);
     const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Đang tải dữ liệu…';layout.slot.append(status);
     const load=async()=>{try{data.records=JSON.parse(JSON.stringify(spec.dataSource?await spec.dataSource({state,data}):spec.data||[]));const tableOptions=typeof spec.table==='function'?spec.table({state,data}):spec.table;
       instance.table=await createTable(layout.slot,{...tableOptions,id:definition.id+'-'+page,storageKey:tableOptions?.storageKey||definition.id+'-'+page+'-v1',data:rows(),totalCount:()=>data.records.length});status.remove();if(ctx.active!==page)instance.table.api.suspend();
      }catch(error){status.textContent='Không thể tải dữ liệu. Nhấn để thử lại.';status.tabIndex=0;status.onclick=()=>{instance.ready=load();};status.onkeydown=e=>{if(e.key==='Enter')status.click();};}
     };
     update();instance.ready=load();
    }
    ctx.active=page;instance.section.hidden=false;instance.table?.api.resume();ctx.nav.setActive(page);ctx.nav.restore();
    if(ctx.slot){const node=ctx.slot.element||ctx.slot;node.hidden=false;ctx.slot.show?.();}
   }
  };
  document.addEventListener('sevago:module-change',e=>{if(e.detail.id===definition.id)return;for(const ctx of contexts.values()){if(ctx.active)ctx.mounted.get(ctx.active)?.table?.api.suspend();if(ctx.slot){ctx.slot.hide?.();(ctx.slot.element||ctx.slot).hidden=true;}}});
  return Object.freeze(module);
 }
 window.SEVAGO_UI=Object.freeze({version:'1.0',DEFAULT_TOOL_ORDER,defineDataModule,createTable,createDataPage,mountToolbar,mountColumnGroups,mountSelection});

})();
