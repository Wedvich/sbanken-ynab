import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { ynabApiBaseUrl } from '../config';
import type { YnabGetTransactionsRequest, YnabGetTransactionsResponse } from './ynab.types';
import type { RootState } from '.';

export const ynabApi = createApi({
  reducerPath: 'ynabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ynabApiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
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
    getTransactions: build.query<YnabGetTransactionsResponse, YnabGetTransactionsRequest>({
      queryFn: (
        { budgetId, fromDate, serverKnowledge = 0 },
        { getState },
        extraOptions,
        baseQuery
      ) => {
        const state = getState() as RootState;
        const url = `/budgets/${budgetId}/transactions?since_date=${fromDate}${
          serverKnowledge ? `&last_knowledge_of_server=${serverKnowledge}` : ''
        }`;

        const token = state.ynab.tokensByBudgetId[budgetId]?.[0]; // TODO: types?
        if (!token) {
          throw new Error('No token found for budgetId ' + budgetId);
        }

        const headers = new Headers({
          Authorization: `Bearer ${token}`,
        });

        return baseQuery({
          headers,
          url,
        }) as QueryReturnValue<
          YnabGetTransactionsResponse,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) => `${endpointName}/${queryArgs.budgetId}`,
    }),
  }),
});
