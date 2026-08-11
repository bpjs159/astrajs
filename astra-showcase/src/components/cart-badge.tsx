import { cartCount } from '../stores/cart.js';

export function CartBadge(): JSX.Element {
  return (
    <span class="cart-badge" hidden={cartCount() === 0}>
      {cartCount()}
    </span>
  );
}
