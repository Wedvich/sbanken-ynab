import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SbankenAccessToken } from './api';

interface SbankenState {
  accessTokens: Array<SbankenAccessToken>;
}

const initialState: SbankenState = {
  accessTokens: [],
};

export const sbankenSlice = createSlice({
  name: 'sbanken',
  initialState,
  reducers: {
    deleteToken: (state, action: PayloadAction<string>) => {
      const index = state.accessTokens.findIndex(
        (accessToken) => accessToken.credentials === action.payload
      );
      if (index !== -1) {
        state.accessTokens.splice(index, 1);
      }
    },
    upsertToken: (state, action: PayloadAction<SbankenAccessToken>) => {
      const index = state.accessTokens.findIndex(
        (accessToken) => accessToken.credentials === action.payload.credentials
      );
      if (index !== -1) {
        state.accessTokens.splice(index, 1, action.payload);
      } else {
        state.accessTokens.push(action.payload);
      }
    },
  },
});

const addTokenToStoreAndCache = createAsyncThunk(
  'sbanken/setAndCacheToken',
  (token: SbankenAccessToken, thunkApi) => {
    thunkApi.dispatch(upsertToken(token));

    if (token) {
    } else {
    }
  }
);

export const { upsertToken } = sbankenSlice.actions;
