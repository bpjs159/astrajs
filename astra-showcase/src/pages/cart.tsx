import { component } from '@astrajs/core';
import { cartStore, removeFromCart, clearCart, cartTotal, cartCount } from '../stores/cart.js';

type CartItem = { productId: string; name: string; price: number; quantity: number };

export const CartPage = component(() => (
  <div class="page">
    <div class="page-header">
      <h1>Cart</h1>
      <p>{`${cartCount()} items — $${cartTotal().toLocaleString()}`}</p>
    </div>
    {cartStore.items.length === 0 ? (
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="/products" class="btn-primary">Browse Products</a>
      </div>
    ) : (
      <div>
        <div class="cart-list">
          {cartStore.items.map((item: CartItem) => (
            <div class="cart-row">
              <div class="cart-item-info">
                <div class="cart-item-name">{item.name}</div>
                <div class="cart-item-meta">
                  ${item.price} × {item.quantity} = <strong>${item.price * item.quantity}</strong>
                </div>
              </div>
              <button class="btn-remove" onClick={() => removeFromCart(item.productId)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div class="cart-footer">
          <button class="btn-secondary" onClick={clearCart}>Clear Cart</button>
          <div class="cart-total">
            Total: <strong>${cartTotal().toLocaleString()}</strong>
          </div>
        </div>
      </div>
    )}
  </div>
));
