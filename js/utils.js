export const $ = (sel, root=document) => root.querySelector(sel);

export function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

export function uid(prefix = ""){
  return prefix + Math.random().toString(36).slice(2, 11);
}

export function toast(msg, ms=1400){
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("show"), ms);
}

export function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 800);
}

export async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  return res.json();
}

/** Clamp a number between min and max (inclusive). */
export function clamp(val, min, max){
  return Math.max(min, Math.min(max, val));
}

/** Generate a unique ID with an optional string prefix. Uses crypto.randomUUID() when available. */
export function uid(prefix = ""){
  const uuid = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}${uuid}`;
}
