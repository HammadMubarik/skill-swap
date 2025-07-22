import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useChatSocket from "../hooks/useChatSocket";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
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
  }, []);

  const { messages, sendMessage } = useChatSocket(senderName);

  const handleSend = () => {
    sendMessage(message);
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "15px" }}>
        Back to Dashboard
      </button>
      <h2>Chat with {chatPartner ? chatPartner.name : "..."}</h2>

      <div style={{
        border: "1px solid #ccc",
        padding: "10px",
        height: "300px",
        overflowY: "auto",
        marginBottom: "10px",
        backgroundColor: "#f9f9f9"
      }}>
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
      <button onClick={handleSend} style={{ marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
};

export default Chat;
