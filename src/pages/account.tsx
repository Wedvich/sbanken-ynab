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
import { Transactions } from '../components/transactions';
import { getFetchStatusForSbankenAccount } from '../services/sbanken.selectors';
import { Spinner } from '../components/spinner';
// import { fetchSbankenAccounts } from '../services/sbanken';
const fromDate = DateTime.utc().minus({ days: 30 }).toISODate();

export const AccountPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => getEnrichedAccountById(state, accountId));

  const isFetchingSbankenAccount =
    useAppSelector((state) => getFetchStatusForSbankenAccount(state, account?.sbankenAccountId)) ===
    'pending';

  const isFetching = isFetchingSbankenAccount;

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

  if (!account || !sums) {
    return <Navigate to="/kontoer" replace />;
  }

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            {account.name}
            {isFetching && (
              <span className="ml-1">
                <Spinner size="lg" />
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
          <Transactions account={account} fromDate={fromDate} />
        </div>
      </div>
    </div>
  );
};
