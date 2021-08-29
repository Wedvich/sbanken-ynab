import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '..';
import { ynabApiBaseUrl } from '../../config';

const api = createApi({
  reducerPath: 'ynabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ynabApiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Authorization', `Bearer ${(getState() as RootState).ynab.tokens[0]}`);
      return headers;
    },
  }),
  endpoints: (build) => ({
    getTransactions: build.query<any, { budgetId: string; accountId: string; fromDate: string }>({
      query: ({ budgetId, accountId, fromDate }) =>
        `/budgets/${budgetId}/accounts/${accountId}/transactions?since_date=${fromDate}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const { useGetTransactionsQuery } = api;

export default api;
