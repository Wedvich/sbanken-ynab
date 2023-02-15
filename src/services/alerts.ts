import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

interface Alert {
  id: string;
  title: string;
  message: string;
}

const alertsAdapter = createEntityAdapter<Alert>();

export const selectAlerts = (state: RootState) =>
  alertsAdapter.getSelectors().selectAll(state.alerts);

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState: alertsAdapter.getInitialState(),
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      return alertsAdapter.setOne(state, action.payload);
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      return alertsAdapter.removeOne(state, action.payload);
    },
  },
});

export const { addAlert, dismissAlert } = alertsSlice.actions;
