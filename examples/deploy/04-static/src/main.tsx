/**
 * 04 — Static Deploy (SSG) · Entry
 */
import { StaticApp } from './app.js';

const root = document.getElementById('app');
if (root) root.appendChild(StaticApp({}) as unknown as Node);
