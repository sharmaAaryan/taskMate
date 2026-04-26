import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../App.css";

const TaskChat = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [taskDetails, setTaskDetails] = useState(null);
  const userId = localStorage.getItem("userId");
  const socketRef = useRef();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    // Connect to socket
    socketRef.current = io("http://localhost:5000");

    // Join room
    socketRef.current.emit("join_task", taskId);

    // Fetch previous messages & task details
    const fetchData = async () => {
      try {
        const [msgRes, taskRes] = await Promise.all([
          fetch(`http://localhost:5000/api/messages/${taskId}`),
          fetch(`http://localhost:5000/api/tasks/${taskId}`)
        ]);
        const msgData = await msgRes.json();
        const taskData = await taskRes.json();
        
        setMessages(msgData);
        setTaskDetails(taskData);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [taskId, userId, navigate]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageData = {
      taskId,
      senderId: userId,
      text,
    };

    socketRef.current.emit("send_message", messageData);
    setText("");
  };

  if (!taskDetails) return <div className="text-center mt-15 text-xl font-bold">Loading chat...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header-flex">
        <h2 className="dashboard-title">💬 Chat for Task: {taskDetails.title}</h2>
        <button onClick={() => navigate(-1)} className="secondary" style={{ padding: "8px 16px" }}>Back</button>
      </div>

      <div className="task-card-modern" style={{ display: "flex", flexDirection: "column", height: "60vh", padding: "0" }}>
        
        {/* Chat Messages Area */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.length === 0 && (
            <div className="text-center text-muted mt-15">No messages yet. Start the conversation!</div>
          )}
          
          {messages.map((msg, idx) => {
            const isMe = msg.sender?._id === userId;
            return (
              <div key={idx} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                <span style={{ fontSize: "11px", color: "#6c757d", display: "block", marginBottom: "2px", textAlign: isMe ? "right" : "left" }}>
                  {msg.sender?.name} {msg.sender?.role ? `(${msg.sender.role})` : ""}
                </span>
                <div style={{
                  padding: "10px 15px",
                  borderRadius: "15px",
                  background: isMe ? "#4f46e5" : "#e9ecef",
                  color: isMe ? "white" : "black",
                  borderBottomRightRadius: isMe ? "0" : "15px",
                  borderBottomLeftRadius: !isMe ? "0" : "15px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: "10px", color: "#adb5bd", display: "block", marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Area */}
        <form onSubmit={sendMessage} style={{ display: "flex", padding: "15px", background: "white", borderTop: "1px solid #eee", gap: "10px" }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1, padding: "12px", borderRadius: "20px", border: "1px solid #ddd", outline: "none" }}
          />
          <button type="submit" className="primary" style={{ borderRadius: "20px", padding: "0 20px" }}>Send</button>
        </form>

      </div>
    </div>
  );
};

export default TaskChat;
