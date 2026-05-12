"use client";

import * as React from "react";
import {
  ChevronDown,
  GripVertical,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { HereStaticMap } from "./here-static-map";
import type { HereMapMarkerMode } from "./here-static-map";
import { Spinner } from "@/components/ui/spinner";
import { useOrderRouteQuery } from "../hooks/use-order-route-query";
import {
  useCreatePartnerPoiMutation,
  useDeletePartnerPoiMutation,
  useUpdatePartnerPoiMutation,
} from "../hooks/use-partner-poi-mutations";
import { usePartnerPoisQuery } from "../hooks/use-partner-pois-query";
import {
  useCalculateRouteMutation,
  useRouteGeocodeMutation,
  useSaveRouteMutation,
} from "../hooks/use-route-editor-mutations";
import type {
  CalculateTransportOrderRouteResult,
  HazardousGood,
  PartnerPoiBbox,
  PartnerPoiDto,
  PartnerPoiType,
  RouteGeocodeResult,
  RoutePointDraft,
  RoutingProfile,
  TransportOrderRoutePointBehavior,
  TransportOrderRoutePointType,
  VehicleSpec,
} from "../types";

const POINT_TYPES: Array<{
  value: TransportOrderRoutePointType;
  label: string;
}> = [
    { value: "LOADING", label: "Załadunek" },
    { value: "UNLOADING", label: "Rozładunek" },
    { value: "FUEL", label: "Tankowanie" },
    { value: "PARKING", label: "Parking" },
    { value: "SERVICE", label: "Serwis" },
    { value: "OTHER", label: "Inne" },
  ];

const PARTNER_POI_TYPES: Array<{
  value: PartnerPoiType;
  label: string;
}> = [
    { value: "FUEL", label: "Stacja paliw" },
    { value: "PARKING", label: "Parking" },
    { value: "SERVICE", label: "Serwis" },
    { value: "OTHER", label: "Inne" },
  ];

const TRANSPORT_MODES: Array<{
  value: RoutingProfile["transportMode"];
  label: string;
}> = [
    { value: "car", label: "Car" },
    { value: "truck", label: "Truck" },
  ];

const ROUTING_MODES: Array<{
  value: RoutingProfile["routingMode"];
  label: string;
}> = [
    { value: "fast", label: "Fast" },
    { value: "short", label: "Short" },
  ];

const POINT_MARKER_MODES: Array<{
  value: HereMapMarkerMode;
  label: string;
}> = [
    { value: "numbered", label: "Numer" },
    { value: "typed", label: "Ikona" },
  ];

const HAZARDOUS_GOODS: Array<{ value: HazardousGood; label: string }> = [
  { value: "explosive", label: "Wybuchowe" },
  { value: "gas", label: "Gaz" },
  { value: "flammable", label: "Łatwopalne" },
  { value: "combustible", label: "Palne" },
  { value: "organic", label: "Organiczne" },
  { value: "poison", label: "Trujące" },
  { value: "radioactive", label: "Radioaktywne" },
  { value: "corrosive", label: "Korozyjne" },
  { value: "poisonousInhalation", label: "Toksyczne przy wdychaniu" },
  { value: "harmfulToWater", label: "Szkodliwe dla wody" },
  { value: "other", label: "Inne" },
];

type LocalRoutePoint = RoutePointDraft & {
  clientId: string;
  markerMode: HereMapMarkerMode;
  partnerPoiId?: string;
  partnerPoiName?: string | null;
};

type PartnerPoiFormState = {
  name: string;
  type: PartnerPoiType;
  address: string;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
};

export function EditRouteDialog({ open, onOpenChange, orderId }: Props) {
  const routeQuery = useOrderRouteQuery({ id: orderId, enabled: open });
  const geocodeMutation = useRouteGeocodeMutation();
  const calculateMutation = useCalculateRouteMutation(orderId);
  const saveMutation = useSaveRouteMutation(orderId);
  const createPartnerPoiMutation = useCreatePartnerPoiMutation();
  const updatePartnerPoiMutation = useUpdatePartnerPoiMutation();
  const deletePartnerPoiMutation = useDeletePartnerPoiMutation();

  const [routePoints, setRoutePoints] = React.useState<LocalRoutePoint[]>([]);
  const [routingProfile, setRoutingProfile] =
    React.useState<RoutingProfile>(defaultRoutingProfile);
  const [vehicleSpec, setVehicleSpec] =
    React.useState<VehicleSpec>(defaultVehicleSpec);
  const [preview, setPreview] =
    React.useState<CalculateTransportOrderRouteResult | null>(null);
  const [lastCalculationSignature, setLastCalculationSignature] =
    React.useState<string | null>(null);
  const [addressQuery, setAddressQuery] = React.useState("");
  const [geocodeResults, setGeocodeResults] = React.useState<
    RouteGeocodeResult[]
  >([]);
  const [showPartnerPois, setShowPartnerPois] = React.useState(true);
  const [partnerPoiBbox, setPartnerPoiBbox] =
    React.useState<PartnerPoiBbox | null>(null);
  const [partnerPoiForm, setPartnerPoiForm] =
    React.useState<PartnerPoiFormState>(defaultPartnerPoiForm);
  const [editingPartnerPoiId, setEditingPartnerPoiId] =
    React.useState<string | null>(null);
  const [detachingPartnerPoiClientId, setDetachingPartnerPoiClientId] =
    React.useState<string | null>(null);
  const [mapFitVersion, setMapFitVersion] = React.useState(0);
  const [sectionOpen, setSectionOpen] = React.useState({
    points: true,
    partnerPois: true,
    routing: true,
    vehicle: false,
    summary: true,
  });
  const partnerPoisQuery = usePartnerPoisQuery({
    bbox: partnerPoiBbox,
    enabled: open && !!partnerPoiBbox,
  });

  React.useEffect(() => {
    if (!routeQuery.data || !open) return;

    const loadedRoutePoints = routeQuery.data.routePoints.map((point) => ({
      ...point,
      clientId: point.id,
      markerMode: "numbered" as const,
    }));
    const loadedRoutingProfile =
      routeQuery.data.routingProfile ?? defaultRoutingProfile();
    const loadedVehicleSpec =
      routeQuery.data.vehicleSpec ?? defaultVehicleSpec();

    setRoutePoints(loadedRoutePoints);
    setRoutingProfile(loadedRoutingProfile);
    setVehicleSpec(loadedVehicleSpec);
    setPreview(
      routeQuery.data.routePlan
        ? {
          routePreviewId: "",
          calculationHash: routeQuery.data.routePlan.calculationHash,
          polyline: routeQuery.data.routePlan.polyline,
          distanceMeters: routeQuery.data.routePlan.distanceMeters,
          durationSeconds: routeQuery.data.routePlan.durationSeconds,
          calculatedAt: routeQuery.data.routePlan.calculatedAt,
        }
        : null
    );
    setLastCalculationSignature(
      routeQuery.data.routePlan
        ? buildCalculationSignature(
          normalizeForPayload(loadedRoutePoints),
          loadedRoutingProfile,
          getVehicleSpecPayload(loadedRoutingProfile, loadedVehicleSpec)
        )
        : null
    );
    setGeocodeResults([]);
    setAddressQuery("");
    setPartnerPoiForm(defaultPartnerPoiForm());
    setEditingPartnerPoiId(null);
    setDetachingPartnerPoiClientId(null);
    setMapFitVersion((version) => version + 1);
  }, [open, routeQuery.data]);

  const routePointPayload = React.useMemo(
    () => normalizeForPayload(routePoints),
    [routePoints]
  );
  const mapRoutePoints = React.useMemo(
    () => normalizeForMap(routePoints),
    [routePoints]
  );
  const vehicleSpecPayload = React.useMemo(
    () => getVehicleSpecPayload(routingProfile, vehicleSpec),
    [routingProfile, vehicleSpec]
  );
  const calculationSignature = React.useMemo(
    () =>
      buildCalculationSignature(
        routePointPayload,
        routingProfile,
        vehicleSpecPayload
      ),
    [routePointPayload, routingProfile, vehicleSpecPayload]
  );
  const previewIsCurrent =
    !!preview &&
    !!lastCalculationSignature &&
    lastCalculationSignature === calculationSignature;
  const visiblePolyline = previewIsCurrent ? preview.polyline : null;
  const canCalculate = routePointPayload.length >= 2;
  const canSave =
    canCalculate &&
    previewIsCurrent &&
    !!preview.routePreviewId &&
    !!preview.calculationHash &&
    !saveMutation.isPending;
  const partnerPois = partnerPoisQuery.data?.items ?? [];
  const routePartnerPoiClientIdsByPoiId = React.useMemo(() => {
    const result = new Map<string, string>();
    for (const point of routePoints) {
      if (point.partnerPoiId && !result.has(point.partnerPoiId)) {
        result.set(point.partnerPoiId, point.clientId);
      }
    }
    return result;
  }, [routePoints]);
  const visiblePartnerPois = showPartnerPois
    ? partnerPois.filter(
      (poi) =>
        poi.isActive && !routePartnerPoiClientIdsByPoiId.has(poi.id)
    )
    : [];

  const handlePartnerPoiBboxChange = React.useCallback(
    (bbox: PartnerPoiBbox) => {
      setPartnerPoiBbox((current) =>
        current &&
          current.north === bbox.north &&
          current.south === bbox.south &&
          current.east === bbox.east &&
          current.west === bbox.west
          ? current
          : bbox
      );
    },
    []
  );

  const addPoint = React.useCallback((point: Omit<LocalRoutePoint, "sequence">) => {
    setRoutePoints((current) => [
      ...current,
      { ...point, sequence: current.length + 1 },
    ]);
    setLastCalculationSignature(null);
  }, []);

  const applyRoutePointsAndRecalculate = React.useCallback(
    async (nextRoutePoints: LocalRoutePoint[]) => {
      const nextPayload = normalizeForPayload(nextRoutePoints);

      setRoutePoints(nextRoutePoints);
      setLastCalculationSignature(null);

      if (nextPayload.length < 2 || calculateMutation.isPending) return;

      const nextSignature = buildCalculationSignature(
        nextPayload,
        routingProfile,
        vehicleSpecPayload
      );
      const result = await calculateMutation.mutateAsync({
        routePoints: nextPayload,
        routingProfile,
        vehicleSpec: vehicleSpecPayload,
      });

      setPreview(result);
      setLastCalculationSignature(nextSignature);
    },
    [calculateMutation, routingProfile, vehicleSpecPayload]
  );

  const handleAddPartnerPoiToRoute = React.useCallback(
    async (poi: PartnerPoiDto) => {
      await applyRoutePointsAndRecalculate(
        insertPartnerPoiIntoRoute(routePoints, poi)
      );
    },
    [applyRoutePointsAndRecalculate, routePoints]
  );

  const handleDetachPartnerPoiFromRoute = React.useCallback(
    async (clientId: string) => {
      const nextRoutePoints = removeRoutePointByClientId(routePoints, clientId);
      if (nextRoutePoints.length === routePoints.length) return;

      setDetachingPartnerPoiClientId(clientId);
      try {
        await applyRoutePointsAndRecalculate(nextRoutePoints);
      } finally {
        setDetachingPartnerPoiClientId(null);
      }
    },
    [applyRoutePointsAndRecalculate, routePoints]
  );

  const handleSubmitPartnerPoi = async () => {
    const address = partnerPoiForm.address.trim();
    if (!address) return;

    const payload = {
      name: partnerPoiForm.name.trim() || null,
      type: partnerPoiForm.type,
      address,
      isActive: partnerPoiForm.isActive,
    };

    if (editingPartnerPoiId) {
      await updatePartnerPoiMutation.mutateAsync({
        id: editingPartnerPoiId,
        payload,
      });
    } else {
      await createPartnerPoiMutation.mutateAsync(payload);
    }

    setPartnerPoiForm(defaultPartnerPoiForm());
    setEditingPartnerPoiId(null);
  };

  const handleEditPartnerPoi = (poi: PartnerPoiDto) => {
    setEditingPartnerPoiId(poi.id);
    setPartnerPoiForm({
      name: poi.name ?? "",
      type: poi.type,
      address: poi.address,
      isActive: poi.isActive,
    });
  };

  const handleCancelPartnerPoiEdit = () => {
    setEditingPartnerPoiId(null);
    setPartnerPoiForm(defaultPartnerPoiForm());
  };

  const handleGeocode = async () => {
    const query = addressQuery.trim();
    if (!query || geocodeMutation.isPending) return;
    const results = await geocodeMutation.mutateAsync(query);
    setGeocodeResults(results);
  };

  const handleSelectGeocode = (result: RouteGeocodeResult) => {
    addPoint({
      clientId: crypto.randomUUID(),
      markerMode: "numbered",
      type: "OTHER",
      behavior: "STOP",
      source: "HERE",
      isManual: true,
      label: result.title,
      address: result.address ?? result.title,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setAddressQuery("");
    setGeocodeResults([]);
  };

  const updatePoint = (
    clientId: string,
    patch: Partial<Omit<LocalRoutePoint, "clientId">>
  ) => {
    setRoutePoints((current) =>
      current.map((point) =>
        point.clientId === clientId ? { ...point, ...patch } : point
      )
    );

    if (
      "latitude" in patch ||
      "longitude" in patch ||
      "sequence" in patch ||
      "behavior" in patch
    ) {
      setLastCalculationSignature(null);
    }
  };

  const removePoint = (clientId: string) => {
    setRoutePoints((current) =>
      current
        .filter((point) => point.clientId !== clientId)
        .map((point, index) => ({ ...point, sequence: index + 1 }))
    );
    setLastCalculationSignature(null);
  };

  const movePoint = (clientId: string, direction: -1 | 1) => {
    setRoutePoints((current) => {
      const index = current.findIndex((point) => point.clientId === clientId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;

      const next = current.slice();
      const item = next[index];
      next[index] = next[target];
      next[target] = item;
      return next.map((point, nextIndex) => ({
        ...point,
        sequence: nextIndex + 1,
      }));
    });
    setLastCalculationSignature(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setRoutePoints((current) => {
      const oldIndex = current.findIndex((p) => p.clientId === active.id);
      const newIndex = current.findIndex((p) => p.clientId === over.id);
      return arrayMove(current, oldIndex, newIndex).map((p, i) => ({
        ...p,
        sequence: i + 1,
      }));
    });
    setLastCalculationSignature(null);
  };

  const calculateRoute = async () => {
    if (!canCalculate || calculateMutation.isPending) return;
    const result = await calculateMutation.mutateAsync({
      routePoints: routePointPayload,
      routingProfile,
      vehicleSpec: vehicleSpecPayload,
    });
    setPreview(result);
    setLastCalculationSignature(calculationSignature);
  };

  const saveRoute = async () => {
    if (!canSave || !preview) return;
    await saveMutation.mutateAsync({
      routePoints: routePointPayload,
      routingProfile,
      vehicleSpec: vehicleSpecPayload,
      routePreviewId: preview.routePreviewId,
      calculationHash: preview.calculationHash,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! left-0! top-0! rounded-none border-0 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Edytuj trasę</DialogTitle>
        <div className="flex h-full min-h-0 bg-background">
          {/* <div className="relative min-w-0 flex-1 bg-muted"> */}
          <HereStaticMap
            routePoints={mapRoutePoints}
            polyline={visiblePolyline}
            partnerPois={visiblePartnerPois}
            fitRouteKey={`${orderId}:${mapFitVersion}`}
            onPartnerPoiAddToRoute={handleAddPartnerPoiToRoute}
            onPartnerPoiDetachFromRoute={handleDetachPartnerPoiFromRoute}
            onViewportBboxChange={handlePartnerPoiBboxChange}
          />
          {/* </div> */}

          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
              {routingProfile.transportMode === "truck" ? "Ciężarówka" : "Samochód"}
            </Badge>
            <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
              {routingProfile.routingMode === "fast" ? "Trasa szybka" : "Trasa krótka"}
            </Badge>
            {routingProfile.trafficMode === "default" && (
              <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
                Ruch drogowy
              </Badge>
            )}
            {routingProfile.avoidTolls && (
              <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
                Unikaj opłat
              </Badge>
            )}
            {routingProfile.avoidFerries && (
              <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
                Unikaj promów
              </Badge>
            )}
            {routingProfile.avoidMotorways && (
              <Badge variant="outline" className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-md text-foreground">
                Unikaj autostrad
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2">
            {routingProfile.transportMode === "truck" && (
              <div className="w-full rounded-xl overflow-hidden bg-white/70 dark:bg-black/60 backdrop-blur-xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-2xl">
                <div className="relative h-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/truck.jpg" alt="Pojazd" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">Parametry pojazdu</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 divide-x divide-black/10 dark:divide-white/10">
                  <VehicleParamCell label="Wys." value={vehicleSpec.heightCm} unit="cm" />
                  <VehicleParamCell label="Szer." value={vehicleSpec.widthCm} unit="cm" />
                  <VehicleParamCell label="Dł." value={vehicleSpec.lengthCm} unit="cm" />
                  <VehicleParamCell label="Osie" value={vehicleSpec.axleCount} />
                </div>
                <div className="h-px bg-black/10 dark:bg-white/10" />
                <div className="grid grid-cols-4 divide-x divide-black/10 dark:divide-white/10">
                  <VehicleParamCell label="Masa" value={vehicleSpec.currentWeightKg} unit="kg" />
                  <VehicleParamCell label="DMC" value={vehicleSpec.grossWeightKg} unit="kg" />
                  <VehicleParamCell label="Nacz." value={vehicleSpec.trailerCount} />
                  <VehicleParamCell label="ADR" value={Array.isArray(vehicleSpec.hazardousGoods) ? "Tak" : "Nie"} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-px rounded-xl bg-white/70 dark:bg-black/60 backdrop-blur-xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden text-sm">
              <MapSummaryCell label="Dystans" value={preview ? formatDistance(preview.distanceMeters) : "—"} />
              <div className="w-px self-stretch bg-black/10 dark:bg-white/10" />
              <MapSummaryCell label="Czas" value={preview ? formatDuration(preview.durationSeconds) : "—"} />
              <div className="w-px self-stretch bg-black/10 dark:bg-white/10" />
              <MapSummaryCell
                label="Status"
                value={previewIsCurrent ? "Aktualna" : preview ? "Wymaga przeliczenia" : "Nieprzeliczona"}
                valueClassName={previewIsCurrent ? "text-emerald-600 dark:text-emerald-400" : preview ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}
              />
              <div className="w-px self-stretch bg-black/10 dark:bg-white/10" />
              <MapSummaryCell label="Punkty" value={String(routePoints.length)} />
            </div>
          </div>

          <aside className="flex w-[460px] absolute z-10 top-4 bottom-4 right-4 flex-col bg-white/70 dark:bg-black/60 backdrop-blur-xl backdrop-saturate-150 border border-white/30 dark:border-white/10 shadow-2xl rounded-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-base font-semibold">Edytuj trasę</h2>
                <p className="text-xs text-muted-foreground">
                  Punkty, ustawienia i parametry pojazdu
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {routeQuery.isPending ? (
              <div className="grid flex-1 place-items-center">
                <Spinner />
              </div>
            ) : routeQuery.isError ? (
              <div className="p-4 text-sm text-destructive">
                Nie udało się pobrać danych trasy.
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <PanelSection
                    title="Punkty trasy"
                    open={sectionOpen.points}
                    onOpenChange={(value) =>
                      setSectionOpen((prev) => ({ ...prev, points: value }))
                    }
                  >
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={addressQuery}
                          onChange={(event) =>
                            setAddressQuery(event.target.value)
                          }
                          placeholder="Dodaj punkt z adresu"
                        />
                        <Button
                          type="button"
                          onClick={handleGeocode}
                          disabled={!addressQuery.trim() || geocodeMutation.isPending}
                        >
                          {geocodeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {geocodeResults.length ? (
                        <div className="space-y-1 rounded-md border p-2">
                          {geocodeResults.map((result) => (
                            <button
                              key={`${result.latitude}-${result.longitude}-${result.title}`}
                              type="button"
                              onClick={() => handleSelectGeocode(result)}
                              className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
                            >
                              <span className="font-medium">{result.title}</span>
                              <span className="block text-muted-foreground">
                                {result.address}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext
                          items={routePoints.map((p) => p.clientId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {routePoints.map((point, index) => (
                              <RoutePointRow
                                key={point.clientId}
                                point={point}
                                index={index}
                                canMoveUp={index > 0}
                                canMoveDown={index < routePoints.length - 1}
                                onMove={movePoint}
                                onRemove={removePoint}
                                onDetachPartnerPoi={handleDetachPartnerPoiFromRoute}
                                onUpdate={updatePoint}
                                isDetachingPartnerPoi={
                                  detachingPartnerPoiClientId === point.clientId
                                }
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </PanelSection>

                  <PanelSection
                    title="Punkty partnerskie"
                    open={sectionOpen.partnerPois}
                    onOpenChange={(value) =>
                      setSectionOpen((prev) => ({
                        ...prev,
                        partnerPois: value,
                      }))
                    }
                  >
                    <PartnerPoiSection
                      items={partnerPois}
                      form={partnerPoiForm}
                      editingId={editingPartnerPoiId}
                      showOnMap={showPartnerPois}
                      bboxReady={!!partnerPoiBbox}
                      isLoading={partnerPoisQuery.isPending}
                      isError={partnerPoisQuery.isError}
                      isSubmitting={
                        createPartnerPoiMutation.isPending ||
                        updatePartnerPoiMutation.isPending
                      }
                      deletingId={
                        deletePartnerPoiMutation.variables &&
                          deletePartnerPoiMutation.isPending
                          ? deletePartnerPoiMutation.variables
                          : null
                      }
                      detachingRouteClientId={detachingPartnerPoiClientId}
                      routePartnerPoiClientIdsByPoiId={
                        routePartnerPoiClientIdsByPoiId
                      }
                      onShowOnMapChange={setShowPartnerPois}
                      onFormChange={setPartnerPoiForm}
                      onSubmit={handleSubmitPartnerPoi}
                      onCancelEdit={handleCancelPartnerPoiEdit}
                      onEdit={handleEditPartnerPoi}
                      onDelete={(id) => deletePartnerPoiMutation.mutate(id)}
                      onToggleActive={(poi) =>
                        updatePartnerPoiMutation.mutate({
                          id: poi.id,
                          payload: { isActive: !poi.isActive },
                        })
                      }
                      onAddToRoute={handleAddPartnerPoiToRoute}
                      onDetachFromRoute={handleDetachPartnerPoiFromRoute}
                    />
                  </PanelSection>

                  <PanelSection
                    title="Ustawienia trasy"
                    open={sectionOpen.routing}
                    onOpenChange={(value) =>
                      setSectionOpen((prev) => ({ ...prev, routing: value }))
                    }
                  >
                    <RoutingSettings
                      value={routingProfile}
                      onChange={(value) => {
                        setRoutingProfile(value);
                        setLastCalculationSignature(null);
                      }}
                    />
                  </PanelSection>

                  {routingProfile.transportMode === "truck" ? (
                    <PanelSection
                      title="Parametry ciężarówki"
                      open={sectionOpen.vehicle}
                      onOpenChange={(value) =>
                        setSectionOpen((prev) => ({ ...prev, vehicle: value }))
                      }
                    >
                      <VehicleSettings
                        value={vehicleSpec}
                        onChange={(value) => {
                          setVehicleSpec(value);
                          setLastCalculationSignature(null);
                        }}
                      />
                    </PanelSection>
                  ) : null}

                  <div className="hidden">
                    <PanelSection
                      title="Podsumowanie"
                      open={sectionOpen.summary}
                      onOpenChange={(value) =>
                        setSectionOpen((prev) => ({ ...prev, summary: value }))
                      }
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <SummaryItem
                          label="Dystans"
                          value={preview ? formatDistance(preview.distanceMeters) : "—"}
                        />
                        <SummaryItem
                          label="Czas"
                          value={
                            preview
                              ? formatDuration(preview.durationSeconds)
                              : "—"
                          }
                        />
                        <SummaryItem
                          label="Status"
                          value={
                            previewIsCurrent
                              ? "Aktualna"
                              : preview
                                ? "Wymaga przeliczenia"
                                : "Nieprzeliczona"
                          }
                        />
                        <SummaryItem label="Punkty" value={String(routePoints.length)} />
                      </div>
                    </PanelSection>
                  </div>
                </div>

                <div className="space-y-2 border-t p-4">
                  {!canCalculate ? (
                    <p className="text-xs text-muted-foreground">
                      Do przeliczenia trasy wymagane są minimum dwa punkty.
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={calculateRoute}
                      disabled={!canCalculate || calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Przelicz trasę
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={saveRoute}
                      disabled={!canSave}
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Zapisz trasę
                    </Button>
                  </div>
                  {calculateMutation.isError || saveMutation.isError ? (
                    <p className="text-xs text-destructive">
                      Nie udało się wykonać operacji. Sprawdź punkty i przelicz
                      trasę ponownie.
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PanelSection({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b py-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold">
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function RoutePointRow({
  point,
  index,
  canMoveUp,
  canMoveDown,
  onMove,
  onRemove,
  onDetachPartnerPoi,
  onUpdate,
  isDetachingPartnerPoi,
}: {
  point: LocalRoutePoint;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (clientId: string, direction: -1 | 1) => void;
  onRemove: (clientId: string) => void;
  onDetachPartnerPoi: (clientId: string) => void | Promise<void>;
  onUpdate: (
    clientId: string,
    patch: Partial<Omit<LocalRoutePoint, "clientId">>
  ) => void;
  isDetachingPartnerPoi: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: point.clientId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold">#{index + 1}</span>
          {point.partnerPoiId ? (
            <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              POI
              {point.partnerPoiName ? ` · ${point.partnerPoiName}` : ""}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => onMove(point.clientId, -1)}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => onMove(point.clientId, 1)}
          >
            ↓
          </Button>
          {point.partnerPoiId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDetachingPartnerPoi}
              onClick={() => {
                void Promise.resolve(onDetachPartnerPoi(point.clientId)).catch(
                  () => undefined
                );
              }}
            >
              {isDetachingPartnerPoi ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="mr-1 h-3.5 w-3.5" />
              )}
              Odłącz POI
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(point.clientId)}
          >
            Usuń
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Input
          value={point.label ?? ""}
          onChange={(event) =>
            onUpdate(point.clientId, { label: event.target.value })
          }
          placeholder="Label"
        />
        <Input
          value={point.address ?? ""}
          onChange={(event) =>
            onUpdate(point.clientId, { address: event.target.value })
          }
          placeholder="Adres opisowy"
        />
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={point.type}
            onValueChange={(value) =>
              onUpdate(point.clientId, {
                type: value as TransportOrderRoutePointType,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POINT_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={point.behavior}
            onValueChange={(value) =>
              onUpdate(point.clientId, {
                behavior: value as TransportOrderRoutePointBehavior,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STOP">Postój</SelectItem>
              <SelectItem value="PASS_THROUGH">Przebieg</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={point.markerMode}
            onValueChange={(value) =>
              onUpdate(point.clientId, {
                markerMode: value as HereMapMarkerMode,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POINT_MARKER_MODES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            value={point.latitude}
            onChange={(value) => {
              if (value !== null) onUpdate(point.clientId, { latitude: value });
            }}
            placeholder="Latitude"
          />
          <NumberInput
            value={point.longitude}
            onChange={(value) => {
              if (value !== null) onUpdate(point.clientId, { longitude: value });
            }}
            placeholder="Longitude"
          />
        </div>
      </div>
    </div>
  );
}

function PartnerPoiSection({
  items,
  form,
  editingId,
  showOnMap,
  bboxReady,
  isLoading,
  isError,
  isSubmitting,
  deletingId,
  detachingRouteClientId,
  routePartnerPoiClientIdsByPoiId,
  onShowOnMapChange,
  onFormChange,
  onSubmit,
  onCancelEdit,
  onEdit,
  onDelete,
  onToggleActive,
  onAddToRoute,
  onDetachFromRoute,
}: {
  items: PartnerPoiDto[];
  form: PartnerPoiFormState;
  editingId: string | null;
  showOnMap: boolean;
  bboxReady: boolean;
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  deletingId: string | null;
  detachingRouteClientId: string | null;
  routePartnerPoiClientIdsByPoiId: ReadonlyMap<string, string>;
  onShowOnMapChange: (value: boolean) => void;
  onFormChange: (value: PartnerPoiFormState) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  onEdit: (poi: PartnerPoiDto) => void;
  onDelete: (id: string) => void;
  onToggleActive: (poi: PartnerPoiDto) => void;
  onAddToRoute: (poi: PartnerPoiDto) => void | Promise<void>;
  onDetachFromRoute: (clientId: string) => void | Promise<void>;
}) {
  const canSubmit = !!form.address.trim() && !isSubmitting;

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pokaż markery POI
        </span>
        <Switch checked={showOnMap} onCheckedChange={onShowOnMapChange} />
      </label>

      <div className="space-y-2 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {editingId ? "Edytuj punkt" : "Dodaj punkt"}
          </p>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
            >
              Anuluj
            </Button>
          ) : null}
        </div>

        <Input
          value={form.name}
          onChange={(event) =>
            onFormChange({ ...form, name: event.target.value })
          }
          placeholder="Nazwa punktu"
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Select
            value={form.type}
            onValueChange={(value) =>
              onFormChange({ ...form, type: value as PartnerPoiType })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARTNER_POI_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 rounded-md border px-2 text-xs">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) =>
                onFormChange({ ...form, isActive: checked })
              }
            />
            Aktywny
          </label>
        </div>
        <Input
          value={form.address}
          onChange={(event) =>
            onFormChange({ ...form, address: event.target.value })
          }
          placeholder="Adres do geokodowania HERE"
        />
        <Button
          type="button"
          className="w-full"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : editingId ? (
            <Save className="mr-2 h-4 w-4" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {editingId ? "Zapisz punkt" : "Dodaj punkt"}
        </Button>
      </div>

      <div className="space-y-2">
        {!bboxReady ? (
          <p className="rounded-md border p-3 text-xs text-muted-foreground">
            Punkty zostaną pobrane po załadowaniu obszaru mapy.
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 rounded-md border p-3 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ładowanie punktów partnerskich...
          </div>
        ) : isError ? (
          <p className="rounded-md border p-3 text-xs text-destructive">
            Nie udało się pobrać punktów partnerskich.
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-md border p-3 text-xs text-muted-foreground">
            Brak punktów partnerskich w tym obszarze.
          </p>
        ) : (
          items.map((poi) => {
            const routeClientId = routePartnerPoiClientIdsByPoiId.get(poi.id);
            const isDetaching = detachingRouteClientId === routeClientId;

            return (
              <div key={poi.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {poi.name || getPartnerPoiTypeLabel(poi.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPartnerPoiTypeLabel(poi.type)}
                      {!poi.isActive ? " · ukryty" : ""}
                      {routeClientId ? " · w trasie" : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {poi.address}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {routeClientId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDetaching}
                      onClick={() => {
                        void Promise.resolve(
                          onDetachFromRoute(routeClientId)
                        ).catch(() => undefined);
                      }}
                    >
                      {isDetaching ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="mr-1 h-3.5 w-3.5" />
                      )}
                      Odłącz z trasy
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void Promise.resolve(onAddToRoute(poi)).catch(
                          () => undefined
                        );
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Dodaj do trasy
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(poi)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edytuj
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(poi)}
                  >
                    {poi.isActive ? "Ukryj" : "Pokaż"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletingId === poi.id}
                    onClick={() => onDelete(poi.id)}
                  >
                    {deletingId === poi.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    Usuń
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RoutingSettings({
  value,
  onChange,
}: {
  value: RoutingProfile;
  onChange: (value: RoutingProfile) => void;
}) {
  return (
    <div className="space-y-3">
      <FieldRow label="Transport">
        <Select
          value={value.transportMode}
          onValueChange={(next) =>
            onChange({
              ...value,
              transportMode: next as RoutingProfile["transportMode"],
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSPORT_MODES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>
      <FieldRow label="Routing">
        <Select
          value={value.routingMode}
          onValueChange={(next) =>
            onChange({
              ...value,
              routingMode: next as RoutingProfile["routingMode"],
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUTING_MODES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>
      <SwitchRow
        label="Traffic"
        checked={value.trafficMode === "default"}
        onCheckedChange={(checked) =>
          onChange({ ...value, trafficMode: checked ? "default" : "disabled" })
        }
      />
      <SwitchRow
        label="Unikaj opłat"
        checked={value.avoidTolls}
        onCheckedChange={(checked) => onChange({ ...value, avoidTolls: checked })}
      />
      <SwitchRow
        label="Unikaj promów"
        checked={value.avoidFerries}
        onCheckedChange={(checked) =>
          onChange({ ...value, avoidFerries: checked })
        }
      />
      <SwitchRow
        label="Unikaj autostrad"
        checked={value.avoidMotorways}
        onCheckedChange={(checked) =>
          onChange({ ...value, avoidMotorways: checked })
        }
      />
    </div>
  );
}

function VehicleSettings({
  value,
  onChange,
}: {
  value: VehicleSpec;
  onChange: (value: VehicleSpec) => void;
}) {
  const hazardousGoods = value.hazardousGoods ?? [];
  const adrEnabled = Array.isArray(value.hazardousGoods);

  const setNumber = (key: keyof VehicleSpec, nextValue: number | null) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="space-y-3">
      <NumberField label="Wysokość (cm)" value={value.heightCm} onChange={(v) => setNumber("heightCm", v)} />
      <NumberField label="Szerokość (cm)" value={value.widthCm} onChange={(v) => setNumber("widthCm", v)} />
      <NumberField label="Długość (cm)" value={value.lengthCm} onChange={(v) => setNumber("lengthCm", v)} />
      <NumberField label="Aktualna masa (kg)" value={value.currentWeightKg} onChange={(v) => setNumber("currentWeightKg", v)} />
      <NumberField label="DMC (kg)" value={value.grossWeightKg} onChange={(v) => setNumber("grossWeightKg", v)} />
      <NumberField label="Masa na oś (kg)" value={value.weightPerAxleKg} onChange={(v) => setNumber("weightPerAxleKg", v)} />
      <NumberField label="Liczba osi" value={value.axleCount} onChange={(v) => setNumber("axleCount", v)} />
      <FieldRow label="Naczepy">
        <Select
          value={String(value.trailerCount ?? 1)}
          onValueChange={(next) => setNumber("trailerCount", Number(next))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3].map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label="ADR">
        <RadioGroup
          value={adrEnabled ? "yes" : "no"}
          onValueChange={(next) =>
            onChange({
              ...value,
              hazardousGoods: next === "yes" ? [] : null,
            })
          }
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id="adr-no" value="no" />
            <Label htmlFor="adr-no">Nie</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="adr-yes" value="yes" />
            <Label htmlFor="adr-yes">Tak</Label>
          </div>
        </RadioGroup>
      </FieldRow>

      {adrEnabled ? (
        <div className="space-y-2">
          <Label className="text-xs">Towary niebezpieczne</Label>
          <div className="grid grid-cols-1 gap-2 rounded-md border p-2">
            {HAZARDOUS_GOODS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={hazardousGoods.includes(item.value)}
                  onCheckedChange={(checked) => {
                    const next = checked === true
                      ? [...hazardousGoods, item.value]
                      : hazardousGoods.filter((value) => value !== item.value);
                    onChange({ ...value, hazardousGoods: next });
                  }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <FieldRow label={label}>
      <NumberInput value={value ?? null} onChange={onChange} />
    </FieldRow>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value === "" ? null : Number(event.target.value))
      }
    />
  );
}

function MapSummaryCell({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col px-4 py-2.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", valueClassName)}>{value}</span>
    </div>
  );
}

function VehicleParamCell({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
}) {
  const display = value == null ? "—" : unit ? `${value} ${unit}` : String(value);
  return (
    <div className="flex flex-col items-center px-1 py-2">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold">{display}</span>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string; }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function normalizeForPayload(points: LocalRoutePoint[]): RoutePointDraft[] {
  return points
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((point, index) => ({
      sequence: index + 1,
      type: point.type,
      behavior: point.behavior,
      source: point.source,
      isManual: point.isManual,
      label: point.label ?? null,
      address: point.address ?? null,
      latitude: point.latitude,
      longitude: point.longitude,
    }));
}

function normalizeForMap(
  points: LocalRoutePoint[]
): Array<
  RoutePointDraft & {
    clientId: string;
    markerMode: HereMapMarkerMode;
    partnerPoiId?: string;
    partnerPoiName?: string | null;
  }
> {
  return points
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((point, index) => ({
      sequence: index + 1,
      type: point.type,
      behavior: point.behavior,
      source: point.source,
      isManual: point.isManual,
      label: point.label ?? null,
      address: point.address ?? null,
      latitude: point.latitude,
      longitude: point.longitude,
      clientId: point.clientId,
      markerMode: point.markerMode,
      partnerPoiId: point.partnerPoiId,
      partnerPoiName: point.partnerPoiName,
    }));
}

function insertPartnerPoiIntoRoute(
  points: LocalRoutePoint[],
  poi: PartnerPoiDto
): LocalRoutePoint[] {
  const nextPoint: LocalRoutePoint = {
    clientId: crypto.randomUUID(),
    markerMode: "typed",
    partnerPoiId: poi.id,
    partnerPoiName: poi.name ?? getPartnerPoiTypeLabel(poi.type),
    sequence: 0,
    type: poi.type,
    behavior: "STOP",
    source: "DISPATCHER",
    isManual: true,
    label: poi.name || getPartnerPoiTypeLabel(poi.type),
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
  };
  const next = points.slice();
  const unloadIndex = next.findIndex((point) => point.type === "UNLOADING");
  next.splice(unloadIndex >= 0 ? unloadIndex : next.length, 0, nextPoint);
  return next.map((point, index) => ({ ...point, sequence: index + 1 }));
}

function removeRoutePointByClientId(
  points: LocalRoutePoint[],
  clientId: string
): LocalRoutePoint[] {
  return points
    .filter((point) => point.clientId !== clientId)
    .map((point, index) => ({ ...point, sequence: index + 1 }));
}

function defaultRoutingProfile(): RoutingProfile {
  return {
    transportMode: "truck",
    routingMode: "fast",
    trafficMode: "default",
    avoidTolls: false,
    avoidFerries: false,
    avoidMotorways: false,
  };
}

function defaultVehicleSpec(): VehicleSpec {
  return {
    heightCm: null,
    widthCm: null,
    lengthCm: null,
    currentWeightKg: null,
    grossWeightKg: null,
    weightPerAxleKg: null,
    axleCount: null,
    trailerCount: 1,
    hazardousGoods: null,
  };
}

function defaultPartnerPoiForm(): PartnerPoiFormState {
  return {
    name: "",
    type: "FUEL",
    address: "",
    isActive: true,
  };
}

function getPartnerPoiTypeLabel(type: PartnerPoiType): string {
  return type === "FUEL"
    ? "Stacja paliw"
    : type === "PARKING"
      ? "Parking"
      : type === "SERVICE"
        ? "Serwis"
        : "Inne";
}

function normalizeVehicleSpec(vehicleSpec: VehicleSpec): VehicleSpec {
  return {
    ...vehicleSpec,
    trailerCount: vehicleSpec.trailerCount ?? 1,
    hazardousGoods: vehicleSpec.hazardousGoods?.length
      ? vehicleSpec.hazardousGoods
      : null,
  };
}

function getVehicleSpecPayload(
  routingProfile: RoutingProfile,
  vehicleSpec: VehicleSpec
): VehicleSpec | null {
  return routingProfile.transportMode === "truck"
    ? normalizeVehicleSpec(vehicleSpec)
    : null;
}

function buildCalculationSignature(
  routePoints: RoutePointDraft[],
  routingProfile: RoutingProfile,
  vehicleSpec: VehicleSpec | null
): string {
  return stableStringify({
    routePoints: routePoints.map((point) => ({
      sequence: point.sequence,
      latitude: point.latitude,
      longitude: point.longitude,
      behavior: point.behavior,
    })),
    routingProfile,
    vehicleSpec,
  });
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortStable(value));
}

function sortStable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortStable);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortStable((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function formatDistance(distanceMeters: number): string {
  return distanceMeters < 1000
    ? `${Math.round(distanceMeters)} m`
    : `${new Intl.NumberFormat("pl-PL", {
      maximumFractionDigits: distanceMeters >= 100_000 ? 0 : 1,
    }).format(distanceMeters / 1000)} km`;
}

function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  if (!hours) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}
