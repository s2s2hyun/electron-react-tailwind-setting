import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { useEffect, useRef } from "react";
import "./Two.css";

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export default function Two() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11", // 3D 건물 지원 스타일
      center: [127.0016985, 37.5642135], // 서울 중심 좌표
      zoom: 24,
      pitch: 60, // 카메라 기울기 설정 (3D 효과)
      bearing: -17.6, // 회전 각도
    });

    // 내비게이션 컨트롤 추가
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // 방향 API 컨트롤 추가
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      language: "ko", // 한국어
      controls: {
        inputs: true,
        instructions: true,
        profileSwitcher: true,
      },
    });

    mapRef.current.addControl(directions, "top-left");

    // 3D 건물 추가
    mapRef.current.on("load", () => {
      const layers = mapRef.current?.getStyle().layers;

      if (layers) {
        const labelLayerId = layers.find(
          (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
        )?.id;

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
      }
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <section style={{ width: "100%", height: "100vh" }}>
      <div id="map-container" ref={mapContainerRef} />
    </section>
  );
}
