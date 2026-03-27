import { downloadTextFile, parseFileAsText } from "./utils";

export async function importJsonFile<T>(file: File): Promise<T> {
  return JSON.parse(await parseFileAsText(file)) as T;
}

export function exportJsonFile(filename: string, value: unknown): void {
  downloadTextFile(filename, JSON.stringify(value, null, 2));
}
