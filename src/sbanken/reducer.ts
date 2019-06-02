import { Reducer } from 'redux';

import { SbankenAction, SbankenActionTypes } from './actions';

export interface SbankenState {
  credentials?: string;
  customerId?: string;
  loading: boolean;
  token?: string;
  tokenExpiry?: number;
};

const initialState: SbankenState = {
  credentials: undefined,
  customerId: undefined,
  loading: false,
  token: undefined,
  tokenExpiry: undefined,
};

export const reducer: Reducer<SbankenState, SbankenAction> = (state = initialState, action) => {
  switch (action.type) {
    case SbankenActionTypes.GetTokenRequest:
      return {
        ...state,
        credentials: action.credentials,
        customerId: action.customerId,
        loading: true,
      };

    case SbankenActionTypes.GetTokenSuccess:
      return {
        ...state,
        token: action.token,
        tokenExpiry: action.tokenExpiry,
        loading: false,
      };

    case SbankenActionTypes.GetTokenFailure:
      return {
        ...state,
        loading: false,
      };

    default:
      return state;
  }
};
