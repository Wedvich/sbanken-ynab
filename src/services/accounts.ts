import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const ACCOUNTS_STATE_SLICE = 'accounts';

const ACCOUNTS_STORAGE_KEY = 'accounts';

export interface LinkedAccount {
  name: string;
  sbankenAccountId: string;
  ynabAccountId: string;
}

export function validateLinkedAccount(account: Partial<LinkedAccount>): account is LinkedAccount {
  return !!account.name && !!account.sbankenAccountId && !!account.ynabAccountId;
}

export function createCompositeAccountId(account: LinkedAccount): string {
  return `${account.sbankenAccountId}${account.ynabAccountId}`.toLowerCase().replaceAll('-', '');
}

export interface AccountsState {
  accounts: Array<LinkedAccount>;
}

const initialState: AccountsState = {
  accounts: JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '[]'),
};

export const accountsSlice = createSlice({
  name: ACCOUNTS_STATE_SLICE,
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
  },
});

export const { putAccount, removeAccount } = accountsSlice.actions;
