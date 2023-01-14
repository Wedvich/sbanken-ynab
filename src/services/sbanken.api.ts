import { createEntityAdapter } from '@reduxjs/toolkit';
import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query/react';
import { DateTime } from 'luxon';
import type { RootState } from '.';
import { sbankenApiBaseUrl } from '../config';
import { sbankenAccountsAdapter, sbankenCredentialsAdapter, validateSbankenToken } from './sbanken';
import type {
  SbankenGetTransactionsEntities,
  SbankenGetTransactionsRequest,
  SbankenSuccessResponse,
  SbankenTransaction,
  SbankenTransactionWithAccountId,
} from './sbanken.types';

export const sbankenTransactionsAdapter = createEntityAdapter<SbankenTransactionWithAccountId>({
  selectId: (transaction) => transaction.transactionId,
  sortComparer: (a, b) => b.accountingDate.localeCompare(a.accountingDate) || a.amount - b.amount,
});

export const sbankenApi = createApi({
  reducerPath: 'sbankenApi',
  baseQuery: fetchBaseQuery({
    baseUrl: sbankenApiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
    },
    responseHandler: async (response) => {
      const text = await response.text();
      const result = text.length ? JSON.parse(text) : null;

      if (response.ok) {
        return result?.data;
      } else {
        return result.error;
      }
    },
  }),
  endpoints: () => ({}),
});

export const { useGetTransactionsQuery } = sbankenApi.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<SbankenGetTransactionsEntities, SbankenGetTransactionsRequest>({
      queryFn: async ({ accountId, fromDate }, { getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const account = sbankenAccountsAdapter
          .getSelectors()
          .selectById(state.sbanken.accounts, accountId);
        if (!account) {
          throw new Error('No account with ID ' + accountId);
        }

        const credential = sbankenCredentialsAdapter
          .getSelectors()
          .selectById(state.sbanken.credentials, account.clientId);
        if (!credential) {
          throw new Error('No credential found with ID ' + account.clientId);
        }

        if (!validateSbankenToken(credential.token)) {
          throw new Error('Invalid token for credential with ID ' + credential.clientId);
        }

        const url = `${sbankenApiBaseUrl}/Transactions/archive/${accountId}?startDate=${fromDate}`;
        const headers = new Headers({
          Authorization: `Bearer ${credential.token.value}`,
        });

        const result = (await baseQuery({
          headers,
          url,
        })) as QueryReturnValue<
          SbankenSuccessResponse<SbankenTransaction>,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;

        if (result.error) {
          return result;
        }

        const { data, meta } = result;

        return {
          meta,
          data: {
            transactions: sbankenTransactionsAdapter.setAll(
              sbankenTransactionsAdapter.getInitialState(),
              data.items.map<SbankenTransactionWithAccountId>((transaction) => ({
                ...transaction,
                accountingDate: transaction.accountingDate
                  ? DateTime.fromISO(transaction.accountingDate).toISODate()
                  : transaction.accountingDate,
                interestDate: transaction.interestDate
                  ? DateTime.fromISO(transaction.interestDate).toISODate()
                  : transaction.interestDate,
                accountId,
              }))
            ),
          },
        };
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) => `${endpointName}/${queryArgs.accountId}`,
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.accountId !== previousArg?.accountId;
      },
      merge: (currentCacheData, responseData) => {
        currentCacheData.transactions = sbankenTransactionsAdapter.upsertMany(
          currentCacheData.transactions,
          sbankenTransactionsAdapter.getSelectors().selectAll(responseData.transactions)
        );
      },
    }),
  }),
});
