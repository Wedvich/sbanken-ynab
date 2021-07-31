import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import keyBy from 'lodash-es/keyBy';
import type { RootState } from '.';
import { ynabApiBaseUrl } from '../config';

const YNAB_SLICE_NAME = 'ynab';

const YNAB_BUDGET_KEY = 'ynab:budget';
const YNAB_TOKENS_KEY = 'ynab:tokens';

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

export interface YnabState {
  accounts: Array<YnabAccount>;
  budget: string | null;
  tokens: Array<string>;
}

function getStoredTokens() {
  const storedTokens = JSON.parse<Array<string>>(localStorage.getItem(YNAB_TOKENS_KEY) || '[]');

  return storedTokens;
}

const initialState: YnabState = {
  accounts: [],
  budget: localStorage.getItem(YNAB_BUDGET_KEY) || null,
  tokens: getStoredTokens(),
};

export const fetchAllAccounts = createAsyncThunk(
  `${YNAB_SLICE_NAME}/fetchAllAccounts`,
  async (_, thunkAPI) => {
    const { tokens, budget } = (thunkAPI.getState() as RootState).ynab;
    const [token] = tokens;

    if (!token || !budget) {
      return Promise.reject('invalid YNAB access token or budget');
    }

    const response = await fetch(`${ynabApiBaseUrl}/budgets/${budget}/accounts`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return Promise.reject(response.statusText); // TODO: Handle errors
    }

    const { data } = (await response.json()) as { data: { accounts: Array<YnabAccount> } };
    return data.accounts.filter(
      (account) => !account.deleted && !account.closed && account.on_budget
    );
  }
);

export const ynabSlice = createSlice({
  name: YNAB_SLICE_NAME,
  initialState,
  reducers: {
    putToken: (state, action: PayloadAction<string>) => {
      const tokens = new Set(state.tokens);
      tokens.add(action.payload);
      state.tokens = Array.from(tokens);
      localStorage.setItem(YNAB_TOKENS_KEY, JSON.stringify(state.tokens));
    },
    setBudget: (state, action: PayloadAction<string>) => {
      state.budget = action.payload;
      localStorage.setItem(YNAB_BUDGET_KEY, state.budget);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllAccounts.fulfilled, (state, action) => {
      state.accounts = Object.values({
        ...keyBy(state.accounts, 'id'),
        ...keyBy(action.payload, 'id'),
      });
    });
  },
});

export const { putToken, setBudget } = ynabSlice.actions;
