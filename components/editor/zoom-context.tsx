"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;

/** Discrete stops the buttons and keyboard shortcuts step between. */
const STOPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

/** Dot lattice pitch at 100%. Everything on the canvas scales from this. */
export const BASE_DOT_GAP = 18;

const clamp = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

type ZoomContextValue = {
  zoom: number;
  /** Multiply the current zoom. Uses the updater form, so callers never need
   *  to read the current value — which keeps effect dependencies stable. */
  zoomBy: (factor: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

const ZoomContext = createContext<ZoomContextValue | null>(null);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoomState] = useState(1);

  const zoomBy = useCallback(
    (factor: number) => setZoomState((current) => clamp(current * factor)),
    [],
  );

  // Step to the next stop above/below, so buttons land on round numbers even
  // after the wheel has left the zoom on an arbitrary value.
  const zoomIn = useCallback(
    () =>
      setZoomState((current) =>
        clamp(STOPS.find((stop) => stop > current + 0.001) ?? MAX_ZOOM),
      ),
    [],
  );

  const zoomOut = useCallback(
    () =>
      setZoomState((current) =>
        clamp(
          [...STOPS].reverse().find((stop) => stop < current - 0.001) ??
            MIN_ZOOM,
        ),
      ),
    [],
  );

  const reset = useCallback(() => setZoomState(1), []);

  const value = useMemo(
    () => ({ zoom, zoomBy, zoomIn, zoomOut, reset }),
    [zoom, zoomBy, zoomIn, zoomOut, reset],
  );

  return <ZoomContext.Provider value={value}>{children}</ZoomContext.Provider>;
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (!context) throw new Error("useZoom must be used inside <ZoomProvider>");
  return context;
}
