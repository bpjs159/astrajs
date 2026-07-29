/**
 * 06 — Conditional & Lists · App Entry
 */
import { ConditionalListsDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh}h1{font-size:1.5rem;margin-bottom:4px}`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(ConditionalListsDemo({}) as Node);
