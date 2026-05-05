"use client";

import * as React from "react";
import { ChevronDown, Loader2, Plus, Save, X } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { useOrderRouteQuery } from "../hooks/use-order-route-query";
import {
  useCalculateRouteMutation,
  useRouteGeocodeMutation,
  useSaveRouteMutation,
} from "../hooks/use-route-editor-mutations";
import type {
  CalculateTransportOrderRouteResult,
  HazardousGood,
  RouteGeocodeResult,
  RoutePointDraft,
  RoutingProfile,
  TransportOrderRoutePointBehavior,
  TransportOrderRoutePointDto,
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
  const [sectionOpen, setSectionOpen] = React.useState({
    points: true,
    routing: true,
    vehicle: false,
    summary: true,
  });

  React.useEffect(() => {
    if (!routeQuery.data || !open) return;

    setRoutePoints(
      routeQuery.data.routePoints.map((point) => ({
        ...point,
        clientId: point.id,
      }))
    );
    setRoutingProfile(routeQuery.data.routingProfile ?? defaultRoutingProfile());
    setVehicleSpec(routeQuery.data.vehicleSpec ?? defaultVehicleSpec());
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
    setLastCalculationSignature(null);
    setGeocodeResults([]);
    setAddressQuery("");
  }, [open, routeQuery.data]);

  const routePointPayload = React.useMemo(
    () => normalizeForPayload(routePoints),
    [routePoints]
  );
  const calculationSignature = React.useMemo(
    () =>
      stableStringify({
        routePoints: routePointPayload.map((point) => ({
          sequence: point.sequence,
          latitude: point.latitude,
          longitude: point.longitude,
          behavior: point.behavior,
        })),
        routingProfile,
        vehicleSpec: normalizeVehicleSpec(vehicleSpec),
      }),
    [routePointPayload, routingProfile, vehicleSpec]
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

  const addPoint = React.useCallback((point: Omit<LocalRoutePoint, "sequence">) => {
    setRoutePoints((current) => [
      ...current,
      { ...point, sequence: current.length + 1 },
    ]);
    setLastCalculationSignature(null);
  }, []);

  const handleGeocode = async () => {
    const query = addressQuery.trim();
    if (!query || geocodeMutation.isPending) return;
    const results = await geocodeMutation.mutateAsync(query);
    setGeocodeResults(results);
  };

  const handleSelectGeocode = (result: RouteGeocodeResult) => {
    addPoint({
      clientId: crypto.randomUUID(),
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

  const calculateRoute = async () => {
    if (!canCalculate || calculateMutation.isPending) return;
    const result = await calculateMutation.mutateAsync({
      routePoints: routePointPayload,
      routingProfile,
      vehicleSpec: normalizeVehicleSpec(vehicleSpec),
    });
    setPreview(result);
    setLastCalculationSignature(calculationSignature);
  };

  const saveRoute = async () => {
    if (!canSave || !preview) return;
    await saveMutation.mutateAsync({
      routePoints: routePointPayload,
      routingProfile,
      vehicleSpec: normalizeVehicleSpec(vehicleSpec),
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
          <div className="relative min-w-0 flex-1 bg-muted">
            <HereStaticMap
              routePoints={routePointPayload as TransportOrderRoutePointDto[]}
              polyline={visiblePolyline}
            />
          </div>

          <aside className="flex h-full w-[460px] shrink-0 flex-col border-l bg-background">
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
                            <Plus className="h-4 w-4" />
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
                            onUpdate={updatePoint}
                          />
                        ))}
                      </div>
                    </div>
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
  onUpdate,
}: {
  point: LocalRoutePoint;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (clientId: string, direction: -1 | 1) => void;
  onRemove: (clientId: string) => void;
  onUpdate: (
    clientId: string,
    patch: Partial<Omit<LocalRoutePoint, "clientId">>
  ) => void;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">#{index + 1}</span>
        <div className="flex gap-1">
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
        <div className="grid grid-cols-2 gap-2">
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
        <Select value={value.transportMode} onValueChange={() => undefined}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>
      <FieldRow label="Routing">
        <Select value={value.routingMode} onValueChange={() => undefined}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fast">Fast</SelectItem>
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
  const hasHazardousGoods = hazardousGoods.length > 0;

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
          value={hasHazardousGoods ? "yes" : "no"}
          onValueChange={(next) =>
            onChange({
              ...value,
              hazardousGoods: next === "yes" ? hazardousGoods : null,
            })
          }
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> Nie
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> Tak
          </label>
        </RadioGroup>
      </FieldRow>

      {hasHazardousGoods ? (
        <div className="space-y-2">
          <Label className="text-xs">Towary niebezpieczne</Label>
          <div className="grid grid-cols-1 gap-2 rounded-md border p-2">
            {HAZARDOUS_GOODS.map((item) => (
              <label key={item.value} className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={hazardousGoods.includes(item.value)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...hazardousGoods, item.value]
                      : hazardousGoods.filter((value) => value !== item.value);
                    onChange({ ...value, hazardousGoods: next.length ? next : [] });
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

function SummaryItem({ label, value }: { label: string; value: string }) {
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

function normalizeVehicleSpec(vehicleSpec: VehicleSpec): VehicleSpec {
  return {
    ...vehicleSpec,
    trailerCount: vehicleSpec.trailerCount ?? 1,
    hazardousGoods: vehicleSpec.hazardousGoods?.length
      ? vehicleSpec.hazardousGoods
      : null,
  };
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
