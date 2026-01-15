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
  driverPhone?: string | null;
  driverEmail?: string | null;
  loadingDate?: string | null; // ISO
  fromCountry: string;
  fromAddress: string | null;
  toCountry: string;
  toAddress: string | null;
};

export type OrderListItem = {
  id: string;
  number: string;
  status: OrderStatus;
  driverName?: string;
  driverPhone?: string | null;
  driverEmail?: string | null;
  vehiclePlate?: string | null;
  trailerPlate?: string | null;
  loadingDate?: string | null;
  fromCountry?: string;
  fromAddress?: string | null;
  toCountry?: string;
  toAddress?: string | null;
};

export type OrdersPageResult = {
  items: OrderListItem[];
  page: number;
  limit: number;
  hasNext: boolean;
  status?: string;
};

export type CreateTransportOrderPayload = {
  ztNumber: string;
  pwNumber: string;
  timelinessStatus: string;

  vehiclePlate: string;
  trailerPlate: string;

  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;

  clientName: string;
  contractNumber: string;

  payerName: string;
  payerVatId: string;
  payerEmail: string;

  fromCountry: string;
  fromAddress: string | null;
  toCountry: string;
  toAddress: string | null;

  cargoWeightKg: number;
  loadingDate: string; // YYYY-MM-DD
  loadingTime?: string | null; // HH:mm
  cargoDescription?: string;

  temperatureSensitive: boolean;

  notes?: string;
};

export type CreateTransportOrderResult = {
  id: string;
  ztNumber: string;
  status: string;
};

export type OrderDocumentDto = {
  id: string;
  title: string | null;
  createdAt: string; // ISO
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
  description: string | null;
};

export type OrderEventDto = {
  id: string;
  type: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus | null;
  description: string | null;
  createdAt: string; // ISO
};

export type OrderDetailsDto = {
  id: string;
  ztNumber: string;
  pwNumber: string | null;
  timelinessStatus: string | null;
  status: OrderStatus;
  vehiclePlate: string;
  trailerPlate: string | null;
  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;
  clientName: string;
  contractNumber: string | null;
  payerName: string | null;
  payerVatId: string | null;
  payerEmail: string | null;
  fromCountry: string;
  fromAddress: string | null;
  toCountry: string;
  toAddress: string | null;
  cargoWeightKg: number | null;
  loadingDate: string | null; // ISO
  loadingTime: string | null; // HH:mm
  cargoDescription: string | null;
  temperatureSensitive: boolean;
  notes: string | null;
  documents: OrderDocumentDto[];
  events: OrderEventDto[];
};

export type UpdateTransportOrderPayload = Partial<{
  ztNumber: string;
  pwNumber: string;
  timelinessStatus: string;

  vehiclePlate: string;
  trailerPlate: string;

  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;

  clientName: string;
  contractNumber: string;

  payerName: string;
  payerVatId: string;
  payerEmail: string;

  fromCountry: string;
  fromAddress: string;
  toCountry: string;
  toAddress: string;

  cargoWeightKg: number;
  loadingDate: string;
  loadingTime: string;
  cargoDescription: string;
  temperatureSensitive: boolean;
  notes: string;
}>;

export type UpdateTransportOrderResult = {
  id: string;
  ztNumber: string;
  status: OrderStatus;
};
