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
        _id:action.payload._id,
        fullName: action.payload.fullName,
        userName: action.payload.userName,
        email: action.payload.email,
        phone:action.payload.phone,
        password: action.payload.password,
        profileImg: action.payload.profileImg || '',
     
      };
    },
    logoutAdmin: (state) => {
      state.currentUser = null;
      // Clear localStorage on logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
});

// Export actions
export const { addAdmin, logoutAdmin } = adminSlice.actions;

// Export selector
export const selectAdmin = (state) => state.admin.currentUser;

// Export reducer
export default adminSlice.reducer;