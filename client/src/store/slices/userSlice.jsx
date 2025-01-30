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
        _id:action.payload._id,
        fullName: action.payload.fullName,
        userName: action.payload.userName,
        email: action.payload.email,
        phone:action.payload.phone,
        password: action.payload.password,
        profileImg: action.payload.profileImg || '',
        isVerified: action.payload.isVerified,
        isActive: action.payload.isActive,
        notifications:action.payload.notifications,
        activeCourses:action.payload.activeCourses
      };
    },
    logoutUser: (state) => {
      state.currentUser = null;
      // Clear localStorage on logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
});

// Export actions
export const { addUser, logoutUser } = userSlice.actions;

// Export selector
export const selectUser = (state) => state.user.currentUser;
export const selectUserNotifications = state => state.user?.notifications || [];

// Export reducer
export default userSlice.reducer;