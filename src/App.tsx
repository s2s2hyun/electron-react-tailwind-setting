import { useEffect, useState } from "react";

import { io } from "socket.io-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./components/Page/Main/Main";
import Two from "./components/Page/Two/Two";

const App = () => {
  // const [windowSize, setWindowSize] = useState({
  //   width: window.innerWidth,
  //   height: window.innerHeight,
  // });

  // const [images] = useState([
  //   "https://i.etsystatic.com/30429057/r/il/b8cbdf/4714877841/il_570xN.4714877841_4omb.jpg",
  //   "https://i.pinimg.com/originals/49/c6/93/49c693cd1efffaeb08aee494ca28a4f9.jpg",
  //   "https://cdnb.artstation.com/p/assets/images/images/055/430/927/large/alexx-ai-art-mmexport1666918795231.jpg",
  //   "https://pbs.twimg.com/media/Fr1kobpacAIFIy5?format=jpg&name=large",
  //   "https://img.freepik.com/photos-premium/woman-with-long-hair-and-bright-makeup_976512-4612.jpg",
  // ]);

  // const [messages, setMessages] = useState([]);
  // const [inputValue, setInputValue] = useState("");

  // useEffect(() => {
  //   // Socket.IO 서버에 연결
  //   const socket = io("http://localhost:3001"); // Socket.IO 서버 주소

  //   // 연결 성공
  //   socket.on("connect", () => {
  //     console.log("WebSocket connected:", socket.id); // 연결 성공 로그
  //   });

  //   // 연결 해제
  //   socket.on("disconnect", () => {
  //     console.log("WebSocket disconnected");
  //   });

  //   // 서버로부터 메시지 수신
  //   socket.on("message", (message) => {
  //     console.log("Message from server:", message);
  //     // setMessages((prev) => [...prev, message]);
  //   });

  //   // 연결 종료 처리
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   // 윈도우 크기 변경 감지
  //   const handleResize = () => {
  //     setWindowSize({
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //     });
  //   };

  //   window.addEventListener("resize", handleResize);

  //   // 클린업
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return (
    <Router>
      <Routes>
        {/* path="/" 경로에서 Home 컴포넌트 렌더링 */}
        <Route path="/" element={<Main />} />
        <Route path="/two" element={<Two />} />
      </Routes>
    </Router>
  );
};

export default App;
