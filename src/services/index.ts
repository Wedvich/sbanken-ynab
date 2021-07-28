import { configureStore } from '@reduxjs/toolkit';
import { sbankenSlice } from './sbanken';

export const store = configureStore({
  reducer: {
    [sbankenSlice.name]: sbankenSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
