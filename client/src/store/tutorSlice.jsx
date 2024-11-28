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
        fullName,
        userName,
        email,
        profileImg = '',
        jobTitle = '',
        bio = '',
        totalRevenue = 0,
        credentials = [],
        status = 'active',
      } = action.payload;

      state.currentTutor = {
        fullName,
        userName,
        email,
        profileImg,
        jobTitle,
        bio,
        totalRevenue,
        credentials,
        status,
      };
    },
    logoutTutor: (state) => {
      // Clear the tutor state and token on logout
      state.currentTutor = null;
      localStorage.removeItem('token');
    },
  },
});

// Export actions
export const { addTutor, logoutTutor } = tutorSlice.actions;

// Export selector
export const selectTutor = (state) => state.tutor.currentTutor;

// Export reducer
export default tutorSlice.reducer;
