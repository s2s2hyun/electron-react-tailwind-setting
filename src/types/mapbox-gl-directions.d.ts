declare module "@mapbox/mapbox-gl-directions" {
  import { IControl } from "mapbox-gl";

  export interface DirectionsOptions {
    accessToken: string;
    unit?: "metric" | "imperial";
    profile?: "mapbox/driving" | "mapbox/walking" | "mapbox/cycling";
    language?: string;
    alternatives?: boolean;
    congestion?: boolean;
    controls?: {
      inputs?: boolean;
      instructions?: boolean;
      profileSwitcher?: boolean;
    };
  }

  export default class MapboxDirections implements IControl {
    constructor(options?: DirectionsOptions);
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(map: mapboxgl.Map): void;
    setOrigin(origin: string | [number, number]): void;
    setDestination(destination: string | [number, number]): void;
    addWaypoint(index: number, waypoint: string | [number, number]): void;
    removeWaypoint(index: number): void;
    getOrigin(): string | [number, number];
    getDestination(): string | [number, number];
    getWaypoints(): Array<string | [number, number]>;
    on(event: string, callback: (data: any) => void): void;
  }
}

declare module "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions" {
  export * from "@mapbox/mapbox-gl-directions";
}
