import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import MainHeader from '../../components/layout/user/MainHeader';
import SecondaryFooter from '../../components/layout/user/SecondaryFooter';

const PaymentFailed = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

 
  const order = {
    orderId: orderId || 'ORD-404',
    courseName: 'Advanced Web Development',
    totalAmount: 3500,
  };

  const handleRetryPayment = () => {
    console.log('Retrying payment for order:', orderId);
   
  };

  return (
    <>
    <Header/>
    <MainHeader/>
    <div className="bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-6 text-white text-center">
          <div className="mb-4 inline-block p-2 bg-white rounded-full">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Failed</h1>
          <p className="text-red-200 text-lg">We couldn't process your payment</p>
        </div>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Details</h2>
            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><span className="font-medium">Order Number:</span> {order.orderId}</p>
              <p className="text-gray-700"><span className="font-medium">Course:</span> {order.courseName}</p>
              <p className="text-gray-700"><span className="font-medium">Total:</span> ₹{order.totalAmount}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button 
              onClick={handleRetryPayment}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Retry Payment
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
    <SecondaryFooter/>
    </>
    
  );
};

export default PaymentFailed;

