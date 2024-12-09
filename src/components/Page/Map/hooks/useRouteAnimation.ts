import { useState, useEffect } from "react";

export const useRouteAnimation = (
  directionsRef: React.MutableRefObject<any>,
  isNavigating: boolean
) => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [routeState, setRouteState] = useState({
    currentPosition: [0, 0] as [number, number],
    speed: 0,
    progress: 0,
  });

  useEffect(() => {
    if (!directionsRef.current) return;

    const directions = directionsRef.current;

    const onRoute = () => {
      const routes = directions._map.getSource("mapbox-directions-route");
      if (routes?._data?.features?.length > 0) {
        const routeCoordinates = routes._data.features[0].geometry.coordinates;
        setCoordinates(routeCoordinates);
      }
    };

    directions.on("route", onRoute);
    return () => directions.off("route", onRoute);
  }, [directionsRef]);

  useEffect(() => {
    if (!isNavigating || coordinates.length === 0) return;

    const animationInterval = setInterval(() => {
      setCurrentPoint((prev) => {
        const next = prev + 1;
        if (next >= coordinates.length) {
          clearInterval(animationInterval);
          return prev;
        }
        setRouteState((prevState) => ({
          ...prevState,
          currentPosition: coordinates[next],
          speed: Math.random() * 20 + 30, // 랜덤 속도
          progress: (next / (coordinates.length - 1)) * 100,
        }));
        return next;
      });
    }, 1000);

    return () => clearInterval(animationInterval);
  }, [isNavigating, coordinates]);

  return routeState;
};
