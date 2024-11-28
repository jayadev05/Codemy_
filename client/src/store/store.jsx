import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import tutorSlice from './tutorSlice'


const store = configureStore({
  reducer: {
    user:userSlice,
    tutor:tutorSlice
   
  },
});

export default store;

