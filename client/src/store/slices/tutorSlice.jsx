import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTutor: null // Tracks the logged-in tutor's details
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    addTutor: (state, action) => {
      // Update the state with the tutor details
      const {
        _id,
        fullName,
        userName,
        email,
        phone,
        profileImg = '',
        jobTitle = '',
        bio = '',
        totalRevenue = 0,
        amountWithdrawn = 0,
        credentials = [],
        isActive,

      } = action.payload;

      state.currentTutor = {
        _id,
        fullName,
        userName,
        email,
        phone,
        profileImg,
        jobTitle,
        bio,
        totalRevenue,
        amountWithdrawn,
        credentials,
        isActive
      };
    },
    logoutTutor: (state) => {
      // Clear the tutor state and token on logout
      state.currentTutor = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

// Export actions
export const { addTutor, logoutTutor } = tutorSlice.actions;

// Export selector
export const selectTutor = (state) => state.tutor.currentTutor;

// Export reducer
export default tutorSlice.reducer;
