import { Map as MapboxMap } from "mapbox-gl"; // Map을 MapboxMap으로 별칭 지정
import { MutableRefObject } from 'react';

export interface NavigationInfo {
  currentSpeed: number;
  remainingTime: number;
  remainingDistance: number;
  nextTurn: string;
  currentStep: number;
  currentPosition?: [number, number];
  progress?: number;
}

export interface MapRefs {
  mapRef: MutableRefObject<MapboxMap | null>;
  mapContainerRef: MutableRefObject<HTMLDivElement | null>;
  directionsRef: MutableRefObject<any>;
}

export interface RouteAnimationState {
  currentPosition: [number, number];
  speed: number;
  progress: number;
}