import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { sbankenApiBaseUrl } from '../config';
import keyBy from 'lodash-es/keyBy';

const SBANKEN_SLICE_NAME = 'sbanken';

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
  accounts: Array<SbankenAccount>;
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
    localStorage.getItem(SBANKEN_CREDENTIALS_KEY) || '[]'
  );

  for (const credential of storedCredentials) {
    if (!validateSbankenToken(credential.token)) {
      delete credential.token;
    }
  }

  return storedCredentials;
}

const initialState: SbankenState = {
  accounts: [],
  credentials: getStoredCredentials(),
};

interface SbankenListObject<T> {
  availableItems: number;
  items: Array<T>;
}

interface SbankenAccount {
  accountId: string;
  accountNumber: string;
  ownerCustomerId: string;
  name: string;
  accountType: 'Standard account' | 'Creditcard account';
  available: number;
  balance: number;
  creditLimit: number;
}

export const getSbankenAccounts = (state: RootState) => state[SBANKEN_SLICE_NAME].accounts;

export const fetchAllAccounts = createAsyncThunk(
  `${SBANKEN_SLICE_NAME}/fetchAllAccounts`,
  async (_, thunkAPI) => {
    const { credentials } = (thunkAPI.getState() as RootState).sbanken;
    const requests = credentials.map(async (credential) => {
      if (!validateSbankenToken(credential.token)) {
        return Promise.reject(`invalid token for client ID ${credential.clientId}`);
      }

      const response = await fetch(`${sbankenApiBaseUrl}/api/v2/Accounts`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${credential.token.value}`,
        },
      });

      if (!response.ok) {
        return Promise.reject(response.statusText); // TODO: Handle errors
      }

      return (await response.json()) as SbankenListObject<SbankenAccount>;
    });

    const results = await Promise.allSettled(requests);
    return results.reduce<Array<SbankenAccount>>((accounts, result) => {
      if (result.status === 'rejected') return accounts; // TODO: Handle errors
      Array.prototype.push.apply(accounts, result.value.items);
      return accounts;
    }, []);
  }
);

export const sbankenSlice = createSlice({
  name: SBANKEN_SLICE_NAME,
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
  extraReducers: (builder) => {
    builder.addCase(fetchAllAccounts.fulfilled, (state, action) => {
      state.accounts = Object.values({
        ...keyBy(state.accounts, 'accountId'),
        ...keyBy(action.payload, 'accountId'),
      });
    });
  },
});

export const { putCredential } = sbankenSlice.actions;
