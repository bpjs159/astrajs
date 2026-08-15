/**
 * AI 02 — Entry
 */
import { ToolsApp } from './app.js';

const root = document.getElementById('app');
if (root) root.appendChild(ToolsApp({}) as unknown as Node);
