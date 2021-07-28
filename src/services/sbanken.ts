import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SbankenCredential {
  clientId: string;
  clientSecret: string;
  token?: {
    value: string;
    notBefore: number;
    expires: number;
  };
}

export interface SbankenState {
  credentials: Array<SbankenCredential>;
}

const initialState: SbankenState = {
  credentials: [],
};

export const sbankenSlice = createSlice({
  name: 'sbanken',
  initialState,
  reducers: {
    putCredential: (state, action: PayloadAction<SbankenCredential>) => {
      const existingCredential = state.credentials.find(
        (c) => c.clientId === action.payload.clientId
      );
      if (existingCredential) {
        existingCredential.clientSecret = action.payload.clientSecret;
        existingCredential.token = action.payload.token;
      } else {
        state.credentials.push(action.payload);
      }
    },
    removeCredential: (state, action: PayloadAction<SbankenCredential | string>) => {
      const clientIdToRemove =
        typeof action.payload === 'string' ? action.payload : action.payload.clientId;
      state.credentials = state.credentials.filter((c) => c.clientId !== clientIdToRemove);
    },
  },
});

export const { putCredential, removeCredential } = sbankenSlice.actions;
