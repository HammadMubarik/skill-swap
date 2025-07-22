import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useChatSocket = (senderName) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = (messageText) => {
    if (!messageText.trim()) return;

    const payload = {
      text: messageText,
      sender: senderName,
      timestamp: new Date().toLocaleTimeString(),
    };

    socket.current.emit("send_message", payload);
  };

  return { messages, sendMessage };
};

export default useChatSocket;
