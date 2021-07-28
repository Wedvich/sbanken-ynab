import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const SBANKEN_CREDENTIALS_KEY = 'sbanken:credentials';

interface SbankenToken {
  value: string;
  notBefore: number;
  expires: number;
}

export interface SbankenCredential {
  clientId: string;
  clientSecret: string;
  token?: SbankenToken;
}

export interface SbankenState {
  credentials: Array<SbankenCredential>;
}

export function validateSbankenToken(token?: SbankenToken): boolean {
  if (!token?.value || !token.notBefore || !token.expires) {
    return false;
  }

  const now = Date.now();
  if (token.notBefore > now || token.expires <= now) {
    return false;
  }

  return true;
}

function getStoredCredentials() {
  const storedCredentials = JSON.parse<Array<SbankenCredential>>(
    localStorage.getItem(SBANKEN_CREDENTIALS_KEY) ?? '[]'
  );

  for (const credential of storedCredentials) {
    if (!validateSbankenToken(credential.token)) {
      delete credential.token;
    }
  }

  return storedCredentials;
}

const initialState: SbankenState = {
  credentials: getStoredCredentials(),
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

      localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify(state.credentials));
    },
  },
});

export const { putCredential } = sbankenSlice.actions;
