import type { AccountUser } from "../types";

export async function getAccountUser(): Promise<AccountUser> {
  return {
    id: "1",
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan.kowalski@gmail.com",
    roles: ["DISPATCHER"],
    isActive: true,
    role: "Dyspozytor",
    phone: "",
  };
}
