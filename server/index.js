const express = require("express");
const userRoute = require('./routes/user/userRoutes'); 
const adminRoute = require('./routes/admin/adminRoutes'); 
const app = express();
const cors=require('cors')
const mongoose = require('mongoose')
const cookieParser=require('cookie-parser')
const nocache=require("nocache");
const tutorRoute = require("./routes/tutor/tutorRoutes");


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

app.use(nocache());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use("/user", userRoute); 
app.use("/admin",adminRoute);
app.use("/tutor",tutorRoute)


app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
