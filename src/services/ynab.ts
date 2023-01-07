import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  isAnyOf,
  prepareAutoBatched,
  createEntityAdapter,
  EntityState,
  createSelector,
} from '@reduxjs/toolkit';
import { ynabApiBaseUrl } from '../config';
import type { RootState } from '.';
import { YNAB_TOKENS_KEY, YNAB_BUDGET_KEY } from './storage';
import { listenerMiddleware } from './listener';
import { fetchInitialData } from '../utils';

const YNAB_SLICE_NAME = 'ynab';

interface YnabAccount {
  id: string;
  name: string;
  type: string;
  on_budget: boolean;
  closed: boolean;
  note: string;
  balance: number;
  cleared_balance: number;
  uncleared_balance: number;
  transfer_payee_id: string;
  direct_import_linked: boolean;
  direct_import_in_error: boolean;
  deleted: boolean;
}

export interface YnabTransaction {
  id: string;
  date: string;
  amount: number;
  memo: string;
  cleared: string;
  approved: boolean;
  flag_color: string;
  account_id: string;
  payee_id: string;
  category_id: string;
  transfer_account_id: string;
  transfer_transaction_id: string;
  matched_transaction_id: string;
  import_id: string;
  deleted: boolean;
  account_name: string;
  payee_name: string;
  category_name: string;
  subtransactions: Array<{
    id: string;
    transaction_id: string;
    amount: number;
    memo: string;
    payee_id: string;
    payee_name: string;
    category_id: string;
    category_name: string;
    transfer_account_id: string;
    transfer_transaction_id: string;
    deleted: boolean;
  }>;
  _checksum?: number;
}

interface YnabBudget {
  id: string;
  name: string;
  last_modified_on: string;
  first_month: string;
  last_month: string;
  date_format: {
    format: string;
  };
  currency_format: {
    iso_code: string;
    example_format: string;
    decimal_digits: number;
    decimal_separator: string;
    symbol_first: boolean;
    group_separator: string;
    currency_symbol: string;
    display_symbol: boolean;
  };
}

interface YnabBudgetWithAccounts extends YnabBudget {
  accounts: Array<YnabAccount>;
}

interface YnabBudgetsResponse {
  budgets: Array<YnabBudgetWithAccounts>;
  default_budget: string | null;
}

interface YnabRateLimit {
  limit: number;
  maxLimit: number;
}

const budgetsAdapter = createEntityAdapter<YnabBudget>({
  selectId: (budget) => budget.id,
});
const accountsAdapter = createEntityAdapter<YnabAccount>({
  selectId: (account) => account.id,
});

export const getYnabAccounts = (state: RootState) => state[YNAB_SLICE_NAME].accounts;
export const getYnabTokens = (state: RootState) => state[YNAB_SLICE_NAME].tokens;
export const getYnabBudgetsRequestStatus = (state: RootState) =>
  state[YNAB_SLICE_NAME].budgetRequestStatusByToken;

export const getYnabBudgets = createSelector(
  budgetsAdapter.getSelectors((state: RootState) => state[YNAB_SLICE_NAME].budgets).selectAll,
  (budgets) => {
    return budgets.sort((a, b) => a.name.localeCompare(b.name));
  }
);

// export const getYnabBudgets = budgetsAdapter.getSelectors(
//   (state: RootState) => state[YNAB_SLICE_NAME].budgets
// ).selectAll;
export type RequestStatus = 'pending' | 'fulfilled' | 'rejected';

export interface YnabState {
  accounts: EntityState<YnabAccount>;
  budgets: EntityState<YnabBudget>;
  budgetIdByToken: Record<string, string>;
  budgetRequestStatusByToken: Record<string, RequestStatus | undefined>;
  includedBudgets: Array<string>;
  tokens: Array<string>;
  rateLimitByToken: Record<string, YnabRateLimit | undefined>;
}

function getStoredTokens() {
  const storedTokens = JSON.parse<Array<string>>(localStorage.getItem(YNAB_TOKENS_KEY) || '[]');
  return storedTokens;
}

function getStoredBudgets() {
  const storedBudgets = JSON.parse<Array<string>>(localStorage.getItem(YNAB_BUDGET_KEY) || '[]');
  return storedBudgets;
}

const initialState: YnabState = {
  accounts: accountsAdapter.getInitialState(),
  budgetIdByToken: {},
  budgetRequestStatusByToken: {},
  budgets: budgetsAdapter.getInitialState(),
  includedBudgets: getStoredBudgets(),
  tokens: getStoredTokens(),
  rateLimitByToken: {},
};

export const fetchAllAccounts = createAsyncThunk(`${YNAB_SLICE_NAME}/fetchAllAccounts`, () => {
  //async (_, thunkAPI): Promise<Array<YnabAccount>> => {
  // const { tokens, budget } = (thunkAPI.getState() as RootState).ynab;
  // const [token] = tokens;
  // if (!token || !budget) {
  //   return Promise.reject('invalid YNAB access token or budget');
  // }
  // const response = await fetch(`${ynabApiBaseUrl}/budgets/${budget}/accounts`, {
  //   headers: {
  //     Accept: 'application/json',
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // if (!response.ok) {
  //   return Promise.reject(response.statusText); // TODO: Handle errors
  // }
  // const { data } = (await response.json()) as { data: { accounts: Array<YnabAccount> } };
  // return data.accounts.filter(
  //   (account) => !account.deleted && !account.closed && account.on_budget
  // );
});

export const ynabSlice = createSlice({
  name: YNAB_SLICE_NAME,
  initialState,
  reducers: {
    saveToken(state, action: PayloadAction<{ token: string; originalToken?: string }>) {
      state.tokens.push(action.payload.token);
    },
    setRateLimit: {
      reducer(state, action: PayloadAction<{ token: string; rateLimit: YnabRateLimit }>) {
        state.rateLimitByToken[action.payload.token] = action.payload.rateLimit;
      },
      prepare: prepareAutoBatched<{ token: string; rateLimit: YnabRateLimit }>(),
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isAnyOf(
        fetchBudgetsAndAccounts.pending.match,
        fetchBudgetsAndAccounts.fulfilled.match,
        fetchBudgetsAndAccounts.rejected.match
      ),
      (state, action) => {
        state.budgetRequestStatusByToken[action.meta.arg] = action.meta.requestStatus;
      }
    );

    builder.addMatcher(fetchBudgetsAndAccounts.fulfilled.match, (state, action) => {
      const accounts: Array<YnabAccount> = [];
      const budgets = action.payload.budgets.map(({ accounts, ...budget }) => {
        accounts.push(...accounts);
        return budget;
      });

      budgetsAdapter.setMany(state.budgets, budgets);
      accountsAdapter.setMany(state.accounts, accounts);
    });

    // builder.addMatcher(
    //   (action) => action.type?.beginsWith(fetchBudgets.typePrefix),
    //   (state, action) => {
    //     console.log('action.meta.arg', action.meta.arg);
    //   }
    // );
  },
});

export const fetchBudgetsAndAccounts = createAsyncThunk<YnabBudgetsResponse, string>(
  `${YNAB_SLICE_NAME}/fetchBudgetsAndAccounts`,
  async (token, { dispatch }) => {
    const response = await fetch(`${ynabApiBaseUrl}/budgets?include_accounts=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rateLimit = response.headers.get('X-Rate-Limit')?.split('/');
    if (rateLimit) {
      dispatch(
        ynabSlice.actions.setRateLimit({
          token,
          rateLimit: { limit: +rateLimit[0], maxLimit: +rateLimit[1] },
        })
      );
    }

    return (await response.json()).data;
  },
  {
    condition: (token, { getState }) => {
      const fetchStatus = (getState() as RootState)[YNAB_SLICE_NAME].budgetRequestStatusByToken[
        token
      ];
      if (fetchStatus === 'pending' || fetchStatus === 'fulfilled') {
        return false;
      }
    },
  }
);

listenerMiddleware.startListening({
  actionCreator: ynabSlice.actions.saveToken,
  effect: async (action, { dispatch, getState }) => {
    const { tokens } = (getState() as RootState)[YNAB_SLICE_NAME];
    localStorage.setItem(YNAB_TOKENS_KEY, JSON.stringify(tokens));
    await dispatch(fetchBudgetsAndAccounts(action.payload.token));
  },
});

listenerMiddleware.startListening({
  actionCreator: fetchInitialData,
  effect: async (_, { dispatch, getState }) => {
    const { tokens } = (getState() as RootState)[YNAB_SLICE_NAME];
    await Promise.allSettled(tokens.map((token) => dispatch(fetchBudgetsAndAccounts(token))));
  },
});

export const { saveToken } = ynabSlice.actions;
