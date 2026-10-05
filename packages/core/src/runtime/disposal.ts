/**
 * astrajs.dev/core — Effect Disposal Registry
 *
 * Tracks which effects are associated with which DOM nodes so they can
 * be disposed when the node is removed from the document.
 *
 * ## Problem
 *
 * Bindings like `bindText`, `bindAttr`, etc. create effects that subscribe
 * to reactive stores. When a DOM node is removed (e.g., by `bindConditional`
 * or `bindDynamicList`), those effects remain subscribed — a memory leak.
 *
 * ## Solution
 *
 * Each binding registers its effect's dispose function against the DOM node
 * it targets. The MutationObserver in `lifecycle.ts` calls `disposeNodeEffects`
 * when a node is removed, cleaning up all associated effects.
 */

import type { DisposableEffect } from './effect.js';

// ─── Node → Effects Registry ─────────────────────────────────────────────────

/**
 * Maps DOM nodes to their associated effect dispose functions.
 * Uses WeakMap so nodes can be garbage collected once all references
 * (including effects) are released.
 */
const nodeEffects = new WeakMap<Node, Set<() => void>>();

/**
 * Registers an effect's dispose function against a DOM node.
 * When the node is removed from the document, all registered
 * dispose functions are called.
 *
 * @param node — The DOM node the effect is bound to.
 * @param effect — The disposable effect to register.
 */
export function registerNodeEffect(node: Node, effect: DisposableEffect): void {
  let effects = nodeEffects.get(node);
  if (!effects) {
    effects = new Set();
    nodeEffects.set(node, effects);
  }
  effects.add(effect.dispose.bind(effect));
}

/**
 * Disposes all effects associated with a DOM node and its descendants.
 * Called by the MutationObserver when a node is removed from the document.
 *
 * @param node — The removed DOM node.
 */
export function disposeNodeEffects(node: Node): void {
  // Dispose effects on this node
  const effects = nodeEffects.get(node);
  if (effects) {
    for (const dispose of effects) {
      dispose();
    }
    nodeEffects.delete(node);
  }

  // Recursively dispose effects on descendants
  if (node instanceof HTMLElement || node instanceof DocumentFragment) {
    const children = node.querySelectorAll('*');
    for (const child of children) {
      const childEffects = nodeEffects.get(child);
      if (childEffects) {
        for (const dispose of childEffects) {
          dispose();
        }
        nodeEffects.delete(child);
      }
    }
  }
}

/**
 * Disposes all effects associated with a DOM node (but NOT descendants).
 * Useful when you want to clean up a specific binding without affecting
 * child components.
 *
 * @param node — The DOM node whose effects to dispose.
 */
export function disposeNodeEffectsShallow(node: Node): void {
  const effects = nodeEffects.get(node);
  if (effects) {
    for (const dispose of effects) {
      dispose();
    }
    nodeEffects.delete(node);
  }
}

/**
 * Checks if a node has any registered effects.
 * Useful for debugging and testing.
 *
 * @param node — The DOM node to check.
 * @returns True if the node has registered effects.
 */
export function hasNodeEffects(node: Node): boolean {
  const effects = nodeEffects.get(node);
  return effects !== undefined && effects.size > 0;
}
