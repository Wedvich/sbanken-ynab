import type { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import type { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { DateTime } from 'luxon';
import { sbankenApiBaseUrl } from '../../config';
import { crc32 } from '../../utils';
import type { SbankenTransaction } from './types';
import { inferDate } from './utils';

export interface SbankenTransactionsResponse {
  availableItems: number;
  items: Array<SbankenTransaction>;
}

const api = createApi({
  reducerPath: 'sbankenApi',
  baseQuery: fetchBaseQuery({
    baseUrl: sbankenApiBaseUrl,
  }),
  endpoints: (build) => ({
    getTransactions: build.query<
      SbankenTransactionsResponse,
      { accountId: string; token: string; fromDate: string }
    >({
      queryFn: async ({ accountId, token, fromDate }, api, extraOptions, baseQuery) => {
        const url = `/Transactions/${accountId}?startDate=${fromDate}`;
        const response = await (baseQuery({
          url,
          headers: { Authorization: `Bearer ${token}` },
        }) as MaybePromise<
          QueryReturnValue<SbankenTransactionsResponse, FetchBaseQueryError, FetchBaseQueryMeta>
        >);

        if (response.error) {
          return { error: response.error };
        }

        const transformedData: SbankenTransactionsResponse = {
          ...response.data,
          items: response.data.items.map((item) => {
            const transformedItem = { ...item };
            if (item.accountingDate) {
              transformedItem.accountingDate = DateTime.fromISO(item.accountingDate).toISODate();
            }
            if (item.interestDate) {
              transformedItem.interestDate = DateTime.fromISO(item.interestDate).toISODate();
            }

            transformedItem._checksum = crc32(JSON.stringify(transformedItem));

            const inferredDate = inferDate(transformedItem);
            if (inferredDate !== transformedItem.accountingDate) {
              transformedItem._inferredDate = inferredDate;
            }

            return transformedItem;
          }),
        };

        return { data: transformedData };
      },
    }),
  }),
});

export const { useGetTransactionsQuery } = api;

export default api;
