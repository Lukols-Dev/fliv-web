import { z } from "zod";

export const ORDER_STATUSES = ["on_time"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const TEMP_SENSITIVE = ["yes", "no"] as const;
export type TempSensitive = (typeof TEMP_SENSITIVE)[number];

export const createEditOrderSchema = (m: {
  required: string;
  emailInvalid: string;
  phoneInvalid: string;
  weightInvalid: string;
  dateInvalid: string;
  invalidOption: string;
}) =>
  z.object({
    ztNumber: z.string().trim().min(1, { message: m.required }),
    pwNumber: z.string().trim().min(1, { message: m.required }),
    timelinessStatus: z.string().trim().min(1, { message: m.required }),

    vehiclePlate: z.string().trim().min(1, { message: m.required }),
    trailerPlate: z.string().trim().min(1, { message: m.required }),

    driverFirstName: z.string().trim().min(1, { message: m.required }),
    driverLastName: z.string().trim().min(1, { message: m.required }),
    driverPhone: z
      .string()
      .trim()
      .min(1, { message: m.required })
      .refine((v) => /^[0-9+()\s-]{6,}$/.test(v), { message: m.phoneInvalid }),

    clientName: z.string().trim().min(1, { message: m.required }),
    contractNumber: z.string().trim().min(1, { message: m.required }),

    payerName: z.string().trim().min(1, { message: m.required }),
    payerVatId: z.string().trim().min(1, { message: m.required }),
    payerEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: m.emailInvalid }),

    fromCountry: z.string().trim().min(1, { message: m.required }),
    fromAddress: z.string().trim().optional(),
    toCountry: z.string().trim().min(1, { message: m.required }),
    toAddress: z.string().trim().optional(),

    cargoWeightKg: z.coerce
      .number()
      .refine((n) => Number.isFinite(n) && n > 0, {
        message: m.weightInvalid,
      }),

    loadingDate: z
      .string()
      .trim()
      .min(1, { message: m.required })
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), { message: m.dateInvalid }),

    loadingTime: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v), {
        message: m.dateInvalid,
      }),

    cargoDescription: z.string().trim().optional(),
    temperatureSensitive: z.enum(TEMP_SENSITIVE, {
      message: m.invalidOption,
    }),
    notes: z.string().trim().optional(),
  });

export type EditOrderValues = z.infer<ReturnType<typeof createEditOrderSchema>>;
