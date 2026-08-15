// Minimal Angular-in-jsdom probe (legacy-decorator call form, no TS syntax).
import './env.mjs';
import 'zone.js';
import '@angular/compiler';
import { Component, NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

const { document } = globalThis;
document.body.innerHTML = '<div id="app"></div>';
const host = document.createElement('app-root');
document.getElementById('app').appendChild(host);

let appComp;

const AppComponent = Component({
  standalone: false,
  selector: 'app-root',
  template:
    '<table><tbody><tr *ngFor="let r of rows"><td>{{r.id}}</td><td>{{r.name}}</td><td>{{r.email}}</td><td>{{r.score}}</td></tr></tbody></table>',
})(
  class AppComponent {
    rows = [];
    constructor() {
      appComp = this;
    }
  },
);

const AppModule = NgModule({
  imports: [BrowserModule, CommonModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})(class AppModule {});

console.log('bootstrapping…');
const platform = platformBrowserDynamic();
const modRef = await platform.bootstrapModule(AppModule);
const appRef = modRef.injector.get(ApplicationRef);
console.log('bootstrapped ✓');

const R = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: i, name: `User ${i}`, email: 'e@x.dev', score: i }));

const app = document.getElementById('app');
appComp.rows = R(3);
appRef.tick();
console.log('after render, trs:', app.querySelectorAll('tr').length, '| text:', app.textContent.slice(0, 80));

appComp.rows = appComp.rows.map((r, idx) => (idx === 1 ? { ...r, name: 'UPDATED' } : r));
appRef.tick();
console.log('after update, trs:', app.querySelectorAll('tr').length, '| text:', app.textContent.slice(0, 80));

appComp.rows = [...appComp.rows, ...R(2).map((r) => ({ ...r, id: 100 + r.id }))];
appRef.tick();
console.log('after append, trs:', app.querySelectorAll('tr').length);

appComp.rows = appComp.rows.slice(1);
appRef.tick();
console.log('after remove, trs:', app.querySelectorAll('tr').length);
