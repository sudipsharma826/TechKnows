import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web

// Redux Persist configuration
const persistConfig = {
  key: "root",
  storage, // Use localStorage
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Configure store
export const store = configureStore({
  reducer: {
    // List all the reducers here
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Necessary for redux-persist
    }),
});

// For setting up persistence in your app
export const persistor = persistStore(store);
