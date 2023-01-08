import { autoBatchEnhancer, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import { accountsSlice } from './accounts';
import { sbankenSlice } from './sbanken';
import { ynabSlice } from './ynab';
import sbankenApi from './sbanken/api';
import ynabApi from './ynab/api';
import { listenerMiddleware } from './listener';
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    [accountsSlice.name]: accountsSlice.reducer,
    [sbankenApi.reducerPath]: sbankenApi.reducer,
    [sbankenSlice.name]: sbankenSlice.reducer,
    [ynabApi.reducerPath]: ynabApi.reducer,
    [ynabSlice.name]: ynabSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(sbankenApi.middleware, ynabApi.middleware),
  enhancers: (existingEnhancers) => existingEnhancers.concat(autoBatchEnhancer()),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const useAppDispatch = useDispatch<AppDispatch>;
