import { component, store, onMount } from '@astrajs/core';

const logs = store({ items: [] as string[] });
function addLog(msg: string, cls: string) { logs.items = [...logs.items, '[' + new Date().toLocaleTimeString() + '] ' + msg + ' (' + cls + ')']; }

const Timer = component(() => {
  const st = store({ seconds: 0 });

  onMount(() => {
    addLog('Timer mounted', 'mount');
    const id = setInterval(() => st.seconds++, 1000);
    return () => { clearInterval(id); addLog('Timer unmounted (cleanup ran)', 'unmount'); };
  });

  return (
    <div>
      <div class="timer">{String(Math.floor(st.seconds / 60)).padStart(2,'0')}:{String(st.seconds % 60).padStart(2,'0')}</div>
      <p style="color:#64748b;font-size:.8rem;">onMount started the interval · unmount clears it</p>
    </div>
  );
});

const App = component(() => {
  const st = store({ show: true });

  return (
    <div class="card">
      <h1>onMount / Unmount</h1>
      <p class="subtitle">Lifecycle hooks tied to DOM insertion/removal</p>
      {st.show ? <Timer /> : <p style="color:#64748b;padding:20px;">Timer hidden — unmount ran cleanup</p>}
      <button class="btn btn-toggle" onClick={() => st.show = !st.show}>{st.show ? 'Hide' : 'Show'} Timer</button>
      <button class="btn btn-reset" onClick={() => logs.items = []}>Clear Log</button>
      <div class="log">{logs.items.map(l => <div class={l.includes('mount') ? 'mount' : l.includes('unmount') ? 'unmount' : 'tick'}>{l}</div>)}</div>
    </div>
  );
});

document.getElementById('app')!.appendChild(App({}));
