import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import tutorSlice from './tutorSlice';
import adminSlice from './adminSlice';



const store = configureStore({
  reducer: {
    user:userSlice,
    tutor:tutorSlice,
    admin:adminSlice
   
  },
});

export default store;

