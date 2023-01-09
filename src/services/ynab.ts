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
import memoize from 'lodash-es/memoize';
import { ynabApiBaseUrl } from '../config';
import type { RootState } from '.';
import { YNAB_TOKENS_KEY, YNAB_BUDGET_KEY } from './storage';
import { startAppListening } from './listener';
import { fetchInitialData, RequestStatus, stripEmojis } from '../utils';
import { DateTime } from 'luxon';

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

interface YnabAccountWithBudgetId extends YnabAccount {
  budget_id: string;
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
const accountsAdapter = createEntityAdapter<YnabAccountWithBudgetId>({
  selectId: (account) => account.id,
});
export const getYnabTokens = (state: RootState) => state.ynab.tokens;
export const getYnabBudgetsRequestStatus = (state: RootState) => state.ynab.requestStatusByToken;
export const getIncludedBudgets = (state: RootState) => state.ynab.includedBudgets;

const budgetSelectors = budgetsAdapter.getSelectors((state: RootState) => state.ynab.budgets);

export const getYnabBudgets = createSelector(budgetSelectors.selectAll, (budgets) => {
  return budgets.sort(
    (a, b) => +DateTime.fromISO(b.last_modified_on) - +DateTime.fromISO(a.last_modified_on)
  );
});

export const getYnabBudgetsMap = budgetSelectors.selectEntities;

export const getYnabAccounts = createSelector(
  accountsAdapter.getSelectors((state: RootState) => state.ynab.accounts).selectAll,
  getIncludedBudgets,
  (accounts, includedBudgets) => {
    const prepareName = memoize((name: string) => stripEmojis(name).trim());
    return accounts
      .filter((account) => !account.deleted && includedBudgets.includes(account.budget_id))
      .sort((a, b) => prepareName(a.name).localeCompare(prepareName(b.name)));
  }
);

export interface YnabState {
  accounts: EntityState<YnabAccountWithBudgetId>;
  budgets: EntityState<YnabBudget>;
  includedBudgets: Array<string>;
  rateLimitByToken: Record<string, YnabRateLimit | undefined>;
  requestStatusByToken: Record<string, RequestStatus | undefined>;
  tokens: Array<string>;
  tokensByBudgetId: Record<string, Array<string>>;
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
  budgets: budgetsAdapter.getInitialState(),
  includedBudgets: getStoredBudgets(),
  rateLimitByToken: {},
  requestStatusByToken: {},
  tokens: getStoredTokens(),
  tokensByBudgetId: {},
};

export const ynabSlice = createSlice({
  name: 'ynab',
  initialState,
  reducers: {
    saveToken(state, action: PayloadAction<{ token: string; originalToken?: string }>) {
      state.tokens.push(action.payload.token);
    },
    deleteToken(state, action: PayloadAction<string>) {
      const index = state.tokens.indexOf(action.payload);
      if (index !== -1) {
        state.tokens.splice(index, 1);
      }

      delete state.requestStatusByToken[action.payload];
      delete state.rateLimitByToken[action.payload];

      // Delete budgets for this token if they have no other tokens associated with them
      const budgetsIdsToRemove: Array<string> = [];
      for (const budgetId of Object.keys(state.tokensByBudgetId)) {
        const budgetTokens = state.tokensByBudgetId[budgetId];
        const tokenIndex = budgetTokens.indexOf(action.payload);
        if (tokenIndex === -1) continue;

        budgetTokens.splice(tokenIndex, 1);
        if (budgetTokens.length === 0) {
          delete state.tokensByBudgetId[budgetId];
          budgetsIdsToRemove.push(budgetId);
        }
      }
      budgetsAdapter.removeMany(state.budgets, budgetsIdsToRemove);
    },
    setRateLimit: {
      reducer(state, action: PayloadAction<{ token: string; rateLimit: YnabRateLimit }>) {
        state.rateLimitByToken[action.payload.token] = action.payload.rateLimit;
      },
      prepare: prepareAutoBatched<{ token: string; rateLimit: YnabRateLimit }>(),
    },
    toggleBudget(state, action: PayloadAction<string>) {
      const budgetId = action.payload;
      const index = state.includedBudgets.indexOf(budgetId);
      if (index === -1) {
        state.includedBudgets.push(budgetId);
      } else {
        state.includedBudgets.splice(index, 1);
      }
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
        state.requestStatusByToken[action.meta.arg] = action.meta.requestStatus;
      }
    );

    builder.addMatcher(fetchBudgetsAndAccounts.fulfilled.match, (state, action) => {
      const allAccounts: Array<YnabAccountWithBudgetId> = [];
      const budgets = action.payload.budgets.map(({ accounts, ...budget }) => {
        // Extract and enrich accounts with budget ID so they can be mapped back later
        const accountsWithBudgetId = accounts.map<YnabAccountWithBudgetId>((account) => ({
          ...account,
          budget_id: budget.id,
        }));

        Array.prototype.push.apply(allAccounts, accountsWithBudgetId);

        if (!state.tokensByBudgetId[budget.id]?.includes(action.meta.arg)) {
          (state.tokensByBudgetId[budget.id] ??= []).push(action.meta.arg);
        }

        return budget;
      });

      budgetsAdapter.setMany(state.budgets, budgets);
      accountsAdapter.setMany(state.accounts, allAccounts);
    });
  },
});

export const { deleteToken, saveToken, toggleBudget } = ynabSlice.actions;

export const fetchBudgetsAndAccounts = createAsyncThunk<YnabBudgetsResponse, string>(
  `${ynabSlice.name}/fetchBudgetsAndAccounts`,
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

    if (!response.ok) {
      return Promise.reject(response.statusText);
    }

    return (await response.json()).data;
  },
  {
    condition: (token, { getState }) => {
      const fetchStatus = (getState() as RootState).ynab.requestStatusByToken[token];
      if (fetchStatus === 'pending' || fetchStatus === 'fulfilled') {
        return false;
      }
    },
  }
);

/** Stores changes to tokens in localStorage */
startAppListening({
  matcher: isAnyOf(ynabSlice.actions.saveToken.match, ynabSlice.actions.deleteToken.match),
  effect: async (action, { dispatch, getState }) => {
    if (ynabSlice.actions.saveToken.match(action)) {
      await dispatch(fetchBudgetsAndAccounts(action.payload.token));
      if (action.payload.originalToken) {
        dispatch(ynabSlice.actions.deleteToken(action.payload.originalToken));
      }
    }

    const { tokens } = getState().ynab;
    localStorage.setItem(YNAB_TOKENS_KEY, JSON.stringify(tokens));
  },
});

/** Stores changes to included budgets in localStorage */
startAppListening({
  actionCreator: ynabSlice.actions.toggleBudget,
  effect: (_, { getState }) => {
    const { includedBudgets } = getState().ynab;
    localStorage.setItem(YNAB_BUDGET_KEY, JSON.stringify(includedBudgets));
  },
});

/** Loads all existing budgets and accounts on app initialization */
startAppListening({
  actionCreator: fetchInitialData,
  effect: async (_, { dispatch, getState }) => {
    const { tokens } = getState().ynab;
    await Promise.allSettled(tokens.map((token) => dispatch(fetchBudgetsAndAccounts(token))));
  },
});
