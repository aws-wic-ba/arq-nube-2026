const CART_KEY = "roversec_cart";
function leerCarrito() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function guardarCarrito(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); actualizarBadge(); }
function agregarAlCarrito(curso) {
  const items = leerCarrito();
  if (items.find((i) => i.id === curso.id)) return false; // un curso no se compra dos veces
  items.push(curso); guardarCarrito(items); return true;
}
function actualizarBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  badge.textContent = leerCarrito().length;
}
function formatoPrecio(v) { return "$" + Number(v).toLocaleString("es-AR"); }
