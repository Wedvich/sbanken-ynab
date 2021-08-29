import { createAsyncThunk } from '@reduxjs/toolkit';
import type { DateTime } from 'luxon';
import type { RootState } from '..';
import { sbankenApiBaseUrl } from '../../config';
import { getEnrichedAccounts } from '../../selectors/accounts';
import { SbankenListObject, sbankenSlice, validateSbankenToken } from '../sbanken';
import type { SbankenTransaction } from './types';

interface FetchTransactionsForAccountParams {
  accountId: string;
  fromDate: DateTime;
}

export const fetchTransactionsForAccount = createAsyncThunk(
  `${sbankenSlice.name}/fetchTransactionsForAccount`,
  async ({ accountId, fromDate }: FetchTransactionsForAccountParams, thunkAPI) => {
    const rootState = thunkAPI.getState() as RootState;
    const linkedAccounts = getEnrichedAccounts(rootState);
    const account = linkedAccounts.find((account) => account.compositeId === accountId);
    if (!account) {
      return Promise.reject(`unable to find account with ID ${accountId}`);
    }
    const { credentials, credentialIdByAccountId } = rootState.sbanken;
    const credential = credentials.find(
      (c) => c.clientId === credentialIdByAccountId[account.sbankenAccountId]
    );
    if (!credential) {
      return Promise.reject(
        `unable to find credential with id ${credentialIdByAccountId[account.sbankenAccountId]}`
      );
    }
    if (!validateSbankenToken(credential.token)) {
      return Promise.reject(`invalid token for client ID ${credential.clientId}`);
    }

    const response = await fetch(
      `${sbankenApiBaseUrl}/Transactions/${
        account.sbankenAccountId
      }?startDate=${fromDate.toISODate()}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${credential.token.value}`,
        },
      }
    );

    if (!response.ok) {
      return Promise.reject(response.statusText); // TODO: Handle errors
    }

    const transactions = (await response.json()) as SbankenListObject<SbankenTransaction>;
    console.log(transactions);

    return transactions;
  }
);
