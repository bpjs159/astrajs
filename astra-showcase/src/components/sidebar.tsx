import { routes } from '../routes.js';
import { cartCount } from '../stores/cart.js';
import { Link } from '@astrajs/router';

const navItems = [
  { label: 'Dashboard', path: '/', emoji: '📊' },
  { label: 'Products', path: '/products', emoji: '🛍️' },
  { label: 'Orders', path: '/orders', emoji: '📦' },
  { label: 'Cart', path: '/cart', emoji: '🛒' },
  { label: 'Form Demo', path: '/form', emoji: '📝' },
  { label: 'Upload', path: '/upload', emoji: '📤' },
];

function isActive(path: string): boolean {
  if (path === '/') return routes.dashboard as unknown as boolean;
  if (path === '/products') return routes.products as unknown as boolean;
  if (path === '/orders') return routes.orders as unknown as boolean;
  if (path === '/cart') return routes.cart as unknown as boolean;
  if (path === '/form') return routes.formDemo as unknown as boolean;
  if (path === '/upload') return routes.upload as unknown as boolean;
  return false;
}

export function Sidebar(): JSX.Element {
  return (
    <nav class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">AstraJS</span>
      </div>

      <div class="sidebar-nav">
        {navItems.map((item) => (
          <Link
            href={item.path}
            class={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span class="nav-emoji">{item.emoji}</span>
            <span class="nav-label">{item.label}</span>
            {item.label === 'Cart' && cartCount() > 0 && (
              <span class="nav-badge">{cartCount()}</span>
            )}
          </Link>
        ))}
      </div>

      <div class="sidebar-footer">
        <span class="version">v0.1.0</span>
      </div>
    </nav>
  );
}
