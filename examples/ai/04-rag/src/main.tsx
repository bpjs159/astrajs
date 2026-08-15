/**
 * AI 04 — Entry
 */
import { RagApp } from './app.js';

const root = document.getElementById('app');
if (root) root.appendChild(RagApp({}) as unknown as Node);
