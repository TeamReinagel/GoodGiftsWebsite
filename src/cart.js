import { writable, derived } from 'svelte/store';
import { findItem, MAX_QTY_PER_ITEM } from '../shared/catalog.js';

const KEY = 'gg-cart-v1';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    // Drop anything no longer in the catalog.
    return Array.isArray(saved) ? saved.filter((line) => findItem(line.id)) : [];
  } catch {
    return [];
  }
}

export const cart = writable(load());

cart.subscribe((lines) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private browsing or storage blocked: the cart still works for this visit.
  }
});

const sameLine = (a, id, option) => a.id === id && (a.option ?? null) === (option ?? null);

export function addToCart(id, option = null, quantity = 1) {
  cart.update((lines) => {
    const existing = lines.find((l) => sameLine(l, id, option));
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_QTY_PER_ITEM);
      return [...lines];
    }
    return [...lines, { id, option, quantity }];
  });
}

export function setQuantity(id, option, quantity) {
  cart.update((lines) =>
    lines
      .map((l) => (sameLine(l, id, option) ? { ...l, quantity: Math.min(quantity, MAX_QTY_PER_ITEM) } : l))
      .filter((l) => l.quantity > 0)
  );
}

export const clearCart = () => cart.set([]);

export const cartCount = derived(cart, (lines) => lines.reduce((n, l) => n + l.quantity, 0));

export const cartSubtotal = derived(cart, (lines) =>
  lines.reduce((sum, l) => sum + (findItem(l.id)?.price ?? 0) * l.quantity, 0)
);
