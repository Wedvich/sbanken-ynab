import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const YNAB_TOKENS_KEY = 'ynab:tokens';

export interface YnabState {
  tokens: Array<string>;
}

function getStoredTokens() {
  const storedTokens = JSON.parse<Array<string>>(localStorage.getItem(YNAB_TOKENS_KEY) ?? '[]');

  return storedTokens;
}

const initialState: YnabState = {
  tokens: getStoredTokens(),
};

export const ynabSlice = createSlice({
  name: 'ynab',
  initialState,
  reducers: {
    putToken: (state, action: PayloadAction<string>) => {
      const tokens = new Set(state.tokens);
      tokens.add(action.payload);
      state.tokens = Array.from(tokens);
      localStorage.setItem(YNAB_TOKENS_KEY, JSON.stringify(state.tokens));
    },
  },
});

export const { putToken } = ynabSlice.actions;
