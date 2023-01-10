import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { ynabApiBaseUrl } from '../config';
import type { YnabGetTransactionsRequest, YnabGetTransactionsResponse } from './ynab.types';

export const ynabApi = createApi({
  reducerPath: 'ynabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ynabApiBaseUrl,
  }),
  endpoints: (build) => ({
    getTransactions: build.query<YnabGetTransactionsResponse, YnabGetTransactionsRequest>({
      queryFn({ budgetId, fromDate, serverKnowledge }, { getState, signal }, _, baseQuery) {
        const token = (getState() as any).ynab.tokensByBudgetId[budgetId][0]; // TODO: types?
        const url = `/budgets/${budgetId}/transactions?since_date=${fromDate}${
          typeof serverKnowledge === 'number' ? `&last_knowledge_of_server=${serverKnowledge}` : ''
        }`;
        const headers = new Headers({
          Authorization: `Bearer ${token}`,
        });
        const result = baseQuery({
          headers,
          signal,
          url,
        }) as QueryReturnValue<
          YnabGetTransactionsResponse,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >;

        return result;
      },
    }),
  }),
});
