import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import Header from '../../components/layout/Header';
import MainHeader from '../../components/layout/user/MainHeader';
import UserProfile from '../../components/layout/user/UserDetails';
import Tabs from '../../components/layout/user/Tabs';
import SecondaryFooter from '../../components/layout/user/SecondaryFooter';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useNavigate } from 'react-router';
import { selectUser } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const WishlistPage = () => {
  const user=useSelector(selectUser);

  const dispatch = useDispatch();
  const navigate=useNavigate();

  const wishlistItems = useSelector((state) => state.wishlist.items);

  console.log("wishlist items",wishlistItems)

  const handleRemoveItem = async(productId) => {
    try {
      const response=await axios.delete('http://localhost:3000/course/deleteFromWishlist',{params:{userId:user._id,courseId:productId}});
      dispatch(removeFromWishlist(productId));
      toast.success("removed from wishlist");

    } catch (error) {
      console.log(error);
      toast.error('Failed to remove wishlist item')
    }
    

  };



  const EmptyWishlist = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Heart size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">Your wishlist is empty</h3>
      <p className="text-gray-500 mb-4">Add items that you like to your wishlist</p>
      <button onClick={()=>navigate('/')} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
        Continue Shopping
      </button>
    </div>
  );

  const WishlistItem = ({ product }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3">
      <div className="flex items-center space-x-4">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-20 h-20 object-cover rounded-md"
        />
        <div>
          <h3 className="font-medium text-gray-800">{product.name}</h3>
          <p className="text-orange-500 font-semibold">₹{product.price}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Add to Cart
        </button>
        <button 
          onClick={() => handleRemoveItem(product.id)} // Use the `id` for removal
          className="p-2 text-gray-500 hover:text-red-500 transition"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
  

  const WishlistContent = () => {
    if (!wishlistItems?.length) {
      return <EmptyWishlist />;
    }
  
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          My Wishlist ({wishlistItems.length} items)
        </h2>
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <WishlistItem
              key={item.courseId._id} 
              product={{
                id: item.courseId._id,
                name: item.courseId.title, 
                price: item.courseId.price.$numberDecimal, 
                image: item.courseId.thumbnail, 
              }}
            />
          ))}
        </div>
      </div>
    );
  };
  

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <MainHeader />
      <main className="flex-grow">
        <UserProfile />
        <Tabs />
        <WishlistContent />
      </main>
      <SecondaryFooter />
    </div>
  );
};

export default WishlistPage;