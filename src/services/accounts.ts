import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { fetchAllAccounts as fetchAllSbankenAccounts } from './sbanken';
import { ACCOUNTS_STORAGE_KEY, RANGE_STORAGE_KEY } from './storage';
import { fetchAllAccounts as fetchAllYnabAccounts } from './ynab';

const ACCOUNTS_SLICE_NAME = 'accounts';

export interface LinkedAccount {
  name: string;
  sbankenAccountId: string;
  ynabAccountId: string;
}

export const getLinkedAccounts = (state: RootState) => state[ACCOUNTS_SLICE_NAME].accounts;

export function validateLinkedAccount(account: Partial<LinkedAccount>): account is LinkedAccount {
  return !!account.name && !!account.sbankenAccountId && !!account.ynabAccountId;
}

export function createCompositeAccountId(account: LinkedAccount): string {
  return `${account.sbankenAccountId}${account.ynabAccountId}`.toLowerCase().replaceAll('-', '');
}

export interface AccountsState {
  accounts: Array<LinkedAccount>;
  hasLoadedSbankenAccounts: boolean;
  hasLoadedYnabAccounts: boolean;
  range: number;
}

const initialState: AccountsState = {
  accounts: JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]'),
  hasLoadedSbankenAccounts: false,
  hasLoadedYnabAccounts: false,
  range: +(localStorage.getItem(RANGE_STORAGE_KEY) || 7),
};

export const accountsSlice = createSlice({
  name: ACCOUNTS_SLICE_NAME,
  initialState,
  reducers: {
    putAccount: (state, action: PayloadAction<LinkedAccount>) => {
      const existingIndex = state.accounts.findIndex(
        (account) =>
          account.sbankenAccountId === action.payload.sbankenAccountId ||
          account.ynabAccountId === action.payload.ynabAccountId
      );

      action.payload.name = action.payload.name.trim().normalize('NFKD');

      if (existingIndex !== -1) {
        state.accounts[existingIndex] = action.payload;
      } else {
        state.accounts.push(action.payload);
      }

      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(state.accounts));
    },

    removeAccount: (state, action: PayloadAction<LinkedAccount>) => {
      const existingIndex = state.accounts.findIndex(
        (a) =>
          a.sbankenAccountId === action.payload.sbankenAccountId ||
          a.ynabAccountId === action.payload.ynabAccountId
      );

      if (existingIndex !== -1) {
        state.accounts.splice(existingIndex, 1);
      }

      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(state.accounts));
    },

    setRange: (state, action: PayloadAction<number>) => {
      state.range = action.payload;
      localStorage.setItem(RANGE_STORAGE_KEY, state.range.toString());
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllSbankenAccounts.fulfilled, (state) => {
      state.hasLoadedSbankenAccounts = true;
    });
    builder.addCase(fetchAllSbankenAccounts.rejected, (state) => {
      state.hasLoadedSbankenAccounts = true;
    });
    builder.addCase(fetchAllYnabAccounts.fulfilled, (state) => {
      state.hasLoadedYnabAccounts = true;
    });
    builder.addCase(fetchAllYnabAccounts.rejected, (state) => {
      state.hasLoadedYnabAccounts = true;
    });
  },
});

export const { putAccount, removeAccount, setRange } = accountsSlice.actions;
