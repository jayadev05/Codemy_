const express = require("express");
const { createOrder, verifyPayment, getOrderDetails, getOrderHistory } = require("../../controller/paymentController");
const paymentRoute = express.Router();


paymentRoute.post('/order-create',createOrder);
paymentRoute.post('/verify-payment',verifyPayment);
paymentRoute.get('/get-order-details/:orderId',getOrderDetails);
paymentRoute.get('/get-order-history/:userId',getOrderHistory);



module.exports = paymentRoute;