const express = require("express");
const userRoute = require('./routes/user/userRoutes'); 
const adminRoute = require('./routes/admin/adminRoutes'); 
const authRoute=require ('./routes/authRoutes')
const app = express();
const cors=require('cors')
const mongoose = require('mongoose')
const cookieParser=require('cookie-parser');


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

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:true}));
app.use(cors({
  origin: 'http://localhost:5173', // Your React app's URL
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use("/user", userRoute); 
app.use("/admin",adminRoute)
app.use('/auth',authRoute);

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
