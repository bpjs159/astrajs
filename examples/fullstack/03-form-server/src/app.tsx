/**
 * Fullstack 03 — Form + Validation + Server · E2E Validation + SSR Resumable
 *
 * ASTRAJS FLAGSHIP DEMO:
 * 1. Write validation ONCE on inputs → runs on BOTH client and server
 * 2. SSR Resumable — form state survives server → client transition
 *    without re-executing components (no hydration)
 *
 * Architecture:
 * - Client entry: Checks for `[astra-data]` SSR markers → resume() or fresh mount
 * - Form controller: Browser Constraint Validation API + server error merging
 * - serverForm(): Bridges client validators → server re-execution
 */
import { resume } from '@astrajs/ssr';
import { FormServerDemo } from './main.js';

// ─── SSR Resumability Bootstrap ──────────────────────────────────────────────
//
// AstraJS SSR renders components ONCE to HTML. State is serialized
// into `astra-data` attributes. The client picks up the HTML and:
// 1. Deserializes state into reactive proxies
// 2. Registers delegated event listeners (`astra-on:*`)
// 3. Restores form controller state (touched, serverErrors)
// 4. The form is interactive — no component re-execution (zero hydration)
//

const root = document.getElementById('app')!;

// Check if the page was server-rendered (has astra-data attributes)
const hasSSRState = root.querySelector('[astra-data]') !== null;

if (hasSSRState) {
  // ── SSR Resume Path ─────────────────────────────────────────────
  // The form was pre-rendered on the server. Restore state and
  // make it interactive without re-running the component.
  console.log('[AstraJS] Detected SSR content — resuming...');
  const stores = resume(root);
  console.log(`[AstraJS] Resumed ${stores.size} stores — app is interactive.`);
} else {
  // ── Client-Only Mount Path ──────────────────────────────────────
  // Standard client-side rendering (dev mode, or no SSR).
  mountApp(root);
}

// ─── Mount (Client-Only / Dev Mode) ──────────────────────────────────────────

function mountApp(container: HTMLElement): void {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px}

.card{background:#1e293b;border:1px solid #334155;border-radius:20px;padding:0;max-width:520px;width:100%;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.3),0 8px 32px rgba(0,0,0,.15)}
.header{padding:28px 32px 20px;border-bottom:1px solid #334155;background:linear-gradient(135deg,rgba(99,102,241,.06) 0%,transparent 60%)}
.header h1{font-size:1.3rem;font-weight:700;color:#f1f5f9;margin-bottom:5px;letter-spacing:-.01em}
.header p{font-size:.8rem;color:#64748b;line-height:1.5}
.header code{background:rgba(99,102,241,.15);color:#818cf8;padding:1px 7px;border-radius:4px;font-size:.78rem;font-weight:500}
.body{padding:24px 32px 28px}

.field{margin-bottom:18px}
.field label{display:block;font-size:.8rem;font-weight:600;color:#94a3b8;margin-bottom:6px}
.field input{width:100%;padding:10px 14px;border:1px solid #334155;border-radius:10px;background:#0f172a;color:#f1f5f9;font-size:.88rem;font-family:inherit;transition:border-color .2s,box-shadow .2s;outline:none}
.field input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.field input::placeholder{color:#475569}
/* Red outline only after the field has been touched (blur). The controller
   sets data-astra-touched on blur, so an untouched invalid field (e.g.
   required + empty) keeps the neutral border until the user interacts. */
.field input[data-astra-touched]:invalid{border-color:#f87171}
.field input[data-astra-touched]:invalid:focus{box-shadow:0 0 0 3px rgba(248,113,113,.15)}
.field input[data-astra-server-error]{border-color:#f59e0b}
.field input[data-astra-server-error]:focus{box-shadow:0 0 0 3px rgba(245,158,11,.15)}

.error{color:#f87171;font-size:.76rem;margin-top:5px;font-weight:500}

.successBox{text-align:center;padding:32px 0}
.successIcon{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#34d399,#10b981);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;margin:0 auto 16px}
.successBox p{color:#6ee7b7;font-size:.9rem;font-weight:500;margin-bottom:16px}
.btnSecondary{padding:9px 20px;border:1px solid #334155;border-radius:10px;font-size:.8rem;font-weight:500;cursor:pointer;background:transparent;color:#94a3b8;transition:border-color .15s,color .15s}
.btnSecondary:hover{border-color:#64748b;color:#cbd5e1}

.btnSubmit{width:100%;padding:12px;border:none;border-radius:10px;font-size:.88rem;font-weight:600;cursor:pointer;background:#6366f1;color:#fff;transition:filter .15s,transform .1s;margin-top:8px}
.btnSubmit:hover{filter:brightness(1.12)}
.btnSubmit:active{transform:scale(.98)}
.btnSubmit:disabled{opacity:.4;cursor:not-allowed;filter:none;transform:none}

.hint{margin-top:14px;font-size:.72rem;color:#475569;text-align:center}
.hint code{background:rgba(99,102,241,.12);color:#818cf8;padding:1px 5px;border-radius:3px}
  `;
  document.head.appendChild(style);

  // Mount the component
  container.appendChild(FormServerDemo({}) as Node);
}

