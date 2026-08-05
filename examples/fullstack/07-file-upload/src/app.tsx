/**
 * Fullstack 07 — File Upload · App Entry
 */
import { FileUploadDemo } from './main.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;max-width:560px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b;line-height:1.5}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.dropzone{display:flex;align-items:center;justify-content:center;padding:22px;border:2px dashed #334155;border-radius:12px;color:#94a3b8;font-size:.84rem;font-weight:500;cursor:pointer;transition:border-color .15s,color .15s;margin-bottom:16px}
.dropzone:hover{border-color:#6366f1;color:#c7d2fe}
.dropzone input{display:none}

.error{color:#f87171;font-size:.8rem;font-weight:500;margin-bottom:14px}

.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.thumb{background:#0f172a;border:1px solid #334155;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px}
.thumb img{width:100%;height:80px;object-fit:cover;border-radius:6px}
.thumbName{font-size:.68rem;color:#cbd5e1;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:100%}
.thumbSize{font-size:.64rem;color:#64748b}
`;
document.head.appendChild(style);
document.getElementById('app')!.appendChild(FileUploadDemo({}) as Node);
