import { z } from "zod";

export const createSignUpSchema = (m: {
  emailInvalid: string;
  passwordRequired: string;
  firstNameRequired: string;
  lastNameRequired: string;
  acceptTermsRequired: string;
}) =>
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: m.emailInvalid })),
    firstName: z.string().min(1, { error: m.firstNameRequired }),
    lastName: z.string().min(1, { error: m.lastNameRequired }),
    password: z.string().min(1, { error: m.passwordRequired }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      error: m.acceptTermsRequired,
    }),
  });

export type SignUpValues = z.infer<ReturnType<typeof createSignUpSchema>>;
