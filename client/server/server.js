import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend url
    methods: ["GET", "POST"]
  }
});

/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/apply", applicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/messages", messageRoutes);

/* Test Route */
app.get("/", (req, res) => {
  res.send("TaskMate API is running...");
});

/* MongoDB Connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

/* Socket.IO Chat Logic */
io.on("connection", (socket) => {
  console.log("New user connected to chat:", socket.id);

  // Join a room specifically for a task
  socket.on("join_task", (taskId) => {
    socket.join(taskId);
    console.log(`User joined task room: ${taskId}`);
  });

  // Handle incoming message
  socket.on("send_message", async (data) => {
    const { taskId, senderId, text } = data;

    try {
      // Save to database
      const newMessage = await Message.create({
        task: taskId,
        sender: senderId,
        text,
      });

      // Populate sender name before emitting back
      const populatedMessage = await newMessage.populate("sender", "name role");

      // Broadcast to everyone in the room
      io.to(taskId).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* Server Setup */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});