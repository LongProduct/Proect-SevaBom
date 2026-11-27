/* Global Application Shell. Business records remain private to each module. */
(()=>{
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=name=>SHELL_ASSETS[name];
const groups=['HRM','Workflow Engine','Platform & Info','Vận hành sản xuất','Supply Chain','Finance & Accounting','Data Layer & System'];
const registry=new Map(),instances=new Map();
const original={workspace:$('.workspace'),logo:$('.app-logo').innerHTML,title:$('.app-header>strong').textContent,notifications:$('#notifications').onclick,user:$('#user').onclick};
let active='recruitment',launcher,launcherList,launcherSearch,help;
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
function register(def){
 if(!/^[a-z][a-z0-9-]*$/.test(def.id)||registry.has(def.id))throw Error('Module ID không hợp lệ hoặc đã tồn tại.');
 const module=Object.freeze({color:'#07554B',route:`#/apps/${def.id}/overview`,pages:[{id:'overview',name:'Tổng quan'}],sidebar:[{id:'overview',label:'Tổng quan'}],...def});
 registry.set(module.id,module);instances.set(module.id,{state:{},data:Object.create(null),host:null,scroll:[],lastRoute:module.route});
 return module;
}
// Launcher catalog is navigation metadata, never sample business data.
const catalog=[
 ['recruitment','Tuyển Dụng','Tuyển dụng & nhân sự','HRM','d74b8'],
 ['people','Sevago People','Hồ sơ nhân sự','HRM','de13a'],
 ['attendance','Sevago Attendance','Chấm công','HRM','55b80'],
 ['payroll','Sevago Payroll','Tiền lương','HRM','f5dae'],
 ['project','Sevago Project','Dự án','Workflow Engine','55b80'],
 ['request','Sevago Request','Đề xuất','Workflow Engine','2874a'],
 ['workflow','Sevago Workflow','Quy trình','Workflow Engine','d74b8'],
 ['process','Sevago Process','Tiến trình','Workflow Engine','d74b8'],
 ['message','Sevago Message','Chat nhóm','Platform & Info','7af7c'],
 ['training','Sevago Training','Đào tạo','Platform & Info','f5dae'],
 ['form','Sevago Form','Biểu mẫu','Platform & Info','addbc'],
 ['inside','Sevago Inside','Truyền thông và CSNV','Platform & Info','de13a'],
 ['booking','Sevago Booking','Cuộc họp','Platform & Info','de13a'],
 ['manufacturing','Sevago Production','Quản lý sản xuất','Vận hành sản xuất','55b80'],
 ['planning','Sevago Planning','Kế hoạch sản xuất','Vận hành sản xuất','2874a'],
 ['quality','Sevago Quality','Kiểm soát chất lượng','Vận hành sản xuất','addbc'],
 ['bom','Sevago BOM','Định mức nguyên vật liệu','Vận hành sản xuất','de13a'],
 ['purchase','Sevago Purchase','Mua hàng','Supply Chain','de13a'],
 ['warehouse','Sevago Inventory','Quản lý kho','Supply Chain','f5dae'],
 ['sales','Sevago Sales','Đơn hàng bán','Supply Chain','2874a'],
 ['logistics','Sevago Logistics','Giao nhận','Supply Chain','55b80'],
 ['finance','Sevago Finance','Tài chính','Finance & Accounting','addbc'],
 ['accounting','Sevago Accounting','Kế toán','Finance & Accounting','de13a'],
 ['data','Sevago Data','Dữ liệu hệ thống','Data Layer & System','addbc'],
 ['system','Hệ thống','Cài đặt hệ thống','Data Layer & System','d8cdc']
];
catalog.forEach(([id,name,description,group,logo])=>register({id,name,description,group,icon:asset(logo),implemented:id==='recruitment',color:group==='Platform & Info'?'#ff8045':'#2970ff'}));
(window.SEVAGO_MODULE_DEFINITIONS||[]).forEach(register);
function shellDialog(title,body){
 if(!help){help=document.createElement('dialog');help.className='sevago-shell-dialog';document.body.append(help);help.addEventListener('click',e=>{if(e.target===help)help.close();});}
 help.innerHTML=`<h2>${escape(title)}</h2><p>${escape(body)}</p><button type="button">Đóng</button>`;$('button',help).onclick=()=>help.close();help.showModal();
}
function renderLauncher(){
 const query=fold(launcherSearch.value.trim());let count=0;
 launcherList.innerHTML=groups.map(group=>{const matches=[...registry.values()].filter(m=>m.group===group&&fold(m.name+' '+m.description).includes(query));count+=matches.length;return matches.length?`<section class="sl-group"><h3>${escape(group)}</h3><div class="sl-app-grid">${matches.map(m=>`<button class="sl-app" data-module="${m.id}" ${m.id===active?'aria-current="page"':''} title="${escape(m.name+' · '+(m.implemented?'Đang triển khai':'Chưa triển khai'))}">${m.iconSize===44&&!m.launcherIcon?`<span class="sl-icon-slot"><img src="${m.icon}" alt="" width="44" height="44"></span>`:`<img src="${m.launcherIcon||m.icon}" alt="" width="60" height="60">`}<span class="sl-caption"><strong>${escape(m.name)}</strong><span>${escape(m.description)}</span>${!m.implemented?'<small>Chưa triển khai</small>':''}</span></button>`).join('')}</div></section>`:'';}).join('')||'<p class="sl-empty" role="status">Không tìm thấy ứng dụng phù hợp.</p>';
 $('.sl-total',launcher).textContent=`${registry.size} ứng dụng trong không gian làm việc`;
 launcherList.setAttribute('aria-label',`${count} ứng dụng phù hợp`);
}
let launcherClosing=null;
function closeLauncher(){
 if(launcherClosing)return launcherClosing;
 if(!launcher?.open)return Promise.resolve();
 launcher.classList.remove('sl-opening');launcher.classList.add('sl-closing');$('#apps').setAttribute('aria-expanded','false');
 launcherClosing=new Promise(resolve=>{
  let timer;const finish=()=>{clearTimeout(timer);launcher.removeEventListener('animationend',ended);launcher.close();launcher.classList.remove('sl-closing');document.body.classList.remove('sevago-drawer-open');launcherClosing=null;resolve();};
  const ended=e=>{if(e.target===launcher&&e.animationName==='sevago-drawer-out')finish();};
  launcher.addEventListener('animationend',ended);timer=setTimeout(finish,300);
 });
 return launcherClosing;
}
function openLauncher(){
 if(launcher.open){closeLauncher();return;}
 window.SEVAGO_MODULE?.dismissTransient();launcherSearch.value='';renderLauncher();launcherList.scrollTop=0;launcher.classList.remove('sl-closing');launcher.classList.add('sl-opening');document.body.classList.add('sevago-drawer-open');launcher.showModal();$('#apps').setAttribute('aria-expanded','true');launcher.focus({preventScroll:true});
}
function mountPending(module,instance){
 const host=document.createElement('section');host.className='sevago-module-host';host.dataset.moduleId=module.id;host.setAttribute('aria-label',module.name);
 host.innerHTML=`<nav class="sm-sidebar" aria-label="Điều hướng ${escape(module.name)}"><div class="sm-sidebar-title">${escape(module.name)}</div>${module.sidebar.map(p=>`<button class="sm-nav" data-module-page="${p.id}" aria-current="page">${escape(p.label)}</button>`).join('')}</nav><section class="sm-content"><h1>${escape(module.description)}</h1><div class="sm-empty"><img src="${module.icon}" width="60" height="60" alt=""><h2>Chưa triển khai</h2><p>Ứng dụng ${escape(module.name)} đã có trong không gian làm việc. Chức năng nghiệp vụ sẽ được bổ sung trong giai đoạn tiếp theo.</p><button class="sm-back" data-return-current>Quay lại ${escape(registry.get('recruitment').name)}</button></div></section>`;
 host.addEventListener('click',e=>{if(e.target.closest('[data-return-current]'))navigate('recruitment');const page=e.target.closest('[data-module-page]');if(page)navigate(module.id,page.dataset.modulePage);});
 document.body.append(host);return host;
}
function moduleFromRoute(){
 if(location.hash.startsWith('#record='))return {id:'recruitment',page:'detail'};
 const match=location.hash.match(/^#\/apps\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/);
 return match?{id:match[1],page:match[2]||'overview'}:{id:'recruitment',page:'overview'};
}
function activate(id,page='overview'){
 const module=registry.get(id),previous=instances.get(active),instance=instances.get(id);if(!module)return;
 if(module.defaultPage&&!module.pages.some(p=>p.id===page)){page=module.defaultPage;history.replaceState({module:id},'',`#/apps/${id}/${page}`);}
 closeLauncher();if(help?.open)help.close();
 if(active!==id){
  if(active==='recruitment'){window.SEVAGO_MODULE.suspend();previous.scroll=[...original.workspace.querySelectorAll('*')].filter(el=>el.scrollTop||el.scrollLeft).map(el=>[el,el.scrollTop,el.scrollLeft]);original.workspace.hidden=true;}
  else if(previous.host){previous.state.scroll=previous.host.querySelector('.sm-content')?.scrollTop||0;previous.host.hidden=true;}
 }
 active=id;document.body.dataset.activeModule=id;instance.state.page=page;
 if(id==='recruitment'){
  original.workspace.hidden=false;SEVAGO_SHARED_HEADER.configure({name:original.title,logoHTML:original.logo,legacy:true});
  window.SEVAGO_MODULE.resume();requestAnimationFrame(()=>{if(active===id)previous!==instance&&instance.scroll.forEach(([el,top,left])=>{el.scrollTop=top;el.scrollLeft=left;});});
 }else{
  if(!instance.host)instance.host=module.mount?module.mount({state:instance.state,data:instance.data,navigate}):mountPending(module,instance);
  if(!instance.host.isConnected)document.body.append(instance.host);
  instance.host.hidden=false;const content=instance.host.querySelector('.sm-content');if(content)content.scrollTop=instance.state.scroll||0;
  SEVAGO_SHARED_HEADER.configure({name:module.name,icon:module.icon,iconSize:module.iconSize||60});
  module.activate?.(instance.host,{page,state:instance.state,data:instance.data});
 }
 $('#apps').setAttribute('aria-label','Ứng dụng SEVAGO');
 document.dispatchEvent(new CustomEvent('sevago:module-change',{detail:{id,page}}));
}
function navigate(id,page){
 if(launcher.open)return closeLauncher().then(()=>navigate(id,page));
 const module=registry.get(id);if(!module)return;
 instances.get(active).lastRoute=location.hash||registry.get(active).route;
 const next=page?`#/apps/${id}/${page}`:instances.get(id).lastRoute;
 if(location.hash!==next)history.pushState({module:id},'',next);
 activate(id,page||moduleFromRoute().page);
}
function route(){const {id,page}=moduleFromRoute();if(!registry.has(id)){history.replaceState(null,'',registry.get('recruitment').route);activate('recruitment');return;}activate(id,page);instances.get(id).lastRoute=location.hash;}
launcher=document.createElement('dialog');launcher.className='sevago-launcher';launcher.id='sevago-app-launcher';launcher.tabIndex=-1;launcher.setAttribute('aria-labelledby','sevago-launcher-title');
launcher.innerHTML=`<header class="sl-head"><div class="sl-heading"><div><h2 id="sevago-launcher-title">Ứng dụng SEVAGO</h2><p class="sl-subtitle">Truy cập nhanh các ứng dụng trong hệ sinh thái.</p></div><button class="sl-close" aria-label="Đóng ứng dụng SEVAGO"><img src="${asset('4e85c')}" width="20" height="20" alt=""></button></div><label class="sl-search"><img src="${asset('169a6')}" width="20" height="20" alt=""><input type="search" placeholder="Tìm ứng dụng, ví dụ: Cuộc họp, Tuyển dụng…" aria-label="Tìm ứng dụng" autocomplete="off"></label></header><div class="sl-list"></div><footer class="sl-footer"><span class="sl-total"></span><button class="sl-help">Hướng dẫn</button></footer>`;
document.body.append(launcher);launcherList=$('.sl-list',launcher);launcherSearch=$('input',launcher);
$('.sl-close',launcher).onclick=closeLauncher;launcherSearch.oninput=renderLauncher;
launcherList.onclick=e=>{const button=e.target.closest('[data-module]');if(button)navigate(button.dataset.module);};
$('.sl-help',launcher).onclick=()=>shellDialog('Hướng dẫn chuyển ứng dụng','Tìm theo tên ứng dụng hoặc tên nghiệp vụ, sau đó chọn ứng dụng để mở. Các ứng dụng Chưa triển khai chỉ có trang thông tin. Khi quay lại Tuyển Dụng, bảng giữ nguyên bộ lọc, vùng chọn, phân trang và vị trí cuộn. Bạn có thể dùng Back / Forward của trình duyệt.');
launcher.addEventListener('click',e=>{if(e.target===launcher){const r=launcher.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeLauncher();}});
launcher.addEventListener('close',()=>{$('#apps').setAttribute('aria-expanded','false');document.body.classList.remove('sevago-drawer-open');});
launcher.addEventListener('cancel',e=>{e.preventDefault();closeLauncher();});
for(const type of ['wheel','touchmove'])document.addEventListener(type,e=>{if(launcher.open&&!launcher.contains(e.target)&&!help?.contains(e.target))e.preventDefault();},{capture:true,passive:false});
// Capture Escape before the legacy grid's document shortcuts can clear its state.
document.addEventListener('keydown',e=>{if((launcher.open||help?.open)&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(help?.open)help.close();else closeLauncher();}},true);
$('#apps').onclick=openLauncher;$('#apps').setAttribute('aria-haspopup','dialog');$('#apps').setAttribute('aria-expanded','false');$('#apps').setAttribute('aria-controls',launcher.id);
$('#notifications').onclick=e=>{if(active==='recruitment')original.notifications(e);else shellDialog('Thông báo','Không có thông báo mới cho ứng dụng này.');};
$('#user').onclick=e=>{if(active==='recruitment')original.user(e);else shellDialog('Sevago Jewelry','Không gian làm việc SEVAGO. Các quyền trong prototype chỉ được mô phỏng tại frontend.');};
window.addEventListener('popstate',route);window.addEventListener('hashchange',route);
window.SEVAGO_SHELL=Object.freeze({registerModule(def){const module=register(def);if(launcher.open)renderLauncher();return module;},navigate,snapshot:()=>({active,modules:[...registry.values()].map(({id,name,route,implemented})=>({id,name,route,implemented})),route:location.hash})});
if(!location.hash)history.replaceState({module:'recruitment'},'',registry.get('recruitment').route);route();
})();
