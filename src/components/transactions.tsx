import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { useSelector } from 'react-redux';
import Button from '../components/button';
import { useAppSelector } from '../services';
import type { EnrichedAccount } from '../services/accounts';
import { getYnabKnowledgeByBudgetId } from '../services/ynab';
import {
  useGetTransactionsQuery as useGetYnabTransactionsQuery,
  useCreateTransactionMutation,
} from '../services/ynab.api';
import { useGetTransactionsQuery as useGetSbankenTransactionsQuery } from '../services/sbanken.api';
import { getTransactionsGroupedByAccountId } from '../services/ynab.selectors';
import type { YnabGetTransactionsRequest } from '../services/ynab.types';
import { formatMoney } from '../utils';
import type { SbankenGetTransactionsRequest } from '../services/sbanken.types';
import { getAllSbankenTransactions } from '../services/sbanken.selectors';
import { Spinner } from '../components/spinner';
import { linkTransactions, TransactionSource } from '../services/transactions';

interface TransactionsProps {
  account: EnrichedAccount;
  fromDate: string;
}

export const Transactions = ({ account, fromDate }: TransactionsProps) => {
  const serverKnowledge = useAppSelector((state) =>
    getYnabKnowledgeByBudgetId(state, account.ynabBudgetId)
  );

  const ynabTransactionsRequest: YnabGetTransactionsRequest = useMemo(
    () => ({
      budgetId: account.ynabBudgetId ?? '',
      fromDate,
      serverKnowledge,
    }),
    [account.ynabBudgetId, fromDate, serverKnowledge]
  );

  const { data: ynabTransactionsData, isLoading: ynabIsLoading } = useGetYnabTransactionsQuery(
    ynabTransactionsRequest,
    {
      skip: !account.ynabLinkOk,
    }
  );

  const ynabTransactions = useSelector(() =>
    getTransactionsGroupedByAccountId(ynabTransactionsData?.transactions)
  );
  const transactionsForYnabAccount = ynabTransactions[account.ynabAccountId ?? ''];

  const sbankenTransactionsRequest: SbankenGetTransactionsRequest = useMemo(
    () => ({
      accountId: account.sbankenAccountId ?? '',
      fromDate,
    }),
    [account.sbankenAccountId, fromDate]
  );

  const { data: sbankenTransactionsData, isLoading: sbankenIsLoading } =
    useGetSbankenTransactionsQuery(sbankenTransactionsRequest, { skip: !account.sbankenLinkOk });

  const transactionsForSbankenAccount = getAllSbankenTransactions(
    sbankenTransactionsData?.transactions
  );

  const transactions = useMemo(() => {
    return linkTransactions(transactionsForSbankenAccount, transactionsForYnabAccount);
  }, [transactionsForSbankenAccount, transactionsForYnabAccount]);

  const [createTransaction, { isLoading: isCreatingTransaction }] = useCreateTransactionMutation();

  return (
    <Fragment>
      <h2 className="mt-8 text-2xl">
        Transaksjoner{' '}
        {(ynabIsLoading || sbankenIsLoading || isCreatingTransaction) && (
          <span>
            <Spinner />
            <span className="sr-only">Laster inn</span>
          </span>
        )}
      </h2>
      <p className="mt-2 text-sm text-gray-500">Viser kun bokførte transaksjoner fra Sbanken.</p>
      <div className="overflow-hidden shadow mt-4 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Dato
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Kilde
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900 w-full"
              >
                Beskrivelse
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-3.5 text-right text-sm font-semibold text-gray-900"
              >
                Beløp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions.map((transaction) => {
              return (
                <tr
                  key={`${transaction.sbankenTransactionId}:${transaction.ynabTranscationId}`}
                  className="hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 font-numbers">
                    {transaction.date.toISODate()}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                    {!!(transaction.source & TransactionSource.Sbanken) && 'Sbanken'}
                    {!!(transaction.source & TransactionSource.Sbanken) &&
                      !(transaction.source & TransactionSource.Ynab) && (
                        <Button
                          size="xs"
                          className="ml-1"
                          disabled={isCreatingTransaction}
                          onClick={() => {
                            void createTransaction({
                              accountId: account.ynabAccountId,
                              fromDate,
                              transaction,
                            });
                          }}
                        >
                          ⚯
                        </Button>
                      )}
                    {!!(transaction.source & TransactionSource.Sbanken) &&
                      !!(transaction.source & TransactionSource.Ynab) && (
                        <span className="text-gray-500"> ⚯ </span>
                      )}
                    {!!(transaction.source & TransactionSource.Ynab) && 'YNAB'}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 text-right font-numbers">
                    {formatMoney(transaction.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};
