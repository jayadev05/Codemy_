const express = require("express");
const userRoute = require("./routes/user/userRoutes");
const adminRoute = require("./routes/admin/adminRoutes");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const nocache = require("nocache");
const tutorRoute = require("./routes/tutor/tutorRoutes");
const courseRoute = require("./routes/course/courseRoutes");
const paymentRoute = require("./routes/payment/paymentRoutes");
const chatRoute = require("./routes/chat/chatRoutes");
const verifyUser = require("./middleware/authMiddleware");
const { googleAuthCallback } = require('./controller/authController');
require("dotenv").config();

const app = express();
// Create HTTP server
const server = require("http").createServer(app);

// Update CORS options to include Socket.IO specific settings
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
  allowEIO3: true, // Enable Socket.IO version 3
};

app.use(cors(corsOptions));

// Other middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Initialize socket with the server instance
const io = require("./socket/socketEvent").initializeSocket(server);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log(
      `MongoDB connected successfully to ${mongoose.connection.name}`
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/tutor", tutorRoute);
app.use("/course", courseRoute);
app.use("/checkout", verifyUser, paymentRoute);
app.use("/chat", verifyUser, chatRoute);

//google callback
app.get('/oauth2callback', googleAuthCallback);

// Start server
server.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
