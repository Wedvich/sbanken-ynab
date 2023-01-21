import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { ynabApiBaseUrl } from '../config';
import {
  YnabClearedState,
  YnabCreateTransactionRequest,
  YnabCreateTransactionResponse,
  YnabCreateTransactionsEntity,
  YnabErrorResponse,
  YnabGetTransactionsEntities,
  YnabGetTransactionsRequest,
  YnabGetTransactionsResponse,
  YnabSuccessResponse,
  YnabTransaction,
} from './ynab.types';
import type { RootState } from '.';
import { adjustAccountBalance, clearServerKnowledge, setServerKnowledge } from './ynab';
import { createEntityAdapter } from '@reduxjs/toolkit';
import type { Transaction } from './transactions';

export const ynabTransactionsAdapter = createEntityAdapter<YnabTransaction>({
  sortComparer: (a, b) => b.date.localeCompare(a.date) || a.amount - b.amount,
});

export const ynabApi = createApi({
  reducerPath: 'ynabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ynabApiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
    },
    responseHandler: async (response) => {
      const text = await response.text();
      const result = text.length ? JSON.parse(text) : null;

      if (response.ok) {
        return (result as YnabSuccessResponse | null)?.data;
      } else {
        return (result as YnabErrorResponse).error;
      }
    },
  }),
  endpoints: () => ({}),
});

const convertToYnabTransaction = (
  transaction: Transaction,
  accountId: string
): Partial<YnabTransaction> => ({
  account_id: accountId,
  amount: transaction.amount * 1000,
  date: transaction.date.toISO(),
  import_id: transaction.sbankenTransactionId,
  memo: transaction.description,
  cleared: transaction.isReserved ? YnabClearedState.Uncleared : YnabClearedState.Cleared,
  approved: true,
});

const getTransactionsApi = ynabApi.injectEndpoints({
  endpoints: (build) => ({
    getTransactions: build.query<YnabGetTransactionsEntities, YnabGetTransactionsRequest>({
      queryFn: async ({ budgetId, fromDate }, { endpoint, getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const lastEndpointKnowledge =
          state.ynab.serverKnowledgeByBudgetId[budgetId]?.byEndpoint[endpoint] ?? 0;

        const url = `/budgets/${budgetId}/transactions?since_date=${fromDate}${
          lastEndpointKnowledge ? `&last_knowledge_of_server=${lastEndpointKnowledge}` : ''
        }`;

        const token = state.ynab.tokensByBudgetId[budgetId]?.[0]; // TODO: types?
        if (!token) {
          throw new Error(`No token found for budgetId ${budgetId}`);
        }

        const headers = new Headers({
          Authorization: `Bearer ${token}`,
        });

        const result = (await baseQuery({
          headers,
          url,
        })) as QueryReturnValue<
          YnabSuccessResponse<YnabGetTransactionsResponse>,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;

        if (result.error) {
          return result;
        }

        const { data, meta } = result;
        const { transactions, server_knowledge } = data.data;

        return {
          meta,
          data: {
            serverKnowledge: server_knowledge,
            transactions: ynabTransactionsAdapter.setAll(
              ynabTransactionsAdapter.getInitialState(),
              transactions
            ),
          },
        };
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) => `${endpointName}/${queryArgs.budgetId}`,
      forceRefetch: ({ currentArg, state, endpointState }) => {
        const endpointName = endpointState?.endpointName;
        if (!endpointName) return true;

        const knowledge = currentArg?.serverKnowledge ?? 0;
        const lastEndpointKnowledge =
          (state as unknown as RootState).ynab.serverKnowledgeByBudgetId[currentArg!.budgetId]
            ?.byEndpoint[endpointName] ?? 0;

        return knowledge > lastEndpointKnowledge;
      },
      onQueryStarted: async (args, { dispatch, queryFulfilled, getCacheEntry }) => {
        try {
          const { data } = await queryFulfilled;
          const endpoint = getCacheEntry().endpointName!;
          dispatch(
            setServerKnowledge({
              budgetId: args.budgetId,
              knowledge: data.serverKnowledge,
              endpoint,
            })
          );
        } catch {} // Ignore query errors for this
      },
      onCacheEntryAdded: async ({ budgetId }, { cacheEntryRemoved, dispatch, getCacheEntry }) => {
        const endpoint = getCacheEntry().endpointName!;
        await cacheEntryRemoved;
        dispatch(clearServerKnowledge({ budgetId, endpoint }));
      },
      merge(currentCacheData, responseData) {
        currentCacheData.serverKnowledge = Math.max(
          currentCacheData.serverKnowledge,
          responseData.serverKnowledge
        );
        currentCacheData.transactions = ynabTransactionsAdapter.setMany(
          currentCacheData.transactions,
          ynabTransactionsAdapter.getSelectors().selectAll(responseData.transactions)
        );
      },
    }),
  }),
});

export const { useGetTransactionsQuery } = getTransactionsApi;

export const { useCreateTransactionMutation } = ynabApi.injectEndpoints({
  endpoints: (build) => ({
    createTransaction: build.mutation<YnabCreateTransactionsEntity, YnabCreateTransactionRequest>({
      queryFn: async ({ accountId, transaction }, { getState }, extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const budgetId = state.ynab.accounts.entities[accountId]?.budget_id;
        if (!budgetId) {
          throw new Error(`No budgetId found for accountId ${accountId}`);
        }

        const url = `/budgets/${budgetId}/transactions`;

        const token = state.ynab.tokensByBudgetId[budgetId]?.[0]; // TODO: types?
        if (!token) {
          throw new Error(`No token found for budgetId ${budgetId}`);
        }

        const ynabTransaction = convertToYnabTransaction(transaction, accountId);

        const headers = new Headers({
          Authorization: `Bearer ${token}`,
        });

        const result = (await baseQuery({
          url,
          headers,
          method: 'POST',
          body: {
            transaction: ynabTransaction,
          },
        })) as QueryReturnValue<
          YnabSuccessResponse<YnabCreateTransactionResponse>,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;

        if (result.error) {
          return result;
        }

        const { data, meta } = result;
        const { transaction: transactionResult, server_knowledge } = data.data;

        return {
          meta,
          data: {
            serverKnowledge: server_knowledge,
            transaction: transactionResult,
          },
        };
      },
      onQueryStarted: async (
        { accountId, transaction, fromDate },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const budgetId = state.ynab.accounts.entities[accountId]?.budget_id;
        if (!budgetId) return;

        const ynabTransaction = convertToYnabTransaction(transaction, accountId);
        ynabTransaction.id = ynabTransaction.import_id;

        const patchTransaction = dispatch(
          getTransactionsApi.util.updateQueryData(
            'getTransactions',
            { budgetId, fromDate },
            (draft) => {
              ynabTransactionsAdapter.setOne(
                draft.transactions,
                ynabTransaction as YnabTransaction
              );
            }
          )
        );
        const patchAccount = dispatch(
          adjustAccountBalance({
            accountId,
            amount: transaction.amount,
            cleared: !transaction.isReserved,
          })
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            getTransactionsApi.util.updateQueryData(
              'getTransactions',
              { budgetId, fromDate },
              (draft) => {
                ynabTransactionsAdapter.removeOne(draft.transactions, ynabTransaction.id!);
                ynabTransactionsAdapter.setOne(draft.transactions, data.transaction);
              }
            )
          );

          dispatch(
            setServerKnowledge({
              budgetId,
              knowledge: data.serverKnowledge,
              endpoint: getTransactionsApi.endpoints.getTransactions.name,
            })
          );
        } catch {
          patchTransaction.undo();
          patchAccount.undo();
        }
      },
    }),
  }),
});
