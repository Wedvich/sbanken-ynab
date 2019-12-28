import { Reducer } from 'redux';
import { Account } from './';

export enum AccountsActionType {

}

export const accountsStateKey = 'accounts';

const initialState: Account[] = [];

export type AccountsState = typeof initialState;

const reducer: Reducer<AccountsState> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
