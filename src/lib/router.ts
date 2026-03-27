export function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export function navigate(path: string): void {
  window.location.href = path;
}
