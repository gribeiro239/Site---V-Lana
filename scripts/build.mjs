import fs from 'node:fs';
import path from 'node:path';
const project=process.cwd();
const hosting=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8'));
if(hosting.static)throw new Error('Worker requires a manifest without static.');
const output=path.resolve(project,'dist');
if(path.dirname(output)!==project||path.basename(output)!=='dist')throw new Error('Invalid output directory.');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const assets={};for(const name of fs.readdirSync('public')){if(!fs.statSync(path.join('public',name)).isFile())continue;assets['/'+name]={type:mime[path.extname(name)]||'application/octet-stream',body:fs.readFileSync(path.join('public',name)).toString('base64')};}
const commerce=fs.readFileSync('server/commerce.mjs','utf8').replace(/^export /gm,'');
const serve=`\nconst ASSETS=${JSON.stringify(assets)};\nexport default {async fetch(request,env){const u=new URL(request.url);if(u.pathname.startsWith('/api/'))return handleApi(request,env);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const route=({'/':'/index.html','/checkout':'/checkout.html','/pedido':'/order.html','/gestao':'/admin.html'})[u.pathname]||u.pathname;const a=ASSETS[route];if(!a)return new Response('Página não encontrada',{status:404});const bytes=Uint8Array.from(atob(a.body),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':a.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':route.endsWith('.html')?'no-store':'public, max-age=300','Content-Security-Policy':"frame-ancestors 'self' https://*.chatgpt.com https://*.openai.com"}});}};`;
fs.writeFileSync('dist/server/index.js',commerce+serve);fs.writeFileSync('dist/.openai/hosting.json',JSON.stringify(hosting,null,2));console.log('Built V’Lana Worker with '+Object.keys(assets).length+' assets.');
