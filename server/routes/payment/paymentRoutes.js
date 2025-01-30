const express = require("express");
const { createOrder, verifyPayment, getOrderDetails, getOrderHistory } = require("../../controller/paymentController");
const paymentRoute = express.Router();
const verifyUser = require('../../middleware/authMiddleware');

paymentRoute.post('/orders',verifyUser,createOrder);
paymentRoute.post('/payment/verify',verifyPayment);
paymentRoute.get('/order/:orderId/details',verifyUser,getOrderDetails);
paymentRoute.get('/orders/:userId/history',getOrderHistory);



module.exports = paymentRoute;