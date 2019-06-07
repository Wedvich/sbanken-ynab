import { Reducer } from 'redux';
import { YnabAction, YnabActionTypes } from './actions';

export interface YnabState {
  accessToken?: string;
}

const initialState = {
  accessToken: '',
};

const ynabReducer: Reducer<YnabState, YnabAction> = (state = initialState, action) => {
  switch (action.type) {
    case YnabActionTypes.UpdateAccessToken:
      return {
        ...state,
        accessToken: action.accessToken,
      };
    default:
      return state;
  }
};

export default ynabReducer;
