import { Reducer } from 'redux';
import { YnabAccount, YnabTransaction, YnabBudget } from './api';
import { getAccountsRequest, getAccountsResponse } from './api/get-accounts';
import { getStoredServerKnowledge, getStoredBudgetId, getStoredToken } from './utils';
import { getTransactionsRequest, getTransactionsResponse } from './api/get-transactions';
import { createTransactionRequest, createTransactionResponse } from './api/create-transaction';
import { getBudgetsRequest, getBudgetsResponse } from './api/get-budgets';

export enum YnabActionType {
  SetToken = 'ynab/set-token',
  SetBudget = 'ynab/set-budget',
  GetAccountsRequest = 'ynab/get-accounts-request',
  GetAccountsResponse = 'ynab/get-accounts-response',
  GetTransactionsRequest = 'ynab/get-transactions-request',
  GetTransactionsResponse = 'ynab/get-transactions-response',
  CreateTransactionRequest = 'ynab/create-transaction-request',
  CreateTransactionResponse = 'ynab/create-transaction-response',
  GetBudgetsRequest = 'ynab/get-budgets-request',
  GetBudgetsResponse = 'ynab/get-budgets-response',
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
  getTransactionsRequest,
  getTransactionsResponse,
  createTransactionRequest,
  createTransactionResponse,
  getBudgetsRequest,
  getBudgetsResponse,
};

export type YnabAction = ReturnType<typeof actions[keyof typeof actions]>

export const ynabStateKey = 'ynab';

const initialState = {
  budgetId: getStoredBudgetId(),
  personalAccessToken: getStoredToken(),
  serverKnowledge: getStoredServerKnowledge(),
  accounts: {} as { [key: string]: YnabAccount },
  loading: false,
  transactions: [] as YnabTransaction[],
  budgets: [] as YnabBudget[],
  error: null as string | null,
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

    case YnabActionType.GetAccountsResponse: {
      if (action.error) {
        return {
          ...state,
          loading: false,
        };
      }

      return {
        ...state,
        loading: false,
        accounts: {
          ...state.accounts,
          ...action.accounts.reduce((accounts, account) => {
            accounts[account.id] = account;
            return accounts;
          }, {}),
        },
        serverKnowledge: {
          ...state.serverKnowledge,
          [YnabActionType.GetAccountsRequest]: action.serverKnowledge,
        },
      };
    }

    case YnabActionType.GetTransactionsRequest:
      return {
        ...state,
        loading: true,
      };

    case YnabActionType.GetTransactionsResponse:
      return {
        ...state,
        loading: false,
        transactions: state.transactions
          .filter((existingTransaction) =>
            !action.transactions.find((transaction) => transaction.id === existingTransaction.id))
          .concat(action.transactions),
        serverKnowledge: {
          ...state.serverKnowledge,
          [`${YnabActionType.GetTransactionsRequest}/${action.accountId}`]:
            action.serverKnowledge,
        },
      };

    case YnabActionType.CreateTransactionRequest:
      return {
        ...state,
        loading: true,
      };

    case YnabActionType.CreateTransactionResponse:
      return {
        ...state,
        loading: false,
      };

    case YnabActionType.GetBudgetsRequest:
      return {
        ...state,
        loading: true,
      };

    case YnabActionType.GetBudgetsResponse:
      return {
        ...state,
        loading: false,
        budgets: action.budgets ?? [],
        error: action.error ?? '',
      };

    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _invariant: never = action;
      return state;
    }
  }
};

export default reducer;
