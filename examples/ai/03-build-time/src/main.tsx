/**
 * AI 03 — Entry
 */
import { BuildTimeApp } from './app.js';

const root = document.getElementById('app');
if (root) root.appendChild(BuildTimeApp({}) as unknown as Node);
