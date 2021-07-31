import { configureStore } from '@reduxjs/toolkit';
import { accountsSlice } from './accounts';
import { sbankenSlice } from './sbanken';
import { ynabSlice } from './ynab';

export const store = configureStore({
  reducer: {
    [accountsSlice.name]: accountsSlice.reducer,
    [sbankenSlice.name]: sbankenSlice.reducer,
    [ynabSlice.name]: ynabSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
