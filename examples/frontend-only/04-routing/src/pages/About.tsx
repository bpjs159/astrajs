/**
 * About page — exact match on /about
 */
export const About = () => (
  <div class="page">
    <div class="emoji">ℹ️</div>
    <h1>About</h1>
    <p>
      AstraJS is a Zero-VDOM framework that compiles JSX directly to physical
      DOM mutations. Routing is declarative, fractal, and free of wrapper components.
    </p>
    <div class="feature-list">
      <div class="feature">⚡ Zero Virtual DOM</div>
      <div class="feature">🎯 O(1) DOM mutations</div>
      <div class="feature">🧩 Declarative routing</div>
      <div class="feature">🌐 SSR & SSG built-in</div>
    </div>
  </div>
);
