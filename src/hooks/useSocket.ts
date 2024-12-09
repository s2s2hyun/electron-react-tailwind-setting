import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [speed, setSpeed] = useState<number>(0);

  useEffect(() => {
    const socketInstance = io(url);
    setSocket(socketInstance);

    // 데이터 수신
    socketInstance.on("updateSpeed", (value:number) => {
      console.log("Data received:", value);
      setSpeed(value); // 데이터 저장
    });

    // 연결 종료 처리
    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, speed };
}
