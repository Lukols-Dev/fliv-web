import { ReadonlyURLSearchParams } from "next/navigation";

export function buildHrefFromSearchParams(
  pathname: string,
  current: ReadonlyURLSearchParams,
  patch: Record<string, string | number | null | undefined>
) {
  const sp = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === "") {
      sp.delete(key);
    } else {
      sp.set(key, String(value));
    }
  }

  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
