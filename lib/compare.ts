"use client";

// Stone comparison list — localStorage only, mirrors the favorites pattern.
const KEY = "dija_compare";
export const MAX_COMPARE = 3;

export interface CompareEntry {
  id: string;
  n: string;
}

export function readCompare(): CompareEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: CompareEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event("dija-compare-change"));
}

export function toggleCompare(id: string, n: string) {
  const list = readCompare();
  const idx = list.findIndex((e) => e.id === id);
  if (idx !== -1) {
    list.splice(idx, 1);
  } else {
    if (list.length >= MAX_COMPARE) return;
    list.push({ id, n });
  }
  write(list);
}

export function removeCompare(id: string) {
  write(readCompare().filter((e) => e.id !== id));
}

export function clearCompare() {
  write([]);
}
