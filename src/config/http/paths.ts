export const apiPaths = {
  auth: "/api/auth",
  v1: "/api/v1",
} as const;

export function joinPath(prefix: string, path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${prefix}${path}`;
}
