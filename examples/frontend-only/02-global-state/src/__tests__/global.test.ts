import { describe, it, expect } from 'vitest';
import { appStore, LikesDislikes } from '../main.js';

describe('Global State', () => {
  it('appStore starts with all values at 0', () => {
    expect(appStore.likes).toBe(0);
    expect(appStore.dislikes).toBe(0);
    expect(appStore.comments).toBe(0);
  });

  it('appStore mutations work reactively', () => {
    appStore.likes = 5;
    expect(appStore.likes).toBe(5);
    appStore.likes = 0; // reset
  });
});
