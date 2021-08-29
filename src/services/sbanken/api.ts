import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { sbankenApiBaseUrl } from '../../config';

const api = createApi({
  reducerPath: 'sbankenApi',
  baseQuery: fetchBaseQuery({
    baseUrl: sbankenApiBaseUrl,
  }),
  endpoints: (build) => ({
    getTransactions: build.query<any, { accountId: string; token: string; fromDate: string }>({
      queryFn: async ({ accountId, token, fromDate }, api, extraOptions, baseQuery) => {
        const url = `/Transactions/${accountId}?startDate=${fromDate}`;
        return baseQuery({ url, headers: { Authorization: `Bearer ${token}` } });
      },
    }),
  }),
});

export const { useGetTransactionsQuery } = api;

export default api;
