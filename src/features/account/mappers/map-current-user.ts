import type { CurrentUserResult } from "../services";
import type { AccountUser } from "../types";

export function mapCurrentUserToAccountUser(
  dto: CurrentUserResult
): AccountUser {
  return {
    id: dto.id,
    email: dto.email,
    roles: dto.roles,
    isActive: dto.isActive,

    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    phone: dto.phone ?? "",
    avatarUrl: dto.avatarUrl ?? null,
    role: dto.roles?.[0] ?? null,
  };
}
