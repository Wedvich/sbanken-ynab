import classNames from 'classnames';
import { DateTime } from 'luxon';
import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/button';
import { externalLinkIcon } from '../components/icons';
import { useAppDispatch, useAppSelector } from '../services';
import { getEnrichedAccountById } from '../services/accounts';
import { fetchAccounts, getYnabKnowledgeByBudgetId } from '../services/ynab';
import { useGetTransactionsQuery as useGetYnabTransactionsQuery } from '../services/ynab.api';
import { useGetTransactionsQuery as useGetSbankenTransactionsQuery } from '../services/sbanken.api';
import { getTransactionsGroupedByAccountId } from '../services/ynab.selectors';
import type { YnabGetTransactionsRequest } from '../services/ynab.types';
import { formatMoney } from '../utils';
import type { SbankenGetTransactionsRequest } from '../services/sbanken.types';
import { getAllSbankenTransactions } from '../services/sbanken.selectors';

const fromDate = DateTime.utc().minus({ days: 30 }).toISODate();

export const AccountPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => getEnrichedAccountById(state, accountId));
  const serverKnowledge = useAppSelector((state) =>
    getYnabKnowledgeByBudgetId(state, account?.ynabBudgetId)
  );

  const refreshAccount = () => {
    if (!account) return;
    void dispatch(fetchAccounts(account.ynabAccountId));
  };

  const ynabTransactionsRequest: YnabGetTransactionsRequest = useMemo(
    () => ({
      budgetId: account?.ynabBudgetId ?? '',
      fromDate,
      serverKnowledge,
    }),
    [account?.ynabBudgetId, serverKnowledge]
  );

  const { data: ynabTransactionsData } = useGetYnabTransactionsQuery(ynabTransactionsRequest, {
    skip: !account?.ynabLinkOk,
  });

  const ynabTransactions = useSelector(() =>
    getTransactionsGroupedByAccountId(ynabTransactionsData?.transactions)
  );
  const transactionsForYnabAccount = ynabTransactions[account?.ynabAccountId ?? ''];

  const sbankenTransactionsRequest: SbankenGetTransactionsRequest = useMemo(
    () => ({
      accountId: account?.sbankenAccountId ?? '',
      fromDate,
    }),
    [account?.sbankenAccountId]
  );

  const { data: sbankenTransactionsData } = useGetSbankenTransactionsQuery(
    sbankenTransactionsRequest,
    { skip: !account?.sbankenLinkOk }
  );

  const transactionsForSbankenAccount = getAllSbankenTransactions(
    sbankenTransactionsData?.transactions
  );

  const sums = useMemo(() => {
    if (!account) return;

    return [
      {
        label: (
          <Fragment>
            Bokført{' '}
            <span className="ml-1 inline-flex bg-gray-600 w-4 h-4 items-center justify-center rounded-full">
              <span className="text-white text-xs -mt-[1px] font-bold">C</span>
            </span>
          </Fragment>
        ),
        sbanken: account.sbankenClearedBalance,
        ynab: account.ynabClearedBalance,
        diff: account.ynabClearedBalance - account.sbankenClearedBalance,
      },
      {
        label: (
          <Fragment>
            Ikke bokført{' '}
            <span className="ml-1 inline-flex text-gray-600 border border-current w-4 h-4 items-center justify-center rounded-full">
              <span className="text-xs -mt-[1px] leading-4 font-bold">C</span>
            </span>
          </Fragment>
        ),
        sbanken: account.sbankenUnclearedBalance,
        ynab: account.ynabUnclearedBalance,
        diff: account.ynabUnclearedBalance - account.sbankenUnclearedBalance,
      },
      {
        label: 'Balanse',
        sbanken: account.sbankenWorkingBalance,
        ynab: account.ynabWorkingBalance,
        diff: account.ynabWorkingBalance - account.sbankenWorkingBalance,
      },
    ];
  }, [account]);

  if (!account || !sums) {
    return <Navigate to="/kontoer" replace />;
  }

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">{account.name}</h1>
          <div className="mt-4 space-x-2">
            <Button size="xs" onClick={refreshAccount}>
              Oppdater
            </Button>
            <Button size="xs" onClick={() => navigate('endre')}>
              Endre
            </Button>
            <Button size="xs">Fjern</Button>
            <a
              href={`https://app.youneedabudget.com/${account.ynabBudgetId}/accounts/${account.ynabAccountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1 text-sm"
            >
              Åpne i YNAB
              {externalLinkIcon}
            </a>
          </div>
          <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
            {sums.map((item) => {
              const isAjour = item.diff === 0;
              return (
                <div key={item.label} className="px-4 py-5 sm:p-6">
                  <dt className="text-lg font-medium mb-2.5 flex items-center">{item.label}</dt>
                  <dd className="grid grid-cols-[auto_1fr] items-baseline">
                    <span
                      className={classNames({
                        'mb-1': isAjour,
                      })}
                    >
                      Sbanken{isAjour && ' &'}
                    </span>
                    <span
                      className={classNames(
                        'text-xl font-numbers font-medium text-right tabular-nums',
                        {
                          'text-green-600': item.sbanken > 0,
                          'row-span-2': isAjour,
                        }
                      )}
                    >
                      {formatMoney(item.sbanken)}
                    </span>
                    <span>YNAB</span>
                    {!isAjour && (
                      <span
                        className={classNames(
                          'text-xl font-numbers font-medium text-right tabular-nums',
                          {
                            'text-green-600': item.ynab > 0,
                          }
                        )}
                      >
                        {formatMoney(item.ynab)}
                      </span>
                    )}

                    <span
                      className={classNames({
                        'mt-1 text-gray-500': isAjour,
                      })}
                    >
                      Differanse
                    </span>
                    <span
                      className={classNames('text-right', {
                        'text-xl font-numbers font-medium tabular-nums': !isAjour,
                        'text-gray-500': isAjour,
                      })}
                    >
                      {!isAjour ? formatMoney(item.diff) : 'à jour'}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
          <h2 className="mt-8 text-2xl">Transaksjoner</h2>
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
                    className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Tekst
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-2 py-3.5 text-right text-sm font-semibold text-gray-900"
                  >
                    Beløp
                  </th>
                  <th scope="col" className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {transactionsForYnabAccount?.map((transaction) => {
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 font-numbers">
                        {transaction.date}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                        YNAB
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                        {transaction.memo || transaction.payee_name}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 text-right font-numbers">
                        {formatMoney(transaction.amount / 1000)}
                      </td>
                      <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="javascript:void(0)" className="text-pink-600 hover:text-pink-700">
                          Endre
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {transactionsForSbankenAccount?.map((transaction) => {
                  return (
                    <tr key={transaction.transactionId} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 font-numbers">
                        {transaction.accountingDate}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                        Sbanken
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                        {transaction.text}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 text-right font-numbers">
                        {formatMoney(transaction.amount)}
                      </td>
                      <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="javascript:void(0)" className="text-pink-600 hover:text-pink-700">
                          Endre
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
