/**
 * Products page — prefix match on /products
 */
const items = [
  { name: 'Widget Pro',   price: '$29', stock: 'In stock' },
  { name: 'Gadget X',     price: '$49', stock: 'Low stock' },
  { name: 'Module Alpha', price: '$99', stock: 'In stock' },
  { name: 'Sensor V2',    price: '$15', stock: 'Out of stock' },
];

export const Products = () => (
  <div class="page">
    <div class="emoji">📦</div>
    <h1>Products</h1>
    <p>Browse our catalog of fine components.</p>
    <div class="product-grid">
      {items.map(item => (
        <div class="product-card">
          <strong>{item.name}</strong>
          <span class="price">{item.price}</span>
          <span class={item.stock === 'In stock' ? 'stock-ok' : 'stock-low'}>{item.stock}</span>
        </div>
      ))}
    </div>
  </div>
);
