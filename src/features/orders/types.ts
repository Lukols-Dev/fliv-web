export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "LOADING"
  | "UNLOADING"
  | "PAUSED"
  | "COMPLETED"
  | "PROBLEM";

export type DispatcherOrderDto = {
  id: string;
  ztNumber: string;
  status: OrderStatus;
  vehiclePlate?: string | null;
  trailerPlate?: string | null;
  driverName: string;
  loadingDate?: string | null; // ISO
};

export type OrderListItem = {
  id: string;
  number: string;
  status: OrderStatus;
  driverName?: string;
  vehiclePlate?: string | null;
  trailerPlate?: string | null;
  loadingDate?: string | null;
};

export type OrdersPageResult = {
  items: OrderListItem[];
  page: number;
  limit: number;
  hasNext: boolean;
  status?: string;
};
