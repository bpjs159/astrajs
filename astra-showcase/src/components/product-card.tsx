export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  onAdd?: (id: string) => void;
}

export function ProductCard({ id, name, price, stock, category, onAdd }: ProductCardProps): JSX.Element {
  const badgeColor = stock > 50 ? '#34d399' : stock > 10 ? '#f59e0b' : '#f87171';

  return (
    <div class="product-card">
      <div class="product-info">
        <div class="product-name">{name}</div>
        <div class="product-meta">
          <span class="product-category">{category}</span>
          <span class="product-stock" style={`color:${badgeColor}`}>
            {stock} in stock
          </span>
        </div>
      </div>
      <div class="product-actions">
        <span class="product-price">${price}</span>
        {onAdd && (
          <button class="btn-add" onClick={() => onAdd(id)} disabled={stock === 0}>
            + Cart
          </button>
        )}
      </div>
    </div>
  );
}
