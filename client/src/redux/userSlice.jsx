import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action) => {
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
    logoutUser: (state) => {
      state.currentUser = null;
      // Clear localStorage on logout
      localStorage.removeItem('token');
    }
  }
});

// Export actions
export const { addUser, logoutUser } = userSlice.actions;

// Export selector
export const selectUser = (state) => state.user.currentUser;

// Export reducer
export default userSlice.reducer;