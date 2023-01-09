import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { FocusTrap } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/button';
import { getSbankenAccounts } from '../services/sbanken';
import { getYnabAccounts, getYnabBudgetsMap } from '../services/ynab';

export const AccountEditor = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const ynabAccounts = useSelector(getYnabAccounts);
  const sbankenAccounts = useSelector(getSbankenAccounts);
  const ynabBudgetsMap = useSelector(getYnabBudgetsMap);
  const navigate = useNavigate();

  const [name, setName] = useState<string>();
  const [ynabAccountId, setYnabAccountId] = useState<string>();
  const [sbankenAccountId, setSbankenAccountId] = useState<string>();

  const canSave = !!name && !!ynabAccountId && !!sbankenAccountId;

  const handleSave = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">Legg til ny konto</h1>
          <FocusTrap as="form" onSubmit={handleSave}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Navn
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>
            <div className="sm:flex sm:gap-8">
              <div>
                <h3 className="font-semibold">YNAB-konto</h3>
                <ul>
                  {ynabAccounts.map((account) => {
                    const idKey = `ynab-account-${account.id}`;
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
                              name="ynab-account"
                              type="radio"
                              className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                              value={account.id}
                              checked={ynabAccountId === account.id}
                              onChange={() => setYnabAccountId(account.id)}
                            />
                          </span>
                          <span className="block ml-3 text-sm">
                            <span className="block font-medium text-gray-700">{account.name}</span>
                            <span id={`${idKey}-description`} className="block text-gray-500">
                              {ynabBudgetsMap[account.budget_id]?.name}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Sbanken-konto</h3>
                <ul>
                  {sbankenAccounts.map((account) => {
                    const idKey = `sbanken-account-${account.accountId}`;

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
                              name="sbanken-account"
                              type="radio"
                              className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500"
                              value={account.accountId}
                              checked={sbankenAccountId === account.accountId}
                              onChange={() => setSbankenAccountId(account.accountId)}
                            />
                          </span>
                          <span className="block ml-3 text-sm">
                            <span className="block font-medium text-gray-700">{account.name}</span>
                            <span id={idKey} className="block text-gray-500">
                              {account.ownerCustomerId}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="sm:flex gap-2">
              <Button importance="primary" type="submit" disabled={!canSave}>
                Lagre
              </Button>
              <Button type="button" onClick={handleCancel}>
                Avbryt
              </Button>
            </div>
          </FocusTrap>
        </div>
      </div>
    </div>
  );
};
