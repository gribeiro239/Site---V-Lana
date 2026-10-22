import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {DatabaseSync} from 'node:sqlite';import {CATALOG,validateCart} from '../server/commerce.mjs';
function store(){const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){}},addEventListener(){},close(){},showModal(){},scrollIntoView(){}});return elements.get(id);};const events={};const context=vm.createContext({document:{getElementById:get,querySelectorAll:()=>[],querySelector:()=>get('glow'),addEventListener:(name,fn)=>{events[name]=fn;}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true})});vm.runInContext(fs.readFileSync(new URL('../public/collection.js',import.meta.url),'utf8'),context);vm.runInContext(fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8'),context);vm.runInContext("inventory={state:'demo',variants:[]};renderCollection();renderBuilder();",context);return {context,get,events,run:s=>vm.runInContext(s,context)};}
test('all twelve storefront products have authoritative matching prices and correct image cells',()=>{const s=store();const products=JSON.parse(s.run('JSON.stringify(products)'));assert.equal(products.length,12);assert.equal(CATALOG.length,12);for(const p of products){const q=validateCart([{id:p.id,size:'M',qty:1}]);assert.equal(q.subtotal,p.price*100,p.name);assert.equal(q.lines[0].name,p.name);assert.equal(s.run(`position(${p.id})`),CATALOG[p.id].position);}assert.equal(CATALOG[6].position,'0% 0%');assert.equal(CATALOG[11].position,'100% 100%');});
test('campaign preset composes the photographed garments and adds every selected size to cart',()=>{const s=store();const button={dataset:{preset:'2',scroll:''}};s.events.click({target:{closest:()=>button}});assert.equal(s.get('look-name').textContent,'Energia urbana');assert.match(s.get('look-summary').textContent,/Top Vértice \+ Short Cadência \+ Jaqueta Nuvem/);assert.match(s.get('look-grid').innerHTML,/catalog-novidades.jpg/);s.run("lookSizes=['P','G','GG']");s.get('add-look').onclick();const cart=JSON.parse(s.run('JSON.stringify(cart)'));assert.deepEqual(cart,[{id:8,size:'P',qty:1},{id:9,size:'G',qty:1},{id:10,size:'GG',qty:1}]);assert.equal(validateCart(cart).subtotal,62700);s.events.click({target:{closest:()=>({dataset:{preset:'1'}})}});assert.equal(s.get('look-name').textContent,'Ritmo profundo');assert.equal(s.get('look-grid').style.gridTemplateColumns,'repeat(2,1fr)');});
test('catalog expansion preserves existing orders and reserved stock with foreign keys enabled',()=>{const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');db.exec(fs.readFileSync(new URL('../drizzle/0000_commerce.sql',import.meta.url),'utf8'));db.exec("INSERT INTO variants VALUES(0,'M',3)");db.exec("INSERT INTO orders(id,token_hash,request_key,customer_name,email,phone,fulfillment,subtotal_cents,created_at,updated_at) VALUES('existing','hash','key','Exemplo','example@example.com','19999990000','pickup',12900,'2026-10-15','2026-10-15')");db.exec("INSERT INTO order_items VALUES('existing',0,'M',1,12900)");db.exec(fs.readFileSync(new URL('../drizzle/0001_expand_catalog.sql',import.meta.url),'utf8'));assert.equal(db.prepare("SELECT stock FROM variants WHERE product_id=0").get().stock,2);assert.equal(db.prepare('SELECT count(*) AS n FROM order_items').get().n,1);assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);db.exec("INSERT INTO variants VALUES(11,'M',4)");db.exec("UPDATE orders SET status='cancelled' WHERE id='existing'");assert.equal(db.prepare('SELECT stock FROM variants WHERE product_id=0').get().stock,3);db.close();});

test('collection combines search, category, color, price and size, then sorts without changing catalog',()=>{
 const s=store();
 s.run("filters={search:'vertice',category:'Top',color:'Azul-cobalto',price:'under150',size:'M',sort:'price-desc'};renderCollection()");
 assert.match(s.get('collection-count').textContent,/1 peça encontrada/);
 assert.match(s.get('products').innerHTML,/Top Vértice/);
 assert.doesNotMatch(s.get('products').innerHTML,/Top Impulso/);
 s.run("filters.color='Vinho';renderCollection()");
 assert.match(s.get('collection-count').textContent,/0 peças/);
 assert.match(s.get('products').innerHTML,/Limpar filtros/);
 s.run("resetFilters();filters.sort='price-asc';renderCollection()");
 const prices=JSON.parse(s.run('JSON.stringify(rules.filter(products,filters,inventory).map(p=>p.price))'));
 assert.deepEqual(prices,[...prices].sort((a,b)=>a-b));
 assert.equal(s.run('products[0].id'),0);
 assert.match(s.get('collection-count').textContent,/12 peças/);
});

test('stock filters hide unavailable sizes and a partial look never adds any garment',()=>{
 const s=store();
 s.run("inventory={state:'ready',variants:[{id:0,size:'P',quantity:2},{id:1,size:'M',quantity:1},{id:3,size:'M',quantity:1}]};filters.size='P';renderCollection();renderBuilder()");
 assert.match(s.get('collection-count').textContent,/1 peça encontrada/);
 assert.match(s.get('products').innerHTML,/Top Impulso/);
 assert.equal(s.get('add-look').disabled,true);
 s.get('add-look').onclick();
 assert.equal(s.run('cart.length'),0);
 s.run("lookSizes=['P','M','M'];renderBuilder()");
 assert.equal(s.get('add-look').disabled,false);
 s.get('add-look').onclick();
 assert.equal(s.run('cart.length'),3);
 s.get('add-look').onclick();
 assert.equal(s.run('cart.reduce((sum,i)=>sum+i.qty,0)'),3);
 assert.equal(s.run("add(0,'P')"),true);
 assert.equal(s.run("add(0,'P')"),false);
 s.run('renderCart()');
 assert.match(s.get('cart-items').innerHTML,/data-delta="1" disabled/);
});

test('a stock decrease keeps cart contents visible and blocks checkout until quantities are corrected',()=>{
 const s=store();
 s.run("add(0,'M');add(0,'M');inventory={state:'ready',variants:[{id:0,size:'M',quantity:1}]};renderCart()");
 assert.equal(s.run('cart[0].qty'),2);
 assert.match(s.get('cart-items').innerHTML,/Disponível agora: 1 un/);
 assert.doesNotMatch(s.get('cart-bottom').innerHTML,/href="\/checkout"/);
 s.events.click({target:{closest:()=>({dataset:{qty:'0',delta:'-1'}})}});
 assert.equal(s.run('cart[0].qty'),1);
 assert.match(s.get('cart-bottom').innerHTML,/href="\/checkout"/);
});

test('inventory refresh distinguishes demo, real stock, malformed data and network failures',async()=>{
 const s=store();
 s.context.fetch=async()=>({ok:true,json:async()=>({mode:'demo',active:false,inventory:{state:'demo',variants:[]}})});
 await s.run('refreshInventory()');
 assert.equal(s.run('inventory.state'),'demo');
 assert.match(s.get('inventory-notice').innerHTML,/não representam estoque real/);
 s.context.fetch=async()=>({ok:true,json:async()=>({mode:'test',active:true,inventory:{state:'ready',variants:[{id:0,size:'M',quantity:1}]}})});
 await s.run('refreshInventory()');
 assert.equal(s.run('inventory.state'),'ready');
 assert.equal(s.run("quantity(0,'M')"),1);
 assert.equal(s.run("quantity(0,'P')"),0);
 s.context.fetch=async()=>({ok:true,json:async()=>({mode:'test',active:true,inventory:{state:'ready',variants:[{id:0,size:'M',quantity:-1}]}})});
 await s.run('refreshInventory()');
 assert.equal(s.run('inventory.state'),'unavailable');
 assert.equal(s.get('add-look').disabled,true);
 s.context.fetch=async()=>{throw new Error('offline');};
 await s.run('refreshInventory()');
 assert.match(s.get('inventory-notice').innerHTML,/Tentar novamente/);
 assert.equal(s.run("add(0,'M')"),false);
});

test('older inventory responses cannot replace the latest stock snapshot',async()=>{
 const s=store();let finish;
 s.context.fetch=()=>new Promise(resolve=>{finish=resolve;});
 const older=s.run('refreshInventory()');
 s.context.fetch=async()=>({ok:true,json:async()=>({mode:'test',active:true,inventory:{state:'ready',variants:[]}})});
 await s.run('refreshInventory()');
 finish({ok:true,json:async()=>({mode:'demo',inventory:{state:'demo',variants:[]}})});
 await older;
 assert.equal(s.run('inventory.state'),'ready');
 assert.equal(s.run("quantity(0,'M')"),0);
});

test('stock refresh preserves the selected product size instead of silently switching it',()=>{
 const s=store();
 s.run("detailId=0;inventory={state:'ready',variants:[{id:0,size:'P',quantity:1}]};renderProduct(0,'M')");
 assert.equal(s.get('product-size').value,'M');
 assert.equal(s.get('add-product').disabled,true);
 assert.match(s.get('product-detail').innerHTML,/value="M" selected disabled/);
});
