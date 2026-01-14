import { useTranslations } from "next-intl";

/**
 * Hook to translate user roles
 * @returns Function to translate a single role or array of roles
 */
export function useRoleTranslations() {
  const t = useTranslations("AccountPage");

  const translateRole = (role: string): string => {
    return t(`role.${role}` as `role.${string}`, {
      defaultValue: role,
    }) as string;
  };

  const translateRoles = (roles: string[] | undefined | null): string => {
    if (!roles || roles.length === 0) {
      return t("role.noRole", { defaultValue: "No role" });
    }

    return roles.map(translateRole).join(", ");
  };

  return {
    translateRole,
    translateRoles,
  };
}
