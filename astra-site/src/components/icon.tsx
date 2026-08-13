import { component } from '@astrajs/core';

/**
 * Icon — vector icons in the "flow" style of the original sprite:
 * diagonal violet → blue → navy gradient, rounded geometry.
 *
 * Semantic names only — pick the icon that matches the meaning of the
 * place where it is rendered.
 *
 * Usage: <Icon name="bolt" size={20} cls="my-class" />
 */

export type IconName =
  | 'chip' | 'bolt' | 'server' | 'monitor' | 'layout' | 'sparkles'
  | 'book' | 'layers' | 'database' | 'chart' | 'shield' | 'grid'
  | 'star' | 'github' | 'cart' | 'home' | 'wrench' | 'route'
  | 'terminal' | 'code' | 'arrow-right' | 'search' | 'menu'
  | 'check' | 'x' | 'clock' | 'info' | 'loader' | 'refresh'
  | 'square' | 'play' | 'ast' | 'ssr' | 'layout-pages' | 'js-off'
  | 'pointer';

interface IconDef {
  /** Filled paths. */
  f?: string[];
  /** Stroked paths. */
  s?: string[];
  /** Stroke width for stroked paths. */
  sw?: number;
}

const DEFS: Record<string, IconDef> = {
  // ── CPU / compiler ──────────────────────────────────────────────
  chip: {
    f: [
      'M6 6h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18 18H6a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 6 6Z',
      'M10 10h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z',
    ],
    s: ['M9 2.5V6', 'M15 2.5V6', 'M9 18v3.5', 'M15 18v3.5', 'M2.5 9H6', 'M18 9h3.5', 'M2.5 15H6', 'M18 15h3.5'],
    sw: 2,
  },
  // ── AST: abstract syntax tree ───────────────────────────────────
  ast: {
    f: [
      'M12 3.5a1.2 1.2 0 1 0 .01 0Z',
      'M4.8 10.5a1.2 1.2 0 1 0 .01 0Z',
      'M19.2 10.5a1.2 1.2 0 1 0 .01 0Z',
      'M2.6 19a1.1 1.1 0 1 0 .01 0Z',
      'M7.5 19a1.1 1.1 0 1 0 .01 0Z',
      'M16.5 19a1.1 1.1 0 1 0 .01 0Z',
      'M21.4 19a1.1 1.1 0 1 0 .01 0Z',
    ],
    s: [
      'M11.4 4.5 5.5 9.5',
      'M12.6 4.5 18.5 9.5',
      'M4.3 11.5 3.3 17.9',
      'M5.3 11.5 8.1 18',
      'M18.7 11.5 17.1 18',
      'M19.7 11.5 20.8 17.9',
    ],
    sw: 1.6,
  },
  // ── SSR/SSG/ISR: server renders into the browser ────────────────
  ssr: {
    f: [
      'M2 4h6.5A1.5 1.5 0 0 1 10 5.5V8A1.5 1.5 0 0 1 8.5 9.5H2A1.5 1.5 0 0 1 .5 8V5.5A1.5 1.5 0 0 1 2 4Z',
      'M2 12.5h6.5A1.5 1.5 0 0 1 10 14v2.5a1.5 1.5 0 0 1-1.5 1.5H2A1.5 1.5 0 0 1 .5 16.5V14A1.5 1.5 0 0 1 2 12.5Z',
      'M4.2 6.75a.95.95 0 1 0 0-1.9.95.95 0 0 0 0 1.9Z',
      'M4.2 15.25a.95.95 0 1 0 0-1.9.95.95 0 0 0 0 1.9Z',
      'M15.5 4.5h6A1.5 1.5 0 0 1 23 6v10a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 14 16V6a1.5 1.5 0 0 1 1.5-1.5Z',
      'M16.8 8.5h5.4a.8.8 0 0 1 .8.8v3.6a.8.8 0 0 1-.8.8h-5.4a.8.8 0 0 1-.8-.8V9.3a.8.8 0 0 1 .8-.8Z',
    ],
    s: ['M18 10.2h3', 'M18 11.9h3', 'M11 11h2.6', 'M12.5 8.9 13.6 11l-1.1 2.1', 'M17.5 17.5V20', 'M15.5 20h4'],
    sw: 1.6,
  },
  // ── Speed / reactivity ──────────────────────────────────────────
  bolt: {
    f: ['M13.4 2.2 4.8 13.3c-.4.5 0 1.2.6 1.2h4.9l-1.7 7c-.2.7.7 1.2 1.1.6l8.6-11.1c.4-.5 0-1.2-.6-1.2h-4.9l1.7-6.9c.2-.7-.7-1.2-1.1-.7Z'],
  },
  // ── Backend / server ────────────────────────────────────────────
  server: {
    f: [
      'M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 9V6A1.5 1.5 0 0 1 4 4.5Z',
      'M4 13.5h16a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 4 13.5Z',
      'M6.8 8a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z',
      'M6.8 17a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z',
    ],
  },
  // ── Rendering / browser ─────────────────────────────────────────
  monitor: {
    f: ['M3.5 4.5h17A1.5 1.5 0 0 1 22 6v9a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 15V6a1.5 1.5 0 0 1 1.5-1.5Z'],
    s: ['M12 16.5V20', 'M8.5 20h7'],
    sw: 2,
  },
  // ── Layouts / structure ─────────────────────────────────────────
  layout: {
    f: [
      'M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z',
      'M3.5 8.5h17',
      'M12.7 8.5v12',
    ],
  },
  // ── Persistent layout: one frame, several pages ─────────────────
  'layout-pages': {
    s: ['M3 2.5h18A1.5 1.5 0 0 1 22.5 4v16a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 20V4A1.5 1.5 0 0 1 3 2.5Z'],
    f: [
      'M4.5 6.5h15a1.3 1.3 0 0 1 1.3 1.3v3a1.3 1.3 0 0 1-1.3 1.3h-15a1.3 1.3 0 0 1-1.3-1.3v-3a1.3 1.3 0 0 1 1.3-1.3Z',
      'M4.5 13.6h15a1.3 1.3 0 0 1 1.3 1.3v3a1.3 1.3 0 0 1-1.3 1.3h-15a1.3 1.3 0 0 1-1.3-1.3v-3a1.3 1.3 0 0 1 1.3-1.3Z',
    ],
    sw: 1.6,
  },
  // ── Magic / inference ───────────────────────────────────────────
  sparkles: {
    f: [
      'M12 2.6l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7Z',
      'M18.6 14.6l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8Z',
      'M5.4 14.6l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8Z',
    ],
  },
  // ── Docs / learning ─────────────────────────────────────────────
  book: {
    f: [
      'M3.5 5.5C5 4.6 8.2 4.4 12 6.1c3.8-1.7 7-1.5 8.5-.6.6.4.6 1.3 0 1.7-1.5.9-4.7 1.1-8.5-.6-3.8 1.7-7 1.5-8.5.6-.6-.4-.6-1.3 0-1.7Z',
    ],
    s: ['M12 6.1v13.3'],
    sw: 1.6,
  },
  layers: {
    f: ['M12 2.8 21 7.5 12 12.2 3 7.5Z'],
    s: ['M3 12.5l9 4.7 9-4.7', 'M12 17.2V12.2'],
    sw: 1.6,
  },
  // ── Data / persistence ──────────────────────────────────────────
  database: {
    f: ['M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6c0 1.7-3.6 3-8 3S4 7.7 4 6Z'],
    s: ['M4 12a8 3 0 0 0 16 0', 'M4 18a8 3 0 0 0 16 0'],
    sw: 1.6,
  },
  // ── Metrics / comparison ────────────────────────────────────────
  chart: {
    f: [
      'M4.5 13.5h3.4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
      'M10.3 8h3.4a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-3.4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z',
      'M16.1 3.5h3.4a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-3.4a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z',
    ],
  },
  // ── Safety / testing ────────────────────────────────────────────
  shield: {
    f: ['M12 2.5 19.2 5v6.2c0 4.9-3.1 8.3-7.2 10.3-4.1-2-7.2-5.4-7.2-10.3V5Z'],
    s: ['M8.6 11.8l2.3 2.3 4.6-4.6'],
    sw: 2,
  },
  // ── Internationalization ────────────────────────────────────────
  globe: {
    s: [
      'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z',
      'M3.5 12h17',
      'M12 3.5c2.3 2.2 3.5 5.1 3.5 8.5s-1.2 6.3-3.5 8.5c-2.3-2.2-3.5-5.1-3.5-8.5S9.7 5.7 12 3.5Z',
    ],
    sw: 1.6,
  },
  // ── Ecosystem / integrations ────────────────────────────────────
  grid: {
    f: [
      'M4 4h6.5A1.5 1.5 0 0 1 12 5.5V12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 12V5.5A1.5 1.5 0 0 1 4 4Z',
      'M14 4h6a1.5 1.5 0 0 1 1.5 1.5V12A1.5 1.5 0 0 1 20 13.5h-6a1.5 1.5 0 0 1-1.5-1.5V5.5A1.5 1.5 0 0 1 14 4Z',
      'M4 13.5h6.5a1.5 1.5 0 0 1 1.5 1.5V18.5A1.5 1.5 0 0 1 10.5 20H4a1.5 1.5 0 0 1-1.5-1.5V15A1.5 1.5 0 0 1 4 13.5Z',
      'M14 13.5h6a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a1.5 1.5 0 0 1 1.5-1.5Z',
    ],
  },
  // ── Community / social ──────────────────────────────────────────
  star: {
    f: ['M12 2.8l2.2 4.9 5.3.6-3.9 3.6 1.1 5.3-4.7-2.7-4.7 2.7 1.1-5.3-3.9-3.6 5.3-.6Z'],
  },
  github: {
    f: ['M12 .6C5.7.6.6 5.8.6 12.1c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.5v-1.9c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.3 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.1 1.2a10.7 10.7 0 0 1 5.7 0c2.1-1.5 3.1-1.2 3.1-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3 0 4.3-2.7 5.3-5.2 5.6.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.5 4.5-1.5 7.8-5.8 7.8-10.9C23.4 5.8 18.3.6 12 .6Z'],
  },
  // ── E-commerce demo ─────────────────────────────────────────────
  cart: {
    s: ['M2.5 4h2.2L7 13.2a1.2 1.2 0 0 0 1.2 1h9.3a1.2 1.2 0 0 0 1.2-.9L21 6.7H7.5'],
    f: [
      'M10.6 17.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z',
      'M16.8 17.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z',
    ],
    sw: 1.8,
  },
  home: {
    f: ['M12 3.4l9 7.1v9a1.5 1.5 0 0 1-1.5 1.5h-4.6v-5.6h-5.8V21H4.5A1.5 1.5 0 0 1 3 19.5v-9Z'],
  },
  // ── Tooling ─────────────────────────────────────────────────────
  wrench: {
    f: ['M15 5.2a5.2 5.2 0 0 0-7.1 6.6L3 16.7a2.2 2.2 0 0 0 3.1 3.1l4.9-4.9a5.2 5.2 0 0 0 6.6-7.1l-2.7 2.7-2.7-.5-.5-2.7Z'],
  },
  route: {
    f: ['M5.5 5.5a2 2 0 1 0 0 .01Z', 'M18.5 18.5a2 2 0 1 0 0 .01Z'],
    s: ['M7.5 5.5h8a3 3 0 0 1 3 3v10'],
    sw: 2,
  },
  terminal: {
    f: ['M3 4.5h18A1.5 1.5 0 0 1 22.5 6v12a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18V6A1.5 1.5 0 0 1 3 4.5Z'],
    s: ['M6.5 9 10 12l-3.5 3', 'M12 16h5.5'],
    sw: 1.8,
  },
  code: {
    s: ['M8.8 7.2 4 12l4.8 4.8', 'M15.2 7.2 20 12l-4.8 4.8'],
    sw: 2.2,
  },
  // ── No unnecessary JS shipped ───────────────────────────────────
  'js-off': {
    s: ['M8.8 7.2 4 12l4.8 4.8', 'M15.2 7.2 20 12l-4.8 4.8', 'M4.5 4.5l15 15'],
    sw: 2.2,
  },
  // ── Actions ─────────────────────────────────────────────────────
  'arrow-right': {
    s: ['M4 12h15', 'M13.5 6.5 19 12l-5.5 5.5'],
    sw: 2.2,
  },
  search: {
    s: ['M10.8 4.3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z', 'M15.6 15.6 20.8 20.8'],
    sw: 2,
  },
  menu: {
    s: ['M4 6.5h16', 'M4 12h16', 'M4 17.5h16'],
    sw: 2.2,
  },
  check: {
    s: ['M4.5 12.6 9.4 17.5 19.5 6.5'],
    sw: 2.4,
  },
  x: {
    s: ['M6 6l12 12', 'M18 6 6 18'],
    sw: 2.4,
  },
  clock: {
    s: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z', 'M12 7.5V12l3.2 2'],
    sw: 1.8,
  },
  info: {
    s: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z'],
    f: ['M11 10.4h2v6.6h-2Z', 'M11 7.2h2v2.2h-2Z'],
    sw: 1.8,
  },
  loader: {
    s: ['M12 3.5a8.5 8.5 0 0 1 8.5 8.5'],
    sw: 2.4,
  },
  refresh: {
    s: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4v4h-4'],
    sw: 2,
  },
  square: {
    s: ['M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z'],
    sw: 2,
  },
  play: {
    f: ['M7 4.4v15.2c0 .8.9 1.3 1.6.9l11.6-7.6c.6-.4.6-1.3 0-1.7L8.6 3.5c-.7-.4-1.6.1-1.6.9Z'],
  },
  // ── User interaction ────────────────────────────────────────────
  pointer: {
    f: ['M22 10 12 20 9 17 2 21 4 14 1 11 11 1z'],
  },
};

// Neon gradient at 135° per the "AstraJS Neon Space Glow" spec:
// violet → purple-blue → blue → cyan.
const GRADIENT =
  '<defs>' +
  '<linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">' +
  '<stop offset="0" stop-color="#C95CFF"/>' +
  '<stop offset=".45" stop-color="#7B5CFF"/>' +
  '<stop offset=".75" stop-color="#4D8CFF"/>' +
  '<stop offset="1" stop-color="#00D9FF"/>' +
  '</linearGradient>' +
  '</defs>';

const svgCache: Record<string, string> = {};

/**
 * Neon-tube rendering:
 *  - filled shapes: dark navy core (#080B2A) + gradient neon outline + bright rim
 *  - stroked shapes: thick gradient tube + thin bright core line
 *  - a small white glint on the upper-left of filled icons
 */
const buildSvg = (name: string, color?: string): string => {
  const def = DEFS[name] ?? DEFS['info'];
  const sw = def.sw ?? 2;
  const tube = 3.2;
  let body = '';

  if (color) {
    for (const d of def.f ?? []) {
      body += `<path fill="${color}" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
    }
    for (const d of def.s ?? []) {
      body += `<path fill="none" stroke="${color}" stroke-width="${sw + 1}" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
    }
  } else {
    body = GRADIENT;
    for (const d of def.f ?? []) {
      body += `<path fill="#080B2A" fill-opacity="0.92" stroke="url(#g)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
      body += `<path fill="none" stroke="#D8C7FF" stroke-width="1" stroke-opacity="0.95" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
    }
    for (const d of def.s ?? []) {
      body += `<path fill="none" stroke="url(#g)" stroke-width="${tube}" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
      body += `<path fill="none" stroke="#D8C7FF" stroke-width="1" stroke-opacity="0.95" stroke-linejoin="round" stroke-linecap="round" d="${d}"/>`;
    }
    if ((def.f?.length ?? 0) > 0) {
      body += '<circle cx="8" cy="7" r="1.15" fill="#FFFFFF" fill-opacity="0.9"/>';
    }
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + body + '</svg>'
  );
};

const iconSrc = (name: string, color?: string): string => {
  // Each icon is a standalone SVG document, so a fixed gradient id is safe.
  const cacheKey = color ? `${name}|${color}` : name;
  if (!svgCache[cacheKey]) {
    svgCache[cacheKey] = buildSvg(name, color);
  }
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgCache[cacheKey]);
};

export interface IconProps {
  name: IconName | string;
  /** Rendered size in px (width and height). Default 20. */
  size?: number;
  /** Extra CSS classes appended to the <img>. */
  cls?: string;
  /** Flat color override (e.g. '#fff') instead of the flow gradient. */
  color?: string;
}

export const Icon = component((props: IconProps) => {
  const size = props.size ?? 20;
  return (
    <img
      class={`astra-icon${props.cls ? ' ' + props.cls : ''}`}
      src={iconSrc(props.name, props.color)}
      alt=""
      aria-hidden="true"
      style={`width:${size}px;height:${size}px;display:inline-block;vertical-align:-2px;flex-shrink:0;filter:drop-shadow(0 0 4px rgba(168,85,255,.95)) drop-shadow(0 0 12px rgba(117,76,255,.65)) drop-shadow(0 0 26px rgba(49,92,255,.35))`}
    />
  );
});
