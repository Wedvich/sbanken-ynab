import { skipToken } from '@reduxjs/toolkit/query/react';
import { DateTime } from 'luxon';
import { h } from 'preact';
import { useDispatch, useSelector } from 'react-redux';
import { RadioGroup } from '@headlessui/react';
import { getEnrichedAccounts, getTransactionsRange } from '../selectors/accounts';
import type { AppDispatch, RootState } from '../services';
import { useGetTransactionsQuery as useGetYnabTransactionsQuery } from '../services/ynab/api';
import { useGetTransactionsQuery as useGetSbankenTransactionsQuery } from '../services/sbanken/api';
import { useSbankenTokenForAccountId } from '../services/sbanken/hooks';
import { formatMoney, usePrevious } from '../utils';
import { StateUpdater, useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { linkTransactions, type Transaction, TransactionSource } from '../services/transactions';
import classNames from 'classnames';
import { setRange } from '../services/accounts';

interface TransactionsProps {
  accountId: string;
}

const options = [7, 30];

function useYnabDaysOutsideRange(
  sbankenRequestId: string,
  sbankenSuccess: boolean,
  currentValue: number,
  setValue: StateUpdater<number>,
  fromDate: DateTime,
  linkedTransactions: Array<Transaction>,
  ynabSuccess: boolean
) {
  const { current: map } = useRef(new Map<string, number>());
  const prevSbankenRequestId = usePrevious(sbankenRequestId);
  const watchForChanges = useRef(false);

  if (map.has(sbankenRequestId) && sbankenSuccess) {
    const valueForRequest = map.get(sbankenRequestId);
    if (currentValue !== valueForRequest) {
      setValue(valueForRequest);
    }
    return;
  }

  if (sbankenRequestId !== prevSbankenRequestId) {
    watchForChanges.current = true;
    return;
  }

  if (sbankenSuccess && ynabSuccess && watchForChanges.current) {
    watchForChanges.current = false;

    let daysOutsideRange = 0;
    for (const transaction of linkedTransactions) {
      if (transaction.source === TransactionSource.Sbanken && +transaction.date < +fromDate) {
        daysOutsideRange = Math.max(
          daysOutsideRange,
          Math.ceil(fromDate.diff(transaction.date).as('days'))
        );
      }
    }

    map.set(sbankenRequestId, daysOutsideRange);
    setValue(daysOutsideRange);
  }
}

export default function Transactions({ accountId }: TransactionsProps) {
  const budgetId = useSelector((state: RootState) => state.ynab.budget);
  const account = useSelector(getEnrichedAccounts).find((a) => a.compositeId === accountId);
  const range = useSelector(getTransactionsRange);
  const [ynabDaysOutsideRange, setYnabDaysOutsideRange] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const handleSetRange = useCallback(
    (value: number) => {
      dispatch(setRange(value));
    },
    [dispatch]
  );

  const fromDate = DateTime.now().minus({ days: range });

  const ynabResult = useGetYnabTransactionsQuery(
    account
      ? {
          fromDate: fromDate.minus({ days: ynabDaysOutsideRange }).toISODate(),
          budgetId,
          accountId: account.ynabAccountId,
        }
      : skipToken
  );

  const token = useSbankenTokenForAccountId(account?.sbankenAccountId);
  const sbankenResult = useGetSbankenTransactionsQuery(
    account && token
      ? { fromDate: fromDate.toISODate(), accountId: account.sbankenAccountId, token }
      : skipToken
  );

  const linkedTransactions = useMemo(() => {
    return linkTransactions(sbankenResult.data?.items ?? [], ynabResult.data?.transactions ?? []);
  }, [sbankenResult.data?.items, ynabResult.data?.transactions]);

  useYnabDaysOutsideRange(
    sbankenResult.requestId,
    sbankenResult.isSuccess,
    ynabDaysOutsideRange,
    setYnabDaysOutsideRange,
    fromDate,
    linkedTransactions,
    ynabResult.isSuccess
  );

  return (
    <div>
      <h2 class="text-xl font-semibold text-gray-900 flex items-center mb-2">
        Transaksjoner
        <RadioGroup
          className="ml-auto inline-flex shadow-sm rounded-md divide-x-reverse"
          value={range}
          onChange={handleSetRange}
        >
          {options.map((option) => (
            <RadioGroup.Option
              key={option}
              value={option}
              className={({ active, checked }) =>
                classNames(
                  'cursor-pointer focus:outline-none inline-flex items-center px-2 py-1 text-sm font-medium border border-gray-300 first:rounded-l-md last:rounded-r-md select-none',
                  active ? 'ring-2 ring-offset-2 ring-pink-500 z-10' : '',
                  checked
                    ? 'bg-pink-50 border-pink-500 text-pink-600'
                    : ' bg-white text-gray-500 hover:bg-gray-50'
                )
              }
            >
              <RadioGroup.Label as="p">{option}d</RadioGroup.Label>
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </h2>
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
            {linkedTransactions.map((transaction) => {
              return (
                <tr key={transaction.checksum}>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-numbers tabular-nums">
                    {transaction.date.toISODate()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {!!(transaction.source & TransactionSource.Sbanken) && 'Sbanken'}
                    {!!(transaction.source & TransactionSource.Sbanken) &&
                      !!(transaction.source & TransactionSource.Ynab) && (
                        <span class="text-gray-500"> ⚯ </span>
                      )}
                    {!!(transaction.source & TransactionSource.Ynab) && 'YNAB'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-numbers tabular-nums">
                    {formatMoney(+transaction.amount)}
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
