const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

//  Setup Socket.IO 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true 
  }
});


app.set("io", io);

//  Handle socket connections
io.on("connection", (socket) => {
  console.log(`📡 User connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    console.log(" Message received:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

//  Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

//  API routes
app.use("/api/auth", authRoutes);

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
