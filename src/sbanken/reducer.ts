import { Reducer } from 'redux';
import { transformAccessToken, SbankenAccount, SbankenTransactionWithId } from './api';
import { getTokenRequest, getTokenResponse } from './api/get-token';
import { getAccountsRequest, getAccountsResponse } from './api/get-accounts';
import { getStoredAccessToken, getStoredCustomerId, encodeCredentials, getStoredCredentials } from './utils';
import { getTransactionsRequest, getTransactionsResponse } from './api/get-transactions';

export enum SbankenActionType {
  SetCredentials = 'sbanken/set-credentials',
  GetTokenRequest = 'sbanken/get-token-request',
  GetTokenResponse = 'sbanken/get-token-response',
  GetAccountsRequest = 'sbanken/get-accounts-request',
  GetAccountsResponse = 'sbanken/get-accounts-response',
  GetTransactionsRequest = 'sbanken/get-transactions-request',
  GetTransactionsResponse = 'sbanken/get-transactions-response',
}

const setCredentials = (clientId: string, clientSecret: string, customerId: string) => ({
  type: SbankenActionType.SetCredentials as SbankenActionType.SetCredentials,
  credentials: encodeCredentials(clientId, clientSecret),
  customerId,
});

export const actions = {
  setCredentials,
  getTokenRequest,
  getTokenResponse,
  getAccountsRequest,
  getAccountsResponse,
  getTransactionsRequest,
  getTransactionsResponse,
};

export type SbankenAction = ReturnType<typeof actions[keyof typeof actions]>

export const sbankenStateKey = 'sbanken';

const initialState = {
  authenticating: false,
  credentials: getStoredCredentials(),
  customerId: getStoredCustomerId(),
  error: null as string | null,
  token: getStoredAccessToken(),
  loading: false,
  accounts: { } as { [key: string]: SbankenAccount },
  transactions: [] as SbankenTransactionWithId[],
};

export type SbankenState = typeof initialState;

const reducer: Reducer<SbankenState, SbankenAction> = (state = initialState, action) => {
  switch (action.type) {
    case SbankenActionType.SetCredentials:
      return {
        ...state,
        credentials: action.credentials,
        customerId: action.customerId,
      };

    case SbankenActionType.GetTokenRequest:
      return {
        ...state,
        authenticating: true,
      };

    case SbankenActionType.GetTokenResponse:
      return {
        ...state,
        authenticating: false,
        error: action.error ?? '',
        token: action.response ? transformAccessToken(action.response) : null,
      };

    case SbankenActionType.GetAccountsRequest:
      return {
        ...state,
        loading: true,
      };

    case SbankenActionType.GetAccountsResponse:
      return {
        ...state,
        loading: false,
        accounts: action.accounts.reduce((accounts, account) => {
          accounts[account.accountId] = account;
          return accounts;
        }, {}),
      };

    case SbankenActionType.GetTransactionsRequest:
      return {
        ...state,
        loading: true,
      };

    case SbankenActionType.GetTransactionsResponse:
      return {
        ...state,
        loading: false,
        transactions: action.transactions,
      };

    default:
      return state;
  }
};

export default reducer;
