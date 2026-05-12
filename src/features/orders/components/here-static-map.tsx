"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PartnerPoiBbox,
  PartnerPoiDto,
  TransportOrderRoutePointDto,
} from "../types";

const HARDCODED_CENTER = { lat: 52.2297, lng: 21.0122 };
const HARDCODED_ZOOM = 12;
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
type HereMapRoutePoint = Omit<TransportOrderRoutePointDto, "id"> & {
  clientId?: string;
  id?: string;
  markerMode?: HereMapMarkerMode;
  partnerPoiId?: string;
  partnerPoiName?: string | null;
};

type HereMapPoint = {
  lat: number;
  lng: number;
};

type HereDefaultLayers = {
  vector: {
    normal: {
      map: unknown;
    };
  };
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
    };
    setLookAtData(data: {
      bounds?: unknown;
      position?: HereMapPoint;
      zoom?: number;
    }): void;
  };
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
  partnerPois?: PartnerPoiDto[];
  fitRouteKey?: string | number | null;
  showUiControls?: boolean;
  highlightedClientId?: string | null;
  highlightedPoiId?: string | null;
  isUpdating?: boolean;
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
  partnerPois = [],
  fitRouteKey = null,
  showUiControls = true,
  highlightedClientId,
  highlightedPoiId,
  isUpdating = false,
  onPartnerPoiAddToRoute,
  onPartnerPoiDetachFromRoute,
  onViewportBboxChange,
}: Props) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<HereMap | null>(null);
  const hereRef = React.useRef<HereNamespace | null>(null);
  const uiRef = React.useRef<HereUi | null>(null);
  const routeGroupRef = React.useRef<HereMapGroup | null>(null);
  const poiGroupRef = React.useRef<HereMapGroup | null>(null);
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
  const routeViewportSignature = React.useMemo(
    () => buildRouteViewportSignature(sortedPoints, polyline),
    [polyline, sortedPoints]
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
      title.textContent = poi.name || getPartnerPoiTypeLabel(poi.type);
      content.appendChild(title);

      const type = document.createElement("div");
      type.className = "text-xs text-muted-foreground";
      type.textContent = getPartnerPoiTypeLabel(poi.type);
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
      button.textContent = "Dodaj jako punkt trasy";
      button.addEventListener("click", () => {
        button.setAttribute("disabled", "true");
        button.textContent = "Przeliczanie...";
        Promise.resolve(onPartnerPoiAddToRoute(poi))
          .then(() => {
            if (infoBubbleRef.current) {
              closePartnerPoiBubble();
            }
          })
          .catch(() => {
            button.removeAttribute("disabled");
            button.textContent = "Dodaj jako punkt trasy";
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
        point.label || `${index + 1}. ${getRoutePointTypeLabel(point.type)}`;
      content.appendChild(title);

      const type = document.createElement("div");
      type.className = "text-xs text-muted-foreground";
      type.textContent = `${getRoutePointTypeLabel(point.type)} · ${
        point.behavior === "PASS_THROUGH" ? "Przebieg" : "Postój"
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
        button.textContent = "Odłącz POI od trasy";
        button.addEventListener("click", () => {
          if (!point.clientId) return;
          button.setAttribute("disabled", "true");
          button.textContent = "Przeliczanie...";
          Promise.resolve(onPartnerPoiDetachFromRoute(point.clientId))
            .then(() => {
              if (infoBubbleRef.current) {
                closePartnerPoiBubble();
              }
            })
            .catch(() => {
              button.removeAttribute("disabled");
              button.textContent = "Odłącz POI od trasy";
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
    ]
  );

  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Missing NEXT_PUBLIC_HERE_MAPS_API_KEY");
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
        const map = new H.Map(container, defaultLayers.vector.normal.map, {
          center: HARDCODED_CENTER,
          zoom: HARDCODED_ZOOM,
          pixelRatio: window.devicePixelRatio || 1,
        });

        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        if (showUiControls) {
          uiRef.current = H.ui.UI.createDefault(map, defaultLayers);
        }

        hereRef.current = H;
        mapInstanceRef.current = map;
        setMapReady(true);
        emitViewportBbox(map, onViewportBboxChange);
        window.addEventListener("resize", handleResize);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load HERE map");
        }
      });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      closePartnerPoiBubble();
      mapInstanceRef.current?.dispose();
      routeGroupRef.current = null;
      poiGroupRef.current = null;
      mapInstanceRef.current = null;
      hereRef.current = null;
      uiRef.current = null;
    };
  }, [closePartnerPoiBubble, onViewportBboxChange, showUiControls]);

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

    if (!sortedPoints.length) {
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
      closeHoverBubble
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
      scheduleFit(() => fitMapToRoutePoints(map, sortedPoints, mapRef.current));
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
    fitRouteKey,
    mapReady,
    onViewportBboxChange,
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
        <p className="text-sm text-muted-foreground">Ładowanie mapy…</p>
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
          Aktualizowanie trasy…
        </div>
      </div>

      {!sortedPoints.length && mapReady && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm">
          Brak punktów trasy
        </div>
      )}
    </>
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
  onMarkerHoverEnd?: () => void
) {
  const group = new H.map.Group();
  const routeLines = decodePolyline(H, polyline);

  if (routeLines.length) {
    group.addObjects(routeLines);
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

function buildRouteViewportSignature(
  points: HereMapRoutePoint[],
  polyline?: string | null
) {
  return JSON.stringify({
    polyline: polyline ?? null,
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
  container: HTMLElement | null
) {
  if (!points.length) {
    map.setCenter(HARDCODED_CENTER);
    map.setZoom(HARDCODED_ZOOM);
    return;
  }

  if (points.length === 1) {
    map.setCenter({
      lat: points[0].latitude,
      lng: points[0].longitude,
    });
    map.setZoom(13);
    return;
  }

  const bbox = points.reduce(
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

function decodePolyline(H: HereNamespace, polyline?: string | null) {
  if (!polyline) return [];

  return polyline
    .split("|")
    .map((sectionPolyline) => sectionPolyline.trim())
    .filter(Boolean)
    .map((sectionPolyline) => {
      const lineString = H.geo.LineString.fromFlexiblePolyline(sectionPolyline);
      return new H.map.Polyline(lineString, {
        style: {
          lineWidth: 5,
          strokeColor: "rgba(37, 99, 235, 0.85)",
        },
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

function getRoutePointTypeLabel(type: TransportOrderRoutePointDto["type"]) {
  return type === "LOADING"
    ? "Załadunek"
    : type === "UNLOADING"
    ? "Rozładunek"
    : type === "FUEL"
    ? "Tankowanie"
    : type === "PARKING"
    ? "Parking"
    : type === "SERVICE"
    ? "Serwis"
    : "Inne";
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

function getPartnerPoiTypeLabel(type: PartnerPoiDto["type"]) {
  return type === "FUEL"
    ? "Stacja paliw"
    : type === "PARKING"
    ? "Parking"
    : type === "SERVICE"
    ? "Serwis"
    : "Punkt partnerski";
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
