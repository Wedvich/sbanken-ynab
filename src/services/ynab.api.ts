import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { ynabApiBaseUrl } from '../config';
import type {
  YnabErrorResponse,
  YnabGetTransactionsEntities,
  YnabGetTransactionsRequest,
  YnabGetTransactionsResponse,
  YnabSuccessResponse,
  YnabTransaction,
} from './ynab.types';
import type { RootState } from '.';
import { clearServerKnowledge, setServerKnowledge } from './ynab';
import { createEntityAdapter } from '@reduxjs/toolkit';

export const transactionsAdapter = createEntityAdapter<YnabTransaction>({
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
        return (result as YnabSuccessResponse).data;
      } else {
        return (result as YnabErrorResponse).error;
      }
    },
  }),
  endpoints: () => ({}),
});

// getTransactions: build.query<YnabGetTransactionsResponse, YnabGetTransactionsRequest>({
//   queryFn({ budgetId, fromDate, serverKnowledge }, { getState, signal }, _, baseQuery) {
//     const token = (getState() as any).ynab.tokensByBudgetId[budgetId][0]; // TODO: types?
//     const url = `/budgets/${budgetId}/transactions?since_date=${fromDate}${
//       typeof serverKnowledge === 'number' ? `&last_knowledge_of_server=${serverKnowledge}` : ''
//     }`;
//     const headers = new Headers({
//       Authorization: `Bearer ${token}`,
//     });
//     const result = baseQuery({
//       headers,
//       signal,
//       url,
//     }) as QueryReturnValue<
//       YnabGetTransactionsResponse,
//       FetchBaseQueryError,
//       FetchBaseQueryMeta
//     >;
//     return result;
//   },
// }),

export const { useGetTransactionsQuery } = ynabApi.injectEndpoints({
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
          throw new Error('No token found for budgetId ' + budgetId);
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
            transactions: transactionsAdapter.setAll(
              transactionsAdapter.getInitialState(),
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
        currentCacheData.transactions = transactionsAdapter.upsertMany(
          currentCacheData.transactions,
          transactionsAdapter.getSelectors().selectAll(responseData.transactions)
        );
      },
    }),
  }),
});
