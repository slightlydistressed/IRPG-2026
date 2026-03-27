export async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function downloadTextFile(filename: string, content: string, mime = "application/json"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}


export function getBasePath(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return base === "" ? "/" : base;
}

export function withBasePath(path: string): string {
  const normalized = path.replace(/^\//, "");
  const base = getBasePath();
  return base === "/" ? `/${normalized}` : `${base}/${normalized}`;
}
