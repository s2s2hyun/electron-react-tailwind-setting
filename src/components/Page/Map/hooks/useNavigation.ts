import { useState, useEffect } from "react";
import { NavigationInfo } from "../types";

export const useNavigation = (directionsRef: React.RefObject<any>) => {
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo>({
    currentSpeed: 10,
    remainingTime: 0,
    remainingDistance: 0,
    nextTurn: "",
    currentStep: 0,
  });

  const updateNavigationInfo = () => {
    if (!directionsRef.current) return;

    const route = directionsRef.current.getRoute();
    if (!route) return;

    // 현재 단계의 상세 정보 가져오기
    const steps = route.legs[0].steps;
    const currentStep = steps[navigationInfo.currentStep];

    // 다음 회전 방향 계산
    const nextManeuver = currentStep.maneuver.type;
    let turnDirection = "";

    if (nextManeuver.includes("turn")) {
      if (nextManeuver.includes("right")) {
        turnDirection = "우회전";
      } else if (nextManeuver.includes("left")) {
        turnDirection = "좌회전";
      }
    }

    // 네비게이션 정보 업데이트
    setNavigationInfo((prev) => ({
      ...prev,
      currentSpeed: 10, // 10km/h로 고정
      remainingTime: route.duration * (1 - prev.currentStep / steps.length),
      remainingDistance: route.distance * (1 - prev.currentStep / steps.length),
      nextTurn: turnDirection,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigationInfo.currentStep > 0) {
        updateNavigationInfo();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigationInfo.currentStep]);

  return navigationInfo;
};
