/**
 * 09 — Component Composition · App Entry
 */
import { CompositionDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}h1{font-size:1.5rem;margin-bottom:4px}h2{font-size:1.1rem;color:#cbd5e1;margin-bottom:12px}`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(CompositionDemo({}) as Node);
