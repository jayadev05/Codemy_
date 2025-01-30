import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
  },
  reducers: {
    addToWishlist: (state, action) => {

      // Ensure no duplicates
      const existingItem = state.items.find(
        item => item.courseId._id === action.payload
      );
      
      if (!existingItem) {
        state.items.push(action.payload);
      }

    },

    removeFromWishlist: (state, action) => {
    
      state.items = state.items.filter(
        item => item.courseId._id !== action.payload
      );
    },

    setWishlistItems: (state, action) => {
      state.items = action.payload;
    },
   
    clearWishlsit: (state, action) => {
    
      state.items = [];
        
      
    },

  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  setWishlistItems,
  clearWishlsit
  
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

// Export selector
export const selectWishlist = (state) => state.wishlist.items;