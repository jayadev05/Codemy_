const express = require("express");
const userRoute = require('./routes/user/userRoutes');
const adminRoute = require('./routes/admin/adminRoutes');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const nocache = require("nocache");
const tutorRoute = require("./routes/tutor/tutorRoutes");
const courseRoute = require("./routes/course/courseRoutes");
const paymentRoute = require("./routes/payment/paymentRoutes");

const app = express();
const server = require("http").createServer(app);

// Initialize socket with the server instance
const io = require('./socket/socketEvent').initializeSocket(server);

// Database Connection
mongoose.connect("mongodb://localhost:27017/Codemy")
  .then(() => {
    console.log(`MongoDB connected successfully to ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Security Headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'"
  );
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/tutor", tutorRoute);
app.use('/course', courseRoute);
app.use('/checkout', paymentRoute);

// Use server.listen instead of app.listen
server.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});