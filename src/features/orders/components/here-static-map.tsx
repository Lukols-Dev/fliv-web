"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Minus, Plus, RefreshCw, Settings, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  DriverLiveLocationDto,
  PartnerPoiBbox,
  PartnerPoiDto,
  TransportOrderRoutePointDto,
} from "../types";

const HARDCODED_CENTER = { lat: 52.2297, lng: 21.0122 };
const HARDCODED_ZOOM = 12;
const VEHICLE_RESTRICTIONS_FEATURE = "vehicle restrictions";
const VEHICLE_RESTRICTIONS_MODE = "active & inactive";
const TRAFFIC_STYLE_URL =
  "https://js.api.here.com/v3/3.2/styles/harp/oslo/normal.day.json";
const HERE_SCRIPT_URLS = [
  "https://js.api.here.com/v3/3.2/mapsjs-core.js",
  "https://js.api.here.com/v3/3.2/mapsjs-service.js",
  "https://js.api.here.com/v3/3.2/mapsjs-mapevents.js",
  "https://js.api.here.com/v3/3.2/mapsjs-ui.js",
] as const;
const HERE_UI_CSS_URL = "https://js.api.here.com/v3/3.2/mapsjs-ui.css";
const TILE_SIZE = 256;
const iconCache = new WeakMap<HereNamespace, Map<string, unknown>>();

export type HereMapMarkerMode = "numbered" | "typed";
type HereMapView = "map" | "satellite";
type HereMapRoutePoint = Omit<TransportOrderRoutePointDto, "id"> & {
  clientId?: string;
  id?: string;
  markerMode?: HereMapMarkerMode;
  partnerPoiId?: string;
  partnerPoiName?: string | null;
};

type DriverMapLocation = Pick<
  DriverLiveLocationDto,
  | "latitude"
  | "longitude"
  | "bearingDegrees"
  | "accuracyMeters"
  | "recordedAt"
  | "updatedAt"
>;

type HereMapPoint = {
  lat: number;
  lng: number;
};

type HereDefaultLayers = {
  vector: {
    normal: {
      logistics: unknown;
      map: unknown;
    };
    traffic?: {
      logistics?: unknown;
      map?: unknown;
    };
  };
  hybrid?: {
    day?: {
      raster?: unknown;
      traffic?: unknown;
      vector?: unknown;
    };
    logistics?: {
      raster?: unknown;
      traffic?: unknown;
      vector?: unknown;
    };
  };
  raster?: {
    satellite?: {
      map?: unknown;
    };
  };
};

type HereMapStyleFeature = {
  feature: string;
  mode: string;
};

type HereMapStyle = {
  getEnabledFeatures(): HereMapStyleFeature[] | undefined;
  setEnabledFeatures(features: HereMapStyleFeature[]): void;
};

type HereMapProvider = {
  getStyle(): HereMapStyle;
};

type HereMapLayer = {
  getProvider(): HereMapProvider;
};

type HereMap = {
  addObject(object: unknown): void;
  removeObject(object: unknown): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
  dispose(): void;
  getViewPort(): {
    resize(): void;
  };
  getViewModel(): {
    getLookAtData(): {
      bounds?: unknown;
      zoom?: number;
    };
    setLookAtData(data: {
      bounds?: unknown;
      position?: HereMapPoint;
      zoom?: number;
    }): void;
  };
  addLayer(layer: unknown): void;
  removeLayer(layer: unknown): void;
  getBaseLayer(): HereMapLayer;
  setBaseLayer(layer: unknown): void;
  setCenter(point: HereMapPoint): void;
  setZoom(zoom: number): void;
};

type HereMapGroup = {
  addObject(object: unknown): void;
  addObjects(objects: unknown[]): void;
  getBoundingBox(): unknown;
};

type HereMapMarker = {
  addEventListener(type: string, listener: () => void): void;
  setIcon(icon: unknown): void;
};

type HereUi = {
  addBubble(bubble: unknown): void;
  removeBubble(bubble: unknown): void;
};

type HereNamespace = {
  service: {
    Platform: new (options: { apikey: string }) => {
      createDefaultLayers(): HereDefaultLayers;
      getTrafficVectorTileService?: (options: { layer: "flow" | "incident" }) => {
        createLayer(style: unknown): unknown;
      };
    };
  };
  Map: new (
    element: HTMLElement,
    layer: unknown,
    options: { center: HereMapPoint; zoom: number; pixelRatio?: number }
  ) => HereMap;
  mapevents: {
    MapEvents: new (map: HereMap) => unknown;
    Behavior: new (events: unknown) => unknown;
  };
  ui: {
    UI: {
      new (map: HereMap): HereUi;
      createDefault(map: HereMap, layers: HereDefaultLayers): HereUi;
    };
    InfoBubble: new (
      point: HereMapPoint,
      options: { content: string | HTMLElement }
    ) => unknown;
  };
  map: {
    Group: new () => HereMapGroup;
    Icon: new (
      bitmap: string,
      options?: {
        anchor?: { x: number; y: number };
        size?: { w: number; h: number };
      }
    ) => unknown;
    DomIcon: new (element: string | HTMLElement) => unknown;
    Marker: new (
      point: HereMapPoint,
      options?: { icon?: unknown }
    ) => HereMapMarker;
    DomMarker: new (
      point: HereMapPoint,
      options?: { icon?: unknown }
    ) => HereMapMarker;
    Polyline: new (
      lineString: unknown,
      options?: {
        style?: {
          lineWidth?: number;
          strokeColor?: string;
        };
      }
    ) => unknown;
    render?: {
      harp?: {
        Style: new (url: string) => unknown;
      };
    };
  };
  geo: {
    LineString: {
      fromFlexiblePolyline(polyline: string): unknown;
    };
  };
};

type MarkerEntry = {
  marker: HereMapMarker;
  point: HereMapRoutePoint;
  index: number;
};

type PoiMarkerEntry = {
  marker: HereMapMarker;
  poi: PartnerPoiDto;
};

type Props = {
  routePoints: HereMapRoutePoint[];
  polyline?: string | null;
  approachPolyline?: string | null;
  driverLocation?: DriverMapLocation | null;
  partnerPois?: PartnerPoiDto[];
  fitRouteKey?: string | number | null;
  showUiControls?: boolean;
  highlightedClientId?: string | null;
  highlightedPoiId?: string | null;
  isUpdating?: boolean;
  isDriverLocationRefreshing?: boolean;
  mapSettingsPositionClassName?: string;
  mapZoomPositionClassName?: string;
  mapDriverRefreshPositionClassName?: string;
  onDriverLocationRefresh?: () => void;
  onPartnerPoiAddToRoute?: (poi: PartnerPoiDto) => void | Promise<void>;
  onPartnerPoiDetachFromRoute?: (clientId: string) => void | Promise<void>;
  onViewportBboxChange?: (bbox: PartnerPoiBbox) => void;
};

declare global {
  interface Window {
    H?: HereNamespace;
    __hereMapsLoadPromise?: Promise<HereNamespace>;
  }
}

export function HereStaticMap({
  routePoints,
  polyline,
  approachPolyline,
  driverLocation,
  partnerPois = [],
  fitRouteKey = null,
  showUiControls = true,
  highlightedClientId,
  highlightedPoiId,
  isUpdating = false,
  isDriverLocationRefreshing = false,
  mapSettingsPositionClassName = "right-3 top-3",
  mapZoomPositionClassName = "right-3 bottom-3",
  mapDriverRefreshPositionClassName = "right-3 top-3",
  onDriverLocationRefresh,
  onPartnerPoiAddToRoute,
  onPartnerPoiDetachFromRoute,
  onViewportBboxChange,
}: Props) {
  const t = useTranslations("HereMap");
  const locale = useLocale();
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<HereMap | null>(null);
  const defaultLayersRef = React.useRef<HereDefaultLayers | null>(null);
  const hereRef = React.useRef<HereNamespace | null>(null);
  const uiRef = React.useRef<HereUi | null>(null);
  const routeGroupRef = React.useRef<HereMapGroup | null>(null);
  const poiGroupRef = React.useRef<HereMapGroup | null>(null);
  const satelliteVectorLayerRef = React.useRef<unknown | null>(null);
  const trafficFlowLayerRef = React.useRef<unknown | null>(null);
  const trafficIncidentLayerRef = React.useRef<unknown | null>(null);
  const trafficFallbackLayerRef = React.useRef<unknown | null>(null);
  const activeTrafficFlowRef = React.useRef(false);
  const activeTrafficIncidentRef = React.useRef(false);
  const activeTrafficFallbackLayerRef = React.useRef<unknown | null>(null);
  const activeSatelliteVectorRef = React.useRef(false);
  const infoBubbleRef = React.useRef<unknown | null>(null);
  const infoBubbleModeRef = React.useRef<"click" | "hover" | null>(null);
  const hoverCloseTimeoutRef = React.useRef<number | null>(null);
  const lastRouteViewportSignatureRef = React.useRef<string | null>(null);
  const lastFitRouteKeyRef = React.useRef<string | number | null>(null);
  const routeMarkersRef = React.useRef<Map<string, MarkerEntry>>(new Map());
  const prevHighlightedRef = React.useRef<string | null>(null);
  const highlightedClientIdRef = React.useRef<string | null | undefined>(highlightedClientId);
  highlightedClientIdRef.current = highlightedClientId ?? null;
  const poiMarkersRef = React.useRef<Map<string, PoiMarkerEntry>>(new Map());
  const prevHighlightedPoiRef = React.useRef<string | null>(null);
  const highlightedPoiIdRef = React.useRef<string | null | undefined>(highlightedPoiId);
  highlightedPoiIdRef.current = highlightedPoiId ?? null;
  const [error, setError] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapSettingsOpen, setMapSettingsOpen] = React.useState(false);
  const [mapView, setMapView] = React.useState<HereMapView>("map");
  const [trafficFlowEnabled, setTrafficFlowEnabled] = React.useState(false);
  const [trafficIncidentsEnabled, setTrafficIncidentsEnabled] =
    React.useState(false);
  const [vehicleRestrictionsEnabled, setVehicleRestrictionsEnabled] =
    React.useState(true);
  const sortedPoints = React.useMemo(
    () =>
      routePoints
        .filter(
          (point) =>
            Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
        )
        .slice()
        .sort((a, b) => a.sequence - b.sequence),
    [routePoints]
  );
  const driverLocationPoint = React.useMemo(
    () => normalizeDriverLocation(driverLocation),
    [driverLocation]
  );
  const routeViewportSignature = React.useMemo(
    () =>
      buildRouteViewportSignature(
        sortedPoints,
        polyline,
        approachPolyline,
        driverLocationPoint
      ),
    [approachPolyline, driverLocationPoint, polyline, sortedPoints]
  );
  const activePartnerPois = React.useMemo(
    () =>
      partnerPois.filter(
        (poi) =>
          poi.isActive &&
          Number.isFinite(poi.latitude) &&
          Number.isFinite(poi.longitude)
      ),
    [partnerPois]
  );

  const cancelPendingHoverClose = React.useCallback(() => {
    if (hoverCloseTimeoutRef.current !== null) {
      window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  }, []);

  const closePartnerPoiBubble = React.useCallback(() => {
    cancelPendingHoverClose();
    const ui = uiRef.current;
    const bubble = infoBubbleRef.current;
    if (ui && bubble) {
      ui.removeBubble(bubble);
    }
    infoBubbleRef.current = null;
    infoBubbleModeRef.current = null;
  }, [cancelPendingHoverClose]);

  const closeHoverBubble = React.useCallback(() => {
    cancelPendingHoverClose();
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      if (infoBubbleModeRef.current === "hover") {
        closePartnerPoiBubble();
      }
    }, 120);
  }, [cancelPendingHoverClose, closePartnerPoiBubble]);

  const openPartnerPoiBubble = React.useCallback(
    (poi: PartnerPoiDto, mode: "click" | "hover" = "click") => {
      const H = hereRef.current;
      const ui = uiRef.current;
      if (!H || !ui || !onPartnerPoiAddToRoute) return;

      cancelPendingHoverClose();
      closePartnerPoiBubble();

      const content = document.createElement("div");
      content.className = "min-w-[180px] space-y-2 text-sm";
      if (mode === "hover") {
        content.addEventListener("pointerenter", cancelPendingHoverClose);
        content.addEventListener("pointerleave", closeHoverBubble);
      }

      const title = document.createElement("div");
      title.className = "font-semibold";
      title.textContent = poi.name || getPartnerPoiTypeLabel(poi.type, t);
      content.appendChild(title);

      const type = document.createElement("div");
      type.className = "text-xs text-muted-foreground";
      type.textContent = getPartnerPoiTypeLabel(poi.type, t);
      content.appendChild(type);

      const address = document.createElement("div");
      address.className = "text-xs text-muted-foreground";
      address.textContent = poi.address;
      content.appendChild(address);

      const coords = document.createElement("div");
      coords.className = "text-[11px] text-muted-foreground";
      coords.textContent = `${poi.latitude.toFixed(5)}, ${poi.longitude.toFixed(5)}`;
      content.appendChild(coords);

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground";
      button.textContent = t("partnerPoi.addAsRoutePoint");
      button.addEventListener("click", () => {
        button.setAttribute("disabled", "true");
        button.textContent = t("partnerPoi.calculating");
        Promise.resolve(onPartnerPoiAddToRoute(poi))
          .then(() => {
            if (infoBubbleRef.current) {
              closePartnerPoiBubble();
            }
          })
          .catch(() => {
            button.removeAttribute("disabled");
            button.textContent = t("partnerPoi.addAsRoutePoint");
          });
      });
      content.appendChild(button);

      const bubble = new H.ui.InfoBubble(
        { lat: poi.latitude, lng: poi.longitude },
        { content }
      );
      ui.addBubble(bubble);
      infoBubbleRef.current = bubble;
      infoBubbleModeRef.current = mode;
    },
    [
      cancelPendingHoverClose,
      closeHoverBubble,
      closePartnerPoiBubble,
      onPartnerPoiAddToRoute,
      t,
    ]
  );

  const openRoutePointBubble = React.useCallback(
    (
      point: HereMapRoutePoint,
      index: number,
      mode: "click" | "hover" = "click"
    ) => {
      const H = hereRef.current;
      const ui = uiRef.current;
      if (!H || !ui) return;

      cancelPendingHoverClose();
      closePartnerPoiBubble();

      const content = document.createElement("div");
      content.className = "min-w-[200px] space-y-2 text-sm";
      if (mode === "hover") {
        content.addEventListener("pointerenter", cancelPendingHoverClose);
        content.addEventListener("pointerleave", closeHoverBubble);
      }

      const title = document.createElement("div");
      title.className = "font-semibold";
      title.textContent =
        point.label || `${index + 1}. ${getRoutePointTypeLabel(point.type, t)}`;
      content.appendChild(title);

      const type = document.createElement("div");
      type.className = "text-xs text-muted-foreground";
      type.textContent = `${getRoutePointTypeLabel(point.type, t)} · ${
        point.behavior === "PASS_THROUGH"
          ? t("routePointBehavior.PASS_THROUGH")
          : t("routePointBehavior.STOP")
      }`;
      content.appendChild(type);

      if (point.address) {
        const address = document.createElement("div");
        address.className = "text-xs text-muted-foreground";
        address.textContent = point.address;
        content.appendChild(address);
      }

      const coords = document.createElement("div");
      coords.className = "text-[11px] text-muted-foreground";
      coords.textContent = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
      content.appendChild(coords);

      if (point.partnerPoiId && point.clientId && onPartnerPoiDetachFromRoute) {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "rounded-md border px-2 py-1 text-xs font-medium text-foreground";
        button.textContent = t("partnerPoi.detachFromRoute");
        button.addEventListener("click", () => {
          if (!point.clientId) return;
          button.setAttribute("disabled", "true");
          button.textContent = t("partnerPoi.calculating");
          Promise.resolve(onPartnerPoiDetachFromRoute(point.clientId))
            .then(() => {
              if (infoBubbleRef.current) {
                closePartnerPoiBubble();
              }
            })
            .catch(() => {
              button.removeAttribute("disabled");
              button.textContent = t("partnerPoi.detachFromRoute");
            });
        });
        content.appendChild(button);
      }

      const bubble = new H.ui.InfoBubble(
        { lat: point.latitude, lng: point.longitude },
        { content }
      );
      ui.addBubble(bubble);
      infoBubbleRef.current = bubble;
      infoBubbleModeRef.current = mode;
    },
    [
      cancelPendingHoverClose,
      closeHoverBubble,
      closePartnerPoiBubble,
      onPartnerPoiDetachFromRoute,
      t,
    ]
  );

  const openDriverLocationBubble = React.useCallback(
    (location: DriverMapLocation, mode: "click" | "hover" = "click") => {
      const H = hereRef.current;
      const ui = uiRef.current;
      if (!H || !ui) return;

      cancelPendingHoverClose();
      closePartnerPoiBubble();

      const content = document.createElement("div");
      content.className = "min-w-[210px] space-y-2 text-sm";
      if (mode === "hover") {
        content.addEventListener("pointerenter", cancelPendingHoverClose);
        content.addEventListener("pointerleave", closeHoverBubble);
      }

      const title = document.createElement("div");
      title.className = "font-semibold";
      title.textContent = t("driverLocation");
      content.appendChild(title);

      const updatedAt = document.createElement("div");
      updatedAt.className = "text-xs text-muted-foreground";
      updatedAt.textContent = t("lastRefresh", {
        time: formatDriverLocationTimestamp(location.updatedAt, locale, t("noData")),
      });
      content.appendChild(updatedAt);

      const coords = document.createElement("div");
      coords.className = "text-[11px] text-muted-foreground";
      coords.textContent = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
      content.appendChild(coords);

      if (typeof location.accuracyMeters === "number") {
        const accuracy = document.createElement("div");
        accuracy.className = "text-[11px] text-muted-foreground";
        accuracy.textContent = t("accuracy", {
          meters: Math.round(location.accuracyMeters),
        });
        content.appendChild(accuracy);
      }

      const bubble = new H.ui.InfoBubble(
        { lat: location.latitude, lng: location.longitude },
        { content }
      );
      ui.addBubble(bubble);
      infoBubbleRef.current = bubble;
      infoBubbleModeRef.current = mode;
    },
    [
      cancelPendingHoverClose,
      closeHoverBubble,
      closePartnerPoiBubble,
      locale,
      t,
    ]
  );

  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY;

    if (!apiKey) {
      setError(t("errors.missingApiKey"));
      return;
    }

    const container = mapRef.current;
    if (!container) return;

    let cancelled = false;

    const handleResize = () => {
      mapInstanceRef.current?.getViewPort().resize();
    };

    loadHereMaps()
      .then((H) => {
        if (cancelled || mapInstanceRef.current) return;

        const platform = new H.service.Platform({ apikey: apiKey });
        const defaultLayers = platform.createDefaultLayers();
        defaultLayersRef.current = defaultLayers;
        const map = new H.Map(container, defaultLayers.vector.normal.logistics, {
          center: HARDCODED_CENTER,
          zoom: HARDCODED_ZOOM,
          pixelRatio: window.devicePixelRatio || 1,
        });
        const trafficLayers = createTrafficLayers(H, platform, defaultLayers);
        trafficFlowLayerRef.current = trafficLayers.flow;
        trafficIncidentLayerRef.current = trafficLayers.incident;
        trafficFallbackLayerRef.current = trafficLayers.fallback;

        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        if (showUiControls) {
          uiRef.current = new H.ui.UI(map);
        }

        hereRef.current = H;
        mapInstanceRef.current = map;
        setMapReady(true);
        emitViewportBbox(map, onViewportBboxChange);
        window.addEventListener("resize", handleResize);
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("errors.loadFailed"));
        }
      });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      closePartnerPoiBubble();
      mapInstanceRef.current?.dispose();
      routeGroupRef.current = null;
      poiGroupRef.current = null;
      defaultLayersRef.current = null;
      satelliteVectorLayerRef.current = null;
      trafficFlowLayerRef.current = null;
      trafficIncidentLayerRef.current = null;
      trafficFallbackLayerRef.current = null;
      activeTrafficFlowRef.current = false;
      activeTrafficIncidentRef.current = false;
      activeTrafficFallbackLayerRef.current = null;
      activeSatelliteVectorRef.current = false;
      mapInstanceRef.current = null;
      hereRef.current = null;
      uiRef.current = null;
    };
  }, [closePartnerPoiBubble, onViewportBboxChange, showUiControls, t]);

  React.useEffect(() => {
    const container = mapRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.getViewPort().resize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!mapReady) return;

    const map = mapInstanceRef.current;
    const defaultLayers = defaultLayersRef.current;
    if (!map || !defaultLayers) return;

    applyBaseMapView({
      map,
      defaultLayers,
      mapView,
      satelliteVectorLayerRef,
      activeSatelliteVectorRef,
    });
    applyVehicleRestrictionsVisibility(
      defaultLayers,
      mapView,
      vehicleRestrictionsEnabled
    );
    applyTrafficLayers({
      map,
      defaultLayers,
      mapView,
      trafficFlowEnabled,
      trafficIncidentsEnabled,
      trafficFlowLayer: trafficFlowLayerRef.current,
      trafficIncidentLayer: trafficIncidentLayerRef.current,
      trafficFallbackLayerRef,
      activeTrafficFlowRef,
      activeTrafficIncidentRef,
      activeTrafficFallbackLayerRef,
    });
  }, [
    mapReady,
    mapView,
    trafficFlowEnabled,
    trafficIncidentsEnabled,
    vehicleRestrictionsEnabled,
  ]);

  const zoomMapBy = React.useCallback((delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentZoom =
      map.getViewModel().getLookAtData().zoom ?? HARDCODED_ZOOM;
    map.setZoom(clampNumber(currentZoom + delta, 2, 20));
  }, []);

  React.useEffect(() => {
    if (!mapReady || !onViewportBboxChange) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleViewChangeEnd = () => {
      emitViewportBbox(map, onViewportBboxChange);
    };

    map.addEventListener("mapviewchangeend", handleViewChangeEnd);
    handleViewChangeEnd();

    return () => {
      map.removeEventListener("mapviewchangeend", handleViewChangeEnd);
    };
  }, [mapReady, onViewportBboxChange]);

  React.useEffect(() => {
    if (!mapReady) return;

    const H = hereRef.current;
    const map = mapInstanceRef.current;
    if (!H || !map) return;

    closePartnerPoiBubble();
    const shouldFitViewport =
      lastRouteViewportSignatureRef.current !== routeViewportSignature ||
      lastFitRouteKeyRef.current !== fitRouteKey;

    if (routeGroupRef.current) {
      map.removeObject(routeGroupRef.current);
      routeGroupRef.current = null;
    }

    let fitFrame: number | null = null;
    let resizeFrame: number | null = null;

    const scheduleFit = (fit: () => void) => {
      fitFrame = window.requestAnimationFrame(() => {
        map.getViewPort().resize();
        resizeFrame = window.requestAnimationFrame(() => {
          fit();
          lastRouteViewportSignatureRef.current = routeViewportSignature;
          lastFitRouteKeyRef.current = fitRouteKey;
          emitViewportBbox(map, onViewportBboxChange);
        });
      });
    };

    if (!sortedPoints.length && !driverLocationPoint) {
      if (shouldFitViewport) {
        scheduleFit(() => {
          map.setCenter(HARDCODED_CENTER);
          map.setZoom(HARDCODED_ZOOM);
        });
      }

      return () => {
        cancelAnimationFrameIfNeeded(fitFrame);
        cancelAnimationFrameIfNeeded(resizeFrame);
      };
    }

    routeMarkersRef.current.clear();
    const group = createRouteObjectsGroup(
      H,
      sortedPoints,
      polyline,
      routeMarkersRef.current,
      openRoutePointBubble,
      closeHoverBubble,
      {
        approachPolyline,
        driverLocation: driverLocationPoint,
        onDriverLocationOpen: openDriverLocationBubble,
        onDriverLocationHoverEnd: closeHoverBubble,
      }
    );
    map.addObject(group);
    routeGroupRef.current = group;

    // Re-apply bounce if a marker is currently highlighted
    const currentHighlight = highlightedClientIdRef.current;
    if (currentHighlight) {
      const entry = routeMarkersRef.current.get(currentHighlight);
      if (entry) {
        entry.marker.setIcon(
          entry.point.markerMode === "typed"
            ? createTypedIconBouncing(H, entry.point.type)
            : createNumberedIconBouncing(H, entry.index + 1, entry.point.type)
        );
      }
    }

    if (shouldFitViewport) {
      scheduleFit(() =>
        fitMapToRoutePoints(map, sortedPoints, mapRef.current, driverLocationPoint)
      );
    }

    return () => {
      cancelAnimationFrameIfNeeded(fitFrame);
      cancelAnimationFrameIfNeeded(resizeFrame);

      if (routeGroupRef.current === group) {
        map.removeObject(group);
        routeGroupRef.current = null;
      }
    };
  }, [
    closePartnerPoiBubble,
    closeHoverBubble,
    approachPolyline,
    driverLocationPoint,
    fitRouteKey,
    mapReady,
    onViewportBboxChange,
    openDriverLocationBubble,
    openRoutePointBubble,
    polyline,
    routeViewportSignature,
    sortedPoints,
  ]);

  React.useEffect(() => {
    if (!mapReady) return;

    const H = hereRef.current;
    const map = mapInstanceRef.current;
    if (!H || !map) return;

    closePartnerPoiBubble();

    if (poiGroupRef.current) {
      map.removeObject(poiGroupRef.current);
      poiGroupRef.current = null;
    }

    if (!activePartnerPois.length || !onPartnerPoiAddToRoute) {
      return;
    }

    poiMarkersRef.current.clear();
    const group = createPartnerPoiObjectsGroup(
      H,
      activePartnerPois,
      poiMarkersRef.current,
      openPartnerPoiBubble,
      closeHoverBubble
    );
    map.addObject(group);
    poiGroupRef.current = group;

    const currentPoiHighlight = highlightedPoiIdRef.current;
    if (currentPoiHighlight) {
      const entry = poiMarkersRef.current.get(currentPoiHighlight);
      if (entry) {
        entry.marker.setIcon(
          createTypedIconBouncing(H, entry.poi.type as TransportOrderRoutePointDto["type"])
        );
      }
    }

    return () => {
      if (poiGroupRef.current === group) {
        map.removeObject(group);
        poiGroupRef.current = null;
      }
    };
  }, [
    activePartnerPois,
    closePartnerPoiBubble,
    closeHoverBubble,
    mapReady,
    onPartnerPoiAddToRoute,
    openPartnerPoiBubble,
  ]);

  React.useEffect(() => {
    if (!mapReady) return;
    const H = hereRef.current;
    if (!H) return;

    const prev = prevHighlightedRef.current;
    const current = highlightedClientId ?? null;
    prevHighlightedRef.current = current;

    if (prev === current) return;

    if (prev) {
      const entry = routeMarkersRef.current.get(prev);
      if (entry) {
        entry.marker.setIcon(
          entry.point.markerMode === "typed"
            ? createTypedIcon(H, entry.point.type)
            : createNumberedIcon(H, entry.index + 1, entry.point.type)
        );
      }
    }

    if (current) {
      const entry = routeMarkersRef.current.get(current);
      if (entry) {
        entry.marker.setIcon(
          entry.point.markerMode === "typed"
            ? createTypedIconBouncing(H, entry.point.type)
            : createNumberedIconBouncing(H, entry.index + 1, entry.point.type)
        );
      }
    }
  }, [highlightedClientId, mapReady]);

  React.useEffect(() => {
    if (!mapReady) return;
    const H = hereRef.current;
    if (!H) return;

    const prev = prevHighlightedPoiRef.current;
    const current = highlightedPoiId ?? null;
    prevHighlightedPoiRef.current = current;

    if (prev === current) return;

    if (prev) {
      const entry = poiMarkersRef.current.get(prev);
      if (entry) {
        entry.marker.setIcon(
          createTypedIcon(H, entry.poi.type as TransportOrderRoutePointDto["type"])
        );
      }
    }

    if (current) {
      const entry = poiMarkersRef.current.get(current);
      if (entry) {
        entry.marker.setIcon(
          createTypedIconBouncing(H, entry.poi.type as TransportOrderRoutePointDto["type"])
        );
      }
    }
  }, [highlightedPoiId, mapReady]);

  if (error) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-muted px-4 text-center text-xs text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <>
      <div ref={mapRef} className="absolute inset-0" />

      {/* Initial map load skeleton — fades out once HERE Maps is ready */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-muted transition-opacity duration-500",
          mapReady ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        aria-hidden={mapReady}
      >
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>

      {/* Route / details update indicator — appears on the live map */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 transition-all duration-300",
          mapReady && isUpdating
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0"
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2 rounded-full border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("updatingPosition")}
        </div>
      </div>

      {!sortedPoints.length && mapReady && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm">
          {t("noRoutePoints")}
        </div>
      )}

      {mapReady && (showUiControls || onDriverLocationRefresh) && (
        <div
          className={cn(
            "absolute z-30 flex items-start gap-2 transition-[right,top] duration-500 ease-in-out",
            showUiControls
              ? mapSettingsPositionClassName
              : mapDriverRefreshPositionClassName
          )}
        >
          {onDriverLocationRefresh ? (
            <MapDriverRefreshControl
              isRefreshing={isDriverLocationRefreshing}
              onRefresh={onDriverLocationRefresh}
            />
          ) : null}

          {showUiControls ? (
            <MapSettingsControl
              open={mapSettingsOpen}
              onOpenChange={setMapSettingsOpen}
              mapView={mapView}
              onMapViewChange={setMapView}
              trafficFlowEnabled={trafficFlowEnabled}
              onTrafficFlowEnabledChange={setTrafficFlowEnabled}
              trafficIncidentsEnabled={trafficIncidentsEnabled}
              onTrafficIncidentsEnabledChange={setTrafficIncidentsEnabled}
              vehicleRestrictionsEnabled={vehicleRestrictionsEnabled}
              onVehicleRestrictionsEnabledChange={setVehicleRestrictionsEnabled}
            />
          ) : null}
        </div>
      )}

      {mapReady && showUiControls && (
        <MapZoomControl
          onZoomIn={() => zoomMapBy(1)}
          onZoomOut={() => zoomMapBy(-1)}
          positionClassName={mapZoomPositionClassName}
        />
      )}

    </>
  );
}

function MapDriverRefreshControl({
  isRefreshing,
  onRefresh,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const t = useTranslations("HereMap");

  return (
    <button
      type="button"
      aria-label={t("controls.refreshDriverLocation")}
      title={t("controls.refreshDriverLocation")}
      onClick={onRefresh}
      disabled={isRefreshing}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
    >
      {isRefreshing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
    </button>
  );
}

function MapSettingsControl({
  open,
  onOpenChange,
  mapView,
  onMapViewChange,
  trafficFlowEnabled,
  onTrafficFlowEnabledChange,
  trafficIncidentsEnabled,
  onTrafficIncidentsEnabledChange,
  vehicleRestrictionsEnabled,
  onVehicleRestrictionsEnabledChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapView: HereMapView;
  onMapViewChange: (view: HereMapView) => void;
  trafficFlowEnabled: boolean;
  onTrafficFlowEnabledChange: (checked: boolean) => void;
  trafficIncidentsEnabled: boolean;
  onTrafficIncidentsEnabledChange: (checked: boolean) => void;
  vehicleRestrictionsEnabled: boolean;
  onVehicleRestrictionsEnabledChange: (checked: boolean) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations("HereMap");

  return (
    <motion.div
      initial={false}
      animate={{
        maxHeight: open ? 360 : 40,
        width: open ? 320 : 40,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: "easeInOut" }
      }
      className={cn(
        "overflow-hidden rounded-xl border bg-background/90 text-foreground shadow-lg backdrop-blur-md",
        !open && "cursor-pointer hover:brightness-95 dark:hover:brightness-125"
      )}
      onClick={!open ? () => onOpenChange(true) : undefined}
    >
      <div
        className={cn(
          "flex h-10 items-center transition-colors duration-300",
          open && "border-b"
        )}
      >
        <button
          type="button"
          aria-label={t("settings.open")}
          aria-expanded={open}
          onClick={() => {
            if (!open) onOpenChange(true);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <Settings className="h-4 w-4" />
        </button>

        <div
          className={cn(
            "flex min-w-0 flex-1 items-center transition-all duration-200",
            open
              ? "translate-x-0 opacity-100 delay-200"
              : "pointer-events-none -translate-x-2 opacity-0"
          )}
        >
          <div className="min-w-0 flex-1">
            <span className="truncate text-sm font-semibold">
              {t("settings.title")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("settings.close")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "space-y-4 p-3 transition-opacity duration-200",
          open ? "opacity-100 delay-200" : "pointer-events-none opacity-0"
        )}
      >
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("settings.view")}
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/70 p-1">
            <MapViewButton
              active={mapView === "map"}
              onClick={() => onMapViewChange("map")}
            >
              {t("settings.map")}
            </MapViewButton>
            <MapViewButton
              active={mapView === "satellite"}
              onClick={() => onMapViewChange("satellite")}
            >
              {t("settings.satellite")}
            </MapViewButton>
          </div>
        </div>

        <div className="space-y-3">
          <MapSettingsSwitch
            label={t("settings.trafficFlow")}
            checked={trafficFlowEnabled}
            onCheckedChange={onTrafficFlowEnabledChange}
          />
          <MapSettingsSwitch
            label={t("settings.trafficIncidents")}
            checked={trafficIncidentsEnabled}
            onCheckedChange={onTrafficIncidentsEnabledChange}
          />
          <MapSettingsSwitch
            label={t("settings.vehicleRestrictions")}
            checked={vehicleRestrictionsEnabled}
            onCheckedChange={onVehicleRestrictionsEnabledChange}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MapViewButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-md px-3 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MapSettingsSwitch({
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
      <span className="min-w-0 truncate">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function MapZoomControl({
  onZoomIn,
  onZoomOut,
  positionClassName,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  positionClassName: string;
}) {
  const t = useTranslations("HereMap");

  return (
    <div
      className={cn(
        "absolute z-30 flex w-10 flex-col overflow-hidden rounded-xl border bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-[right,bottom] duration-500 ease-in-out",
        positionClassName
      )}
    >
      <button
        type="button"
        aria-label={t("controls.zoomIn")}
        onClick={onZoomIn}
        className="grid h-10 place-items-center transition-colors hover:bg-muted"
      >
        <Plus className="h-5 w-5" />
      </button>
      <div className="h-px bg-border" />
      <button
        type="button"
        aria-label={t("controls.zoomOut")}
        onClick={onZoomOut}
        className="grid h-10 place-items-center transition-colors hover:bg-muted"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  );
}

function applyBaseMapView({
  map,
  defaultLayers,
  mapView,
  satelliteVectorLayerRef,
  activeSatelliteVectorRef,
}: {
  map: HereMap;
  defaultLayers: HereDefaultLayers;
  mapView: HereMapView;
  satelliteVectorLayerRef: React.MutableRefObject<unknown | null>;
  activeSatelliteVectorRef: React.MutableRefObject<boolean>;
}) {
  if (mapView === "satellite") {
    const baseLayer =
      defaultLayers.hybrid?.logistics?.raster ??
      defaultLayers.hybrid?.day?.raster ??
      defaultLayers.raster?.satellite?.map;
    const vectorLayer =
      defaultLayers.hybrid?.logistics?.vector ??
      defaultLayers.hybrid?.day?.vector ??
      null;

    if (baseLayer) {
      map.setBaseLayer(baseLayer);
    }

    if (
      satelliteVectorLayerRef.current &&
      satelliteVectorLayerRef.current !== vectorLayer &&
      activeSatelliteVectorRef.current
    ) {
      map.removeLayer(satelliteVectorLayerRef.current);
      activeSatelliteVectorRef.current = false;
    }

    satelliteVectorLayerRef.current = vectorLayer;

    if (vectorLayer && !activeSatelliteVectorRef.current) {
      map.addLayer(vectorLayer);
      activeSatelliteVectorRef.current = true;
    }

    return;
  }

  if (satelliteVectorLayerRef.current && activeSatelliteVectorRef.current) {
    map.removeLayer(satelliteVectorLayerRef.current);
    activeSatelliteVectorRef.current = false;
  }

  satelliteVectorLayerRef.current = null;
  map.setBaseLayer(defaultLayers.vector.normal.logistics);
}

function applyVehicleRestrictionsVisibility(
  defaultLayers: HereDefaultLayers,
  mapView: HereMapView,
  enabled: boolean
) {
  const styleLayer =
    mapView === "satellite"
      ? defaultLayers.hybrid?.logistics?.vector ??
        defaultLayers.hybrid?.day?.vector ??
        null
      : defaultLayers.vector.normal.logistics;

  setStyleFeatureVisibility(
    styleLayer,
    VEHICLE_RESTRICTIONS_FEATURE,
    VEHICLE_RESTRICTIONS_MODE,
    enabled
  );
}

function setStyleFeatureVisibility(
  layer: unknown,
  feature: string,
  mode: string,
  enabled: boolean
) {
  const style = getLayerStyle(layer);
  if (!style) return;

  const enabledFeatures = style.getEnabledFeatures() ?? [];
  const nextFeatures = enabledFeatures.filter(
    (item) => item.feature !== feature
  );

  if (enabled) {
    nextFeatures.push({
      feature,
      mode,
    });
  }

  style.setEnabledFeatures(nextFeatures);
}

function getLayerStyle(layer: unknown): HereMapStyle | null {
  if (!layer || typeof layer !== "object") return null;

  const provider = (layer as { getProvider?: () => unknown }).getProvider?.();
  if (!provider || typeof provider !== "object") return null;

  const style = (provider as { getStyle?: () => unknown }).getStyle?.();
  if (!style || typeof style !== "object") return null;

  const candidate = style as Partial<HereMapStyle>;
  return typeof candidate.getEnabledFeatures === "function" &&
    typeof candidate.setEnabledFeatures === "function"
    ? (candidate as HereMapStyle)
    : null;
}

function createTrafficLayers(
  H: HereNamespace,
  platform: {
    getTrafficVectorTileService?: (options: { layer: "flow" | "incident" }) => {
      createLayer(style: unknown): unknown;
    };
  },
  defaultLayers: HereDefaultLayers
) {
  const Style = H.map.render?.harp?.Style;

  if (Style && typeof platform.getTrafficVectorTileService === "function") {
    try {
      return {
        flow: platform
          .getTrafficVectorTileService({ layer: "flow" })
          .createLayer(new Style(TRAFFIC_STYLE_URL)),
        incident: platform.getTrafficVectorTileService({
          layer: "incident",
        }).createLayer(new Style(TRAFFIC_STYLE_URL)),
        fallback: null,
      };
    } catch {
      // Fall back to HERE's bundled traffic layer when separate layers are unavailable.
    }
  }

  return {
    flow: null,
    incident: null,
    fallback: getDefaultTrafficLayer(defaultLayers, "map"),
  };
}

function applyTrafficLayers({
  map,
  defaultLayers,
  mapView,
  trafficFlowEnabled,
  trafficIncidentsEnabled,
  trafficFlowLayer,
  trafficIncidentLayer,
  trafficFallbackLayerRef,
  activeTrafficFlowRef,
  activeTrafficIncidentRef,
  activeTrafficFallbackLayerRef,
}: {
  map: HereMap;
  defaultLayers: HereDefaultLayers;
  mapView: HereMapView;
  trafficFlowEnabled: boolean;
  trafficIncidentsEnabled: boolean;
  trafficFlowLayer: unknown | null;
  trafficIncidentLayer: unknown | null;
  trafficFallbackLayerRef: React.MutableRefObject<unknown | null>;
  activeTrafficFlowRef: React.MutableRefObject<boolean>;
  activeTrafficIncidentRef: React.MutableRefObject<boolean>;
  activeTrafficFallbackLayerRef: React.MutableRefObject<unknown | null>;
}) {
  if (trafficFlowLayer && trafficIncidentLayer) {
    if (activeTrafficFallbackLayerRef.current) {
      map.removeLayer(activeTrafficFallbackLayerRef.current);
      activeTrafficFallbackLayerRef.current = null;
    }

    setMapLayerVisibility(
      map,
      trafficFlowLayer,
      trafficFlowEnabled,
      activeTrafficFlowRef
    );
    setMapLayerVisibility(
      map,
      trafficIncidentLayer,
      trafficIncidentsEnabled,
      activeTrafficIncidentRef
    );
    return;
  }

  if (trafficFlowLayer) {
    setMapLayerVisibility(
      map,
      trafficFlowLayer,
      trafficFlowEnabled || trafficIncidentsEnabled,
      activeTrafficFlowRef
    );
    return;
  }

  const fallbackLayer =
    getDefaultTrafficLayer(defaultLayers, mapView) ?? trafficFallbackLayerRef.current;
  const shouldShowFallback = trafficFlowEnabled || trafficIncidentsEnabled;

  if (
    activeTrafficFallbackLayerRef.current &&
    (!shouldShowFallback ||
      activeTrafficFallbackLayerRef.current !== fallbackLayer)
  ) {
    map.removeLayer(activeTrafficFallbackLayerRef.current);
    activeTrafficFallbackLayerRef.current = null;
  }

  trafficFallbackLayerRef.current = fallbackLayer;

  if (
    shouldShowFallback &&
    fallbackLayer &&
    activeTrafficFallbackLayerRef.current !== fallbackLayer
  ) {
    map.addLayer(fallbackLayer);
    activeTrafficFallbackLayerRef.current = fallbackLayer;
  }
}

function setMapLayerVisibility(
  map: HereMap,
  layer: unknown,
  visible: boolean,
  activeRef: React.MutableRefObject<boolean>
) {
  if (visible && !activeRef.current) {
    map.addLayer(layer);
    activeRef.current = true;
    return;
  }

  if (!visible && activeRef.current) {
    map.removeLayer(layer);
    activeRef.current = false;
  }
}

function getDefaultTrafficLayer(
  defaultLayers: HereDefaultLayers,
  mapView: HereMapView
) {
  if (mapView === "satellite") {
    return (
      defaultLayers.hybrid?.logistics?.traffic ??
      defaultLayers.hybrid?.day?.traffic ??
      defaultLayers.vector.traffic?.logistics ??
      defaultLayers.vector.traffic?.map ??
      null
    );
  }

  return (
    defaultLayers.vector.traffic?.logistics ??
    defaultLayers.vector.traffic?.map ??
    null
  );
}

function createRouteObjectsGroup(
  H: HereNamespace,
  points: HereMapRoutePoint[],
  polyline?: string | null,
  markersMap?: Map<string, MarkerEntry>,
  onMarkerOpen?: (
    point: HereMapRoutePoint,
    index: number,
    mode?: "click" | "hover"
  ) => void,
  onMarkerHoverEnd?: () => void,
  options: {
    approachPolyline?: string | null;
    driverLocation?: DriverMapLocation | null;
    onDriverLocationOpen?: (
      location: DriverMapLocation,
      mode?: "click" | "hover"
    ) => void;
    onDriverLocationHoverEnd?: () => void;
  } = {}
) {
  const group = new H.map.Group();
  const routeLines = decodePolyline(H, polyline);
  const approachLines = decodePolyline(H, options.approachPolyline, {
    lineWidth: 4,
    strokeColor: "rgba(20, 184, 166, 0.9)",
  });

  if (routeLines.length) {
    group.addObjects(routeLines);
  }

  if (approachLines.length) {
    group.addObjects(approachLines);
  }

  group.addObjects(
    points.map((point, index) => {
      const marker = new H.map.DomMarker(
        {
          lat: point.latitude,
          lng: point.longitude,
        },
        {
          icon:
            point.markerMode === "typed"
              ? createTypedIcon(H, point.type)
              : createNumberedIcon(H, index + 1, point.type),
        }
      );
      if (markersMap && point.clientId) {
        markersMap.set(point.clientId, { marker, point, index });
      }
      if (onMarkerOpen) {
        marker.addEventListener("tap", () =>
          onMarkerOpen(point, index, "click")
        );
        marker.addEventListener("pointerenter", () =>
          onMarkerOpen(point, index, "hover")
        );
      }
      if (onMarkerHoverEnd) {
        marker.addEventListener("pointerleave", onMarkerHoverEnd);
      }
      return marker;
    })
  );

  const driverLocation = options.driverLocation;
  if (driverLocation) {
    const marker = new H.map.DomMarker(
      {
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      },
      {
        icon: createDriverLocationIcon(
          H,
          driverLocation.bearingDegrees
        ),
      }
    );
    if (options.onDriverLocationOpen) {
      marker.addEventListener("tap", () =>
        options.onDriverLocationOpen?.(driverLocation, "click")
      );
      marker.addEventListener("pointerenter", () =>
        options.onDriverLocationOpen?.(driverLocation, "hover")
      );
    }
    if (options.onDriverLocationHoverEnd) {
      marker.addEventListener("pointerleave", options.onDriverLocationHoverEnd);
    }
    group.addObject(marker);
  }

  return group;
}

function createPartnerPoiObjectsGroup(
  H: HereNamespace,
  partnerPois: PartnerPoiDto[],
  poiMarkersMap?: Map<string, PoiMarkerEntry>,
  onMarkerOpen?: (poi: PartnerPoiDto, mode?: "click" | "hover") => void,
  onMarkerHoverEnd?: () => void
) {
  const group = new H.map.Group();

  group.addObjects(
    partnerPois.map((poi) => {
      const marker = new H.map.DomMarker(
        { lat: poi.latitude, lng: poi.longitude },
        { icon: createPartnerPoiIcon(H, poi.type) }
      );
      if (poiMarkersMap) {
        poiMarkersMap.set(poi.id, { marker, poi });
      }
      if (onMarkerOpen) {
        marker.addEventListener("tap", () => onMarkerOpen(poi, "click"));
        marker.addEventListener("pointerenter", () =>
          onMarkerOpen(poi, "hover")
        );
      }
      if (onMarkerHoverEnd) {
        marker.addEventListener("pointerleave", onMarkerHoverEnd);
      }
      return marker;
    })
  );

  return group;
}

function formatDriverLocationTimestamp(
  value: string,
  locale: string,
  noDataLabel: string
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return noDataLabel;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function normalizeDriverLocation(
  location?: DriverMapLocation | null
): DriverMapLocation | null {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    return null;
  }

  return location;
}

function buildRouteViewportSignature(
  points: HereMapRoutePoint[],
  polyline?: string | null,
  approachPolyline?: string | null,
  driverLocation?: DriverMapLocation | null
) {
  return JSON.stringify({
    polyline: polyline ?? null,
    approachPolyline: approachPolyline ?? null,
    driverLocation: driverLocation
      ? {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          recordedAt: driverLocation.recordedAt,
        }
      : null,
    points: points.map((point) => ({
      sequence: point.sequence,
      latitude: point.latitude,
      longitude: point.longitude,
    })),
  });
}

function fitMapToRoutePoints(
  map: HereMap,
  points: HereMapRoutePoint[],
  container: HTMLElement | null,
  driverLocation?: DriverMapLocation | null
) {
  const viewportPoints = [
    ...points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    })),
    ...(driverLocation
      ? [
          {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          },
        ]
      : []),
  ];

  if (!viewportPoints.length) {
    map.setCenter(HARDCODED_CENTER);
    map.setZoom(HARDCODED_ZOOM);
    return;
  }

  if (viewportPoints.length === 1) {
    map.setCenter({
      lat: viewportPoints[0].latitude,
      lng: viewportPoints[0].longitude,
    });
    map.setZoom(13);
    return;
  }

  const bbox = viewportPoints.reduce(
    (acc, point) => ({
      north: Math.max(acc.north, point.latitude),
      south: Math.min(acc.south, point.latitude),
      east: Math.max(acc.east, point.longitude),
      west: Math.min(acc.west, point.longitude),
    }),
    {
      north: -90,
      south: 90,
      east: -180,
      west: 180,
    }
  );

  const width = Math.max(container?.clientWidth ?? 800, 320);
  const height = Math.max(container?.clientHeight ?? 600, 240);
  const padding = Math.min(120, Math.max(72, Math.min(width, height) * 0.12));
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);

  const westX = longitudeToWorldX(bbox.west);
  const eastX = longitudeToWorldX(bbox.east);
  const northY = latitudeToWorldY(bbox.north);
  const southY = latitudeToWorldY(bbox.south);
  const deltaX = Math.max(Math.abs(eastX - westX), 0.000001);
  const deltaY = Math.max(Math.abs(southY - northY), 0.000001);
  const zoomX = Math.log2(usableWidth / (TILE_SIZE * deltaX));
  const zoomY = Math.log2(usableHeight / (TILE_SIZE * deltaY));
  const zoom = clampNumber(Math.min(zoomX, zoomY) - 0.35, 2, 15);
  const centerX = (westX + eastX) / 2;
  const centerY = (northY + southY) / 2;

  map.setCenter({
    lat: worldYToLatitude(centerY),
    lng: worldXToLongitude(centerX),
  });
  map.setZoom(zoom);
}

function longitudeToWorldX(longitude: number) {
  return (longitude + 180) / 360;
}

function worldXToLongitude(x: number) {
  return x * 360 - 180;
}

function latitudeToWorldY(latitude: number) {
  const clamped = clampNumber(latitude, -85.05112878, 85.05112878);
  const radians = (clamped * Math.PI) / 180;
  return (
    (1 -
      Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
    2
  );
}

function worldYToLatitude(y: number) {
  return (
    (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) /
    Math.PI
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cancelAnimationFrameIfNeeded(frame: number | null) {
  if (frame !== null) {
    window.cancelAnimationFrame(frame);
  }
}

function decodePolyline(
  H: HereNamespace,
  polyline?: string | null,
  style: { lineWidth: number; strokeColor: string } = {
    lineWidth: 5,
    strokeColor: "rgba(37, 99, 235, 0.85)",
  }
) {
  if (!polyline) return [];

  return polyline
    .split("|")
    .map((sectionPolyline) => sectionPolyline.trim())
    .filter(Boolean)
    .map((sectionPolyline) => {
      const lineString = H.geo.LineString.fromFlexiblePolyline(sectionPolyline);
      return new H.map.Polyline(lineString, {
        style,
      });
    });
}

function getCachedIcon(
  H: HereNamespace,
  key: string,
  factory: () => unknown
) {
  let cache = iconCache.get(H);

  if (!cache) {
    cache = new Map();
    iconCache.set(H, cache);
  }

  const cached = cache.get(key);
  if (cached) return cached;

  const icon = factory();
  cache.set(key, icon);
  return icon;
}

function createNumberedIcon(
  H: HereNamespace,
  number: number,
  type: TransportOrderRoutePointDto["type"]
) {
  const key = `dom:numbered:${type}:${number}`;

  return getCachedIcon(H, key, () => {
    const color = getRoutePointColor(type);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" style="margin:-43px 0 0 -20px" width="40" height="48" viewBox="0 0 40 48"><g transform="translate(4 4)"><path d="M16 39C12 32 4 25 4 15.5C4 8.6 9.4 3 16 3s12 5.6 12 12.5C28 25 20 32 16 39Z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="16" cy="15.5" r="8.5" fill="white"/><text x="16" y="19" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="${color}">${number}</text></g></svg>`;
    return new H.map.DomIcon(svg);
  });
}

function createTypedIcon(
  H: HereNamespace,
  type: TransportOrderRoutePointDto["type"]
) {
  const key = `dom:typed:${type}`;

  return getCachedIcon(H, key, () => {
    const color = getRoutePointColor(type);
    const glyph = getRoutePointGlyphSvg(type, color);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" style="margin:-51px 0 0 -24px" width="48" height="56" viewBox="0 0 48 56"><g transform="translate(4 4)"><path d="M20 47C15 38 5 30 5 18.5C5 9.4 11.7 2 20 2s15 7.4 15 16.5C35 30 25 38 20 47Z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="20" cy="18.5" r="11.5" fill="#fff"/>${glyph}</g></svg>`;
    return new H.map.DomIcon(svg);
  });
}

function createNumberedIconBouncing(
  H: HereNamespace,
  number: number,
  type: TransportOrderRoutePointDto["type"]
) {
  const color = getRoutePointColor(type);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" style="margin:-43px 0 0 -20px" width="40" height="48" viewBox="0 0 40 48"><g><animateTransform attributeName="transform" type="translate" values="0,0; 0,-12; 0,0" dur="0.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" keyTimes="0;0.5;1"/><g transform="translate(4 4)"><path d="M16 39C12 32 4 25 4 15.5C4 8.6 9.4 3 16 3s12 5.6 12 12.5C28 25 20 32 16 39Z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="16" cy="15.5" r="8.5" fill="white"/><text x="16" y="19" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="${color}">${number}</text></g></g></svg>`;
  return new H.map.DomIcon(svg);
}

function createTypedIconBouncing(
  H: HereNamespace,
  type: TransportOrderRoutePointDto["type"]
) {
  const color = getRoutePointColor(type);
  const glyph = getRoutePointGlyphSvg(type, color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" style="margin:-51px 0 0 -24px" width="48" height="56" viewBox="0 0 48 56"><g><animateTransform attributeName="transform" type="translate" values="0,0; 0,-12; 0,0" dur="0.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" keyTimes="0;0.5;1"/><g transform="translate(4 4)"><path d="M20 47C15 38 5 30 5 18.5C5 9.4 11.7 2 20 2s15 7.4 15 16.5C35 30 25 38 20 47Z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="20" cy="18.5" r="11.5" fill="#fff"/>${glyph}</g></g></svg>`;
  return new H.map.DomIcon(svg);
}

function createPartnerPoiIcon(H: HereNamespace, type: PartnerPoiDto["type"]) {
  return createTypedIcon(H, type as TransportOrderRoutePointDto["type"]);
}

function createDriverLocationIcon(
  H: HereNamespace,
  bearingDegrees?: number | null
) {
  const bearing =
    typeof bearingDegrees === "number" && Number.isFinite(bearingDegrees)
      ? Math.round(bearingDegrees)
      : 0;

  return getCachedIcon(H, `dom:driver-location:${bearing}`, () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" overflow="visible" style="margin:-28px 0 0 -28px" width="56" height="56" viewBox="0 0 56 56"><defs><filter id="drvShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dx="0" dy="4"/><feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="28" cy="28" r="23" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.4)" stroke-width="1" filter="url(#drvShadow)"/><circle cx="28" cy="28" r="15" fill="#2563eb"/><g transform="rotate(${bearing} 28 28)"><g transform="translate(18,18) scale(0.85)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2" fill="white"/><circle cx="7" cy="18" r="2" fill="white"/></g></g></svg>`;
    return new H.map.DomIcon(svg);
  });
}

function getRoutePointColor(type: TransportOrderRoutePointDto["type"]) {
  return type === "LOADING"
    ? "#2563eb"
    : type === "UNLOADING"
    ? "#16a34a"
    : type === "FUEL"
    ? "#ea580c"
    : type === "PARKING"
    ? "#0891b2"
    : type === "SERVICE"
    ? "#7c3aed"
    : "#52525b";
}

function getRoutePointGlyphSvg(
  type: TransportOrderRoutePointDto["type"],
  color: string
) {
  if (type === "LOADING") {
    return `<path d="M20 10.5v11M15 16.5l5 5 5-5M14 26.5h12" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (type === "UNLOADING") {
    return `<path d="M20 21.5v-11M15 15.5l5-5 5 5M14 26.5h12" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (type === "FUEL") {
    return `<path d="M14 29V13a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M13 29h12M16 16h6M24 14l4 4v7a2 2 0 0 0 4 0v-4l-3-3" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (type === "PARKING") {
    return `<text x="20" y="25" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" font-weight="800" fill="${color}">P</text>`;
  }

  if (type === "SERVICE") {
    return `<path d="M27 12a5 5 0 0 1-6.5 6.5l-6.2 6.2a2 2 0 1 1-2.8-2.8l6.2-6.2A5 5 0 0 1 24.2 9l-3 3 2.8 2.8 3-3Z" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  return `<circle cx="15" cy="18.5" r="2.1" fill="${color}"/><circle cx="20" cy="18.5" r="2.1" fill="${color}"/><circle cx="25" cy="18.5" r="2.1" fill="${color}"/>`;
}

function getRoutePointTypeLabel(
  type: TransportOrderRoutePointDto["type"],
  t: ReturnType<typeof useTranslations>
) {
  return t(`pointTypes.${type}`);
}

function emitViewportBbox(
  map: HereMap,
  onViewportBboxChange?: (bbox: PartnerPoiBbox) => void
) {
  if (!onViewportBboxChange) return;

  window.requestAnimationFrame(() => {
    const bounds = map.getViewModel().getLookAtData().bounds;
    const bbox = extractBbox(bounds);
    if (bbox) {
      onViewportBboxChange(bbox);
    }
  });
}

function extractBbox(bounds: unknown): PartnerPoiBbox | null {
  if (!bounds || typeof bounds !== "object") return null;

  const source = hasMethod(bounds, "getBoundingBox")
    ? bounds.getBoundingBox()
    : bounds;

  if (!source || typeof source !== "object") return null;

  const north = readBoundsNumber(source, "getTop", "top");
  const south = readBoundsNumber(source, "getBottom", "bottom");
  const west = readBoundsNumber(source, "getLeft", "left");
  const east = readBoundsNumber(source, "getRight", "right");

  if (
    north === null ||
    south === null ||
    west === null ||
    east === null
  ) {
    return null;
  }

  return {
    north: roundBboxCoordinate(north),
    south: roundBboxCoordinate(south),
    east: roundBboxCoordinate(east),
    west: roundBboxCoordinate(west),
  };
}

function hasMethod<T extends string>(
  value: object,
  method: T
): value is Record<T, () => unknown> {
  return method in value && typeof value[method as keyof typeof value] === "function";
}

function readBoundsNumber(
  source: object,
  method: string,
  property: string
): number | null {
  if (hasMethod(source, method)) {
    const value = source[method]();
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  if (property in source) {
    const value = source[property as keyof typeof source];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  return null;
}

function roundBboxCoordinate(value: number): number {
  return Number(value.toFixed(5));
}

function getPartnerPoiTypeLabel(
  type: PartnerPoiDto["type"],
  t: ReturnType<typeof useTranslations>
) {
  return t(`partnerPoiTypes.${type}`);
}

function loadHereMaps(): Promise<HereNamespace> {
  if (window.H) {
    return Promise.resolve(window.H);
  }

  if (!window.__hereMapsLoadPromise) {
    ensureHereStylesheet();
    window.__hereMapsLoadPromise = HERE_SCRIPT_URLS.reduce(
      (promise, url) => promise.then(() => loadScript(url)),
      Promise.resolve()
    ).then(() => {
      if (!window.H) {
        throw new Error("HERE Maps API was not initialized");
      }

      return window.H;
    });
  }

  return window.__hereMapsLoadPromise;
}

function ensureHereStylesheet() {
  if (document.querySelector(`link[href="${HERE_UI_CSS_URL}"]`)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = HERE_UI_CSS_URL;
  document.head.appendChild(link);
}

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`
  );

  if (existing?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.hereMaps = "true";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", () => reject(), { once: true });
    document.body.appendChild(script);
  });
}
