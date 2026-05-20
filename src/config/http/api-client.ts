import { makeApiUrl } from "./urls";

export type ApiFetchOptions = RequestInit & {
  withCredentials?: boolean;
  authToken?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringProp(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function resolveErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim().length > 0) return payload;

  const message =
    getStringProp(payload, "message") ??
    getStringProp(payload, "error") ??
    getStringProp(payload, "detail") ??
    getStringProp(payload, "title");

  return message ?? fallback;
}

function isFormDataBody(body: BodyInit | null | undefined): boolean {
  // w środowisku node FormData może nie istnieć
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(
  init: HeadersInit | undefined,
  body: BodyInit | null | undefined,
  authToken: string | null | undefined
): Headers {
  const headers = new Headers(init);

  // Content-Type: ustawiamy tylko gdy:
  // - nie jest FormData
  // - caller nie podał Content-Type
  if (!isFormDataBody(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Authorization: jeśli podano authToken i nie ma już Authorization
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return headers;
}

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { withCredentials, authToken, headers, ...rest } = options;

  const finalHeaders = buildHeaders(headers, rest.body ?? null, authToken);

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    credentials: withCredentials ? "include" : undefined,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const data: unknown = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = resolveErrorMessage(data, `Request failed (${res.status})`);
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export function apiFetchPath<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  return apiFetch<T>(makeApiUrl(path), options);
}
