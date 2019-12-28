import { Reducer } from 'redux';

export enum YnabActionType {
  SetToken = 'ynab/set-token',
  SetBudget = 'ynab/set-budget',
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
};

export type YnabAction = ReturnType<typeof actions[keyof typeof actions]>

export const ynabStateKey = 'ynab';

const initialState = {
  budgetId: null as string | null,
  personalAccessToken: null as string | null,
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
    default:
      return state;
  }
};

export default reducer;
