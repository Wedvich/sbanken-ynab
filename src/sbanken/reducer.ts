import { Reducer } from 'redux';
import { SbankenAccessToken } from './api';

export enum SbankenActionType {
  SetCredentials = 'sbanken/set-credentials',
  GetTokenRequest = 'sbanken/get-token-request',
  GetTokenResponse = 'sbanken/get-token-response',
}

const setCredentials = (clientId: string, clientSecret: string) => ({
  type: SbankenActionType.SetCredentials as SbankenActionType.SetCredentials,
  credentials: btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`),
});

const getTokenRequest = () => ({
  type: SbankenActionType.GetTokenRequest as SbankenActionType.GetTokenRequest,
});

const getTokenResponse = (token?: SbankenAccessToken, error?: string) => ({
  type: SbankenActionType.GetTokenResponse as SbankenActionType.GetTokenResponse,
  token,
  error,
});

export const actions = {
  setCredentials,
  getTokenRequest,
  getTokenResponse,
};

export type SbankenAction = ReturnType<typeof actions[keyof typeof actions]>

export const sbankenStateKey = 'sbanken';

const initialState = {
  credentials: '',
  authenticating: false,
  error: '',
};

export type SbankenState = typeof initialState;

const reducer: Reducer<SbankenState, SbankenAction> = (state = initialState, action) => {
  switch (action.type) {
    case SbankenActionType.SetCredentials:
      return {
        ...state,
        credentials: action.credentials,
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
      };
    default:
      return state;
  }
};

export default reducer;
