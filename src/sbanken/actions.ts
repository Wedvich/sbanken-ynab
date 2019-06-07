import { Action } from 'redux';

import { wrapClientCredentials } from './helpers';

export enum SbankenActionTypes {
  GetTokenRequest = 'sbanken/get-token-request',
  GetTokenSuccess = 'sbanken/get-token-success',
  GetTokenFailure = 'sbanken/get-token-failure',
  LoadCachedCredentials = 'sbanken/load-cached-credentials',
  RefreshToken = 'sbanken/refresh-token',
  StoreCredentials = 'sbanken/store-credentials',
}

export interface GetSbankenTokenRequestAction
  extends Action<SbankenActionTypes.GetTokenRequest> {
    credentials: string;
    customerId: string;
  }

const getSbankenTokenRequest = (clientId: string, clientSecret: string, customerId: string): GetSbankenTokenRequestAction => {
  const credentials = wrapClientCredentials(clientId, clientSecret);
  return {
    type: SbankenActionTypes.GetTokenRequest,
    credentials,
    customerId,
  };
};

export interface GetSbankenTokenSuccessAction
  extends Action<SbankenActionTypes.GetTokenSuccess> {
    token: string;
    tokenExpiry: number;
  }

const getSbankenTokenSuccess = (token: string, tokenExpiry: number): GetSbankenTokenSuccessAction => {
  return {
    type: SbankenActionTypes.GetTokenSuccess,
    token,
    tokenExpiry,
  };
};

export interface GetSbankenTokenFailureAction
  extends Action<SbankenActionTypes.GetTokenFailure> {
    errorMessage: string;
  }

const getSbankenTokenFailure = (error: Error): GetSbankenTokenFailureAction => {
  return {
    type: SbankenActionTypes.GetTokenFailure,
    errorMessage: error.message,
  };
};

export type LoadSbankenCachedCredentialsAction = Action<SbankenActionTypes.LoadCachedCredentials>

const loadSbankenCachedCredentials = (): LoadSbankenCachedCredentialsAction => ({
  type: SbankenActionTypes.LoadCachedCredentials,
});

export type RefreshSbankenTokenAction = Action<SbankenActionTypes.RefreshToken> 

const refreshSbankenToken = (): RefreshSbankenTokenAction => ({
  type: SbankenActionTypes.RefreshToken,
});

export interface StoreSbankenCredentialsAction extends Action<SbankenActionTypes.StoreCredentials> {
  credentials: string;
  customerId: string;
}

export const storeSbankenCredentials = (
  clientId: string,
  clientSecret: string,
  customerId: string,
): StoreSbankenCredentialsAction => ({
  type: SbankenActionTypes.StoreCredentials,
  credentials: wrapClientCredentials(clientId, clientSecret),
  customerId,
});

export const actions = {
  getSbankenTokenRequest,
  getSbankenTokenSuccess,
  getSbankenTokenFailure,
  loadSbankenCachedCredentials,
  refreshSbankenToken,
  storeSbankenCredentials,
};

export type SbankenAction =
  GetSbankenTokenRequestAction |
  GetSbankenTokenSuccessAction |
  GetSbankenTokenFailureAction |
  LoadSbankenCachedCredentialsAction |
  RefreshSbankenTokenAction |
  StoreSbankenCredentialsAction
