import {
  AnyAction,
  autoBatchEnhancer,
  configureStore,
  createAsyncThunk,
  ThunkAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { accountsSlice } from './accounts';
import { sbankenSlice } from './sbanken';
import { ynabSlice } from './ynab';
import { sbankenApi } from './sbanken.api';
import { ynabApi } from './ynab.api';
import { listenerMiddleware } from './listener';
import { alertsSlice } from './alerts';

export const createStore = (test = false, preloadedState?: any) =>
  configureStore({
    reducer: {
      [accountsSlice.name]: accountsSlice.reducer,
      [alertsSlice.name]: alertsSlice.reducer,
      [sbankenApi.reducerPath]: sbankenApi.reducer,
      [sbankenSlice.name]: sbankenSlice.reducer,
      [ynabApi.reducerPath]: ynabApi.reducer,
      [ynabSlice.name]: ynabSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: !test,
        serializableCheck: !test,
      })
        .prepend(listenerMiddleware.middleware)
        .concat(sbankenApi.middleware, ynabApi.middleware),
    enhancers: (existingEnhancers) => existingEnhancers.concat(autoBatchEnhancer()),
    preloadedState,
  });

export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const useAppDispatch = useDispatch<AppDispatch>;
export const useAppSelector = useSelector as TypedUseSelectorHook<RootState>;

export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;

export interface Undoable {
  /** A function that will undo the update. */
  undo: () => void;
}
