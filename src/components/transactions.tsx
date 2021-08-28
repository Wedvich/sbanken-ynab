import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../services';
import { fetchTransactionsForAccount } from '../services/sbanken/thunks';

interface TransactionsProps {
  accountId: string;
}

export default function Transactions({ accountId }: TransactionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    void dispatch(fetchTransactionsForAccount({ accountId }));
  }, [accountId, dispatch]);

  return <div>(tabell med transaksjoner her)</div>;
}
