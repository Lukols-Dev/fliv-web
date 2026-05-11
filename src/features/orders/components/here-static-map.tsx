"use client";

import * as React from "react";
import { ROUTE_POINT_ICON_PATHS } from "../lib/route-point-icons";
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
const iconCache = new WeakMap<HereNamespace, Map<string, unknown>>();

export type HereMapMarkerMode = "numbered" | "typed";
type HereMapRoutePoint = Omit<TransportOrderRoutePointDto, "id"> & {
  id?: string;
  markerMode?: HereMapMarkerMode;
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
    Marker: new (
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

type Props = {
  routePoints: HereMapRoutePoint[];
  polyline?: string | null;
  partnerPois?: PartnerPoiDto[];
  showUiControls?: boolean;
  onPartnerPoiAddToRoute?: (poi: PartnerPoiDto) => void;
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
  showUiControls = true,
  onPartnerPoiAddToRoute,
  onViewportBboxChange,
}: Props) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<HereMap | null>(null);
  const hereRef = React.useRef<HereNamespace | null>(null);
  const uiRef = React.useRef<HereUi | null>(null);
  const routeGroupRef = React.useRef<HereMapGroup | null>(null);
  const poiGroupRef = React.useRef<HereMapGroup | null>(null);
  const infoBubbleRef = React.useRef<unknown | null>(null);
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

  const closePartnerPoiBubble = React.useCallback(() => {
    const ui = uiRef.current;
    const bubble = infoBubbleRef.current;
    if (ui && bubble) {
      ui.removeBubble(bubble);
    }
    infoBubbleRef.current = null;
  }, []);

  const openPartnerPoiBubble = React.useCallback(
    (poi: PartnerPoiDto) => {
      const H = hereRef.current;
      const ui = uiRef.current;
      if (!H || !ui || !onPartnerPoiAddToRoute) return;

      closePartnerPoiBubble();

      const content = document.createElement("div");
      content.className = "min-w-[180px] space-y-2 text-sm";

      const title = document.createElement("div");
      title.className = "font-semibold";
      title.textContent = poi.name || getPartnerPoiTypeLabel(poi.type);
      content.appendChild(title);

      const address = document.createElement("div");
      address.className = "text-xs text-muted-foreground";
      address.textContent = poi.address;
      content.appendChild(address);

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground";
      button.textContent = "Dodaj do trasy";
      button.addEventListener("click", () => {
        onPartnerPoiAddToRoute(poi);
        closePartnerPoiBubble();
      });
      content.appendChild(button);

      const bubble = new H.ui.InfoBubble(
        { lat: poi.latitude, lng: poi.longitude },
        { content }
      );
      ui.addBubble(bubble);
      infoBubbleRef.current = bubble;
    },
    [closePartnerPoiBubble, onPartnerPoiAddToRoute]
  );

  const openRoutePointBubble = React.useCallback(
    (point: HereMapRoutePoint, index: number) => {
      const H = hereRef.current;
      const ui = uiRef.current;
      if (!H || !ui) return;

      closePartnerPoiBubble();

      const content = document.createElement("div");
      content.className = "min-w-[200px] space-y-2 text-sm";

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

      const bubble = new H.ui.InfoBubble(
        { lat: point.latitude, lng: point.longitude },
        { content }
      );
      ui.addBubble(bubble);
      infoBubbleRef.current = bubble;
    },
    [closePartnerPoiBubble]
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

    if (routeGroupRef.current) {
      map.removeObject(routeGroupRef.current);
      routeGroupRef.current = null;
    }

    if (!sortedPoints.length) {
      map.setCenter(HARDCODED_CENTER);
      map.setZoom(HARDCODED_ZOOM);
      emitViewportBbox(map, onViewportBboxChange);
      return;
    }

    const group = createRouteObjectsGroup(
      H,
      sortedPoints,
      polyline,
      openRoutePointBubble
    );
    map.addObject(group);
    routeGroupRef.current = group;

    if (sortedPoints.length === 1) {
      map.setCenter({
        lat: sortedPoints[0].latitude,
        lng: sortedPoints[0].longitude,
      });
      map.setZoom(13);
      emitViewportBbox(map, onViewportBboxChange);
      return;
    }

    map.getViewModel().setLookAtData({ bounds: group.getBoundingBox() });
    emitViewportBbox(map, onViewportBboxChange);

    return () => {
      if (routeGroupRef.current === group) {
        map.removeObject(group);
        routeGroupRef.current = null;
      }
    };
  }, [
    closePartnerPoiBubble,
    mapReady,
    onViewportBboxChange,
    openRoutePointBubble,
    polyline,
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

    const group = createPartnerPoiObjectsGroup(
      H,
      activePartnerPois,
      openPartnerPoiBubble
    );
    map.addObject(group);
    poiGroupRef.current = group;

    return () => {
      if (poiGroupRef.current === group) {
        map.removeObject(group);
        poiGroupRef.current = null;
      }
    };
  }, [
    activePartnerPois,
    closePartnerPoiBubble,
    mapReady,
    onPartnerPoiAddToRoute,
    openPartnerPoiBubble,
  ]);

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
      {!sortedPoints.length && (
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
  onMarkerTap?: (point: HereMapRoutePoint, index: number) => void
) {
  const group = new H.map.Group();
  const routeLines = decodePolyline(H, polyline);

  if (routeLines.length) {
    group.addObjects(routeLines);
  }

  group.addObjects(
    points.map((point, index) => {
      const marker = new H.map.Marker(
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
      if (onMarkerTap) {
        marker.addEventListener("tap", () => onMarkerTap(point, index));
      }
      return marker;
    })
  );

  return group;
}

function createPartnerPoiObjectsGroup(
  H: HereNamespace,
  partnerPois: PartnerPoiDto[],
  onMarkerTap: (poi: PartnerPoiDto) => void
) {
  const group = new H.map.Group();

  group.addObjects(
    partnerPois.map((poi) => {
      const marker = new H.map.Marker(
        { lat: poi.latitude, lng: poi.longitude },
        { icon: createPartnerPoiIcon(H, poi.type) }
      );
      marker.addEventListener("tap", () => onMarkerTap(poi));
      return marker;
    })
  );

  return group;
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
  const key = `numbered:${type}:${number}`;

  return getCachedIcon(H, key, () => {
    const color = getRoutePointColor(type);
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 39C12 32 4 25 4 15.5C4 8.6 9.4 3 16 3s12 5.6 12 12.5C28 25 20 32 16 39Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="15.5" r="8.5" fill="white"/>
        <text x="16" y="19" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="${color}">${number}</text>
      </svg>
    `);

    return new H.map.Icon(`data:image/svg+xml;charset=UTF-8,${svg}`, {
      size: { w: 32, h: 40 },
      anchor: { x: 16, y: 39 },
    });
  });
}

function createTypedIcon(
  H: HereNamespace,
  type: TransportOrderRoutePointDto["type"]
) {
  const iconPath = ROUTE_POINT_ICON_PATHS[type];
  const key = `typed:${type}:${iconPath}`;

  return getCachedIcon(H, key, () =>
    new H.map.Icon(iconPath, {
      size: { w: 40, h: 48 },
      anchor: { x: 20, y: 47 },
    })
  );
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
