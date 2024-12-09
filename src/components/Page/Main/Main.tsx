import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/two`);
  };

  const [images] = useState([
    "https://i.etsystatic.com/30429057/r/il/b8cbdf/4714877841/il_570xN.4714877841_4omb.jpg",
    "https://i.pinimg.com/originals/49/c6/93/49c693cd1efffaeb08aee494ca28a4f9.jpg",
    "https://cdnb.artstation.com/p/assets/images/images/055/430/927/large/alexx-ai-art-mmexport1666918795231.jpg",
    "https://pbs.twimg.com/media/Fr1kobpacAIFIy5?format=jpg&name=large",
    "https://img.freepik.com/photos-premium/woman-with-long-hair-and-bright-makeup_976512-4612.jpg",
  ]);

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

  useEffect(() => {
    // 윈도우 크기 변경 감지
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // 클린업
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-10 bg-zinc-900/30 backdrop-blur"
      style={{
        backgroundImage: "url(https://i.redd.it/78xwcik9uwla1.png)",
        backgroundPosition: "bottom",
        backgroundAttachment: "fixed",
      }}
    >
      {/* <Header /> */}

      <div
        className="fixed z-50 px-4 py-2 font-mono text-white rounded-lg top-4 right-4 bg-black/70"
        style={{ zIndex: 1000 }}
      >
        {windowSize.width} x {windowSize.height}px
      </div>

      <ul className="flex gap-4 h-[520px] max-w-5xl">
        {images.map((image, index) => (
          <motion.li
            key={index}
            className="flex-[2] hover:flex-[6] transition-all duration-500 ease-out cursor-pointer"
            onClick={handleCardClick}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="object-cover w-full h-full shadow-xl rounded-3xl"
            />
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Main;
