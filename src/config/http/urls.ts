export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function makeApiUrl(path: string): string {
  if (!API_BASE) throw new Error("Missing NEXT_PUBLIC_API_URL");
  return new URL(path, API_BASE).toString();
}
