import { FocusTrap } from '@headlessui/react';
import { h } from 'preact';
import { useSelector } from 'react-redux';
import Transactions from './transactions';
import { Redirect, useHistory } from 'react-router-dom';
import { getEnrichedAccounts } from '../selectors/accounts';
import Button from './button';

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
        <Transactions />
      </div>
    </FocusTrap>
  );
}
