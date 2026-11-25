/* Shared sidebar uses the existing .nav-item / .collapse component and tokens. */
window.SEVAGO_SHARED_SIDEBAR=Object.freeze({create({moduleId,label,items,state,onNavigate}){
 const template=document.querySelector('.workspace aside'),sidebar=document.createElement('aside');sidebar.className='sevago-shared-sidebar';sidebar.setAttribute('aria-label',label);
 const list=document.createElement('nav');list.className='ss-list';list.setAttribute('aria-label',label);sidebar.append(list);
 const icon=template.querySelector('.nav-item>img:first-child'),chevron=template.querySelector('.nav-chevron'),collapseIcon=template.querySelector('#collapse .nav-chevron');
 state.expanded??={};state.collapsed??=false;
 function button(item,depth=0){
  const b=document.createElement('button');b.type='button';b.className='nav-item'+(depth?' ss-child':'');b.dataset.sidebarPage=item.id;b.title=item.label;b.append(icon.cloneNode(true));
  const text=document.createElement('span');text.textContent=item.label;b.append(text);
  if(item.children||item.expandable){b.dataset.sidebarGroup=item.id;b.setAttribute('aria-controls',`${moduleId}-${item.id}-children`);b.setAttribute('aria-expanded',String(Boolean(state.expanded[item.id])));b.append(chevron.cloneNode(true));}
  b.onclick=()=>{if(state.collapsed){state.collapsed=false;sidebar.closest('.sevago-module-host').classList.remove('collapsed');}if(item.children||item.expandable){state.expanded[item.id]=!state.expanded[item.id];render(state.active,false);}onNavigate(item.id);};return b;
 }
 function render(active,expandActive=true){
  state.active=active;const saved=list.scrollTop;list.replaceChildren();
  for(const item of items){const childActive=item.children?.some(c=>c.id===active);if(childActive&&expandActive)state.expanded[item.id]=true;
   const b=button(item);if(item.id===active||childActive)b.classList.add('selected');if(item.id===active)b.setAttribute('aria-current','page');list.append(b);
   if(item.children||item.expandable){const panel=document.createElement('div');panel.id=`${moduleId}-${item.id}-children`;panel.className='ss-children';panel.hidden=!state.expanded[item.id];
    for(const child of item.children||[]){const c=button(child,1);if(child.id===active){c.classList.add('selected');c.setAttribute('aria-current','page');}panel.append(c);}
    if(!item.children?.length){const empty=document.createElement('p');empty.className='ss-group-empty';empty.textContent='Chưa có báo cáo được cấu hình.';panel.append(empty);}list.append(panel);
   }
  }
  list.scrollTop=saved;
 }
 const footer=document.createElement('button');footer.type='button';footer.className='nav-item collapse';footer.dataset.sidebarCollapse='';footer.append(icon.cloneNode(true));const text=document.createElement('span');text.textContent='Ẩn điều hướng';footer.append(text,collapseIcon.cloneNode(true));
 footer.onclick=()=>{state.collapsed=!state.collapsed;sidebar.closest('.sevago-module-host').classList.toggle('collapsed',state.collapsed);updateToggle();};
 function updateToggle(){footer.title=state.collapsed?'Mở điều hướng':'Ẩn điều hướng';footer.setAttribute('aria-label',footer.title);footer.setAttribute('aria-expanded',String(!state.collapsed));}
 sidebar.append(footer);render(state.active);updateToggle();return {element:sidebar,setActive(active){render(active);updateToggle();},restore(){sidebar.closest('.sevago-module-host').classList.toggle('collapsed',state.collapsed);updateToggle();}};
}});
