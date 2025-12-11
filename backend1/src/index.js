const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { prisma } = require("./config/prisma");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const requestRoutes = require("./routes/requestRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/AppError");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow all origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/chat", chatRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    status: 1,
    message: "Welcome to Barter King API",
  });
});

// Health check route
app.get(
  "/health",
  catchAsync(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 1,
      message: "healthy",
      database: "connected",
    });
  })
);

// Handle 404 routes - catch all unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (must be last)
app.use(errorHandler);

// --- WebSocket (Socket.IO) setup ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log("WebSocket client connected:", socket.id);

  // Join a room scoped to a conversationId
  socket.on("join-room", ({ conversationId }) => {
    if (conversationId) {
      const room = `conversation:${conversationId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    }
  });

  // Receive, persist, and broadcast chat messages
  socket.on("chat:message:send", async (payload) => {
    try {
      const { conversationId, text, senderId, senderName } = payload || {};

      if (!text || !senderId || !conversationId) {
        return;
      }

      // Ensure sender belongs to this conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (
        !conversation ||
        (conversation.participantAId !== senderId &&
          conversation.participantBId !== senderId)
      ) {
        return;
      }

      // Persist message
      const saved = await prisma.chatMessage.create({
        data: {
          text,
          senderId,
          conversationId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Bump conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const message = {
        id: saved.id,
        text: saved.text,
        senderId: saved.senderId,
        senderName: saved.sender.name || senderName || "User",
        conversationId: saved.conversationId,
        createdAt: saved.createdAt,
      };

      const room = `conversation:${conversationId}`;
      io.to(room).emit("chat:message", message);
    } catch (err) {
      console.error("Error handling chat:message:send", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("WebSocket client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
