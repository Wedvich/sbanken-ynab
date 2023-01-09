import classNames from 'classnames';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { Navigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../services';
import { getEnrichedAccountById } from '../services/accounts';
import { formatMoney } from '../utils';

export const TransactionsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();

  const account = useAppSelector((state) => getEnrichedAccountById(state, accountId));

  const sums = useMemo(() => {
    if (!account) return;

    return [
      {
        label: 'Bokført',
        sbanken: account.sbankenClearedBalance,
        ynab: account.ynabClearedBalance,
        diff: account.sbankenClearedBalance - account.ynabClearedBalance,
      },
      {
        label: 'Ikke bokført',
        sbanken: account.sbankenUnclearedBalance,
        ynab: account.ynabUnclearedBalance,
        diff: account.sbankenUnclearedBalance - account.ynabUnclearedBalance,
      },
      {
        label: 'Balanse',
        sbanken: account.sbankenWorkingBalance,
        ynab: account.ynabWorkingBalance,
        diff: account.sbankenWorkingBalance - account.ynabWorkingBalance,
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
          <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
            {sums.map((item) => (
              <div key={item.label} className="px-4 py-5 sm:p-6">
                <dt className="text-base text-normal mb-2.5">{item.label}</dt>
                <dd className="grid grid-cols-[auto_1fr] items-baseline">
                  <span>YNAB</span>
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
                  <span>Sbanken</span>
                  <span
                    className={classNames(
                      'text-xl font-numbers font-medium text-right tabular-nums',
                      {
                        'text-green-600': item.sbanken > 0,
                      }
                    )}
                  >
                    {formatMoney(item.sbanken)}
                  </span>
                  <span className="col-span-2 border-t border-gray-200 w-full my-2" />
                  <span>Differanse</span>
                  <span
                    className={classNames(
                      'text-xl font-numbers font-medium text-right tabular-nums',
                      {
                        'text-green-600': item.diff - 0.001 > 0, // Handle rounding errors
                      }
                    )}
                  >
                    {formatMoney(item.diff)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
