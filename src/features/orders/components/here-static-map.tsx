"use client";

import * as React from "react";
import type { TransportOrderRoutePointDto } from "../types";

const HARDCODED_CENTER = { lat: 52.2297, lng: 21.0122 };
const HARDCODED_ZOOM = 12;
const HERE_SCRIPT_URLS = [
  "https://js.api.here.com/v3/3.2/mapsjs-core.js",
  "https://js.api.here.com/v3/3.2/mapsjs-service.js",
  "https://js.api.here.com/v3/3.2/mapsjs-mapevents.js",
  "https://js.api.here.com/v3/3.2/mapsjs-ui.js",
] as const;
const HERE_UI_CSS_URL = "https://js.api.here.com/v3/3.2/mapsjs-ui.css";

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

type HereRouteSection = {
  polyline?: string;
  summary?: {
    length?: number;
  };
};

type HereRoutingResult = {
  routes?: Array<{
    sections?: HereRouteSection[];
  }>;
};

type HereRouter = {
  calculateRoute(
    params: Record<string, unknown>,
    onSuccess: (result: HereRoutingResult) => void,
    onError: () => void
  ): void;
};

type HereMap = {
  addObject(object: unknown): void;
  removeObject(object: unknown): void;
  dispose(): void;
  getViewPort(): {
    resize(): void;
  };
  getViewModel(): {
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

type HereNamespace = {
  service: {
    Platform: new (options: { apikey: string }) => {
      createDefaultLayers(): HereDefaultLayers;
      getRoutingService(serviceParams?: unknown, version?: number): HereRouter;
    };
    Url: {
      MultiValueQueryParameter: new (values: string[]) => unknown;
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
      createDefault(map: HereMap, layers: HereDefaultLayers): unknown;
    };
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
    Marker: new (point: HereMapPoint, options?: { icon?: unknown }) => unknown;
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
  routePoints: TransportOrderRoutePointDto[];
  onDistanceMetersChange?: (distanceMeters: number | null) => void;
};

declare global {
  interface Window {
    H?: HereNamespace;
    __hereMapsLoadPromise?: Promise<HereNamespace>;
  }
}

export function HereStaticMap({
  routePoints,
  onDistanceMetersChange,
}: Props) {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<HereMap | null>(null);
  const hereRef = React.useRef<HereNamespace | null>(null);
  const routerRef = React.useRef<HereRouter | null>(null);
  const routeGroupRef = React.useRef<HereMapGroup | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [routeError, setRouteError] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Missing NEXT_PUBLIC_HERE_MAPS_API_KEY"); //TODO: remove
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
        H.ui.UI.createDefault(map, defaultLayers);

        hereRef.current = H;
        routerRef.current = platform.getRoutingService(null, 8);
        mapInstanceRef.current = map;
        setMapReady(true);
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
      mapInstanceRef.current?.dispose();
      routeGroupRef.current = null;
      mapInstanceRef.current = null;
      hereRef.current = null;
      routerRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!mapReady) return;

    const H = hereRef.current;
    const map = mapInstanceRef.current;
    const router = routerRef.current;
    if (!H || !map) return;

    let cancelled = false;
    setRouteError(null);

    if (routeGroupRef.current) {
      map.removeObject(routeGroupRef.current);
      routeGroupRef.current = null;
    }

    if (!sortedPoints.length) {
      onDistanceMetersChange?.(null);
      map.setCenter(HARDCODED_CENTER);
      map.setZoom(HARDCODED_ZOOM);
      return;
    }

    if (sortedPoints.length === 1) {
      onDistanceMetersChange?.(null);
      const group = createRoutePointsGroup(H, sortedPoints);
      map.addObject(group);
      routeGroupRef.current = group;
      map.setCenter({
        lat: sortedPoints[0].latitude,
        lng: sortedPoints[0].longitude,
      });
      map.setZoom(13);
      return () => {
        if (routeGroupRef.current === group) {
          map.removeObject(group);
          routeGroupRef.current = null;
        }
      };
    }

    if (!router) {
      onDistanceMetersChange?.(null);
      setRouteError("Nie udało się wyznaczyć trasy");
      const group = createRoutePointsGroup(H, sortedPoints);
      map.addObject(group);
      routeGroupRef.current = group;
      map.getViewModel().setLookAtData({ bounds: group.getBoundingBox() });
      return;
    }

    const origin = sortedPoints[0];
    const destination = sortedPoints[sortedPoints.length - 1];
    const viaPoints = sortedPoints.slice(1, -1);
    const routingParameters: Record<string, unknown> = {
      routingMode: "fast",
      transportMode: "truck",
      origin: formatRoutePoint(origin),
      destination: formatRoutePoint(destination),
      return: "polyline,summary",
    };

    if (viaPoints.length) {
      routingParameters.via = new H.service.Url.MultiValueQueryParameter(
        viaPoints.map(formatRoutePoint)
      );
    }

    router.calculateRoute(
      routingParameters,
      (result) => {
        if (cancelled) return;

        const sections = result.routes?.[0]?.sections ?? [];
        const lineStrings = sections
          .map((section) =>
            section.polyline
              ? H.geo.LineString.fromFlexiblePolyline(section.polyline)
              : null
          )
          .filter((lineString): lineString is unknown => lineString !== null);

        if (!lineStrings.length) {
          onDistanceMetersChange?.(null);
          setRouteError("Nie udało się wyznaczyć trasy");
          const fallbackGroup = createRoutePointsGroup(H, sortedPoints);
          map.addObject(fallbackGroup);
          routeGroupRef.current = fallbackGroup;
          map
            .getViewModel()
            .setLookAtData({ bounds: fallbackGroup.getBoundingBox() });
          return;
        }

        const routeLines = lineStrings.map(
          (lineString) =>
            new H.map.Polyline(lineString, {
              style: {
                lineWidth: 5,
                strokeColor: "rgba(37, 99, 235, 0.85)",
              },
            })
        );
        const group = createRoutePointsGroup(H, sortedPoints, routeLines);

        map.addObject(group);
        routeGroupRef.current = group;
        map.getViewModel().setLookAtData({ bounds: group.getBoundingBox() });

        const distanceMeters = sections.reduce(
          (sum, section) => sum + (section.summary?.length ?? 0),
          0
        );
        onDistanceMetersChange?.(distanceMeters > 0 ? distanceMeters : null);
      },
      () => {
        if (cancelled) return;

        onDistanceMetersChange?.(null);
        setRouteError("Nie udało się wyznaczyć trasy");
        const fallbackGroup = createRoutePointsGroup(H, sortedPoints);
        map.addObject(fallbackGroup);
        routeGroupRef.current = fallbackGroup;
        map
          .getViewModel()
          .setLookAtData({ bounds: fallbackGroup.getBoundingBox() });
      }
    );

    return () => {
      cancelled = true;
      if (routeGroupRef.current) {
        map.removeObject(routeGroupRef.current);
        routeGroupRef.current = null;
      }
    };
  }, [mapReady, onDistanceMetersChange, sortedPoints]);

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
      {routeError && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm">
          {routeError}
        </div>
      )}
    </>
  );
}

function createRoutePointsGroup(
  H: HereNamespace,
  points: TransportOrderRoutePointDto[],
  routeLines: unknown[] = []
) {
  const group = new H.map.Group();

  if (routeLines.length) {
    group.addObjects(routeLines);
  }

  group.addObjects(
    points.map(
      (point, index) =>
        new H.map.Marker(
          {
            lat: point.latitude,
            lng: point.longitude,
          },
          { icon: createNumberedIcon(H, index + 1, point.type) }
        )
    )
  );

  return group;
}

function formatRoutePoint(point: TransportOrderRoutePointDto): string {
  return `${point.latitude},${point.longitude}`;
}

function createNumberedIcon(
  H: HereNamespace,
  number: number,
  type: TransportOrderRoutePointDto["type"]
) {
  const color =
    type === "LOADING" ? "#2563eb" : type === "UNLOADING" ? "#16a34a" : "#52525b";
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
