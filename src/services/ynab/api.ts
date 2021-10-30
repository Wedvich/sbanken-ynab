import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '..';
import { ynabApiBaseUrl } from '../../config';
import type { YnabTransaction } from '../ynab';

export interface YnabTransactionsResponse {
  server_knowledge: number;
  transactions: Array<YnabTransaction>;
}

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
    getTransactions: build.query<
      YnabTransactionsResponse,
      { budgetId: string; accountId: string; fromDate: string }
    >({
      query: ({ budgetId, accountId, fromDate }) =>
        `/budgets/${budgetId}/accounts/${accountId}/transactions?since_date=${fromDate}`,
      transformResponse: (response: any) => {
        const transformedData: YnabTransactionsResponse = {
          ...response.data,
          transactions: response.data.transactions.map((transaction: YnabTransaction) => {
            return {
              ...transaction,
              amount: transaction.amount / 1000,
            };
          }),
        };

        return transformedData;
      },
    }),
  }),
});

export const { useGetTransactionsQuery } = api;

export default api;
