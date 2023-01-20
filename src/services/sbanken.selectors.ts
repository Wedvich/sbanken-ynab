import { createSelector, EntityState } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { sbankenAccountsAdapter } from './sbanken';
import { sbankenTransactionsAdapter } from './sbanken.api';
import type { SbankenTransactionWithAccountId } from './sbanken.types';

const accountSelectors = sbankenAccountsAdapter.getSelectors(
  (state: RootState) => state.sbanken.accounts
);

export const getAllSbankenTransactions = (state?: EntityState<SbankenTransactionWithAccountId>) =>
  state ? sbankenTransactionsAdapter.getSelectors().selectAll(state) : [];

export const getFetchStatusForSbankenAccount = createSelector(
  (state: RootState, accountId?: string) => accountSelectors.selectById(state, accountId ?? ''),
  (state: RootState) => state.sbanken.requestStatusByCredentialId,
  (account, statuses) => {
    return account ? statuses[account.clientId] : undefined;
  }
);
