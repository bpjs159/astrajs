import { describe, it, expect } from 'vitest';
import { appStore, total } from '../store.js';
import { LikesDislikes } from '../likes.js';
import { TotalBox } from '../total.js';

describe('Global State', () => {
  it('appStore is shared — mutations affect total', () => {
    appStore.likes = 5;
    appStore.dislikes = 2;
    appStore.comments = 3;
    expect(total()).toBe(10);
    appStore.likes = 0; appStore.dislikes = 0; appStore.comments = 0;
  });

  it('components are importable', () => {
    const a = LikesDislikes({});
    const b = TotalBox({});
    expect(a).toBeInstanceOf(HTMLElement);
    expect(b).toBeInstanceOf(HTMLElement);
  });
});
