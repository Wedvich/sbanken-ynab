import { FocusTrap } from '@headlessui/react';
import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSbankenAccounts } from '../services/sbanken';
import { getYnabAccounts } from '../services/ynab';

const oc = () => {};

export const AccountEditor = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const ynabAccounts = useSelector(getYnabAccounts);
  const sbankenAccounts = useSelector(getSbankenAccounts);

  const handleSave = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <FocusTrap as="form" onSubmit={handleSave}>
            <div>(account editor: {accountId})</div>
            <div className="sm:flex sm:gap-4">
              <ul>
                {ynabAccounts.map((account) => {
                  const idKey = `ynab-${account.id}`;
                  return (
                    <li key={idKey}>
                      <label
                        htmlFor={idKey}
                        className="relative flex items-start py-2.5 font-medium cursor-pointer"
                      >
                        <span className="flex h-5 items-center">
                          <input
                            id={idKey}
                            aria-describedby={`${idKey}-description`}
                            name="ynab"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                        </span>
                        <span className="block ml-3 text-sm">
                          <span className="block font-medium text-gray-700">{account.name}</span>
                          <span id={`${idKey}-description`} className="block text-gray-500">
                            {account.budget_id}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <ul>
                {sbankenAccounts.map((account) => {
                  const idKey = `sbanken-${account.accountId}`;

                  return (
                    <li key={idKey}>
                      <label
                        htmlFor={idKey}
                        className="relative flex items-start px-4 py-2.5 font-medium cursor-pointer"
                      >
                        <span className="flex h-5 items-center">
                          <input
                            id={idKey}
                            aria-describedby={`${idKey}-description`}
                            name="ynab"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                        </span>
                        <span className="block ml-3 text-sm">
                          <span className="block font-medium text-gray-700">{account.name}</span>
                          <span id={idKey} className="block text-gray-500">
                            {account.clientId}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </FocusTrap>
        </div>
      </div>
    </div>
  );
};
