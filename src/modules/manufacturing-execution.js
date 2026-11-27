/* Manufacturing Execution: navigation only. No business records or table fork. */
(()=>{
 const id='manufacturing-execution';
 const sidebar=[
  {id:'bags',label:'Danh sách bag'},
  {id:'bag-weighing',label:'Danh sách Cân Bag'},
  {id:'print-rejections',label:'Quản lý từ chối In'},
  {id:'returns',label:'Quản lý đổi trả'},
  {id:'solder-requests',label:'Quản lý yêu cầu cấp Solder'},
  {id:'machine-status',label:'Quản lý trạng thái máy móc'},
  {id:'stone-book',label:'Đá sổ'},
  {id:'temporary-transfer',label:'Điều chuyển tạm'},
  {id:'factory-layout',label:'Layout Nhà máy'},
  {id:'configuration',label:'Cấu hình',children:[
   {id:'worker-teams',label:'Quản lý Worker Team'},
   {id:'workers',label:'Quản lý công nhân'},
   {id:'reasons',label:'Quản lý lý do'},
   {id:'mc-owners',label:'Quản lý MC phụ trách'},
   {id:'scales',label:'Quản lý cân'},
   {id:'out-qc-kcs',label:'Xác nhận OUT QC KCS'}
  ]},
  {id:'mc-weighing',label:'Cân MC'},
  {id:'reports',label:'Báo cáo',expandable:true}
 ];
 const pages=sidebar.flatMap(item=>[{id:item.id,name:item.label},...(item.children||[]).map(child=>({id:child.id,name:child.label}))]);
 const mounted=new WeakMap();
 document.addEventListener('sevago:module-change',e=>{for(const host of document.querySelectorAll('.me-workspace')){const ctx=mounted.get(host);if(e.detail.id!==id){ctx?.bags?.deactivate();ctx?.weighing?.deactivate();}}});
 const definition={id,name:'Thực thi sản xuất',englishName:'Manufacturing Execution',description:'Manufacturing Execution',group:'Vận hành sản xuất',color:'#13A879',icon:SHELL_ASSETS['manufacturing-execution'],launcherIcon:SHELL_ASSETS['manufacturing-execution-launcher'],iconSize:44,implemented:true,defaultPage:'bags',route:`#/apps/${id}/bags`,sidebar,pages,
  mount({state,data,navigate}){
   const host=document.createElement('section');host.className='sevago-module-host me-workspace';host.dataset.moduleId=id;host.setAttribute('aria-label','Thực thi sản xuất');
   state.navigation??={active:'bags',expanded:{},collapsed:false};state.pages??={};data.pages??=Object.create(null);
   const nav=SEVAGO_SHARED_SIDEBAR.create({moduleId:id,label:'Điều hướng Thực thi sản xuất',items:sidebar,state:state.navigation,onNavigate:page=>navigate(id,page)});
   const content=document.createElement('section');content.className='sm-content me-content';content.setAttribute('aria-label','Nội dung Thực thi sản xuất');
   const containers=new Map();
   for(const page of pages){
    // Each future table receives its own data/config/UI context, using the existing engine.
    data.pages[page.id]={records:[]};state.pages[page.id]={scrollTop:0,table:{engine:'shared-advanced-data-table',readOnly:true,rowHeight:36,columns:[],filters:[],viewTabs:[],businessActions:[],uiState:{}}};
    const section=document.createElement('section');section.className='me-page';section.dataset.mePage=page.id;section.id=`me-page-${page.id}`;section.hidden=true;
    const heading=document.createElement('h1');heading.textContent=page.name;
    const placeholder=document.createElement('div');placeholder.className='me-placeholder';const title=document.createElement('h2');title.textContent='Chưa triển khai';const note=document.createElement('p');note.textContent='Nội dung trang sẽ được bổ sung theo yêu cầu nghiệp vụ ở bước tiếp theo.';placeholder.append(title,note);
    const tableSlot=document.createElement('div');tableSlot.className='me-shared-table-slot';tableSlot.dataset.tablePage=page.id;tableSlot.hidden=true;
    section.append(heading,placeholder,tableSlot);content.append(section);containers.set(page.id,section);
   }
   host.append(nav.element,content);mounted.set(host,{nav,content,containers,state,data,bags:null,weighing:null});nav.restore();return host;
  },
  activate(host,{page}){
   const ctx=mounted.get(host);if(!ctx)return;
   const previous=ctx.state.activePage;if(previous&&previous!==page)ctx.state.pages[previous].scrollTop=ctx.content.scrollTop;
   for(const [key,container]of ctx.containers)container.hidden=key!==page;
   if(page==='bags'){if(!ctx.bags)ctx.bags=SEVAGO_BAG_PAGE.create({section:ctx.containers.get('bags'),state:ctx.state.pages.bags,data:ctx.data.pages.bags});ctx.bags.activate();}else ctx.bags?.deactivate();
   if(page==='bag-weighing'){if(!ctx.weighing)ctx.weighing=SEVAGO_BAG_WEIGHING_PAGE.create({section:ctx.containers.get(page),state:ctx.state.pages[page],data:ctx.data.pages[page]});ctx.weighing.activate();}else ctx.weighing?.deactivate();
   ctx.state.activePage=page;ctx.nav.setActive(page);ctx.nav.restore();if(previous!==page)ctx.content.scrollTop=ctx.state.pages[page]?.scrollTop||0;
  }
 };
 window.SEVAGO_BAG_WEIGHING_INSPECT=()=>{const host=document.querySelector('.me-workspace');return host?mounted.get(host)?.weighing?.snapshot():null;};
 window.SEVAGO_BAG_INSPECT=()=>{const host=document.querySelector('.me-workspace');return host?mounted.get(host)?.bags?.snapshot():null;};
 window.SEVAGO_MODULE_DEFINITIONS=[...(window.SEVAGO_MODULE_DEFINITIONS||[]),definition];
})();
