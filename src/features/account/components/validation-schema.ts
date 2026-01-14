import { z } from "zod";

export const createUpdateAccountSchema = (m: {
  required: string;
  emailInvalid: string;
  passwordMin: string;
}) =>
  z.object({
    firstName: z.string().trim().min(1, { error: m.required }),
    lastName: z.string().trim().min(1, { error: m.required }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: m.emailInvalid })),
    phone: z.string().trim().min(1, { error: m.required }),
    password: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || v.length >= 8, { message: m.passwordMin }),
  });

export type UpdateAccountValues = z.infer<
  ReturnType<typeof createUpdateAccountSchema>
>;

export const deleteAccountSchema = (m: {
  required: string;
  mustMatch: string;
  token: string;
}) =>
  z.object({
    confirmation: z
      .string()
      .trim()
      .min(1, { error: m.required })
      .refine((v) => v === m.token, { message: m.mustMatch }),
  });

export type DeleteAccountValues = z.infer<
  ReturnType<typeof deleteAccountSchema>
>;
