import { configureStore } from '@reduxjs/toolkit';
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
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import userSlice from './userSlice';
import tutorSlice from './tutorSlice';
import adminSlice from './adminSlice';

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

// Wrap reducers with persistReducer
const persistedUserReducer = persistReducer(userPersistConfig, userSlice);
const persistedTutorReducer = persistReducer(tutorPersistConfig, tutorSlice);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminSlice);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    tutor: persistedTutorReducer,
    admin: persistedAdminReducer
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
    })
});

// Create persistor
const persistor = persistStore(store);

export { store, persistor };