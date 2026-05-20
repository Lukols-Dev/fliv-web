export const ROLES = ["DISPATCHER", "DRIVER"] as const;
export type Role = (typeof ROLES)[number];

export function hasAnyRole(
  userRoles: readonly string[] | undefined,
  allowed: readonly Role[]
): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  const set = new Set(userRoles);
  return allowed.some((r) => set.has(r));
}
