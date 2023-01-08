import {
  createListenerMiddleware,
  addListener,
  TypedStartListening,
  TypedAddListener,
} from '@reduxjs/toolkit';

import type { RootState, AppDispatch } from './';

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening = listenerMiddleware.startListening as TypedStartListening<
  RootState,
  AppDispatch
>;

export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
