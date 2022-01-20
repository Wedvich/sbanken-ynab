import { skipToken } from '@reduxjs/toolkit/query/react';
import { DateTime } from 'luxon';
import { h } from 'preact';
import { useSelector } from 'react-redux';
import { getEnrichedAccounts } from '../selectors/accounts';
import type { RootState } from '../services';
import { useGetTransactionsQuery as useGetYnabTransactionsQuery } from '../services/ynab/api';
import { useGetTransactionsQuery as useGetSbankenTransactionsQuery } from '../services/sbanken/api';
import { useSbankenTokenForAccountId } from '../services/sbanken/hooks';
import { formatMoney } from '../utils';
import { useMemo } from 'preact/hooks';
import { linkTransactions, isYnabTransaction, isLinkedTransaction } from '../services/transactions';

interface TransactionsProps {
  accountId: string;
}

export default function Transactions({ accountId }: TransactionsProps) {
  const budgetId = useSelector((state: RootState) => state.ynab.budget);
  const account = useSelector(getEnrichedAccounts).find((a) => a.compositeId === accountId);

  const fromDate = DateTime.now().minus({ days: 7 });
  const ynabResult = useGetYnabTransactionsQuery(
    account
      ? { fromDate: fromDate.toISODate(), budgetId, accountId: account.ynabAccountId }
      : skipToken
  );
  const token = useSbankenTokenForAccountId(account?.sbankenAccountId);
  const sbankenResult = useGetSbankenTransactionsQuery(
    account && token
      ? { fromDate: fromDate.toISODate(), accountId: account.sbankenAccountId, token }
      : skipToken
  );

  const linkedTransactions = useMemo(
    () => linkTransactions(sbankenResult.data?.items ?? [], ynabResult.data?.transactions ?? []),
    [sbankenResult.data?.items, ynabResult.data?.transactions]
  );

  return (
    <div>
      <h2 class="text-xl font-semibold text-gray-900 flex items-center mb-2">Transaksjoner</h2>
      <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dato
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kilde
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tekst
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right"
              >
                Beløp
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {linkedTransactions.map((item, index) => {
              if (isLinkedTransaction(item)) {
                return null;
              }

              if (isYnabTransaction(item)) {
                return (
                  <tr key={item.id}>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">YNAB</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.memo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-numbers tabular-nums">
                      {formatMoney(+item.amount)}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={`${index}-${Date.now() * Math.random()}`}>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {DateTime.fromISO(item.accountingDate).toISODate()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sbanken</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.text}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-numbers tabular-nums">
                    {formatMoney(+item.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
