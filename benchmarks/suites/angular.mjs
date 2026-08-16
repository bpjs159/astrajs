// Angular — idiomatic NgModule + @for template + default (zone) change
// detection. Benchmark ops run OUTSIDE NgZone, so each op calls
// ApplicationRef.tick() explicitly — the same full-tree change-detection
// cycle Zone.js schedules after every async event in a real app.
//
// IMPORTANT: everything Angular-related is loaded DYNAMICALLY inside the
// factory. zone.js patches timers/event listeners GLOBALLY, so a static
// import would contaminate every other suite's measurements. Angular runs
// last, and the compiled module is cached to avoid re-JIT per iteration.
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(
  readFileSync(new URL('../node_modules/@angular/core/package.json', import.meta.url), 'utf8'),
);

export const meta = { name: 'Angular', version: pkg.version };

let cached = null;
let appComp;

async function loadAngular() {
  if (cached) return cached;

  await import('zone.js');
  await import('@angular/compiler');
  const { Component, NgModule, ApplicationRef, enableProdMode } = await import('@angular/core');
  const { BrowserModule } = await import('@angular/platform-browser');
  const { CommonModule } = await import('@angular/common');
  const { platformBrowserDynamic } = await import('@angular/platform-browser-dynamic');

  enableProdMode();

  const AppComponent = Component({
    standalone: false,
    selector: 'app-root',
    template:
      '@for (r of rows; track r.id) {' +
      '<tr (click)="bump(r)"><td>{{r.id}}</td><td>{{r.name}}</td><td>{{r.email}}</td><td>{{r.score}}</td></tr>' +
      '}' +
      '<input [value]="text" (input)="text = $any($event.target).value" />' +
      '<p>{{text}}</p>' +
      '<div class="blk" *ngIf="show"><div class="blk-row" *ngFor="let x of blkRows">{{x}}</div></div>' +
      '<div class="card" *ngFor="let c of cards"><button>+</button><span>{{c.name}}</span></div>',
  })(
    class AppComponent {
      rows = [];
      text = '';
      show = true;
      cards = [];
      blkRows = Array.from({ length: 1000 }, (_, i) => `row ${i}`);
      constructor() {
        appComp = this;
      }
      bump(r) {
        r.score++;
      }
    },
  );

  const AppModule = NgModule({
    imports: [BrowserModule, CommonModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
  })(class AppModule {});

  cached = { AppModule, ApplicationRef, platform: platformBrowserDynamic() };
  return cached;
}

export default async function createAngular() {
  const rootEl = () => document.getElementById('app');
  const { AppModule, ApplicationRef, platform } = await loadAngular();

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

    updateAll(k) {
      appComp.rows = appComp.rows.map((r) => ({ ...r, name: `User ${r.id} · v${k}` }));
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

    mount1k(rows) {
      appComp.cards = rows;
      appRef.tick();
    },

    unmount10k() {
      appComp.rows = [];
      appRef.tick();
    },

    // Real DOM click → (click) handler (runs in NgZone → auto CD).
    clickRow(i) {
      rootEl().querySelectorAll('tr')[i].click();
      appRef.tick();
    },

    setupInput() {
      // The input is already mounted by the component — nothing to do.
    },

    typeChar(ch) {
      const inputEl = rootEl().querySelector('input');
      inputEl.value += ch;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      appRef.tick();
    },

    setupToggle() {
      // The conditional block is already mounted (visible) — nothing to do.
    },

    toggleBlock() {
      appComp.show = !appComp.show;
      appRef.tick();
    },

    count(sel) {
      return rootEl().querySelectorAll(sel).length;
    },

    destroy() {
      appRef.destroy();
      rootEl().textContent = '';
    },
  };
}
