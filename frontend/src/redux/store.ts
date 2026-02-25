import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import courseReducer from '../slices/courseSlice';
import categoryReducer from '../slices/categorySlice';
import cartReducer from '../slices/cartSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    categories: categoryReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;