import { skipToken } from '@reduxjs/toolkit/query/react';
import { DateTime } from 'luxon';
import { h } from 'preact';
import { useSelector } from 'react-redux';
import { getEnrichedAccounts } from '../selectors/accounts';
import type { RootState } from '../services';
import { useGetTransactionsQuery as useGetYnabTransactionsQuery } from '../services/ynab/api';
import { useGetTransactionsQuery as useGetSbankenTransactionsQuery } from '../services/sbanken/api';
import { useSbankenTokenForAccountId } from '../services/sbanken/hooks';

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

  console.log(ynabResult.data);
  console.log(sbankenResult.data);

  return <div>(tabell med transaksjoner her)</div>;
}
