import React, { useState } from "react";
import "./LeftComponents.css";

interface CustomCSS extends React.CSSProperties {
  "--speed"?: number | string;
}

interface LeftComponentsProps {
  speed: number; // 숫자 타입으로 정의
}

export default function LeftComponents({ speed }: LeftComponentsProps) {
  // const [speed, setSpeed] = useState(0);
  console.log("Received speed in LeftComponents:", speed);
  const maxSpeed = 200;

  return (
    <section className="relative w-1/2 h-full">
      <div className="left-center-circle-wrap">
        <div className="left-center-circle-left">
          <div
            className="circle-speed-top"
            style={{ "--speed": speed } as CustomCSS}
          >
            <div className="circle-speed-middle"></div>
            <div
              className="circle-second-top"
              style={{ "--speed": speed } as CustomCSS}
            ></div>
            <div className="circle-second-middle"></div>
            <div
              className="circle-third-top"
              style={{ "--speed": speed } as CustomCSS}
            ></div>
            <div className="circle-third-middle"></div>
          </div>
          <div className="circle-speed-inner">
            <div className="speed-value">{speed}</div>
            <div className="speed-unit">km/h</div>
          </div>
          <div className="speed-control">
            {/* <button onClick={() => setSpeed(Math.max(speed - 10, 0))}>-</button>
            <button onClick={() => setSpeed(Math.min(speed + 10, maxSpeed))}>
              +
            </button> */}
          </div>
        </div>
        <div className="left-center-circle-center">center</div>
        <div className="left-center-circle-right">right</div>
      </div>
    </section>
  );
}
