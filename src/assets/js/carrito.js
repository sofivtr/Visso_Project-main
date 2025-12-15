const KEY = 'carrito';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  const count = items.reduce((n, it) => n + (it.cantidad || 0), 0);
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
}

export function getCart() { return read(); }

export function addItem(producto, qty = 1) {
  const items = read();
  const idx = items.findIndex(it => it.id === producto.id);
  if (idx >= 0) {
    items[idx].cantidad = Math.min(10, (items[idx].cantidad || 0) + qty);
  } else {
    items.push({
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      imagenUrl: producto.imagenUrl,
      cantidad: Math.max(1, Math.min(10, qty))
    });
  }
  write(items);
}

export function countItems() {
  const items = read();
  return items.reduce((n, it) => n + (it.cantidad || 0), 0);
}

export function subscribeCart(handler) {
  const fn = (e) => handler(e.detail?.count ?? countItems());
  window.addEventListener('cart:updated', fn);
  window.addEventListener('storage', () => handler(countItems()));
  return () => window.removeEventListener('cart:updated', fn);
}

export function updateQty(id, qty) {
  const items = read();
  const idx = items.findIndex(it => it.id === id);
  if (idx >= 0) {
    const clamped = Math.max(1, Math.min(10, qty || 1));
    items[idx].cantidad = clamped;
    write(items);
  }
}

export function removeItem(id) {
  const items = read().filter(it => it.id !== id);
  write(items);
}

export function clearCart() {
  write([]);
}

export function computeTotals(items = read(), opts = { iva: 0.19, envio: 0 }) {
  const subtotal = items.reduce((sum, it) => sum + (it.precio * (it.cantidad || 0)), 0);
  const iva = Math.round(subtotal * (opts.iva ?? 0.19));
  const envio = opts.envio ?? 0;
  const total = subtotal + iva + envio;
  return { subtotal, iva, envio, total };
}
