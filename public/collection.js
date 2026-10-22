'use strict';
// Shared rules for collection filters and the storefront's stock snapshot.
globalThis.VlanaCollection = (() => {
  const sizes = ['P', 'M', 'G', 'GG'];
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function inventoryFrom(data) {
    const source = data?.inventory;
    if (data?.mode === 'demo' && source?.state === 'demo') return {state: 'demo', variants: []};
    if (!data?.active || source?.state !== 'ready' || !Array.isArray(source.variants)) throw new Error('Estoque indisponível');
    const seen = new Set();
    const variants = source.variants.map(row => {
      const key = `${row.id}:${row.size}`;
      if (!Number.isInteger(row.id) || row.id < 0 || row.id > 11 || !sizes.includes(row.size) ||
          !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 10 || seen.has(key)) throw new Error('Estoque inválido');
      seen.add(key);
      return {id: row.id, size: row.size, quantity: row.quantity};
    });
    return {state: 'ready', variants};
  }

  function quantity(inventory, id, size) {
    if (!sizes.includes(size)) return 0;
    if (inventory.state === 'demo') return 10;
    if (inventory.state !== 'ready') return 0;
    return inventory.variants.find(row => row.id === id && row.size === size)?.quantity || 0;
  }

  function filter(products, filters, inventory) {
    const result = products.filter(product => {
      if (filters.search && !normalize(`${product.name} ${product.type} ${product.color}`).includes(normalize(filters.search.trim()))) return false;
      if (filters.category && product.type !== filters.category) return false;
      if (filters.color && product.color !== filters.color) return false;
      if (filters.size && quantity(inventory, product.id, filters.size) === 0) return false;
      if (filters.price === 'under150' && product.price >= 150) return false;
      if (filters.price === '150to250' && (product.price < 150 || product.price > 250)) return false;
      if (filters.price === 'above250' && product.price <= 250) return false;
      return true;
    });
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price || a.id - b.id);
    if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price || a.id - b.id);
    if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return result;
  }

  return {filter, inventoryFrom, quantity, sizes};
})();
