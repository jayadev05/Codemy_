const express = require("express");
const { createOrder, verifyPayment, getOrderDetails } = require("../../controller/paymentController");
const paymentRoute = express.Router();


paymentRoute.post('/order-create',createOrder);
paymentRoute.post('/verify-payment',verifyPayment);
paymentRoute.get('/get-order-details/:orderId',getOrderDetails);


module.exports = paymentRoute;