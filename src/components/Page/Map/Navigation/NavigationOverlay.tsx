import { NavigationInfo } from '../types';

interface Props {
  navigationInfo: NavigationInfo;
}

export const NavigationOverlay = ({ navigationInfo }: Props) => (
  <div className="fixed z-10 p-4 transform -translate-x-1/2 bg-white rounded-lg shadow-lg top-4 left-1/2">
    <div className="grid grid-cols-2 gap-4">
      <InfoItem 
        label="현재 속도" 
        value={`${navigationInfo.currentSpeed} km/h`} 
      />
      {/* <InfoItem 
        label="남은 시간" 
        value={`${Math.round(navigationInfo.remainingTime / 60)}분`} 
      /> */}
      <InfoItem 
        label="남은 거리" 
        value={`${(navigationInfo.remainingDistance / 1000).toFixed(1)}km`} 
      />
      {/* <InfoItem 
        label="다음 방향" 
        value={navigationInfo.nextTurn || "직진"} 
      /> */}
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);