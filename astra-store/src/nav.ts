/**
 * Router helpers shared by components and pages (no circular imports).
 */
import { navigate as doNavigate } from './client-state.js';

export function navigate(path: string): void {
  doNavigate(path);
}

export function currentPath(): string {
  return (globalThis as Record<string, unknown>).__astra_ssr_path
    ? String((globalThis as Record<string, unknown>).__astra_ssr_path)
    : window.location.pathname;
}
