import type { EditOrderValues } from "../components/edit-order/validation-schema";
import type { UpdateTransportOrderPayload } from "../types";

// dostosuj, jeśli backend ma inne nazwy pól
export function mapUpdateOrderValuesToPayload(
  values: EditOrderValues
): UpdateTransportOrderPayload {
  return {
    ztNumber: values.ztNumber,
    pwNumber: values.pwNumber,
    timelinessStatus: values.timelinessStatus,

    vehiclePlate: values.vehiclePlate,
    trailerPlate: values.trailerPlate,

    driverFirstName: values.driverFirstName,
    driverLastName: values.driverLastName,
    driverPhone: values.driverPhone,

    clientName: values.clientName,
    contractNumber: values.contractNumber,

    payerName: values.payerName,
    payerVatId: values.payerVatId,
    payerEmail: values.payerEmail,

    fromCountry: values.fromCountry,
    fromAddress: values.fromAddress ?? "",
    toCountry: values.toCountry,
    toAddress: values.toAddress ?? "",

    cargoWeightKg: values.cargoWeightKg,
    loadingDate: values.loadingDate,
    loadingTime: values.loadingTime ?? "",

    cargoDescription: values.cargoDescription ?? "",
    temperatureSensitive: values.temperatureSensitive === "yes",

    notes: values.notes ?? "",
  };
}
