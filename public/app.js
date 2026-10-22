'use strict';
const products=[
{id:0,name:'Top Impulso',type:'Top',color:'Oliva',price:129,desc:'Top de alças nadador, com decote arredondado e elástico na base. Uma silhueta limpa para combinar com seus essenciais.',material:'Poliamida e elastano',tag:'ESSENCIAL'},
{id:1,name:'Legging Ritmo',type:'Legging',color:'Oliva',price:219,desc:'Legging de cintura alta e comprimento até o tornozelo. O cós largo e a modelagem ajustada acompanham suas combinações.',material:'Poliamida e elastano',tag:'CINTURA ALTA'},
{id:2,name:'Short Fluxo',type:'Short',color:'Preto',price:159,desc:'Short biker de cintura alta e comprimento intermediário. Uma alternativa versátil para dias de treino e movimento.',material:'Poliamida e elastano',tag:'BIKER'},
{id:3,name:'Jaqueta Aurora',type:'Jaqueta',color:'Off-white',price:289,desc:'Jaqueta cropped com zíper frontal. Uma camada leve para completar o look entre um compromisso e outro.',material:'Poliéster e elastano',tag:'TERCEIRA PEÇA'},
{id:4,name:'Regata Pulso',type:'Regata',color:'Preto',price:119,desc:'Regata sem mangas com modelagem ajustada e gola redonda. Um essencial simples, fácil de usar e combinar.',material:'Poliamida e elastano',tag:'ESSENCIAL'},
{id:5,name:'Casaco Equilíbrio',type:'Casaco',color:'Oliva',price:269,desc:'Casaco leve de mangas longas e comprimento cropped. Uma camada extra para acompanhar o seu ritmo.',material:'Poliéster e elastano',tag:'CAMADA LEVE'},
{id:6,name:'Top Brisa',type:'Top',color:'Vinho',price:139,desc:'Top de alças nadador com faixa larga na base e acabamento limpo. O tom vinho forma um conjunto com a Legging Horizonte.',material:'Poliamida e elastano',tag:'NOVO ESSENCIAL'},
{id:7,name:'Legging Horizonte',type:'Legging',color:'Vinho',price:229,desc:'Legging de cintura alta e comprimento até o tornozelo. A silhueta alongada combina com o Top Brisa e camadas claras.',material:'Poliamida e elastano',tag:'NOVO ESSENCIAL'},
{id:8,name:'Top Vértice',type:'Top',color:'Azul-cobalto',price:149,desc:'Top de decote quadrado e alças largas. Uma peça de presença para usar com o Short Cadência ou bases escuras.',material:'Poliamida e elastano',tag:'COR EM MOVIMENTO'},
{id:9,name:'Short Cadência',type:'Short',color:'Azul-cobalto',price:179,desc:'Short biker de cintura alta e comprimento intermediário. O azul-cobalto cria uma combinação marcante com o Top Vértice.',material:'Poliamida e elastano',tag:'COR EM MOVIMENTO'},
{id:10,name:'Jaqueta Nuvem',type:'Jaqueta',color:'Grafite',price:299,desc:'Jaqueta bomber cropped com zíper frontal. Uma terceira peça para equilibrar conjuntos coloridos e acompanhar o caminho entre treino e cidade.',material:'Poliéster e elastano',tag:'TERCEIRA PEÇA'},
{id:11,name:'Blusa Aura',type:'Blusa',color:'Off-white',price:149,desc:'Blusa cropped de mangas longas e gola redonda. Uma camada clara para combinar com vinho, oliva ou preto.',material:'Poliamida e elastano',tag:'CAMADA LEVE'}
];
const rules = VlanaCollection;
const sizes = rules.sizes;
const money = n => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const $ = id => document.getElementById(id);
const position = id => `${(id % 3) * 50}% ${Math.floor((id % 6) / 3) * 100}%`;
const photo = (p, extra='') => `<div class="photo" role="img" aria-label="${p.name} ${p.color}" style="background-image:url('${p.id < 6 ? 'catalog.webp' : 'catalog-novidades.jpg'}');background-position:${position(p.id)}">${extra}</div>`;
let inventory = {state:'loading', variants:[]};
let filters = {search:'', category:'', color:'', size:'', price:'', sort:'featured'};
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem('vlana-cart') || '[]');
  if (Array.isArray(saved)) for (const item of saved) {
    if (!item || !Number.isInteger(item.id) || !products[item.id] || !sizes.includes(item.size) || !Number.isInteger(item.qty) || item.qty < 1) continue;
    const row = cart.find(row => row.id === item.id && row.size === item.size);
    if (row) row.qty = Math.min(10, row.qty + item.qty);
    else if (cart.length < 24) cart.push({id:item.id, size:item.size, qty:Math.min(10, item.qty)});
  }
} catch {}
let selected = [0,1,3], lookSizes = ['M','M','M'], toastTimer, detailId = null, inventoryRequest = 0;
const quantity = (id, size) => rules.quantity(inventory, id, size);
const availableSizes = id => sizes.filter(size => quantity(id, size) > 0);
const inCart = (id, size) => cart.find(row => row.id === id && row.size === size)?.qty || 0;
const canAdd = (id, size) => inCart(id, size) < quantity(id, size);

function availability(id) {
  if (inventory.state === 'demo') return 'Tamanhos P, M, G e GG · demonstração';
  if (inventory.state === 'loading') return 'Consultando disponibilidade…';
  if (inventory.state !== 'ready') return 'Disponibilidade não confirmada';
  const available = availableSizes(id);
  return available.length ? `Disponível: ${available.join(' · ')}` : 'Esgotado no momento';
}

function renderCollection() {
  const visible = rules.filter(products, filters, inventory);
  $('products').innerHTML = visible.length ? visible.map(p => {
    const soldOut = inventory.state === 'ready' && !availableSizes(p.id).length;
    return `<button class="product-card ${soldOut ? 'sold-out' : ''}" data-product="${p.id}" aria-label="Ver detalhes de ${p.name}${soldOut ? ', esgotado' : ''}">${photo(p, `<span class="tag">${p.tag}</span><span class="view">Ver peça</span>`)}<div class="product-meta"><h3>${p.name}</h3><span>${money(p.price)}</span></div><p>${p.type} · ${p.color}</p><p class="availability ${soldOut ? 'unavailable' : ''}">${availability(p.id)}</p></button>`;
  }).join('') : '<div class="collection-empty"><p>Nenhuma peça encontrada com esta combinação de filtros.</p><button class="guide-link" data-reset-filters>Limpar filtros e ver a coleção</button></div>';
  $('collection-count').textContent = `${visible.length} ${visible.length === 1 ? 'peça encontrada' : 'peças encontradas'} de ${products.length}`;
}

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
}
function save() {
  try { localStorage.setItem('vlana-cart', JSON.stringify(cart)); } catch {}
  $('count').textContent = cart.reduce((sum, row) => sum + row.qty, 0);
}
function add(id, size) {
  if (!canAdd(id, size)) return false;
  if (!cart.some(row => row.id === id && row.size === size) && cart.length >= 24) return false;
  if (cart.reduce((sum, row) => sum + row.qty, 0) >= 30) return false;
  const row = cart.find(row => row.id === id && row.size === size);
  if (row) row.qty++;
  else cart.push({id, size, qty:1});
  save();
  return true;
}
function sizeOptions(id, chosen) {
  return sizes.map(size => `<option value="${size}" ${chosen === size ? 'selected' : ''} ${quantity(id, size) === 0 ? 'disabled' : ''}>${size}${inventory.state === 'ready' && quantity(id, size) === 0 ? ' — indisponível' : ''}</option>`).join('');
}
function updateProductButton() {
  const button = $('add-product');
  const size = $('product-size').value;
  button.disabled = !canAdd(detailId, size);
  button.textContent = button.disabled ? (quantity(detailId, size) ? 'Limite desta peça na sacola' : 'Indisponível neste tamanho') : 'Adicionar à sacola';
}
function renderProduct(id, chosen) {
  const p = products[id];
  const size = sizes.includes(chosen) ? chosen : (availableSizes(id)[0] || sizes[0]);
  $('product-detail').innerHTML = `<div class="detail-layout">${photo(p)}<div class="detail-copy"><p class="eyebrow">V’LANA / ${p.type.toUpperCase()}</p><h2>${p.name}</h2><p class="price">${money(p.price)}</p><p>${p.desc}</p><p>Cor: ${p.color}<br>Composição: ${p.material}</p><label for="product-size">Tamanho<select id="product-size" ${availableSizes(id).length ? '' : 'disabled'}>${sizeOptions(id, size)}</select></label><p class="availability ${availableSizes(id).length ? '' : 'unavailable'}">${availability(id)}</p><button class="guide-link" type="button" data-size-guide>Como escolher meu tamanho</button><button class="primary" id="add-product">Adicionar à sacola</button><p class="small">Peça ilustrativa da coleção conceito. Valores e composição demonstrativos.</p></div></div>`;
  $('product-size').value = size;
  updateProductButton();
  $('product-size').onchange = updateProductButton;
  $('add-product').onclick = () => {
    if (!add(id, $('product-size').value)) { toast('Confira a disponibilidade e os limites da sacola.'); return; }
    $('product-dialog').close();
    renderLook();
    toast(`${p.name} adicionada à sacola`);
  };
}
function openProduct(id) {
  detailId = id;
  renderProduct(id, filters.size);
  $('product-dialog').showModal();
}
const presetLooks = [{name:'Oliva essencial',pieces:[0,1,3]}, {name:'Ritmo profundo',pieces:[6,7,-1]}, {name:'Energia urbana',pieces:[8,9,10]}];
function renderBuilder() {
  const groups = [[0,4,6,8],[1,2,7,9],[3,5,10,11]], labels = ['Comece pelo top','Escolha a base','Complete com uma camada'];
  $('builder-controls').innerHTML = groups.map((ids, step) => `<div class="step"><h3><span>0${step + 1}</span>${labels[step]}</h3><div class="choices">${ids.map(id => `<button class="choice" data-step="${step}" data-choice="${id}" aria-pressed="${selected[step] === id}" ${inventory.state === 'ready' && !availableSizes(id).length ? 'disabled' : ''}>${products[id].name}${inventory.state === 'ready' && !availableSizes(id).length ? ' · esgotado' : ''}</button>`).join('')}${step === 2 ? `<button class="choice" data-step="2" data-choice="-1" aria-pressed="${selected[2] === -1}">Sem camada</button>` : ''}</div>${selected[step] >= 0 ? `<label class="size-row" for="look-size-${step}">Tamanho<select id="look-size-${step}" data-size-step="${step}" ${availableSizes(selected[step]).length ? '' : 'disabled'}>${sizeOptions(selected[step], lookSizes[step])}</select></label><p class="availability">${availability(selected[step])}</p>` : ''}</div>`).join('');
  renderLook();
}
function renderLook() {
  const active = selected.filter(id => id >= 0).map(id => products[id]);
  const preset = presetLooks.find(p => p.pieces.every((id, step) => id === selected[step]));
  $('look-grid').style.gridTemplateColumns = `repeat(${active.length},1fr)`;
  $('look-grid').innerHTML = active.map(p => `<div>${photo(p)}<p>${p.name}<br>${p.color}</p></div>`).join('');
  const theme = selected[1] === 7 ? 'vinho' : selected[1] === 9 ? 'cobalto' : 'oliva';
  $('look-name').textContent = preset ? preset.name : theme === 'vinho' ? 'Seu ritmo, com profundidade.' : theme === 'cobalto' ? 'Sua energia, em movimento.' : selected[1] === 2 ? 'Seu ritmo, com leveza.' : 'Seu movimento, por inteiro.';
  $('look-summary').textContent = active.map(p => p.name).join(' + ');
  $('look-price').textContent = money(active.reduce((sum, p) => sum + p.price, 0));
  const glow = theme === 'vinho' ? '#aa486b45' : theme === 'cobalto' ? '#3968df45' : '#a7c37835';
  document.querySelector('.look-glow').style.background = `radial-gradient(ellipse at 50% 20%,${glow},transparent 65%)`;
  for (const button of document.querySelectorAll('[data-preset]')) button.setAttribute('aria-pressed', presetLooks[Number(button.dataset.preset)] === preset ? 'true' : 'false');
  const blocked = selected.some((id, step) => id >= 0 && !canAdd(id, lookSizes[step]));
  $('add-look').disabled = blocked;
  $('look-stock').textContent = inventory.state === 'demo' ? 'Explore os tamanhos na demonstração. O estoque real ainda não está disponível.' : inventory.state !== 'ready' ? 'Aguarde a confirmação da disponibilidade para adicionar peças.' : blocked ? 'Uma das peças ou tamanhos está indisponível ou já atingiu o limite na sacola. Ajuste a combinação.' : 'Os tamanhos selecionados estão disponíveis. O estoque será conferido novamente no pedido.';
}
function renderCart() {
  const total = cart.reduce((sum, item) => sum + products[item.id].price * item.qty, 0);
  const blocked = cart.some(item => item.qty > quantity(item.id, item.size)) || cart.reduce((sum, item) => sum + item.qty, 0) > 30;
  $('cart-items').innerHTML = cart.length ? cart.map((item, index) => {
    const p = products[item.id], limit = quantity(item.id, item.size), invalid = item.qty > limit;
    return `<div class="cart-item">${photo(p)}<div><h3>${p.name}</h3><p>${p.color} · Tamanho ${item.size}</p><p>${money(p.price * item.qty)}</p>${invalid ? `<p class="cart-warning">${inventory.state !== 'ready' ? 'Disponibilidade ainda não confirmada.' : limit ? `Disponível agora: ${limit} un. Reduza a quantidade.` : 'Este tamanho está indisponível. Remova ou escolha outra peça.'}</p>` : ''}<div class="quantity"><button data-qty="${index}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span aria-label="Quantidade">${item.qty}</span><button data-qty="${index}" data-delta="1" ${canAdd(item.id, item.size) ? '' : 'disabled'} aria-label="Aumentar quantidade de ${p.name}">+</button><button class="remove" data-remove="${index}" aria-label="Remover ${p.name}">Remover</button></div></div></div>`;
  }).join('') : '<div class="empty">Sua sacola ainda está vazia.<br>Encontre peças para o seu movimento.<br><br><button class="primary" id="continue-shopping">Explorar coleção</button></div>';
  $('cart-bottom').innerHTML = cart.length ? `<div class="total"><span>Subtotal</span><strong>${money(total)}</strong></div><p class="cart-note">${inventory.state === 'demo' ? 'Entrega local e retirada em Campinas. Checkout de demonstração, sem cobranças reais.' : 'Entrega local e retirada em Campinas. Total e disponibilidade confirmados antes do pagamento.'}</p>${blocked ? '<p class="cart-warning" role="status">Confira a disponibilidade e ajuste a sacola. O limite é de 30 peças por pedido.</p><button class="primary" disabled>Revise sua sacola</button>' : '<a class="primary" href="/checkout">Continuar para o checkout</a>'}<br><button class="text-button" id="continue-shopping">Continuar explorando</button>` : '';
}
function resetFilters() {
  filters = {search:'', category:'', color:'', size:'', price:'', sort:'featured'};
  for (const name of ['search','category','color','size','price']) $('filter-' + name).value = '';
  $('collection-sort').value = 'featured';
  renderCollection();
}
async function refreshInventory() {
  const request = ++inventoryRequest;
  try {
    const response = await fetch('/api/store', {cache:'no-store'});
    if (!response.ok) throw new Error('Consulta indisponível');
    const data = await response.json();
    if (request !== inventoryRequest) return;
    inventory = rules.inventoryFrom(data);
    const notice = document.querySelector('.store-notice');
    if (notice) notice.textContent = inventory.state === 'demo' ? 'Loja em demonstração · Conheça o checkout com entrega local e retirada em Campinas.' : data.mode === 'test' ? 'Ambiente de testes · Sem cobranças reais.' : 'Entrega local e retirada em Campinas · Pagamento após confirmação.';
  } catch {
    if (request !== inventoryRequest) return;
    inventory = {state:'unavailable', variants:[]};
  }
  $('inventory-notice').innerHTML = inventory.state === 'demo' ? 'Coleção demonstrativa: os tamanhos podem ser explorados, mas não representam estoque real.' : inventory.state === 'ready' ? 'Disponibilidade por tamanho consultada na loja. A confirmação final acontece ao registrar o pedido.' : 'Não foi possível confirmar a disponibilidade. <button class="guide-link" id="retry-inventory">Tentar novamente</button>';
  $('filter-size').disabled = !['demo','ready'].includes(inventory.state);
  renderCollection();
  renderBuilder();
  if ($('product-dialog').open && detailId !== null) renderProduct(detailId, $('product-size').value);
  if ($('cart-dialog').open) renderCart();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.product !== undefined) openProduct(Number(button.dataset.product));
  if (button.dataset.preset !== undefined) {
    selected = [...presetLooks[Number(button.dataset.preset)].pieces];
    renderBuilder();
    if (button.dataset.scroll !== undefined) $('atelie').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  if (button.dataset.close) $(button.dataset.close).close();
  if (button.dataset.sizeGuide !== undefined) $('size-guide').showModal();
  if (button.dataset.resetFilters !== undefined || button.id === 'reset-filters') resetFilters();
  if (button.id === 'retry-inventory') refreshInventory();
  if (button.dataset.choice !== undefined) {
    selected[Number(button.dataset.step)] = Number(button.dataset.choice);
    renderBuilder();
  }
  if (button.dataset.qty !== undefined) {
    const index = Number(button.dataset.qty);
    if (Number(button.dataset.delta) > 0) {
      if (!add(cart[index].id, cart[index].size)) toast('Confira a disponibilidade e os limites da sacola.');
    } else {
      cart[index].qty--;
      if (cart[index].qty <= 0) cart.splice(index, 1);
      save();
    }
    renderCart(); renderLook();
  }
  if (button.dataset.remove !== undefined) { cart.splice(Number(button.dataset.remove), 1); save(); renderCart(); renderLook(); }
  if (button.id === 'continue-shopping') { $('cart-dialog').close(); $('colecao').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
});
document.addEventListener('change', event => {
  if (event.target.dataset.sizeStep !== undefined) { lookSizes[Number(event.target.dataset.sizeStep)] = event.target.value; renderLook(); }
  const name = event.target.id?.replace('filter-', '');
  if (['category','color','size','price'].includes(name)) { filters[name] = event.target.value; renderCollection(); }
  if (event.target.id === 'collection-sort') { filters.sort = event.target.value; renderCollection(); }
});
document.addEventListener('input', event => {
  if (event.target.id === 'filter-search') { filters.search = event.target.value; renderCollection(); }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshInventory(); });
$('open-cart').onclick = () => { renderCart(); $('cart-dialog').showModal(); refreshInventory(); };
$('add-look').onclick = () => {
  const lines = selected.flatMap((id, step) => id < 0 ? [] : [{id, size:lookSizes[step]}]);
  const newLines = lines.filter(item => !inCart(item.id, item.size)).length;
  if (lines.some(item => !canAdd(item.id, item.size)) || cart.length + newLines > 24 || cart.reduce((sum, item) => sum + item.qty, 0) + lines.length > 30) {
    toast('Confira os tamanhos disponíveis e os limites da sacola. Nenhuma peça foi adicionada.'); return;
  }
  lines.forEach(item => add(item.id, item.size));
  renderLook();
  toast('Seu look foi adicionado à sacola');
};
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', event => {
  if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }
});
renderCollection(); renderBuilder(); save();
if (typeof fetch === 'function') refreshInventory();
