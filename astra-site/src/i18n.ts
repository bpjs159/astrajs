/**
 * astra-site — i18n
 *
 * Módulo built-in de internacionalización del sitio oficial.
 * La locale vive en un store reactivo: cambiar el selector del header
 * actualiza quirúrgicamente cada nodo traducido (nav, hero, stats,
 * footer) sin recargar la página.
 */
import { createI18n } from '@astrajs/i18n';
import { SITE_STRINGS } from './i18n-site.js';
import { SIDEBAR_STRINGS } from './i18n-sidebar.js';
import { DOCS_STRINGS } from './i18n-docs.js';
import { INTRO_STRINGS } from './i18n-intro.js';
import { TESTING_STRINGS } from './i18n-testing.js';
import { FUND_STRINGS } from './i18n-fundamentals.js';
import { SERVERDATA_STRINGS } from './i18n-serverdata.js';
import { ROUTER_STRINGS } from './i18n-router.js';
import { RENDERING_STRINGS } from './i18n-rendering.js';
import { CLI_STRINGS } from './i18n-cli.js';
import { ADVANCED_STRINGS } from './i18n-advanced.js';
import { COMPARISON_STRINGS } from './i18n-comparison.js';
import { INTEG_STRINGS } from './i18n-integrations.js';
import { I18NDOC_STRINGS } from './i18n-i18ndoc.js';
import { EXAMPLES_STRINGS } from './i18n-examples.js';
import { EXAMPLES_DATA_STRINGS } from './i18n-examples-data.js';
import { DEPLOY_STRINGS } from './i18n-deployment.js';

const BASE: Record<string, Record<string, string>> = {
    en: {
      'nav.getStarted': 'Get Started',
      'nav.docs': 'Docs',
      'hero.tagline1': 'The Full-Stack Framework',
      'hero.tagline2': 'that Ships Zero ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS removes the Virtual DOM and compiles your TypeScript into direct DOM mutations. Faster, lighter, simpler.',
      'hero.start': 'Get started now',
      'hero.github': 'View on GitHub',
      'hero.discover': 'Discover more',
      'stats.unused': 'of unnecessary JS',
      'stats.reactivity': 'Reactivity',
      'stats.inference': 'Type Inference',
      'stats.builtin': 'Built-in',
      'dash.panel.orders': 'Recent orders',
      'dash.panel.products': 'Products',
      'dash.panel.customers': 'Customers',
      'dash.panel.analytics': 'Sales per day — last 20 days',
      'dash.panel.settings': 'Preferences',
      'dash.status.paid': 'Paid',
      'dash.status.pending': 'Pending',
      'dash.settings.notif': 'Notifications',
      'dash.settings.mail': 'Weekly email summary',
      'dash.settings.dark': 'Dark theme',
      'cb.copy': 'Copy',
      'cb.copied': 'Copied',
    },
    es: {
      'nav.getStarted': 'Comenzar',
      'nav.docs': 'Docs',
      'hero.tagline1': 'El Framework Full-Stack',
      'hero.tagline2': 'que envía Cero ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS elimina el Virtual DOM y compila tu código TypeScript a mutaciones directas del DOM. Más rápido, más ligero, más simple.',
      'hero.start': 'Comenzar ahora',
      'hero.github': 'Ver en GitHub',
      'hero.discover': 'Descubre más',
      'stats.unused': 'JS innecesario',
      'stats.reactivity': 'Reactividad',
      'stats.inference': 'Inferencia de tipos',
      'stats.builtin': 'Incluido',
      'dash.panel.orders': 'Pedidos recientes',
      'dash.panel.products': 'Productos',
      'dash.panel.customers': 'Clientes',
      'dash.panel.analytics': 'Ventas por día — últimos 20 días',
      'dash.panel.settings': 'Preferencias',
      'dash.status.paid': 'Pagado',
      'dash.status.pending': 'Pendiente',
      'dash.settings.notif': 'Notificaciones',
      'dash.settings.mail': 'Resumen semanal por email',
      'dash.settings.dark': 'Tema oscuro',
      'cb.copy': 'Copiar',
      'cb.copied': 'Copiado',
    },
    pt: {
      'nav.getStarted': 'Começar',
      'nav.docs': 'Docs',
      'hero.tagline1': 'O Framework Full-Stack',
      'hero.tagline2': 'que envia Zero ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'O AstraJS elimina o Virtual DOM e compila seu TypeScript em mutações diretas do DOM. Mais rápido, mais leve, mais simples.',
      'hero.start': 'Começar agora',
      'hero.github': 'Ver no GitHub',
      'hero.discover': 'Descubra mais',
      'stats.unused': 'JS desnecessário',
      'stats.reactivity': 'Reatividade',
      'stats.inference': 'Inferência de tipos',
      'stats.builtin': 'Incluído',
    },
    fr: {
      'nav.getStarted': 'Commencer',
      'nav.docs': 'Docs',
      'hero.tagline1': 'Le framework Full-Stack',
      'hero.tagline2': 'qui n’expédie aucun ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS supprime le Virtual DOM et compile votre TypeScript en mutations directes du DOM. Plus rapide, plus léger, plus simple.',
      'hero.start': 'Commencer maintenant',
      'hero.github': 'Voir sur GitHub',
      'hero.discover': 'En savoir plus',
      'stats.unused': 'de JS inutile',
      'stats.reactivity': 'Réactivité',
      'stats.inference': 'Inférence de types',
      'stats.builtin': 'Inclus',
    },
    it: {
      'nav.getStarted': 'Inizia',
      'nav.docs': 'Docs',
      'hero.tagline1': 'Il framework Full-Stack',
      'hero.tagline2': 'che spedisce Zero ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS elimina il Virtual DOM e compila il tuo TypeScript in mutazioni dirette del DOM. Più veloce, più leggero, più semplice.',
      'hero.start': 'Inizia ora',
      'hero.github': 'Vedi su GitHub',
      'hero.discover': 'Scopri di più',
      'stats.unused': 'di JS inutile',
      'stats.reactivity': 'Reattività',
      'stats.inference': 'Inferenza dei tipi',
      'stats.builtin': 'Integrato',
    },
    de: {
      'nav.getStarted': 'Loslegen',
      'nav.docs': 'Docs',
      'hero.tagline1': 'Das Full-Stack-Framework',
      'hero.tagline2': 'das null ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS entfernt das Virtual DOM und kompiliert dein TypeScript zu direkten DOM-Mutationen. Schneller, leichter, einfacher.',
      'hero.start': 'Jetzt starten',
      'hero.github': 'Auf GitHub ansehen',
      'hero.discover': 'Mehr entdecken',
      'stats.unused': 'unnötiges JS',
      'stats.reactivity': 'Reaktivität',
      'stats.inference': 'Typinferenz',
      'stats.builtin': 'Integriert',
    },
    ru: {
      'nav.getStarted': 'Начать',
      'nav.docs': 'Документация',
      'hero.tagline1': 'Фулстек-фреймворк',
      'hero.tagline2': 'отправляющий ноль ',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS убирает Virtual DOM и компилирует ваш TypeScript в прямые мутации DOM. Быстрее, легче, проще.',
      'hero.start': 'Начать сейчас',
      'hero.github': 'Смотреть на GitHub',
      'hero.discover': 'Узнать больше',
      'stats.unused': 'лишнего JS',
      'stats.reactivity': 'Реактивность',
      'stats.inference': 'Вывод типов',
      'stats.builtin': 'Встроено',
    },
    ja: {
      'nav.getStarted': 'はじめる',
      'nav.docs': 'ドキュメント',
      'hero.tagline1': 'フルスタックフレームワーク',
      'hero.tagline2': 'ゼロの',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJSはVirtual DOMを排除し、あなたのTypeScriptをDOMへの直接的なミューテーションにコンパイルします。より速く、より軽く、よりシンプルに。',
      'hero.start': '今すぐはじめる',
      'hero.github': 'GitHubで見る',
      'hero.discover': 'もっと見る',
      'stats.unused': '不要なJS',
      'stats.reactivity': 'リアクティビティ',
      'stats.inference': '型推論',
      'stats.builtin': '内蔵',
    },
    'zh-CN': {
      'nav.getStarted': '开始使用',
      'nav.docs': '文档',
      'hero.tagline1': '全栈框架',
      'hero.tagline2': '零',
      'hero.tagline.js': 'JavaScript',
      'hero.sub':
        'AstraJS 移除 Virtual DOM，将你的 TypeScript 编译为对 DOM 的直接变更。更快、更轻、更简单。',
      'hero.start': '立即开始',
      'hero.github': '在 GitHub 上查看',
      'hero.discover': '了解更多',
      'stats.unused': '多余的 JS',
      'stats.reactivity': '响应性',
      'stats.inference': '类型推断',
      'stats.builtin': '内置',
    },
};

const LOCALES = ['en', 'es', 'pt', 'fr', 'it', 'de', 'ru', 'ja', 'zh-CN'];

/** Mezcla el catálogo base con los strings de sitio, sidebar y docs. */
const messages: Record<string, Record<string, string>> = {};
for (const loc of LOCALES) {
  messages[loc] = {
    ...BASE[loc],
    ...(SITE_STRINGS[loc] ?? {}),
    ...(SIDEBAR_STRINGS[loc] ?? {}),
    ...(DOCS_STRINGS[loc] ?? {}),
    ...(INTRO_STRINGS[loc] ?? {}),
    ...(TESTING_STRINGS[loc] ?? {}),
    ...(FUND_STRINGS[loc] ?? {}),
    ...(SERVERDATA_STRINGS[loc] ?? {}),
    ...(ROUTER_STRINGS[loc] ?? {}),
    ...(RENDERING_STRINGS[loc] ?? {}),
    ...(CLI_STRINGS[loc] ?? {}),
    ...(ADVANCED_STRINGS[loc] ?? {}),
    ...(COMPARISON_STRINGS[loc] ?? {}),
    ...(INTEG_STRINGS[loc] ?? {}),
    ...(I18NDOC_STRINGS[loc] ?? {}),
    ...(EXAMPLES_STRINGS[loc] ?? {}),
    ...(EXAMPLES_DATA_STRINGS[loc] ?? {}),
    ...(DEPLOY_STRINGS[loc] ?? {}),
  };
}

export const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  messages,
});
