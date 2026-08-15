/**
 * AI 01 — Entry
 */
import { ChatApp } from './app.js';

const root = document.getElementById('app');
if (root) root.appendChild(ChatApp({}) as unknown as Node);
