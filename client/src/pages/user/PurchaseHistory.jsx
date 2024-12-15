import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, CreditCard, DollarSign, IndianRupeeIcon } from 'lucide-react';
import Header from '../../components/layout/Header';
import MainHeader from '../../components/layout/user/MainHeader';
import SecondaryFooter from '../../components/layout/user/SecondaryFooter';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/userSlice';
import Pagination from '../../components/utils/Pagination';
import Tabs from '../../components/layout/user/Tabs';

const PurchaseHistory = () => {
    const user = useSelector(selectUser);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderPerPage=3;
    const [currentPage,setCurrentPage]=useState(1);


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:3000/checkout/get-order-history/${user._id}`);
                setOrders(response.data.data);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch orders', error);
                setError('Failed to load order history. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user._id]);


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

   
    const renderPaymentMethodIcon = (method) => {
        switch(method.toUpperCase()) {
            case 'UPI':
                return <IndianRupeeIcon className="w-3 h-3" />;
            case 'CREDIT CARD':
                return <CreditCard className="w-3 h-3" />;
            default:
                return <IndianRupeeIcon className="w-3 h-3" />;
        }
    };

    const paginateData = (data) => {
        const startIndex = currentPage * orderPerPage - orderPerPage;
        const endIndex = startIndex + orderPerPage;
        return data.slice(startIndex, endIndex);
      };

      const filteredOrder=paginateData(orders);

    return (
        <>
            <Header />
            <MainHeader />
            <Tabs/>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 p-6">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center text-gray-500 p-6">
                    No order history found
                </div>
            ) : (
                <div className="max-w-3xl mx-auto p-6">
                    <h1 className="text-2xl font-semibold mb-6">Order History</h1>
                    
                    <div className="space-y-4">
                        {filteredOrder.map((order) => {
                            // Assuming course is an object with numeric keys
                            const course = order.course['0'];
                            
                            return (
                                <div 
                                    key={order.orderId} 
                                    className="flex items-start gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                                >
                                    <img
                                        src={course.thumbnail || '/placeholder-course.png'}
                                        alt={course.title}
                                        className="w-[100px] h-[80px] rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-course.png';
                                        }}
                                    />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-2">
                                                    {course.title}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-orange-500 font-medium">
                                                    ₹{order.totalAmount.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDate(order.purchaseDate)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                                    order.orderStatus === 'Completed' ? 'bg-green-500' :
                                                    order.orderStatus === 'Pending' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`} />
                                                {order.orderStatus}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                {renderPaymentMethodIcon(order.paymentMethod)}
                                                {order.paymentMethod}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {order.orderStatus === 'Completed' ? (
                                        <ArrowUp className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <ArrowDown className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <Pagination className='flex justify-center mt-4' dataPerPage={orderPerPage} totalData={orders.length} setCurrentPage={setCurrentPage}  currentPage={currentPage}/>
                </div>
            )}
            
            <SecondaryFooter />
        </>
    );
};

export default PurchaseHistory;