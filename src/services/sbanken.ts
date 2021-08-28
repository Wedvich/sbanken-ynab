import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { sbankenApiBaseUrl, sbankenIdentityServerUrl } from '../config';
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
  credentialIdByAccountId: Record<string, string>;
  credentials: Array<SbankenCredential>;
  hasFetchedInitialTokens: boolean;
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
  credentialIdByAccountId: {},
  credentials: getStoredCredentials(),
  hasFetchedInitialTokens: false,
};

export interface SbankenListObject<T> {
  availableItems: number;
  items: Array<T>;
}

export interface SbankenAccount {
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

export const fetchSbankenToken = createAsyncThunk(
  `${SBANKEN_SLICE_NAME}/fetchSbankenToken`,
  async (params: Pick<SbankenCredential, 'clientId' | 'clientSecret'>, thunkAPI) => {
    const { clientId, clientSecret } = params;
    const credentials = btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`);
    const response = await fetch(sbankenIdentityServerUrl, {
      method: 'post',
      headers: new Headers({
        Accept: 'application/json',
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      }),
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('bad token');
    }

    const token = await response.json();
    const parts = token.access_token.split('.');
    const decoded = JSON.parse(atob(parts[1]));
    const nbf = decoded.nbf * 1000;
    const exp = decoded.exp * 1000;
    thunkAPI.dispatch(
      putCredential({
        clientId,
        clientSecret,
        token: {
          value: token.access_token,
          notBefore: nbf,
          expires: exp,
        },
      })
    );

    return token.access_token as string;
  }
);

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

      return {
        credentialId: credential.clientId,
        data: (await response.json()) as SbankenListObject<SbankenAccount>,
      };
    });

    const results = await Promise.allSettled(requests);
    return results.reduce<Array<SbankenAccount>>((accounts, result) => {
      if (result.status === 'rejected') return accounts; // TODO: Handle errors
      Array.prototype.push.apply(accounts, result.value.data.items);
      thunkAPI.dispatch(
        sbankenSlice.actions.putCredentialIdsByAccountIds({
          accountIds: result.value.data.items.map((account) => account.accountId),
          credentialId: result.value.credentialId,
        })
      );
      return accounts;
    }, []);
  }
);

export const sbankenSlice = createSlice({
  name: SBANKEN_SLICE_NAME,
  initialState,
  reducers: {
    putCredentialIdsByAccountIds: (
      state,
      action: PayloadAction<{ credentialId: string; accountIds: Array<string> }>
    ) => {
      const { credentialId, accountIds } = action.payload;
      for (const accountId of accountIds) {
        state.credentialIdByAccountId[accountId] = credentialId;
      }
    },
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

export const { putCredential, putCredentialIdsByAccountIds } = sbankenSlice.actions;
