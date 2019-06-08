import { Reducer } from 'redux';
import { YnabAction, YnabActionTypes } from './actions';

export interface YnabState {
  accessToken: string;
  budgetId: string;
}

const initialState = {
  accessToken: '',
  budgetId: '',
};

const ynabReducer: Reducer<YnabState, YnabAction> = (state = initialState, action) => {
  switch (action.type) {
    case YnabActionTypes.UpdateAccessToken:
      return {
        ...state,
        accessToken: action.accessToken,
        budgetId: action.budgetId,
      };
    default:
      return state;
  }
};

export default ynabReducer;
