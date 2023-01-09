import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { ACCOUNTS_STORAGE_KEY, RANGE_STORAGE_KEY } from './storage';

export interface LinkedAccount {
  name: string;
  sbankenAccountId: string;
  sbankenClientId: string;
  ynabAccountId: string;
  ynabBudgetId: string;
}

export function createCompositeAccountId(account: LinkedAccount): string {
  return `${account.sbankenAccountId}${account.ynabAccountId}`.toLowerCase().replaceAll('-', '');
}

const accountsAdapter = createEntityAdapter<LinkedAccount>({
  selectId: (linkedAccount) => createCompositeAccountId(linkedAccount),
});

export const getLinkedAccounts = accountsAdapter.getSelectors(
  (state: RootState) => state.linkedAccounts
).selectAll;

export function validateLinkedAccount(account: Partial<LinkedAccount>): account is LinkedAccount {
  return !!account.name && !!account.sbankenAccountId && !!account.ynabAccountId;
}

export const accountsSlice = createSlice({
  name: 'linkedAccounts',
  initialState: accountsAdapter.getInitialState(),
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
    saveAccount(state, action: PayloadAction<LinkedAccount>) {},
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
