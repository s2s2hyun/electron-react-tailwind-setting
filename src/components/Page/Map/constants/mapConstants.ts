import { MapOptions } from 'mapbox-gl';

export const MAP_INITIAL_CONFIG: Partial<MapOptions> = {
  style: "mapbox://styles/mapbox/streets-v11",
  center: [127.0429, 37.4646] as [number, number], // tuple type으로 명시
  zoom: 14,
  pitch: 60,
  bearing: -17.6,
};

export const WAYPOINTS = [
  { coords: [127.042989, 37.464635], description: "현대자동차 본사" },
  { coords: [127.040637, 37.463697], description: "첫번째 경유지" },
  { coords: [127.039785, 37.463773], description: "두번째 경유지" },
  { coords: [127.022956, 37.49193], description: "세번째 경유지" },
  { coords: [127.015584, 37.51512], description: "네번째 경유지" },
  { coords: [126.996139, 37.509226], description: "다섯번째 경유지" },
  { coords: [126.996046, 37.509928], description: "반포 한강공원" },

  // directionsRef.current?.setOrigin([127.042989, 37.464635]); // 현대자동차 본사
  // directionsRef.current?.addWaypoint(0, [127.040637, 37.463697]); // 첫번째 경유지
  // directionsRef.current?.addWaypoint(1, [127.039785, 37.463773]); // 두번째 경유지
  // directionsRef.current?.addWaypoint(2, [127.022956, 37.49193]); // 세번째 경유지
  // directionsRef.current?.addWaypoint(3, [127.015584, 37.51512]); // 세번째 경유지
  // directionsRef.current?.addWaypoint(4, [126.996139, 37.509226]); // 세번째 경유지

  // directionsRef.current?.setDestination([126.996046, 37.509928]); // 반포 한강공원
];
