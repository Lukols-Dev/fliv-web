export type AccountUser = {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;

  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string | null;
  role?: string | null;
};
