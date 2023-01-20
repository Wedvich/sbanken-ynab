import { createSelector, EntityState } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { ynabGlobalAccountsSelectors } from './ynab';
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

export const getFetchStatusForYnabAccount = createSelector(
  (state: RootState, accountId?: string) =>
    ynabGlobalAccountsSelectors.selectById(state, accountId ?? ''),
  (state: RootState) => state.ynab.tokensByBudgetId,
  (state: RootState) => state.ynab.requestStatusByToken,
  (account, tokensByBudgetId, requestStatusByToken) => {
    if (!account) return undefined;

    const token = tokensByBudgetId[account.budget_id][0];
    return requestStatusByToken[token];
  }
);
