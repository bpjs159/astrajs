/**
 * AstraJS Showcase — App Entry
 *
 * Demonstrates all 10 framework concepts in a unified dashboard:
 * 01 — server() dynamic data
 * 02 — SWR caching
 * 03 — Form + server validation
 * 04 — Client-side routing
 * 05 — Schema validation (shared client/server)
 * 06 — Optimistic mutations
 * 07 — File upload
 * 08 — AutoSync real-time polling
 * 09 — SSR Resumability (astra-data)
 * 10 — SSG Pre-Build (compile-time execution)
 */
import { DashboardLayout } from './layouts/dashboard.js';

const style = document.createElement('style');
style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0b1120;color:#e2e8f0;overflow-x:hidden}

.layout{display:flex;min-height:100vh}
.main-content{flex:1;margin-left:260px;min-height:100vh}

.sidebar{position:fixed;top:0;left:0;bottom:0;width:260px;background:#0f172a;border-right:1px solid #1e293b;display:flex;flex-direction:column;z-index:100}
.sidebar-brand{display:flex;align-items:center;gap:10px;padding:24px 24px 20px;border-bottom:1px solid #1e293b}
.brand-icon{font-size:1.5rem}
.brand-text{font-size:1.2rem;font-weight:800;color:#f1f5f9;letter-spacing:-.02em}
.sidebar-nav{flex:1;padding:12px 12px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
.sidebar-footer{padding:16px 24px;border-top:1px solid #1e293b;font-size:.7rem;color:#475569}
.version{background:rgba(99,102,241,.12);color:#818cf8;padding:2px 8px;border-radius:6px;font-weight:600}

.nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;color:#94a3b8;text-decoration:none;font-size:.86rem;font-weight:500;transition:background .12s,color .12s}
.nav-item:hover{background:rgba(99,102,241,.06);color:#e2e8f0}
.nav-item.active{background:rgba(99,102,241,.12);color:#818cf8;font-weight:600}
.nav-emoji{font-size:1.1rem;width:24px;text-align:center}
.nav-label{flex:1}
.nav-badge{background:#ef4444;color:#fff;font-size:.68rem;font-weight:700;padding:1px 7px;border-radius:10px;min-width:20px;text-align:center}

.page{padding:32px 40px;max-width:1100px}
.page-header{margin-bottom:28px}
.page-header h1{font-size:1.5rem;font-weight:700;color:#f1f5f9;margin-bottom:6px;letter-spacing:-.01em}
.page-header p{font-size:.84rem;color:#64748b;line-height:1.5}
.page-header code{background:rgba(99,102,241,.12);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.8rem;font-weight:500}

.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:32px}
.stat-card{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:20px 24px}
.stat-value{font-size:1.6rem;font-weight:800;color:#818cf8;letter-spacing:-.02em}
.stat-label{font-size:.74rem;color:#64748b;margin-top:4px;font-weight:500}

.stats-row{display:flex;gap:16px;margin-bottom:24px}
.stat-mini{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:14px 20px;flex:1}
.stat-mini-num{display:block;font-size:1.3rem;font-weight:800;color:#818cf8}
.stat-mini-lbl{display:block;font-size:.72rem;color:#64748b;margin-top:2px}

.concepts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.concept-card{display:flex;align-items:center;gap:14px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px 20px;text-decoration:none;transition:border-color .15s,background .15s}
.concept-card:hover{border-color:#334155;background:#1a2332}
.concept-emoji{font-size:1.5rem;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.08);border-radius:10px}
.concept-info{flex:1}
.concept-title{font-size:.84rem;font-weight:600;color:#e2e8f0;margin-bottom:2px}
.concept-desc{font-size:.74rem;color:#64748b;line-height:1.4}

.category-section{margin-bottom:28px}
.category-title{font-size:.8rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px;padding-left:4px}
.product-list{display:flex;flex-direction:column;gap:8px}

.product-card{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#0f172a;border:1px solid #1e293b;border-radius:12px;transition:border-color .12s}
.product-card:hover{border-color:#334155}
.product-name{font-weight:600;color:#e2e8f0;font-size:.88rem;margin-bottom:3px}
.product-meta{display:flex;gap:12px;font-size:.76rem}
.product-category{color:#64748b}
.product-stock{font-weight:600}
.product-actions{display:flex;align-items:center;gap:12px}
.product-price{font-size:.9rem;font-weight:700;color:#818cf8}

.btn-add{padding:7px 14px;border:1px solid #334155;border-radius:8px;background:transparent;color:#818cf8;font-weight:600;font-size:.8rem;cursor:pointer;transition:border-color .15s,background .15s}
.btn-add:hover{border-color:#6366f1;background:rgba(99,102,241,.08)}
.btn-add:disabled{opacity:.4;cursor:not-allowed}

.btn-primary{padding:10px 24px;border:none;border-radius:10px;font-size:.86rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s}
.btn-primary:hover{filter:brightness(1.12)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}

.btn-secondary{padding:8px 18px;border:1px solid #334155;border-radius:8px;background:transparent;color:#94a3b8;font-weight:600;font-size:.8rem;cursor:pointer;transition:border-color .15s}
.btn-secondary:hover{border-color:#6366f1;color:#e2e8f0}

.order-list{display:flex;flex-direction:column;gap:8px}
.order-row{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#0f172a;border:1px solid #1e293b;border-radius:12px}
.order-product{font-weight:600;color:#e2e8f0;font-size:.88rem;margin-bottom:4px}
.order-meta{display:flex;gap:14px;font-size:.76rem;color:#64748b;align-items:center}
.order-status{font-weight:600}
.order-total{font-weight:600;color:#94a3b8}

.like-btn{padding:7px 16px;border:1px solid #334155;border-radius:8px;background:transparent;color:#818cf8;font-weight:700;font-size:.82rem;cursor:pointer;transition:all .15s;min-width:60px}
.like-btn:hover{border-color:#6366f1;background:rgba(99,102,241,.08)}
.like-btn:disabled{opacity:.5;cursor:not-allowed}
.like-btn.pending{background:rgba(99,102,241,.1);border-color:#6366f1}

.cart-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.cart-row{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#0f172a;border:1px solid #1e293b;border-radius:12px}
.cart-item-name{font-weight:600;color:#e2e8f0;font-size:.88rem;margin-bottom:2px}
.cart-item-meta{font-size:.78rem;color:#64748b}
.cart-footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid #1e293b}
.cart-total{font-size:1rem;color:#e2e8f0}
.cart-total strong{color:#34d399}

.btn-remove{padding:6px 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:#ef4444;font-size:.9rem;cursor:pointer;transition:background .15s}
.btn-remove:hover{background:rgba(239,68,68,.1)}

.astro-form{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:24px}
.form-field{margin-bottom:18px}
.form-field label{display:block;font-size:.78rem;font-weight:600;color:#94a3b8;margin-bottom:6px}
.form-field input,.form-field textarea{width:100%;padding:10px 14px;border:1px solid #1e293b;border-radius:10px;background:#0b1120;color:#e2e8f0;font-size:.86rem;font-family:inherit;outline:none;transition:border-color .15s}
.form-field input:focus,.form-field textarea:focus{border-color:#6366f1}

.upload-zone{border:2px dashed #1e293b;border-radius:16px;padding:40px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;margin-bottom:20px}
.upload-zone:hover{border-color:#6366f1;background:rgba(99,102,241,.03)}
.upload-icon{font-size:2rem;margin-bottom:8px}
.upload-text{font-size:.9rem;font-weight:600;color:#e2e8f0;margin-bottom:4px}
.upload-hint{font-size:.74rem;color:#64748b}

.file-list{margin-top:24px}
.file-list h3{font-size:.8rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}
.file-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;margin-bottom:6px}
.file-name{font-size:.86rem;color:#e2e8f0}
.file-meta{font-size:.74rem;color:#64748b}

.error-banner{color:#f87171;font-size:.82rem;font-weight:500;padding:10px 16px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.15);border-radius:10px;margin-bottom:16px}
.success-banner{color:#34d399;font-size:.82rem;font-weight:500;padding:10px 16px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.15);border-radius:10px;margin-bottom:16px}
.errorSlot{min-height:52px}

.loading{padding:40px;text-align:center;color:#64748b;font-size:.9rem}
.empty-state{padding:60px 20px;text-align:center}
.empty-icon{font-size:3rem;margin-bottom:12px}
.empty-state p{color:#64748b;margin-bottom:16px;font-size:.9rem}
`;
document.head.appendChild(style);

document.getElementById('app')!.appendChild(DashboardLayout({}) as Node);
