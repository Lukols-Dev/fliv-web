import { z } from "zod";

export const createSignInSchema = (m: {
  emailInvalid: string;
  passwordRequired: string;
}) =>
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: m.emailInvalid })),
    password: z.string().min(1, { error: m.passwordRequired }),
  });

export type SignInValues = z.infer<ReturnType<typeof createSignInSchema>>;
