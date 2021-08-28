import { DateTime } from 'luxon';
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../services';
import { fetchTransactionsForAccount } from '../services/sbanken/thunks';
import { fetchTransactionsForYnabAccount } from '../services/ynab/thunks';

interface TransactionsProps {
  accountId: string;
}

export default function Transactions({ accountId }: TransactionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const budgetId = useSelector((state: RootState) => state.ynab.budget);
  useEffect(() => {
    const fromDate = DateTime.now().minus({ days: 7 });
    void dispatch(fetchTransactionsForAccount({ accountId, fromDate }));
    void dispatch(fetchTransactionsForYnabAccount({ accountId, budgetId, fromDate }));
  }, [accountId, budgetId, dispatch]);

  return <div>(tabell med transaksjoner her)</div>;
}
