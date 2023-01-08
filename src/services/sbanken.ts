import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '.';
import { sbankenIdentityServerUrl } from '../config';
import { SBANKEN_CREDENTIALS_KEY } from './storage';
import { startAppListening } from './listener';
import { fetchInitialData, RequestStatus } from '../utils';

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

const credentialsAdapter = createEntityAdapter<SbankenCredential>({
  selectId: (credential) => credential.clientId,
});

export interface SbankenState {
  accounts: Array<SbankenAccount>;
  credentialIdByAccountId: Record<string, string>;
  credentials: EntityState<SbankenCredential>;
  requestStatusByCredentialId: Record<string, RequestStatus | undefined>;
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

const initialCredentials = credentialsAdapter.setAll(
  credentialsAdapter.getInitialState(),
  getStoredCredentials()
);

const initialState: SbankenState = {
  accounts: [],
  credentialIdByAccountId: {},
  credentials: initialCredentials,
  requestStatusByCredentialId: credentialsAdapter
    .getSelectors()
    .selectAll(initialCredentials)
    .reduce<Record<string, RequestStatus | undefined>>((status, credential) => {
      if (credential.token) {
        status[credential.clientId] = 'fulfilled';
      }
      return status;
    }, {}),
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

export const getSbankenAccounts = (state: RootState) => state.sbanken.accounts;
export const getSbankenCredentials = credentialsAdapter.getSelectors(
  (state: RootState) => state.sbanken.credentials
).selectAll;
export const getSbankenTokenRequestStatus = (state: RootState) =>
  state.sbanken.requestStatusByCredentialId;
export const getExpiredCredentials = createSelector(getSbankenCredentials, (credentials) =>
  credentials.filter((credential) => !validateSbankenToken(credential.token))
);

export const sbankenSlice = createSlice({
  name: 'sbanken',
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
    saveCredential: (
      state,
      action: PayloadAction<
        Pick<SbankenCredential, 'clientId' | 'clientSecret'> & { originalClientId?: string }
      >
    ) => {
      credentialsAdapter.setOne(state.credentials, {
        clientId: action.payload.clientId,
        clientSecret: action.payload.clientSecret,
      });
    },
    deleteCredential: (state, action: PayloadAction<string>) => {
      credentialsAdapter.removeOne(state.credentials, action.payload);
      delete state.requestStatusByCredentialId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        fetchSbankenToken.pending.match,
        fetchSbankenToken.fulfilled.match,
        fetchSbankenToken.rejected.match
      ),
      (state, action) => {
        state.requestStatusByCredentialId[action.meta.arg.clientId] = action.meta.requestStatus;
      }
    );

    builder.addMatcher(fetchSbankenToken.fulfilled.match, (state, action) => {
      const credential = { ...action.meta.arg, token: action.payload };
      credentialsAdapter.upsertOne(state.credentials, credential);
    });
  },
});

export const { deleteCredential, putCredentialIdsByAccountIds, saveCredential } =
  sbankenSlice.actions;

// FIXME: Remove imports
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const putCredential = () => {};

export const fetchSbankenToken = createAsyncThunk<SbankenToken, SbankenCredential>(
  `${sbankenSlice.name}/fetchSbankenToken`,
  async ({ clientId, clientSecret }) => {
    const credentials = window.btoa(
      `${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`
    );
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
      return Promise.reject(response.statusText);
    }

    const { access_token } = await response.json(); // TODO: Type response
    const parts: Array<string> = access_token.split('.');
    const decoded = JSON.parse(window.atob(parts[1]));
    const nbf = decoded.nbf * 1000;
    const exp = decoded.exp * 1000;

    return {
      value: access_token,
      notBefore: nbf,
      expires: exp,
    };
  }
);

export const fetchAllAccounts = createAsyncThunk(`${sbankenSlice.name}/fetchAllAccounts`, () => {
  // const { credentials } = (thunkAPI.getState() as RootState).sbanken;
  // const requests = credentials.map(async (credential) => {
  //   if (!validateSbankenToken(credential.token)) {
  //     return Promise.reject(`invalid token for client ID ${credential.clientId}`);
  //   }
  //   const response = await fetch(`${sbankenApiBaseUrl}/Accounts`, {
  //     headers: {
  //       Accept: 'application/json',
  //       Authorization: `Bearer ${credential.token?.value}`,
  //     },
  //   });
  //   if (!response.ok) {
  //     return Promise.reject(response.statusText); // TODO: Handle errors
  //   }
  //   return {
  //     credentialId: credential.clientId,
  //     data: (await response.json()) as SbankenListObject<SbankenAccount>,
  //   };
  // });
  // const results = await Promise.allSettled(requests);
  // return results.reduce<Array<SbankenAccount>>((accounts, result) => {
  //   if (result.status === 'rejected') return accounts; // TODO: Handle errors
  //   Array.prototype.push.apply(accounts, result.value.data.items);
  //   thunkAPI.dispatch(
  //     sbankenSlice.actions.putCredentialIdsByAccountIds({
  //       accountIds: result.value.data.items.map((account) => account.accountId),
  //       credentialId: result.value.credentialId,
  //     })
  //   );
  //   return accounts;
  // }, []);
});

/** Stores changes to credentials in localStorage */
startAppListening({
  matcher: isAnyOf(saveCredential.match, deleteCredential.match, fetchSbankenToken.fulfilled.match),
  effect: async (action, { dispatch, getState }) => {
    if (saveCredential.match(action)) {
      await dispatch(fetchSbankenToken(action.payload));

      if (action.payload.originalClientId) {
        dispatch(deleteCredential(action.payload.originalClientId));
      }
    }

    const credentials = getSbankenCredentials(getState());
    localStorage.setItem(SBANKEN_CREDENTIALS_KEY, JSON.stringify(credentials));
  },
});

/** Reloads all expired tokens on app initialization */
startAppListening({
  actionCreator: fetchInitialData,
  effect: async (_, { dispatch, getState }) => {
    const expiredCredentials = getExpiredCredentials(getState());
    await Promise.allSettled(
      expiredCredentials.map((credential) => dispatch(fetchSbankenToken(credential)))
    );
  },
});
