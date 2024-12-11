import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  setWishlistItems,
  setLoading,
  setError
} = wishlistSlice.actions;

export default wishlistSlice.reducer;