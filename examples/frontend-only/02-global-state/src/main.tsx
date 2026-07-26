/**
 * 02 — Global State · Likes/Dislikes
 *
 * A single store shared across multiple "components".
 * Mutations in one update all others instantly — O(1).
 */
import { store, effect } from '@astrajs/core';

export const appStore = store({ likes: 0, dislikes: 0, comments: 0 });

function total() { return appStore.likes + appStore.dislikes + appStore.comments; }

export const LikesDislikes = () => {
  const el = document.createElement('div');
  el.innerHTML = [
    '<div class="card" id="likes-card"><h3>?? Likes</h3><div class="value" id="likes-val">'+appStore.likes+'</div>',
    '<button class="btn-up" data-act="likes-up">+1 Like</button>',
    '<button class="btn-down" data-act="likes-down">-1 Like</button></div>',
    '<div class="card" id="dislikes-card"><h3>?? Dislikes</h3><div class="value" id="dislikes-val">'+appStore.dislikes+'</div>',
    '<button class="btn-up" data-act="dislikes-up">+1 Dislike</button>',
    '<button class="btn-down" data-act="dislikes-down">-1 Dislike</button></div>',
    '<div class="card" id="comments-card"><h3>?? Comments</h3><div class="value" id="comments-val">'+appStore.comments+'</div>',
    '<button class="btn-up" data-act="comments-up">+1 Comment</button>',
    '<button class="btn-down" data-act="comments-down">-1 Comment</button></div>',
    '<div class="total-box"><h3>Total Interactions</h3><div class="value" id="total-val">'+total()+'</div></div>',
  ].join('');
  el.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', () => {
    const a = (b as HTMLButtonElement).dataset.act!;
    if (a==='likes-up') appStore.likes++; if (a==='likes-down') appStore.likes=Math.max(0,appStore.likes-1);
    if (a==='dislikes-up') appStore.dislikes++; if (a==='dislikes-down') appStore.dislikes=Math.max(0,appStore.dislikes-1);
    if (a==='comments-up') appStore.comments++; if (a==='comments-down') appStore.comments=Math.max(0,appStore.comments-1);
  }));
  effect(()=>{const e=document.getElementById('likes-val');if(e)e.textContent=String(appStore.likes)});
  effect(()=>{const e=document.getElementById('dislikes-val');if(e)e.textContent=String(appStore.dislikes)});
  effect(()=>{const e=document.getElementById('comments-val');if(e)e.textContent=String(appStore.comments)});
  effect(()=>{const e=document.getElementById('total-val');if(e)e.textContent=String(total())});
  document.getElementById('grid')!.appendChild(el);
  return el;
};
