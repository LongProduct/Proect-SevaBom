/* Isolated DOM host for the same grid factory. No renderer or table algorithms here. */
window.SEVAGO_GRID_HOST=Object.freeze({async create(container,options){
 const iframe=document.createElement('iframe');iframe.className='shared-grid-instance';iframe.allow='clipboard-read; clipboard-write';iframe.title=options.title||'Bảng dữ liệu';iframe.style.cssText='display:block;border:0;width:100%;height:100%;min-height:0;flex:1;background:white';
 const ready=new Promise(resolve=>iframe.addEventListener('load',resolve,{once:true}));
 iframe.srcdoc=SEVAGO_GRID_TEMPLATE;container.append(iframe);await ready;
 const doc=iframe.contentDocument;
 const style=doc.createElement('style');style.textContent=`html,body{height:100%;overflow:hidden}body{font:14px/20px Inter,Arial,sans-serif}body>.app-header,.workspace>aside,main>h1,main>.view-row,.panel>.statuses{display:none!important}.workspace{height:100%;min-height:0}main{height:100%;padding:0;min-height:0}.panel{height:100%;min-height:0}.content{padding:12px}.toolbar .quick-filter{display:none!important}#quick-create{display:none!important}.toolbar .toolbar-right{margin-left:auto}.toolbar .primary{font-size:12px;width:auto}.toolbar .tool-label{display:none}.toolbar .search{max-width:none}.floating-selection{max-width:calc(100% - 24px)}${options.hostCSS||''}`;doc.head.append(style);
 const api=SEVAGO_GRID.create({...options,root:doc});
 if(options.primaryLabel)doc.querySelector('#create').innerHTML=options.primaryLabel;
 if(options.actions?.selection===false)doc.querySelector('#planned-order').hidden=true;
 if(options.searchPlaceholder)doc.querySelector('#search').placeholder=options.searchPlaceholder;
 // Pointer release can occur outside the iframe's document; finish the same
 // engine gesture without modifying selection or dispatching data operations.
 const bridge=new AbortController();
 const release=()=>iframe.contentWindow?.dispatchEvent(new iframe.contentWindow.Event('pointerup'));
 window.addEventListener('pointerup',release,{capture:true,signal:bridge.signal});
 window.addEventListener('blur',release,{signal:bridge.signal});
 document.addEventListener('pointerdown',e=>{if(e.target!==iframe)api.dismissTransient();},{capture:true,signal:bridge.signal});
 return Object.freeze({iframe,api,destroy(){bridge.abort();api.suspend();iframe.remove();}});
}});
