import { CreateOrderValues } from "../components/create-order/validation-schema";
import type { CreateTransportOrderPayload } from "../types";

export function mapCreateOrderValuesToPayload(
  v: CreateOrderValues
): CreateTransportOrderPayload {
  return {
    ztNumber: v.ztNumber,
    pwNumber: v.pwNumber,
    timelinessStatus: v.timelinessStatus,

    vehiclePlate: v.vehiclePlate,
    trailerPlate: v.trailerPlate,

    driverFirstName: v.driverFirstName,
    driverLastName: v.driverLastName,
    driverPhone: v.driverPhone,

    clientName: v.clientName,
    contractNumber: v.contractNumber,

    payerName: v.payerName,
    payerVatId: v.payerVatId,
    payerEmail: v.payerEmail,

    fromCountry: v.fromCountry,
    fromAddress: v.fromAddress?.trim() || null,
    toCountry: v.toCountry,
    toAddress: v.toAddress?.trim() || null,

    cargoWeightKg: v.cargoWeightKg,
    loadingDate: v.loadingDate,
    cargoDescription: v.cargoDescription?.trim()
      ? v.cargoDescription.trim()
      : undefined,

    temperatureSensitive: v.temperatureSensitive === "yes",

    notes: v.notes?.trim() ? v.notes.trim() : undefined,
  };
}
