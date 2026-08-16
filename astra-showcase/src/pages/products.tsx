import { component, mounted } from 'astrajs.dev/core';
import { ProductCard } from '../components/product-card.js';
import { productStore, loadProducts, setProductsLoading } from '../stores/products.js';
import { addToCart } from '../stores/cart.js';
import { getProducts } from '../server/products.server.js';

export const ProductsPage = component(() => {
  mounted(() => {
    if (productStore.items.length === 0) {
      setProductsLoading();
      getProducts().then(loadProducts).catch((e) => {
        productStore.error = e instanceof Error ? e.message : 'Error';
      });
    }
  });

  const categories = [...new Set(productStore.items.map((p) => p.category))];

  return (
    <div class="page">
      <div class="page-header">
        <h1>Products</h1>
        <p>Data fetched via <code>server()</code> RPC — cached with SWR (example 01 + 02)</p>
      </div>

      {productStore.error && <div class="error-banner">{productStore.error}</div>}

      {productStore.loading && productStore.items.length === 0 ? (
        <div class="loading">Loading products...</div>
      ) : (
        <div>
          {categories.map((cat) => (
            <div class="category-section">
              <h2 class="category-title">{cat}</h2>
              <div class="product-list">
                {productStore.items
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <ProductCard
                      id={p.id}
                      name={p.name}
                      price={p.price}
                      stock={p.stock}
                      category={p.category}
                      onAdd={(id) => {
                        const prod = productStore.items.find((x) => x.id === id)!;
                        addToCart(prod);
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
