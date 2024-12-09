import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MapRefs } from "../types";
import { MAP_INITIAL_CONFIG } from "../constants/mapConstants";

const MapboxDirections = require("@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions");

export const useMapInstance = (): MapRefs => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const directionsRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      ...MAP_INITIAL_CONFIG,
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return { mapRef, mapContainerRef, directionsRef };
};
