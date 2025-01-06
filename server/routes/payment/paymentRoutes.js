const express = require("express");
const { createOrder, verifyPayment, getOrderDetails, getOrderHistory } = require("../../controller/paymentController");
const paymentRoute = express.Router();
const verifyUser = require('../../middleware/authMiddleware');

paymentRoute.post('/order-create',verifyUser,createOrder);
paymentRoute.post('/verify-payment',verifyPayment);
paymentRoute.get('/get-order-details/:orderId',verifyUser,getOrderDetails);
paymentRoute.get('/get-order-history/:userId',getOrderHistory);



module.exports = paymentRoute;