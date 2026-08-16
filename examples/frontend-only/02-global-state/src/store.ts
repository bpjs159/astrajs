/**
 * 02 — Global State · Shared Store
 *
 * A single reactive store imported by multiple components.
 * When any component mutates the store, all components that
 * read from it update automatically via `component()`.
 */
import { store } from 'astrajs.dev/core';

export const appStore = store({
  likes: 0,
  dislikes: 0,
  comments: 0,
});

/** Derived value — computed from the same store. */
export const total = () => appStore.likes + appStore.dislikes + appStore.comments;
