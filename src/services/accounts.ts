import {
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '.';
import { startAppListening } from './listener';
import { getSbankenAccountsLookup, getSbankenUnclearedBalance } from './sbanken';
import { ACCOUNTS_STORAGE_KEY } from './storage';
import { getYnabAccountsLookup, getYnabBudgetsLookup } from './ynab';

export interface LinkedAccount {
  name: string;
  sbankenAccountId: string;
  sbankenClientId: string;
  ynabAccountId: string;
  ynabBudgetId: string;
}

export interface EnrichedAccount extends LinkedAccount {
  compositeId: string;
  sbankenLinkOk: boolean;
  sbankenClearedBalance: number;
  sbankenUnclearedBalance: number;
  sbankenWorkingBalance: number;
  ynabLinkOk: boolean;
  ynabClearedBalance: number;
  ynabUnclearedBalance: number;
  ynabWorkingBalance: number;
}

export function createCompositeAccountId(account: LinkedAccount): string {
  return `${account.sbankenAccountId}_${account.ynabAccountId}`.toLowerCase().replaceAll('-', '');
}

const accountsAdapter = createEntityAdapter<LinkedAccount>({
  selectId: (linkedAccount) => createCompositeAccountId(linkedAccount),
});

const accountSelectors = accountsAdapter.getSelectors((state: RootState) => state.linkedAccounts);

export const getLinkedAccounts = accountSelectors.selectAll;
export const getLinkedAccountById = accountSelectors.selectById;

export const getEnrichedAccounts = createSelector(
  [getLinkedAccounts, getSbankenAccountsLookup, getYnabAccountsLookup, getYnabBudgetsLookup],
  (
    linkedAccounts,
    sbankenAccountsLookup,
    ynabAccountsLookup,
    ynabBudgetsLookup
  ): ReadonlyArray<EnrichedAccount> => {
    return linkedAccounts.reduce<Array<EnrichedAccount>>((linkedAccounts, linkedAccount) => {
      const sbankenAccount = sbankenAccountsLookup[linkedAccount.sbankenAccountId];
      const ynabAccount = ynabAccountsLookup[linkedAccount.ynabAccountId];
      const ynabBudget = ynabBudgetsLookup[linkedAccount.ynabBudgetId];

      const sbankenUnclearedBalance = getSbankenUnclearedBalance(sbankenAccount);

      const enrichedAccount: EnrichedAccount = {
        ...linkedAccount,
        compositeId: createCompositeAccountId(linkedAccount),
        sbankenLinkOk: !!sbankenAccount,
        sbankenClearedBalance: +(sbankenAccount?.balance ?? 0).toFixed(2),
        sbankenUnclearedBalance,
        sbankenWorkingBalance: +((sbankenAccount?.balance ?? 0) + sbankenUnclearedBalance).toFixed(
          2
        ),
        ynabLinkOk: !!ynabAccount && !!ynabBudget,
        ynabClearedBalance: +((ynabAccount?.cleared_balance ?? 0) / 1000).toFixed(2),
        ynabUnclearedBalance: +((ynabAccount?.uncleared_balance ?? 0) / 1000).toFixed(2),
        ynabWorkingBalance: +((ynabAccount?.balance ?? 0) / 1000).toFixed(2),
      };

      linkedAccounts.push(enrichedAccount);
      return linkedAccounts;
    }, []);
  }
);

export const getEnrichedAccountById = createSelector(
  getEnrichedAccounts,
  (_: RootState, id?: string) => id,
  (accounts, id) => {
    if (!id) return;
    return accounts.find((account) => account.compositeId === id);
  }
);

export function validateLinkedAccount(account: Partial<LinkedAccount>): account is LinkedAccount {
  return !!account.name && !!account.sbankenAccountId && !!account.ynabAccountId;
}

function loadStoredAccounts() {
  try {
    const storedCredentials = JSON.parse<Array<LinkedAccount>>(
      localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]'
    );

    return storedCredentials.filter((account) => validateLinkedAccount(account));
  } catch (e) {
    console.debug(e);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    return [];
  }
}

export const accountsSlice = createSlice({
  name: 'linkedAccounts',
  initialState: accountsAdapter.setAll(accountsAdapter.getInitialState(), loadStoredAccounts()),
  reducers: {
    // putAccount: (state, action: PayloadAction<LinkedAccount>) => {
    //   const existingIndex = state.accounts.findIndex(
    //     (account) =>
    //       account.sbankenAccountId === action.payload.sbankenAccountId ||
    //       account.ynabAccountId === action.payload.ynabAccountId
    //   );
    //   action.payload.name = action.payload.name.trim().normalize('NFKD');
    //   if (existingIndex !== -1) {
    //     state.accounts[existingIndex] = action.payload;
    //   } else {
    //     state.accounts.push(action.payload);
    //   }
    //   localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(state.accounts));
    // },
    // removeAccount: (state, action: PayloadAction<LinkedAccount>) => {
    //   const existingIndex = state.accounts.findIndex(
    //     (a) =>
    //       a.sbankenAccountId === action.payload.sbankenAccountId ||
    //       a.ynabAccountId === action.payload.ynabAccountId
    //   );
    //   if (existingIndex !== -1) {
    //     state.accounts.splice(existingIndex, 1);
    //   }
    //   localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(state.accounts));
    // },
    // setRange: (state, action: PayloadAction<number>) => {
    //   state.range = action.payload;
    //   localStorage.setItem(RANGE_STORAGE_KEY, state.range.toString());
    // },
    saveAccount(state, action: PayloadAction<LinkedAccount & { originalAccountId?: string }>) {
      const { originalAccountId, ...account } = action.payload;
      accountsAdapter.upsertOne(state, account);

      if (!originalAccountId) return;

      const accountId = createCompositeAccountId(account);
      if (originalAccountId !== accountId) {
        accountsAdapter.removeOne(state, originalAccountId);
      }
    },
    deleteAccount(state, action: PayloadAction<string>) {
      accountsAdapter.removeOne(state, action.payload);
    },
    reorderAccounts(state, action: PayloadAction<Array<string>>) {
      state.ids = action.payload;
    },
  },
  extraReducers: () => {
    // builder.addCase(fetchAllSbankenAccounts.fulfilled, (state) => {
    //   state.hasLoadedSbankenAccounts = true;
    // });
    // builder.addCase(fetchAllSbankenAccounts.rejected, (state) => {
    //   state.hasLoadedSbankenAccounts = true;
    // });
    // builder.addCase(fetchAllYnabAccounts.fulfilled, (state) => {
    //   state.hasLoadedYnabAccounts = true;
    // });
    // builder.addCase(fetchAllYnabAccounts.rejected, (state) => {
    //   state.hasLoadedYnabAccounts = true;
    // });
  },
});

// export const { putAccount, removeAccount, setRange } = accountsSlice.actions;

export const { deleteAccount, reorderAccounts, saveAccount } = accountsSlice.actions;

const matcher = isAnyOf(deleteAccount, saveAccount, reorderAccounts);
startAppListening({
  matcher,
  effect: (_, { getState }) => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(getLinkedAccounts(getState())));
  },
});
