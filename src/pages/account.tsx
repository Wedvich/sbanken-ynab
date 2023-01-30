import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import Button from '../components/button';
import Icons from '../components/icons';
import { useAppDispatch, useAppSelector } from '../services';
import { deleteAccount, getEnrichedAccountById } from '../services/accounts';
import { fetchAccounts } from '../services/ynab';
import { formatMoney } from '../utils';
import { Transactions, useYnabTransactionsRequest } from '../components/transactions';
import { getFetchStatusForSbankenAccount } from '../services/sbanken.selectors';
import { Spinner } from '../components/spinner';
import { getFetchStatusForYnabAccount } from '../services/ynab.selectors';
import {
  useClearTransactionsMutation,
  useGetTransactionsQuery as useGetYnabTransactionsQuery,
  ynabTransactionsAdapter,
} from '../services/ynab.api';
import { YnabClearedState } from '../services/ynab.types';

const fromDate = DateTime.utc().minus({ days: 30 }).toISODate();

export const AccountPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => getEnrichedAccountById(state, accountId));

  const isFetchingSbankenAccount =
    useAppSelector((state) => getFetchStatusForSbankenAccount(state, account?.sbankenAccountId)) ===
    'pending';

  const isFetchingYnabAccount =
    useAppSelector((state) => getFetchStatusForYnabAccount(state, account?.ynabAccountId)) ===
    'pending';

  const isFetching = isFetchingSbankenAccount || isFetchingYnabAccount;

  const refreshAccount = () => {
    if (!account) return;
    void dispatch(fetchAccounts(account.ynabAccountId));
    //void dispatch(fetchSbankenAccounts());
  };

  const handleDelete = () => {
    if (!account) return;
    dispatch(deleteAccount(account.compositeId));
  };

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

  const ynabTransactionsRequest = useYnabTransactionsRequest(account?.ynabBudgetId ?? '', fromDate);

  const canMarkAllAsCleared =
    !!account &&
    account.sbankenUnclearedBalance === 0 &&
    account.ynabUnclearedBalance !== 0 &&
    account.sbankenWorkingBalance === account.ynabWorkingBalance;

  const { data: ynabTransactionsData, isFetching: isFetchingTransactions } =
    useGetYnabTransactionsQuery(ynabTransactionsRequest, {
      skip: !canMarkAllAsCleared || !account?.ynabLinkOk,
    });

  const hasTransactions = !!ynabTransactionsData?.transactions;

  const [clearTransactions, { isLoading: isClearingTransactions }] = useClearTransactionsMutation();

  const handleMarkAllAsCleared = () => {
    if (!hasTransactions) return;

    const transactions = ynabTransactionsAdapter
      .getSelectors()
      .selectAll(ynabTransactionsData.transactions)
      .filter((t) => t.cleared === YnabClearedState.Uncleared);

    void clearTransactions({ transactions, fromDate });
  };

  if (!account || !sums) {
    return <Navigate to="/kontoer" replace />;
  }

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900 flex">
            {account.name}
            {isFetching && (
              <span className="ml-4">
                <Spinner size="sm" />
                <span className="sr-only">Laster inn kontoinformasjon</span>
              </span>
            )}
          </h1>
          <div className="mt-4 flex gap-2">
            <Button size="xs" onClick={refreshAccount} disabled={isFetching}>
              <Icons.Refresh className="mr-1" />
              Oppdater
            </Button>
            <Button size="xs" onClick={() => navigate('endre')} disabled={isFetching}>
              <Icons.Edit className="mr-1" />
              Endre
            </Button>
            <Button size="xs" onClick={handleDelete} disabled={isFetching}>
              <Icons.Delete className="mr-1" />
              Fjern
            </Button>
            {!window.navigator.userAgent.match(/android|iphone/i) && (
              <Fragment>
                <a
                  href={`https://app.youneedabudget.com/${account.ynabBudgetId}/accounts/${account.ynabAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1 text-sm"
                >
                  Åpne i YNAB
                  <Icons.ExternalLink />
                </a>
                <a
                  href={`https://secure.sbanken.no/Home/AccountStatement?accountId=${account.sbankenAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 hover:underline underline-offset-2 inline-flex items-center gap-1 text-sm"
                >
                  Åpne i Sbanken
                  <Icons.ExternalLink />
                </a>
              </Fragment>
            )}
          </div>
          <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
            {sums.map((item, index) => {
              const isAjour = item.diff === 0;
              return (
                <div key={item.label} className="px-4 py-5 sm:p-6 relative">
                  <dt className="text-lg font-medium mb-2.5 flex items-center leading-8">
                    {item.label}
                    {index === 1 && canMarkAllAsCleared && (
                      <Button
                        size="xs"
                        className="ml-auto"
                        disabled={
                          isFetching ||
                          isFetchingTransactions ||
                          !hasTransactions ||
                          isClearingTransactions
                        }
                        onClick={handleMarkAllAsCleared}
                      >
                        <span className="mr-1 inline-flex bg-gray-500 w-4 h-4 items-center justify-center rounded-full leading-3">
                          <span className="text-white text-xs -mt-[1px] font-bold">C</span>
                        </span>
                        Clear alle
                      </Button>
                    )}
                  </dt>
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
                  {index === 1 && (
                    <Icons.Plus className="h-8 w-8 absolute left-1/2 -top-4 lg:-left-4 lg:top-1/2 lg:-mt-4 p-1 text-gray-300 bg-white" />
                  )}
                  {index === 2 && (
                    <Icons.Equal className="h-8 w-8 absolute left-1/2 -top-4 lg:-left-4 lg:top-1/2 lg:-mt-4 p-1 text-gray-300 bg-white" />
                  )}
                </div>
              );
            })}
          </dl>
          <Transactions account={account} fromDate={fromDate} />
        </div>
      </div>
    </div>
  );
};
