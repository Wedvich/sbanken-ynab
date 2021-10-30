import { createAsyncThunk } from '@reduxjs/toolkit';
import type { DateTime } from 'luxon';
import type { RootState } from '..';
import { ynabApiBaseUrl } from '../../config';
import { getEnrichedAccounts } from '../../selectors/accounts';
import { ynabSlice, YnabTransaction } from '../ynab';

interface FetchTransactionsForYnabAccountParams {
  accountId: string;
  budgetId: string;
  fromDate: DateTime;
}

export const fetchTransactionsForYnabAccount = createAsyncThunk(
  `${ynabSlice.name}/fetchTransactionsForYnabAccount`,
  async ({ accountId, budgetId, fromDate }: FetchTransactionsForYnabAccountParams, thunkAPI) => {
    const rootState = thunkAPI.getState() as RootState;
    const linkedAccounts = getEnrichedAccounts(rootState);
    const account = linkedAccounts.find((account) => account.compositeId === accountId);
    if (!account) {
      return Promise.reject(`unable to find account with ID ${accountId}`);
    }
    const token = rootState.ynab.tokens[0]; // TODO: Error handling

    const response = await fetch(
      `${ynabApiBaseUrl}/budgets/${budgetId}/accounts/${
        account.ynabAccountId
      }/transactions?since_date=${fromDate.toISODate()}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return Promise.reject(response.statusText); // TODO: Handle errors
    }

    const { data } = (await response.json()) as { data: { transactions: Array<YnabTransaction> } };
    console.log(data.transactions);

    return data.transactions;
  }
);
