/**
 * astra-tasks — i18n compacta (es/en/pt).
 */
import { store } from 'astrajs.dev/core';

export const LOCALES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
] as const;

const T: Record<string, Record<string, string>> = {
  es: {
    'hero.title': 'Tablero colaborativo',
    'hero.sub': 'Mueve tarjetas con mutaciones optimistas (la UI cambia al instante y revierte si el servidor falla). Abre dos pestañas: el tablero se sincroniza solo con autoSync.',
    'hero.sync': 'sincronizado',
    'hero.syncing': 'sincronizando…',
    'fail.label': 'Simular fallo del servidor',
    'col.todo': 'Pendiente',
    'col.doing': 'En curso',
    'col.done': 'Hecho',
    'card.new': 'Nueva tarjeta',
    'card.newSub': 'serverForm: validación en cliente y servidor, isSubmitting reactivo y errores tipados del RPC.',
    'card.title': 'Título',
    'card.desc': 'Descripción',
    'card.create': 'Crear tarjeta',
    'card.creating': 'Creando…',
    'card.move': 'mover →',
    'card.back': '← mover',
    'card.delete': 'borrar',
    'toast.rollback': 'Servidor rechazó el cambio — rollback aplicado.',
    'toast.moved': 'Cambio confirmado por el servidor.',
    'ai.title': 'Agente AI con tools',
    'ai.sub': 'El modelo llama funciones reales del tablero: pídele mover, crear o resumir. Corre en el servidor, con tool-loop.',
    'ai.placeholder': 'Ej.: mueve "Terminar docs" a Hecho',
    'ai.ask': 'Enviar',
    'ai.idle': 'esperando mensaje',
    'ai.thinking': 'pensando…',
    'ai.tools': 'tools disponibles:',
    'strip.optimistic': 'mutaciones optimistas',
    'strip.rollback': 'rollback',
    'strip.autosync': 'sync multi-pestaña',
    'strip.form': 'serverForm',
    'strip.agent': 'agente AI con tools',
    'footer': 'AstraTasks · demo de AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  en: {
    'hero.title': 'Collaborative board',
    'hero.sub': 'Move cards with optimistic mutations (the UI changes instantly and reverts if the server fails). Open two tabs: the board syncs itself with autoSync.',
    'hero.sync': 'synced',
    'hero.syncing': 'syncing…',
    'fail.label': 'Simulate server failure',
    'col.todo': 'To do',
    'col.doing': 'In progress',
    'col.done': 'Done',
    'card.new': 'New card',
    'card.newSub': 'serverForm: client + server validation, reactive isSubmitting and typed RPC errors.',
    'card.title': 'Title',
    'card.desc': 'Description',
    'card.create': 'Create card',
    'card.creating': 'Creating…',
    'card.move': 'move →',
    'card.back': '← move',
    'card.delete': 'delete',
    'toast.rollback': 'Server rejected the change — rollback applied.',
    'toast.moved': 'Change confirmed by the server.',
    'ai.title': 'AI agent with tools',
    'ai.sub': 'The model calls real board functions: ask it to move, create or summarize. Runs on the server, in a tool loop.',
    'ai.placeholder': 'e.g. move "Finish docs" to Done',
    'ai.ask': 'Send',
    'ai.idle': 'awaiting message',
    'ai.thinking': 'thinking…',
    'ai.tools': 'available tools:',
    'strip.optimistic': 'optimistic mutations',
    'strip.rollback': 'rollback',
    'strip.autosync': 'multi-tab sync',
    'strip.form': 'serverForm',
    'strip.agent': 'AI agent with tools',
    'footer': 'AstraTasks · AstraJS demo — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
  pt: {
    'hero.title': 'Quadro colaborativo',
    'hero.sub': 'Mova cartões com mutações otimistas (a UI muda na hora e reverte se o servidor falhar). Abra duas abas: o quadro sincroniza sozinho com autoSync.',
    'hero.sync': 'sincronizado',
    'hero.syncing': 'sincronizando…',
    'fail.label': 'Simular falha do servidor',
    'col.todo': 'A fazer',
    'col.doing': 'Em andamento',
    'col.done': 'Feito',
    'card.new': 'Novo cartão',
    'card.newSub': 'serverForm: validação no cliente e no servidor, isSubmitting reativo e erros tipados do RPC.',
    'card.title': 'Título',
    'card.desc': 'Descrição',
    'card.create': 'Criar cartão',
    'card.creating': 'Criando…',
    'card.move': 'mover →',
    'card.back': '← mover',
    'card.delete': 'apagar',
    'toast.rollback': 'O servidor rejeitou a mudança — rollback aplicado.',
    'toast.moved': 'Mudança confirmada pelo servidor.',
    'ai.title': 'Agente AI com tools',
    'ai.sub': 'O modelo chama funções reais do quadro: peça para mover, criar ou resumir. Roda no servidor, em tool-loop.',
    'ai.placeholder': 'Ex.: mova "Terminar docs" para Feito',
    'ai.ask': 'Enviar',
    'ai.idle': 'aguardando mensagem',
    'ai.thinking': 'pensando…',
    'ai.tools': 'tools disponíveis:',
    'strip.optimistic': 'mutações otimistas',
    'strip.rollback': 'rollback',
    'strip.autosync': 'sync multi-aba',
    'strip.form': 'serverForm',
    'strip.agent': 'agente AI com tools',
    'footer': 'AstraTasks · demo do AstraJS — Zero-VDOM, AST-compiled, Proxy-reactive',
  },
};

const localeStore = store({ code: 'es' as string });

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('tasks-locale');
  if (saved && T[saved]) localeStore.code = saved;
}

export function currentLocale(): string {
  return localeStore.code;
}

export function setLocale(code: string): void {
  if (!T[code]) return;
  localeStore.code = code;
  if (typeof localStorage !== 'undefined') localStorage.setItem('tasks-locale', code);
}

export function t(key: string): string {
  void localeStore.code;
  return T[localeStore.code]?.[key] ?? T.es[key] ?? key;
}
