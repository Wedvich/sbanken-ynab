import { createSelector, EntityState } from '@reduxjs/toolkit';
import { ynabTransactionsAdapter } from './ynab.api';
import type { YnabTransaction } from './ynab.types';

export const selectTransactions = (state?: EntityState<YnabTransaction>) =>
  state
    ? ynabTransactionsAdapter
        .getSelectors()
        .selectAll(state)
        .filter((transaction) => !transaction.deleted)
    : [];

export const getTransactionsGroupedByAccountId = createSelector(
  selectTransactions,
  (transactions) => {
    return transactions.reduce((result, transaction) => {
      const { account_id: accountId } = transaction;
      if (!accountId) return result;

      if (!result[accountId]) {
        result[accountId] = [];
      }
      result[accountId]!.push(transaction);
      return result;
    }, {} as Record<string, Array<YnabTransaction> | undefined>);
  }
);
