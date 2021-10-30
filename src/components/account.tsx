import { FocusTrap } from '@headlessui/react';
import { h } from 'preact';
import { useSelector } from 'react-redux';
import Transactions from './transactions';
import { Redirect, useHistory } from 'react-router-dom';
import { getEnrichedAccounts } from '../selectors/accounts';
import Button from './button';
import { formatMoney } from '../utils';

interface AccountProps {
  accountId: string;
}

export default function Account({ accountId }: AccountProps) {
  const accounts = useSelector(getEnrichedAccounts);
  const history = useHistory();

  const existingAccount = accounts.find((account) => account.compositeId === accountId);

  if (!existingAccount) {
    return <Redirect to="/accounts/new" />;
  }

  const handleEdit = () => {
    history.push(`/accounts/${accountId}/edit`);
  };

  return (
    <FocusTrap className="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-2xl font-semibold text-gray-900 flex items-center">
          {existingAccount.name}
          <Button
            className="ml-4 px-2 py-0.5 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-pink-500"
            onClick={handleEdit}
          >
            Rediger
          </Button>
        </h1>
        <div class="my-4">
          <div class="inline-grid grid-flow-col-dense grid-rows-4 gap-2">
            <div />
            <div>Sbanken</div>
            <div>YNAB</div>
            <div>Differanse</div>
            <div class="text-right italic">Bokført</div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenClearedBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabClearedBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(
                Math.abs(existingAccount.sbankenClearedBalance - existingAccount.ynabClearedBalance)
              )}
            </div>
            <div class="text-right italic">Ikke bokført</div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenUnclearedBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabUnclearedBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(
                Math.abs(
                  existingAccount.sbankenUnclearedBalance - existingAccount.ynabUnclearedBalance
                )
              )}
            </div>
            <div class="text-right italic">Balanse</div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.sbankenWorkingBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
              {formatMoney(existingAccount.ynabWorkingBalance)}
            </div>
            <div class="text-right font-numbers tabular-nums">
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
