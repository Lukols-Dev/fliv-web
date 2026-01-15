import type { DispatcherOrderDto, OrderListItem } from "../types";

export function mapDispatcherOrderToListItem(
  dto: DispatcherOrderDto
): OrderListItem {
  return {
    id: dto.id,
    number: dto.ztNumber,
    status: dto.status,
    driverName: dto.driverName,
    driverPhone: dto.driverPhone ?? null,
    driverEmail: dto.driverEmail ?? null,
    vehiclePlate: dto.vehiclePlate ?? null,
    trailerPlate: dto.trailerPlate ?? null,
    loadingDate: dto.loadingDate ?? null,
    fromCountry: dto.fromCountry,
    fromAddress: dto.fromAddress,
    toCountry: dto.toCountry,
    toAddress: dto.toAddress,
  };
}
