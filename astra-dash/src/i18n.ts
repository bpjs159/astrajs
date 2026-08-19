/**
 * astra-dash — i18n compacta (es/en/pt).
 * El idioma vive en un store reactivo: las expresiones JSX que llaman t()
 * se re-traducen solas al cambiar la selección del header.
 */
import { store } from 'astrajs.dev/core';

export const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
] as const;

const T: Record<string, Record<string, string>> = {
  es: {
    'hero.title': 'Panel en tiempo real',
    'hero.sub': 'Métricas que llegan solas con autoSync (polling con ETag y 304), análisis con AI en streaming, subida de reportes y resumabilidad sin hidratación.',
    'hero.live': 'EN VIVO',
    'hero.sync': 'Última sincronización:',
    'kpi.visits': 'Visitas',
    'kpi.orders': 'Pedidos',
    'kpi.revenue': 'Ingresos',
    'kpi.cpu': 'CPU',
    'kpi.revenue.unit': 'USD',
    'kpi.cpu.unit': '%',
    'chart.title': 'Visitas — últimas 24 muestras',
    'chart.sub': 'Cada barra es un snapshot del servidor. autoSync consulta con If-None-Match: si nada cambió, la respuesta pesa 0 bytes (304).',
    'ai.title': 'Insights con AI en streaming',
    'ai.sub': 'Pregunta sobre las métricas. La respuesta llega token a token desde el servidor — la clave de API nunca viaja al navegador.',
    'ai.placeholder': 'Ej.: ¿qué métrica preocupa más y por qué?',
    'ai.send': 'Preguntar',
    'ai.idle': 'esperando pregunta',
    'ai.streaming': 'generando…',
    'ai.done': 'listo',
    'ai.error': 'error',
    'up.title': 'Subir reporte',
    'up.sub': 'Elige un CSV o TXT. El cliente lo lee en chunks con barra de progreso y el servidor valida y resume filas/columnas.',
    'up.choose': 'Elegir archivo (CSV/TXT, máx. 512 KB)',
    'up.uploading': 'Subiendo…',
    'up.rows': 'filas',
    'up.cols': 'columnas',
    'up.bytes': 'bytes',
    'up.done': 'Reporte procesado en el servidor:',
    'up.tooLarge': 'Archivo demasiado grande (máx. 512 KB).',
    'up.empty': 'El archivo no tiene líneas con contenido.',
    'resume.title': 'Resumabilidad',
    'resume.sub': 'El HTML llega con el estado serializado y los handlers delegados. El cliente reanuda sin re-ejecutar el componente.',
    'resume.pill': '0 hidratación',
    'resume.bump': '+1 visita',
    'resume.reset': 'Reiniciar',
    'resume.note': 'Ver código fuente: el número no se re-renderiza; cambia por mutación directa de un solo TextNode.',
    'strip.autoSync': 'autoSync + ETag',
    'strip.ai': 'AI streaming',
    'strip.upload': 'upload con progreso',
    'strip.resume': 'resumabilidad',
    'strip.isr': 'RPC tipado',
    'footer': 'AstraDash · demo de AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  en: {
    'hero.title': 'Real-time dashboard',
    'hero.sub': 'Metrics that arrive on their own via autoSync (ETag polling with 304), streaming AI insights, report uploads and resumability without hydration.',
    'hero.live': 'LIVE',
    'hero.sync': 'Last sync:',
    'kpi.visits': 'Visits',
    'kpi.orders': 'Orders',
    'kpi.revenue': 'Revenue',
    'kpi.cpu': 'CPU',
    'kpi.revenue.unit': 'USD',
    'kpi.cpu.unit': '%',
    'chart.title': 'Visits — last 24 samples',
    'chart.sub': 'Each bar is a server snapshot. autoSync polls with If-None-Match: when nothing changed, the response weighs 0 bytes (304).',
    'ai.title': 'Streaming AI insights',
    'ai.sub': 'Ask about the metrics. The answer streams token by token from the server — the API key never ships to the browser.',
    'ai.placeholder': 'e.g. which metric worries you most and why?',
    'ai.send': 'Ask',
    'ai.idle': 'awaiting question',
    'ai.streaming': 'generating…',
    'ai.done': 'done',
    'ai.error': 'error',
    'up.title': 'Upload report',
    'up.sub': 'Pick a CSV or TXT. The client reads it in chunks with a progress bar and the server validates and summarizes rows/columns.',
    'up.choose': 'Choose file (CSV/TXT, max 512 KB)',
    'up.uploading': 'Uploading…',
    'up.rows': 'rows',
    'up.cols': 'columns',
    'up.bytes': 'bytes',
    'up.done': 'Report processed on the server:',
    'up.tooLarge': 'File too large (max 512 KB).',
    'up.empty': 'The file has no non-empty lines.',
    'resume.title': 'Resumability',
    'resume.sub': 'The HTML arrives with serialized state and delegated handlers. The client resumes without re-executing the component.',
    'resume.pill': '0 hydration',
    'resume.bump': '+1 visit',
    'resume.reset': 'Reset',
    'resume.note': 'View page source: the number is never re-rendered; it changes by direct mutation of a single TextNode.',
    'strip.autoSync': 'autoSync + ETag',
    'strip.ai': 'AI streaming',
    'strip.upload': 'upload with progress',
    'strip.resume': 'resumability',
    'strip.isr': 'typed RPC',
    'footer': 'AstraDash · AstraJS demo — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  pt: {
    'hero.title': 'Painel em tempo real',
    'hero.sub': 'Métricas que chegam sozinhas com autoSync (polling com ETag e 304), insights com AI em streaming, upload de relatórios e resumibilidade sem hidratação.',
    'hero.live': 'AO VIVO',
    'hero.sync': 'Última sincronização:',
    'kpi.visits': 'Visitas',
    'kpi.orders': 'Pedidos',
    'kpi.revenue': 'Receita',
    'kpi.cpu': 'CPU',
    'kpi.revenue.unit': 'USD',
    'kpi.cpu.unit': '%',
    'chart.title': 'Visitas — últimas 24 amostras',
    'chart.sub': 'Cada barra é um snapshot do servidor. autoSync consulta com If-None-Match: se nada mudou, a resposta pesa 0 bytes (304).',
    'ai.title': 'Insights com AI em streaming',
    'ai.sub': 'Pergunte sobre as métricas. A resposta chega token a token do servidor — a chave da API nunca vai ao navegador.',
    'ai.placeholder': 'Ex.: qual métrica preocupa mais e por quê?',
    'ai.send': 'Perguntar',
    'ai.idle': 'aguardando pergunta',
    'ai.streaming': 'gerando…',
    'ai.done': 'pronto',
    'ai.error': 'erro',
    'up.title': 'Enviar relatório',
    'up.sub': 'Escolha um CSV ou TXT. O cliente lê em chunks com barra de progresso e o servidor valida e resume linhas/colunas.',
    'up.choose': 'Escolher arquivo (CSV/TXT, máx. 512 KB)',
    'up.uploading': 'Enviando…',
    'up.rows': 'linhas',
    'up.cols': 'colunas',
    'up.bytes': 'bytes',
    'up.done': 'Relatório processado no servidor:',
    'up.tooLarge': 'Arquivo grande demais (máx. 512 KB).',
    'up.empty': 'O arquivo não tem linhas com conteúdo.',
    'resume.title': 'Resumibilidade',
    'resume.sub': 'O HTML chega com o estado serializado e os handlers delegados. O cliente retoma sem re-executar o componente.',
    'resume.pill': '0 hidratação',
    'resume.bump': '+1 visita',
    'resume.reset': 'Reiniciar',
    'resume.note': 'Ver código-fonte: o número nunca é re-renderizado; muda por mutação direta de um único TextNode.',
    'strip.autoSync': 'autoSync + ETag',
    'strip.ai': 'AI streaming',
    'strip.upload': 'upload com progresso',
    'strip.resume': 'resumibilidade',
    'strip.isr': 'RPC tipado',
    'footer': 'AstraDash · demo do AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
};

const localeStore = store({ code: 'es' as string });

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('dash-locale');
  if (saved && T[saved]) localeStore.code = saved;
}

export function currentLocale(): string {
  return localeStore.code;
}

export function setLocale(code: string): void {
  if (!T[code]) return;
  localeStore.code = code;
  if (typeof localStorage !== 'undefined') localStorage.setItem('dash-locale', code);
}

/** Traduce con fallback a es. Leer localeStore.code la hace reactiva. */
export function t(key: string): string {
  void localeStore.code;
  return T[localeStore.code]?.[key] ?? T.es[key] ?? key;
}
