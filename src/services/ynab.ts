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
import type { AppThunk, RootState, Undoable } from '.';
import { YNAB_TOKENS_KEY, YNAB_BUDGET_KEY } from './storage';
import { startAppListening } from './listener';
import { fetchInitialData, RequestStatus, stripEmojis } from '../utils';
import { DateTime } from 'luxon';
import type {
  YnabBudget,
  YnabAccountWithBudgetId,
  YnabRateLimit,
  YnabGetBudgetsResponse,
  YnabAccountsResponse,
} from './ynab.types';
import { addAlert } from './alerts';

const budgetsAdapter = createEntityAdapter<YnabBudget>({
  selectId: (budget) => budget.id,
});
export const ynabAccountsAdapter = createEntityAdapter<YnabAccountWithBudgetId>({
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
export const getYnabBudgetsLookup = budgetSelectors.selectEntities;

const ynabAccountsSelectors = ynabAccountsAdapter.getSelectors();
export const ynabGlobalAccountsSelectors = ynabAccountsAdapter.getSelectors(
  (state: RootState) => state.ynab.accounts
);

export const getYnabAccounts = createSelector(
  ynabGlobalAccountsSelectors.selectAll,
  getIncludedBudgets,
  (accounts, includedBudgets) => {
    const prepareName = memoize((name: string) => stripEmojis(name).trim());
    return accounts
      .filter(
        (account) =>
          !account.deleted && !account.closed && includedBudgets.includes(account.budget_id)
      )
      .sort((a, b) => prepareName(a.name).localeCompare(prepareName(b.name)));
  }
);

export const getYnabAccountsLookup = ynabGlobalAccountsSelectors.selectEntities;

export const getYnabAccountLoadingStateById = createSelector(
  (_: RootState, id: string) => id,
  getYnabAccountsLookup,
  getYnabBudgetsRequestStatus,
  (id, accountsLookup, budgetStatuses) => {
    const account = accountsLookup[id];
    if (!account) return;

    return budgetStatuses[account.budget_id];
  }
);

export const getYnabKnowledgeByBudgetId = createSelector(
  (_: RootState, id?: string) => id,
  (state: RootState) => state.ynab.serverKnowledgeByBudgetId,
  (id, serverKnowledgeByBudgetId) => {
    if (!id) return;

    return serverKnowledgeByBudgetId[id]?.latest;
  }
);

export interface YnabState {
  accounts: EntityState<YnabAccountWithBudgetId>;
  budgets: EntityState<YnabBudget>;
  includedBudgets: Array<string>;
  rateLimitByToken: Record<string, YnabRateLimit | undefined>;
  requestStatusByToken: Record<string, RequestStatus | undefined>;
  serverKnowledgeByBudgetId: Record<
    string,
    | {
        latest: number;
        byEndpoint: Record<string, number | undefined>;
      }
    | undefined
  >;
  tokens: Array<string>;
  tokensByBudgetId: Record<string, Array<string>>;
}

function loadStoredTokens() {
  const storedTokens = JSON.parse<Array<string>>(localStorage.getItem(YNAB_TOKENS_KEY) || '[]');
  return storedTokens;
}

function loadStoredBudgets() {
  const storedBudgets = JSON.parse<Array<string>>(localStorage.getItem(YNAB_BUDGET_KEY) || '[]');
  return storedBudgets;
}

const initialState: YnabState = {
  accounts: ynabAccountsAdapter.getInitialState(),
  budgets: budgetsAdapter.getInitialState(),
  includedBudgets: loadStoredBudgets(),
  rateLimitByToken: {},
  requestStatusByToken: {},
  serverKnowledgeByBudgetId: {},
  tokens: loadStoredTokens(),
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
    setServerKnowledge(
      state,
      action: PayloadAction<{ budgetId: string; knowledge: number; endpoint?: string }>
    ) {
      const serverKnowledgeByBudgetId = (state.serverKnowledgeByBudgetId[
        action.payload.budgetId
      ] ??= {
        latest: action.payload.knowledge,
        byEndpoint: {},
      });

      // TODO: Don't set this twice
      serverKnowledgeByBudgetId.latest = Math.max(
        serverKnowledgeByBudgetId.latest,
        action.payload.knowledge
      );

      if (action.payload.endpoint) {
        serverKnowledgeByBudgetId.byEndpoint[action.payload.endpoint] = Math.max(
          serverKnowledgeByBudgetId.byEndpoint[action.payload.endpoint] ?? 0,
          action.payload.knowledge
        );
      }
    },
    clearServerKnowledge(state, action: PayloadAction<{ budgetId: string; endpoint: string }>) {
      delete state.serverKnowledgeByBudgetId[action.payload.budgetId]?.byEndpoint[
        action.payload.endpoint
      ];
    },
    adjustAccountBalance: {
      reducer(
        state,
        action: PayloadAction<{ accountId: string; amount: number; cleared: boolean }>
      ) {
        const account = ynabAccountsSelectors.selectById(state.accounts, action.payload.accountId);
        if (!account) return;

        const amount = action.payload.amount * 1000;

        const changes: Partial<YnabAccountWithBudgetId> = {
          balance: account.balance + amount,
        };
        if (action.payload.cleared) {
          changes.cleared_balance = account.cleared_balance + amount;
        } else {
          changes.uncleared_balance = account.uncleared_balance + amount;
        }

        state.accounts = ynabAccountsAdapter.updateOne(state.accounts, {
          id: account.id,
          changes,
        });
      },
      prepare: prepareAutoBatched<{ accountId: string; amount: number; cleared: boolean }>(),
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
      ynabAccountsAdapter.setMany(state.accounts, allAccounts);
    });

    builder.addMatcher(
      isAnyOf(
        fetchAccounts.pending.match,
        fetchAccounts.fulfilled.match,
        fetchAccounts.rejected.match
      ),
      (state, action) => {
        const account = ynabAccountsSelectors.selectById(state.accounts, action.meta.arg);
        if (!account) return;

        const token = state.tokensByBudgetId[account.budget_id][0];
        state.requestStatusByToken[token] = action.meta.requestStatus;
      }
    );

    builder.addMatcher(fetchAccounts.fulfilled.match, (state, action) => {
      const accountId = action.meta.arg;
      const account = state.accounts.entities[accountId];
      const budgetId = account?.budget_id;
      if (!budgetId) return;

      const serverKnowledgeByBudgetId = (state.serverKnowledgeByBudgetId[budgetId] ??= {
        latest: action.payload.data.server_knowledge,
        byEndpoint: {},
      });

      // TODO: Don't set this twice
      serverKnowledgeByBudgetId.latest = Math.max(
        serverKnowledgeByBudgetId.latest,
        action.payload.data.server_knowledge
      );

      const accountsWithBudgetId = action.payload.data.accounts.map<YnabAccountWithBudgetId>(
        (account) => ({
          ...account,
          budget_id: budgetId,
        })
      );

      ynabAccountsAdapter.setMany(state.accounts, accountsWithBudgetId);
    });
  },
});

export const { clearServerKnowledge, deleteToken, saveToken, setServerKnowledge, toggleBudget } =
  ynabSlice.actions;

const ynabError = 'ynab-error';

export const fetchBudgetsAndAccounts = createAsyncThunk<YnabGetBudgetsResponse, string>(
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
      dispatch(
        addAlert({
          id: ynabError,
          title: 'Kunne ikke hente budsjetter fra YNAB',
          message:
            'Det oppsto en feil under henting av budsjetter, og serveren ga ingen spesifisert feilkode. Du kan forsøke å lage et nytt token i YNAB sine utviklerinnstillinger.',
        })
      );
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

export const fetchAccounts = createAsyncThunk<YnabAccountsResponse, string>(
  `${ynabSlice.name}/fetchAccounts`,
  async (accountId, { dispatch, getState }) => {
    const state = getState() as RootState;
    const accountsLookup = getYnabAccountsLookup(state);
    const account = accountsLookup[accountId];
    if (!account) return;

    const token = state.ynab.tokensByBudgetId[account.budget_id][0];
    const serverKnowledge = getYnabKnowledgeByBudgetId(state, account.budget_id);

    const response = await fetch(
      `${ynabApiBaseUrl}/budgets/${account.budget_id}/accounts${
        serverKnowledge ? `?last_knowledge_of_server=${serverKnowledge}` : ''
      }
    `,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

    return response.json();
  }
);

export const adjustAccountBalance =
  ({
    accountId,
    amount,
    cleared,
  }: ReturnType<typeof ynabSlice.actions.adjustAccountBalance>['payload']): AppThunk<Undoable> =>
  (dispatch) => {
    dispatch(ynabSlice.actions.adjustAccountBalance({ accountId, amount, cleared }));
    return {
      undo: () => {
        dispatch(ynabSlice.actions.adjustAccountBalance({ accountId, amount: -amount, cleared }));
      },
    };
  };

/** Stores changes to tokens in localStorage. */
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

/** Stores changes to included budgets in localStorage. */
startAppListening({
  actionCreator: ynabSlice.actions.toggleBudget,
  effect: (_, { getState }) => {
    const { includedBudgets } = getState().ynab;
    localStorage.setItem(YNAB_BUDGET_KEY, JSON.stringify(includedBudgets));
  },
});

/** Loads all existing budgets and accounts on app initialization. */
startAppListening({
  actionCreator: fetchInitialData,
  effect: async (_, { dispatch, getState }) => {
    const { tokens } = getState().ynab;
    await Promise.allSettled(tokens.map((token) => dispatch(fetchBudgetsAndAccounts(token))));
  },
});
