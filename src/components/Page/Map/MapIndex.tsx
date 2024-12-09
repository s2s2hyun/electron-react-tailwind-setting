import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { useMapInstance } from "./hooks/useMapInstance";
import { useNavigation } from "./hooks/useNavigation";
import { NavigationOverlay } from "./Navigation/NavigationOverlay";
import "./MapIndex.css";
import { useEffect, useRef, useState } from "react";
import { useRouteAnimation } from "./hooks/useRouteAnimation";
import { NavigationInfo } from "./types";
import polyline from "@mapbox/polyline";

const MapboxDirections = require("@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions");

export default function MapIndex() {
  const { mapRef, mapContainerRef } = useMapInstance();
  // directions를 여기서 직접 관리
  const directionsRef = useRef<any>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0); // 속도 상태
  const [previousPosition, setPreviousPosition] = useState<
    [number, number] | null
  >(null); // 이전 위치
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);

  const calculateBearing = (
    [lng1, lat1]: [number, number],
    [lng2, lat2]: [number, number]
  ): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    const dLng = toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);

    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // 0~360도로 변환
  };

  const calculateDistance = (
    [lng1, lat1]: [number, number],
    [lng2, lat2]: [number, number]
  ): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // 지구 반경 (km)
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 결과를 미터로 반환
  };

  // 1. 속도 기반 애니메이션 지속 시간 계산
  // 현재 easeTo의 duration 값이 고정되어 있어 속도가 빠르게 설정될 수 있습니다.
  // 속도와 거리(좌표 간 거리)를 기반으로 지속 시간을 계산합니다.

  const calculateDuration = (distance: number, speed: number): number => {
    // speed in km/h, distance in meters
    const timeInSeconds = distance / (speed / 3.6); // m/s로 계산
    return Math.min(timeInSeconds * 1000, 2000); // 최대 2초 제한
  };

  // 2. 좌표 간 간격을 조밀하게 보간
  // 좌표 간 이동 거리가 너무 멀면, 속도가 느려도 이동이 급격하게 보입니다.
  // 경로 좌표를 보간하여 간격을 조밀하게 만듭니다.

  const interpolateCoordinates = (
    coordinates: [number, number][],
    factor = 10
  ): [number, number][] => {
    const interpolated: [number, number][] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[i + 1];

      for (let j = 0; j < factor; j++) {
        interpolated.push([
          lng1 + (lng2 - lng1) * (j / factor),
          lat1 + (lat2 - lat1) * (j / factor),
        ]);
      }
    }
    interpolated.push(coordinates[coordinates.length - 1]);
    return interpolated;
  };

  const navigationInfo: NavigationInfo = {
    currentSpeed: currentSpeed, // 계산된 속도
    remainingTime:
      routeCoordinates.length > 0 && currentPosition
        ? ((routeCoordinates.length -
            routeCoordinates.indexOf(currentPosition)) /
            currentSpeed) *
          60
        : 0, // 남은 시간 계산 (분 단위)
    remainingDistance:
      routeCoordinates.length > 0 && currentPosition
        ? routeCoordinates
            .slice(routeCoordinates.indexOf(currentPosition))
            .reduce((acc, coord, index, arr) => {
              if (index === arr.length - 1) return acc; // 마지막 좌표는 거리 계산 제외
              return acc + calculateDistance(coord, arr[index + 1]);
            }, 0)
        : 0, // 남은 거리 계산
    nextTurn: "직진",
    currentStep: 0,
    currentPosition: currentPosition || [0, 0],
    progress:
      routeCoordinates && routeCoordinates.length > 0 && currentPosition
        ? (routeCoordinates.indexOf(currentPosition) /
            routeCoordinates.length) *
          100
        : 0,
  };

  useEffect(() => {
    if (!previousPosition || !currentPosition) {
      setPreviousPosition(currentPosition); // 초기 상태 설정
      return;
    }

    const distance = calculateDistance(previousPosition, currentPosition); // 거리 계산
    const duration = Math.min(300, (distance / currentSpeed) * 1000);
    const timeElapsed = 1; // 1초마다 업데이트되므로 시간 차이는 1초
    let speed = (distance / timeElapsed) * 3.6; // m/s -> km/h 변환

    const MAX_SPEED = 5; // 최대 속도 (km/h)
    if (speed > MAX_SPEED) {
      speed = MAX_SPEED;
    }

    setCurrentSpeed(speed); // 속도 업데이트

    const bearing = calculateBearing(previousPosition, currentPosition); // 방위각 계산

    mapRef.current?.easeTo({
      center: currentPosition, // 현재 위치
      zoom: 18, // 줌 레벨
      pitch: 60, // 카메라 각도
      bearing, // 방위각 설정
      duration, // 애니메이션 지속 시간
    });

    setPreviousPosition(currentPosition); // 이전 위치 업데이트
  }, [currentPosition]);

  useEffect(() => {
    if (!mapRef.current) return;

    (mapboxgl as any).accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;

    mapRef.current.on("load", () => {
      mapRef.current?.addControl(new mapboxgl.NavigationControl(), "top-right");

      const directionsInstance = new MapboxDirections({
        accessToken: (mapboxgl as any).accessToken,
        unit: "metric",
        profile: "mapbox/driving",
        language: "ko",
        controls: {
          inputs: false,
          instructions: true,
          profileSwitcher: false,
          waypoints: false,
        },
        placeholderOrigin: "출발지",
        placeholderDestination: "도착지",
        interactive: false,
        waypointDraggable: false, // 웨이포인트 드래그 비활성화
        addWaypoints: false, // 웨이포인트 추가 비활성화
      });

      // 직접 directionsRef에 할당
      directionsRef.current = directionsInstance;
      mapRef.current?.addControl(directionsInstance, "top-left");

      directionsInstance.on("route", (event: any) => {
        console.log("경로 로드됨:", event);

        const route = event?.route?.[0]; // 첫 번째 경로 확인
        const encodedGeometry = route?.geometry; // Encoded Polyline 데이터

        if (encodedGeometry) {
          try {
            // 기존 경로 디코딩
            const coordinates = polyline
              .decode(encodedGeometry)
              .map(
                ([lat, lng]: [number, number]) => [lng, lat] as [number, number]
              );

            // 보간 작업 추가
            const interpolatedCoordinates = interpolateCoordinates(
              coordinates,
              1
            ); // 10배 보간

            if (interpolatedCoordinates.length > 0) {
              setRouteCoordinates(interpolatedCoordinates); // 보간된 경로 설정
              setIsRouteLoaded(true);
              setCurrentPosition(interpolatedCoordinates[0]); // 첫 번째 좌표 설정
            } else {
              console.error("디코딩된 좌표가 없습니다.");
              setIsRouteLoaded(false);
            }
          } catch (error) {
            console.error("Polyline 디코딩 실패:", error);
            setIsRouteLoaded(false);
          }
        } else {
          console.error("유효하지 않은 경로 데이터:", event.route);
          setIsRouteLoaded(false);
        }
      });

      // 경로 레이어 추가
      // 경로 레이어 추가 부분
      mapRef.current?.addSource("route-full", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      mapRef.current?.addSource("route-traveled", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      // 기존의 단일 레이어 대신 두 개의 레이어 추가
      mapRef.current?.addLayer({
        id: "route-full",
        type: "line",
        source: "route-full",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.5,
        },
      });
      // 이미 지나온 내비길 , 회색길
      mapRef.current?.addLayer({
        id: "route-traveled",
        type: "line",
        source: "route-traveled",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#808080",
          "line-width": 8,
          "line-opacity": 0.9,
        },
      });

      setTimeout(() => {
        directionsInstance.setOrigin([127.042989, 37.464635]);
        directionsInstance.addWaypoint(0, [127.040637, 37.463697]);
        directionsInstance.addWaypoint(1, [127.039785, 37.463773]);
        directionsInstance.addWaypoint(2, [127.022956, 37.49193]);
        directionsInstance.addWaypoint(3, [127.015584, 37.51512]);
        directionsInstance.addWaypoint(4, [126.996139, 37.509226]);
        directionsInstance.setDestination([126.996046, 37.509928]);
      }, 1000);

      const layers = mapRef.current?.getStyle()?.layers;
      if (!layers) return;

      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
      )?.id;

      if (!labelLayerId) return;

      mapRef.current?.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !currentPosition || !routeCoordinates.length) return;

    const currentIndex = routeCoordinates.findIndex(
      (coord) =>
        coord[0] === currentPosition[0] && coord[1] === currentPosition[1]
    );

    if (currentIndex === -1) return;

    try {
      const routeFullSource = mapRef.current.getSource("route-full") as any;
      const routeTraveledSource = mapRef.current.getSource(
        "route-traveled"
      ) as any;

      if (!routeFullSource || !routeTraveledSource) {
        console.error(
          "소스가 존재하지 않습니다: route-full 또는 route-traveled"
        );
        return;
      }

      // 전체 경로 업데이트
      routeFullSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      });

      // 지나간 경로 업데이트
      const traveledCoordinates = routeCoordinates.slice(0, currentIndex + 1);
      routeTraveledSource.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: traveledCoordinates,
        },
      });
    } catch (error) {
      console.error("경로 업데이트 중 오류:", error);
    }
  }, [currentPosition, routeCoordinates]);

  // 마커 이동 및 카메라 이동
  useEffect(() => {
    if (!isNavigating || routeCoordinates.length === 0) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= routeCoordinates.length) {
        clearInterval(interval);
        setIsNavigating(false);
        return;
      }

      const nextPosition = routeCoordinates[currentIndex];
      const distance = calculateDistance(previousPosition!, currentPosition!);
      const duration = calculateDuration(distance, 200); // 10km/h 기준

      setCurrentPosition(nextPosition);

      mapRef.current?.easeTo({
        center: nextPosition,
        zoom: 18,
        pitch: 60,
        duration,
      });

      currentIndex++;
    }, 1000);

    return () => clearInterval(interval);
  }, [isNavigating, routeCoordinates]);

  // 현재 위치에 마커 표시
  useEffect(() => {
    if (!mapRef.current || !currentPosition) {
      console.log("currentPosition이 null이거나 지도 객체가 없습니다.");
      return;
    }

    console.log("currentPosition:", currentPosition);

    const el = document.createElement("div");
    el.className = "current-location-marker";
    el.style.backgroundImage = `url('/marker/marker.png')`; // public 폴더의 이미지 경로
    el.style.width = "30px"; // 이미지 너비
    el.style.height = "30px"; // 이미지 높이
    el.style.backgroundSize = "cover"; // 배경 크기
    el.style.borderRadius = "50%"; // 둥근 모서리 (선택 사항)

    const marker = new mapboxgl.Marker(el)
      .setLngLat(currentPosition)
      .addTo(mapRef.current);

    return () => {
      marker.remove();
    };
  }, [currentPosition]);

  // 화살표 마커를 위한 useEffect 추가
  useEffect(() => {
    if (!mapRef.current) return;

    const arrowEl = document.createElement("div");
    arrowEl.className = "direction-arrow";

    // 화살표 이미지 스타일
    arrowEl.style.backgroundImage = `url('/marker/arrow-right.png')`;
    arrowEl.style.width = "35px";
    arrowEl.style.height = "35px";
    arrowEl.style.backgroundSize = "contain";
    arrowEl.style.backgroundRepeat = "no-repeat";

    // 초기 위치와 방향
    const initialLngLat: [number, number] = [127.03658, 37.460792];
    const targetLngLat: [number, number] = [127.040637, 37.463697];

    // 방위각 계산
    const calculateBearing = (
      [lng1, lat1]: [number, number],
      [lng2, lat2]: [number, number]
    ): number => {
      const toRadians = (deg: number) => (deg * Math.PI) / 180;
      const toDegrees = (rad: number) => (rad * 180) / Math.PI;

      const dLng = toRadians(lng2 - lng1);
      const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
      const x =
        Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);

      const bearing = toDegrees(Math.atan2(y, x));
      return (bearing + 360) % 360; // 0~360도로 변환
    };

    // 방위각 계산
    const bearing = calculateBearing(initialLngLat, targetLngLat);

    // 화살표 마커 생성
    const arrowMarker = new mapboxgl.Marker({ element: arrowEl })
      .setLngLat(initialLngLat)
      .addTo(mapRef.current);

    // `transform` 스타일로 회전 설정
    arrowEl.style.transform = `
      translate(-50%, -50%)
      rotate(${bearing}deg)
    `;

    return () => {
      arrowMarker.remove();
    };
  }, []);

  // 2번째  화살표 마커를 위한 useEffect 추가
  useEffect(() => {
    if (!mapRef.current) return;

    const arrowEl = document.createElement("div");
    arrowEl.className = "direction-arrow2";

    // 화살표 이미지 스타일
    arrowEl.style.backgroundImage = `url('/marker/arrow-right.png')`;
    arrowEl.style.width = "35px";
    arrowEl.style.height = "35px";
    arrowEl.style.backgroundSize = "contain";
    arrowEl.style.backgroundRepeat = "no-repeat";

    // 초기 위치와 방향
    const initialLngLat: [number, number] = [127.040472, 37.463641];
    const targetLngLat: [number, number] = [127.040472, 37.463191];

    // 방위각 계산
    const calculateBearing = (
      [lng1, lat1]: [number, number],
      [lng2, lat2]: [number, number]
    ): number => {
      const toRadians = (deg: number) => (deg * Math.PI) / 180;
      const toDegrees = (rad: number) => (rad * 180) / Math.PI;

      const dLng = toRadians(lng2 - lng1);
      const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
      const x =
        Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);

      const bearing = toDegrees(Math.atan2(y, x));
      return (bearing + 360) % 360; // 0~360도로 변환
    };

    // 방위각 계산
    const bearing = calculateBearing(initialLngLat, targetLngLat);

    // 화살표 마커 생성
    const arrowMarker = new mapboxgl.Marker({ element: arrowEl })
      .setLngLat(initialLngLat)
      .addTo(mapRef.current);

    // `transform` 스타일로 회전 설정
    arrowEl.style.transform = `
      translate(-50%, -50%)
      rotate(${bearing}deg)
    `;

    return () => {
      arrowMarker.remove();
    };
  }, []);

  const toggleNavigation = () => {
    if (!isRouteLoaded || !routeCoordinates.length) {
      alert("경로가 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
      return;
    }
    setIsNavigating((prev) => !prev); // 탐색 시작/정지 토글
  };

  return (
    <section style={{ width: "100%", height: "100vh" }}>
      {/* <NavigationOverlay navigationInfo={navigationInfo} /> */}
      <button
        onClick={toggleNavigation}
        className="fixed z-10 px-6 py-2 text-white transform -translate-x-1/2 bg-blue-500 rounded-lg shadow-lg bottom-4 left-1/2 hover:bg-blue-600"
      >
        {isNavigating ? "정지" : "시작"}
      </button>
      <div
        id="map-container"
        ref={(el) => {
          if (el) mapContainerRef.current = el;
        }}
      />
    </section>
  );
}
