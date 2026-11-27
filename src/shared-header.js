/* SEVAGO Master Layout v1.0: configure the existing global header, no duplicate DOM. */
window.SEVAGO_SHARED_HEADER=(()=>{
 const slots=new Map(),header=()=>document.querySelector('.app-header');
 return Object.freeze({
  configure({name,icon,iconSize=60,logoHTML,legacy=false}){const root=header(),logo=root.querySelector('.app-logo');root.querySelector(':scope>strong').textContent=name;logo.classList.toggle('sevago-module-logo',!legacy&&iconSize!==44);if(logoHTML!==undefined)logo.innerHTML=logoHTML;else {const image=document.createElement('img');image.src=icon;image.width=iconSize;image.height=iconSize;image.alt='';logo.replaceChildren(image);}},
  setSlot(owner,element){const previous=slots.get(owner);if(previous&&previous!==element)previous.remove();if(!element){slots.delete(owner);return;}element.dataset.sevagoHeaderSlot=owner;header().querySelector(':scope>strong').after(element);slots.set(owner,element);},
  clearSlot(owner){slots.get(owner)?.remove();slots.delete(owner);},
  getSlot:owner=>slots.get(owner)||null
 });
})();
