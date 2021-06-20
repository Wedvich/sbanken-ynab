import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { sbankenApi } from '../sbanken/api';
import { sbankenSlice } from '../sbanken/slice';

export const store = configureStore({
  reducer: {
    [sbankenSlice.name]: sbankenSlice.reducer,
    [sbankenApi.reducerPath]: sbankenApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sbankenApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
