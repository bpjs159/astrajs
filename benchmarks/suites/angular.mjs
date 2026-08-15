// Angular — idiomatic NgModule + *ngFor template + default (zone) change
// detection. Benchmark ops run OUTSIDE NgZone, so each op calls
// ApplicationRef.tick() explicitly — the same full-tree change-detection
// cycle Zone.js schedules after every async event in a real app.
import 'zone.js';
import '@angular/compiler';
import * as Angular from '@angular/core';
import { Component, NgModule, ApplicationRef, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

enableProdMode();

export const meta = {
  name: 'Angular',
  version: Angular.VERSION?.full ?? '19.x',
};

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

const platform = platformBrowserDynamic();

export default async function createAngular() {
  const rootEl = () => document.getElementById('app');

  // Angular bootstraps into an element matching the component selector.
  const host = document.createElement('app-root');
  rootEl().appendChild(host);

  const modRef = await platform.bootstrapModule(AppModule);
  const appRef = modRef.injector.get(ApplicationRef);

  return {
    name: meta.name,
    version: meta.version,

    render10k(rows) {
      appComp.rows = rows;
      appRef.tick();
    },

    updateRow(i, name) {
      appComp.rows = appComp.rows.map((r, idx) => (idx === i ? { ...r, name } : r));
      appRef.tick();
    },

    append1k(rows) {
      appComp.rows = [...appComp.rows, ...rows];
      appRef.tick();
    },

    remove1k() {
      appComp.rows = appComp.rows.slice(1000);
      appRef.tick();
    },

    replaceAll(rows) {
      appComp.rows = rows;
      appRef.tick();
    },

    rowCount() {
      return rootEl().querySelectorAll('tr').length;
    },

    destroy() {
      appRef.destroy();
      rootEl().textContent = '';
    },
  };
}
