import { Reducer } from 'redux';
import { getStoredAccountSources } from './utils';

export enum AccountsActionType {
}

export const actions = {};

export type AccountsAction = ReturnType<typeof actions[keyof typeof actions]>

export const accountsStateKey = 'accounts';

const initialState = getStoredAccountSources();

export type AccountsState = typeof initialState;

const reducer: Reducer<AccountsState> = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
