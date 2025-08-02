import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useChatSocket from "../hooks/useChatSocket";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("User");
  const [chatPartner, setChatPartner] = useState(null);

  // Load user info and chat partner on component mount
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

  // Send message function
  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  // Send message on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="container">
      <div className="page-container">
        {/* Back button */}
        <div className="nav-button">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <h2>Chat with {chatPartner ? chatPartner.name : "..."}</h2>

        {/* Messages display area */}
        <div className="chat-container">
          {messages.length === 0 ? (
            <p style={{ color: "#7f8c8d", textAlign: "center" }}>
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="message">
                <span className="message-sender">{msg.sender}:</span> {msg.text}
                <div className="message-timestamp">{msg.timestamp}</div>
              </div>
            ))
          )}
        </div>

        {/* Message input area */}
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input"
          />
          <button 
            onClick={handleSend} 
            className="btn btn-primary"
            disabled={!message.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;