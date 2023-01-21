import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { useSelector } from 'react-redux';
import Button from '../components/button';
import { useAppDispatch, useAppSelector } from '../services';
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
import classNames from 'classnames';
import Icons from '../components/icons';
import { setShowReservedTransactions } from '../services/sbanken';

interface TransactionsProps {
  account: EnrichedAccount;
  fromDate: string;
}

export const Transactions = ({ account, fromDate }: TransactionsProps) => {
  const dispatch = useAppDispatch();

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

  const { data: ynabTransactionsData, isFetching: ynabIsLoading } = useGetYnabTransactionsQuery(
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

  const { data: sbankenTransactionsData, isFetching: sbankenIsLoading } =
    useGetSbankenTransactionsQuery(sbankenTransactionsRequest, { skip: !account.sbankenLinkOk });

  const showReservedTransactions = useAppSelector(
    (state) => state.sbanken.showReservedTransactions
  );

  const transactionsForSbankenAccount = getAllSbankenTransactions(
    sbankenTransactionsData?.transactions
  );

  const filteredTransactionsForSbankenAccount = useMemo(() => {
    if (showReservedTransactions) {
      return transactionsForSbankenAccount;
    }

    const filteredTransactions = transactionsForSbankenAccount.filter(
      (transaction) => !transaction.isReserved
    );
    if (filteredTransactions.length === transactionsForSbankenAccount.length) {
      return transactionsForSbankenAccount;
    }

    return filteredTransactions;
  }, [showReservedTransactions, transactionsForSbankenAccount]);

  const transactions = useMemo(() => {
    const linkedTransactions = linkTransactions(
      filteredTransactionsForSbankenAccount,
      transactionsForYnabAccount
    );
    return linkedTransactions;
  }, [filteredTransactionsForSbankenAccount, transactionsForYnabAccount]);

  const [createTransaction, { isLoading: isCreatingTransaction }] = useCreateTransactionMutation();

  return (
    <Fragment>
      <h2 className="mt-8 text-2xl">
        Transaksjoner
        {(ynabIsLoading || sbankenIsLoading || isCreatingTransaction) && (
          <span className="ml-1">
            <Spinner />
            <span className="sr-only">Laster inn transaksjoner</span>
          </span>
        )}
      </h2>
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <div className="flex space-x-1 rounded-lg bg-gray-200 p-0.5">
          <button
            className={classNames(
              'flex items-center rounded-md p-1.5 font-semibold lg:pr-3 group',
              {
                'bg-white shadow': !showReservedTransactions,
              }
            )}
            type="button"
            onClick={() => dispatch(setShowReservedTransactions(false))}
          >
            <Icons.CreditCardChecked
              className={classNames('h-6 w-6 lg:h-4 lg:w-4', {
                'text-pink-500': !showReservedTransactions,
                'group-hover:text-pink-500': showReservedTransactions,
              })}
            />
            <span
              className={classNames('sr-only lg:not-sr-only lg:ml-2', {
                'text-gray-900': !showReservedTransactions,
                'group-hover:text-pink-500': showReservedTransactions,
              })}
            >
              Kun bokførte
            </span>
          </button>
          <button
            className={classNames(
              'flex items-center rounded-md p-1.5 font-semibold lg:pr-3 group',
              {
                'bg-white shadow': showReservedTransactions,
              }
            )}
            type="button"
            onClick={() => dispatch(setShowReservedTransactions(true))}
          >
            <Icons.CreditCard
              className={classNames('h-6 w-6 lg:h-4 lg:w-4', {
                'text-pink-500': showReservedTransactions,
                'group-hover:text-pink-500': !showReservedTransactions,
              })}
            />
            <span
              className={classNames('sr-only lg:not-sr-only lg:ml-2', {
                'text-gray-900': showReservedTransactions,
                'group-hover:text-pink-500': !showReservedTransactions,
              })}
            >
              Alle
            </span>
          </button>
        </div>
        <span className="ml-2 lg:ml-1">
          <span className="lg:sr-only">{showReservedTransactions ? 'Alle ' : 'Kun bokførte '}</span>
          transaksjoner fra Sbanken vises.
        </span>
      </div>
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
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
                    className="whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Kilde
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-full"
                  >
                    Beskrivelse
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900"
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
                      className={classNames('hover:bg-gray-50', {
                        'text-gray-900': !transaction.isReserved,
                        'text-gray-500': transaction.isReserved,
                      })}
                    >
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6 font-numbers">
                        {transaction.date.toISODate()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm font-medium">
                        {!!(transaction.source & TransactionSource.Sbanken) && 'Sbanken'}
                        {!!(transaction.source & TransactionSource.Sbanken) &&
                          !(transaction.source & TransactionSource.Ynab) &&
                          !transaction.isReserved && (
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
                      <td className="whitespace-nowrap px-3 py-2 text-sm">
                        {transaction.isReserved && '(Ikke bokført) '}
                        {transaction.description}
                      </td>
                      <td className="whitespace-nowrap py-2 pl-3 pr-4 sm:pr-6 text-sm text-right font-numbers">
                        {formatMoney(transaction.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
