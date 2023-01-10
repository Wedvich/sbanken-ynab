import classNames from 'classnames';
import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/button';
import { useAppSelector } from '../services';
import { getEnrichedAccountById } from '../services/accounts';
import { ynabApi } from '../services/ynab.api';
import type { YnabGetTransactionsRequest } from '../services/ynab.types';
import { formatMoney } from '../utils';

export const AccountPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const account = useAppSelector((state) => getEnrichedAccountById(state, accountId));

  const request: YnabGetTransactionsRequest = {
    budgetId: account?.ynabBudgetId ?? '',
    fromDate: '2023-01-01',
  };

  // const { data } = ynabApi.useGetTransactionsQuery(request, { skip: !account });

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
            <Button size="xs">Oppdater</Button>
            <Button size="xs" onClick={() => navigate('endre')}>
              Endre
            </Button>
            <Button size="xs">Fjern</Button>
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
          <div className="mt-4">transactions</div>
        </div>
      </div>
    </div>
  );
};
