/* Page-owned weighing demo. Production workflow/units remain unconfigured. */
window.SEVAGO_BAG_WEIGHING_PAGE=Object.freeze({create({section,state,data}){
 const statuses=['Chờ Out','Đã điều phối'];state.status??=statuses[0];
 const schema=[
  {key:'code',label:'Mã Bag',type:'text',width:160},
  {key:'item',label:'Mã Item',type:'text',width:170},
  {key:'worker',label:'Công nhân',type:'person',width:210},
  {key:'workcenter',label:'Workcenter',type:'text',width:190},
  {key:'line',label:'Line',type:'text',width:150},
  {key:'site',label:'Unit/Site',type:'text',width:210},
  {key:'quantity',label:'Số lượng',type:'number',width:120},
  {key:'weight',label:'Trọng lượng',type:'number',width:140},
  {key:'status',label:'Trạng thái',type:'select',width:160}
 ];
 const workers=['Nguyễn Minh Anh','Trần Hoàng Nam','Lê Thị Thanh Trúc','Phạm Quốc Bảo','Hoàng Nguyễn Thiên Long – Tổ hoàn thiện sản phẩm'];
 data.records=Array.from({length:60},(_,i)=>({id:'weighing-bag-'+(i+1),code:'DEMO-CB-'+String(i+1).padStart(5,'0'),item:'DEMO-ITEM-'+String(i%12+1).padStart(4,'0')+(i%9===0?' – Bộ trang sức phiên bản giới hạn':''),worker:workers[i%workers.length],workcenter:i%7===0?'WC-04 – Hoàn thiện và kiểm tra chất lượng sản phẩm':'WC-0'+(i%4+1),line:'Line '+String(i%5+1).padStart(2,'0'),site:i%8===0?'Unit/Site – Khu sản xuất công nghệ cao và hoàn thiện sản phẩm':'Unit/Site '+(i%3+1),quantity:5+i%24,weight:Number((2.125+i*0.1375).toFixed(4)),status:statuses[i%3===0?1:0]}));
 const rows=()=>data.records.filter(r=>r.status===state.status);
 let host=null,visible=true,ready=false;
 const layout=SEVAGO_UI.createDataPage({section,title:'Danh sách Cân Bag',primaryTabs:{items:statuses.map(key=>({key,label:key})),onChange(key){state.status=key;update();}}});
 const loading=document.createElement('p');loading.setAttribute('role','status');loading.textContent='Đang tải danh sách Cân Bag…';layout.slot.append(loading);
 const unavailable='Chưa triển khai luồng cân; chờ yêu cầu nghiệp vụ và xác minh điều kiện cân trên Production.';
 const workflowConfigured=false;
 const canWeigh=api=>api.getSelection().length>0&&workflowConfigured;
 // Both entry points share the same guard; never open a fabricated weighing flow.
 const weigh=api=>{if(!canWeigh(api))return;};
 function update(){layout.setTabs({primary:state.status});host?.api.setData(rows());}
 async function initialize(){try{
 host=await SEVAGO_UI.createTable(layout.slot,{id:'manufacturing-execution-bag-weighing',title:'Danh sách Cân Bag · Dữ liệu demo',storageKey:'sevago-me-bag-weighing-v1',schema,primaryKey:'code',data:rows(),totalCount:()=>rows().length,selectionLabel:'Bag',searchPlaceholder:'Tìm kiếm mã Bag...',defaultPinnedColumns:['code'],columnGroups:false,
 primaryTitle:unavailable,primaryLabel:'<svg class="ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4h14l-2 5H7L5 4Zm2 16h10l2-5H5l2 5Zm5-11v6"/></svg><span>Cân Bag</span>',actions:{selection:false,primary:weigh},toolIds:['refresh','states','reset'],toolbar:{order:['filter','sort','group','search','columns','more'],features:{date:false,status:false}},selection:{actions:[{id:'weigh',label:'Cân Bag',primary:true,enabled:(_,api)=>canWeigh(api),run:(_,api)=>weigh(api)}]},
 hostCSS:'#copy-codes{display:none!important}',
 renderCell(record,column,{value,marked,esc}){if(column.key==='weight')return `<span class="numeric" title="Giá trị demo, chưa xác minh đơn vị Production">${marked(String(value))}</span>`;if(column.key==='item')return `<button class="record-link clip" data-open-record="${esc(record.id)}">${marked(value)}</button>`;return null;},
 onOpenRecord(record,{showDialog,esc}){if(!record)return;showDialog('Thông tin Cân Bag · '+record.code,`<p class="muted">Dữ liệu demo độc lập. Đơn vị và độ chính xác trọng lượng chưa được xác minh với Production.</p><div class="detail-grid">${schema.map(c=>`<div class="field-label">${esc(c.label)}<div class="detail-value">${esc(record[c.key])}</div></div>`).join('')}</div>`);}
 });
 const doc=host.iframe.contentDocument,button=doc.querySelector('#create');button.disabled=true;button.setAttribute('aria-label','Cân Bag');button.setAttribute('aria-description',unavailable);doc.querySelector('[data-selection-action="weigh"]').title=unavailable;
 // Show the selected count without suggesting that the demo can execute weighing.
 const sync=()=>{const disabled=!canWeigh(host.api);if(button.disabled!==disabled)button.disabled=disabled;button.title=host.api.getSelection().length?unavailable:'Chọn Bag bằng checkbox. '+unavailable;};
 const observer=new doc.defaultView.MutationObserver(sync);observer.observe(doc.querySelector('#selection-count'),{childList:true});observer.observe(button,{attributes:true,attributeFilter:['disabled']});sync();
 loading.remove();ready=true;if(!visible)host.api.suspend();return host;
 }catch(error){console.error('Bag weighing demo initialization failed',error);loading.textContent='Không thể tải dữ liệu demo. Nhấn để thử lại.';loading.tabIndex=0;loading.onclick=()=>initialize();loading.onkeydown=e=>{if(e.key==='Enter')loading.click();};return null;}}
 update();const promise=initialize();return {ready:promise,activate(){visible=true;host?.api.resume();},deactivate(){visible=false;host?.api.suspend();},snapshot:()=>({ready,status:state.status,records:data.records.length,table:host?.api.snapshot()}),getHost:()=>host};
}});
