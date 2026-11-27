const { chromium } = require('/Users/longho04157/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1728,height:1117}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.SEVAGO_TEST_URL||'http://127.0.0.1:5173')+'');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'/tmp/sevago-advanced-desktop.png'});console.log('snapshot',await page.evaluate(()=>SEVAGO.snapshot()));
console.log('heights',await page.locator('.record-row').evaluateAll(xs=>[...new Set(xs.map(x=>x.getBoundingClientRect().height))]));
console.log('head',await page.locator('#head-row').evaluate(e=>e.getBoundingClientRect().height));
console.log('toolbar',await page.locator('.toolbar').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,children:[...el.children].map(c=>[c.id,Math.round(c.getBoundingClientRect().y),c.getBoundingClientRect().width])})));
console.log('overflow',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
console.log('errors',errors);
await page.locator('#page-size').selectOption('all');console.log('virtual',await page.evaluate(()=>SEVAGO.snapshot().rendered));
await page.locator('#table-scroll').evaluate(e=>e.scrollTop=20000);await page.waitForTimeout(100);console.log('scrolled',await page.locator('.record-row').first().getAttribute('data-id'));await page.screenshot({path:'/tmp/sevago-advanced-scroll.png'});
await page.locator('#search').fill('SO-01199');await page.waitForTimeout(100);console.log('search',await page.locator('#search-count').innerText(),await page.locator('.search-current').getAttribute('data-row'));
await page.locator('#search').press('Escape');await page.locator('#page-size').selectOption('20');
await page.locator('[data-select-row]').first().check();console.log('selected',await page.locator('#selection-toolbar').isVisible());await page.locator('#clear-selection').click();
await page.locator('#view-menu').click();await page.getByRole('button',{name:'Thư viện Cell · Chỉ xem',exact:false}).click();console.log('gallery',await page.evaluate(()=>SEVAGO.snapshot()));await page.screenshot({path:'/tmp/sevago-gallery.png'});
await page.setViewportSize({width:1280,height:800});await page.screenshot({path:'/tmp/sevago-advanced-1280.png'});console.log('1280 overflow',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.setViewportSize({width:768,height:900});await page.screenshot({path:'/tmp/sevago-advanced-tablet.png'});console.log('tablet toolbar',await page.locator('.toolbar').evaluate(e=>[e.clientWidth,e.scrollWidth]));
console.log('errors final',errors);await browser.close();})();
