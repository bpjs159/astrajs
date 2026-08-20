/**
 * astra-traffic — dashboard de tráfico Nginx.
 *
 * Lee el access log de nginx en el servidor (server()) y lo muestra en un
 * dashboard con autoSync (ETag + 304). Protegido por HTTP Basic Auth a
 * nivel de nginx (ver nginx.conf).
 */
import { component, store, mounted } from 'astrajs.dev/core';
import { autoSync } from 'astrajs.dev/server';
import { getTraffic, type TrafficSnapshot } from './server/traffic.server.js';

const state = store({
  data: null as TrafficSnapshot | null,
  loading: true,
  error: '',
  lastSync: '',
});

function apply(s: TrafficSnapshot): void {
  state.data = s;
  state.loading = false;
  state.lastSync = new Date().toLocaleTimeString();
}

const style = `
  .site-header{position:fixed;top:0;left:0;right:0;z-index:1000;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(4,6,13,.7);backdrop-filter:blur(20px);border-bottom:1px solid var(--line)}
  .brand-logo{display:flex;align-items:center;gap:2px;font-weight:800;font-size:1.1rem;letter-spacing:.04em;color:#fff;cursor:pointer;line-height:1}
  .bl-js{background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .brand-sub{margin-left:10px;font-size:.6rem;font-weight:700;color:#c4a0ff;background:rgba(139,77,255,.12);border:1px solid rgba(139,77,255,.35);border-radius:999px;padding:2px 8px;letter-spacing:.06em;text-transform:uppercase}
  .header-right{display:flex;align-items:center;gap:14px}
  .sync{font-size:.72rem;color:var(--muted)}
  .refresh{font-size:.78rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);border:none;border-radius:8px;padding:7px 16px;cursor:pointer;transition:opacity .15s}
  .refresh:hover{opacity:.9}

  .wrap{max-width:1200px;margin:0 auto;padding:40px 24px 80px}
  .title{font-size:1.8rem;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}
  .sub{font-size:.85rem;color:var(--muted);margin-bottom:28px}
  .loading,.error{padding:40px;text-align:center;color:var(--muted)}
  .error{color:var(--danger)}

  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
  .kpi-lbl{font-size:.7rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
  .kpi-val{font-size:1.6rem;font-weight:800;letter-spacing:-.01em}
  .kpi-val.ok{color:var(--ok)}
  .kpi-val.warn{color:var(--warn)}
  .kpi-val.danger{color:var(--danger)}

  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
  .card h3{font-size:.85rem;font-weight:700;margin-bottom:14px;color:#f7f7ff}
  .card.full{grid-column:1/-1}

  .chart{display:flex;align-items:flex-end;gap:3px;height:160px}
  .bar{flex:1;background:linear-gradient(180deg,#b84cff,#4d7cff);border-radius:3px 3px 0 0;min-height:2px;position:relative}
  .bar:hover{filter:brightness(1.3)}
  .bar-label{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:.55rem;color:var(--muted)}

  table{width:100%;border-collapse:collapse;font-size:.8rem}
  th{text-align:left;font-size:.66rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;padding:6px 8px;border-bottom:1px solid var(--line)}
  td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04)}
  td.num{text-align:right;font-family:'JetBrains Mono',monospace;color:#f7f7ff}
  .path{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:#c4a0ff;word-break:break-all}
  .status-pill{display:inline-block;min-width:44px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:6px}
  .status-pill.s2{color:var(--ok);background:rgba(52,211,153,.1)}
  .status-pill.s3{color:var(--accent2);background:rgba(0,223,255,.1)}
  .status-pill.s4{color:var(--warn);background:rgba(251,191,36,.1)}
  .status-pill.s5{color:var(--danger);background:rgba(248,113,113,.1)}

  @media(max-width:760px){.grid{grid-template-columns:1fr}}
`;

// Dashboard — lee state.data directamente para que el compilador envuelva
// las expresiones en dynamic() y se re-rendericen cuando cambia el estado.
function Dashboard(): JSX.Element {
  const d = state.data;
  if (!d) return <div class="loading">Cargando…</div>;

  const maxHour = Math.max(1, ...d.byHour);
  const byClass = { '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const [code, n] of Object.entries(d.statusCodes)) {
    const c = code[0];
    if (byClass[c] !== undefined) byClass[c] += n;
  }

  return (
    <div>
      <div class="kpis">
        <div class="kpi"><div class="kpi-lbl">Requests</div><div class="kpi-val">{d.total.toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-lbl">IPs únicas</div><div class="kpi-val">{d.uniqueIps.toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-lbl">2xx</div><div class="kpi-val ok">{byClass['2'].toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-lbl">3xx</div><div class="kpi-val">{byClass['3'].toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-lbl">4xx</div><div class="kpi-val warn">{byClass['4'].toLocaleString()}</div></div>
        <div class="kpi"><div class="kpi-lbl">5xx</div><div class="kpi-val danger">{byClass['5'].toLocaleString()}</div></div>
      </div>

      <div class="grid">
        <div class="card full">
          <h3>Sitios expuestos</h3>
          <table>
            <thead><tr><th>Sitio</th><th class="num">Requests</th><th class="num">IPs únicas</th></tr></thead>
            <tbody>
              {d.bySite.map((s) => (
                <tr>
                  <td><code>{s.site}</code></td>
                  <td class="num">{s.total.toLocaleString()}</td>
                  <td class="num">{s.uniqueIps.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="card full">
          <h3>Requests por hora</h3>
          <div class="chart">
            {d.byHour.map((h, i) => (
              <div class="bar" style={`height:${Math.max(2, (h / maxHour) * 100)}%`} title={`${i}:00 — ${h}`}>
                {i % 4 === 0 && <span class="bar-label">{i}</span>}
              </div>
            ))}
          </div>
        </div>

        <div class="card">
          <h3>Top IPs</h3>
          <table>
            <thead><tr><th>IP</th><th class="num">Req</th></tr></thead>
            <tbody>
              {d.topIps.map((r) => (
                <tr><td><code>{r.key}</code></td><td class="num">{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>Top rutas</h3>
          <table>
            <thead><tr><th>Ruta</th><th class="num">Req</th></tr></thead>
            <tbody>
              {d.topPaths.map((r) => (
                <tr><td class="path">{r.key}</td><td class="num">{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="card full">
          <h3>Códigos de estado</h3>
          <table>
            <thead><tr><th>Código</th><th class="num">Requests</th></tr></thead>
            <tbody>
              {Object.entries(d.statusCodes)
                .sort((a, b) => b[1] - a[1])
                .map(([code, n]) => (
                  <tr>
                    <td><span class={`status-pill s${code[0]}`}>{code}</span></td>
                    <td class="num">{n}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const App = component(() => {
  mounted(() => {
    getTraffic()
      .then(apply)
      .catch((e) => { state.error = String(e); state.loading = false; });
    return autoSync('/api/astra/getTraffic', apply, { interval: 5000 });
  });

  return (
    <div class="traffic">
      <style>{style}</style>
      <header class="site-header">
        <div class="brand-logo">
          <span class="bl-first">A</span><span>STRA</span><span class="bl-js">JS</span>
          <span class="brand-sub">Traffic</span>
        </div>
        <div class="header-right">
          <span class="sync">Última sync: {state.lastSync || '—'}</span>
          <button
            class="refresh"
            onclick={() => {
              state.loading = true;
              getTraffic()
                .then(apply)
                .catch((e) => { state.error = String(e); state.loading = false; });
            }}
          >
            ↻ Actualizar
          </button>
        </div>
      </header>

      <main class="wrap">
        <h1 class="title">Tráfico Nginx</h1>
        <p class="sub">Leyendo {state.data?.logDir ?? '…'} · auto-actualiza cada 5s</p>

        {state.loading && !state.data && <div class="loading">Cargando…</div>}
        {state.error && <div class="error">{state.error}</div>}

        {state.data && Dashboard()}
      </main>
    </div>
  );
});
