import React, { useState } from "react";
import { motion } from "framer-motion";

const App = () => {
  const [images] = useState([
    "https://i.etsystatic.com/30429057/r/il/b8cbdf/4714877841/il_570xN.4714877841_4omb.jpg",
    "https://i.pinimg.com/originals/49/c6/93/49c693cd1efffaeb08aee494ca28a4f9.jpg",
    "https://cdnb.artstation.com/p/assets/images/images/055/430/927/large/alexx-ai-art-mmexport1666918795231.jpg",
    "https://pbs.twimg.com/media/Fr1kobpacAIFIy5?format=jpg&name=large",
    "https://img.freepik.com/photos-premium/woman-with-long-hair-and-bright-makeup_976512-4612.jpg",
  ]);

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4 py-10 bg-zinc-900/30 backdrop-blur"
      style={{
        backgroundImage: "url(https://i.redd.it/78xwcik9uwla1.png)",
        backgroundPosition: "bottom",
        backgroundAttachment: "fixed",
      }}
    >
      <ul className="flex gap-4 h-[700px] max-w-5xl">
        {images.map((image, index) => (
          <motion.li
            key={index}
            className="flex-[2] hover:flex-[6] transition-all duration-500 ease-out cursor-pointer"
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="h-full w-full object-cover rounded-3xl shadow-xl"
            />
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default App;
