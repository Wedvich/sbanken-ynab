import { h } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { FocusTrap } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/button';
import { getSbankenAccounts, getSbankenAccountsLookup } from '../services/sbanken';
import { getYnabAccounts, getYnabAccountsLookup, getYnabBudgetsLookup } from '../services/ynab';
import {
  createCompositeAccountId,
  getLinkedAccountById,
  getLinkedAccounts,
  LinkedAccount,
  saveAccount,
} from '../services/accounts';
import { useAppSelector } from '../services';

export const AccountEditor = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const existingAccount = useAppSelector((state) => getLinkedAccountById(state, accountId ?? ''));

  const ynabAccounts = useSelector(getYnabAccounts);
  const sbankenAccounts = useSelector(getSbankenAccounts);
  const sbankenAccountsLookup = useSelector(getSbankenAccountsLookup);
  const ynabBudgetsLookup = useSelector(getYnabBudgetsLookup);
  const ynabAccountsLookup = useSelector(getYnabAccountsLookup);
  const linkedAccounts = useSelector(getLinkedAccounts);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const disabledYnabAccounts = useMemo(
    () =>
      new Set(
        ynabAccounts
          .filter((ynabAccount) =>
            linkedAccounts.find((linkedAccount) => linkedAccount.ynabAccountId === ynabAccount.id)
          )
          .map(({ id }) => id)
      ),
    [linkedAccounts, ynabAccounts]
  );

  const disabledSbankenAccounts = useMemo(
    () =>
      new Set(
        sbankenAccounts
          .filter((sbankenAccount) =>
            linkedAccounts.find(
              (linkedAccount) => linkedAccount.sbankenAccountId === sbankenAccount.accountId
            )
          )
          .map(({ accountId }) => accountId)
      ),
    [linkedAccounts, sbankenAccounts]
  );

  const [name, setName] = useState<string | undefined>(existingAccount?.name);
  const [ynabAccountId, setYnabAccountId] = useState<string | undefined>(
    existingAccount?.ynabAccountId
  );
  const [sbankenAccountId, setSbankenAccountId] = useState<string | undefined>(
    existingAccount?.sbankenAccountId
  );

  const canSave = !!name && !!ynabAccountId && !!sbankenAccountId;

  const handleSave = (e: any) => {
    e.preventDefault();
    if (!canSave) return;

    const ynabAccount = ynabAccountsLookup[ynabAccountId];
    if (!ynabAccount) return;

    const sbankenAccount = sbankenAccountsLookup[sbankenAccountId];
    if (!sbankenAccount) return;

    const linkedAccount: LinkedAccount = {
      name,
      ynabAccountId,
      ynabBudgetId: ynabAccount.budget_id,
      sbankenAccountId,
      sbankenClientId: sbankenAccount.clientId,
    };

    dispatch(saveAccount(linkedAccount));

    const createdAccountId = createCompositeAccountId(linkedAccount);
    navigate(`/kontoer/${createdAccountId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const hasName = !!name;

  const handleSetYnabAccountId = useCallback(
    (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
      const { value } = e.target as HTMLInputElement;

      const ynabAccount = ynabAccountsLookup[value];
      if (!ynabAccount) return;

      setYnabAccountId(value);
      if (!hasName) {
        setName(ynabAccount.name);
      }
    },
    [hasName, ynabAccountsLookup]
  );

  const handleSetSbankenAccountId = useCallback(
    (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
      const { value } = e.target as HTMLInputElement;

      const sbankenAccount = sbankenAccountsLookup[value];
      if (!sbankenAccount) return;

      setSbankenAccountId(value);
      if (!hasName) {
        setName(sbankenAccount.name);
      }
    },
    [hasName, sbankenAccountsLookup]
  );

  return (
    <div className="py-10">
      <div className="max-w-5xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            {existingAccount ? 'Endre konto' : 'Legg til ny konto'}
          </h1>
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
                          disabled={disabledYnabAccounts.has(account.id)}
                        >
                          <span className="flex h-5 items-center">
                            <input
                              id={idKey}
                              aria-describedby={`${idKey}-description`}
                              name="ynab-account"
                              type="radio"
                              className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500 disabled:bg-gray-300"
                              value={account.id}
                              checked={ynabAccountId === account.id}
                              onChange={handleSetYnabAccountId}
                              disabled={
                                disabledYnabAccounts.has(account.id) &&
                                existingAccount?.ynabAccountId !== account.id
                              }
                            />
                          </span>
                          <span className="block ml-3 text-sm">
                            <span className="block font-medium text-gray-700">{account.name}</span>
                            <span id={`${idKey}-description`} className="block text-gray-500">
                              {ynabBudgetsLookup[account.budget_id]?.name}
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
                              className="h-4 w-4 border-gray-300 text-pink-600 focus:ring-pink-500 disabled:bg-gray-300"
                              value={account.accountId}
                              checked={sbankenAccountId === account.accountId}
                              onChange={handleSetSbankenAccountId}
                              disabled={
                                disabledSbankenAccounts.has(account.accountId) &&
                                existingAccount?.sbankenAccountId !== account.accountId
                              }
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
