import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addAdmin: (state, action) => {
      // action.payload will be the userData from your API response
      state.currentUser = {
        fullName: action.payload.fullName,
        userName: action.payload.userName,
        email: action.payload.email,
        password: action.payload.password,
        profileImg: action.payload.profileImg || '',
        isVerified: action.payload.isVerified,
        isActive: action.payload.isActive
      };
    },
    logoutAdmin: (state) => {
      state.currentUser = null;
      // Clear localStorage on logout
      localStorage.removeItem('token');
    }
  }
});

// Export actions
export const { addAdmin, logoutAdmin } = adminSlice.actions;

// Export selector
export const selectAdmin = (state) => state.user.currentUser;

// Export reducer
export default adminSlice.reducer;