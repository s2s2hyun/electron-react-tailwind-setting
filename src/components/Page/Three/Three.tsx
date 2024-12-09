import React from "react";
import LeftComponents from "./LeftComponents/LeftComponents";
import RightComponents from "./RightComponents/RightComponents";

interface ThreeProps {
  speed: number; // 단순한 숫자 타입으로 정의
}


export default function Three({ speed }: ThreeProps) {
  return (
    <section className="relative w-full h-screen p-4 bg-gray-950">
      <div className="relative flex w-full h-full">
        {/* 왼쪽 계기판 */}
        <LeftComponents speed={speed} />

        {/* 우측 인터페시아  */}
        <RightComponents />
      </div>
    </section>
  );
}
