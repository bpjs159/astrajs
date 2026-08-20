/**
 * astra-traffic — RPC backend.
 *
 * Lee el access log de nginx (combinado) y calcula métricas de tráfico.
 * La ruta del log se configura con la env `NGINX_LOG` (default
 * /var/log/nginx/access.log). autoSync: true → el cliente sondea con
 * ETag y solo recibe datos cuando el log cambió.
 */
import { server } from 'astrajs.dev/server';

export interface SiteTraffic {
  site: string;
  total: number;
  uniqueIps: number;
}

export interface TrafficSnapshot {
  total: number;
  uniqueIps: number;
  statusCodes: Record<string, number>;
  topIps: { key: string; count: number; country: string }[];
  topPaths: { key: string; count: number }[];
  byHour: number[];
  byHourFailed: number[];
  byDay: { day: string; count: number }[];
  bySite: SiteTraffic[];
  recentErrors: { time: string; path: string; status: string; site: string; ts: number }[];
  logDir: string;
  lastLog: string;
}

// Formato combinado de nginx (combined log format).
// NOTA: se usan escapes \x22 (comilla doble) para que el parser de
// server() (stripCommentsAndStrings) no confunda las comillas del regex
// con delimitadores de string y rompa la detección de la llamada RPC.
const LINE_RE = /^(\S+) \S+ \S+ \[([^\]]+)\] \x22(\S+) ([^\x22]*)\x22 (\d{3}) (\S+) \x22([^\x22]*)\x22 \x22([^\x22]*)\x22$/;

// Convierte la hora del log ("20/Aug/2026:14:14:10 +0000") a epoch ms (UTC).
const MONTHS: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
function parseLogTime(time: string): number {
  const m = /^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-]\d{4})$/.exec(time);
  if (!m) return 0;
  const month = MONTHS[m[2]!];
  if (month === undefined) return 0;
  const utc = Date.UTC(parseInt(m[3]!, 10), month, parseInt(m[1]!, 10), parseInt(m[4]!, 10), parseInt(m[5]!, 10), parseInt(m[6]!, 10));
  const off = m[7]!;
  const sign = off[0] === '-' ? -1 : 1;
  const offMs = sign * (parseInt(off.slice(1, 3), 10) * 3600 + parseInt(off.slice(3, 5), 10) * 60) * 1000;
  return utc - offMs;
}

// Caché de país por IP (ip-api.com, free tier 45 req/min).
const countryCache = new Map<string, string>();

async function lookupCountry(ip: string): Promise<string> {
  const cached = countryCache.get(ip);
  if (cached) return cached;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
    if (res.ok) {
      const data = (await res.json()) as { country?: string };
      const country = data.country || '—';
      countryCache.set(ip, country);
      return country;
    }
  } catch {
    /* sin red — ignorar */
  }
  countryCache.set(ip, '—');
  return '—';
}

async function parseLogs(site: string): Promise<TrafficSnapshot> {
  // node:fs se importa dinámicamente para que el bundle del cliente (que
  // reemplaza server() por un fetch wrapper) no intente resolver node:fs.
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const LOG_DIR =
    (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.NGINX_LOG_DIR ??
    '/var/log/nginx';

  const empty = (): TrafficSnapshot => ({
    total: 0,
    uniqueIps: 0,
    statusCodes: {},
    topIps: [],
    topPaths: [],
    byHour: Array(24).fill(0),
    byHourFailed: Array(24).fill(0),
    byDay: [],
    bySite: [],
    recentErrors: [],
    logDir: LOG_DIR,
    lastLog: '',
  });

  if (!existsSync(LOG_DIR)) return empty();

  let allFiles: string[] = [];
  try {
    // Todos los access logs del directorio (excluye error.log y rotados .gz).
    allFiles = readdirSync(LOG_DIR).filter(
      (f) => f.endsWith('.log') && !f.includes('error') && !f.includes('access.log.'),
    );
  } catch {
    return empty();
  }

  // bySite SIEMPRE de todos los logs (para poblar el selector).
  const siteCount: Record<string, { total: number; ips: Set<string> }> = {};
  for (const file of allFiles) {
    const s = file.replace(/\.log$/, '');
    const full = join(LOG_DIR, file);
    let raw = '';
    try {
      raw = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = raw.split('\n').filter(Boolean);
    const ips = new Set<string>();
    for (const line of lines) {
      const m = LINE_RE.exec(line);
      if (m) ips.add(m[1]);
    }
    siteCount[s] = { total: lines.length, ips };
  }
  const bySite: SiteTraffic[] = Object.entries(siteCount)
    .map(([s, v]) => ({ site: s, total: v.total, uniqueIps: v.ips.size }))
    .sort((a, b) => b.total - a.total);

  // Archivos a procesar según el sitio seleccionado ('' = todos).
  let files = allFiles;
  if (site) {
    const target = `${site}.log`;
    files = allFiles.includes(target) ? [target] : [];
  }

  const ipCount: Record<string, number> = {};
  const pathCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  const hourCount = Array(24).fill(0) as number[];
  const hourFailed = Array(24).fill(0) as number[];
  const dayCount: Record<string, number> = {};
  const recentErrors: { time: string; path: string; status: string; site: string; ts: number }[] = [];
  let lastLog = '';

  for (const file of files) {
    const site = file.replace(/\.log$/, '');
    const full = join(LOG_DIR, file);
    let raw = '';
    try {
      raw = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = raw.split('\n').filter(Boolean);

    for (const line of lines) {
      const m = LINE_RE.exec(line);
      if (!m) continue;
      const ip = m[1];
      const time = m[2]; // [19/Aug/2026:14:23:45 +0000]
      const path = m[4];
      const status = m[5];

      ipCount[ip] = (ipCount[ip] ?? 0) + 1;
      pathCount[path] = (pathCount[path] ?? 0) + 1;
      statusCount[status] = (statusCount[status] ?? 0) + 1;

      const hm = /:(\d{2}):/.exec(time);
      if (hm) {
        const h = parseInt(hm[1], 10);
        hourCount[h]++;
        if (status[0] === '4' || status[0] === '5') hourFailed[h]++;
      }

      const day = time.slice(0, 11); // "19/Aug/2026"
      dayCount[day] = (dayCount[day] ?? 0) + 1;
      lastLog = line;

      // Errores (4xx/5xx) con hora exacta, ruta, status, sitio y epoch ms.
      if (status[0] === '4' || status[0] === '5') {
        recentErrors.push({ time, path, status, site, ts: parseLogTime(time) });
        if (recentErrors.length > 50) recentErrors.shift();
      }
    }
  }

  const top = (obj: Record<string, number>, n: number) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => ({ key: k, count: v }));

  const topIps = top(ipCount, 10).map((t) => ({ ...t, country: '' }));
  for (const t of topIps) {
    t.country = await lookupCountry(t.key);
  }

  return {
    total: Object.values(ipCount).reduce((a, b) => a + b, 0),
    uniqueIps: Object.keys(ipCount).length,
    statusCodes: statusCount,
    topIps,
    topPaths: top(pathCount, 10),
    byHour: hourCount,
    byHourFailed: hourFailed,
    byDay: Object.entries(dayCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count })),
    bySite,
    recentErrors,
    logDir: LOG_DIR,
    lastLog,
  };
}

export const getTraffic = server(
  { autoSync: true, autoSyncInterval: 5000 },
  async (site: string = ''): Promise<TrafficSnapshot> => parseLogs(site),
);
