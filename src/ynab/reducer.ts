import { Reducer } from 'redux';
import { YnabAccount } from './api';
import { getAccountsRequest, getAccountsResponse } from './api/get-accounts';
import { getStoredServerKnowledge, getStoredBudgetId, getStoredToken } from './utils';

export enum YnabActionType {
  SetToken = 'ynab/set-token',
  SetBudget = 'ynab/set-budget',
  GetAccountsRequest = 'ynab/get-accounts-request',
  GetAccountsResponse = 'ynab/get-accounts-response',
}

const setToken = (token: string) => ({
  type: YnabActionType.SetToken as YnabActionType.SetToken,
  token,
});

const setBudget = (budgetId: string) => ({
  type: YnabActionType.SetBudget as YnabActionType.SetBudget,
  budgetId,
});

export const actions = {
  setToken,
  setBudget,
  getAccountsRequest,
  getAccountsResponse,
};

export type YnabAction = ReturnType<typeof actions[keyof typeof actions]>

export const ynabStateKey = 'ynab';

const initialState = {
  budgetId: getStoredBudgetId(),
  personalAccessToken: getStoredToken(),
  serverKnowledge: getStoredServerKnowledge(),
  accounts: [] as YnabAccount[],
  loading: false,
};

export type YnabState = typeof initialState;

const reducer: Reducer<YnabState, YnabAction> = (state = initialState, action) => {
  switch (action.type) {
    case YnabActionType.SetToken:
      return {
        ...state,
        personalAccessToken: action.token,
      };
    case YnabActionType.SetBudget:
      return {
        ...state,
        budgetId: action.budgetId,
      };
    case YnabActionType.GetAccountsRequest:
      return {
        ...state,
        loading: true,
      };
    case YnabActionType.GetAccountsResponse:
      return {
        ...state,
        loading: false,
        accounts: action.accounts,
        serverKnowledge: action.serverKnowledge,
      };
    default:
      return state;
  }
};

export default reducer;
