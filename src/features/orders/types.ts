export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "LOADING"
  | "UNLOADING"
  | "PAUSED"
  | "COMPLETED"
  | "PROBLEM";

export type OrderEventType =
  | "STATUS_CHANGED"
  | "INCIDENT_DETOUR"
  | "INCIDENT_ACCIDENT"
  | "INCIDENT_DELAY"
  | "ROUTE_PAUSED"
  | "ROUTE_RESUMED"
  | "ROUTE_FINISHED"
  | "PROBLEM_REPORTED"
  | "ORDER_ASSIGNED"
  | "ORDER_COMPLETED";

export type TransportOrderRoutePointType =
  | "LOADING"
  | "UNLOADING"
  | "FUEL"
  | "PARKING"
  | "SERVICE"
  | "OTHER";
export type TransportOrderRoutePointBehavior = "STOP" | "PASS_THROUGH";
export type TransportOrderRoutePointSource = "DISPATCHER" | "SYSTEM" | "HERE";
export type PartnerPoiType = "FUEL" | "PARKING" | "SERVICE" | "OTHER";
export type DriverLocationSource = "HERE_SDK";

export type DriverLiveLocationDto = {
  driverId: string;
  transportOrderId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedMetersPerSecond: number | null;
  bearingDegrees: number | null;
  remainingDistanceMeters: number | null;
  traveledDistanceMeters: number | null;
  remainingDurationSeconds: number | null;
  recordedAt: string;
  updatedAt: string;
  source: DriverLocationSource;
};

export type DriverApproachRouteDto = {
  location: DriverLiveLocationDto;
  route: {
    polyline: string;
    distanceMeters: number;
    durationSeconds: number;
    calculatedAt: string;
  };
  destinationRoutePoint: {
    id: string;
    sequence: number;
    latitude: number;
    longitude: number;
  };
};

export type TransportOrderRoutePointDto = {
  id: string;
  sequence: number;
  type: TransportOrderRoutePointType;
  behavior: TransportOrderRoutePointBehavior;
  source: TransportOrderRoutePointSource;
  isManual: boolean;
  label: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  arrivedAt?: string | null;
};

export type TransportOrderRoutePointPayload = Omit<
  TransportOrderRoutePointDto,
  "id"
>;

export type HazardousGood =
  | "explosive"
  | "gas"
  | "flammable"
  | "combustible"
  | "organic"
  | "poison"
  | "radioactive"
  | "corrosive"
  | "poisonousInhalation"
  | "harmfulToWater"
  | "other";

export type RoutingProfile = {
  transportMode: "car" | "truck";
  routingMode: "fast" | "short";
  trafficMode: "default" | "disabled";
  avoidTolls: boolean;
  avoidFerries: boolean;
  avoidMotorways: boolean;
};

export type VehicleSpec = {
  heightCm?: number | null;
  widthCm?: number | null;
  lengthCm?: number | null;
  currentWeightKg?: number | null;
  grossWeightKg?: number | null;
  weightPerAxleKg?: number | null;
  axleCount?: number | null;
  trailerCount?: number | null;
  hazardousGoods?: HazardousGood[] | null;
};

export type TransportOrderRoutePlanDto = {
  routingProfile: RoutingProfile;
  vehicleSpec: VehicleSpec | null;
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  calculationHash: string;
  calculatedAt: string;
};

export type TransportOrderRouteDto = {
  routePoints: TransportOrderRoutePointDto[];
  routePlan: TransportOrderRoutePlanDto | null;
  routingProfile: RoutingProfile;
  vehicleSpec: VehicleSpec | null;
};

export type RoutePointDraft = TransportOrderRoutePointPayload;

export type CalculateTransportOrderRoutePayload = {
  routePoints: RoutePointDraft[];
  routingProfile: RoutingProfile;
  vehicleSpec: VehicleSpec | null;
};

export type CalculateTransportOrderRouteResult = {
  routePreviewId: string;
  calculationHash: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  calculatedAt: string;
};

export type SaveTransportOrderRoutePayload =
  CalculateTransportOrderRoutePayload & {
    routePreviewId: string;
    calculationHash: string;
  };

export type SaveTransportOrderRouteResult = {
  success: boolean;
  routePlan: TransportOrderRoutePlanDto;
};

export type RouteGeocodeResult = {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
  hereId?: string | null;
};

export type PartnerPoiDto = {
  id: string;
  name: string | null;
  type: PartnerPoiType;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerPoiBbox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type ListPartnerPoisParams = {
  bbox: PartnerPoiBbox;
  isActive?: boolean;
  signal?: AbortSignal;
};

export type PartnerPoisListDto = {
  items: PartnerPoiDto[];
};

export type CreatePartnerPoiPayload = {
  name?: string | null;
  type?: PartnerPoiType;
  address: string;
  isActive?: boolean;
};

export type UpdatePartnerPoiPayload = Partial<CreatePartnerPoiPayload>;

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

export type OrdersPageDto = {
  items: DispatcherOrderDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};

export type OrdersPageResult = {
  items: OrderListItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
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
  routePoints?: TransportOrderRoutePointPayload[];
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
  type: OrderEventType;
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
  routePoints: TransportOrderRoutePointDto[];
  routePlan: TransportOrderRoutePlanDto | null;
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
  routePoints: TransportOrderRoutePointPayload[];
}>;

export type UpdateTransportOrderResult = {
  id: string;
  ztNumber: string;
  status: OrderStatus;
};

export type TrackingHistoryRow = {
  status: OrderStatus;
  eventType: OrderEventType;
  time: string;
  date: string;
  description?: string | null;
};
