import { z } from "zod";

export const ORDER_STATUSES = ["on_time", "issue", "in_progress"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const TEMP_SENSITIVE = ["yes", "no"] as const;
export type TempSensitive = (typeof TEMP_SENSITIVE)[number];

const isOneOf =
  <T extends readonly string[]>(arr: T) =>
  (v: string): v is T[number] =>
    arr.includes(v);

export const createCreateOrderSchema = (m: {
  required: string;
  emailInvalid: string;
  phoneInvalid: string;
  weightInvalid: string;
  dateInvalid: string;
  invalidOption: string;
}) =>
  z.object({
    ztNumber: z.string().trim().min(1, { error: m.required }),
    pwNumber: z.string().trim().min(1, { error: m.required }),
    status: z.enum(ORDER_STATUSES, {
      errorMap: () => ({ message: m.invalidOption }),
    }),

    truckPlate: z.string().trim().min(1, { error: m.required }),
    trailerPlate: z.string().trim().min(1, { error: m.required }),
    driverFirstName: z.string().trim().min(1, { error: m.required }),
    driverLastName: z.string().trim().min(1, { error: m.required }),
    driverPhone: z
      .string()
      .trim()
      .min(1, { error: m.required })
      .refine((v) => /^[0-9+()\s-]{6,}$/.test(v), {
        message: m.phoneInvalid,
      }),

    principal: z.string().trim().min(1, { error: m.required }),
    contractNumber: z.string().trim().min(1, { error: m.required }),
    payerName: z.string().trim().min(1, { error: m.required }),
    payerNip: z.string().trim().min(1, { error: m.required }),
    payerEmail: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: m.emailInvalid })),

    fromCountry: z.string().trim().min(1, { error: m.required }),
    toCountry: z.string().trim().min(1, { error: m.required }),
    weightKg: z.coerce.number().refine((n) => Number.isFinite(n) && n > 0, {
      message: m.weightInvalid,
    }),
    loadingDate: z
      .string()
      .trim()
      .min(1, { error: m.required })
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
        message: m.dateInvalid,
      }),
    cargoDescription: z.string().trim().optional(),
    tempSensitive: z.enum(TEMP_SENSITIVE, {
      errorMap: () => ({ message: m.invalidOption }),
    }),

    notes: z.string().trim().optional(),
  });

export type CreateOrderValues = z.infer<
  ReturnType<typeof createCreateOrderSchema>
> & {
  attachments?: FileList | null;
};
