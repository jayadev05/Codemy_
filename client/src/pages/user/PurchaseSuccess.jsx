import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MainHeader from '../../components/layout/user/MainHeader';
import SecondaryFooter from '../../components/layout/user/SecondaryFooter';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';

const PurchaseCompleted = () => {
  const [courseName, orderNumber, price] = ['Advanced Web Development', 'ORD-25', 3500];

  const {orderId}=useParams();

  const [order,setOrder]=useState({});

  useEffect(()=>{
    const fetchOrderDetails=async()=>{
      try {

        const response=await axios.get(`http://localhost:3000/checkout/get-order-details/${orderId}`);

        setOrder(response.data.order);

      } catch (error) {

        console.log(error);
        
      }
    }

    fetchOrderDetails()
  },[])

  console.log('order in success oage',order);

  const navigate=useNavigate()

  return (
    <>
    <Header/>
    <MainHeader/>
     <div className=" bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-6 text-white text-center">
          <div className="mb-4 inline-block p-2 bg-white rounded-full">
            <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Purchase Successful!</h1>
          <p className="text-orange-200 text-lg">Thank you for investing in your education</p>
        </div>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Details</h2>
            <div className="bg-orange-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><span className="font-medium">Order Number:</span> {order.orderId}</p>
              <p className="text-gray-700"><span className="font-medium">Payment ID:</span> {order.payment?.paymentId}</p>
              <p className="text-gray-700"><span className="font-medium">Total:</span> ₹{order.totalAmount}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Go to Home
            </button>
            <button 
              onClick={() => navigate('/all-courses')}
              className="w-full sm:w-auto bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
    <SecondaryFooter/>
    </>
   
  );
};

export default PurchaseCompleted;

