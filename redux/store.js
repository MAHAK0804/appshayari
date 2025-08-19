import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import favoritesReducer from './slice/favoritesSlice';

const persistConfig = {
  key: 'favorites', // slice-specific key (not 'root')
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, favoritesReducer);

export const store = configureStore({
  reducer: {
    favorites: persistedReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist ke liye zaroori
    }),
});

export const persistor = persistStore(store);
