import { Reducer } from 'redux';
import { getStoredAccountSources, compareConnectedAccountSource } from './utils';
import { ConnectedAccountSource } from './types';

export enum AccountsActionType {
  Add = 'accounts/add',
  Remove = 'accounts/remove',
  Rename = 'accounts/rename',
}

const add = (source: ConnectedAccountSource) => ({
  type: AccountsActionType.Add as AccountsActionType.Add,
  source,
});

const remove = (source: ConnectedAccountSource) => ({
  type: AccountsActionType.Remove as AccountsActionType.Remove,
  source,
});

const rename = (source: ConnectedAccountSource, name: string) => ({
  type: AccountsActionType.Rename as AccountsActionType.Rename,
  source,
  name,
});

export const actions = {
  add,
  remove,
  rename,
};

export type AccountsAction = ReturnType<typeof actions[keyof typeof actions]>

export const accountsStateKey = 'accounts';

const initialState = getStoredAccountSources();

export type AccountsState = typeof initialState;

const reducer: Reducer<AccountsState, AccountsAction> = (state = initialState, action) => {
  switch (action.type) {
    case AccountsActionType.Add: {
      if (state.find(
        (connectedAccount) => compareConnectedAccountSource(connectedAccount, action.source))
      ) return state;
      return state.concat([action.source]);
    }

    case AccountsActionType.Remove:
      return state.filter((account) => !compareConnectedAccountSource(account, action.source));

    case AccountsActionType.Rename: {
      const accountIndex = state.findIndex(
        (connectedAccount) => compareConnectedAccountSource(connectedAccount, action.source));

      if (accountIndex === -1) return state;

      return [
        ...state.slice(0, accountIndex),
        {
          ...state[accountIndex],
          displayName: action.name,
        },
        ...state.slice(accountIndex + 1),
      ];
    }

    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _invariant: never = action;
      return state;
    }
  }
};

export default reducer;
