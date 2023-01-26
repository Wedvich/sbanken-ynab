import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import memoize from 'lodash-es/memoize';
import type { RootState } from '.';
import { sbankenApiBaseUrl, sbankenIdentityServerUrl } from '../config';
import { SBANKEN_CREDENTIALS_KEY, SBANKEN_SHOW_RESERVED_KEY } from './storage';
import { startAppListening } from './listener';
import { fetchInitialData, RequestStatus, stripEmojis } from '../utils';
import type {
  SbankenAccountWithClientId,
  SbankenAccount,
  SbankenSuccessResponse,
} from './sbanken.types';

export interface SbankenToken {
  value: string;
  notBefore: number;
  expires: number;
}

export interface SbankenCredential {
  clientId: string;
  clientSecret: string;
  token?: SbankenToken;
}

export const sbankenCredentialsAdapter = createEntityAdapter<SbankenCredential>({
  selectId: (credential) => credential.clientId,
});

export const sbankenAccountsAdapter = createEntityAdapter<SbankenAccountWithClientId>({
  selectId: (account) => account.accountId,
});

export interface SbankenState {
  accounts: EntityState<SbankenAccountWithClientId>;
  credentials: EntityState<SbankenCredential>;
  requestStatusByCredentialId: Record<string, RequestStatus | undefined>;
  showReservedTransactions: boolean;
}

export function validateSbankenToken(token?: SbankenToken): token is SbankenToken {
  if (!token?.value || !token.notBefore || !token.expires) {
    return false;
  }

  const now = Date.now();
  if (token.notBefore > now || token.expires <= now) {
    return false;
  }

  return true;
}

export function getSbankenUnclearedBalance(sbankenAccount?: SbankenAccount): number {
  if (!sbankenAccount) return 0;

  if (sbankenAccount.accountType === 'Creditcard account') {
    return +(-sbankenAccount.balance - (sbankenAccount.creditLimit - sbankenAccount.available));
  }

  return sbankenAccount.available - sbankenAccount.balance;
}

function loadStoredCredentials() {
  try {
    const storedCredentials = JSON.parse<Array<SbankenCredential>>(
      localStorage.getItem(SBANKEN_CREDENTIALS_KEY) || '[]'
    );

    for (const credential of storedCredentials) {
      if (!validateSbankenToken(credential.token)) {
        delete credential.token;
      }
    }

    return storedCredentials;
  } catch (e) {
    console.debug(e);
    localStorage.removeItem(SBANKEN_CREDENTIALS_KEY);
    return [];
  }
}

const initialCredentials = sbankenCredentialsAdapter.setAll(
  sbankenCredentialsAdapter.getInitialState(),
  loadStoredCredentials()
);

function loadShowReservedTransactions() {
  try {
    return localStorage.getItem(SBANKEN_SHOW_RESERVED_KEY) === 'true';
  } catch (e) {
    console.debug(e);
    localStorage.removeItem(SBANKEN_SHOW_RESERVED_KEY);
    return false;
  }
}

const initialState: SbankenState = {
  accounts: sbankenAccountsAdapter.getInitialState(),
  credentials: initialCredentials,
  requestStatusByCredentialId: sbankenCredentialsAdapter
    .getSelectors()
    .selectAll(initialCredentials)
    .reduce<Record<string, RequestStatus | undefined>>((status, credential) => {
      if (credential.token) {
        status[credential.clientId] = 'fulfilled';
      }
      return status;
    }, {}),
  showReservedTransactions: loadShowReservedTransactions(),
};

export const getSbankenCredentials = sbankenCredentialsAdapter.getSelectors(
  (state: RootState) => state.sbanken.credentials
).selectAll;
export const getSbankenTokenRequestStatus = (state: RootState) =>
  state.sbanken.requestStatusByCredentialId;
export const getExpiredCredentials = createSelector(getSbankenCredentials, (credentials) =>
  credentials.filter((credential) => !validateSbankenToken(credential.token))
);

const accountSelectors = sbankenAccountsAdapter.getSelectors(
  (state: RootState) => state.sbanken.accounts
);

export const getSbankenAccounts = createSelector(accountSelectors.selectAll, (accounts) => {
  const prepareName = memoize((name: string) => stripEmojis(name).trim());
  return accounts.sort((a, b) => prepareName(a.name).localeCompare(prepareName(b.name)));
});

export const getSbankenAccountsLookup = accountSelectors.selectEntities;

export const sbankenSlice = createSlice({
  name: 'sbanken',
  initialState,
  reducers: {
    saveCredential: (
      state,
      action: PayloadAction<
        Pick<SbankenCredential, 'clientId' | 'clientSecret'> & { originalClientId?: string }
      >
    ) => {
      sbankenCredentialsAdapter.setOne(state.credentials, {
        clientId: action.payload.clientId,
        clientSecret: action.payload.clientSecret,
      });
    },
    deleteCredential: (state, action: PayloadAction<string>) => {
      sbankenCredentialsAdapter.removeOne(state.credentials, action.payload);
      delete state.requestStatusByCredentialId[action.payload];
    },
    setShowReservedTransactions: (state, action: PayloadAction<boolean>) => {
      state.showReservedTransactions = action.payload;
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
      sbankenCredentialsAdapter.upsertOne(state.credentials, credential);
    });

    builder.addMatcher(fetchSbankenAccounts.fulfilled.match, (state, action) => {
      sbankenAccountsAdapter.setMany(state.accounts, action.payload);
    });
  },
});

export const { deleteCredential, saveCredential, setShowReservedTransactions } =
  sbankenSlice.actions;

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

export const fetchSbankenAccounts = createAsyncThunk<
  Array<SbankenAccountWithClientId>,
  SbankenCredential
>(`${sbankenSlice.name}/fetchAccountsForClient`, async (credential) => {
  if (!validateSbankenToken(credential.token)) {
    return Promise.reject('invalid token');
  }

  const response = await fetch(`${sbankenApiBaseUrl}/Accounts`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${credential.token.value}`,
    },
  });

  if (!response.ok) {
    return Promise.reject(response.statusText); // TODO: Handle errors
  }

  const responseData: SbankenSuccessResponse<SbankenAccount> = await response.json();
  return responseData.items.map((account) => ({ ...account, clientId: credential.clientId }));
});

/** Stores changes to credentials in localStorage. */
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

    if (fetchSbankenToken.fulfilled.match(action)) {
      const credential = credentials.find((c) => c.clientId === action.meta.arg.clientId);
      if (credential) {
        await dispatch(fetchSbankenAccounts(credential));
      }
    }
  },
});

/** Reloads all expired tokens on app initialization, and then accounts for all valid tokens. */
startAppListening({
  actionCreator: fetchInitialData,
  effect: async (_, { dispatch, getState }) => {
    const expiredCredentials = getExpiredCredentials(getState());
    await Promise.allSettled(
      expiredCredentials.map((credential) => dispatch(fetchSbankenToken(credential)))
    );
    const credentials = getSbankenCredentials(getState());
    await Promise.allSettled(
      credentials.map((credential) => dispatch(fetchSbankenAccounts(credential)))
    );
  },
});

/** Stores changes to "showReservedTransactions" in localStorage. */
startAppListening({
  actionCreator: setShowReservedTransactions,
  effect: (_, { getState }) => {
    const { showReservedTransactions } = getState().sbanken;
    localStorage.setItem(SBANKEN_SHOW_RESERVED_KEY, JSON.stringify(showReservedTransactions));
  },
});
