import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalCartPrice: 0,
  },
  
  reducers: {
    addToCart: (state, action) => {
      const { courseId, price } = action.payload;

      console.log(price,'asdasdasd')

      const normalizedPrice = price?.$numberDecimal 
        ? parseFloat(price.$numberDecimal) 
        : price;

      // Check for existing item
      const existingItemIndex = state.items.findIndex(
        (item) => item.courseId._id === courseId
      );

      if (existingItemIndex === -1) {
        state.items.push({ 
          courseId: { _id: courseId }, 
          price: normalizedPrice 
        });
        state.totalCartPrice += normalizedPrice;
      }
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload;

      // Remove item and recalculate total price
      const updatedItems = state.items.filter(
        (item) => item.courseId._id !== courseId
      );

      state.items = updatedItems;
      state.totalCartPrice = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalCartPrice = 0;
    },

    setCart: (state, action) => {
      
      state.items = action.payload.items || [];
      state.totalCartPrice = action.payload.totalCartPrice || 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setCart } = cartSlice.actions;

// Export selector
export const selectCart = (state) => state.cart;

export default cartSlice.reducer;
