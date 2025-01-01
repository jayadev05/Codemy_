import { configureStore } from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userSlice from './slices/userSlice';
import tutorSlice from './slices/tutorSlice';
import adminSlice from './slices/adminSlice';
import courseSlice from './slices/courseSlice';
import lessonsSlice from './slices/lessonsSlice';
import wishlistSlice from './slices/wishlistSlice';
import cartSlice from './slices/cartSlice';


// Create persist configs for each reducer
const userPersistConfig = {
  key: 'user',
  storage,
  // Optional: you can blacklist or whitelist specific state paths
  // blacklist: ['someTransientState']
};

const tutorPersistConfig = {
  key: 'tutor',
  storage,
};

const adminPersistConfig = {
  key: 'admin',
  storage,
};

const coursePersistConfig = {
  key: 'course',
  storage,
};

const lessonsPersistConfig = {
  key: 'lessons',
  storage,
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
};

const cartPersistConfig = {
  key: 'cart',
  storage,
};

// Wrap reducers with persistReducer
const persistedUserReducer = persistReducer(userPersistConfig, userSlice);
const persistedTutorReducer = persistReducer(tutorPersistConfig, tutorSlice);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminSlice);
const persistedCourseReducer = persistReducer(coursePersistConfig, courseSlice);
const persistedLessonsReducer = persistReducer(lessonsPersistConfig, lessonsSlice);
const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistSlice);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    tutor: persistedTutorReducer,
    admin: persistedAdminReducer,
    course: persistedCourseReducer,
    lessons: persistedLessonsReducer,
    wishlist:persistedWishlistReducer,
    cart:persistedCartReducer,

  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER
        ]
      }
    }).concat(thunk)
});

// Create persistor
const persistor = persistStore(store);

export { store, persistor };