import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const socket = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [senderName, setSenderName] = useState("User");
  const [chatPartner, setChatPartner] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setSenderName(parsedUser.name || "User");
    }

    const storedChatUser = localStorage.getItem("chatUser");
    if (storedChatUser) {
      setChatPartner(JSON.parse(storedChatUser));
    }

    socket.current = io("http://localhost:5000");

    socket.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;
    const payload = {
      text: message,
      sender: senderName,
      timestamp: new Date().toLocaleTimeString(),
    };
    socket.current.emit("send_message", payload);
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💬 Chat with {chatPartner ? chatPartner.name : "..."}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.text}{" "}
            <em style={{ fontSize: "0.8em" }}>({msg.timestamp})</em>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "70%" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
};

export default Chat;
