import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '..';
import { ynabApiBaseUrl } from '../../config';
import { crc32 } from '../../utils';
import type { Transaction } from '../transactions';
import type { YnabTransaction } from '../ynab';

export interface YnabTransactionsResponse {
  server_knowledge: number;
  transactions: Array<YnabTransaction>;
}

export interface YnabTransactionResponse {
  server_knowledge: number;
  transaction: YnabTransaction;
}

function transformTransaction(transaction: YnabTransaction): YnabTransaction {
  const transformedItem = {
    ...transaction,
    amount: transaction.amount / 1000,
  };

  transformedItem._checksum = crc32(JSON.stringify(transformedItem));

  return transformedItem;
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
          transactions: response.data.transactions.map(transformTransaction),
        };

        return transformedData;
      },
    }),
    createTransaction: build.mutation<
      YnabTransactionResponse,
      { budgetId: string; accountId: string; fromDate: string } & Transaction
    >({
      query: ({ budgetId, accountId, ...rest }) => {
        const ynabTransaction: Partial<YnabTransaction> = {
          date: rest.date.toISO(),
          amount: rest.amount * 1000,
          memo: rest.description,
          account_id: accountId,
          import_id: rest.sbankenTransactionId || rest.checksum.toString(),
        };

        return {
          url: `/budgets/${budgetId}/transactions`,
          method: 'POST',
          body: {
            transaction: ynabTransaction,
          },
        };
      },

      transformResponse: (response: any) => {
        const transformedData = {
          ...response.data,
          transaction: transformTransaction(response.data.transaction as YnabTransaction),
        };

        return transformedData;
      },

      onQueryStarted: async ({ budgetId, accountId, fromDate }, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(
          api.util.updateQueryData(
            'getTransactions',
            { budgetId, accountId, fromDate },
            (draft) => {
              draft.server_knowledge = data.server_knowledge;
              draft.transactions.push(data.transaction);
            }
          )
        );
      },
    }),
  }),
});

export const { useGetTransactionsQuery, useCreateTransactionMutation } = api;

export default api;
