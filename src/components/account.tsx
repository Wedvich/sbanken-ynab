import { FocusTrap } from '@headlessui/react';
import { h } from 'preact';
import { useSelector } from 'react-redux';
import Transactions from './transactions';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getEnrichedAccounts } from '../selectors/accounts';
import Button from './button';
import { formatMoney } from '../utils';

export default function Account() {
  const accounts = useSelector(getEnrichedAccounts);
  const navigate = useNavigate();
  const { accountId } = useParams();

  const existingAccount = accounts.find((account) => account.compositeId === accountId);

  if (!existingAccount) {
    return <Navigate to="/accounts/new" />;
  }

  const handleEdit = () => {
    navigate(`/accounts/${accountId}/edit`);
  };

  return (
    <FocusTrap className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          {existingAccount.name}
          <Button
            className="ml-4 px-2 py-0.5 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-pink-500"
            onClick={handleEdit}
            autofocus={false}
          >
            Rediger
          </Button>
        </h1>
        <div className="my-4">
          <div className="inline-grid grid-flow-col-dense grid-rows-4 gap-2">
            <div />
            <div>Sbanken</div>
            <div>YNAB</div>
            <div>Differanse</div>
            <div className="text-right italic">Bokført</div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenClearedBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabClearedBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(
                Math.abs(existingAccount.sbankenClearedBalance - existingAccount.ynabClearedBalance)
              )}
            </div>
            <div className="text-right italic">Ikke bokført</div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenUnclearedBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabUnclearedBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(
                Math.abs(
                  existingAccount.sbankenUnclearedBalance - existingAccount.ynabUnclearedBalance
                )
              )}
            </div>
            <div className="text-right italic">Balanse</div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenWorkingBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabWorkingBalance)}
            </div>
            <div className="text-right font-numbers tabular-nums">
              {formatMoney(
                Math.abs(existingAccount.sbankenWorkingBalance - existingAccount.ynabWorkingBalance)
              )}
            </div>
          </div>
        </div>
        <Transactions accountId={accountId} />
      </div>
    </FocusTrap>
  );
}
