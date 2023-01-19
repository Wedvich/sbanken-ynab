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
import {
  SbankenGetTransactionsEntities,
  SbankenGetTransactionsRequest,
  SbankenGetTransactionsRequestMeta as SbankenGetTransactionsMeta,
  SbankenReservedTransaction,
  SbankenSuccessResponse,
  SbankenTransaction,
  SbankenTransactionSource,
  SbankenTransactionWithAccountId,
} from './sbanken.types';
import { createSyntheticId, inferDate } from './sbanken.utils';

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
          throw new Error(`No credential found with ID ${account.clientId}`);
        }

        if (!validateSbankenToken(credential.token)) {
          throw new Error(`Invalid token for credential with ID ${credential.clientId}`);
        }

        const headers: HeadersInit = {
          Authorization: `Bearer ${credential.token.value}`,
        };

        const archiveUrl = `${sbankenApiBaseUrl}/Transactions/archive/${accountId}?startDate=${fromDate}`;
        const archiveResult = (await baseQuery({
          headers: new Headers(headers),
          url: archiveUrl,
        })) as QueryReturnValue<
          SbankenSuccessResponse<SbankenTransaction>,
          FetchBaseQueryError,
          SbankenGetTransactionsMeta
        >;

        if (archiveResult.error) {
          return archiveResult;
        }

        const { data, meta } = archiveResult;

        let latestTransactionDate = DateTime.fromISO(fromDate);
        const transformedTransactions = data.items.map<SbankenTransactionWithAccountId>(
          (transaction) => {
            const accountingDate = DateTime.fromISO(transaction.accountingDate);
            if (accountingDate > latestTransactionDate) {
              latestTransactionDate = accountingDate;
            }
            const transformedTransaction: SbankenTransactionWithAccountId = {
              ...transaction,
              accountingDate: accountingDate.toISODate(),
              interestDate: DateTime.fromISO(transaction.interestDate).toISODate(),
              accountId,
            };

            const inferredDate = inferDate(transformedTransaction);
            if (inferredDate !== transformedTransaction.accountingDate) {
              transformedTransaction.inferredDate = inferredDate;
            }

            return transformedTransaction;
          }
        );

        const statementUrl = `${sbankenApiBaseUrl}/Transactions/${accountId}?startDate=${latestTransactionDate.toISODate()}`;
        const statementResult = (await baseQuery({
          headers: new Headers(headers),
          url: statementUrl,
        })) as QueryReturnValue<
          SbankenSuccessResponse<SbankenReservedTransaction>,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;

        if (statementResult.error) {
          if (meta) {
            meta.partialError = statementResult.error;
          }
        } else {
          for (const transaction of statementResult.data.items) {
            // Archived transactions have already been fetched above
            if (transaction.source === 'Archive') continue;

            const transformedTransaction: SbankenTransactionWithAccountId = {
              ...transaction,
              accountingDate: DateTime.fromISO(transaction.accountingDate).toISODate(),
              interestDate: DateTime.fromISO(transaction.interestDate).toISODate(),
              accountId,
              transactionId: createSyntheticId(transaction),
              source: SbankenTransactionSource.AccountStatement,
              isReserved: transaction.isReservation,
            };

            const inferredDate = inferDate(transformedTransaction);
            if (inferredDate !== transformedTransaction.accountingDate) {
              transformedTransaction.inferredDate = inferredDate;
            }

            transformedTransactions.push(transformedTransaction);
          }
        }

        const transactionsState = sbankenTransactionsAdapter.setAll(
          sbankenTransactionsAdapter.getInitialState(),
          transformedTransactions
        );

        return {
          meta,
          data: {
            transactions: transactionsState,
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
