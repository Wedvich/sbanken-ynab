import { Action } from 'redux';

export enum SbankenActionTypes {
  GetTokenRequest = 'sbanken/get-token-request',
  GetTokenSuccess = 'sbanken/get-token-success',
  GetTokenFailure = 'sbanken/get-token-failure',
  LoadCachedCredentials = 'sbanken/load-cached-credentials',
  LoadCachedCredentialsSuccess = 'sbanken/load-cached-credentials-success',
};

export interface GetSbankenTokenRequestAction
  extends Action<SbankenActionTypes.GetTokenRequest> {
    credentials: string;
    customerId: string;
  }

const getSbankenTokenRequest = (clientId: string, clientSecret: string, customerId: string): GetSbankenTokenRequestAction => {
  const credentials = btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`);
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

export interface LoadSbankenCachedCredentialsAction
  extends Action<SbankenActionTypes.LoadCachedCredentials> {}

const loadSbankenCachedCredentials = (): LoadSbankenCachedCredentialsAction => ({
  type: SbankenActionTypes.LoadCachedCredentials,
});

export interface LoadSbankenCachedCredentialsSuccessAction
  extends Action<SbankenActionTypes.LoadCachedCredentialsSuccess> {
    credentials: string;
    customerId: string;
  }

const loadSbankenCachedCredentialsSuccess = (credentials: string, customerId: string):
  LoadSbankenCachedCredentialsSuccessAction => ({
    type: SbankenActionTypes.LoadCachedCredentialsSuccess,
    credentials,
    customerId,
  });

export const actions = {
  getSbankenTokenRequest,
  getSbankenTokenSuccess,
  getSbankenTokenFailure,
  loadSbankenCachedCredentials,
  loadSbankenCachedCredentialsSuccess,
};

export type SbankenAction =
  GetSbankenTokenRequestAction |
  GetSbankenTokenSuccessAction |
  GetSbankenTokenFailureAction |
  LoadSbankenCachedCredentialsAction |
  LoadSbankenCachedCredentialsSuccessAction;
