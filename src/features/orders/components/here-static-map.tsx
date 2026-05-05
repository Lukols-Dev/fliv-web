"use client";

import * as React from "react";

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

type HereMap = {
  addObject(object: unknown): void;
  dispose(): void;
  getViewPort(): {
    resize(): void;
  };
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
      createDefault(map: HereMap, layers: HereDefaultLayers): unknown;
    };
  };
  map: {
    Marker: new (point: HereMapPoint) => unknown;
  };
};

declare global {
  interface Window {
    H?: HereNamespace;
    __hereMapsLoadPromise?: Promise<HereNamespace>;
  }
}

export function HereStaticMap() {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<HereMap | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
        H.ui.UI.createDefault(map, defaultLayers);
        map.addObject(new H.map.Marker(HARDCODED_CENTER));

        mapInstanceRef.current = map;
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
      mapInstanceRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-muted px-4 text-center text-xs text-muted-foreground">
        {error}
      </div>
    );
  }

  return <div ref={mapRef} className="absolute inset-0" />;
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
